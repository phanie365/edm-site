'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, Eye, FileText, RefreshCw, Trash2, Upload } from 'lucide-react';
import {
  ajouterFiche,
  remplacerFiche,
  renommerFiche,
  reordonnerFiches,
  supprimerFiche,
  type Resultat,
} from '@/app/admin/actions';
import { tailleLisible } from '@/lib/outils';
import { urlPdf } from '@/lib/stockage';
import { annulerDepot, deposerPdf, nomDepuisFichier } from '@/lib/televersement';
import type { FichePdf } from '@/lib/types';
import { Retour } from './Retour';

/** Ajout (plusieurs à la fois), renommage, remplacement, suppression et ordre des fiches PDF. */
export function GestionFiches({ ressourceId, fiches: initiales }: { ressourceId: string; fiches: FichePdf[] }) {
  const router = useRouter();
  const [fiches, setFiches] = useState(initiales);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [progression, setProgression] = useState<string | null>(null);
  const [survol, setSurvol] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const entree = useRef<HTMLInputElement>(null);

  // Resynchronise la liste après chaque rafraîchissement venant du serveur
  useEffect(() => setFiches(initiales), [initiales]);

  const terminer = (r: Resultat) => {
    setResultat(r);
    router.refresh();
  };

  const ajouter = async (liste: FileList | File[]) => {
    const fichiers = [...liste].sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }));
    if (!fichiers.length) return;
    setOccupe(true);
    const erreurs: string[] = [];
    let ok = 0;
    for (const [i, f] of fichiers.entries()) {
      setProgression(`Envoi ${i + 1} / ${fichiers.length} : ${f.name}`);
      const depot = await deposerPdf(ressourceId, f);
      if ('erreur' in depot) {
        erreurs.push(depot.erreur);
        continue;
      }
      const r = await ajouterFiche({ resource_id: ressourceId, storage_path: depot.chemin, file_name: nomDepuisFichier(f.name), size_bytes: f.size });
      if (r.ok) ok++;
      else {
        erreurs.push(`« ${f.name} » : ${r.message}`);
        await annulerDepot('fiches', depot.chemin);
      }
    }
    setProgression(null);
    setOccupe(false);
    terminer(
      erreurs.length
        ? { ok: false, message: `${ok} fiche(s) ajoutée(s). Problème : ${erreurs.join(' ')}` }
        : { ok: true, message: `${ok} fiche${ok > 1 ? 's' : ''} ajoutée${ok > 1 ? 's' : ''}.` },
    );
  };

  const surDepot = (e: DragEvent) => {
    e.preventDefault();
    setSurvol(false);
    if (!occupe && e.dataTransfer.files.length) void ajouter(e.dataTransfer.files);
  };

  const deplacer = async (index: number, sens: -1 | 1) => {
    const copie = [...fiches];
    const [f] = copie.splice(index, 1);
    copie.splice(index + sens, 0, f!);
    setFiches(copie);
    setOccupe(true);
    terminer(await reordonnerFiches(ressourceId, copie.map((x) => x.id)));
    setOccupe(false);
  };

  const remplacer = async (fiche: FichePdf, fichier: File) => {
    setOccupe(true);
    setProgression(`Envoi de ${fichier.name}`);
    const depot = await deposerPdf(ressourceId, fichier);
    if ('erreur' in depot) {
      setResultat({ ok: false, message: depot.erreur });
    } else {
      const r = await remplacerFiche(fiche.id, depot.chemin, fichier.size);
      if (!r.ok) await annulerDepot('fiches', depot.chemin);
      terminer(r);
    }
    setProgression(null);
    setOccupe(false);
  };

  const supprimer = async (fiche: FichePdf) => {
    if (!window.confirm(`Supprimer définitivement « ${fiche.file_name} » ?`)) return;
    setOccupe(true);
    const r = await supprimerFiche(fiche.id);
    if (r.ok) setFiches((l) => l.filter((x) => x.id !== fiche.id));
    terminer(r);
    setOccupe(false);
  };

  return (
    <section aria-labelledby="titre-fiches" className="carte space-y-5 p-5 sm:p-7">
      <div>
        <h2 id="titre-fiches" className="text-xl font-bold">
          Fiches PDF ({fiches.length})
        </h2>
        <p className="text-sm text-encre-2">Facultatif. Plusieurs fichiers possibles, 25 Mo maximum chacun.</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={surDepot}
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${survol ? 'border-vert bg-papier-2' : 'border-bordure-forte bg-papier'}`}
      >
        <Upload aria-hidden size={26} />
        <p className="font-semibold">Glissez vos PDF ici</p>
        <p className="text-sm text-encre-2">ou</p>
        <button type="button" disabled={occupe} onClick={() => entree.current?.click()} className="bouton bouton-plein bouton-petit">
          Choisir des PDF
        </button>
        <input
          ref={entree}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Choisir des fichiers PDF"
          onChange={(e) => {
            if (e.target.files) void ajouter(e.target.files);
            e.target.value = '';
          }}
        />
        {progression && (
          <p role="status" className="text-sm font-semibold">
            {progression}
          </p>
        )}
      </div>

      <Retour resultat={resultat} />

      {fiches.length > 0 && (
        <ol className="divide-y divide-bordure rounded-2xl border border-bordure">
          {fiches.map((f, i) => (
            <li key={f.id} className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <span aria-hidden className="flex size-10 flex-none items-center justify-center rounded-xl bg-[#fbe9e7] text-youtube">
                  <FileText size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={`nom-${f.id}`} className="sr-only">
                    Nom de la fiche {i + 1}
                  </label>
                  <input
                    id={`nom-${f.id}`}
                    type="text"
                    defaultValue={f.file_name}
                    maxLength={160}
                    className="champ min-h-11 py-2 font-semibold"
                    onBlur={async (e) => {
                      const v = e.target.value.trim();
                      if (!v) e.target.value = f.file_name;
                      else if (v !== f.file_name) terminer(await renommerFiche(f.id, v));
                    }}
                  />
                  <p className="mt-1 text-xs text-encre-2">
                    Fiche {i + 1}
                    {f.size_bytes ? ` · ${tailleLisible(f.size_bytes)}` : ''} · le nom s’enregistre en quittant le champ
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={urlPdf(f.storage_path)} target="_blank" rel="noopener" className="bouton bouton-contour bouton-petit">
                  <Eye aria-hidden size={16} /> Voir<span className="sr-only"> « {f.file_name} »</span>
                </a>
                <label className={`bouton bouton-contour bouton-petit cursor-pointer focus-within:outline-3 focus-within:outline-vert ${occupe ? 'pointer-events-none opacity-50' : ''}`}>
                  <RefreshCw aria-hidden size={16} /> Remplacer
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    disabled={occupe}
                    aria-label={`Remplacer le PDF « ${f.file_name} »`}
                    onChange={(e) => {
                      const fichier = e.target.files?.[0];
                      e.target.value = '';
                      if (fichier) void remplacer(f, fichier);
                    }}
                  />
                </label>
                <button type="button" disabled={occupe || i === 0} onClick={() => deplacer(i, -1)} className="bouton bouton-contour bouton-petit w-11 px-0" aria-label={`Monter « ${f.file_name} »`}>
                  <ArrowUp aria-hidden size={16} />
                </button>
                <button type="button" disabled={occupe || i === fiches.length - 1} onClick={() => deplacer(i, 1)} className="bouton bouton-contour bouton-petit w-11 px-0" aria-label={`Descendre « ${f.file_name} »`}>
                  <ArrowDown aria-hidden size={16} />
                </button>
                <button type="button" disabled={occupe} onClick={() => supprimer(f)} className="bouton bouton-danger bouton-petit ml-auto">
                  <Trash2 aria-hidden size={16} /> Supprimer<span className="sr-only"> « {f.file_name} »</span>
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
