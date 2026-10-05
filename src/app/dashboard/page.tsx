import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import QuickLaunch from '@/components/site/QuickLaunch';
import { TOOL_ICONS } from '@/components/site/ToolShell';
import { TOOL_CATEGORIES } from '@/lib/site/tools';

export const metadata: Metadata = {
  title: 'Dashboard | Enricher',
  description:
    'Pick the right research workspace — company enrichment, local discovery, product sourcing, web crawling, or social intelligence.',
};

const STEPS = [
  { n: '01', title: 'Start from intent', detail: 'Company, market, product, URL, or profile — not a telemetry screen.' },
  { n: '02', title: 'Work in a focused tool', detail: 'Each workspace keeps only the inputs and outputs for that job.' },
  { n: '03', title: 'Keep what matters', detail: 'Save dossiers, export CSV/JSON, or sync forward with source context.' },
];

export default function DashboardPage() {
  return (
    <div className="cf-light min-h-screen">
      <SiteNavbar variant="solid" />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#eef3ff] via-[#f6f9ff] to-white">
          <div className="cf-container pb-10 pt-[104px] sm:pt-[120px]">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8a97b3]">
              <Link href="/" className="transition hover:text-[#1f5bff]">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-[#0b1b3f]">Dashboard</span>
            </nav>

            <div className="mt-6 max-w-2xl">
              <p className="cf-eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1f5bff]" /> Dashboard · Choose your next step
              </p>
              <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.03] tracking-[-0.035em] text-[#0b1b3f] sm:text-5xl">
                Where should research go next?
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#55617c]">
                This is the bridge between the home page and focused work. Pick a workspace below —
                each one opens with only the inputs, filters, and outputs that job needs.
              </p>
            </div>

            <div className="mt-7" aria-label="Quick launch">
              <QuickLaunch />
            </div>
          </div>
        </section>

        {/* Workspace groups — unified with navbar categorization */}
        <section className="bg-white">
          <div className="cf-container space-y-12 py-12 sm:py-16">
            {TOOL_CATEGORIES.map((group) => (
              <section key={group.id} aria-label={group.label}>
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#0b1b3f]">{group.label}</h2>
                    <p className="mt-1 text-sm text-[#66748f]">{group.detail}</p>
                  </div>
                </div>

                <div className={`mt-5 grid gap-3 ${group.tools.length > 1 ? 'md:grid-cols-3' : 'md:grid-cols-1 md:max-w-md'}`}>
                  {group.tools.map((tool) => {
                    const Icon = TOOL_ICONS[tool.slug];
                    return (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="cf-card cf-card-hover group p-5"
                      >
                        <div className="flex items-start justify-between">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9efff] text-[#1f5bff] transition group-hover:bg-[#1f5bff] group-hover:text-white">
                            {Icon && <Icon className="h-4 w-4" />}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-[#b7c3dd] transition group-hover:translate-x-0.5 group-hover:text-[#1f5bff]" />
                        </div>
                        <p className="mt-5 font-mono text-[11px] font-semibold text-[#1f5bff]/70">{tool.flow}</p>
                        <h3 className="mt-1.5 text-base font-bold tracking-tight text-[#0b1b3f]">{tool.name}</h3>
                        <p className="mt-2 text-[13px] leading-5 text-[#55617c]">{tool.detail}</p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#0b1b3f]">
                          Open workspace{' '}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        {/* How this dashboard fits */}
        <section className="bg-[#f6f9ff]">
          <div className="cf-container cf-section">
            <div className="cf-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#1f5bff]">
                  Home → Dashboard → Tool
                </p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0b1b3f] sm:text-3xl">
                  Less noise. Clear next step.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#55617c]">
                  Home explains the product. Tools do the depth. This page only routes intent —
                  no simulated telemetry, no inflated counters.
                </p>
                <Link
                  href="/"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1f5bff] transition hover:text-[#0b1b3f]"
                >
                  Back to home <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-2.5">
                {STEPS.map((s) => (
                  <div
                    key={s.n}
                    className="grid gap-3 rounded-2xl border border-[#e8edf9] bg-[#f8faff] p-4 sm:grid-cols-[48px_1fr] sm:items-center"
                  >
                    <span className="font-mono text-sm font-bold text-[#1f5bff]">{s.n}</span>
                    <div>
                      <h3 className="text-sm font-bold text-[#0b1b3f]">{s.title}</h3>
                      <p className="mt-1 text-[13px] leading-5 text-[#55617c]">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
