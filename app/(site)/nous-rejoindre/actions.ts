'use server';
import { headers } from 'next/headers';
import { contactConfigure } from '@/lib/env';
import { erreursParChamp, schemaContact } from '@/lib/schemas';

export interface EtatContact {
  statut: 'initial' | 'envoye' | 'erreur';
  message?: string;
  erreurs?: Record<string, string>;
  valeurs?: { nom: string; email: string; message: string };
}

const DELAI_MIN_MS = 3000; // un humain met plus de 3 s à remplir le formulaire
const DELAI_MAX_MS = 1000 * 60 * 60 * 24;

/** Petite limite par adresse IP (mémoire de l'instance serveur : complément, pas une garantie). */
const derniersEnvois = new Map<string, number[]>();
function tropDEnvois(ip: string): boolean {
  const maintenant = Date.now();
  const recents = (derniersEnvois.get(ip) ?? []).filter((t) => maintenant - t < 10 * 60 * 1000);
  recents.push(maintenant);
  derniersEnvois.set(ip, recents);
  return recents.length > 3;
}

const echapper = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function envoyerMessage(_avant: EtatContact | null, formData: FormData): Promise<EtatContact> {
  const valeurs = {
    nom: String(formData.get('nom') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
  };

  if (!contactConfigure()) {
    return { statut: 'erreur', message: 'Le formulaire n’est pas disponible pour le moment. Écrivez-nous directement par email.', valeurs };
  }

  const verif = schemaContact.safeParse({
    ...valeurs,
    site_web: String(formData.get('site_web') ?? ''),
    ouvert_le: formData.get('ouvert_le'),
  });
  if (!verif.success) {
    const erreurs = erreursParChamp(verif.error);
    // Piège anti-robot rempli : on refuse sans détailler
    if (erreurs.site_web || erreurs.ouvert_le) return { statut: 'erreur', message: 'Le message n’a pas pu être envoyé.', valeurs };
    return { statut: 'erreur', message: 'Merci de corriger les champs indiqués.', erreurs, valeurs };
  }

  const ecoule = Date.now() - verif.data.ouvert_le;
  if (ecoule < DELAI_MIN_MS || ecoule > DELAI_MAX_MS) {
    return { statut: 'erreur', message: 'Le message n’a pas pu être envoyé. Rechargez la page et réessayez.', valeurs };
  }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnue';
  if (tropDEnvois(ip)) {
    return { statut: 'erreur', message: 'Trop de messages envoyés. Réessayez dans quelques minutes.', valeurs };
  }

  const { nom, email, message } = verif.data;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL,
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `Message du site – ${nom}`,
        text: `Nom : ${nom}\nEmail : ${email}\n\n${message}`,
        html: `<p><strong>Nom :</strong> ${echapper(nom)}<br><strong>Email :</strong> ${echapper(email)}</p><p style="white-space:pre-wrap">${echapper(message)}</p>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('Envoi du formulaire refusé par Resend', res.status, await res.text().catch(() => ''));
      return { statut: 'erreur', message: 'Le message n’a pas pu être envoyé. Réessayez plus tard ou écrivez-nous par email.', valeurs };
    }
  } catch (e) {
    console.error('Envoi du formulaire impossible', e);
    return { statut: 'erreur', message: 'Le message n’a pas pu être envoyé (problème de connexion). Réessayez plus tard.', valeurs };
  }

  // Succès UNIQUEMENT après la confirmation du service d'envoi
  return { statut: 'envoye', message: 'Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.' };
}
