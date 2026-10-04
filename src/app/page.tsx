import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import ScrollVideoHero from '@/components/ScrollVideoHero';
import HomeNavigation from '@/components/HomeNavigation';
import HomeToolCards from '@/components/HomeToolCards';

export const metadata: Metadata = {
  title: 'Enricher AI — Turn the open web into usable intelligence',
  description: 'Dedicated research workspaces for company enrichment, local discovery, product sourcing, web crawling, and social intelligence.',
};

const principles = [
  { number: '01', title: 'Choose the job first', detail: 'A clear starting point makes a research run feel deliberate—not like navigating a control panel.', Icon: Layers },
  { number: '02', title: 'Keep controls in context', detail: 'Every workspace opens with the input, filters, integrations, and outputs that matter to that job.', Icon: FileText },
  { number: '03', title: 'Take usable signals forward', detail: 'Save, inspect, enrich, and export your research without losing its source or confidence context.', Icon: ShieldCheck },
];

export default function HomePage() {
  return (
    <main className="home-page min-h-screen bg-[#080b16] text-slate-100">
      {/* Dynamic Single Navigation Bar */}
      <HomeNavigation />

      {/* 1. Main Hero: Scroll Animation Video (public/herovideo.mp4) */}
      <ScrollVideoHero />

      {/* 2. Secondary Hero: Interactive Research Console & Value Proposition */}
      <div id="secondary-hero" className="relative w-full scroll-mt-16 overflow-hidden pt-20 md:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="home-halo home-halo-one" />
          <div className="home-halo home-halo-two" />
        </div>

        <section className="relative z-10 mx-auto grid max-w-[1600px] gap-14 px-5 pb-24 pt-10 sm:px-10 md:pt-16 xl:grid-cols-[0.92fr_1.08fr] xl:px-20 xl:pb-32">
          <div className="flex max-w-2xl flex-col justify-center xl:pr-8">
            <p className="home-eyebrow mb-7 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-cyan-100"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" /> RESEARCH, WITH A CLEARER START</p>
            <h1 className="max-w-3xl text-balance text-5xl font-black leading-[0.98] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl">Turn the open web into your most useful signal.</h1>
            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">Enricher gives every research job its own spacious workspace—from company profiles and local discovery to supplier sourcing, web crawling, and public social signals.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/tools/company-enrichment" className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 px-6 py-4 text-sm font-extrabold text-slate-950 shadow-[0_12px_50px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5">Explore the workspaces <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white">View full dashboard <ExternalLink className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Dedicated tool URLs</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Source-aware records</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Bring-your-own AI</span>
            </div>
          </div>

          <div className="home-console-wrap relative mx-auto w-full max-w-[760px] self-center xl:max-w-none">
            <div className="home-console-shadow" aria-hidden="true" />
            <div className="home-console relative overflow-hidden rounded-[32px] border border-white/[0.14] p-3 shadow-2xl shadow-black/50 sm:p-5">
              <div className="home-console-top flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-300 text-slate-950"><Sparkles className="h-4 w-4" /></span><div><p className="text-[11px] font-bold tracking-wide text-white">Research control room</p><p className="text-[10px] text-slate-500">7 dedicated workspaces online</p></div></div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Ready</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1.17fr_0.83fr]">
                <section className="home-console-main min-h-[320px] rounded-2xl p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Active brief</p><h2 className="mt-2 text-xl font-extrabold tracking-tight text-white">Company enrichment</h2></div><span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-400">DOMAIN</span></div>
                  <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#0a1020]/80 p-3"><div className="flex items-center gap-2 text-xs text-slate-400"><Globe className="h-3.5 w-3.5 text-cyan-300" /> acme.example</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400" /></div></div>
                  <div className="mt-3 grid grid-cols-2 gap-3"><div className="home-console-tile rounded-xl p-3"><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Signals</span><strong className="mt-2 block text-2xl tracking-tight text-white">28</strong><span className="text-[10px] text-emerald-300">+7 verified</span></div><div className="home-console-tile rounded-xl p-3"><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Coverage</span><strong className="mt-2 block text-2xl tracking-tight text-white">94%</strong><span className="text-[10px] text-cyan-300">high confidence</span></div></div>
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] p-3 text-xs"><span className="font-semibold text-slate-200">Dossier is ready for review</span><ArrowRight className="h-4 w-4 text-cyan-300" /></div>
                </section>
                <div className="grid gap-3"><section className="home-console-side rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Channels</span><Layers className="h-4 w-4 text-violet-300" /></div><div className="mt-4 space-y-3">{['Website & schema', 'Contact surface', 'Tech stack', 'Social presence'].map((channel, index) => <div key={channel} className="flex items-center gap-2.5"><span className={`h-2 w-2 rounded-full ${index < 3 ? 'bg-cyan-300' : 'bg-slate-600'}`} /><span className="text-xs text-slate-300">{channel}</span></div>)}</div></section><section className="home-console-side home-console-orbit relative min-h-[142px] overflow-hidden rounded-2xl p-4"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Signal quality</span><div className="absolute bottom-[-34px] right-[-22px] grid h-36 w-36 place-items-center rounded-full border border-cyan-300/15"><div className="grid h-24 w-24 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/[0.07] text-center"><strong className="text-2xl tracking-tight text-white">92</strong><span className="-mt-5 text-[9px] uppercase tracking-widest text-cyan-200">score</span></div></div><div className="absolute bottom-5 left-4"><p className="text-xs font-semibold text-white">Source-aware</p><p className="mt-1 max-w-[130px] text-[10px] leading-4 text-slate-500">Every output keeps its research context.</p></div></section></div>
              </div>
            </div>
            {/* <div className="home-console-float home-float-one hidden rounded-2xl border border-white/[0.14] px-4 py-3 shadow-xl sm:flex"><Database className="h-4 w-4 text-cyan-300" /><span><strong>0</strong> busy queues</span></div>
          <div className="home-console-float home-float-two hidden rounded-2xl border border-white/[0.14] px-4 py-3 shadow-xl sm:flex"><Zap className="h-4 w-4 text-amber-300" /><span>Start from a job, not a tab</span></div> */}
          </div>
        </section>
      </div>

      <section id="workspaces" className="relative z-10 overflow-hidden border-y border-white/[0.06] bg-white/[0.018] py-24 sm:py-28"><div className="mx-auto max-w-[1600px] px-5 sm:px-10 xl:px-20"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[0.23em] text-cyan-300">One workflow per tool</p><h2 className="mt-4 text-balance text-4xl font-black leading-none tracking-[-0.055em] text-white sm:text-5xl">Room to do every kind of research well.</h2></div><p className="max-w-md text-sm leading-6 text-slate-400">Start with the question in front of you. Each tool route removes unrelated controls while leaving its full depth available.</p></div><HomeToolCards /></div></section>

      <section id="approach" className="relative z-10 overflow-hidden mx-auto max-w-[1600px] px-5 py-24 sm:px-10 sm:py-32 xl:px-20"><div className="grid gap-12 xl:grid-cols-[0.78fr_1.22fr] xl:gap-20"><div><p className="text-[10px] font-bold uppercase tracking-[0.23em] text-cyan-300">Designed around real work</p><h2 className="mt-4 text-balance text-4xl font-black leading-none tracking-[-0.055em] text-white sm:text-5xl">Less interface noise. More room to investigate.</h2><p className="mt-6 max-w-md text-base leading-7 text-slate-400">The home page directs intent. The focused tool page handles depth. The dashboard remains available when your work crosses more than one surface.</p><Link href="/dashboard" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 transition hover:text-white">Go to the complete dashboard <ArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-3">{principles.map(({ number, title, detail, Icon }) => <article key={number} className="group grid gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-cyan-300/20 hover:bg-white/[0.05] sm:grid-cols-[60px_1fr_auto] sm:items-center sm:p-6"><span className="font-mono text-sm font-bold text-cyan-300">{number}</span><div><h3 className="text-lg font-bold tracking-tight text-white">{title}</h3><p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-400">{detail}</p></div><span className="hidden h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 sm:grid"><Icon className="h-4 w-4" /></span></article>)}</div></div></section>

      <section className="relative z-10 overflow-hidden mx-auto max-w-[1600px] px-5 pb-10 sm:px-10 xl:px-20"><div className="home-cta rounded-[30px] border border-cyan-200/[0.13] px-6 py-12 text-center sm:px-12 sm:py-16"><p className="text-[10px] font-bold uppercase tracking-[0.23em] text-cyan-200">YOUR NEXT RESEARCH RUN</p><h2 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-black leading-none tracking-[-0.055em] text-white sm:text-5xl">Open the workspace that matches the question.</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-400">Begin with a company, a location, a product specification, a URL, or a public profile.</p><Link href="/tools/company-enrichment" className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-100">Start enriching <ArrowRight className="h-4 w-4" /></Link></div></section>
      <footer className="relative z-10 mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-10 xl:px-20"><span>ENRICHERLAKE · focused intelligence workspaces</span><Link className="transition hover:text-slate-300" href="/dashboard">Open dashboard</Link></footer>
    </main>
  );
}
