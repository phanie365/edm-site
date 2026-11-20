import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../env';


/**
 * Client lié à la session (cookies) : pour l'administration.
 * Les règles RLS s'appliquent avec les droits de la personne connectée.
 */
export async function clientSession() {
  const magasin = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => magasin.getAll(),
      setAll: (aEcrire) => {
        try {
          aEcrire.forEach(({ name, value, options }) => magasin.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : sans effet, proxy.ts rafraîchit la session.
        }
      },
    },
  });
}

/**
 * Client anonyme sans cookies : pour les pages publiques.
 * Ne voit que le contenu publié.
 */
export function clientPublic() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // Lecture à chaque visite (pas de cache) : le site est toujours à jour après une modification.
    global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) },
  });
}
