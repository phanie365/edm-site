-- =====================================================================
-- EDM République Villeurbanne – INSTALLATION COMPLÈTE DE LA BASE
-- À copier-coller UNE SEULE FOIS dans Supabase > SQL Editor, puis « Run ».
-- (Regroupe les 3 fichiers de supabase/migrations/, dans l'ordre.)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 20261120000100_schema.sql
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 20261120000200_securite.sql
-- ---------------------------------------------------------------------
-- =====================================================================
-- 2/3 : sécurité (Row Level Security) et recherche
--   Visiteurs : lecture du contenu publié uniquement.
--   Administrateurs (table admins) : tout.
-- =====================================================================

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()))
$$;
revoke execute on function public.is_admin() from public;
grant  execute on function public.is_admin() to anon, authenticated;

alter table public.admins         enable row level security;
alter table public.resources      enable row level security;
alter table public.resource_files enable row level security;
alter table public.site_settings  enable row level security;
alter table public.site_pages     enable row level security;

-- Les visiteurs n'ont aucun droit d'écriture, même en cas d'erreur de règle.
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke truncate on all tables in schema public from authenticated;

-- ---------- Lecture ----------
create policy "lecture reglages"    on public.site_settings for select to anon, authenticated using (true);
create policy "lecture pages"       on public.site_pages    for select to anon, authenticated using (true);
create policy "lecture ressources publiees" on public.resources for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "lecture fiches des ressources publiees" on public.resource_files for select to anon, authenticated
  using ((select public.is_admin())
         or exists (select 1 from public.resources r where r.id = resource_id and r.is_published));
create policy "admin lit sa ligne" on public.admins for select to authenticated using (user_id = (select auth.uid()));

-- ---------- Écriture : administrateurs ----------
create policy "admin ressources" on public.resources for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin fiches" on public.resource_files for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin reglages" on public.site_settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin pages" on public.site_pages for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- Recherche dans la bibliothèque ----------
-- Retourne uniquement les ressources publiées. Chaque mot cherché doit apparaître
-- (sans tenir compte des accents) dans le titre ou la description.
create function public.rechercher_ressources(
  p_q text default null, p_limite int default 12, p_decalage int default 0
) returns table (
  id uuid, title text, slug text, description text, youtube_url text, cover_path text,
  created_at timestamptz,
  nb_fiches int, total bigint
)
language sql stable security invoker set search_path = '' as $$
  with base as (
    select r.*
    from public.resources r
    where r.is_published
      and (
        p_q is null or btrim(p_q) = ''
        or not exists (
          select 1
          from regexp_split_to_table(public.sans_accents(btrim(left(p_q, 100))), '\s+') as mot
          where mot <> '' and strpos(r.search_text, mot) = 0
        )
      )
  )
  select b.id, b.title, b.slug, b.description, b.youtube_url, b.cover_path,
         b.created_at,
         (select count(*) from public.resource_files f where f.resource_id = b.id)::int,
         count(*) over ()
  from base b
  order by b.created_at desc
  limit least(greatest(coalesce(p_limite, 12), 1), 48)
  offset greatest(coalesce(p_decalage, 0), 0)
$$;
grant execute on function public.rechercher_ressources(text, int, int) to anon, authenticated;

-- Réordonne les fiches d'une ressource en une seule opération.
create function public.reordonner_fiches(p_ressource uuid, p_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Accès réservé aux administrateurs'; end if;
  update public.resource_files f set display_order = o.rang
  from unnest(p_ids) with ordinality as o(id, rang)
  where f.id = o.id and f.resource_id = p_ressource;
end $$;
revoke execute on function public.reordonner_fiches(uuid, uuid[]) from public, anon;
grant  execute on function public.reordonner_fiches(uuid, uuid[]) to authenticated;

-- ---------------------------------------------------------------------
-- 20261120000300_stockage.sql
-- ---------------------------------------------------------------------
-- =====================================================================
-- 3/3 : stockage des fichiers
--   « fiches » : PDF, 25 Mo max, lecture publique.
--   « images » : couvertures et photos du site, 5 Mo max, lecture publique.
--   Écriture réservée aux administrateurs.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('fiches', 'fiches', true, 26214400, array['application/pdf']),
  ('images', 'images', true, 5242880,  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "admin lit les fichiers" on storage.objects for select to authenticated
  using (bucket_id in ('fiches', 'images') and (select public.is_admin()));
create policy "admin depose des fichiers" on storage.objects for insert to authenticated
  with check (bucket_id in ('fiches', 'images') and (select public.is_admin()));
create policy "admin remplace des fichiers" on storage.objects for update to authenticated
  using (bucket_id in ('fiches', 'images') and (select public.is_admin()))
  with check (bucket_id in ('fiches', 'images') and (select public.is_admin()));
create policy "admin supprime des fichiers" on storage.objects for delete to authenticated
  using (bucket_id in ('fiches', 'images') and (select public.is_admin()));
