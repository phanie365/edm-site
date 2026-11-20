import Image from 'next/image';
import { urlImage } from '@/lib/stockage';

/**
 * Photo téléversée dans l'admin, ou à défaut un fond sobre aux couleurs du logo
 * (aucune image de banque d'images n'est utilisée).
 */
export function Visuel({
  chemin,
  alt,
  sizes,
  priority = false,
  className = '',
  repliClassName = '',
  defaut,
  qualite,
}: {
  chemin: string | null | undefined;
  /** Image fournie avec le site, utilisée tant qu'aucune photo n'est choisie dans l'admin. */
  defaut?: string;
  /** Qualité d'image (75 par défaut, 90 pour les grandes photos). */
  qualite?: 75 | 90;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  repliClassName?: string;
}) {
  const url = urlImage(chemin) ?? defaut ?? null;
  if (url) {
    return (
      <div className={`relative overflow-hidden bg-papier-2 ${className}`}>
        <Image src={url} alt={alt} fill sizes={sizes} priority={priority} quality={qualite} className="object-cover" />
      </div>
    );
  }
  return (
    <div aria-hidden className={`relative overflow-hidden bg-papier-2 ${className} ${repliClassName}`}>
      <div className="absolute -right-[12%] -bottom-[30%] aspect-square w-[70%] rounded-full border-[1.5px] border-vert/15" />
      <div className="absolute -right-[2%] -bottom-[18%] aspect-square w-[46%] rounded-full bg-vert/[.06]" />
      <Image
        src="/assets/logo-mark.png"
        alt=""
        width={160}
        height={160}
        className="absolute top-1/2 left-1/2 w-[18%] max-w-28 min-w-12 -translate-x-1/2 -translate-y-1/2 opacity-90"
      />
    </div>
  );
}
