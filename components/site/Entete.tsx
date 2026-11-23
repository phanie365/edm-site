"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import { LIENS_NAV, estActif } from "./navigation";

export function Entete({ nom }: { nom: string }) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const panneauRef = useRef<HTMLDivElement>(null);

  // Ferme le menu à chaque changement de page
  useEffect(() => {
    setOuvert(false);
  }, [chemin]);

  // Échap ferme le menu ; le focus revient sur le bouton
  useEffect(() => {
    if (!ouvert) return;
    panneauRef.current?.querySelector<HTMLElement>("a")?.focus();
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        boutonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [ouvert]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-bordure/70 bg-papier/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
          <Link
            href="/"
            className="flex min-h-11 items-center rounded-lg"
            aria-label={`${nom} – accueil`}
          >
            <Image
              src="/assets/logo-lockup.png"
              alt=""
              width={1085}
              height={400}
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {LIENS_NAV.map((l) => {
                const actif = estActif(l.href, chemin);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={actif ? "page" : undefined}
                      className={`relative inline-flex min-h-11 items-center px-3 text-[15px] font-medium transition-colors hover:text-encre ${
                        actif
                          ? "text-encre after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-vert"
                          : "text-encre-3"
                      }`}
                    >
                      {l.libelle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/bibliotheque"
              className="bouton bouton-plein bouton-petit hidden lg:inline-flex"
            >
              <BookOpen aria-hidden size={18} /> Bibliothèque
            </Link>
            <button
              ref={boutonRef}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-papier-2 lg:hidden"
              aria-expanded={ouvert}
              aria-controls="menu-mobile"
              aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOuvert((o) => !o)}
            >
              {ouvert ? (
                <X aria-hidden size={24} />
              ) : (
                <Menu aria-hidden size={24} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu plein écran, HORS de l'en-tête : son flou (backdrop-blur) enfermerait sinon
          le panneau « fixed » dans les 64 px de l'en-tête (menu coupé qu'il fallait faire défiler). */}
      <div
        id="menu-mobile"
        ref={panneauRef}
        hidden={!ouvert}
        className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-0 z-40 overflow-y-auto bg-papier px-5 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:top-[calc(5rem+env(safe-area-inset-top))] lg:hidden"
      >
        <nav aria-label="Menu">
          <ul className="divide-y divide-bordure border-y border-bordure">
            {LIENS_NAV.map((l) => {
              const actif = estActif(l.href, chemin);
              const Icone = l.icone;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={actif ? "page" : undefined}
                    className="flex min-h-16 items-center gap-4 font-titres text-2xl font-bold"
                  >
                    <Icone
                      aria-hidden
                      size={22}
                      strokeWidth={1.75}
                      className={actif ? "text-encre" : "text-encre-2"}
                    />
                    <span
                      className={
                        actif ? "underline decoration-2 underline-offset-8" : ""
                      }
                    >
                      {l.libelle}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
