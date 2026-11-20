'use client';
import { useSoumission } from '@/lib/useSoumission';
import { Save } from 'lucide-react';
import { enregistrerRessource } from '@/app/admin/actions';
import type { Categorie, Ressource } from '@/lib/types';
import { ErreurChamp, Retour } from './Retour';

export function FormulaireRessource({ ressource, categories }: { ressource?: Ressource; categories: Categorie[] }) {
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

        <div className="grid gap-5 sm:grid-cols-2">
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
          <div className="space-y-2">
            <label htmlFor="biblical_references" className="font-semibold">
              Références bibliques
            </label>
            <input id="biblical_references" name="biblical_references" type="text" maxLength={300} placeholder="Ex. Luc 15.11-32 ; Actes 3.19" defaultValue={ressource?.biblical_references ?? ''} className="champ" {...aide('biblical_references', e.biblical_references)} />
            <ErreurChamp id="biblical_references-erreur" message={e.biblical_references} />
            <p id="biblical_references-aide" className="text-sm text-encre-2">
              Facultatif. Aide à retrouver la ressource dans la recherche.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="category_id" className="font-semibold">
              Catégorie
            </label>
            <select id="category_id" name="category_id" defaultValue={ressource?.category_id ?? ''} className="champ" {...aide('category_id', e.category_id)}>
              <option value="">Aucune</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ErreurChamp id="category_id-erreur" message={e.category_id} />
            <p id="category_id-aide" className="text-sm text-encre-2">
              Facultatif. Les catégories se gèrent dans le menu « Catégories ».
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="resource_date" className="font-semibold">
              Date
            </label>
            <input id="resource_date" name="resource_date" type="date" defaultValue={ressource?.resource_date ?? ''} className="champ" {...aide('resource_date', e.resource_date)} />
            <ErreurChamp id="resource_date-erreur" message={e.resource_date} />
            <p id="resource_date-aide" className="text-sm text-encre-2">
              Facultatif. Date de la prédication ; sert à l’ordre d’affichage.
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
