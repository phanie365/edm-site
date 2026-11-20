/** Variables d'environnement publiques (lisibles dans le navigateur). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const configurationSupabaseOk = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Le formulaire de contact n'est affiché que si l'envoi est réellement configuré (serveur uniquement). */
export function contactConfigure(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL);
}

export const BUCKET_FICHES = 'fiches';
export const BUCKET_IMAGES = 'images';
export const TAILLE_MAX_PDF = 25 * 1024 * 1024;
export const TAILLE_MAX_IMAGE = 5 * 1024 * 1024;
export const RESSOURCES_PAR_PAGE = 12;
