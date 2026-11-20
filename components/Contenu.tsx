import { blocsDeTexte } from '@/lib/outils';

/** Affiche un texte saisi dans l'admin (paragraphes et listes « - »), sans jamais interpréter de HTML. */
export function Contenu({ texte, className = '' }: { texte: string | null | undefined; className?: string }) {
  const blocs = blocsDeTexte(texte);
  if (!blocs.length) return null;
  return (
    <div className={`space-y-4 text-[17px] leading-relaxed text-encre-3 ${className}`}>
      {blocs.map((b, i) =>
        b.type === 'liste' ? (
          <ul key={i} className="space-y-2 pl-1">
            {b.elements.map((e, j) => (
              <li key={j} className="flex gap-3">
                <span aria-hidden className="mt-[0.7em] size-1.5 flex-none rounded-full bg-vert" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.texte}</p>
        ),
      )}
    </div>
  );
}
