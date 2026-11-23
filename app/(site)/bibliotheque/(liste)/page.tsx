import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { CarteRessource } from '@/components/bibliotheque/CarteRessource';
import { Conteneur, EnTetePage } from '@/components/ui';
import { rechercherRessources } from '@/lib/donnees';
import { RESSOURCES_PAR_PAGE } from '@/lib/env';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bibliothèque',
  description: 'Prédications, enseignements et fiches à consulter et télécharger librement, sans inscription.',
  alternates: { canonical: '/bibliotheque' },
  openGraph: { title: 'Bibliothèque', url: '/bibliotheque' },
};

type Params = Promise<{ q?: string; page?: string }>;

/** Construit l'adresse d'une page de résultats en gardant la recherche. */
function lien(q: string, page = 1) {
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (page > 1) p.set('page', String(page));
  const s = p.toString();
  return `/bibliotheque${s ? `?${s}` : ''}`;
}

export default async function Bibliotheque({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);

  const { resultats, total } = await rechercherRessources({ q, page });
  const nbPages = Math.max(1, Math.ceil(total / RESSOURCES_PAR_PAGE));

  return (
    <Conteneur>
      <EnTetePage titre="Bibliothèque" chapo="Retrouvez les prédications, fiches et ressources pour votre édification." />

      {/* Recherche : un simple formulaire GET, fonctionne même sans JavaScript */}
      <form role="search" action="/bibliotheque" className="relative max-w-2xl">
        <label htmlFor="q" className="sr-only">
          Rechercher une ressource
        </label>
        <Search aria-hidden size={20} className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-encre-2" />
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Rechercher une ressource…"
          enterKeyHint="search"
          autoComplete="off"
          className="h-14 w-full rounded-full border border-bordure-forte bg-carte pr-32 pl-13 text-base shadow-sm placeholder:text-encre-2/80 focus-visible:border-vert"
        />
        <button type="submit" className="bouton bouton-plein bouton-petit absolute top-1/2 right-1.5 -translate-y-1/2">
          Rechercher
        </button>
      </form>

      <div className="mt-8 flex flex-wrap items-center gap-3" aria-live="polite">
        <p className="text-encre-2">
          {total === 0 ? 'Aucune ressource' : `${total} ressource${total > 1 ? 's' : ''}`}
          {q && (
            <>
              {' '}
              pour « <strong className="text-encre">{q}</strong> »
            </>
          )}
        </p>
        {q && (
          <Link href="/bibliotheque" className="lien-souligne inline-flex min-h-11 items-center gap-1 text-sm font-semibold">
            <X aria-hidden size={15} /> Effacer
          </Link>
        )}
      </div>

      {resultats.length === 0 ? (
        <div className="carte mt-4 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Search aria-hidden size={32} strokeWidth={1.5} className="text-encre-2" />
          <p className="text-lg font-semibold">Aucun résultat</p>
          <p className="max-w-md text-encre-3">
            {q ? 'Essayez avec un autre mot, ou vérifiez l’orthographe.' : 'Aucune ressource n’est encore publiée.'}
          </p>
          {q && (
            <Link href="/bibliotheque" className="bouton bouton-contour bouton-petit mt-2">
              Voir toutes les ressources
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {resultats.map((r, i) => (
            <li key={r.id} className="grid">
              <CarteRessource r={r} priorite={i < 3} />
            </li>
          ))}
        </ul>
      )}

      {nbPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          {page > 1 ? (
            <Link href={lien(q, page - 1)} className="bouton bouton-contour bouton-petit" rel="prev">
              <ChevronLeft aria-hidden size={18} /> Précédent
            </Link>
          ) : (
            <span className="bouton bouton-contour bouton-petit pointer-events-none opacity-40" aria-hidden>
              <ChevronLeft size={18} /> Précédent
            </span>
          )}
          <span className="px-3 text-sm font-semibold" aria-current="page">
            Page {page} sur {nbPages}
          </span>
          {page < nbPages ? (
            <Link href={lien(q, page + 1)} className="bouton bouton-contour bouton-petit" rel="next">
              Suivant <ChevronRight aria-hidden size={18} />
            </Link>
          ) : (
            <span className="bouton bouton-contour bouton-petit pointer-events-none opacity-40" aria-hidden>
              Suivant <ChevronRight size={18} />
            </span>
          )}
        </nav>
      )}
    </Conteneur>
  );
}
