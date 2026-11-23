export interface Categorie {
  id: string;
  name: string;
  slug: string;
  position: number;
}

export interface FichePdf {
  id: string;
  resource_id: string;
  file_name: string;
  storage_path: string;
  size_bytes: number | null;
  display_order: number;
}

export interface Ressource {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  youtube_url: string | null;
  category_id: string | null;
  cover_path: string | null;
  biblical_references: string | null;
  resource_date: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface RessourceDetaillee extends Ressource {
  category: Pick<Categorie, 'name' | 'slug'> | null;
  files: FichePdf[];
}

/** Ligne renvoyée par la fonction SQL rechercher_ressources */
export interface ResultatRecherche {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  youtube_url: string | null;
  cover_path: string | null;
  biblical_references: string | null;
  resource_date: string | null;
  created_at: string;
  category_name: string | null;
  category_slug: string | null;
  nb_fiches: number;
  total: number;
}

export interface PointFort {
  titre: string;
  texte: string;
}

export interface ContactPersonne {
  nom: string;
  telephone: string;
}

export interface Reglages {
  church_name: string;
  hero_kicker: string;
  hero_title: string;
  hero_text: string;
  highlights: PointFort[];
  hero_image_path: string | null;
  church_image_path: string | null;
  join_image_path: string | null;
  meeting_label: string;
  meeting_day: string;
  meeting_time: string;
  address: string;
  address_details: string | null;
  contact_email: string | null;
  contacts: ContactPersonne[];
  whatsapp_url: string | null;
  updated_at?: string;
}

export type SlugPage = 'presentation' | 'histoire' | 'vision' | 'valeurs' | 'fonctionnement' | 'rejoindre';

export interface PageSite {
  slug: SlugPage;
  title: string;
  content: string;
  position: number;
  updated_at: string;
}
