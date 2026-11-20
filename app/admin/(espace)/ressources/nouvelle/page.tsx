import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FormulaireRessource } from '@/components/admin/FormulaireRessource';
import { TitreAdmin } from '@/components/admin/Retour';
import { exigerAdminPage } from '@/lib/auth';
import type { Categorie } from '@/lib/types';

export const metadata: Metadata = { title: 'Nouvelle ressource' };

export default async function NouvelleRessource() {
  const { supabase } = await exigerAdminPage();
  const { data } = await supabase.from('categories').select('*').order('position').order('name');
  return (
    <>
      <Link href="/admin/ressources" className="mb-4 -ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:bg-papier-2">
        <ArrowLeft aria-hidden size={18} /> Ressources
      </Link>
      <TitreAdmin titre="Nouvelle ressource" sousTitre="Vous pourrez ajouter les fiches PDF et l’image juste après l’enregistrement." />
      <FormulaireRessource categories={(data ?? []) as Categorie[]} />
    </>
  );
}
