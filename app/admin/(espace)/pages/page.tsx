import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TitreAdmin } from '@/components/admin/Retour';
import { exigerAdminPage } from '@/lib/auth';
import { extrait, ilYa } from '@/lib/outils';
import type { PageSite } from '@/lib/types';

export const metadata: Metadata = { title: 'Pages du site' };

const OU: Record<string, string> = {
  presentation: 'Accueil (« Qui sommes-nous ») et fenêtre « En savoir plus »',
  histoire: 'Fenêtre « En savoir plus » de l’accueil',
  vision: 'Accueil (carte « Notre vision ») et fenêtre « En savoir plus »',
  valeurs: 'Fenêtre « En savoir plus » de l’accueil',
  fonctionnement: 'Fenêtre « En savoir plus » de l’accueil',
  rejoindre: 'Page « Nous rejoindre »',
};

export default async function PagesDuSite() {
  const { supabase } = await exigerAdminPage();
  const { data } = await supabase.from('site_pages').select('*').order('position');
  const pages = (data ?? []) as PageSite[];
  return (
    <>
      <TitreAdmin titre="Pages du site" sousTitre="Les textes de présentation : histoire, vision, valeurs, fonctionnement…" />
      <ul className="carte divide-y divide-bordure">
        {pages.map((p) => {
          const provisoire = p.content.toLowerCase().includes('texte provisoire');
          return (
            <li key={p.slug}>
              <Link href={`/admin/pages/${p.slug}`} className="flex min-h-20 items-center gap-4 p-5 hover:bg-papier">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {p.title}
                    {provisoire && <span className="rounded-full border border-bordure-forte px-2.5 py-0.5 text-xs font-semibold text-encre-3">À compléter</span>}
                  </p>
                  <p className="text-sm text-encre-2">
                    {OU[p.slug]} · modifié {ilYa(p.updated_at)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-encre-3">{extrait(p.content, 120) || 'Vide : la section n’apparaît pas.'}</p>
                </div>
                <ChevronRight aria-hidden size={20} className="text-encre-2" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
