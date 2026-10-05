import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TOOL_CATEGORIES } from '@/lib/site/tools';

export default function SiteFooter() {
  return (
    <footer className="bg-[#0b1b3f] text-white">
      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#8fb0ff]">
              Your next research run
            </p>
            <h2 className="mt-2 max-w-xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              Open the workspace that matches the question.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
              Begin with a company, a location, a product spec, a URL, or a public profile.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              href="/tools/company-enrichment"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[#0b1b3f] transition hover:-translate-y-0.5 hover:bg-[#dbe7ff]"
            >
              Start enriching <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              View all workspaces
            </Link>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-6 lg:px-8">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Enricher home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2f6bff] to-[#6d3bff] text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[13px] font-extrabold tracking-[0.16em]">ENRICHERLAKE</span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#8fb0ff]">
                Research workspaces
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-[13px] leading-6 text-white/55">
            Ten focused workspaces for company enrichment, local discovery, product sourcing, web
            crawling, and social intelligence — unified under one roof.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/70">
              Zero-API to start
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/70">
              Source-aware records
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/70">
              Bring-your-own AI
            </span>
          </div>
        </div>

        {TOOL_CATEGORIES.map((cat) => (
          <nav key={cat.id} aria-label={cat.label}>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#8fb0ff]">{cat.label}</p>
            <ul className="mt-4 space-y-2.5">
              {cat.tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-[13.5px] font-medium text-white/70 transition hover:text-white"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>ENRICHERLAKE · focused intelligence workspaces</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <Link href="/tools/lead-dossiers" className="transition hover:text-white">
              Saved dossiers
            </Link>
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
