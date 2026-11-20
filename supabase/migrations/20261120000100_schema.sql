-- =====================================================================
-- EDM République Villeurbanne – site vitrine
-- 1/3 : tables
-- =====================================================================

create extension if not exists unaccent with schema extensions;

-- Texte en minuscules, sans accents (pour la recherche). « immutable » pour
-- pouvoir servir dans une colonne générée.
create function public.sans_accents(t text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(t, '')))
$$;

-- ---------- Administrateurs ----------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- Catégories ----------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (btrim(name) <> '' and length(name) <= 60),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Ressources (prédication, enseignement, fiche…) ----------
create table public.resources (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null check (btrim(title) <> '' and length(title) <= 160),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  description         text check (description is null or length(description) <= 10000),
  youtube_url         text check (youtube_url is null or youtube_url ~* '^https://(www\.|m\.)?(youtube\.com|youtu\.be)/'),
  category_id         uuid references public.categories (id) on delete set null,
  cover_path          text,                        -- chemin dans le bucket « images »
  biblical_references text check (biblical_references is null or length(biblical_references) <= 300),
  resource_date       date,                        -- date de la prédication (facultative)
  is_published        boolean not null default false,
  search_text         text generated always as (
                        public.sans_accents(title || ' ' || coalesce(description, '') || ' ' || coalesce(biblical_references, ''))
                      ) stored,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index resources_publiees_idx on public.resources (is_published, resource_date desc nulls last, created_at desc);
create index resources_categorie_idx on public.resources (category_id);

-- ---------- Fiches PDF d'une ressource ----------
create table public.resource_files (
  id            uuid primary key default gen_random_uuid(),
  resource_id   uuid not null references public.resources (id) on delete cascade,
  file_name     text not null check (btrim(file_name) <> '' and length(file_name) <= 160),
  storage_path  text not null unique check (storage_path ~ '^ressources/[0-9a-f-]{36}/[0-9a-f-]{36}\.pdf$'),
  size_bytes    bigint check (size_bytes is null or size_bytes > 0),
  display_order int  not null default 0,
  created_at    timestamptz not null default now()
);
create index resource_files_ressource_idx on public.resource_files (resource_id, display_order);

-- ---------- Réglages du site (une seule ligne) ----------
create table public.site_settings (
  id               boolean primary key default true check (id),
  church_name      text not null default 'EDM République Villeurbanne',
  hero_kicker      text not null default 'Église de maison',
  hero_title       text not null default 'Bienvenue !',
  hero_text        text not null default 'Un espace de communion, d’étude et d’édification autour de la Parole de Dieu.',
  -- 4 points forts sous le visuel d'accueil : [{ "titre": "...", "texte": "..." }]
  highlights       jsonb not null default '[
    {"titre": "Une église de maison", "texte": "Texte provisoire – à compléter dans l’administration."},
    {"titre": "Notre vision",         "texte": "Texte provisoire – à compléter dans l’administration."},
    {"titre": "La Parole",            "texte": "Texte provisoire – à compléter dans l’administration."},
    {"titre": "Une famille",          "texte": "Texte provisoire – à compléter dans l’administration."}
  ]'::jsonb,
  hero_image_path  text,
  church_image_path text,
  join_image_path  text,
  meeting_label    text not null default 'Études bibliques',
  meeting_day      text not null default 'jeudi',
  meeting_time     text not null default '19h30',
  address          text not null default 'République, Villeurbanne',
  address_details  text,
  contact_email    text check (contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone            text check (phone is null or length(phone) <= 30),
  whatsapp_url     text check (whatsapp_url is null or whatsapp_url ~* '^https://(wa\.me|chat\.whatsapp\.com|api\.whatsapp\.com)/'),
  updated_at       timestamptz not null default now(),
  constraint highlights_valides check (
    jsonb_typeof(highlights) = 'array'
    and jsonb_array_length(highlights) <= 4
    and not jsonb_path_exists(highlights, '$[*] ? (@.type() != "object" || !exists(@.titre) || !exists(@.texte))'))
);
insert into public.site_settings (id) values (true);

-- ---------- Textes des pages ----------
create table public.site_pages (
  slug       text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title      text not null check (btrim(title) <> '' and length(title) <= 120),
  content    text not null default '' check (length(content) <= 20000),
  position   int  not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.site_pages (slug, title, position, content) values
  ('presentation',   'Notre église de maison', 1, 'Texte provisoire – à remplacer depuis l’administration (Pages du site).

Présentez ici votre église de maison : qui vous êtes, ce que vous vivez ensemble.'),
  ('histoire',       'Notre histoire',          2, 'Texte provisoire – à remplacer depuis l’administration (Pages du site).'),
  ('vision',         'Notre vision',            3, 'Texte provisoire – à remplacer depuis l’administration (Pages du site).'),
  ('valeurs',        'Nos valeurs',             4, 'Texte provisoire – à remplacer depuis l’administration (Pages du site).

- Première valeur
- Deuxième valeur
- Troisième valeur'),
  ('fonctionnement', 'Notre fonctionnement',    5, 'Texte provisoire – à remplacer depuis l’administration (Pages du site).'),
  ('rejoindre',      'Nous rejoindre',          6, 'Partageons ensemble un temps autour de la Parole.

Texte provisoire – ajoutez ici les informations utiles pour une première visite.');

-- ---------- updated_at automatique ----------
create function public.maj_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger resources_maj     before update on public.resources     for each row execute function public.maj_updated_at();
create trigger site_settings_maj before update on public.site_settings for each row execute function public.maj_updated_at();
create trigger site_pages_maj    before update on public.site_pages    for each row execute function public.maj_updated_at();
