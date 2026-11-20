import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { FormulairePage } from '@/components/admin/FormulairePage';
import { TitreAdmin } from '@/components/admin/Retour';
import { exigerAdminPage } from '@/lib/auth';
import { SLUGS_PAGES } from '@/lib/schemas';
import type { PageSite } from '@/lib/types';

export const metadata: Metadata = { title: 'Modifier un texte' };

export default async function ModifierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(SLUGS_PAGES as readonly string[]).includes(slug)) notFound();
  const { supabase } = await exigerAdminPage();
  const { data } = await supabase.from('site_pages').select('*').eq('slug', slug).maybeSingle();
  if (!data) notFound();
  const page = data as PageSite;
  return (
    <>
      <Link href="/admin/pages" className="mb-4 -ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:bg-papier-2">
        <ArrowLeft aria-hidden size={18} /> Pages du site
      </Link>
      <TitreAdmin titre={page.title} />
      <FormulairePage page={page} />
    </>
  );
}
