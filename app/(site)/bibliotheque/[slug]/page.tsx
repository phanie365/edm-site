import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { LecteurYoutube } from '@/components/bibliotheque/LecteurYoutube';
import { ListeFiches } from '@/components/bibliotheque/ListeFiches';
import { VignetteRessource } from '@/components/bibliotheque/CarteRessource';
import { Contenu } from '@/components/Contenu';
import { Conteneur, Etiquette } from '@/components/ui';
import { lireRessource } from '@/lib/donnees';
import { dateLongue, extrait, idYoutube } from '@/lib/outils';
import { ficheEstImage, urlFiche, urlFicheTelechargement, urlImage } from '@/lib/stockage';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = await lireRessource(slug);
  if (!r) return { title: 'Ressource introuvable', robots: { index: false } };
  const description = extrait(r.description, 160) || `Ressource de la bibliothèque : ${r.title}.`;
  const yt = idYoutube(r.youtube_url);
  const image = urlImage(r.cover_path) ?? (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : '/og.png');
  return {
    title: r.title,
    description,
    alternates: { canonical: `/bibliotheque/${r.slug}` },
    openGraph: { type: 'article', title: r.title, description, url: `/bibliotheque/${r.slug}`, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title: r.title, description, images: [image] },
  };
}

export default async function DetailRessource({ params }: { params: Params }) {
  const { slug } = await params;
  const r = await lireRessource(slug);
  if (!r) notFound();

  const yt = idYoutube(r.youtube_url);
  const fiches = [...r.files].sort((a, b) => a.display_order - b.display_order);
  const avecImage = Boolean(r.cover_path);

  return (
    <Conteneur etroit>
      <Link href="/bibliotheque" className="mt-5 -ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:bg-papier-2">
        <ArrowLeft aria-hidden size={19} /> Bibliothèque
      </Link>

      <article className="mt-3">
        {avecImage && (
          <VignetteRessource
            r={r}
            sizes="(min-width: 416px) 384px, 100vw"
            className="mx-auto mb-7 aspect-[2/3] w-full max-w-[260px] sm:max-w-sm rounded-[24px] shadow-[0_10px_30px_-12px_rgba(17,17,17,.25)]"
          />
        )}

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {fiches.length > 0 && <Etiquette>{`${fiches.length} fiche${fiches.length > 1 ? 's' : ''}`}</Etiquette>}
          </div>
          <h1 className="text-4xl leading-[1.08] font-bold sm:text-5xl">{r.title}</h1>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-encre-2">
            <div className="flex items-center gap-2">
              <dt>
                <CalendarDays aria-label="Date d’ajout" role="img" size={17} />
              </dt>
              <dd>Ajoutée le {dateLongue(r.created_at)}</dd>
            </div>
          </dl>
        </header>

        {r.description && <Contenu texte={r.description} className="mt-6" />}

        {yt && r.youtube_url && (
          <section aria-labelledby="titre-video" className="mt-10">
            <h2 id="titre-video" className="sr-only">
              Vidéo
            </h2>
            <LecteurYoutube id={yt} titre={r.title} url={r.youtube_url} />
          </section>
        )}

        {fiches.length > 0 && (
          <section aria-labelledby="titre-fiches" className="mt-10">
            <h2 id="titre-fiches" className="mb-4 text-2xl font-bold">
              Fiches ({fiches.length})
            </h2>
            <ListeFiches
              titreRessource={r.title}
              fiches={fiches.map((f) => ({
                id: f.id,
                nom: f.file_name,
                taille: f.size_bytes,
                image: ficheEstImage(f.storage_path),
                urlConsulter: urlFiche(f.storage_path),
                urlTelecharger: urlFicheTelechargement(f.storage_path, f.file_name),
              }))}
            />
          </section>
        )}

        {!yt && fiches.length === 0 && !r.description && (
          <p className="carte mt-8 p-6 text-encre-2">Le contenu de cette ressource arrive bientôt.</p>
        )}
      </article>
    </Conteneur>
  );
}
