'use client';
import Image from 'next/image';
import { useState } from 'react';
import { idYoutube } from '@/lib/outils';
import { urlImage } from '@/lib/stockage';

interface Source {
  youtube_url: string | null;
  cover_path: string | null;
}

/**
 * Image d'une ressource : couverture, sinon miniature YouTube, sinon fond sobre.
 * Si l'image ne se charge pas (vidéo supprimée…), le fond sobre prend le relais.
 */
export function VignetteRessource({ r, sizes, className = '' }: { r: Source; sizes: string; className?: string }) {
  const couverture = urlImage(r.cover_path);
  const yt = idYoutube(r.youtube_url);
  const src = couverture ?? (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null);
  const [enErreur, setEnErreur] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-papier-2 ${className}`}>
      {src && !enErreur ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          onError={() => setEnErreur(true)}
          // La couverture est toujours affichée en entier ; la miniature YouTube remplit le cadre
          className={`${couverture ? 'object-contain' : 'object-cover'} transition-transform duration-500 group-hover:scale-[1.03]`}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          <Image src="/assets/logo-mark.png" alt="" width={64} height={64} className="w-1/4 max-w-14 min-w-8 opacity-80" />
        </div>
      )}
    </div>
  );
}
