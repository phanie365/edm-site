'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Eye, EyeOff, FileText, PencilLine, Search, SquarePlay } from 'lucide-react';
import { basculerPublication, type Resultat } from '@/app/admin/actions';
import { VignetteRessource } from '@/components/bibliotheque/CarteRessource';
import { dateLongue } from '@/lib/outils';
import { Retour } from './Retour';

interface Ligne {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  youtube_url: string | null;
  cover_path: string | null;
  is_published: boolean;
  resource_date: string | null;
  categorie: string | null;
  nbFiches: number;
}

const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function ListeRessourcesAdmin({ ressources }: { ressources: Ligne[] }) {
  const [q, setQ] = useState('');
  const [filtre, setFiltre] = useState<'toutes' | 'publiees' | 'brouillons'>('toutes');
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [enCours, demarrer] = useTransition();
  const router = useRouter();

  const visibles = useMemo(
    () =>
      ressources.filter(
        (r) =>
          (filtre === 'toutes' || (filtre === 'publiees') === r.is_published) &&
          normaliser(`${r.title} ${r.categorie ?? ''}`).includes(normaliser(q.trim())),
      ),
    [ressources, q, filtre],
  );

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="filtre-q" className="sr-only">
            Filtrer les ressources
          </label>
          <Search aria-hidden size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-encre-2" />
          <input id="filtre-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer par titre…" className="champ pl-11" />
        </div>
        <div role="group" aria-label="Statut" className="flex gap-2">
          {(['toutes', 'publiees', 'brouillons'] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filtre === f}
              onClick={() => setFiltre(f)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${filtre === f ? 'border-vert bg-vert text-clair' : 'border-bordure-forte bg-carte'}`}
            >
              {f === 'toutes' ? 'Toutes' : f === 'publiees' ? 'Publiées' : 'Brouillons'}
            </button>
          ))}
        </div>
      </div>

      <Retour resultat={resultat} className="mb-4" />

      {visibles.length === 0 ? (
        <p className="carte p-8 text-center text-encre-2">
          {ressources.length === 0 ? 'Aucune ressource. Ajoutez la première !' : 'Aucune ressource ne correspond.'}
        </p>
      ) : (
        <ul className="carte divide-y divide-bordure">
          {visibles.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
              <VignetteRessource r={r} sizes="64px" className="size-16 flex-none rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold break-words">{r.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-encre-2">
                  {r.categorie && <span>{r.categorie}</span>}
                  {r.resource_date && <span>{dateLongue(r.resource_date)}</span>}
                  {r.youtube_url && (
                    <span className="inline-flex items-center gap-1">
                      <SquarePlay aria-hidden size={15} className="text-youtube" /> Vidéo
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <FileText aria-hidden size={14} /> {r.nbFiches} fiche{r.nbFiches > 1 ? 's' : ''}
                  </span>
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.is_published ? 'bg-vert-doux text-vert' : 'border border-bordure-forte text-encre-3'}`}>
                {r.is_published ? 'Publiée' : 'Brouillon'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={enCours}
                  onClick={() =>
                    demarrer(async () => {
                      setResultat(await basculerPublication(r.id, !r.is_published));
                      router.refresh();
                    })
                  }
                  className="bouton bouton-contour bouton-petit"
                >
                  {r.is_published ? <EyeOff aria-hidden size={16} /> : <Eye aria-hidden size={16} />}
                  {r.is_published ? 'Retirer' : 'Publier'}
                  <span className="sr-only"> « {r.title} »</span>
                </button>
                <Link href={`/admin/ressources/${r.id}`} className="bouton bouton-plein bouton-petit">
                  <PencilLine aria-hidden size={16} /> Modifier<span className="sr-only"> « {r.title} »</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
