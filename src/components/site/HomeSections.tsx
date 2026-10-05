'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Layers,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { TOOL_CATEGORIES } from '@/lib/site/tools';
import { TOOL_ICONS } from '@/components/site/ToolShell';

/* ---------- Secondary hero (right after the untouched scroll-video briefing) ---------- */
export function SecondaryHero() {
  return (
    <div id="secondary-hero" className="relative scroll-mt-20 overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(820px 420px at 88% -40px, rgba(47,107,255,0.10), transparent 65%), radial-gradient(640px 380px at -60px 30%, rgba(109,59,255,0.07), transparent 60%)',
        }}
      />
      <section className="cf-container relative grid items-center gap-12 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="cf-eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1f5bff]" /> Research, with a clearer start
          </p>
          <h1 className="mt-4 text-balance text-[2.6rem] font-extrabold leading-[1.0] tracking-[-0.04em] text-[#0b1b3f] sm:text-6xl lg:text-[4.2rem]">
            Turn the open web into your most useful signal.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#55617c] sm:text-lg sm:leading-8">
            Enricher gives every research job its own spacious workspace — from company profiles
            and local discovery to supplier sourcing, web crawling, and public social signals.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              href="/tools/company-enrichment"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#1f5bff] px-7 py-4 text-sm font-bold text-white shadow-[0_16px_40px_rgba(31,91,255,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1749d6]"
            >
              Explore the workspaces
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d5e1fb] bg-white px-7 py-4 text-sm font-bold text-[#0b1b3f] transition hover:border-[#1f5bff]/50 hover:text-[#1f5bff]"
            >
              View full dashboard
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {['Dedicated tool URLs', 'Source-aware records', 'Bring-your-own AI'].map((t) => (
              <span key={t} className="cf-check">
                <CheckCircle2 className="h-4 w-4 text-[#0d9b56]" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Product visual — light console card, Cashfree-style */}
        <div className="relative">
          <div className="cf-card overflow-hidden shadow-[0_30px_80px_rgba(11,27,63,0.14)]">
            <div className="flex items-center justify-between bg-[#0b1b3f] px-5 py-4 text-white">
              <span className="inline-flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[13px] font-bold">Research control room</span>
                  <span className="block text-[11px] text-white/55">10 dedicated workspaces online</span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ready
              </span>
            </div>
            <div className="grid gap-3 bg-[#f6f9ff] p-4 sm:p-5 md:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-[#e3e9f7] bg-white p-4 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1f5bff]">Active brief</p>
                <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#0b1b3f]">Company enrichment</h2>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f2f6ff] px-3 py-2.5 text-xs font-semibold text-[#43506b]">
                  <Globe className="h-3.5 w-3.5 text-[#1f5bff]" /> acme.example
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8eefc]">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#1f5bff] to-[#6d3bff]" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-[#e8edf9] p-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a97b3]">Signals</span>
                    <strong className="mt-1 block text-2xl tracking-tight text-[#0b1b3f]">28</strong>
                    <span className="text-[10px] font-semibold text-[#0d9b56]">+7 verified</span>
                  </div>
                  <div className="rounded-xl border border-[#e8edf9] p-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a97b3]">Coverage</span>
                    <strong className="mt-1 block text-2xl tracking-tight text-[#0b1b3f]">94%</strong>
                    <span className="text-[10px] font-semibold text-[#1f5bff]">high confidence</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#e6f9ef] px-3.5 py-2.5 text-xs font-semibold text-[#0b7a44]">
                  Dossier is ready for review <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-[#e3e9f7] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a97b3]">Channels</span>
                    <Layers className="h-4 w-4 text-[#6d3bff]" />
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {['Website & schema', 'Contact surface', 'Tech stack', 'Social presence'].map((c, i) => (
                      <div key={c} className="flex items-center gap-2.5 text-xs font-medium text-[#43506b]">
                        <span className={`h-2 w-2 rounded-full ${i < 3 ? 'bg-[#1f5bff]' : 'bg-[#c9d4ec]'}`} />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#0b1b3f] p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Signal quality</span>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">
                    92 <span className="text-xs font-semibold text-white/50">/ 100</span>
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-white/60">Every output keeps its research context.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -left-3 top-10 hidden rounded-2xl border border-[#e3e9f7] bg-white px-4 py-3 shadow-[0_18px_44px_rgba(11,27,63,0.14)] sm:block">
            <p className="text-[11px] font-bold text-[#0b1b3f]">10 workspaces</p>
            <p className="text-[10px] text-[#8a97b3]">one job each</p>
          </div>
          <div className="absolute -right-2 bottom-10 hidden rounded-2xl border border-[#e3e9f7] bg-white px-4 py-3 shadow-[0_18px_44px_rgba(11,27,63,0.14)] sm:block">
            <p className="text-[11px] font-bold text-[#0b1b3f]">Source-aware</p>
            <p className="text-[10px] text-[#8a97b3]">confidence attached</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Logo / motion strip ---------- */
const MOTIONS = [
  'Sales prospecting',
  'Supplier sourcing',
  'Local discovery',
  'Competitor tracking',
  'Ad research',
  'Social listening',
  'Content harvesting',
  'Launch storytelling',
];

export function MotionStrip() {
  const row = [...MOTIONS, ...MOTIONS];
  return (
    <section className="border-y border-[#e8edf9] bg-[#f8faff]">
      <div className="cf-container py-8">
        <p className="text-center text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#8a97b3]">
          Built for every research motion
        </p>
        <div className="relative mt-5 overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}>
          <div className="cf-logo-track">
            {row.map((m, i) => (
              <span
                key={`${m}-${i}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e3e9f7] bg-white px-4 py-2 text-[12.5px] font-bold text-[#1b2b4d] shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#1f5bff]" /> {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Navy stat band ---------- */
export function StatBand() {
  const stats = [
    { value: '10', label: 'focused workspaces, one job each' },
    { value: '4', label: 'research categories in the nav' },
    { value: '5+', label: 'export paths — PDF, JSON, CSV, CRM' },
    { value: '0', label: 'API keys needed to start' },
  ];
  return (
    <section className="cf-stat-band">
      <div className="cf-container grid gap-8 py-12 sm:grid-cols-2 sm:py-14 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-white">
            <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">{s.value}</p>
            <p className="mt-2 max-w-[220px] text-sm leading-6 text-white/65">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Full product stack ---------- */
export function ProductStack() {
  return (
    <section id="workspaces" className="scroll-mt-20 bg-white">
      <div className="cf-container cf-section">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="cf-eyebrow">One workflow per tool</p>
            <h2 className="cf-h2">The whole research stack, on one platform.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#55617c]">
            Start with the question in front of you. Each workspace removes unrelated controls
            while leaving its full depth available.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {TOOL_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-extrabold tracking-tight text-[#0b1b3f]">{cat.label}</h3>
                <p className="hidden text-[13px] text-[#8a97b3] sm:block">{cat.detail}</p>
              </div>
              <div className={`mt-4 grid gap-3 md:grid-cols-2 ${cat.tools.length > 2 ? 'xl:grid-cols-3' : ''}`}>
                {cat.tools.map((tool) => {
                  const Icon = TOOL_ICONS[tool.slug] ?? Sparkles;
                  return (
                    <Link key={tool.slug} href={`/tools/${tool.slug}`} className="cf-card cf-card-hover group relative overflow-hidden p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9efff] text-[#1f5bff] transition group-hover:bg-[#1f5bff] group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        {tool.badge && (
                          <span className="rounded-full bg-[#e6f9ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0d9b56]">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-5 font-mono text-[11px] font-semibold text-[#1f5bff]/70">{tool.flow}</p>
                      <h4 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#0b1b3f]">{tool.name}</h4>
                      <p className="mt-2 text-sm leading-6 text-[#55617c]">{tool.detail}</p>
                      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-[#eef2fb] pt-4 text-[11px]">
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.14em] text-[#8a97b3]">Starts with</dt>
                          <dd className="mt-0.5 font-semibold text-[#1b2b4d]">{tool.startsWith}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.14em] text-[#8a97b3]">You get</dt>
                          <dd className="mt-0.5 font-semibold text-[#1b2b4d]">{tool.youGet}</dd>
                        </div>
                      </dl>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0b1b3f]">
                        Open workspace
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Tabbed category showcase (Cashfree-style tab section) ---------- */
export function CategoryTabs() {
  const [active, setActive] = useState(TOOL_CATEGORIES[0].id);
  const category = TOOL_CATEGORIES.find((c) => c.id === active) ?? TOOL_CATEGORIES[0];
  return (
    <section className="bg-[#f6f9ff]">
      <div className="cf-container cf-section">
        <p className="cf-eyebrow">Pick a motion</p>
        <h2 className="cf-h2 max-w-3xl">Every way you need to look. One workspace each.</h2>
        <div className="mt-7 flex flex-wrap gap-2">
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              data-active={cat.id === active}
              onClick={() => setActive(cat.id)}
              className="cf-tab-pill rounded-full border border-[#d5e1fb] bg-white px-5 py-2.5 text-[13px] font-bold text-[#1b2b4d] hover:border-[#1f5bff]/50"
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="cf-card overflow-hidden">
            <div className="bg-[#0b1b3f] px-6 py-5 text-white">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/50">{category.label}</p>
              <h3 className="mt-1.5 text-2xl font-extrabold tracking-tight">{category.detail}</h3>
            </div>
            <div className="divide-y divide-[#eef2fb]">
              {category.tools.map((tool) => {
                const Icon = TOOL_ICONS[tool.slug] ?? Sparkles;
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group flex items-center gap-4 px-6 py-4 transition hover:bg-[#f2f6ff]"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9efff] text-[#1f5bff] transition group-hover:bg-[#1f5bff] group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-[#0b1b3f]">{tool.name}</span>
                      <span className="block truncate text-[13px] text-[#66748f]">{tool.tagline}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#b7c3dd] transition group-hover:translate-x-1 group-hover:text-[#1f5bff]" />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="cf-card bg-gradient-to-br from-white to-[#eef3ff] p-6 sm:p-8">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#1f5bff]">What happens inside</p>
            <ul className="mt-4 space-y-3.5">
              {category.tools.flatMap((t) => t.bullets).slice(0, 6).map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm leading-6 text-[#1b2b4d]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9b56]" /> {b}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0b1b3f] px-5 py-3 text-[13px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1c3faa]"
            >
              Compare in the dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Split feature sections ---------- */
function Split({
  flip,
  eyebrow,
  title,
  lead,
  points,
  cta,
  visual,
}: {
  flip?: boolean;
  eyebrow: string;
  title: string;
  lead: string;
  points: string[];
  cta: { label: string; href: string };
  visual: React.ReactNode;
}) {
  return (
    <section className="bg-white">
      <div className={`cf-container grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 ${flip ? '' : ''}`}>
        <div className={flip ? 'lg:order-2' : ''}>
          <p className="cf-eyebrow">{eyebrow}</p>
          <h2 className="cf-h2">{title}</h2>
          <p className="cf-lead">{lead}</p>
          <ul className="mt-5 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm leading-6 text-[#1b2b4d]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9b56]" /> {p}
              </li>
            ))}
          </ul>
          <Link
            href={cta.href}
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1f5bff] transition hover:text-[#0b1b3f]"
          >
            {cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className={flip ? 'lg:order-1' : ''}>{visual}</div>
      </div>
    </section>
  );
}

export function SplitSections() {
  return (
    <>
      <Split
        eyebrow="From question to dossier"
        title="Fraud-grade diligence, without the enterprise maze."
        lead="Every run keeps verification badges, status tags and source context attached — so a saved profile is still trustworthy weeks later."
        points={[
          'Verification and status tags on every record',
          'Ratings, remarks and list segments in dossiers',
          'CSV, JSON and CRM handoff with context intact',
        ]}
        cta={{ label: 'Try company enrichment', href: '/tools/company-enrichment' }}
        visual={
          <div className="cf-card p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f9ef] text-[#0d9b56]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#0b1b3f]">Verified company dossier</p>
                <p className="text-xs text-[#8a97b3]">stripe.com · crawled 200 OK</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['SSL valid', 'GST verified', 'Tech stack mapped', 'Contacts +7'].map((t) => (
                <span key={t} className="rounded-full bg-[#eef3ff] px-3 py-1.5 text-[11px] font-bold text-[#1f5bff]">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[['Contacts', '92%'], ['Technographics', '88%'], ['Location', '96%']].map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-[11px] font-bold text-[#43506b]">
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#e8eefc]">
                    <div className="h-full rounded-full bg-[#1f5bff]" style={{ width: v }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      />
      <div className="border-y border-[#e8edf9] bg-[#f6f9ff]">
        <Split
          flip
          eyebrow="Built for the AI era"
          title="Bring your own key. Pay nothing to start."
          lead="The base harvest is zero-cost. When you want synthesis — ICP fits, audits, outreach angles — plug in any frontier model key stored only in your browser."
          points={[
            'Claude, Gemini, DeepSeek, Grok, GPT and more',
            'Keys live in localStorage — never on a server',
            'Tokens burn only when you hit generate',
          ]}
          cta={{ label: 'See it in a workspace', href: '/tools/brand-360' }}
          visual={
            <div className="cf-card bg-[#0b1b3f] p-6 text-white sm:p-7">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                  <Sparkles className="h-5 w-5 text-[#8fb0ff]" />
                </span>
                <div>
                  <p className="text-sm font-bold">BYOK intelligence layer</p>
                  <p className="text-xs text-white/55">7 provider families · local keys</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['Claude', 'Gemini', 'DeepSeek', 'Grok', 'GPT', 'Qwen', 'GLM'].map((t) => (
                  <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-white/80">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-white/5 p-3.5 text-[13px] leading-6 text-white/70">
                “Summarize this dossier as an executive brief with buyer-intent scoring and three
                outreach angles.” — generated on demand, never by default.
              </p>
            </div>
          }
        />
      </div>
    </>
  );
}

/* ---------- How it works ---------- */
export function HowItWorks() {
  const steps = [
    { n: '01', title: 'Start from intent', detail: 'Company, market, product, URL, or profile — not a telemetry screen.' },
    { n: '02', title: 'Work in a focused tool', detail: 'Each workspace keeps only the inputs and outputs for that job.' },
    { n: '03', title: 'Keep what matters', detail: 'Save dossiers, export CSV/JSON, or sync forward with source context.' },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white">
      <div className="cf-container cf-section">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="cf-eyebrow">Home → Dashboard → Tool</p>
            <h2 className="cf-h2">Less noise. Clear next step.</h2>
            <p className="cf-lead max-w-md">
              Home explains the product. Tools do the depth. The dashboard routes intent between
              them — no simulated telemetry, no inflated counters.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1f5bff] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(31,91,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#1749d6]"
            >
              Go to the dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-2.5">
            {steps.map((s) => (
              <div key={s.n} className="cf-card grid gap-3 p-5 sm:grid-cols-[56px_1fr] sm:items-center sm:p-6">
                <span className="font-mono text-sm font-bold text-[#1f5bff]">{s.n}</span>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0b1b3f]">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-[#55617c]">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Proof (role-based, no invented customers) ---------- */
export function ProofSection() {
  const cards = [
    {
      role: 'Sales & prospecting teams',
      title: 'From domain to call-ready in minutes',
      detail:
        'Enrich a target domain, skim verification and contact coverage, and save only the accounts worth calling — with the source trail intact.',
      href: '/tools/company-enrichment',
    },
    {
      role: 'Sourcing & procurement',
      title: 'Specs first, supplier shortlist second',
      detail:
        'Define the technical bar, compare live listings in a sortable matrix, then vet sellers on pricing tiers and terms before outreach.',
      href: '/tools/product-finder',
    },
    {
      role: 'Founders & job seekers',
      title: 'Shipped work becomes pipeline',
      detail:
        'Post Studio turns a live URL and repo into per-platform launch copy — so research output keeps working after the run ends.',
      href: '/tools/post-generator',
    },
  ];
  return (
    <section className="bg-[#f6f9ff]">
      <div className="cf-container cf-section">
        <p className="cf-eyebrow">Proof beats promises</p>
        <h2 className="cf-h2 max-w-2xl">Workflows teams actually repeat.</h2>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {cards.map((c) => (
            <article key={c.title} className="cf-card cf-card-hover flex flex-col p-6">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#1f5bff]">{c.role}</p>
              <h3 className="mt-2.5 text-lg font-extrabold tracking-tight text-[#0b1b3f]">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-[#55617c]">{c.detail}</p>
              <Link
                href={c.href}
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0b1b3f] transition hover:text-[#1f5bff]"
              >
                Open the workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const HOME_FAQS = [
  {
    q: 'Do I need API keys to start?',
    a: 'No. The base harvest across all workspaces is zero-cost and keyless. Keys are only needed if you want AI synthesis, and they stay in your browser localStorage.',
  },
  {
    q: 'Which workspace should I open first?',
    a: 'Match the question: a domain → Company enrichment; a market → Local discovery; a spec list → Product finder; a URL → Web crawler; a brand → Ad or Social intelligence.',
  },
  {
    q: 'Where does my research live?',
    a: 'Saved profiles land in Lead dossiers — a persistent account graph with ratings, remarks, lists and CSV/JSON/CRM export.',
  },
  {
    q: 'What is the dashboard for?',
    a: 'It is the router between home and tools: quick-launch into any workspace plus an overview of all four research categories.',
  },
  {
    q: 'Can I turn research into content?',
    a: 'Yes — Post Studio converts a live site and repo into copy-ready posts for LinkedIn, Instagram, Facebook, YouTube and X.',
  },
];

export function HomeFaq() {
  return (
    <section className="bg-white">
      <div className="cf-container cf-section">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="cf-eyebrow">FAQ</p>
            <h2 className="cf-h2">Frequently asked questions.</h2>
            <p className="cf-lead max-w-md">The short version — each workspace guides the rest hands-on.</p>
          </div>
          <div className="space-y-2.5">
            {HOME_FAQS.map((faq) => (
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
