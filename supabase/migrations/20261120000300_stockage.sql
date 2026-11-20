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
