'use client';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { Resultat } from '@/app/admin/actions';

/** Message de confirmation ou d'erreur, annoncé aux lecteurs d'écran. */
export function Retour({ resultat, className = '' }: { resultat: Resultat | null | undefined; className?: string }) {
  return (
    <div aria-live="polite" role="status" className={className}>
      {resultat && (
        <p
          className={`flex items-start gap-2 rounded-xl border-2 p-3 font-medium ${
            resultat.ok ? 'border-succes bg-[#edf5ef] text-succes' : 'border-erreur bg-[#fbeeec] text-erreur'
          }`}
        >
          {resultat.ok ? <CheckCircle2 aria-hidden size={20} className="mt-0.5 flex-none" /> : <AlertCircle aria-hidden size={20} className="mt-0.5 flex-none" />}
          {resultat.message}
        </p>
      )}
    </div>
  );
}

/** En-tête de page admin. */
export function TitreAdmin({ titre, sousTitre, action }: { titre: string; sousTitre?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{titre}</h1>
        {sousTitre && <p className="mt-1 text-encre-3">{sousTitre}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErreurChamp({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-medium text-erreur">
      {message}
    </p>
  );
}
