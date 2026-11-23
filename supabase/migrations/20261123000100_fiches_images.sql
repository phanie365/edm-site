-- =====================================================================
-- 4/4 : les fiches peuvent être des images (JPEG, PNG, WebP), une image par fiche.
--   Les PDF restent acceptés.
-- =====================================================================

alter table public.resource_files drop constraint if exists resource_files_storage_path_check;
alter table public.resource_files add constraint resource_files_storage_path_check
  check (storage_path ~ '^ressources/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png|webp)$');

update storage.buckets
set allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
where id = 'fiches';
