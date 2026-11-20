'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useSoumission } from '@/lib/useSoumission';
import { Plus, Trash2 } from 'lucide-react';
import { ajouterCategorie, renommerCategorie, supprimerCategorie, type Resultat } from '@/app/admin/actions';
import { ErreurChamp, Retour } from './Retour';

export function GestionCategories({ categories }: { categories: { id: string; name: string; nb: number }[] }) {
  const router = useRouter();
  const [etat, surSoumission, enAjout] = useSoumission(ajouterCategorie);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [enCours, demarrer] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [etat, router]);

  const agir = (fn: () => Promise<Resultat>) =>
    demarrer(async () => {
      setResultat(await fn());
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <form ref={formRef} onSubmit={surSoumission} className="carte flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="nouvelle" className="font-semibold">
            Nouvelle catégorie
          </label>
          <input id="nouvelle" name="name" type="text" required maxLength={60} placeholder="Ex. Prédications" className="champ" aria-describedby="nouvelle-erreur" />
          <ErreurChamp id="nouvelle-erreur" message={etat?.erreurs?.name} />
        </div>
        <button type="submit" disabled={enAjout} className="bouton bouton-plein">
          <Plus aria-hidden size={18} /> Ajouter
        </button>
      </form>
      <Retour resultat={resultat ?? etat} />

      {categories.length === 0 ? (
        <p className="carte p-6 text-encre-2">Aucune catégorie. Elles sont facultatives.</p>
      ) : (
        <ul className="carte divide-y divide-bordure">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-48 flex-1">
                <label htmlFor={`cat-${c.id}`} className="sr-only">
                  Nom de la catégorie
                </label>
                <input
                  id={`cat-${c.id}`}
                  type="text"
                  defaultValue={c.name}
                  maxLength={60}
                  className="champ min-h-11 py-2 font-semibold"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (!v) e.target.value = c.name;
                    else if (v !== c.name) agir(() => renommerCategorie(c.id, v));
                  }}
                />
              </div>
              <span className="text-sm text-encre-2">
                {c.nb} ressource{c.nb > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                disabled={enCours}
                className="bouton bouton-danger bouton-petit"
                onClick={() => {
                  const msg = c.nb
                    ? `Supprimer « ${c.name} » ? Ses ${c.nb} ressource(s) resteront en ligne, sans catégorie.`
                    : `Supprimer « ${c.name} » ?`;
                  if (window.confirm(msg)) agir(() => supprimerCategorie(c.id));
                }}
              >
                <Trash2 aria-hidden size={16} /> Supprimer<span className="sr-only"> « {c.name} »</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-encre-2">Pour renommer, modifiez le nom puis quittez le champ.</p>
    </div>
  );
}
