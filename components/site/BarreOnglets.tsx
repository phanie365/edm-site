'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LIENS_NAV, estActif } from './navigation';

/** Barre d'onglets en bas de l'écran (mobile et tablette). */
export function BarreOnglets() {
  const chemin = usePathname();
  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-bordure bg-papier/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-3">
        {LIENS_NAV.map((l) => {
          const actif = estActif(l.href, chemin);
          const Icone = l.icone;
          return (
            <li key={l.href} className="flex">
              <Link
                href={l.href}
                aria-current={actif ? 'page' : undefined}
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] leading-none ${
                  actif ? 'font-semibold text-encre' : 'font-medium text-encre-2'
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${actif ? 'bg-vert text-clair' : ''}`}
                >
                  <Icone aria-hidden size={19} strokeWidth={actif ? 2.25 : 1.9} />
                </span>
                {l.court}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
