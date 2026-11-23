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

-- Droits d'accès explicites (les projets Supabase récents n'en donnent plus par défaut).
-- Les règles RLS ci-dessous restreignent ensuite ce que chacun voit et modifie.
grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.site_pages, public.resources, public.resource_files to anon, authenticated;
grant select on public.admins to authenticated;
grant insert, update, delete on public.resources, public.resource_files to authenticated;
grant update on public.site_settings, public.site_pages to authenticated;

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
