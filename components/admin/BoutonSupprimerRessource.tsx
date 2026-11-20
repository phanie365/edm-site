'use client';
import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { supprimerRessource, type Resultat } from '@/app/admin/actions';
import { Retour } from './Retour';

export function BoutonSupprimerRessource({ id, titre }: { id: string; titre: string }) {
  const [enCours, demarrer] = useTransition();
  const [resultat, setResultat] = useState<Resultat | null>(null);
  return (
    <>
      <button
        type="button"
        disabled={enCours}
        className="bouton bouton-danger bouton-petit"
        onClick={() => {
          if (!window.confirm(`Supprimer définitivement « ${titre} » et tous ses fichiers ?`)) return;
          demarrer(async () => {
            const r = await supprimerRessource(id); // redirige en cas de succès
            setResultat(r);
          });
        }}
      >
        <Trash2 aria-hidden size={16} /> {enCours ? 'Suppression…' : 'Supprimer la ressource'}
      </button>
      <Retour resultat={resultat} className="mt-3" />
    </>
  );
}
