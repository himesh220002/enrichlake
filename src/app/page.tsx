import Link from 'next/link';
import { Sparkles, Globe, MapPin, Package, Users, Bookmark, Server, Key, ShieldCheck, ArrowRight, Play, TrendingUp, Layers, Cpu, ShoppingBag, Zap, Database, Search, Compass, Terminal, Activity } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="bg-white text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* ===== HERO — Squarespace freeness: big type, spacious, full-width ===== */}
      <section className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 pt-10 lg:pt-14 pb-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-widest">ENRICHER.AI • ZERO-API COST • STEALTH</div>
            <h1 className="mt-5 text-[42px] lg:text-[68px] font-black leading-[0.9] tracking-tight">A lead<br/>makes it real.</h1>
            <p className="mt-4 text-[18px] leading-relaxed text-slate-600 max-w-xl">Headless stealth scraping, technographics, and GST-verified B2B sourcing — all in one spacious, modern workspace. No congested tabs.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/enrich" className="px-7 py-3.5 rounded-full bg-slate-900 text-white font-bold text-sm inline-flex items-center gap-2">Start enriching → <ArrowRight className="w-4 h-4" /></Link>
              <Link href="/products" className="px-7 py-3.5 rounded-full bg-white border border-slate-200 text-slate-900 font-bold text-sm">Explore products</Link>
            </div>
            <div className="mt-4 text-xs text-slate-500">Start for free. No credit card required.</div>
          </div>
          {/* Visual — full-bleed mock */}
          <div className="relative rounded-[28px] overflow-hidden bg-slate-50 border border-slate-200 aspect-[1.35/1] flex items-center justify-center">
            <div className="absolute inset-3 rounded-[20px] bg-white border border-slate-200 shadow-xl overflow-hidden">
              <div className="h-9 border-b border-slate-100 flex items-center gap-1.5 px-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-mono text-slate-400">enricher.ai/products</span>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3">
                {['Acer Nitro V15','TMT Steel Fe 500D','1121 Sella Basmati','Solar 550W Bifacial','IPA 99.9%','Hydraulic CETOP3'].map(t=> (
                  <div key={t} className="rounded-xl border border-slate-200 p-2">
                    <div className="text-[11px] font-bold text-slate-900 line-clamp-1">{t}</div>
                    <div className="text-[10px] font-mono text-emerald-600 mt-1">₹68,500 • GST/ITC</div>
                    <div className="h-10 mt-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400">Marketplace</div>
                  </div>
                ))}
              </div>
              <div className="mx-3 mb-3 h-16 rounded-xl bg-slate-900 text-white p-3 flex items-center justify-between">
                <div><div className="text-xs font-bold">BullMQ • Stealth Engine</div><div className="text-[11px] text-slate-400">3 browsers • Redis • 60-step logs</div></div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">Live</span>
              </div>
            </div>
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold shadow">Space for integrations ↑</span>
          </div>
        </div>
        {/* Stats like Squarespace: 14M etc */}
        <div className="mt-10 grid grid-cols-3 gap-6 border-y border-slate-200 py-6">
          {[
            { k:'152+', v:'Enriched records demo', sub:'DOM + schema nodes' },
            { k:'$68.40', v:'Cost saved demo', sub:'vs ZoomInfo $0.45/rec' },
            { k:'0% ', v:'Overwrite shield', sub:'CRM field protection' },
          ].map(s=> (
            <div key={s.k} className="text-center lg:text-left">
              <div className="text-3xl font-black tracking-tight">{s.k}</div>
              <div className="text-sm font-semibold text-slate-700">{s.v}</div>
              <div className="text-xs text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-500">Join teams who run B2B sourcing on Enricher — full-width, mx-auto, px-20.</div>
      </section>

      {/* ===== GROW YOUR BUSINESS — 8 spacious tool cards ===== */}
      <section className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 py-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-[30px] lg:text-[42px] font-black tracking-tight leading-none">Grow your pipeline</h2>
            <p className="mt-2 text-slate-600 max-w-2xl">You deserve spacious tools — each on its own page, elaborated to maximum integrations and modern looks.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Open full dashboard →</Link>
        </div>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { href:'/enrich', icon:Globe, title:'Live Domain Enrichment', desc:'Crawl any domain → contacts, tech, GST, verification.', badge:'Stealth + AI', great:'SaaS • Fintech • Agencies' },
            { href:'/maps', icon:MapPin, title:'Google Maps & Keywords', desc:'Keyword matrix, ratings, lat/long, phone & website.', badge:'Geo matrix', great:'Local • Retail • Franchise' },
            { href:'/products', icon:Package, title:'Product & Specs Finder', desc:'Universal specs, price, 500km radius, wholesale matrix.', badge:'B2B matrix', great:'Electronics • Steel • Agri' },
            { href:'/actors', icon:Users, title:'Actor Studio', desc:'Web content → markdown, social + Meta Ads + 360° fusion.', badge:'Omnichannel', great:'Research • Agencies' },
            { href:'/profiles', icon:Bookmark, title:'Saved Profiles & Graph', desc:'Dedupe, merge, CSV export, account graph.', badge:'Workspace', great:'RevOps • Sales' },
            { href:'/queue', icon:Server, title:'BullMQ Engine', desc:'Redis queue, 3 browsers, progress shimmer, logs.', badge:'Infra', great:'Scale • Ops' },
            { href:'/settings', icon:Key, title:'2026 BYOK Hub', desc:'8 providers • 40+ frontier models • real agent pipeline.', badge:'AI', great:'RevOps • AI Teams' },
            { href:'/settings', icon:ShieldCheck, title:'Safeguards & Rules', desc:'0% overwrite, confidence gating, stale-data shield.', badge:'Trust', great:'CRM • Admin' },
          ].map(c=> (
            <Link key={c.title} href={c.href} className="group rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition bg-white">
              <div className="h-40 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative">
                <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center"><c.icon className="w-5 h-5" /></span>
                <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold">{c.badge}</span>
              </div>
              <div className="p-4">
                <div className="text-sm font-bold text-slate-900">{c.title}</div>
                <div className="text-sm text-slate-600 mt-1 leading-snug">{c.desc}</div>
                <div className="text-xs text-slate-500 mt-2">Great for: {c.great}</div>
                <div className="mt-3 text-sm font-bold text-indigo-600 group-hover:text-indigo-700">Open →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== EVERYTHING YOU NEED — platform strip ===== */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 py-10">
          <h2 className="text-[28px] lg:text-[36px] font-black tracking-tight">Everything you need on one platform</h2>
          <p className="text-slate-600 max-w-2xl mt-2">Spacious, full-width workspace with integrations and AI guidance — seamlessly separated, not congested.</p>
          <div className="mt-6 grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title:'Extensions', desc:'Indiamart, TradeIndia, Alibaba, Apollo compat' },
              { title:'Stealth Payments-Bypass', desc:'No vendor fees • headless • zero overhead' },
              { title:'Analytics', desc:'Coverage audit, noise reduction, candidate nodes' },
              { title:'Design Intelligence', desc:'Taxonomy-aware keyword mapping, AI specs' },
              { title:'Domains & Enrich', desc:'Any domain • technographics • GST' },
              { title:'Maps & Geo', desc:'Haversine 500km • pan-India • worldwide' },
              { title:'Actor Fusion', desc:'Web + IG + FB + Ads → unified dossier' },
              { title:'CRM Sync', desc:'HubSpot & Salesforce • safe diff • 0% overwrite' },
            ].map(x=> (
              <div key={x.title} className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="text-sm font-bold text-slate-900">{x.title}</div>
                <div className="text-sm text-slate-600 mt-1">{x.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEMPLATES — Squarespace "start with template" ===== */}
      <section className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 py-10">
        <div className="rounded-[28px] bg-slate-900 text-white p-6 lg:p-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold tracking-widest">GETTING STARTED • AI</div>
            <h3 className="mt-3 text-[28px] lg:text-[38px] font-black leading-tight">Start with a business template designed for your sourcing</h3>
            <p className="mt-2 text-slate-300">14 procurement presets — IT, steel, agri, solar, textiles, chemicals, machinery & PPE. Each page now breathes with full integrations.</p>
            <Link href="/products" className="mt-5 inline-flex px-6 py-3 rounded-full bg-white text-slate-900 font-bold">Browse templates →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Acer Nitro V15','TMT Fe 500D','Basmati 1121','Solar 550W','Cotton 220 GSM','IPA 99.9%'].map(t=> (
              <div key={t} className="rounded-2xl bg-white text-slate-900 p-4">
                <div className="text-xs font-bold">{t}</div>
                <div className="text-xs text-slate-500 mt-1">Category • Specs • Price</div>
                <div className="mt-3 h-20 rounded-xl bg-slate-50 border border-dashed border-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS + FAQ like Squarespace ===== */}
      <section className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 py-10 grid lg:grid-cols-2 gap-10">
        <div>
          <h3 className="text-2xl font-black tracking-tight">How to enrich a lead</h3>
          <ol className="mt-4 space-y-4 list-decimal pl-5 marker:font-bold">
            <li><b>Choose a dedicated page</b> — each tool is spacious, full-width, mx-auto, px-20.</li>
            <li><b>Feed specs or domain</b> — taxonomy-aware → optimized queries.</li>
            <li><b>Run & audit</b> — coverage audit, logs, confidence.</li>
            <li><b>Export & sync</b> — CSV/JSON, profiles, CRM safe-sync.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
          <h4 className="font-bold">Frequently asked</h4>
          <div className="mt-3 space-y-3 text-sm">
            <div><b>Why separate pages?</b> — No more congested tabs; each scraper gets spacious integrations and filters.</div>
            <div><b>Is the nav new?</b> — Yes: full-width, mega-menus like Squarespace, with Products/Solutions/Resources.</div>
            <div><b>Do I lose dashboard?</b> — No: <Link href="/dashboard" className="text-indigo-600 font-bold">/dashboard</Link> still holds the classic batched view.</div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 pb-10">
        <div className="rounded-[28px] bg-indigo-600 text-white p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black">Ready to make data real?</h3>
            <p className="text-white/80 mt-1">Open any tool as a spacious page — modern, smooth, full-width.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/enrich" className="px-7 py-3 rounded-full bg-white text-slate-900 font-bold">Get Started</Link>
            <Link href="/dashboard" className="px-7 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold">Open Dashboard</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
