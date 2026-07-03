import { Fraunces, Archivo, IBM_Plex_Mono, Anek_Tamil } from 'next/font/google';

/** Editorial display serif — warm, architectural, ownable. */
export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
});

/** Grotesque for body/UI. */
export const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

/** Technical mono for survey labels, coordinates, indices. */
export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-plex-mono',
});

/** Tamil — modern variable family covering display + body.
 *  preload:false — the file is only fetched when [lang="ta"] rules
 *  actually reference it, so English pages never download Tamil glyphs. */
export const anekTamil = Anek_Tamil({
  subsets: ['tamil', 'latin'],
  display: 'swap',
  preload: false,
  variable: '--font-anek-tamil',
});

export const fontVariables = [
  fraunces.variable,
  archivo.variable,
  plexMono.variable,
  anekTamil.variable,
].join(' ');
