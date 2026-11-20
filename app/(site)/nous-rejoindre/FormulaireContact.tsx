'use client';
import { useEffect, useRef, useState } from 'react';
import { useSoumission } from '@/lib/useSoumission';
import { CheckCircle2, Send } from 'lucide-react';
import { envoyerMessage, type EtatContact } from './actions';

const initial: EtatContact = { statut: 'initial' };

export function FormulaireContact() {
  const [etatSoumis, surSoumission, enCours] = useSoumission(envoyerMessage);
  const etat = etatSoumis ?? initial;
  const [ouvertLe, setOuvertLe] = useState(0);
  const retourRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOuvertLe(Date.now()), []);
  useEffect(() => {
    if (etat.statut !== 'initial') retourRef.current?.focus();
  }, [etat]);

  if (etat.statut === 'envoye') {
    return (
      <div ref={retourRef} tabIndex={-1} role="status" className="carte flex flex-col items-center gap-3 p-8 text-center outline-none">
        <CheckCircle2 aria-hidden size={40} className="text-succes" strokeWidth={1.6} />
        <p className="text-lg font-semibold">{etat.message}</p>
      </div>
    );
  }

  const e = etat.erreurs ?? {};
  const champ = (nom: 'nom' | 'email' | 'message') => ({
    id: nom,
    name: nom,
    defaultValue: etat.valeurs?.[nom] ?? '',
    'aria-invalid': e[nom] ? true : undefined,
    'aria-describedby': e[nom] ? `${nom}-erreur` : undefined,
  });

  return (
    <form onSubmit={surSoumission} noValidate className="carte space-y-5 p-6 sm:p-8">
      {etat.statut === 'erreur' && (
        <div ref={retourRef} tabIndex={-1} role="alert" className="rounded-xl border-2 border-erreur bg-[#fbeeec] p-4 font-medium text-erreur outline-none">
          {etat.message}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="nom" className="font-semibold">
          Votre nom
        </label>
        <input {...champ('nom')} type="text" autoComplete="name" required maxLength={100} className="champ" />
        {e.nom && <p id="nom-erreur" className="text-sm font-medium text-erreur">{e.nom}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="font-semibold">
          Votre e-mail
        </label>
        <input {...champ('email')} type="email" autoComplete="email" inputMode="email" required maxLength={150} className="champ" />
        {e.email && <p id="email-erreur" className="text-sm font-medium text-erreur">{e.email}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="font-semibold">
          Votre message
        </label>
        <textarea {...champ('message')} rows={6} required maxLength={5000} className="champ min-h-40 resize-y" />
        {e.message && <p id="message-erreur" className="text-sm font-medium text-erreur">{e.message}</p>}
      </div>
      {/* Anti-spam : invisible pour les humains */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="site_web">Ne pas remplir</label>
        <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input type="hidden" name="ouvert_le" value={ouvertLe} />
      <button type="submit" disabled={enCours || !ouvertLe} className="bouton bouton-plein w-full">
        <Send aria-hidden size={18} /> {enCours ? 'Envoi en cours…' : 'Envoyer le message'}
      </button>
      <p className="text-sm text-encre-2">Vos coordonnées servent uniquement à vous répondre.</p>
    </form>
  );
}
