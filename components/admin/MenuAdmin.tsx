'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExternalLink, FolderOpen, LayoutDashboard, LogOut, Menu, Tags, X } from 'lucide-react';
import { seDeconnecter } from '@/app/admin/actions';

const LIENS = [
  { href: '/admin', libelle: 'Tableau de bord', icone: LayoutDashboard },
  { href: '/admin/ressources', libelle: 'Ressources', icone: FolderOpen },
  { href: '/admin/categories', libelle: 'Catégories', icone: Tags },
];

const actif = (href: string, chemin: string) => (href === '/admin' ? chemin === '/admin' : chemin.startsWith(href));

export function MenuAdmin({ email }: { email: string }) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => setOuvert(false), [chemin]);

  const liens = (
    <>
      <ul className="space-y-1">
        {LIENS.map(({ href, libelle, icone: Icone }) => {
          const a = actif(href, chemin);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={a ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors ${
                  a ? 'bg-clair text-encre' : 'text-clair-2 hover:bg-white/10 hover:text-clair'
                }`}
              >
                <Icone aria-hidden size={19} /> {libelle}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 space-y-1 border-t border-white/15 pt-6">
        <Link href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] text-clair-2 hover:bg-white/10 hover:text-clair">
          <ExternalLink aria-hidden size={19} /> Voir le site<span className="sr-only"> (nouvel onglet)</span>
        </Link>
        <form action={seDeconnecter}>
          <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] text-clair-2 hover:bg-white/10 hover:text-clair">
            <LogOut aria-hidden size={19} /> Se déconnecter
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-clair-2" title={email}>
          {email}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile / tablette : barre du haut + panneau */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-vert px-4 text-clair lg:hidden">
        <Link href="/admin" className="flex min-h-11 items-center gap-3">
          <span className="rounded-lg bg-clair p-1">
            <Image src="/assets/logo-mark.png" alt="" width={32} height={32} />
          </span>
          <span className="font-titres font-bold">Administration</span>
        </Link>
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-expanded={ouvert}
          aria-controls="menu-admin"
          aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10"
        >
          {ouvert ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </header>
      <nav id="menu-admin" aria-label="Administration" hidden={!ouvert} className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-vert p-5 lg:hidden">
        {liens}
      </nav>

      {/* Ordinateur : colonne latérale */}
      <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto bg-vert p-5 text-clair lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-3 rounded-xl p-1">
          <span className="rounded-xl bg-clair p-1.5">
            <Image src="/assets/logo-mark.png" alt="" width={36} height={36} />
          </span>
          <span className="leading-tight">
            <span className="block font-titres font-bold">EDM République</span>
            <span className="text-sm text-clair-2">Administration</span>
          </span>
        </Link>
        <nav aria-label="Administration">{liens}</nav>
      </aside>
    </>
  );
}
