import type { Metadata } from 'next';
import Link from 'next/link';
import LegalShell, { LegalH } from '@/components/site/LegalShell';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'About Enricher — free focused workspaces for company enrichment, local discovery, product sourcing and social intelligence.',
};

export default function AboutPage() {
  return (
    <LegalShell
      eyebrow="About us"
      title="Research infrastructure for the rest of us."
      intro="Enricher exists for one reason: turning the public web into usable, source-aware intelligence without enterprise contracts or per-seat pricing."
    >
      <p>
        Enricher is a suite of ten focused research workspaces covering company enrichment, local
        business discovery, product and supplier sourcing, web crawling, social intelligence, ad
        intelligence, SERP intelligence, brand dossiers, saved lead management and launch-post
        generation. Each workspace opens with only the inputs, filters and outputs its job needs —
        no bloated all-in-one dashboard standing between a question and its answer.
      </p>
      <LegalH>What we believe</LegalH>
      <p>
        Public information should be working information. A domain, a market, a specification or a
        public profile is a starting point — not a dead end. Every run keeps verification badges,
        status tags and source context attached, so a saved dossier is still trustworthy weeks
        later when it reaches a CRM, a pitch or a procurement decision.
      </p>
      <LegalH>How the product is built</LegalH>
      <p>
        Research runs on a stealth headless browsing engine with live progress telemetry, queued
        background jobs and CRM safeguards. The base harvest is free and keyless; optional AI
        synthesis follows a bring-your-own-key model where API keys never leave the browser. Saved
        work lives in lead dossiers with ratings, remarks, lists and one-click CSV, JSON and CRM
        export.
      </p>
      <LegalH>Get in touch</LegalH>
      <p>
        Questions, feedback or partnership ideas? Reach us through the{' '}
        <Link href="/contact" className="font-bold text-[#1f5bff] hover:text-[#0b1b3f]">
          contact page
        </Link>{' '}
        — we read everything.
      </p>
    </LegalShell>
  );
}
