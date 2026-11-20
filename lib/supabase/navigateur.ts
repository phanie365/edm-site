'use client';
import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../env';

/** Client du navigateur (admin uniquement) : sert à déposer les fichiers directement dans Storage. */
export const clientNavigateur = () => createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
