'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Erreur({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="text-3xl font-bold">Le contenu n’a pas pu être chargé</h1>
      <p className="text-lg text-encre-3">
        {typeof navigator !== 'undefined' && !navigator.onLine
          ? 'Vous semblez hors ligne. Vérifiez votre connexion puis réessayez.'
          : 'Un problème temporaire est survenu. Réessayez dans un instant.'}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="bouton bouton-plein">
          Réessayer
        </button>
        <Link href="/" className="bouton bouton-contour">
          Accueil
        </Link>
      </div>
    </main>
  );
}
