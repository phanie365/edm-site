import type { Metadata } from 'next';
import { GestionCategories } from '@/components/admin/GestionCategories';
import { TitreAdmin } from '@/components/admin/Retour';
import { exigerAdminPage } from '@/lib/auth';

export const metadata: Metadata = { title: 'Catégories' };

export default async function Categories() {
  const { supabase } = await exigerAdminPage();
  const { data } = await supabase.from('categories').select('id, name, slug, resources(count)').order('position').order('name');
  const categories = (data ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    nb: ((c.resources as unknown as { count: number }[])[0]?.count ?? 0) as number,
  }));
  return (
    <>
      <TitreAdmin titre="Catégories" sousTitre="Elles servent de filtres dans la bibliothèque (ex. Prédications, Enseignements, Sujets)." />
      <GestionCategories categories={categories} />
    </>
  );
}
