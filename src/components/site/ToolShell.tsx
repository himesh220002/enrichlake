import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  Globe,
  Layers,
  MapPin,
  Megaphone,
  Package,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { getCategoryOfTool, getRelatedTools, type ToolEntry } from '@/lib/site/tools';

export const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'company-enrichment': Globe,
  'brand-360': Compass,
  'lead-dossiers': FileText,
  'local-business': MapPin,
  'product-finder': Package,
  'serp-intelligence': Search,
  'web-crawler': Layers,
  'social-intelligence': Users,
  'ad-intelligence': Sparkles,
  'post-generator': Megaphone,
};

/** Cashfree-style tool hero — fills the first viewport with context, never just a search bar. */
export function ToolHero({ tool, showHero = true }: { tool: ToolEntry; showHero?: boolean }) {
  const category = getCategoryOfTool(tool.slug);
  const Icon = TOOL_ICONS[tool.slug] ?? Sparkles;
  if (!showHero) return null;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef3ff] via-[#f6f9ff] to-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(720px 340px at 85% 0%, rgba(47,107,255,0.12), transparent 65%), radial-gradient(560px 300px at 5% 20%, rgba(109,59,255,0.08), transparent 60%)',
        }}
      />
      <div className="cf-container relative pb-10 pt-[104px] sm:pb-14 sm:pt-[120px]">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-[#8a97b3]">
          <Link href="/" className="transition hover:text-[#1f5bff]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/dashboard" className="transition hover:text-[#1f5bff]">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          {category && <span className="hidden sm:inline">{category.label}</span>}
          {category && <ChevronRight className="hidden h-3 w-3 sm:inline" />}
          <span className="font-semibold text-[#0b1b3f]">{tool.name}</span>
        </nav>

        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="cf-eyebrow">
              <Icon className="h-3.5 w-3.5" />
              {category?.label ?? 'Workspace'} · {tool.flow}
              {tool.badge && (
                <span className="rounded-full bg-[#0b1b3f] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                  {tool.badge}
                </span>
              )}
            </p>
            <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.03] tracking-[-0.035em] text-[#0b1b3f] sm:text-5xl">
              {tool.name}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#55617c]">{tool.detail}</p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
              {tool.bullets.map((b) => (
                <li key={b} className="cf-check">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0d9b56]" /> {b}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <a
                href="#workspace"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f5bff] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(31,91,255,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1749d6]"
              >
                Open the workspace <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d5e1fb] bg-white px-6 py-3.5 text-sm font-bold text-[#0b1b3f] transition hover:border-[#1f5bff]/50 hover:text-[#1f5bff]"
              >
                Compare workspaces
              </Link>
            </div>
          </div>

          {/* Output-shape card — reserves the "generation space" visually before first run */}
          <div className="cf-card overflow-hidden">
            <div className="flex items-center justify-between bg-[#0b1b3f] px-5 py-3.5 text-white">
              <span className="inline-flex items-center gap-2 text-xs font-bold">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                What a finished run looks like
              </span>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-300">
                EXAMPLE SHAPE
              </span>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between rounded-xl bg-[#f2f6ff] px-4 py-3">
                <span className="text-xs font-semibold text-[#8a97b3]">Starts with</span>
                <span className="text-[13px] font-bold text-[#0b1b3f]">{tool.startsWith}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#f2f6ff] px-4 py-3">
                <span className="text-xs font-semibold text-[#8a97b3]">You get</span>
                <span className="text-[13px] font-bold text-[#0b1b3f]">{tool.youGet}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {tool.stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-[#e8edf9] px-2 py-3 text-center">
                    <p className="text-[13px] font-extrabold text-[#0b1b3f]">{s.value}</p>
                    <p className="mt-1 text-[10px] font-medium leading-tight text-[#8a97b3]">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] leading-5 text-[#8a97b3]">
                Scroll to the workspace below — results render in this same framed console once you run it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The interactive console, framed like a Cashfree product screenshot — min height kills the empty feel. */
export function WorkspaceFrame({ children }: { children: ReactNode }) {
  return (
    <section id="workspace" className="scroll-mt-24 bg-white">
      <div className="cf-container py-10 sm:py-14">
        <div className="cf-workspace-frame min-h-[72vh]">{children}</div>
        <p className="mt-3 text-center text-xs text-[#8a97b3]">
          Runs execute in this console — dossier, matrix and export actions appear here once data arrives.
        </p>
      </div>
    </section>
  );
}

export function ToolSteps({ tool }: { tool: ToolEntry }) {
  return (
    <section className="bg-[#f6f9ff]">
      <div className="cf-container cf-section">
        <p className="cf-eyebrow">How it works</p>
        <h2 className="cf-h2 max-w-2xl">Three steps from input to usable output.</h2>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {tool.steps.map((step, i) => (
            <article key={step.title} className="cf-card cf-card-hover p-6">
              <span className="font-mono text-sm font-bold text-[#1f5bff]">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-[#0b1b3f]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#55617c]">{step.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ToolFaq({ tool }: { tool: ToolEntry }) {
  return (
    <section className="bg-white">
      <div className="cf-container cf-section">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="cf-eyebrow">FAQ</p>
            <h2 className="cf-h2">Questions about {tool.shortName.toLowerCase()}.</h2>
            <p className="cf-lead max-w-md">
              Short answers before you run — the workspace itself guides the rest.
            </p>
          </div>
          <div className="space-y-2.5">
            {tool.faqs.map((faq) => (
              <details key={faq.q} className="cf-faq-item group px-5 py-4">
                <summary className="flex items-center justify-between gap-4 text-[15px] font-bold text-[#0b1b3f]">
                  {faq.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eef3ff] text-[#1f5bff] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-sm leading-6 text-[#55617c]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function RelatedTools({ slug }: { slug: string }) {
  const related = getRelatedTools(slug, 3);
  return (
    <section className="border-t border-[#e8edf9] bg-white">
      <div className="cf-container cf-section">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="cf-eyebrow">Keep going</p>
            <h2 className="cf-h2">Related workspaces.</h2>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-[#1f5bff] transition hover:text-[#0b1b3f]"
          >
            View all workspaces <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {related.map((tool) => {
            const Icon = TOOL_ICONS[tool.slug] ?? Sparkles;
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="cf-card cf-card-hover group p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9efff] text-[#1f5bff] transition group-hover:bg-[#1f5bff] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-5 font-mono text-[11px] font-semibold text-[#1f5bff]/70">{tool.flow}</p>
                <h3 className="mt-1.5 text-lg font-bold tracking-tight text-[#0b1b3f]">{tool.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#55617c]">{tool.detail}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0b1b3f]">
                  Open workspace
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
