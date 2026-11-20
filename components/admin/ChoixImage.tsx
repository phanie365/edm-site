'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { definirImage, type Resultat } from '@/app/admin/actions';
import { urlImage } from '@/lib/stockage';
import { annulerDepot, deposerImage } from '@/lib/televersement';
import { Retour } from './Retour';

/** Choisir / remplacer / retirer une image (couverture de ressource ou photo du site). */
export function ChoixImage({
  cible,
  ressourceId,
  chemin,
  titre,
  aide,
  ratio = 'aspect-[16/10]',
}: {
  cible: 'cover' | 'hero' | 'church' | 'join';
  ressourceId?: string;
  chemin: string | null;
  titre: string;
  aide: string;
  ratio?: string;
}) {
  const router = useRouter();
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [occupe, setOccupe] = useState(false);
  const url = urlImage(chemin);
  const id = `image-${cible}`;

  const choisir = async (fichier: File) => {
    setOccupe(true);
    setResultat(null);
    const depot = await deposerImage(cible === 'cover' ? 'couvertures' : 'site', fichier);
    if ('erreur' in depot) {
      setResultat({ ok: false, message: depot.erreur });
    } else {
      const r = await definirImage(cible, depot.chemin, ressourceId);
      if (!r.ok) await annulerDepot('images', depot.chemin);
      setResultat(r);
      router.refresh();
    }
    setOccupe(false);
  };

  const retirer = async () => {
    if (!window.confirm('Retirer cette image ?')) return;
    setOccupe(true);
    setResultat(await definirImage(cible, null, ressourceId));
    router.refresh();
    setOccupe(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="font-semibold">{titre}</p>
        <p className="text-sm text-encre-2">{aide}</p>
      </div>
      <div className={`relative overflow-hidden rounded-2xl border border-bordure bg-papier-2 ${ratio}`}>
        {url ? (
          <Image src={url} alt={`Aperçu : ${titre}`} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-encre-2">Aucune image choisie : l’image par défaut du site (ou un fond sobre) est affichée.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className={`bouton bouton-contour bouton-petit cursor-pointer focus-within:outline-3 focus-within:outline-vert ${occupe ? 'pointer-events-none opacity-50' : ''}`}>
          <ImagePlus aria-hidden size={16} /> {occupe ? 'Envoi…' : url ? 'Changer l’image' : 'Choisir une image'}
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={occupe}
            aria-label={`${titre} : choisir une image`}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void choisir(f);
            }}
          />
        </label>
        {url && (
          <button type="button" disabled={occupe} onClick={retirer} className="bouton bouton-danger bouton-petit">
            <Trash2 aria-hidden size={16} /> Retirer
          </button>
        )}
      </div>
      <Retour resultat={resultat} />
    </div>
  );
}
