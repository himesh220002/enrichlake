'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  Globe,
  Database,
  ShieldCheck,
  Zap,
  Search,
  ArrowRight,
  RefreshCw,
  BarChart2,
  Cpu,
  Layers,
  Sparkles,
  Radio,
  Terminal,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  TrendingUp,
  Maximize2,
  FileText,
  Building2,
  ShoppingBag,
  MapPin,
  Users,
  Wifi,
  Compass,
  ArrowUpRight,
  Check,
  ChevronRight,
  Package,
} from 'lucide-react';

interface CrawlerFeed {
  id: string;
  name: string;
  type: string;
  volume: string;
  density: string;
  status: 'active' | 'syncing' | 'standby';
  latency: string;
}

export default function HarvestCommandCenter() {
  const [time, setTime] = useState<string>('');
  const [activeRange, setActiveRange] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [savedProfilesCount, setSavedProfilesCount] = useState<number>(0);
  const [quickSearchInput, setQuickSearchInput] = useState<string>('');
  const [quickSearchTarget, setQuickSearchTarget] = useState<'company' | 'product' | 'maps' | 'actor'>('company');
  const [simulatedPulse, setSimulatedPulse] = useState<number>(0);
  const [radarHoverAxis, setRadarHoverAxis] = useState<string | null>(null);

  // Live time updater
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic visual pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedPulse((p) => (p + 1) % 100);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Read saved profiles from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('enricher_saved_profiles');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedProfilesCount(parsed.length);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Live Crawler Streams table data (matching Image 1 "Inside sources")
  const feeds: CrawlerFeed[] = [
    {
      id: 'FEED-01',
      name: 'Universal B2B Product & Specs Stream',
      type: 'Marketplace & Vendor Catalog',
      volume: '24.31M',
      density: '22.87%',
      status: 'active',
      latency: '18ms',
    },
    {
      id: 'FEED-02',
      name: 'Live Technographic & DNS Telemetry',
      type: 'WHOIS / CDN / TLS Mesh',
      volume: '28.17K',
      density: '33.0%',
      status: 'active',
      latency: '24ms',
    },
    {
      id: 'FEED-03',
      name: 'Omnichannel SERP & Local Radar Node',
      type: 'Geo-Spatial Merchant Graph',
      volume: '14.92M',
      density: '19.4%',
      status: 'syncing',
      latency: '31ms',
    },
    {
      id: 'FEED-04',
      name: 'Headless Actor Stealth Scraper Mesh',
      type: 'DOM + Microdata Extraction',
      volume: '5.88M',
      density: '12.1%',
      status: 'active',
      latency: '14ms',
    },
  ];

  // Radar pentagon points calculation (Pentagon with 5 axes)
  // Center: (150, 150), Radius: 100
  // Angles: -90, -18, 54, 126, 198
  const radarAxes = [
    { name: 'Market synergy', angle: -90, score: 95, label: 'Market synergy' },
    { name: 'Domain synergy', angle: -18, score: 88, label: 'Domain synergy' },
    { name: 'Location proximity', angle: 54, score: 94, label: 'Location proximity' },
    { name: 'Location synergy', angle: 126, score: 91, label: 'Location synergy' },
    { name: 'Target synergy', angle: 198, score: 92, label: 'Target synergy' },
  ];

  const radarPolygonPoints = useMemo(() => {
    const cx = 150;
    const cy = 150;
    const maxR = 95;
    return radarAxes
      .map((axis) => {
        const rad = (axis.angle * Math.PI) / 180;
        const r = (axis.score / 100) * maxR;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, []);

  const getQuickSearchUrl = () => {
    const q = encodeURIComponent(quickSearchInput.trim());
    if (!q) return '/tools/company-enrichment';
    if (quickSearchTarget === 'company') return `/tools/company-enrichment`;
    if (quickSearchTarget === 'product') return `/tools/product-finder`;
    if (quickSearchTarget === 'maps') return `/tools/local-business`;
    return `/tools/web-scraper`;
  };

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top ambient aura */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] bg-gradient-to-b from-cyan-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ===================================================================== */}
      {/* 1. TOP COMMAND BAR (Inspired by "AI INFORMATION HARVESTING" Monitor)   */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#060a16]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 sm:px-8 py-3">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Branding & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition"
              title="Return to Home"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black tracking-[0.2em] font-mono text-white flex items-center gap-1.5">
                  <span>ENRICHER.AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <div className="text-[9px] font-mono text-cyan-400/70 tracking-wider">
                  COMMAND CONSOLE
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 pl-3 border-l border-white/[0.08]">
              <span className="text-slate-400">SYS_V2.1</span>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400 font-semibold">HARVEST_MESH</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300">LIVE_TELEMETRY</span>
            </div>
          </div>

          {/* Center: Monospace Title Display */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-slate-100 uppercase">
              AI INFORMATION HARVESTING
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/40">
              CORE V2.1
            </span>
          </div>

          {/* Right: Telemetry Clock, Timeframe Switcher & Tool Quick Jump */}
          <div className="flex items-center gap-3">
            {/* Range Switcher */}
            <div className="hidden sm:flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-white/[0.08] text-[11px] font-mono">
              {(['1H', '24H', '7D', '30D'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRange(r)}
                  className={`px-2 py-1 rounded transition ${
                    activeRange === r
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Live UTC Clock */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/[0.06] text-[11px] font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{time || 'LIVE UTC SYNC'}</span>
            </div>

            {/* Quick Workspace Switcher Button */}
            <Link
              href="/tools/company-enrichment"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition"
            >
              <span>ENTER WORKSPACE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MAIN COMMAND CENTER BODY                                              */}
      {/* ===================================================================== */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Quick Search & Launch Action Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/30 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Direct Workspace Ingestion & Search
              </div>
              <div className="text-[11px] text-slate-400">
                Launch immediate live enrichment or deep crawl with zero-API overhead
              </div>
            </div>
          </div>

          {/* Quick Target Input */}
          <div className="flex items-center gap-2 w-full md:max-w-xl">
            <select
              value={quickSearchTarget}
              onChange={(e) => setQuickSearchTarget(e.target.value as any)}
              className="bg-slate-950 border border-white/[0.12] rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="company">Domain / Company</option>
              <option value="product">Universal Product</option>
              <option value="maps">Local Business</option>
              <option value="actor">Actor Crawler</option>
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                value={quickSearchInput}
                onChange={(e) => setQuickSearchInput(e.target.value)}
                placeholder={
                  quickSearchTarget === 'company'
                    ? 'Enter domain (e.g. stripe.com)...'
                    : quickSearchTarget === 'product'
                    ? 'Search product or spec (e.g. RTX 3050)...'
                    : quickSearchTarget === 'maps'
                    ? 'Search place & city (e.g. Cafes in Austin)...'
                    : 'Enter target URL to crawl...'
                }
                className="w-full bg-slate-950/90 border border-white/[0.12] rounded-xl pl-3 pr-8 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <Link
              href={getQuickSearchUrl()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 transition shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <span>LAUNCH</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ROW 1: CORE TELEMETRY & ENGINE GAUGES (MATCHING USER'S PHOTO)         */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: AI READINESS / CORE V2.1 */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
              <span className="font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>AI READINESS</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Core V2.1 NET%
              </span>
            </div>

            <div className="py-5 flex items-center justify-between gap-4">
              {/* Radial Dial 544% */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0e172a"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset="38"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-lg font-black font-mono text-cyan-300 tracking-tight">
                    544%
                  </div>
                  <div className="text-[9px] font-mono uppercase text-slate-400">
                    Overscan
                  </div>
                </div>
              </div>

              {/* Number Gross V2.0 Elements */}
              <div className="space-y-1 text-right">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  1,993,989
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Gross V2.0 Harvest Elements
                </div>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-1">
                  <Check className="w-3 h-3" />
                  <span>Layer 4 DOM Normalization</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between">
              <span>EXTRACTION FIDELITY</span>
              <span className="text-cyan-400 font-bold">99.82% Lossless</span>
            </div>
          </div>

          {/* Card 2: CORE V2.1 TELEMETRY EQUALIZER */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Core V2.1 Telemetry</span>
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-3 h-3" />
              </div>
            </div>

            <div className="py-4 flex items-center justify-between gap-4">
              {/* Dial 377 Nodes */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#0e172a"
                    strokeWidth="7"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="7"
                    strokeDasharray="238.7"
                    strokeDashoffset="60"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-base font-black font-mono text-indigo-200">
                    377
                  </div>
                  <div className="text-[8px] font-mono text-slate-400 uppercase">
                    Nodes
                  </div>
                </div>
              </div>

              {/* Bar equalizers (Sentiment, Platform, Multi-tenant, Localization) */}
              <div className="flex-1 space-y-1.5 text-[10px] font-mono">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Sentiment</span>
                    <span className="text-indigo-300">92%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[92%]" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Platform</span>
                    <span className="text-cyan-300">98%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full w-[98%]" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Localization</span>
                    <span className="text-emerald-300">89%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[89%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between">
              <span>CLUSTER SYNC</span>
              <span className="text-emerald-400 font-bold">5 Edge Regions Active</span>
            </div>
          </div>

          {/* Card 3: AI ENHANCEMENT ENGINE (3 Radial Dials: 493, 62%, 236) */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>AI ENHANCEMENT ENGINE</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">V2.4 Stream</span>
            </div>

            {/* 3 Rings */}
            <div className="py-4 grid grid-cols-3 gap-2 text-center">
              {/* Ring 1: 493 Reach */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#0e172a" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="8"
                      strokeDasharray="238.7"
                      strokeDashoffset="45"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-black text-cyan-300">
                    493
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-bold mt-1">Reach</div>
                <div className="text-[9px] font-mono text-slate-500">Density</div>
              </div>

              {/* Ring 2: 62% Fusion */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#0e172a" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray="238.7"
                      strokeDashoffset="90"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-black text-emerald-300">
                    62%
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-bold mt-1">Fusion</div>
                <div className="text-[9px] font-mono text-slate-500">Ratio Space</div>
              </div>

              {/* Ring 3: 236 Total */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#0e172a" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="8"
                      strokeDasharray="238.7"
                      strokeDashoffset="55"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-black text-violet-300">
                    236
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-bold mt-1">Total</div>
                <div className="text-[9px] font-mono text-slate-500">Vectors</div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between">
              <span>HEURISTIC NLP ENGINE</span>
              <span className="text-amber-400 font-bold">100% Zero-API Cost</span>
            </div>
          </div>

          {/* Card 4: MARKET SYNERGY COMPARISON BAR */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>MARKET SYNERGY</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">1.8M Entities</span>
            </div>

            {/* Vertical Multi-Bar Chart (Jan, May, Nov, Mar, Sep) */}
            <div className="py-4 flex items-end justify-between gap-3 h-28 px-2">
              {[
                { label: 'Jan', h: '60%', count: '1.2M' },
                { label: 'May', h: '85%', count: '1.5M' },
                { label: 'Nov', h: '45%', count: '900K' },
                { label: 'Mar', h: '100%', count: '1.8M', highlight: true },
                { label: 'Sep', h: '75%', count: '1.4M' },
              ].map((col) => (
                <div key={col.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      col.highlight
                        ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={{ height: col.h }}
                    title={`${col.label}: ${col.count}`}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{col.label}</span>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between">
              <span>CROSS-DOMAIN MATCH</span>
              <span className="text-cyan-300 font-bold">+34.8% Synergy</span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ROW 2: BUSINESS SYNERGY ENGINE & SYNERGY RADAR (MATCHING USER'S PHOTO)*/}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center-Left: BUSINESS SYNERGY ENGINE (7 Columns) */}
          <div className="lg:col-span-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-6 relative overflow-hidden flex flex-col justify-between space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-100">
                    BUSINESS SYNERGY ENGINE
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Autonomous entity match velocity & commercial value progression
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">Peak Yield</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  0.110 → 277.04 MAX
                </span>
              </div>
            </div>

            {/* Stepped Bar Chart with Upward Trajectory Trend Line */}
            <div className="relative h-56 w-full pt-4">
              {/* Subtle background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
                <div className="border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-b border-white" />
              </div>

              {/* Bars container */}
              <div className="relative z-10 h-full flex items-end justify-between gap-3 px-4 pb-6">
                {[
                  { month: 'Jan', val: 11.0, h: '16%', color: 'bg-emerald-950/60 border-emerald-500/30' },
                  { month: 'Apr', val: 28.5, h: '28%', color: 'bg-emerald-900/60 border-emerald-500/40' },
                  { month: 'May', val: 53.7, h: '42%', color: 'bg-emerald-800/60 border-emerald-500/50' },
                  { month: 'Jun', val: 134.4, h: '60%', color: 'bg-emerald-700/60 border-emerald-400/60' },
                  { month: 'Nov', val: 189.6, h: '78%', color: 'bg-emerald-600/70 border-emerald-400/70' },
                  { month: 'Dec', val: 277.04, h: '98%', color: 'bg-emerald-500 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]' },
                ].map((b) => (
                  <div key={b.month} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <span className="text-[10px] font-mono text-emerald-300 font-bold mb-1 opacity-80 group-hover:opacity-100">
                      {b.val}
                    </span>
                    <div
                      className={`w-full rounded-t-lg border-t border-x transition-all duration-300 ${b.color}`}
                      style={{ height: b.h }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 mt-2">{b.month}</span>
                  </div>
                ))}
              </div>

              {/* SVG Glowing Trajectory Line Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 px-8 pb-6">
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="20,170 85,150 150,125 215,90 280,55 350,15"
                  className="drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                />
                {/* Dots along path */}
                <circle cx="20" cy="170" r="4" fill="#10b981" />
                <circle cx="85" cy="150" r="4" fill="#10b981" />
                <circle cx="150" cy="125" r="4" fill="#10b981" />
                <circle cx="215" cy="90" r="4" fill="#10b981" />
                <circle cx="280" cy="55" r="4" fill="#10b981" />
                <circle cx="350" cy="15" r="6" fill="#34d399" className="animate-pulse" />
              </svg>
            </div>

            {/* Bottom 3 Summary Metric Badges (matching 484.28%, 333%, 529%) */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Alpha Expansion</span>
                <span className="text-base font-black font-mono text-emerald-400 mt-0.5 block">
                  484.28%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Synergy Velocity</span>
                <span className="text-base font-black font-mono text-cyan-400 mt-0.5 block">
                  333%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Cross-Node Yield</span>
                <span className="text-base font-black font-mono text-indigo-400 mt-0.5 block">
                  529%
                </span>
              </div>
            </div>
          </div>

          {/* Right / Center-Right: SYNERGY RADAR (5 Columns — Matching User's Pentagon Radar Photo) */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-6 relative overflow-hidden flex flex-col justify-between space-y-4">
            {/* Header with Green Checkmark Badges */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>SYNERGY RADAR MATRIX</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Multi-axial correlation & proximity verification
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <Check className="w-3 h-3" />
                  <span>Best (95%)</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1 font-bold">
                  <Check className="w-3 h-3" />
                  <span>Location (94%)</span>
                </span>
              </div>
            </div>

            {/* Pentagon SVG Radar Canvas */}
            <div className="relative flex items-center justify-center py-2">
              <svg className="w-72 h-72" viewBox="0 0 300 300">
                {/* Background concentric pentagons (Levels: 20%, 40%, 60%, 80%, 100%) */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, idx) => {
                  const pts = radarAxes
                    .map((axis) => {
                      const rad = (axis.angle * Math.PI) / 180;
                      const r = 95 * scale;
                      const x = 150 + r * Math.cos(rad);
                      const y = 150 + r * Math.sin(rad);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={idx}
                      points={pts}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.15)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Axis Radial Lines */}
                {radarAxes.map((axis, idx) => {
                  const rad = (axis.angle * Math.PI) / 180;
                  const x = 150 + 95 * Math.cos(rad);
                  const y = 150 + 95 * Math.sin(rad);
                  return (
                    <line
                      key={idx}
                      x1="150"
                      y1="150"
                      x2={x}
                      y2={y}
                      stroke="rgba(148, 163, 184, 0.25)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  );
                })}

                {/* Filled Radar Polygon (Green/Cyan Glow matching photo) */}
                <polygon
                  points={radarPolygonPoints}
                  fill="rgba(16, 185, 129, 0.22)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  className="drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                />

                {/* Vertex Dots with Labels */}
                {radarAxes.map((axis, idx) => {
                  const rad = (axis.angle * Math.PI) / 180;
                  const r = (axis.score / 100) * 95;
                  const x = 150 + r * Math.cos(rad);
                  const y = 150 + r * Math.sin(rad);

                  // Label positions slightly further out
                  const labelR = 120;
                  const lx = 150 + labelR * Math.cos(rad);
                  const ly = 150 + labelR * Math.sin(rad);

                  return (
                    <g key={idx}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#34d399"
                        stroke="#064e3b"
                        strokeWidth="1.5"
                        className="cursor-pointer"
                        onMouseEnter={() => setRadarHoverAxis(axis.name)}
                        onMouseLeave={() => setRadarHoverAxis(null)}
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[9px] font-mono font-bold fill-slate-300 uppercase tracking-tighter"
                      >
                        {axis.name} ({axis.score}%)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Radar status footer */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">GLOBAL HARVEST COMPLIANCE</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>94.8% OPTIMAL SYNERGY</span>
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ROW 3: TARGET LATENCY POSTURE & INSIDE SOURCES FEEDS TABLE            */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Target Latency Posture / Waveform (4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                  BURST POSTURE & LATENCY
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100% STEALTH
              </span>
            </div>

            {/* Waveform Line */}
            <div className="h-32 relative bg-slate-950/80 rounded-xl border border-white/[0.04] p-2 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  points="0,60 20,55 40,75 60,30 80,65 100,45 120,80 140,25 160,50 180,35 200,60 220,20 240,40 260,30 280,55 300,45"
                  className="drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                />
              </svg>
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400">
                Avg Response: <span className="text-cyan-400 font-bold">18.4 ms</span>
              </div>
              <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400">
                Jitter: <span className="text-emerald-400 font-bold">±1.2 ms</span>
              </div>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Concurrent Stealth Proxies</span>
                <span className="text-white">128 Virtual Edge IPs</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fingerprint Rotation</span>
                <span className="text-emerald-400">Chrome / Linux Headless</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Anti-Scrape Bypass</span>
                <span className="text-cyan-400">Active (Cloudflare / Akamai)</span>
              </div>
            </div>
          </div>

          {/* Inside Sources Live Feeds Table (8 Cols — Matching User Photo "Inside sources") */}
          <div className="lg:col-span-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                  INSIDE SOURCES & CRAWL FEEDS
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                4 Active Ingestion Ports
              </span>
            </div>

            {/* Feeds Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Feed Source</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Volume</th>
                    <th className="py-2.5 px-3">Density</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {feeds.map((feed) => (
                    <tr key={feed.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>{feed.name}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{feed.type}</td>
                      <td className="py-3 px-3 font-bold text-cyan-300">{feed.volume}</td>
                      <td className="py-3 px-3 text-indigo-300">{feed.density}</td>
                      <td className="py-3 px-3 text-slate-400">{feed.latency}</td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            feed.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {feed.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ROW 4: PRODUCTIVE WORKSPACE LAUNCHPADS (ENTER FOCUSED TOOLS)          */}
        {/* ===================================================================== */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>FOCUSED INTELLIGENCE WORKSPACES</span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct entry into deep domain scraping, specs discovery, and social actors
              </p>
            </div>
            {savedProfilesCount > 0 && (
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
                {savedProfilesCount} Saved Profiles in Workspace
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Tool 1: Product Finder */}
            <Link
              href="/tools/product-finder"
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-white/[0.08] hover:border-cyan-500/50 hover:bg-slate-900 transition group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                  Product & Specs Finder
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Universal keyword specs, B2B wholesale pricing, and Global Resource Console.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 font-semibold pt-1">
                <span>Open Specs Engine</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Tool 2: Company Enrichment */}
            <Link
              href="/tools/company-enrichment"
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-white/[0.08] hover:border-cyan-500/50 hover:bg-slate-900 transition group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                  Company & Domain Intel
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  5-Pillar web harvesting, Actor Studio Executive Dossier, and .DAR packaging.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 font-semibold pt-1">
                <span>Crawl Domain</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Tool 3: Local Business */}
            <Link
              href="/tools/local-business"
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-white/[0.08] hover:border-cyan-500/50 hover:bg-slate-900 transition group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                  Local Business Maps
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Geo-radius perimeter radar, Google Maps merchant extraction, and contact matrices.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 font-semibold pt-1">
                <span>Scan Local Radar</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Tool 4: Web & Social Scraper */}
            <Link
              href="/tools/web-scraper"
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-white/[0.08] hover:border-cyan-500/50 hover:bg-slate-900 transition group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                  Actor Studio Crawlers
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Web Content Crawler with smart subpage discovery, LinkedIn, Instagram, Meta ads.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 font-semibold pt-1">
                <span>Run Headless Scrape</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Tool 5: Saved Lead Dossiers */}
            <Link
              href="/tools/lead-dossiers"
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-white/[0.08] hover:border-cyan-500/50 hover:bg-slate-900 transition group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                  Saved Dossiers
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Exportable company cards, CSV / JSON archives, and CRM synchronization.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 font-semibold pt-1">
                <span>View Workspace Dossiers</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
