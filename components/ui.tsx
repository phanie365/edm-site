import type { ReactNode } from 'react';

/** Largeur maximale + marges latérales communes. */
export function Conteneur({ children, className = '', etroit = false }: { children: ReactNode; className?: string; etroit?: boolean }) {
  return <div className={`mx-auto w-full px-5 sm:px-8 ${etroit ? 'max-w-3xl' : 'max-w-6xl'} ${className}`}>{children}</div>;
}

/** En-tête de page : surtitre + grand titre + chapeau. */
export function EnTetePage({ surtitre, titre, chapo }: { surtitre?: string; titre: string; chapo?: ReactNode }) {
  return (
    <header className="space-y-3 pt-8 pb-8 sm:pt-14 sm:pb-12">
      {surtitre && <p className="surtitre">{surtitre}</p>}
      <h1 className="text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">{titre}</h1>
      {chapo && <div className="max-w-2xl text-lg text-encre-3 sm:text-xl">{chapo}</div>}
    </header>
  );
}

export function TitreSection({ id, children, action }: { id?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-bold sm:text-3xl">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function Etiquette({ children, sombre = false }: { children: ReactNode; sombre?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${sombre ? 'bg-vert text-clair' : 'bg-papier-2 text-encre'}`}>
      {children}
    </span>
  );
}
