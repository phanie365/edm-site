import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ListeRessourcesAdmin } from '@/components/admin/ListeRessourcesAdmin';
import { Retour, TitreAdmin } from '@/components/admin/Retour';
import { exigerAdminPage } from '@/lib/auth';

export const metadata: Metadata = { title: 'Ressources' };

export default async function Ressources({ searchParams }: { searchParams: Promise<{ supprimee?: string }> }) {
  const { supabase } = await exigerAdminPage();
  const { supprimee } = await searchParams;
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, slug, description, youtube_url, cover_path, is_published, resource_date, updated_at, category:categories(name), files:resource_files(count)')
    .order('resource_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  return (
    <>
      <TitreAdmin
        titre="Ressources"
        sousTitre="Prédications, enseignements et fiches de la bibliothèque."
        action={
          <Link href="/admin/ressources/nouvelle" className="bouton bouton-plein">
            <Plus aria-hidden size={18} /> Ajouter une ressource
          </Link>
        }
      />
      {supprimee && <Retour resultat={{ ok: true, message: 'Ressource supprimée, ainsi que ses fichiers.' }} className="mb-6" />}
      {error ? (
        <Retour resultat={{ ok: false, message: `Impossible de charger les ressources : ${error.message}` }} />
      ) : (
        <ListeRessourcesAdmin
          ressources={(data ?? []).map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            description: r.description,
            youtube_url: r.youtube_url,
            cover_path: r.cover_path,
            is_published: r.is_published,
            resource_date: r.resource_date,
            categorie: (r.category as unknown as { name: string } | null)?.name ?? null,
            nbFiches: (r.files as unknown as { count: number }[])[0]?.count ?? 0,
          }))}
        />
      )}
    </>
  );
}
