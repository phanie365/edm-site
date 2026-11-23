import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { BoutonSupprimerRessource } from '@/components/admin/BoutonSupprimerRessource';
import { ChoixImage } from '@/components/admin/ChoixImage';
import { FormulaireRessource } from '@/components/admin/FormulaireRessource';
import { GestionFiches } from '@/components/admin/GestionFiches';
import { Retour, TitreAdmin } from '@/components/admin/Retour';
import { exigerAdminPage } from '@/lib/auth';
import type { Categorie, FichePdf, Ressource } from '@/lib/types';

export const metadata: Metadata = { title: 'Modifier une ressource' };

export default async function ModifierRessource({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cree?: string }>;
}) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await exigerAdminPage();
  const [{ data: r }, { data: fiches }, { data: categories }] = await Promise.all([
    supabase.from('resources').select('*').eq('id', id).maybeSingle(),
    supabase.from('resource_files').select('*').eq('resource_id', id).order('display_order'),
    supabase.from('categories').select('*').order('position').order('name'),
  ]);
  if (!r) notFound();
  const ressource = r as Ressource;

  return (
    <>
      <Link href="/admin/ressources" className="mb-4 -ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:bg-papier-2">
        <ArrowLeft aria-hidden size={18} /> Ressources
      </Link>
      <TitreAdmin
        titre={ressource.title}
        sousTitre={ressource.is_published ? 'Publiée : visible sur le site.' : 'Brouillon : invisible pour les visiteurs.'}
        action={
          ressource.is_published ? (
            <Link href={`/bibliotheque/${ressource.slug}`} target="_blank" className="bouton bouton-contour bouton-petit">
              <ExternalLink aria-hidden size={16} /> Voir sur le site<span className="sr-only"> (nouvel onglet)</span>
            </Link>
          ) : undefined
        }
      />
      {cree && <Retour resultat={{ ok: true, message: 'Ressource créée. Ajoutez maintenant les fiches PDF et une image si besoin.' }} className="mb-6" />}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <FormulaireRessource ressource={ressource} categories={(categories ?? []) as Categorie[]} />
        <div className="space-y-6">
          <GestionFiches ressourceId={ressource.id} fiches={(fiches ?? []) as FichePdf[]} />
          <section className="carte p-5 sm:p-7">
            <ChoixImage
              ressourceId={ressource.id}
              chemin={ressource.cover_path}
              titre="Image de couverture"
              aide="Facultatif. JPEG, PNG ou WebP, 5 Mo maximum. Sans image, la miniature YouTube est utilisée."
            />
          </section>
          <section className="carte border-erreur/40 p-5 sm:p-7">
            <h2 className="text-lg font-bold">Supprimer la ressource</h2>
            <p className="mt-1 mb-4 text-sm text-encre-3">Supprime aussi toutes ses fiches PDF et son image. Cette action est définitive.</p>
            <BoutonSupprimerRessource id={ressource.id} titre={ressource.title} />
          </section>
        </div>
      </div>
    </>
  );
}
