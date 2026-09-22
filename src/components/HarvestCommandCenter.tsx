'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

interface TimeframeMetrics {
  grossElements: string;
  avgLatency: string;
  peakYieldRange: string;
  synergyBars: {
    month: string;
    val: number;
    topY: number;
    isPeak?: boolean;
  }[];
}

const TIMEFRAME_DATA: Record<'1H' | '24H' | '7D' | '30D', TimeframeMetrics> = {
  '1H': {
    grossElements: '83,082',
    avgLatency: '16.2 ms',
    peakYieldRange: '0.020 → 46.20 MAX',
    synergyBars: [
      { month: '10m', val: 2.4, topY: 168 },
      { month: '20m', val: 7.8, topY: 152 },
      { month: '30m', val: 14.5, topY: 128 },
      { month: '40m', val: 26.2, topY: 92 },
      { month: '50m', val: 38.0, topY: 58 },
      { month: '60m', val: 46.2, topY: 25, isPeak: true },
    ],
  },
  '24H': {
    grossElements: '1,993,989',
    avgLatency: '18.4 ms',
    peakYieldRange: '0.110 → 277.04 MAX',
    synergyBars: [
      { month: 'Jan', val: 11.0, topY: 162 },
      { month: 'Apr', val: 28.5, topY: 146 },
      { month: 'May', val: 53.7, topY: 122 },
      { month: 'Jun', val: 134.4, topY: 85 },
      { month: 'Nov', val: 189.6, topY: 52 },
      { month: 'Dec', val: 277.04, topY: 25, isPeak: true },
    ],
  },
  '7D': {
    grossElements: '13,957,923',
    avgLatency: '19.1 ms',
    peakYieldRange: '1.200 → 1,940.50 MAX',
    synergyBars: [
      { month: 'Day 1', val: 78.4, topY: 165 },
      { month: 'Day 2', val: 192.0, topY: 148 },
      { month: 'Day 3', val: 380.5, topY: 124 },
      { month: 'Day 4', val: 940.2, topY: 88 },
      { month: 'Day 5', val: 1420.0, topY: 55 },
      { month: 'Day 7', val: 1940.5, topY: 25, isPeak: true },
    ],
  },
  '30D': {
    grossElements: '59,818,400',
    avgLatency: '18.8 ms',
    peakYieldRange: '4.500 → 8,320.00 MAX',
    synergyBars: [
      { month: 'W1', val: 340.0, topY: 166 },
      { month: 'W2', val: 890.5, topY: 149 },
      { month: 'W3', val: 1750.2, topY: 125 },
      { month: 'W4', val: 4120.0, topY: 86 },
      { month: 'W5', val: 6200.5, topY: 54 },
      { month: 'W6', val: 8320.0, topY: 25, isPeak: true },
    ],
  },
};

export default function HarvestCommandCenter() {
  const router = useRouter();
  const [time, setTime] = useState<string>('');
  const [activeRange, setActiveRange] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [savedProfilesCount, setSavedProfilesCount] = useState<number>(0);
  const [quickSearchInput, setQuickSearchInput] = useState<string>('');
  const [quickSearchTarget, setQuickSearchTarget] = useState<'company' | 'product' | 'maps' | 'actor'>('company');
  const [simulatedPulse, setSimulatedPulse] = useState<number>(0);
  const [radarHoverAxis, setRadarHoverAxis] = useState<string | null>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);

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

  // Current active metrics based on timeframe
  const currentMetrics = useMemo(() => {
    return TIMEFRAME_DATA[activeRange];
  }, [activeRange]);

  // Live Crawler Streams table data
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
      volume: '8.17M',
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
  const radarAxes = [
    { name: 'Market Synergy', angle: -90, score: 96, label: 'Market Synergy (96%)' },
    { name: 'Domain Technographics', angle: -18, score: 92, label: 'Domain Technographics (92%)' },
    { name: 'Location Proximity', angle: 54, score: 94, label: 'Location Proximity (94%)' },
    { name: 'Contact Reachability', angle: 126, score: 91, label: 'Contact Reachability (91%)' },
    { name: 'Target ICP Match', angle: 198, score: 95, label: 'Target ICP Match (95%)' },
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

  // Quick Search Redirection with query preservation
  const getQuickSearchUrl = () => {
    const q = encodeURIComponent(quickSearchInput.trim());
    if (!q) {
      if (quickSearchTarget === 'product') return '/tools/product-finder';
      if (quickSearchTarget === 'maps') return '/tools/local-business';
      if (quickSearchTarget === 'actor') return '/tools/web-scraper';
      return '/tools/company-enrichment';
    }
    if (quickSearchTarget === 'company') return `/tools/company-enrichment?domain=${q}`;
    if (quickSearchTarget === 'product') return `/tools/product-finder?q=${q}`;
    if (quickSearchTarget === 'maps') return `/tools/local-business?query=${q}`;
    return `/tools/web-scraper?url=${q}`;
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(getQuickSearchUrl());
  };

  // Math for Business Synergy Engine Bars and Connecting Line
  const synergyBarsWithPositions = useMemo(() => {
    // 6 bars across a 600px width viewBox
    // Centers: 45, 147, 249, 351, 453, 555
    const barWidth = 54;
    const centers = [45, 147, 249, 351, 453, 555];

    return currentMetrics.synergyBars.map((b, i) => ({
      ...b,
      x: centers[i],
      w: barWidth,
    }));
  }, [currentMetrics]);

  // Construct SVG Path string connecting the EXACT TOP of each bar
  const synergyPathD = useMemo(() => {
    return synergyBarsWithPositions.reduce((acc, bar, i) => {
      if (i === 0) return `M ${bar.x} ${bar.topY}`;
      return `${acc} L ${bar.x} ${bar.topY}`;
    }, '');
  }, [synergyBarsWithPositions]);

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
                  className={`px-2.5 py-1 rounded transition ${
                    activeRange === r
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
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
        <form
          onSubmit={handleQuickSearchSubmit}
          className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/30 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-4"
        >
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
              className="bg-slate-950 border border-white/[0.12] rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
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
                    ? 'Search product or spec (e.g. cement, laptops)...'
                    : quickSearchTarget === 'maps'
                    ? 'Search place & city (e.g. Cafes in Austin)...'
                    : 'Enter target URL to crawl...'
                }
                className="w-full bg-slate-950/90 border border-white/[0.12] rounded-xl pl-3 pr-8 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 transition shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <span>LAUNCH</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* ===================================================================== */}
        {/* ROW 1: CORE TELEMETRY & ENGINE GAUGES (REALISTIC GROUNDED METRICS)    */}
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
              {/* Radial Dial 98.4% Operational Fidelity */}
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
                    strokeDashoffset="4.0"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-lg font-black font-mono text-cyan-300 tracking-tight">
                    98.4%
                  </div>
                  <div className="text-[9px] font-mono uppercase text-slate-400">
                    Fidelity
                  </div>
                </div>
              </div>

              {/* Number Gross V2.0 Elements */}
              <div className="space-y-1 text-right">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {currentMetrics.grossElements}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Normalized Entity Records
                </div>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-1">
                  <Check className="w-3 h-3" />
                  <span>4-Stage DOM Cleanse Active</span>
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
                    strokeDashoffset="18"
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

              {/* Realistic Telemetry Equalizers */}
              <div className="flex-1 space-y-1.5 text-[10px] font-mono">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>DNS & TLS Handshake</span>
                    <span className="text-cyan-300 font-bold">99.8%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full w-[99.8%]" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Zero-404 URL Fidelity</span>
                    <span className="text-emerald-300 font-bold">98.7%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[98.7%]" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Schema Microdata Match</span>
                    <span className="text-indigo-300 font-bold">96.4%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[96.4%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between">
              <span>CLUSTER SYNC</span>
              <span className="text-emerald-400 font-bold">6 Edge Regions Active</span>
            </div>
          </div>

          {/* Card 3: AI ENHANCEMENT ENGINE (Realistic Pipeline Percentages) */}
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
              {/* Ring 1: 94.2% Technographic Density */}
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
                      strokeDashoffset="14"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-black text-cyan-300">
                    94.2%
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-bold mt-1">Techno</div>
                <div className="text-[9px] font-mono text-slate-500">Density</div>
              </div>

              {/* Ring 2: 98.1% Deduplication Space */}
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
                      strokeDashoffset="5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-black text-emerald-300">
                    98.1%
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-bold mt-1">Dedupe</div>
                <div className="text-[9px] font-mono text-slate-500">Ratio Space</div>
              </div>

              {/* Ring 3: 91.5% ICP Fit Vectors */}
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
                      strokeDashoffset="20"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-black text-violet-300">
                    91.5%
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-bold mt-1">ICP Fit</div>
                <div className="text-[9px] font-mono text-slate-500">Vectors</div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between">
              <span>HEURISTIC NLP ENGINE</span>
              <span className="text-amber-400 font-bold">100% Zero-API Cost</span>
            </div>
          </div>

          {/* Card 4: MARKET SYNERGY CHRONOLOGICAL QUARTERLY BARS */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>MARKET SYNERGY</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">1.85M Peak</span>
            </div>

            {/* Vertical Multi-Bar Chart (Sequential Quarters) */}
            <div className="py-4 flex items-end justify-between gap-3 h-28 px-2">
              {[
                { label: 'Q1', h: '62%', count: '1.24M Entities' },
                { label: 'Q2', h: '74%', count: '1.48M Entities' },
                { label: 'Q3', h: '82%', count: '1.64M Entities' },
                { label: 'Q4', h: '98%', count: '1.85M Entities', highlight: true },
                { label: 'Q1+', h: '88%', count: '1.76M Entities' },
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
        {/* ROW 2: BUSINESS SYNERGY ENGINE & SYNERGY RADAR MATRIX                 */}
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
                  {currentMetrics.peakYieldRange}
                </span>
              </div>
            </div>

            {/* Stepped Bar Chart with Upward Trajectory Trend Line CONNECTED EXACTLY AT BAR TOPS */}
            <div className="relative h-60 w-full pt-2">
              <svg
                viewBox="0 0 600 220"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Horizontal guide lines */}
                <line x1="20" y1="35" x2="580" y2="35" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="20" y1="75" x2="580" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="20" y1="115" x2="580" y2="115" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="20" y1="155" x2="580" y2="155" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="20" y1="180" x2="580" y2="180" stroke="rgba(255,255,255,0.12)" />

                {/* SVG Definitions for Gradients & Filters */}
                <defs>
                  <linearGradient id="barGradDefault" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#064e3b" stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id="barGradPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
                  </linearGradient>
                  <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="lineGrad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>

                {/* 6 Stepped Bars */}
                {synergyBarsWithPositions.map((bar, i) => {
                  const isHovered = hoveredBarIdx === i;
                  return (
                    <g key={bar.month} className="cursor-pointer transition-opacity duration-200">
                      {/* Bar Rectangle */}
                      <rect
                        x={bar.x - bar.w / 2}
                        y={bar.topY}
                        width={bar.w}
                        height={180 - bar.topY}
                        rx="6"
                        ry="6"
                        fill={bar.isPeak ? 'url(#barGradPeak)' : 'url(#barGradDefault)'}
                        stroke={isHovered ? '#6ee7b7' : bar.isPeak ? '#34d399' : '#10b981'}
                        strokeWidth={isHovered ? 2 : bar.isPeak ? 1.5 : 1}
                        className="transition-all duration-300"
                        onMouseEnter={() => setHoveredBarIdx(i)}
                        onMouseLeave={() => setHoveredBarIdx(null)}
                      />

                      {/* Month Label below baseline */}
                      <text
                        x={bar.x}
                        y="202"
                        textAnchor="middle"
                        fill={isHovered ? '#ffffff' : '#94a3b8'}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                      >
                        {bar.month}
                      </text>

                      {/* Value label directly above bar top */}
                      <text
                        x={bar.x}
                        y={bar.topY - 10}
                        textAnchor="middle"
                        fill={isHovered ? '#ffffff' : bar.isPeak ? '#34d399' : '#6ee7b7'}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]"
                      >
                        {bar.val}
                      </text>
                    </g>
                  );
                })}

                {/* The Trajectory Trend Line connecting the EXACT TOP of each bar! */}
                <path
                  d={synergyPathD}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowGreen)"
                  className="transition-all duration-300"
                />

                {/* Circles placed PRECISELY on the top center of each bar (x, topY) */}
                {synergyBarsWithPositions.map((bar, i) => (
                  <g key={`circle-${i}`}>
                    <circle
                      cx={bar.x}
                      cy={bar.topY}
                      r={bar.isPeak ? 6 : 4.5}
                      fill="#10b981"
                      stroke="#34d399"
                      strokeWidth="2"
                      className={bar.isPeak ? 'animate-pulse' : ''}
                      filter="url(#glowGreen)"
                    />
                    {bar.isPeak && (
                      <circle
                        cx={bar.x}
                        cy={bar.topY}
                        r="9"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="1"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Bottom 3 Summary Metric Badges */}
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

          {/* Right / Center-Right: SYNERGY RADAR MATRIX (5 Columns) */}
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
                  <span>Best (96%)</span>
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

                {/* Filled Radar Polygon */}
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
                  const labelR = 124;
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
                        {axis.label}
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
                Avg Response: <span className="text-cyan-400 font-bold">{currentMetrics.avgLatency}</span>
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

          {/* Inside Sources Live Feeds Table (8 Cols) */}
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
