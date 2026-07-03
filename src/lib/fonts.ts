import { Fraunces, Archivo, IBM_Plex_Mono, Noto_Sans_Tamil, Playfair_Display } from 'next/font/google';

/** Editorial display serif — warm, architectural, ownable. */
export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
});

/** High-contrast display serif for the oversized signature wordmark.
 *  preload:false — only the footer monogram uses it. */
export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-playfair',
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

/** Tamil — Noto Sans Tamil, covering display + body.
 *  preload:false — the file is only fetched when [lang="ta"] rules
 *  actually reference it, so English pages never download Tamil glyphs. */
export const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-tamil',
});

export const fontVariables = [
  fraunces.variable,
  playfair.variable,
  archivo.variable,
  plexMono.variable,
  notoTamil.variable,
].join(' ');
