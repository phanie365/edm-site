import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FormulaireConnexion } from './FormulaireConnexion';

export const metadata: Metadata = { title: 'Connexion' };

export default async function Connexion({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const { refus } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <Image src="/assets/logo-lockup.png" alt="EDM République Villeurbanne" width={1085} height={400} priority className="h-14 w-auto self-start" />
      <h1 className="mt-10 text-4xl font-bold">Administration</h1>
      <p className="mt-2 text-encre-3">Espace réservé aux administrateurs du site.</p>
      {refus && (
        <p role="alert" className="mt-6 rounded-xl border-2 border-erreur bg-[#fbeeec] p-4 font-medium text-erreur">
          Ce compte n’a pas accès à l’administration.
        </p>
      )}
      <FormulaireConnexion />
      <Link href="/" className="lien-souligne mt-8 inline-flex min-h-11 items-center self-start text-sm font-semibold">
        ← Retour au site
      </Link>
    </main>
  );
}
