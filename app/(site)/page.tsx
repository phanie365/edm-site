import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Home, Leaf, Mail, MapPin, Users } from 'lucide-react';
import { CarteRessource } from '@/components/bibliotheque/CarteRessource';
import { Visuel } from '@/components/Visuel';
import { Conteneur, TitreSection } from '@/components/ui';
import { lirePages, lireReglages, rechercherRessources } from '@/lib/donnees';
import { lienItineraire } from '@/lib/outils';
import { urlImage } from '@/lib/stockage';
import { PresentationEglise, type SectionEglise } from '@/components/site/PresentationEglise';

export const dynamic = 'force-dynamic';

const ICONES_POINTS = [Home, Leaf, BookOpen, Users];

export default async function Accueil() {
  const [reglages, pages, { resultats: dernieres }] = await Promise.all([
    lireReglages(),
    lirePages(),
    rechercherRessources({ parPage: 3 }),
  ]);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section aria-labelledby="titre-hero" className="pt-6 sm:pt-10 lg:pt-12">
        <Conteneur>
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
            <div className="space-y-5 lg:py-10">
              {reglages.hero_kicker && <p className="surtitre">{reglages.hero_kicker}</p>}
              <h1 id="titre-hero" className="text-5xl leading-[1] font-bold sm:text-6xl lg:text-7xl">
                {reglages.hero_title}
              </h1>
              {reglages.hero_text && <p className="max-w-lg text-lg text-encre-3 sm:text-xl">{reglages.hero_text}</p>}
              <div className="flex flex-col gap-3 pt-2 xs:flex-row">
                <a href="#qui-sommes-nous" className="bouton bouton-plein">
                  Découvrir notre église <ArrowRight aria-hidden size={18} />
                </a>
                <Link href="/bibliotheque" className="bouton bouton-contour">
                  <BookOpen aria-hidden size={18} /> Explorer la bibliothèque
                </Link>
              </div>
            </div>
            <Visuel
              chemin={reglages.hero_image_path}
              defaut="/assets/accueil.jpg"
              alt="Un groupe réuni dans un salon autour de la Bible"
              priority
              qualite={90}
              sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
              className="aspect-[16/10] rounded-[28px] lg:aspect-[4/3] lg:rounded-[48px] lg:rounded-tl-[160px]"
            />
          </div>

        </Conteneur>
      </section>

      {/* ---------- Qui sommes-nous (fenêtre « En savoir plus ») ---------- */}
      <section id="qui-sommes-nous" aria-labelledby="titre-presentation" className="mt-16 scroll-mt-24 lg:mt-20">
        <Conteneur>
          <PresentationEglise
            image={urlImage(reglages.church_image_path)}
            sections={(['presentation', 'histoire', 'vision', 'valeurs', 'fonctionnement'] as const)
              .map((slug) => pages[slug])
              .filter(Boolean)
              .map((p) => ({ slug: p.slug as SectionEglise['slug'], title: p.title, content: p.content }))}
          />
          {/* Points forts */}
          {reglages.highlights.length > 0 && (
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 rounded-carte border border-bordure bg-carte/60 px-4 py-8 sm:px-8 lg:grid-cols-4">
              {reglages.highlights.map((p, i) => {
                const Icone = ICONES_POINTS[i] ?? BookOpen;
                return (
                  <li key={i} className="flex flex-col items-center gap-2 text-center">
                    <Icone aria-hidden size={30} strokeWidth={1.4} className="text-vert" />
                    <h3 className="text-lg leading-tight font-bold">{p.titre}</h3>
                    {p.texte && <p className="text-sm text-encre-3">{p.texte}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </Conteneur>
      </section>

      {/* ---------- Dernières ressources ---------- */}
      <section aria-labelledby="titre-dernieres" className="mt-20">
        <Conteneur>
          <TitreSection
            id="titre-dernieres"
            action={
              <Link href="/bibliotheque" className="lien-souligne hidden min-h-11 items-center gap-1.5 font-semibold sm:inline-flex">
                Toute la bibliothèque <ArrowRight aria-hidden size={17} />
              </Link>
            }
          >
            Dernières ressources
          </TitreSection>
          {dernieres.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {dernieres.map((r) => (
                <li key={r.id} className="grid">
                  <CarteRessource r={r} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="carte p-8 text-center text-encre-2">Les premières ressources arrivent bientôt.</p>
          )}
          <Link href="/bibliotheque" className="bouton bouton-contour mt-6 w-full sm:hidden">
            Toute la bibliothèque <ArrowRight aria-hidden size={18} />
          </Link>
        </Conteneur>
      </section>

      {/* ---------- Nos rencontres + contact ---------- */}
      <section aria-labelledby="titre-rencontres" className="mt-20">
        <Conteneur>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="carte p-7 sm:p-10">
              <p className="surtitre">Nos rencontres</p>
              <h2 id="titre-rencontres" className="mt-3 text-3xl font-bold">
                Venez nous rencontrer
              </h2>
              <ul className="mt-6 space-y-5">
                <li className="flex gap-4">
                  <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-papier-2">
                    <Clock aria-hidden size={20} />
                  </span>
                  <span>
                    <strong className="block font-semibold">{reglages.meeting_label}</strong>
                    <span className="text-encre-3">
                      Chaque {reglages.meeting_day} à partir de {reglages.meeting_time}
                    </span>
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-papier-2">
                    <MapPin aria-hidden size={20} />
                  </span>
                  <span>
                    <strong className="block font-semibold">Adresse</strong>
                    <span className="whitespace-pre-line text-encre-3">{reglages.address}</span>
                    {reglages.address_details && <span className="mt-1 block text-sm text-encre-2">{reglages.address_details}</span>}
                  </span>
                </li>
              </ul>
              <div className="mt-7 flex flex-col gap-3 xs:flex-row">
                <Link href="/nous-rejoindre" className="bouton bouton-plein">
                  Nous rejoindre <ArrowRight aria-hidden size={18} />
                </Link>
                <a href={lienItineraire(reglages.address)} target="_blank" rel="noopener noreferrer" className="bouton bouton-contour">
                  <MapPin aria-hidden size={18} /> Itinéraire<span className="sr-only"> (nouvel onglet)</span>
                </a>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6 rounded-carte bg-papier-2 p-7 sm:p-10">
              <div className="space-y-3">
                <Mail aria-hidden size={30} strokeWidth={1.4} />
                <h2 className="text-3xl font-bold">Une question ?</h2>
                <p className="text-[17px] text-encre-3">N’hésitez pas à nous contacter, nous serons heureux de vous répondre.</p>
              </div>
              <Link href="/nous-rejoindre#contact" className="bouton bouton-plein">
                Nous contacter <ArrowRight aria-hidden size={18} />
              </Link>
            </div>
          </div>
        </Conteneur>
      </section>
    </>
  );
}
