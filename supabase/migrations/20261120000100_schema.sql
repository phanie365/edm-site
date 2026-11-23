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

-- ---------- Ressources (prédication, enseignement, fiches…) ----------
create table public.resources (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null check (btrim(title) <> '' and length(title) <= 160),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  description         text check (description is null or length(description) <= 10000),
  youtube_url         text check (youtube_url is null or youtube_url ~* '^https://(www\.|m\.)?(youtube\.com|youtu\.be)/'),
  cover_path          text,                        -- chemin dans le bucket « images »
  is_published        boolean not null default false,
  search_text         text generated always as (
                        public.sans_accents(title || ' ' || coalesce(description, ''))
                      ) stored,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index resources_publiees_idx on public.resources (is_published, created_at desc);

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
  hero_kicker      text not null default 'Église de maison République Villeurbanne',
  hero_title       text not null default 'Bienvenue !',
  hero_text        text not null default 'Un espace de communion, d’étude et d’édification autour de la Parole de Dieu.',
  -- 4 points forts sous le visuel d'accueil : [{ "titre": "...", "texte": "..." }]
  highlights       jsonb not null default '[]'::jsonb,   -- points forts facultatifs (ajoutés depuis l'admin)
  hero_image_path  text,
  church_image_path text,
  join_image_path  text,
  meeting_label    text not null default 'Études bibliques',
  meeting_day      text not null default 'jeudi',
  meeting_time     text not null default '19h30',
  address          text not null default '61 rue Anatole France, 69100 Villeurbanne',
  address_details  text,
  contact_email    text check (contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- Personnes à contacter : [{ "nom": "Clotilde", "telephone": "06 51 99 94 22" }] (4 maximum)
  contacts         jsonb not null default '[
    {"nom": "Clotilde", "telephone": "06 51 99 94 22"},
    {"nom": "Ephrem",   "telephone": "07 87 07 20 22"}
  ]'::jsonb,
  whatsapp_url     text check (whatsapp_url is null or whatsapp_url ~* '^https://(wa\.me|chat\.whatsapp\.com|api\.whatsapp\.com)/'),
  updated_at       timestamptz not null default now(),
  constraint contacts_valides check (
    jsonb_typeof(contacts) = 'array'
    and jsonb_array_length(contacts) <= 4
    and not jsonb_path_exists(contacts, '$[*] ? (@.type() != "object" || !exists(@.nom) || !exists(@.telephone))')),
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
-- Un texte vide n'apparaît pas sur le site : on complète depuis l'admin (Pages du site).
insert into public.site_pages (slug, title, position, content) values
  ('presentation',   'Notre église de maison', 1, ''),
  ('histoire',       'Notre histoire',          2, ''),
  ('vision',         'Notre vision',            3, 'Au sein de l’EDM République, notre vision est de diffuser l’amour.'),
  ('valeurs',        'Nos valeurs',             4, ''),
  ('fonctionnement', 'Notre fonctionnement',    5, ''),
  ('rejoindre',      'Nous rejoindre',          6, 'Partageons ensemble un temps autour de la Parole.');

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
