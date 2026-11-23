/**
 * Vérifie la sécurité de la base (Row Level Security) et du stockage.
 *
 *   SUPABASE_URL=… SUPABASE_ANON_KEY=… node scripts/test-rls.mjs
 * Facultatif :
 *   ADMIN_EMAIL / ADMIN_PASSWORD → compte administrateur (doit pouvoir écrire)
 *   USER_EMAIL / USER_PASSWORD   → compte connecté NON administrateur (ne doit rien pouvoir modifier)
 *
 * Les tests admin créent puis suppriment une ressource « test-rls-… » et un petit PDF.
 */
import { createClient } from '@supabase/supabase-js';

const URL_ = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!URL_ || !CLE) {
  console.error('Renseignez SUPABASE_URL et SUPABASE_ANON_KEY.');
  process.exit(1);
}
let echecs = 0;
const ok = (nom, cond, detail = '') => {
  if (!cond) echecs++;
  console.log(`${cond ? 'OK   ' : 'ÉCHEC'}  ${nom}${detail ? `  (${detail})` : ''}`);
};
const client = () => createClient(URL_, CLE, { auth: { persistSession: false, autoRefreshToken: false } });
const refuse = (r) => Boolean(r.error) || (r.data ?? []).length === 0;
const PDF = new Blob(['%PDF-1.4\n%test\n'], { type: 'application/pdf' });

async function ecrituresInterdites(sb, qui) {
  const { data: r } = await sb.from('resources').select('id').limit(1).maybeSingle();
  ok(`${qui} : créer une ressource est refusé`, refuse(await sb.from('resources').insert({ title: 'x', slug: `pirate-${Date.now()}` }).select()));
  ok(`${qui} : modifier les réglages est refusé`, refuse(await sb.from('site_settings').update({ address: 'PIRATÉ' }).eq('id', true).select()));
  ok(`${qui} : modifier une page est refusé`, refuse(await sb.from('site_pages').update({ content: 'PIRATÉ' }).eq('slug', 'vision').select()));
  if (r) {
    ok(`${qui} : modifier une ressource est refusé`, refuse(await sb.from('resources').update({ title: 'PIRATÉ' }).eq('id', r.id).select()));
    ok(`${qui} : supprimer une ressource est refusé`, refuse(await sb.from('resources').delete().eq('id', r.id).select()));
    ok(`${qui} : supprimer des fiches est refusé`, refuse(await sb.from('resource_files').delete().eq('resource_id', r.id).select()));
    ok(`${qui} : réordonner des fiches est refusé`, Boolean((await sb.rpc('reordonner_fiches', { p_ressource: r.id, p_ids: [] })).error));
  }
  ok(`${qui} : s'ajouter administrateur est refusé`, Boolean((await sb.from('admins').insert({ user_id: '00000000-0000-0000-0000-000000000001' })).error));
  for (const bucket of ['fiches', 'images']) {
    const up = await sb.storage.from(bucket).upload(`test-rls/${Date.now()}.pdf`, PDF, { contentType: 'application/pdf' });
    ok(`${qui} : déposer un fichier dans « ${bucket} » est refusé`, Boolean(up.error));
  }
}

console.log('\n— Visiteur sans compte —');
{
  const sb = client();
  const res = await sb.from('resources').select('is_published');
  ok('visiteur : ne voit que les ressources publiées', !res.error && res.data.every((x) => x.is_published), `${res.data?.length ?? 0} visibles`);
  const rech = await sb.rpc('rechercher_ressources', { p_q: null, p_limite: 48, p_decalage: 0 });
  ok('visiteur : la recherche fonctionne', !rech.error, rech.error?.message);
  ok('visiteur : lit les réglages et les pages', !(await sb.from('site_settings').select('*').single()).error && !(await sb.from('site_pages').select('*')).error);
  ok('visiteur : la table admins est invisible', ((await sb.from('admins').select('*')).data ?? []).length === 0);
  await ecrituresInterdites(sb, 'visiteur');
}

if (process.env.USER_EMAIL) {
  console.log('\n— Compte connecté NON administrateur —');
  const sb = client();
  const { error } = await sb.auth.signInWithPassword({ email: process.env.USER_EMAIL, password: process.env.USER_PASSWORD });
  ok('non-admin : connexion', !error, error?.message);
  if (!error) {
    ok('non-admin : ne voit pas les brouillons', ((await sb.from('resources').select('is_published')).data ?? []).every((x) => x.is_published));
    await ecrituresInterdites(sb, 'non-admin');
  }
}

if (process.env.ADMIN_EMAIL) {
  console.log('\n— Administrateur —');
  const sb = client();
  const { error } = await sb.auth.signInWithPassword({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  ok('admin : connexion', !error, error?.message);
  if (!error) {
    const ins = await sb.from('resources').insert({ title: 'Test RLS', slug: `test-rls-${Date.now()}` }).select().single();
    ok('admin : crée une ressource', !ins.error, ins.error?.message);
    if (ins.data) {
      ok('admin : voit les brouillons', ((await sb.from('resources').select('id').eq('is_published', false)).data ?? []).length > 0);
      ok('admin : refus d’un lien non YouTube', Boolean((await sb.from('resources').update({ youtube_url: 'https://vimeo.com/1' }).eq('id', ins.data.id)).error));
      const chemin = `ressources/${ins.data.id}/${crypto.randomUUID()}.pdf`;
      const up = await sb.storage.from('fiches').upload(chemin, PDF, { contentType: 'application/pdf' });
      ok('admin : dépose un PDF', !up.error, up.error?.message);
      const f = await sb.from('resource_files').insert({ resource_id: ins.data.id, file_name: 'Fiche test', storage_path: chemin }).select().single();
      ok('admin : enregistre la fiche', !f.error, f.error?.message);
      const lu = await fetch(sb.storage.from('fiches').getPublicUrl(chemin).data.publicUrl);
      ok('le PDF est lisible publiquement', lu.ok, String(lu.status));
      const txt = await sb.storage.from('fiches').upload(`ressources/${ins.data.id}/x.txt`, new Blob(['x']), { contentType: 'text/plain' });
      ok('admin : un fichier non PDF est refusé', Boolean(txt.error));
      ok('admin : supprime le PDF', !(await sb.storage.from('fiches').remove([chemin])).error);
      const del = await sb.from('resources').delete().eq('id', ins.data.id).select();
      ok('admin : supprime la ressource (et ses fiches)', !del.error && del.data.length === 1);
      ok('suppression en cascade des fiches', ((await sb.from('resource_files').select('id').eq('resource_id', ins.data.id)).data ?? []).length === 0);
    }
  }
}

console.log(echecs ? `\n${echecs} test(s) en échec.` : '\nTous les tests de sécurité sont passés.');
process.exit(echecs ? 1 : 0);
