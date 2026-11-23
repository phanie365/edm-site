'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AccesRefuse, exigerAdminAction } from '@/lib/auth';
import { BUCKET_FICHES, BUCKET_IMAGES } from '@/lib/env';
import { slugifier } from '@/lib/outils';
import {
  erreursParChamp,
  schemaCategorie,
  schemaFiche,
  schemaImage,
  schemaRessource,
} from '@/lib/schemas';
import { clientSession } from '@/lib/supabase/serveur';

export interface Resultat {
  ok: boolean;
  message: string;
  erreurs?: Record<string, string>;
}
const OK = (message: string): Resultat => ({ ok: true, message });
const KO = (message: string, erreurs?: Record<string, string>): Resultat => ({ ok: false, message, erreurs });

/** Message clair à partir d'une erreur technique. */
function traduire(e: unknown): string {
  if (e instanceof AccesRefuse) return 'Action refusée : vous devez être connecté avec un compte administrateur.';
  const err = e as { message?: string; code?: string } | null;
  const m = (err?.message ?? '').toLowerCase();
  if (m.includes('row-level security') || err?.code === '42501') return 'Action refusée par la base de données (droits insuffisants).';
  if (m.includes('duplicate') || err?.code === '23505') return 'Cet élément existe déjà (nom ou adresse en double).';
  if (m.includes('youtube_url')) return 'Le lien doit être une adresse YouTube.';
  if (m.includes('fetch failed') || m.includes('network')) return 'Le serveur de données ne répond pas. Réessayez dans un instant.';
  return `Une erreur est survenue${err?.message ? ` : ${err.message}` : '.'}`;
}

/** Vide le cache de navigation : les pages déjà ouvertes affichent la nouvelle version. */
function rafraichirSite() {
  revalidatePath('/', 'layout');
}

/* =========================== Connexion =========================== */

export async function seConnecter(_avant: Resultat | null, formData: FormData): Promise<Resultat> {
  const donnees = z
    .object({ email: z.string().trim().email('Email invalide.'), motDePasse: z.string().min(1, 'Mot de passe requis.') })
    .safeParse({ email: formData.get('email'), motDePasse: formData.get('motDePasse') });
  if (!donnees.success) return KO('Vérifiez les champs.', erreursParChamp(donnees.error));

  const supabase = await clientSession();
  const { data, error } = await supabase.auth.signInWithPassword({ email: donnees.data.email, password: donnees.data.motDePasse });
  if (error || !data.user) {
    const m = error?.message.toLowerCase() ?? '';
    if (m.includes('invalid login')) return KO('Email ou mot de passe incorrect.');
    if (m.includes('rate') || error?.status === 429) return KO('Trop de tentatives. Patientez quelques minutes.');
    return KO('Connexion impossible pour le moment.');
  }
  const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return KO('Ce compte n’a pas accès à l’administration.');
  }
  redirect('/admin');
}

export async function seDeconnecter() {
  const supabase = await clientSession();
  await supabase.auth.signOut();
  redirect('/admin/connexion');
}

/* =========================== Ressources =========================== */

async function slugUnique(supabase: Awaited<ReturnType<typeof clientSession>>, titre: string, sauf?: string) {
  const base = slugifier(titre) || 'ressource';
  for (let i = 1; i < 50; i++) {
    const essai = i === 1 ? base : `${base}-${i}`;
    let q = supabase.from('resources').select('id').eq('slug', essai);
    if (sauf) q = q.neq('id', sauf);
    const { data } = await q.maybeSingle();
    if (!data) return essai;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function enregistrerRessource(_avant: Resultat | null, formData: FormData): Promise<Resultat> {
  const id = String(formData.get('id') ?? '') || undefined;
  const verif = schemaRessource.safeParse({
    title: formData.get('title') ?? '',
    description: formData.get('description') ?? '',
    youtube_url: formData.get('youtube_url') ?? '',
    category_id: formData.get('category_id') ?? '',
    biblical_references: formData.get('biblical_references') ?? '',
    resource_date: formData.get('resource_date') ?? '',
    is_published: formData.get('is_published') === 'on',
  });
  if (!verif.success) return KO('Merci de corriger les champs indiqués.', erreursParChamp(verif.error));

  let nouvelId: string | undefined;
  try {
    const { supabase } = await exigerAdminAction();
    if (id) {
      if (!z.string().uuid().safeParse(id).success) return KO('Ressource inconnue.');
      const { error } = await supabase.from('resources').update(verif.data).eq('id', id);
      if (error) throw error;
    } else {
      const slug = await slugUnique(supabase, verif.data.title);
      const { data, error } = await supabase.from('resources').insert({ ...verif.data, slug }).select('id').single();
      if (error) throw error;
      nouvelId = data.id as string;
    }
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  if (nouvelId) redirect(`/admin/ressources/${nouvelId}?cree=1`);
  return OK(verif.data.is_published ? 'Ressource enregistrée et visible sur le site.' : 'Ressource enregistrée (non publiée).');
}

export async function basculerPublication(id: string, publier: boolean): Promise<Resultat> {
  try {
    const { supabase } = await exigerAdminAction();
    const { error } = await supabase.from('resources').update({ is_published: publier }).eq('id', z.string().uuid().parse(id));
    if (error) throw error;
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK(publier ? 'Ressource publiée.' : 'Ressource retirée du site.');
}

export async function supprimerRessource(id: string): Promise<Resultat> {
  try {
    const { supabase } = await exigerAdminAction();
    const idValide = z.string().uuid().parse(id);
    const { data: r, error: e1 } = await supabase
      .from('resources')
      .select('cover_path, files:resource_files(storage_path)')
      .eq('id', idValide)
      .single();
    if (e1) throw e1;
    // Fichiers d'abord (sinon ils resteraient orphelins dans le stockage)
    const pdfs = ((r.files ?? []) as { storage_path: string }[]).map((f) => f.storage_path);
    if (pdfs.length) {
      const { error } = await supabase.storage.from(BUCKET_FICHES).remove(pdfs);
      if (error) throw error;
    }
    if (r.cover_path) await supabase.storage.from(BUCKET_IMAGES).remove([r.cover_path]);
    const { error: e2 } = await supabase.from('resources').delete().eq('id', idValide);
    if (e2) throw e2;
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  redirect('/admin/ressources?supprimee=1');
}

/* =========================== Fiches PDF =========================== */

/** Vérifie dans Storage que le fichier existe bien et que c'est un PDF ; renvoie sa taille réelle. */
async function verifierObjetPdf(supabase: Awaited<ReturnType<typeof clientSession>>, chemin: string) {
  const dossier = chemin.slice(0, chemin.lastIndexOf('/'));
  const nom = chemin.slice(chemin.lastIndexOf('/') + 1);
  const { data, error } = await supabase.storage.from(BUCKET_FICHES).list(dossier, { search: nom, limit: 1 });
  if (error) throw error;
  const objet = data?.find((o) => o.name === nom);
  if (!objet) throw new Error('Le fichier déposé est introuvable. Réessayez.');
  const meta = (objet.metadata ?? {}) as { mimetype?: string; size?: number };
  if (meta.mimetype && meta.mimetype !== 'application/pdf') throw new Error('Seuls les fichiers PDF sont acceptés.');
  return typeof meta.size === 'number' ? meta.size : null;
}

export async function ajouterFiche(entree: z.input<typeof schemaFiche>): Promise<Resultat> {
  const verif = schemaFiche.safeParse(entree);
  if (!verif.success) return KO(verif.error.issues[0]?.message ?? 'Données invalides.');
  try {
    const { supabase } = await exigerAdminAction();
    const taille = await verifierObjetPdf(supabase, verif.data.storage_path);
    const { data: dernier } = await supabase
      .from('resource_files')
      .select('display_order')
      .eq('resource_id', verif.data.resource_id)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase.from('resource_files').insert({
      resource_id: verif.data.resource_id,
      storage_path: verif.data.storage_path,
      file_name: verif.data.file_name,
      size_bytes: taille ?? verif.data.size_bytes,
      display_order: (dernier?.display_order ?? 0) + 1,
    });
    if (error) {
      await supabase.storage.from(BUCKET_FICHES).remove([verif.data.storage_path]);
      throw error;
    }
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK(`« ${verif.data.file_name} » ajoutée.`);
}

export async function renommerFiche(id: string, nom: string): Promise<Resultat> {
  const verif = z.object({ id: z.string().uuid(), nom: z.string().trim().min(1, 'Le nom est obligatoire.').max(160) }).safeParse({ id, nom });
  if (!verif.success) return KO(verif.error.issues[0]?.message ?? 'Nom invalide.');
  try {
    const { supabase } = await exigerAdminAction();
    const { error } = await supabase.from('resource_files').update({ file_name: verif.data.nom }).eq('id', verif.data.id);
    if (error) throw error;
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK('Nom de la fiche enregistré.');
}

export async function remplacerFiche(id: string, nouveauChemin: string, tailleClient: number): Promise<Resultat> {
  try {
    const { supabase } = await exigerAdminAction();
    const { data: f, error: e1 } = await supabase.from('resource_files').select('*').eq('id', z.string().uuid().parse(id)).single();
    if (e1) throw e1;
    const verif = schemaFiche.safeParse({ resource_id: f.resource_id, storage_path: nouveauChemin, file_name: f.file_name, size_bytes: tailleClient });
    if (!verif.success) return KO(verif.error.issues[0]?.message ?? 'Fichier invalide.');
    const taille = await verifierObjetPdf(supabase, nouveauChemin);
    const { error } = await supabase.from('resource_files').update({ storage_path: nouveauChemin, size_bytes: taille ?? tailleClient }).eq('id', f.id);
    if (error) throw error;
    await supabase.storage.from(BUCKET_FICHES).remove([f.storage_path]);
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK('PDF remplacé.');
}

export async function supprimerFiche(id: string): Promise<Resultat> {
  try {
    const { supabase } = await exigerAdminAction();
    const { data: f, error: e1 } = await supabase.from('resource_files').select('storage_path').eq('id', z.string().uuid().parse(id)).single();
    if (e1) throw e1;
    const { error: e2 } = await supabase.storage.from(BUCKET_FICHES).remove([f.storage_path]);
    if (e2) throw e2;
    const { error } = await supabase.from('resource_files').delete().eq('id', id);
    if (error) throw error;
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK('Fiche supprimée.');
}

export async function reordonnerFiches(ressourceId: string, ids: string[]): Promise<Resultat> {
  const verif = z.object({ r: z.string().uuid(), ids: z.array(z.string().uuid()).max(100) }).safeParse({ r: ressourceId, ids });
  if (!verif.success) return KO('Ordre invalide.');
  try {
    const { supabase } = await exigerAdminAction();
    const { error } = await supabase.rpc('reordonner_fiches', { p_ressource: verif.data.r, p_ids: verif.data.ids });
    if (error) throw error;
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK('Ordre des fiches enregistré.');
}

/* =========================== Image de couverture =========================== */

/** Associe (ou retire, si chemin null) l'image de couverture d'une ressource, déjà déposée dans Storage. */
export async function definirCouverture(ressourceId: string, chemin: string | null): Promise<Resultat> {
  if (chemin !== null) {
    const verif = schemaImage.safeParse({ resource_id: ressourceId, storage_path: chemin });
    if (!verif.success) return KO(verif.error.issues[0]?.message ?? 'Image invalide.');
  }
  try {
    const { supabase } = await exigerAdminAction();
    const id = z.string().uuid().parse(ressourceId);
    const { data } = await supabase.from('resources').select('cover_path').eq('id', id).single();
    const ancien = data?.cover_path ?? null;
    const { error } = await supabase.from('resources').update({ cover_path: chemin }).eq('id', id);
    if (error) throw error;
    if (ancien && ancien !== chemin) await supabase.storage.from(BUCKET_IMAGES).remove([ancien]);
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK(chemin ? 'Image enregistrée.' : 'Image retirée.');
}

/* =========================== Catégories =========================== */

export async function ajouterCategorie(_avant: Resultat | null, formData: FormData): Promise<Resultat> {
  const verif = schemaCategorie.safeParse({ name: formData.get('name') ?? '' });
  if (!verif.success) return KO('Nom invalide.', erreursParChamp(verif.error));
  try {
    const { supabase } = await exigerAdminAction();
    const { count } = await supabase.from('categories').select('id', { count: 'exact', head: true });
    const { error } = await supabase
      .from('categories')
      .insert({ name: verif.data.name, slug: slugifier(verif.data.name) || `categorie-${Date.now()}`, position: (count ?? 0) + 1 });
    if (error) throw error;
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK(`Catégorie « ${verif.data.name} » ajoutée.`);
}

export async function renommerCategorie(id: string, nom: string): Promise<Resultat> {
  const verif = schemaCategorie.safeParse({ name: nom });
  if (!verif.success) return KO(verif.error.issues[0]?.message ?? 'Nom invalide.');
  try {
    const { supabase } = await exigerAdminAction();
    const { error } = await supabase.from('categories').update({ name: verif.data.name }).eq('id', z.string().uuid().parse(id));
    if (error) throw error;
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK('Catégorie renommée.');
}

export async function supprimerCategorie(id: string): Promise<Resultat> {
  try {
    const { supabase } = await exigerAdminAction();
    const { error } = await supabase.from('categories').delete().eq('id', z.string().uuid().parse(id));
    if (error) throw error;
  } catch (e) {
    return KO(traduire(e));
  }
  rafraichirSite();
  return OK('Catégorie supprimée. Les ressources concernées n’ont plus de catégorie.');
}
