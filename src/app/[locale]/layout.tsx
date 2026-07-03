import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { siteUrl } from '@/lib/seo';
import { SITE } from '@/lib/site';
import SiteMotion from '@/components/motion/SiteMotion';
import Preloader from '@/components/chrome/Preloader';
import Navbar from '@/components/chrome/Navbar';
import Footer from '@/components/chrome/Footer';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: siteUrl(),
    title: t('title'),
    description: t('description'),
    icons: { icon: '/images/logo.png' },
    alternates: {
      canonical: locale === 'en' ? '/' : '/ta',
      languages: { en: '/', ta: '/ta' },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      siteName: SITE.name,
      url: locale === 'en' ? '/' : '/ta',
      locale: locale === 'ta' ? 'ta_IN' : 'en_IN',
      images: [
        {
          url: '/images/og.jpg',
          width: 2400,
          height: 1260,
          alt: 'Susee Homes — premium plotted developments and custom homes in Poonamallee, Chennai',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/og.jpg'],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#0a100d',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const tMeta = await getTranslations('meta');

  // Organization structured data — grounded in the client's published facts
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: SITE.name,
    slogan: 'Your Trust. Our Asset.',
    description: tMeta('description'),
    telephone: SITE.phoneDisplay,
    areaServed: 'Chennai, Tamil Nadu, India',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Poonamallee',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.coordinates.lat,
      longitude: SITE.coordinates.lng,
    },
    logo: new URL('/images/logo.png', siteUrl()).toString(),
  };

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body>
        {/* Mark JS as live before paint so reveal targets can start hidden.
            The opening curtain replays on every full load; only reduced-motion
            users skip it (decided synchronously so it never even flashes). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');try{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro-skip')}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <a href="#top" className="skip-link">
            {locale === 'ta' ? 'உள்ளடக்கத்திற்குச் செல்' : 'Skip to content'}
          </a>
          <SiteMotion />
          <Preloader />
          <Navbar />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
