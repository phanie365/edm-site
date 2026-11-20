import Image from 'next/image';
import Link from 'next/link';

export default function PageIntrouvable() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <Image src="/assets/logo-mark.png" alt="" width={72} height={72} />
      <h1 className="text-4xl font-bold">Page introuvable</h1>
      <p className="text-lg text-encre-3">Cette page n’existe pas ou a été déplacée.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="bouton bouton-plein">
          Retour à l’accueil
        </Link>
        <Link href="/bibliotheque" className="bouton bouton-contour">
          La bibliothèque
        </Link>
      </div>
    </main>
  );
}
