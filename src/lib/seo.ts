/** Resolve the canonical site URL — Netlify/Vercel provide URL/DEPLOY env vars
 *  at build. Falls back to the production domain (not localhost) so absolute
 *  OG/canonical URLs stay correct even when no env var is set at build. */
export function siteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://suseehomes.com');
  return new URL(raw);
}
