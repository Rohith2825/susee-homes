import { DM_Serif_Display, DM_Sans, Cormorant_Garamond, IBM_Plex_Mono, Noto_Sans_Tamil } from 'next/font/google';

/** Display serif — the exact headline face from suseehomes.com. */
export const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-dm-serif',
});

/** Body / UI grotesque — matches the live site. Variable (opsz + wght). */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

/** Italic accent serif — as loaded on the live site (italic 500/600).
 *  preload:false — only italic accent text references it. */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['italic'],
  display: 'swap',
  preload: false,
  variable: '--font-cormorant',
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
  dmSerif.variable,
  dmSans.variable,
  cormorant.variable,
  plexMono.variable,
  notoTamil.variable,
].join(' ');
