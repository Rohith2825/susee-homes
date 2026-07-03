/** Resolve the canonical site URL — Netlify/Vercel provide URL/DEPLOY env vars at build. */
export function siteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    'http://localhost:3000';
  return new URL(raw);
}
