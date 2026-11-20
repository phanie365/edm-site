/**
 * Tâche planifiée Vercel (vercel.json > crons) : une lecture par jour sur Supabase
 * pour éviter la mise en pause du projet gratuit après 7 jours d'inactivité.
 * Vercel envoie « Authorization: Bearer <CRON_SECRET> » quand la variable existe.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ ok: false, erreur: 'Non autorisé' }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !cle) return Response.json({ ok: false, erreur: 'Variables Supabase manquantes' }, { status: 500 });
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/site_settings?select=church_name&limit=1`, {
      headers: { apikey: cle, Authorization: `Bearer ${cle}` },
      cache: 'no-store',
    });
    return Response.json({ ok: res.ok, statut: res.status, date: new Date().toISOString() }, { status: res.ok ? 200 : 502 });
  } catch (e) {
    return Response.json({ ok: false, erreur: String(e) }, { status: 502 });
  }
}
