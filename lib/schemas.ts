import { z } from 'zod';
import { estUrlYoutube } from './outils';

/** Champ texte facultatif : '' devient null. */
const facultatif = (max: number, message?: string) =>
  z
    .string()
    .trim()
    .max(max, message ?? `${max} caractères maximum.`)
    .transform((v) => (v === '' ? null : v));

const uuid = z.string().uuid('Identifiant invalide.');

export const schemaRessource = z.object({
  title: z.string().trim().min(1, 'Le titre est obligatoire.').max(160, '160 caractères maximum.'),
  description: facultatif(10000),
  youtube_url: facultatif(300).refine((v) => v === null || estUrlYoutube(v), {
    message: 'Ce lien n’est pas une vidéo YouTube (youtube.com/watch?v=… ou youtu.be/…).',
  }),
  category_id: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .refine((v) => v === null || z.string().uuid().safeParse(v).success, { message: 'Catégorie invalide.' }),
  biblical_references: facultatif(300),
  resource_date: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: 'Date invalide.' }),
  is_published: z.boolean(),
});
export type DonneesRessource = z.output<typeof schemaRessource>;

export const schemaCategorie = z.object({
  name: z.string().trim().min(1, 'Le nom est obligatoire.').max(60, '60 caractères maximum.'),
});

const pointFort = z.object({
  titre: z.string().trim().min(1, 'Chaque point fort a besoin d’un titre.').max(60),
  texte: z.string().trim().max(200, '200 caractères maximum par point fort.'),
});

export const schemaReglages = z.object({
  church_name: z.string().trim().min(1, 'Le nom de l’église est obligatoire.').max(100),
  hero_kicker: z.string().trim().max(60),
  hero_title: z.string().trim().min(1, 'Le titre principal est obligatoire.').max(80),
  hero_text: z.string().trim().max(300, '300 caractères maximum.'),
  highlights: z.array(pointFort).max(4),
  meeting_label: z.string().trim().min(1, 'Indiquez le nom de la rencontre.').max(60),
  meeting_day: z.string().trim().min(1, 'Indiquez le jour.').max(30),
  meeting_time: z.string().trim().min(1, 'Indiquez l’heure.').max(30),
  address: z.string().trim().min(1, 'Indiquez au moins le quartier.').max(200),
  address_details: facultatif(300),
  contact_email: facultatif(120).refine((v) => v === null || z.string().email().safeParse(v).success, {
    message: 'Adresse email invalide.',
  }),
  contacts: z
    .array(
      z.object({
        nom: z.string().trim().min(1, 'Indiquez le prénom de chaque contact.').max(40),
        telephone: z.string().trim().regex(/^[\d\s+().-]{6,30}$/, 'Numéro de téléphone invalide.'),
      }),
    )
    .max(4, '4 contacts maximum.'),
  whatsapp_url: facultatif(200).refine(
    (v) => v === null || /^https:\/\/(wa\.me|chat\.whatsapp\.com|api\.whatsapp\.com)\//i.test(v),
    { message: 'Le lien doit commencer par https://wa.me/ ou https://chat.whatsapp.com/' },
  ),
});
export type DonneesReglages = z.output<typeof schemaReglages>;

export const SLUGS_PAGES = ['presentation', 'histoire', 'vision', 'valeurs', 'fonctionnement', 'rejoindre'] as const;
export const schemaPage = z.object({
  slug: z.enum(SLUGS_PAGES),
  title: z.string().trim().min(1, 'Le titre est obligatoire.').max(120),
  content: z.string().trim().max(20000, '20 000 caractères maximum.'),
});

/** Fiche PDF déjà déposée dans Storage par le navigateur : on vérifie le chemin. */
export const schemaFiche = z
  .object({
    resource_id: uuid,
    storage_path: z.string(),
    file_name: z.string().trim().min(1, 'Le nom de la fiche est obligatoire.').max(160),
    size_bytes: z.number().int().positive().max(25 * 1024 * 1024),
  })
  .refine((f) => new RegExp(`^ressources/${f.resource_id}/[0-9a-f-]{36}\\.pdf$`).test(f.storage_path), {
    message: 'Chemin de fichier invalide.',
    path: ['storage_path'],
  });

export const schemaImage = z.object({
  cible: z.enum(['cover', 'hero', 'church', 'join']),
  resource_id: uuid.optional(),
  storage_path: z.string().regex(/^(couvertures|site)\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/, 'Chemin d’image invalide.'),
});

export const schemaContact = z.object({
  nom: z.string().trim().min(2, 'Indiquez votre nom.').max(100, '100 caractères maximum.'),
  email: z.string().trim().email('Adresse email invalide.').max(150),
  message: z.string().trim().min(10, 'Votre message est un peu court (10 caractères minimum).').max(5000, '5 000 caractères maximum.'),
  // Anti-spam : champ invisible qui doit rester vide, et délai minimal de saisie
  site_web: z.string().max(0).optional().default(''),
  ouvert_le: z.coerce.number().int().positive(),
});

/** Erreurs Zod → { champ: message } pour l'affichage sous chaque champ. */
export function erreursParChamp(erreur: z.ZodError): Record<string, string> {
  const res: Record<string, string> = {};
  for (const issue of erreur.issues) {
    const cle = issue.path.join('.') || '_';
    if (!res[cle]) res[cle] = issue.message;
  }
  return res;
}
