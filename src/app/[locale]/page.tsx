import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/sections/Hero';
import Ticker from '@/components/sections/Ticker';
import Stats from '@/components/sections/Stats';
import Pillars from '@/components/sections/Pillars';
import Process from '@/components/sections/Process';
import Alight from '@/components/sections/Alight';
import Estimator from '@/components/sections/Estimator';
import Upcoming from '@/components/sections/Upcoming';
import Founder from '@/components/sections/Founder';
import Testimonials from '@/components/sections/Testimonials';
import Faq from '@/components/sections/Faq';
import Cta from '@/components/sections/Cta';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="top" tabIndex={-1} className="outline-none">
      <Hero />
      <Ticker />
      <Stats />
      <Pillars />
      <Process />
      <Alight />
      <Estimator />
      <Upcoming />
      <Founder />
      <Testimonials />
      <Cta />
      <Faq />
    </main>
  );
}
