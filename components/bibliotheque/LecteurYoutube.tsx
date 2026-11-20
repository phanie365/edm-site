'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';

/**
 * Lecteur « à la demande » : seule une image est chargée ; YouTube ne se charge
 * qu'au clic (page plus rapide, aucun cookie YouTube avant l'action du visiteur).
 */
export function LecteurYoutube({ id, titre, url }: { id: string; titre: string; url: string }) {
  const [actif, setActif] = useState(false);
  const [sansMiniature, setSansMiniature] = useState(false);
  return (
    <div className="space-y-2">
      <div className="relative aspect-video overflow-hidden rounded-carte bg-encre">
        {actif ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={`Vidéo : ${titre}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setActif(true)} className="group absolute inset-0 size-full cursor-pointer text-clair">
            {!sansMiniature && (
              <Image
                src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                alt=""
                fill
                sizes="(min-width: 1024px) 760px, 100vw"
                onError={() => setSansMiniature(true)}
                className="object-cover opacity-80"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="flex h-14 w-20 items-center justify-center rounded-2xl bg-youtube shadow-lg transition-transform group-hover:scale-105">
                <Play aria-hidden size={28} fill="currentColor" />
              </span>
              <span className="text-[15px] font-semibold drop-shadow">Voir la prédication sur YouTube</span>
            </span>
            <span className="sr-only">Lire la vidéo « {titre} »</span>
          </button>
        )}
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="lien-souligne inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-encre-3">
        Ouvrir sur YouTube <ExternalLink aria-hidden size={15} />
        <span className="sr-only">(nouvel onglet)</span>
      </a>
    </div>
  );
}
