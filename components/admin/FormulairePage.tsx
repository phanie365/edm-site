'use client';
import { useSoumission } from '@/lib/useSoumission';
import { useState } from 'react';
import { Save } from 'lucide-react';
import { enregistrerPage } from '@/app/admin/actions';
import { Contenu } from '@/components/Contenu';
import type { PageSite } from '@/lib/types';
import { ErreurChamp, Retour } from './Retour';

export function FormulairePage({ page }: { page: PageSite }) {
  const [etat, surSoumission, enCours] = useSoumission(enregistrerPage);
  const [texte, setTexte] = useState(page.content);
  const e = etat?.erreurs ?? {};
  return (
    <form onSubmit={surSoumission} className="space-y-6">
      <input type="hidden" name="slug" value={page.slug} />
      <Retour resultat={etat} />
      <div className="grid gap-6 xl:grid-cols-2">
        <fieldset className="carte space-y-5 p-5 sm:p-7">
          <legend className="sr-only">Texte</legend>
          <div className="space-y-2">
            <label htmlFor="title" className="font-semibold">
              Titre
            </label>
            <input id="title" name="title" type="text" required maxLength={120} defaultValue={page.title} className="champ" />
            <ErreurChamp id="title-erreur" message={e.title} />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="font-semibold">
              Texte
            </label>
            <textarea
              id="content"
              name="content"
              rows={16}
              maxLength={20000}
              value={texte}
              onChange={(ev) => setTexte(ev.target.value)}
              className="champ min-h-80 resize-y leading-relaxed"
              aria-describedby="content-aide"
            />
            <ErreurChamp id="content-erreur" message={e.content} />
            <p id="content-aide" className="text-sm text-encre-2">
              Laissez une ligne vide entre deux paragraphes. Commencez une ligne par « - » pour faire une liste. Si le texte est vide, la section
              n’apparaît pas. N’oubliez pas de retirer la mention « Texte provisoire ».
            </p>
          </div>
        </fieldset>
        <section aria-label="Aperçu" className="carte p-5 sm:p-7">
          <p className="surtitre mb-4">Aperçu</p>
          <Contenu texte={texte} />
        </section>
      </div>
      <button type="submit" disabled={enCours} className="bouton bouton-plein w-full sm:w-auto">
        <Save aria-hidden size={18} /> {enCours ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
