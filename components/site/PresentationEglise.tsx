'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Compass, Heart, Users, X } from 'lucide-react';
import { Contenu } from '@/components/Contenu';
import { extrait } from '@/lib/outils';

export interface SectionEglise {
  slug: 'presentation' | 'histoire' | 'vision' | 'valeurs' | 'fonctionnement';
  title: string;
  content: string;
}

const ICONES = { presentation: Users, histoire: BookOpen, vision: Compass, valeurs: Heart, fonctionnement: Users } as const;

/**
 * « Qui sommes-nous » + « Notre vision » sur l'accueil.
 * « En savoir plus » ouvre une fenêtre avec tous les textes de l'église (pas de page séparée).
 */
export function PresentationEglise({ sections, image }: { sections: SectionEglise[]; image: string | null }) {
  const fenetre = useRef<HTMLDialogElement>(null);
  const [ouverte, setOuverte] = useState(false);
  const presentation = sections.find((s) => s.slug === 'presentation');
  const vision = sections.find((s) => s.slug === 'vision');
  const aAfficher = sections.filter((s) => s.content.trim());

  const ouvrir = (ancre?: string) => {
    fenetre.current?.showModal();
    setOuverte(true);
    requestAnimationFrame(() => {
      const cible = ancre ? document.getElementById(`fenetre-${ancre}`) : null;
      if (cible) cible.scrollIntoView({ block: 'start' });
      else fenetre.current?.querySelector('[data-defilement]')?.scrollTo({ top: 0 });
    });
  };
  const fermer = () => fenetre.current?.close();

  // Pas de défilement de la page derrière la fenêtre
  useEffect(() => {
    document.documentElement.style.overflow = ouverte ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [ouverte]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="carte flex flex-col gap-4 p-7 sm:p-10">
          <p className="surtitre">Qui sommes-nous</p>
          <h2 id="titre-presentation" className="text-3xl font-bold">
            {presentation?.title ?? 'Notre église de maison'}
          </h2>
          <p className="text-[17px] leading-relaxed text-encre-3">{extrait(presentation?.content, 320)}</p>
          <button
            type="button"
            onClick={() => ouvrir()}
            aria-haspopup="dialog"
            className="lien-souligne mt-auto inline-flex min-h-11 cursor-pointer items-center gap-1.5 self-start font-semibold text-vert"
          >
            En savoir plus <ArrowRight aria-hidden size={17} />
          </button>
        </article>
        {vision?.content.trim() && (
          <article className="flex flex-col gap-4 rounded-carte bg-vert p-7 text-clair sm:p-10">
            <p className="text-xs font-semibold tracking-[.12em] text-clair-2 uppercase">Notre vision</p>
            <h2 className="text-3xl font-bold">{vision.title}</h2>
            <Contenu texte={extrait(vision.content, 320)} className="!text-clair-2" />
            <button
              type="button"
              onClick={() => ouvrir('vision')}
              aria-haspopup="dialog"
              className="mt-auto inline-flex min-h-11 cursor-pointer items-center gap-1.5 self-start font-semibold underline underline-offset-4"
            >
              Lire notre vision <ArrowRight aria-hidden size={17} />
            </button>
          </article>
        )}
      </div>

      <dialog
        ref={fenetre}
        aria-labelledby="titre-fenetre-eglise"
        onClose={() => setOuverte(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) fermer(); // clic sur le fond
        }}
        className="m-auto h-[min(92dvh,900px)] w-[min(94vw,760px)] max-w-none overflow-hidden rounded-[28px] bg-papier p-0 text-encre shadow-2xl backdrop:bg-encre/55 backdrop:backdrop-blur-sm max-sm:mb-0 max-sm:h-[92dvh] max-sm:w-full max-sm:rounded-b-none"
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-bordure bg-papier px-6 py-4 sm:px-8">
            <h2 id="titre-fenetre-eglise" className="text-2xl font-bold">
              Notre église
            </h2>
            <button
              type="button"
              onClick={fermer}
              aria-label="Fermer"
              className="inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-papier-2"
            >
              <X aria-hidden size={22} />
            </button>
          </header>
          <div data-defilement className="flex-1 overflow-y-auto overscroll-contain px-6 pt-6 pb-10 sm:px-8">
            {image && (
              <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[22px] bg-papier-2">
                <Image src={image} alt="" fill sizes="(min-width: 768px) 700px, 94vw" quality={90} className="object-cover" />
              </div>
            )}
            <div className="space-y-10">
              {aAfficher.map((s) => {
                const Icone = ICONES[s.slug];
                return (
                  <section key={s.slug} id={`fenetre-${s.slug}`} aria-labelledby={`fenetre-titre-${s.slug}`} className="scroll-mt-4">
                    <h3 id={`fenetre-titre-${s.slug}`} className="mb-3 flex items-center gap-3 text-xl font-bold">
                      <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-papier-2 text-vert">
                        <Icone aria-hidden size={20} />
                      </span>
                      {s.title}
                    </h3>
                    <Contenu texte={s.content} />
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
