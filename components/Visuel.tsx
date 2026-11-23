import Image from 'next/image';
import { urlImage } from '@/lib/stockage';

/**
 * Photo téléversée dans l'admin, ou à défaut le logo complet sur un fond sobre
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
      {/* Logo complet (EDM République Villeurbanne), centré */}
      <Image
        src="/assets/logo-lockup.png"
        alt=""
        width={1085}
        height={400}
        sizes="(min-width: 1024px) 380px, 70vw"
        className="absolute top-1/2 left-1/2 w-[68%] max-w-[380px] -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}
