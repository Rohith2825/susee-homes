import { Sora, Inter, IBM_Plex_Mono, Noto_Sans_Tamil } from 'next/font/google';

/** Architectural display grotesque — confident, engineered, professional.
 *  Carries the headlines and the brand wordmark; pairs naturally with the
 *  site's blueprint / survey language. */
export const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sora',
});

/** Clean, ubiquitous professional grotesque for body + UI. */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
  sora.variable,
  inter.variable,
  plexMono.variable,
  notoTamil.variable,
].join(' ');
