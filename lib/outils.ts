/** Petites fonctions sans dépendance, testées dans tests/outils.test.ts */

/** « La Sainte-Cène : 1re partie » → « la-sainte-cene-1re-partie » */
export function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/g, '');
}

/** Identifiant d'une vidéo YouTube (watch, youtu.be, shorts, live, embed), sinon null. */
export function idYoutube(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    const hote = u.hostname.replace(/^(www\.|m\.)/, '');
    let id: string | null = null;
    if (hote === 'youtu.be') id = u.pathname.slice(1).split('/')[0] ?? null;
    else if (hote === 'youtube.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else id = /^\/(shorts|live|embed)\/([\w-]+)/.exec(u.pathname)?.[2] ?? null;
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const estUrlYoutube = (url: string) => idYoutube(url) !== null;

/** Taille lisible : 1 234 567 → « 1,2 Mo » */
export function tailleLisible(octets: number | null | undefined): string {
  if (!octets || octets <= 0) return '';
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;
}

/** « 2026-11-15 » → « 15 novembre 2026 » (sans décalage de fuseau) */
export function dateLongue(iso: string | null | undefined): string {
  if (!iso) return '';
  const [a, m, j] = iso.slice(0, 10).split('-').map(Number);
  if (!a || !m || !j) return '';
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(a, m - 1, j)),
  );
}

/** Temps écoulé en mots : « il y a 2 jours » */
export function ilYa(iso: string, maintenant = new Date()): string {
  const s = Math.max(0, (maintenant.getTime() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });
  if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), 'minute');
  if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
  if (s < 86400 * 7) return rtf.format(-Math.round(s / 86400), 'day');
  if (s < 86400 * 31) return rtf.format(-Math.round(s / (86400 * 7)), 'week');
  if (s < 86400 * 365) return rtf.format(-Math.round(s / (86400 * 30)), 'month');
  return rtf.format(-Math.round(s / (86400 * 365)), 'year');
}

/** Coupe un texte proprement pour un aperçu. */
export function extrait(texte: string | null | undefined, max = 160): string {
  if (!texte) return '';
  const t = texte.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const coupe = t.slice(0, max);
  return `${coupe.slice(0, Math.max(coupe.lastIndexOf(' '), max - 20)).trim()}…`;
}

export type BlocTexte = { type: 'paragraphe'; texte: string } | { type: 'liste'; elements: string[] };

/**
 * Transforme un texte saisi dans l'admin en blocs :
 * une ligne vide sépare les paragraphes, les lignes « - » forment une liste.
 * (Aucun HTML n'est interprété : pas de risque d'injection.)
 */
export function blocsDeTexte(texte: string | null | undefined): BlocTexte[] {
  if (!texte) return [];
  return texte
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((bloc) => bloc.trim())
    .filter(Boolean)
    .map((bloc): BlocTexte => {
      const lignes = bloc.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lignes.every((l) => /^[-•*]\s+/.test(l))) {
        return { type: 'liste', elements: lignes.map((l) => l.replace(/^[-•*]\s+/, '')) };
      }
      return { type: 'paragraphe', texte: lignes.join(' ') };
    });
}

/** Lien d'itinéraire universel (ouvre Plans / Google Maps selon l'appareil). */
export const lienItineraire = (adresse: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`;

/** Lien « tel: » à partir d'un numéro saisi librement. */
export const lienTelephone = (tel: string) => `tel:${tel.replace(/[^\d+]/g, '')}`;

/** Domaine interne des identifiants : « clotilde » devient « clotilde@edm-republique.local ». */
export const DOMAINE_IDENTIFIANTS = 'edm-republique.local';

/**
 * Transforme ce qui est tapé dans « Identifiant » en email Supabase.
 * Un email complet est gardé tel quel ; un nom d'utilisateur reçoit le domaine interne.
 * Renvoie null si l'identifiant n'est pas valide.
 */
export function emailDepuisIdentifiant(saisie: string): string | null {
  const v = saisie.trim().toLowerCase();
  if (v.includes('@')) return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? v : null;
  return /^[a-z0-9][a-z0-9._-]{1,39}$/.test(v) ? `${v}@${DOMAINE_IDENTIFIANTS}` : null;
}
