import Link from 'next/link';
import { FileText, FolderOpen, PencilLine, Plus, Tags } from 'lucide-react';
import { TitreAdmin } from '@/components/admin/Retour';
import { exigerAdminPage } from '@/lib/auth';
import { ilYa } from '@/lib/outils';
import { VignetteRessource } from '@/components/bibliotheque/CarteRessource';

export default async function TableauDeBord() {
  const { supabase } = await exigerAdminPage();
  const [ressources, fiches, categories, dernieres] = await Promise.all([
    supabase.from('resources').select('is_published'),
    supabase.from('resource_files').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase
      .from('resources')
      .select('id, title, slug, description, youtube_url, cover_path, is_published, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);
  const liste = ressources.data ?? [];
  const publiees = liste.filter((r) => r.is_published).length;
  const stats = [
    { libelle: 'Ressources publiées', valeur: publiees, detail: `${liste.length - publiees} non publiée${liste.length - publiees > 1 ? 's' : ''}`, icone: FolderOpen },
    { libelle: 'Fiches PDF', valeur: fiches.count ?? 0, icone: FileText },
    { libelle: 'Catégories', valeur: categories.count ?? 0, icone: Tags },
  ];

  return (
    <>
      <TitreAdmin
        titre="Tableau de bord"
        action={
          <Link href="/admin/ressources/nouvelle" className="bouton bouton-plein">
            <Plus aria-hidden size={18} /> Ajouter une ressource
          </Link>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ libelle, valeur, detail, icone: Icone }) => (
          <li key={libelle} className="carte flex items-center gap-4 p-5">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-papier-2">
              <Icone aria-hidden size={22} />
            </span>
            <span>
              <span className="block font-titres text-3xl font-bold">{valeur}</span>
              <span className="text-sm text-encre-3">{libelle}</span>
              {detail && <span className="block text-xs text-encre-2">{detail}</span>}
            </span>
          </li>
        ))}
      </ul>

      <section aria-labelledby="titre-dernieres" className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="titre-dernieres" className="text-xl font-bold">
            Dernières ressources modifiées
          </h2>
          <Link href="/admin/ressources" className="lien-souligne inline-flex min-h-11 items-center text-sm font-semibold">
            Tout voir
          </Link>
        </div>
        {dernieres.data?.length ? (
          <ul className="carte divide-y divide-bordure">
            {dernieres.data.map((r) => (
              <li key={r.id} className="flex items-center gap-4 p-3 sm:p-4">
                <VignetteRessource r={r} sizes="64px" className="size-14 flex-none rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.title}</p>
                  <p className="text-sm text-encre-2">Modifiée {ilYa(r.updated_at)}</p>
                </div>
                <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline ${r.is_published ? 'bg-vert-doux text-vert' : 'border border-bordure-forte text-encre-3'}`}>
                  {r.is_published ? 'Publiée' : 'Brouillon'}
                </span>
                <Link href={`/admin/ressources/${r.id}`} className="bouton bouton-contour bouton-petit w-11 px-0" aria-label={`Modifier « ${r.title} »`}>
                  <PencilLine aria-hidden size={17} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="carte p-6 text-encre-2">Aucune ressource pour l’instant.</p>
        )}
      </section>

      <section aria-labelledby="titre-raccourcis" className="mt-10">
        <h2 id="titre-raccourcis" className="mb-4 text-xl font-bold">
          Raccourcis
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/admin/pages" className="carte flex min-h-20 items-center gap-3 p-5 font-semibold hover:border-vert">
            <FileText aria-hidden size={20} /> Modifier les textes du site
          </Link>
          <Link href="/admin/informations" className="carte flex min-h-20 items-center gap-3 p-5 font-semibold hover:border-vert">
            <PencilLine aria-hidden size={20} /> Adresse, horaires, contact
          </Link>
          <Link href="/admin/categories" className="carte flex min-h-20 items-center gap-3 p-5 font-semibold hover:border-vert">
            <Tags aria-hidden size={20} /> Gérer les catégories
          </Link>
        </div>
      </section>
    </>
  );
}
