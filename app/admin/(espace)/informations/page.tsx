import type { Metadata } from 'next';
import { ChoixImage } from '@/components/admin/ChoixImage';
import { FormulaireReglages } from '@/components/admin/FormulaireReglages';
import { TitreAdmin } from '@/components/admin/Retour';
import { exigerAdminPage } from '@/lib/auth';
import type { Reglages } from '@/lib/types';

export const metadata: Metadata = { title: 'Informations' };

export default async function Informations() {
  const { supabase } = await exigerAdminPage();
  const { data } = await supabase.from('site_settings').select('*').single();
  const r = data as Reglages;
  return (
    <>
      <TitreAdmin titre="Informations de l’église" sousTitre="Nom, message d’accueil, rencontres, adresse, coordonnées et photos." />
      <FormulaireReglages reglages={r} />
      <section aria-labelledby="titre-photos" className="carte mt-8 p-5 sm:p-7">
        <h2 id="titre-photos" className="text-xl font-bold">
          Photos du site
        </h2>
        <p className="mb-6 text-sm text-encre-2">Facultatives. Utilisez vos propres photos (ou des photos libres de droits). JPEG, PNG ou WebP, 5 Mo maximum.</p>
        <div className="grid gap-8 md:grid-cols-3">
          <ChoixImage cible="hero" chemin={r.hero_image_path} titre="Accueil" aide="Grand visuel à côté de « Bienvenue ! ». Sans choix ici, la photo fournie avec le site s’affiche. Format paysage conseillé, 1600 px de large ou plus." ratio="aspect-[4/3]" />
          <ChoixImage cible="church" chemin={r.church_image_path} titre="Notre église" aide="En haut de la fenêtre « En savoir plus » de l’accueil." ratio="aspect-[16/9]" />
          <ChoixImage cible="join" chemin={r.join_image_path} titre="Nous rejoindre" aide="Sur la page Nous rejoindre (ordinateur)." ratio="aspect-[4/3]" />
        </div>
      </section>
    </>
  );
}
