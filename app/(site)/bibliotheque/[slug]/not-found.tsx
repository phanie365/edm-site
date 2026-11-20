import Link from 'next/link';
import { Conteneur } from '@/components/ui';

export default function RessourceIntrouvable() {
  return (
    <Conteneur etroit className="py-20 text-center">
      <h1 className="text-4xl font-bold">Ressource introuvable</h1>
      <p className="mt-4 text-lg text-encre-3">Elle a peut-être été retirée ou son adresse a changé.</p>
      <Link href="/bibliotheque" className="bouton bouton-plein mt-8">
        Retour à la bibliothèque
      </Link>
    </Conteneur>
  );
}
