'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles, Globe, MapPin, Package, Users, Cpu, Database, Server,
  Key, ShieldCheck, Terminal, Layers, Search, Compass, ChevronDown,
  ArrowRight, Zap, Activity, FileText, Bookmark, Hash
} from 'lucide-react';

const navLinkClass = (active: boolean) =>
  `text-[13.5px] font-medium tracking-tight transition flex items-center gap-1.5 py-1 ${active ? 'text-white' : 'text-slate-300 hover:text-white'}`;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const enter = (k: string) => { if (timer.current) clearTimeout(timer.current); setMega(k); };
  const leave = () => { timer.current = setTimeout(()=> setMega(null), 140); };

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[rgba(7,11,24,0.78)] backdrop-blur-xl">
      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 h-[64px] flex items-center justify-between gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-400 p-[1.2px] shadow-md shadow-indigo-500/20">
            <span className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </span>
          </span>
          <span className="leading-none">
            <span className="block font-extrabold tracking-[0.16em] text-[13px] bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">ENRICHER.AI</span>
            <span className="hidden sm:block text-[10px] tracking-[0.18em] text-slate-400 font-medium -mt-0.5">ZERO-API COST • STEALTH</span>
          </span>
        </Link>

        {/* Desktop nav — Squarespace-like spacious */}
        <nav className="hidden lg:flex items-center gap-7">
          {/* Products mega */}
          <div className="relative" onMouseEnter={()=> enter('products')} onMouseLeave={leave}>
            <button className={navLinkClass(!!mega && mega==='products' || isActive('/products') || isActive('/enrich') || isActive('/maps') || isActive('/actors'))}>
              Products <ChevronDown className={`w-3.5 h-3.5 transition ${mega==='products' ? 'rotate-180' : ''}`} />
            </button>
            {mega==='products' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[44px] w-[980px] max-w-[90vw] mega-menu-enter">
                <div className="rounded-2xl bg-[#0e142e] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden grid grid-cols-[1.15fr_1fr_1fr]">
                  <div className="p-6 border-r border-white/5 bg-white/[0.02]">
                    <div className="text-[11px] tracking-[0.14em] font-bold text-indigo-300 mb-3">SCRAPING SUITE</div>
                    {[
                      { href:'/enrich', icon:Globe, title:'Live Domain Enrichment', desc:'Headless stealth crawl → technographics + contacts + GST' },
                      { href:'/maps', icon:MapPin, title:'Google Maps & Keywords', desc:'Geo keyword matrix, reviews, lat/long, CSV/JSON' },
                      { href:'/products', icon:Package, title:'Product & Specs Finder', desc:'Universal specs, 500km radius, B2B wholesale matrix' },
                      { href:'/actors', icon:Users, title:'Actor Studio — Web & Social', desc:'Web content, Instagram, LinkedIn, Facebook, Meta Ads' },
                    ].map(i=> (
                      <Link key={i.href} href={i.href} className="flex gap-3 py-2.5 px-2 rounded-xl hover:bg-white/[0.06] transition">
                        <span className="w-8 h-8 rounded-lg bg-white text-slate-900 flex items-center justify-center shrink-0 mt-0.5"><i.icon className="w-4 h-4" /></span>
                        <span><span className="block text-sm font-semibold text-white">{i.title}</span><span className="block text-xs text-slate-400 leading-snug">{i.desc}</span></span>
                      </Link>
                    ))}
                  </div>
                  <div className="p-6 border-r border-white/5">
                    <div className="text-[11px] tracking-[0.14em] font-bold text-cyan-300 mb-3">REVOPS & DATA</div>
                    {[
                      { href:'/profiles', icon:Bookmark, title:'Saved Profiles & Graph', desc:'Dedupe, merge, CSV export' },
                      { href:'/queue', icon:Server, title:'BullMQ Engine', desc:'Redis queue, 3 browsers, logs' },
                      { href:'/settings', icon:Key, title:'2026 BYOK Hub', desc:'8 providers, 40+ frontier models' },
                      { href:'/settings', icon:ShieldCheck, title:'Safeguards & Rules', desc:'0% overwrite, confidence gating' },
                    ].map(i=> (
                      <Link key={i.href+i.title} href={i.href} className="flex gap-3 py-2.5 px-2 rounded-xl hover:bg-white/[0.06] transition">
                        <span className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0 mt-0.5"><i.icon className="w-4 h-4 text-slate-200" /></span>
                        <span><span className="block text-sm font-semibold text-white">{i.title}</span><span className="block text-xs text-slate-400">{i.desc}</span></span>
                      </Link>
                    ))}
                  </div>
                  <div className="p-6 bg-gradient-to-b from-indigo-600/15 to-transparent flex flex-col">
                    <div className="text-[11px] tracking-[0.14em] font-bold text-white mb-3">FOR SCALING TEAMS</div>
                    <div className="rounded-xl bg-white text-slate-900 p-4">
                      <div className="text-xs font-bold tracking-widest">ENRICHER PREMIUM</div>
                      <div className="text-sm font-semibold mt-1">Priority stealth + lowest latency</div>
                      <div className="text-xs text-slate-600 mt-1">Concierge onboarding, premium proxies, dedicated queue.</div>
                      <Link href="/products" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">Explore → <ArrowRight className="w-3 h-3" /></Link>
                    </div>
                    <div className="mt-auto pt-4 text-xs text-slate-400">Full-width spacious workspace • mx-auto px-20 • modern structure</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={()=> enter('solutions')} onMouseLeave={leave}>
            <button className={navLinkClass(!!mega && mega==='solutions')}>
              Solutions <ChevronDown className={`w-3.5 h-3.5 transition ${mega==='solutions' ? 'rotate-180' : ''}`} />
            </button>
            {mega==='solutions' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[44px] w-[760px] mega-menu-enter">
                <div className="rounded-2xl bg-[#0e142e] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-6 grid grid-cols-3 gap-6">
                  {[
                    { title:'B2B Sourcing', items:['IT & Electronics','Steel & Metals','Agri & Food','Solar & Energy','Textiles','Chemicals'] },
                    { title:'Go-to-Market', items:['Procurement Hubs','Wholesale Pricing','GST Verification','Technographics','Outreach Pitches','CRM Sync'] },
                    { title:'By Use Case', items:['Market Research','Lead Enrichment','Competitor Intel','Supplier Discovery','Ad Library Scan','Omnichannel 360'] },
                  ].map(col=> (
                    <div key={col.title}>
                      <div className="text-[11px] tracking-[0.14em] font-bold text-indigo-300 mb-3">{col.title.toUpperCase()}</div>
                      <ul className="space-y-2">
                        {col.items.map(it=> <li key={it}><Link href="/products" className="text-sm text-slate-300 hover:text-white">{it}</Link></li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={()=> enter('resources')} onMouseLeave={leave}>
            <button className={navLinkClass(false)}>
              Resources <ChevronDown className={`w-3.5 h-3.5 transition ${mega==='resources' ? 'rotate-180' : ''}`} />
            </button>
            {mega==='resources' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[44px] w-[520px] mega-menu-enter">
                <div className="rounded-2xl bg-[#0e142e] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-6 grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[11px] tracking-[0.14em] font-bold text-indigo-300 mb-3">LEARN</div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li><Link href="/queue" className="hover:text-white">Queue & Logs</Link></li>
                      <li><Link href="/settings" className="hover:text-white">BYOK Guide</Link></li>
                      <li><Link href="/profiles" className="hover:text-white">Account Graph</Link></li>
                    </ul>
                  </div>
                  <div className="rounded-xl bg-white text-slate-900 p-4">
                    <div className="text-xs font-bold tracking-widest">MADE WITH ENRICHER</div>
                    <div className="text-sm font-semibold mt-1">See live enriched dossiers.</div>
                    <Link href="/enrich" className="mt-2 inline-flex text-xs font-bold text-indigo-600">Open Live Demo →</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/products" className={navLinkClass(isActive('/products'))}>Templates</Link>
          <Link href="/settings" className={navLinkClass(isActive('/settings'))}>Pricing</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/enrich" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-[13px] font-bold shadow-sm hover:bg-slate-100 transition">
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/queue" className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] border border-white/10 text-slate-200 text-[13px] font-semibold hover:bg-white/[0.09] transition">
            <Activity className="w-3.5 h-3.5" /> Live
          </Link>
          <button onClick={()=> setMobileOpen(v=>!v)} className="lg:hidden w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white">
            <span className="text-lg leading-none">{mobileOpen ? '×' : '≡'}</span>
          </button>
        </div>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0a1024] px-6 py-4 space-y-3">
          <Link href="/enrich" onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-white"><Globe className="w-4 h-4" /> Live Domain</Link>
          <Link href="/maps" onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-white"><MapPin className="w-4 h-4" /> Maps & Keywords</Link>
          <Link href="/products" onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-white"><Package className="w-4 h-4" /> Products & Specs</Link>
          <Link href="/actors" onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-white"><Users className="w-4 h-4" /> Actor Studio</Link>
          <Link href="/profiles" onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-white"><Bookmark className="w-4 h-4" /> Profiles</Link>
          <Link href="/settings" onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-white"><Key className="w-4 h-4" /> BYOK Hub</Link>
          <Link href="/queue" onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-white"><Server className="w-4 h-4" /> Queue</Link>
        </div>
      )}
    </header>
  );
}
