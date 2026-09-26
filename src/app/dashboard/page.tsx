import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  MapPin,
  Package,
  Search,
  Users,
  Sparkles,
  FileText,
  Layers,
  Compass,
  ChevronRight,
  Megaphone,
} from 'lucide-react';
import DashboardQuickLaunch from '@/components/DashboardQuickLaunch';

export const metadata: Metadata = {
  title: 'Dashboard | Enricher AI',
  description:
    'Pick the right research workspace — company enrichment, local discovery, product sourcing, web crawling, or social intelligence.',
};

const groups = [
  {
    title: 'Enrich & qualify',
    detail: 'Turn a starting point into a usable profile.',
    items: [
      {
        name: 'Company enrichment',
        detail: 'Build contacts, technographics, and location signals from a domain.',
        href: '/tools/company-enrichment',
        Icon: Globe,
        flow: 'Domain → dossier',
      },
      {
        name: 'Brand 360',
        detail: 'Sweep web and public social signals into one brand dossier.',
        href: '/tools/brand-360',
        Icon: Compass,
        flow: 'Brand → dossier',
      },
      {
        name: 'Lead dossiers',
        detail: 'Review, rate, and export the profiles you have already saved.',
        href: '/tools/lead-dossiers',
        Icon: FileText,
        flow: 'Saved → action',
      },
    ],
  },
  {
    title: 'Discover markets',
    detail: 'Find businesses and suppliers before you enrich them.',
    items: [
      {
        name: 'Local business discovery',
        detail: 'Search by keywords and location, then qualify what you find.',
        href: '/tools/local-business',
        Icon: MapPin,
        flow: 'Keywords → accounts',
      },
      {
        name: 'Product & supplier finder',
        detail: 'Compare specs, pricing tiers, and B2B supplier options.',
        href: '/tools/product-finder',
        Icon: Package,
        flow: 'Specs → suppliers',
      },
      {
        name: 'SERP intelligence',
        detail: 'Research Google organic, paid, and AI Overview signals.',
        href: '/tools/serp-intelligence',
        Icon: Search,
        flow: 'Query → rankings',
      },
    ],
  },
  {
    title: 'Inspect signals',
    detail: 'Look closely at one URL, profile, or campaign.',
    items: [
      {
        name: 'Web crawler',
        detail: 'Extract readable content, links, and a concise brief from a URL.',
        href: '/tools/web-crawler',
        Icon: Layers,
        flow: 'URL → intelligence',
      },
      {
        name: 'Social intelligence',
        detail: 'Check public Instagram, LinkedIn, and Facebook presence.',
        href: '/tools/social-intelligence',
        Icon: Users,
        flow: 'Handle → presence',
      },
      {
        name: 'Ad intelligence',
        detail: 'Review public Meta Ad Library creatives and campaigns.',
        href: '/tools/ad-intelligence',
        Icon: Sparkles,
        flow: 'Brand → campaigns',
      },
    ],
  },
  {
    title: 'Create & launch',
    detail: 'Turn finished work into posts that bring clients and recruiters to you.',
    items: [
      {
        name: 'Post Studio',
        detail: 'Generate copy-ready launch posts from a live site and GitHub repo.',
        href: '/tools/post-generator',
        Icon: Megaphone,
        flow: 'URL → viral posts',
      },
    ],
  },
];

const steps = [
  { n: '01', title: 'Start from intent', detail: 'Company, market, product, URL, or profile — not a telemetry screen.' },
  { n: '02', title: 'Work in a focused tool', detail: 'Each workspace keeps only the inputs and outputs for that job.' },
  { n: '03', title: 'Keep what matters', detail: 'Save dossiers, export CSV/JSON, or sync forward with source context.' },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#080b16] text-slate-100">
      {/* Lightweight top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#070b18]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Enricher AI home">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[12px] font-extrabold tracking-[0.18em] text-white">ENRICHER.AI</span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-cyan-300/70">
                Dashboard
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-[13px]">
            <Link href="/" className="hidden rounded-full px-3 py-1.5 text-slate-400 transition hover:text-white sm:block">
              Home
            </Link>
            <Link
              href="/tools/company-enrichment"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-100"
            >
              Start research <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 pt-6 text-xs text-slate-500">
          <Link href="/" className="transition hover:text-slate-300">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-300">Dashboard</span>
        </nav>

        {/* Hero — bridge statement, no fake metrics */}
        <section className="max-w-2xl pt-8">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> DASHBOARD · CHOOSE YOUR NEXT STEP
          </p>
          <h1 className="mt-5 text-balance text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl">
            Where should research go next?
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
            This is the bridge between the home page and focused work. Pick a workspace below —
            each one opens with only the inputs, filters, and outputs that job needs.
          </p>
        </section>

        {/* Quick launch */}
        <section className="mt-8" aria-label="Quick launch">
          <DashboardQuickLaunch />
        </section>

        {/* Workspace groups */}
        <div className="mt-12 space-y-10">
          {groups.map((group) => (
            <section key={group.title} aria-label={group.title}>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-white">{group.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{group.detail}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {group.items.map(({ name, detail, href, Icon, flow }) => (
                  <Link
                    key={name}
                    href={href}
                    className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition group-hover:border-cyan-300/30 group-hover:text-cyan-200">
                        <Icon className="h-4 w-4" />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                    </div>
                    <p className="mt-5 font-mono text-[11px] text-cyan-200/60">{flow}</p>
                    <h3 className="mt-1.5 text-base font-bold tracking-tight text-white">{name}</h3>
                    <p className="mt-2 text-[13px] leading-5 text-slate-400">{detail}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white">
                      Open workspace{' '}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* How this dashboard fits */}
        <section className="mt-14 grid gap-3 rounded-[24px] border border-white/[0.07] bg-white/[0.02] p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
              Home → Dashboard → Tool
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
              Less noise. Clear next step.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
              Home explains the product. Tools do the depth. This page only routes intent —
              no simulated telemetry, no inflated counters.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 transition hover:text-white"
            >
              Back to home <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-2.5">
            {steps.map((s) => (
              <div
                key={s.n}
                className="grid gap-3 rounded-2xl border border-white/[0.06] bg-[#0a1020]/60 p-4 sm:grid-cols-[48px_1fr] sm:items-center"
              >
                <span className="font-mono text-sm font-bold text-cyan-300">{s.n}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-slate-400">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>ENRICHER.AI · dashboard is a router, not a report</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="transition hover:text-slate-300">
              Home
            </Link>
            <Link href="/tools/lead-dossiers" className="transition hover:text-slate-300">
              Saved dossiers
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
