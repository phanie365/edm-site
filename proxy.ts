import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy (anciennement « middleware ») : uniquement sur /admin.
 * - rafraîchit la session Supabase (cookies) ;
 * - renvoie vers la page de connexion si personne n'est connecté.
 * La vraie vérification des droits est refaite côté serveur dans chaque page et action.
 */
export async function proxy(request: NextRequest) {
  let reponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (aEcrire, entetes) => {
          aEcrire.forEach(({ name, value }) => request.cookies.set(name, value));
          reponse = NextResponse.next({ request });
          aEcrire.forEach(({ name, value, options }) => reponse.cookies.set(name, value, options));
          Object.entries(entetes ?? {}).forEach(([cle, valeur]) => reponse.headers.set(cle, valeur));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const surConnexion = request.nextUrl.pathname.startsWith('/admin/connexion');
  if (!user && !surConnexion) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/connexion';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return reponse;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
