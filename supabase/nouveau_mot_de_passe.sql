-- =====================================================================
-- Changer le mot de passe de l'administrateur (mot de passe oublié)
--
-- 1. Remplacez  MON-NOUVEAU-MOT-DE-PASSE  ci-dessous par le mot de passe voulu
--    (12 caractères ou plus, gardez les apostrophes autour).
-- 2. Supabase > SQL Editor > New query : collez ce script, puis « Run ».
-- 3. Sur /admin, connectez-vous avec edmrepublique@gmail.com et ce nouveau mot de passe.
-- =====================================================================

update auth.users
set encrypted_password = extensions.crypt('MON-NOUVEAU-MOT-DE-PASSE', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'edmrepublique@gmail.com';

-- Le compte doit aussi être déclaré administrateur
insert into public.admins (user_id)
select id from auth.users where email = 'edmrepublique@gmail.com'
on conflict do nothing;

-- Vérification : doit afficher l'email une fois
select u.email, u.email_confirmed_at is not null as confirme
from public.admins a join auth.users u on u.id = a.user_id;
