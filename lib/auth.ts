import 'server-only';
import { redirect } from 'next/navigation';
import { clientSession } from './supabase/serveur';

/** Erreur levée quand une action est tentée sans droits d'administration. */
export class AccesRefuse extends Error {
  constructor() {
    super('Accès réservé aux administrateurs.');
  }
}

/**
 * Vérifie côté serveur que la personne est connectée ET administratrice.
 * getUser() valide le jeton auprès de Supabase (pas seulement le cookie).
 */
export async function administrateurConnecte() {
  const supabase = await clientSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, estAdmin: false } as const;
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  return { supabase, user, estAdmin: Boolean(data) } as const;
}

/** Pour les pages de l'admin : redirige vers la connexion si besoin. */
export async function exigerAdminPage() {
  const r = await administrateurConnecte();
  if (!r.user) redirect('/admin/connexion');
  if (!r.estAdmin) redirect('/admin/connexion?refus=1');
  return r;
}

/** Pour les actions serveur : lève une erreur si la personne n'est pas administratrice. */
export async function exigerAdminAction() {
  const r = await administrateurConnecte();
  if (!r.user || !r.estAdmin) throw new AccesRefuse();
  return r;
}
