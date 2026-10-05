import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Compass, Home, LayoutDashboard } from 'lucide-react';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { ALL_TOOLS } from '@/lib/site/tools';

export const metadata: Metadata = {
  title: 'Page not found | Enricher',
  description: 'The page you are looking for does not exist. Pick a research workspace instead.',
};

const SUGGESTIONS = ['company-enrichment', 'local-business', 'product-finder'];

export default function NotFound() {
  return (
    <div className="cf-light min-h-screen">
      <SiteNavbar variant="solid" />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-[#eef3ff] via-[#f6f9ff] to-white">
          <div className="cf-container pb-16 pt-[130px] text-center sm:pb-24 sm:pt-[150px]">
            <p className="cf-eyebrow mx-auto">
              <Compass className="h-3.5 w-3.5" /> 404 · Lost signal
            </p>
            <h1 className="mx-auto mt-4 max-w-2xl text-balance text-5xl font-extrabold leading-none tracking-[-0.04em] text-[#0b1b3f] sm:text-7xl">
              This page went off the map.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#55617c]">
              The link may be mistyped or the page moved. Your research doesn&apos;t have to stop —
              jump back into a workspace below.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row sm:items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f5bff] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(31,91,255,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1749d6]"
              >
                <Home className="h-4 w-4" /> Back to home
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d5e1fb] bg-white px-6 py-3.5 text-sm font-bold text-[#0b1b3f] transition hover:border-[#1f5bff]/50 hover:text-[#1f5bff]"
              >
                <LayoutDashboard className="h-4 w-4" /> Open dashboard
              </Link>
            </div>

            <div className="mx-auto mt-12 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
              {SUGGESTIONS.map((slug) => {
                const tool = ALL_TOOLS.find((t) => t.slug === slug);
                if (!tool) return null;
                return (
                  <Link
                    key={slug}
                    href={`/tools/${slug}`}
                    className="cf-card cf-card-hover group p-5"
                  >
                    <p className="font-mono text-[11px] font-semibold text-[#1f5bff]/70">{tool.flow}</p>
                    <p className="mt-1.5 font-bold text-[#0b1b3f]">{tool.name}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0b1b3f]">
                      Open workspace
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
