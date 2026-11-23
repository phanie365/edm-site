'use client';
import { useSoumission } from '@/lib/useSoumission';
import { Save } from 'lucide-react';
import { enregistrerRessource } from '@/app/admin/actions';
import type { Ressource } from '@/lib/types';
import { ErreurChamp, Retour } from './Retour';

export function FormulaireRessource({ ressource }: { ressource?: Ressource }) {
  const [etat, surSoumission, enCours] = useSoumission(enregistrerRessource);
  const e = etat?.erreurs ?? {};
  const aide = (id: string, erreur?: string) => ({ 'aria-invalid': erreur ? true : undefined, 'aria-describedby': erreur ? `${id}-erreur` : `${id}-aide` });

  return (
    <form onSubmit={surSoumission} noValidate className="space-y-6">
      {ressource && <input type="hidden" name="id" value={ressource.id} />}
      <Retour resultat={etat} />

      <fieldset className="carte space-y-5 p-5 sm:p-7">
        <legend className="sr-only">Informations de la ressource</legend>
        <div className="space-y-2">
          <label htmlFor="title" className="font-semibold">
            Titre <span className="text-erreur">*</span>
          </label>
          <input id="title" name="title" type="text" required maxLength={160} defaultValue={ressource?.title} className="champ" {...aide('title', e.title)} />
          <ErreurChamp id="title-erreur" message={e.title} />
          <p id="title-aide" className="sr-only">
            Obligatoire
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="font-semibold">
            Description
          </label>
          <textarea id="description" name="description" rows={5} maxLength={10000} defaultValue={ressource?.description ?? ''} className="champ min-h-32 resize-y" {...aide('description', e.description)} />
          <ErreurChamp id="description-erreur" message={e.description} />
          <p id="description-aide" className="text-sm text-encre-2">
            Une ligne vide sépare deux paragraphes. Commencez une ligne par « - » pour faire une liste.
          </p>
        </div>

        <div className="grid gap-5">
          <div className="space-y-2">
            <label htmlFor="youtube_url" className="font-semibold">
              Lien YouTube
            </label>
            <input id="youtube_url" name="youtube_url" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" defaultValue={ressource?.youtube_url ?? ''} className="champ" {...aide('youtube_url', e.youtube_url)} />
            <ErreurChamp id="youtube_url-erreur" message={e.youtube_url} />
            <p id="youtube_url-aide" className="text-sm text-encre-2">
              Facultatif. Copiez le lien depuis le bouton « Partager » de YouTube.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-papier p-4">
          <input type="checkbox" name="is_published" defaultChecked={ressource?.is_published ?? false} className="mt-0.5 size-6 flex-none accent-vert" />
          <span>
            <span className="block font-semibold">Publier sur le site</span>
            <span className="text-sm text-encre-3">Décochez pour garder la ressource en brouillon, invisible pour les visiteurs.</span>
          </span>
        </label>
      </fieldset>

      <button type="submit" disabled={enCours} className="bouton bouton-plein w-full sm:w-auto">
        <Save aria-hidden size={18} /> {enCours ? 'Enregistrement…' : ressource ? 'Enregistrer les modifications' : 'Créer la ressource'}
      </button>
    </form>
  );
}
