import Link from 'next/link';
import { ArrowRight, FileText, SquarePlay } from 'lucide-react';
import { extrait } from '@/lib/outils';
import { VignetteRessource } from './VignetteRessource';

export { VignetteRessource };

export interface ApercuRessource {
  title: string;
  slug: string;
  description: string | null;
  youtube_url: string | null;
  cover_path: string | null;
  nb_fiches: number;
}

function Meta({ r }: { r: ApercuRessource }) {
  const morceaux = [r.youtube_url ? 'Vidéo' : null, r.nb_fiches > 0 ? `${r.nb_fiches} fiche${r.nb_fiches > 1 ? 's' : ''}` : null].filter(Boolean);
  return (
    <p className="flex items-center gap-2 text-sm text-encre-2">
      <span>{morceaux.join(' · ') || 'Ressource'}</span>
      <span className="ml-auto flex items-center gap-1.5">
        {r.youtube_url && <SquarePlay aria-label="Vidéo" role="img" size={18} className="text-youtube" />}
        {r.nb_fiches > 0 && <FileText aria-label="Fiches" role="img" size={17} />}
      </span>
    </p>
  );
}

/** Carte de ressource : en ligne sur mobile, en colonne à partir de la tablette. */
export function CarteRessource({ r, priorite = false }: { r: ApercuRessource; priorite?: boolean }) {
  return (
    <article className="group carte relative flex gap-4 overflow-hidden p-3 transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(17,17,17,.25)] sm:flex-col sm:gap-0 sm:p-0">
      <VignetteRessource
        r={r}
        sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 96px"
        className="aspect-square w-24 flex-none rounded-xl sm:aspect-[16/10] sm:w-full sm:rounded-none"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1 sm:gap-2 sm:p-5">
        <h3 className="text-lg leading-snug font-bold">
          <Link href={`/bibliotheque/${r.slug}`} className="after:absolute after:inset-0 after:content-['']" data-priorite={priorite || undefined}>
            {r.title}
          </Link>
        </h3>
        {r.description && <p className="line-clamp-2 text-[15px] text-encre-3 max-sm:hidden">{extrait(r.description, 140)}</p>}
        <Meta r={r} />
        <span aria-hidden className="mt-1 hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex">
          Voir la ressource <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
