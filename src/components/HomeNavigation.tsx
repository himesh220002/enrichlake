'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react';

export default function HomeNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const secondaryHero = document.getElementById('secondary-hero');
      if (secondaryHero) {
        const rect = secondaryHero.getBoundingClientRect();
        // Nav background ONLY transitions after video briefing ends and secondary hero reaches top
        setIsScrolled(rect.top <= 80);
      } else {
        setIsScrolled(window.scrollY > 2000);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSecondaryHero = () => {
    const secondary = document.getElementById('secondary-hero');
    if (secondary) {
      secondary.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#070b18]/75 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-3.5'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 sm:px-10 xl:px-20">
        {/* Brand Logo */}
        <Link href="/" className="group inline-flex items-center gap-3" aria-label="Enricher AI home">
          <span className="home-logo-mark grid h-9 w-9 place-items-center rounded-xl transition-all duration-300 group-hover:scale-105 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold tracking-[0.18em] text-white">ENRICHER.AI</span>
            <span className="text-[9px] font-mono tracking-widest text-cyan-300/80 uppercase">
              ZERO-API AUTONOMOUS
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav
          className="hidden items-center gap-8 text-[13px] font-medium text-slate-300/80 lg:flex"
          aria-label="Main navigation"
        >
          <a
            className="transition-all hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            href="#workspaces"
          >
            Workspaces
          </a>
          <a
            className="transition-all hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            href="#approach"
          >
            How it works
          </a>
          <Link
            className="transition-all hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            href="/dashboard"
          >
            All tools
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scrollToSecondaryHero}
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.1] hover:text-white"
          >
            <span>Overview</span>
            <ChevronDown className="h-3.5 w-3.5 text-cyan-300" />
          </button>

          <Link
            href="/dashboard"
            className="hidden sm:block text-[13px] font-semibold text-slate-300 transition hover:text-white px-2"
          >
            Open dashboard
          </Link>

          <Link
            href="/tools/company-enrichment"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_0_25px_rgba(255,255,255,0.25)] transition hover:bg-cyan-100 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] sm:px-5"
          >
            Start research <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
