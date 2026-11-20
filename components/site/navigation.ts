import { BookOpen, Home, MapPin, type LucideIcon } from 'lucide-react';

export interface LienNav {
  href: string;
  libelle: string;
  court: string;
  icone: LucideIcon;
}

export const LIENS_NAV: LienNav[] = [
  { href: '/', libelle: 'Accueil', court: 'Accueil', icone: Home },
  { href: '/bibliotheque', libelle: 'Bibliothèque', court: 'Bibliothèque', icone: BookOpen },
  { href: '/nous-rejoindre', libelle: 'Nous rejoindre', court: 'Nous rejoindre', icone: MapPin },
];

export const estActif = (href: string, chemin: string) => (href === '/' ? chemin === '/' : chemin.startsWith(href));
