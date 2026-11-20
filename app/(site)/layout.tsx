import { BarreOnglets } from '@/components/site/BarreOnglets';
import { Entete } from '@/components/site/Entete';
import { PiedDePage } from '@/components/site/PiedDePage';
import { lireReglages } from '@/lib/donnees';

/** Contenu lu à chaque visite : toujours à jour après une modification dans l'admin. */
export const dynamic = 'force-dynamic';

export default async function MiseEnPageSite({ children }: { children: React.ReactNode }) {
  const reglages = await lireReglages();
  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-50 rounded-xl bg-vert px-4 py-3 font-semibold text-clair focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <Entete nom={reglages.church_name} />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <PiedDePage reglages={reglages} />
      <BarreOnglets />
    </>
  );
}
