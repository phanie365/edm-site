import { Conteneur } from '@/components/ui';

export default function ChargementBibliotheque() {
  return (
    <Conteneur>
      <div role="status" aria-live="polite" className="animate-pulse pt-8 sm:pt-14">
        <span className="sr-only">Chargement de la bibliothèque…</span>
        <div className="h-12 w-64 rounded-xl bg-papier-2" />
        <div className="mt-4 h-6 w-96 max-w-full rounded-lg bg-papier-2" />
        <div className="mt-8 h-14 max-w-2xl rounded-full bg-papier-2" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-28 rounded-carte bg-papier-2 sm:h-80" />
          ))}
        </div>
      </div>
    </Conteneur>
  );
}
