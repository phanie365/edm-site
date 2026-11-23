import 'server-only';
import { cache } from 'react';
import { clientPublic } from './supabase/serveur';
import { RESSOURCES_PAR_PAGE } from './env';
import type { PageSite, Reglages, RessourceDetaillee, ResultatRecherche, SlugPage } from './types';

/** Lectures publiques (contenu publié uniquement). Une erreur remonte vers error.tsx. */

export const lireReglages = cache(async (): Promise<Reglages> => {
  const { data, error } = await clientPublic().from('site_settings').select('*').single();
  if (error) throw new Error(`Réglages indisponibles : ${error.message}`);
  return data as Reglages;
});

export const lirePages = cache(async (): Promise<Record<SlugPage, PageSite>> => {
  const { data, error } = await clientPublic().from('site_pages').select('*').order('position');
  if (error) throw new Error(`Pages indisponibles : ${error.message}`);
  return Object.fromEntries((data as PageSite[]).map((p) => [p.slug, p])) as Record<SlugPage, PageSite>;
});

export async function rechercherRessources(options: {
  q?: string;
  page?: number;
  parPage?: number;
}): Promise<{ resultats: ResultatRecherche[]; total: number }> {
  const parPage = options.parPage ?? RESSOURCES_PAR_PAGE;
  const page = Math.max(1, options.page ?? 1);
  const { data, error } = await clientPublic().rpc('rechercher_ressources', {
    p_q: options.q?.slice(0, 100) || null,
    p_limite: parPage,
    p_decalage: (page - 1) * parPage,
  });
  if (error) throw new Error(`Recherche indisponible : ${error.message}`);
  const resultats = (data ?? []) as ResultatRecherche[];
  return { resultats, total: Number(resultats[0]?.total ?? 0) };
}

export const lireRessource = cache(async (slug: string): Promise<RessourceDetaillee | null> => {
  const { data, error } = await clientPublic()
    .from('resources')
    .select('*, files:resource_files(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .order('display_order', { referencedTable: 'resource_files' })
    .maybeSingle();
  if (error) throw new Error(`Ressource indisponible : ${error.message}`);
  return data as RessourceDetaillee | null;
});

/** Pour le sitemap. */
export async function listerSlugsPublies(): Promise<{ slug: string; updated_at: string }[]> {
  const { data, error } = await clientPublic()
    .from('resources')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(5000);
  if (error) return [];
  return data ?? [];
}
