'use client';
import { useSoumission } from '@/lib/useSoumission';
import { LogIn } from 'lucide-react';
import { seConnecter } from '../actions';

export function FormulaireConnexion() {
  const [etat, surSoumission, enCours] = useSoumission(seConnecter);
  const e = etat?.erreurs ?? {};
  return (
    <form onSubmit={surSoumission} noValidate className="carte mt-8 space-y-5 p-6">
      {etat && !etat.ok && (
        <p role="alert" className="rounded-xl border-2 border-erreur bg-[#fbeeec] p-3 font-medium text-erreur">
          {etat.message}
        </p>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" inputMode="email" required className="champ" aria-invalid={e.email ? true : undefined} />
        {e.email && <p className="text-sm text-erreur">{e.email}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="motDePasse" className="font-semibold">
          Mot de passe
        </label>
        <input id="motDePasse" name="motDePasse" type="password" autoComplete="current-password" required className="champ" />
        {e.motDePasse && <p className="text-sm text-erreur">{e.motDePasse}</p>}
      </div>
      <button type="submit" disabled={enCours} className="bouton bouton-plein w-full">
        <LogIn aria-hidden size={18} /> {enCours ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
