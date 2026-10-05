import type { Metadata } from 'next';

import ScrollVideoHero from '@/components/ScrollVideoHero';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import {
  CategoryTabs,
  FaqJsonLd,
  GallerySection,
  HomeFaq,
  HowItWorks,
  MotionStrip,
  ProductStack,
  ProofSection,
  SecondaryHero,
  SeoAbout,
  SplitSections,
  StatBand,
} from '@/components/site/HomeSections';

export const metadata: Metadata = {
  title: 'Enricher — Turn the open web into usable intelligence',
  description:
    'Dedicated research workspaces for company enrichment, local discovery, product sourcing, web crawling, and social intelligence.',
};

export default function HomePage() {
  return (
    <div className="cf-light min-h-screen">
      {/* Unified navigation — transparent over the video briefing, white after */}
      <SiteNavbar variant="overlay" />

      <main>
        {/* 1. Scroll-driven video briefing — DO NOT ALTER (strict requirement) */}
        <ScrollVideoHero />

        {/* 2. Cashfree-style light sections, project content only */}
        <SecondaryHero />
        <MotionStrip />
        <StatBand />
        <ProductStack />
        <CategoryTabs />
        <GallerySection />
        <SplitSections />
        <HowItWorks />
        <ProofSection />
        <SeoAbout />
        <HomeFaq />
        <FaqJsonLd />
      </main>

      <SiteFooter />
    </div>
  );
}
