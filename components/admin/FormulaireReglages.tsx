'use client';
import { useSoumission } from '@/lib/useSoumission';
import { Save } from 'lucide-react';
import { enregistrerReglages } from '@/app/admin/actions';
import type { Reglages } from '@/lib/types';
import { ErreurChamp, Retour } from './Retour';

function Champ({
  nom,
  libelle,
  valeur,
  erreur,
  aide,
  type = 'text',
  max,
  zone = false,
  ...reste
}: {
  nom: string;
  libelle: string;
  valeur: string | null | undefined;
  erreur?: string;
  aide?: string;
  type?: string;
  max?: number;
  zone?: boolean;
  placeholder?: string;
  inputMode?: 'email' | 'tel' | 'url';
  autoComplete?: string;
}) {
  const decrit = [erreur ? `${nom}-erreur` : null, aide ? `${nom}-aide` : null].filter(Boolean).join(' ') || undefined;
  const props = { id: nom, name: nom, defaultValue: valeur ?? '', maxLength: max, 'aria-invalid': erreur ? true : undefined, 'aria-describedby': decrit, ...reste };
  return (
    <div className="space-y-2">
      <label htmlFor={nom} className="font-semibold">
        {libelle}
      </label>
      {zone ? <textarea {...props} rows={3} className="champ min-h-24 resize-y" /> : <input {...props} type={type} className="champ" />}
      <ErreurChamp id={`${nom}-erreur`} message={erreur} />
      {aide && (
        <p id={`${nom}-aide`} className="text-sm text-encre-2">
          {aide}
        </p>
      )}
    </div>
  );
}

export function FormulaireReglages({ reglages: r }: { reglages: Reglages }) {
  const [etat, surSoumission, enCours] = useSoumission(enregistrerReglages);
  const e = etat?.erreurs ?? {};
  const points = [0, 1, 2, 3].map((i) => r.highlights[i] ?? { titre: '', texte: '' });

  return (
    <form onSubmit={surSoumission} noValidate className="space-y-6">
      <Retour resultat={etat} />

      <fieldset className="carte space-y-5 p-5 sm:p-7">
        <legend className="mb-2 text-xl font-bold">Accueil</legend>
        <Champ nom="church_name" libelle="Nom de l’église" valeur={r.church_name} erreur={e.church_name} max={100} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ nom="hero_kicker" libelle="Petit titre au-dessus" valeur={r.hero_kicker} erreur={e.hero_kicker} max={60} placeholder="Église de maison" />
          <Champ nom="hero_title" libelle="Titre principal" valeur={r.hero_title} erreur={e.hero_title} max={80} />
        </div>
        <Champ nom="hero_text" libelle="Message principal" valeur={r.hero_text} erreur={e.hero_text} max={300} zone aide="Une ou deux phrases sous le titre." />
        <div>
          <p className="font-semibold">Points forts (sous le visuel)</p>
          <p className="mb-3 text-sm text-encre-2">Jusqu’à 4. Laissez vide pour en afficher moins.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {points.map((p, i) => (
              <div key={i} className="space-y-3 rounded-2xl bg-papier p-4">
                <Champ nom={`hl_titre_${i}`} libelle={`Point ${i + 1} : titre`} valeur={p.titre} max={60} />
                <Champ nom={`hl_texte_${i}`} libelle={`Point ${i + 1} : texte`} valeur={p.texte} max={200} zone />
              </div>
            ))}
          </div>
          <ErreurChamp id="highlights-erreur" message={Object.entries(e).find(([k]) => k.startsWith('highlights'))?.[1]} />
        </div>
      </fieldset>

      <fieldset className="carte space-y-5 p-5 sm:p-7">
        <legend className="mb-2 text-xl font-bold">Rencontres</legend>
        <div className="grid gap-5 sm:grid-cols-3">
          <Champ nom="meeting_label" libelle="Nom de la rencontre" valeur={r.meeting_label} erreur={e.meeting_label} max={60} />
          <Champ nom="meeting_day" libelle="Jour" valeur={r.meeting_day} erreur={e.meeting_day} max={30} placeholder="jeudi" />
          <Champ nom="meeting_time" libelle="Heure" valeur={r.meeting_time} erreur={e.meeting_time} max={30} placeholder="19h30" />
        </div>
        <p className="text-sm text-encre-2">Affiché ainsi : « {r.meeting_label} – chaque {r.meeting_day} à partir de {r.meeting_time} ».</p>
        <Champ
          nom="address"
          libelle="Adresse affichée"
          valeur={r.address}
          erreur={e.address}
          max={200}
          zone
          aide="Visible par tous et indexée par Google. Pour une maison, vous pouvez n’indiquer que le quartier (ex. « République, Villeurbanne ») et donner l’adresse exacte au premier contact. Sert aussi au bouton « Itinéraire »."
        />
        <Champ nom="address_details" libelle="Précision sous l’adresse" valeur={r.address_details} erreur={e.address_details} max={300} placeholder="Ex. Interphone « Martin », 2e étage" />
      </fieldset>

      <fieldset className="carte space-y-5 p-5 sm:p-7">
        <legend className="mb-2 text-xl font-bold">Coordonnées</legend>
        <p className="-mt-2 text-sm text-encre-2">Toutes facultatives : seules celles renseignées s’affichent.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ nom="contact_email" libelle="Email" type="email" inputMode="email" valeur={r.contact_email} erreur={e.contact_email} max={120} autoComplete="off" />
          <Champ nom="phone" libelle="Téléphone" type="tel" inputMode="tel" valeur={r.phone} erreur={e.phone} max={30} autoComplete="off" />
        </div>
        <Champ
          nom="whatsapp_url"
          libelle="Lien WhatsApp"
          type="url"
          inputMode="url"
          valeur={r.whatsapp_url}
          erreur={e.whatsapp_url}
          max={200}
          placeholder="https://wa.me/33600000000"
          aide="https://wa.me/ suivi du numéro au format international sans + ni espaces, ou un lien d’invitation de groupe."
        />
      </fieldset>

      <button type="submit" disabled={enCours} className="bouton bouton-plein w-full sm:w-auto">
        <Save aria-hidden size={18} /> {enCours ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
