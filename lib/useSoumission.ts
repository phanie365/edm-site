'use client';
import { useActionState, startTransition, type FormEvent } from 'react';

/**
 * Comme useActionState, mais SANS la remise à zéro automatique du formulaire
 * de React 19 : en cas d'erreur de validation, ce qui a été tapé est conservé.
 */
export function useSoumission<E>(action: (avant: E | null, formData: FormData) => Promise<E>) {
  const [etat, envoyer, enCours] = useActionState(action, null);
  const surSoumission = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    startTransition(() => envoyer(donnees));
  };
  return [etat, surSoumission, enCours] as const;
}
