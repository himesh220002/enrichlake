'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Compass,
  FileText,
  Globe,
  Layers,
  MapPin,
  Megaphone,
  Menu,
  Package,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { TOOL_CATEGORIES } from '@/lib/site/tools';

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

const SOLUTIONS = [
  {
    title: 'Sales & prospecting',
    detail: 'Enrich domains, qualify local accounts, save dossiers.',
    href: '/tools/company-enrichment',
  },
  {
    title: 'Sourcing & procurement',
    detail: 'Specs, live prices and verified B2B suppliers.',
    href: '/tools/product-finder',
  },
  {
    title: 'Market & competitor research',
    detail: 'SERP, ads and social presence in one sweep.',
    href: '/tools/serp-intelligence',
  },
  {
    title: 'Founders & job seekers',
    detail: 'Turn shipped work into launch posts that convert.',
    href: '/tools/post-generator',
  },
];

const RESOURCES = [
  { title: 'All workspaces', detail: 'Browse every research workspace.', href: '/dashboard' },
  { title: 'Lead dossiers', detail: 'Your saved account graph.', href: '/tools/lead-dossiers' },
  { title: 'How it works', detail: 'Home → dashboard → tool, explained.', href: '/#how-it-works' },
  { title: 'Post Studio', detail: 'Launch posts for every platform.', href: '/tools/post-generator' },
  { title: 'About us', detail: 'What Enricher is and why it exists.', href: '/about' },
  { title: 'Contact', detail: 'Feedback, bugs and partnerships.', href: '/contact' },
  { title: 'Privacy', detail: 'How your research data is handled.', href: '/privacy' },
  { title: 'Terms', detail: 'Fair rules for a shared resource.', href: '/terms' },
];

interface SiteNavbarProps {
  /** "overlay" starts transparent over the dark video hero, then turns white. "solid" is always white. */
  variant?: 'overlay' | 'solid';
}

export default function SiteNavbar({ variant = 'solid' }: SiteNavbarProps) {
  const [scrolled, setScrolled] = useState(variant === 'solid');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (variant === 'solid') return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const secondary = document.getElementById('secondary-hero');
        if (secondary) {
          setScrolled(secondary.getBoundingClientRect().top <= 72);
        } else {
          setScrolled(window.scrollY > 600);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [variant]);

  const enter = (key: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenMenu(key);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160);
  };

  const solid = scrolled;
  const barTone = solid
    ? 'bg-white/95 shadow-[0_10px_36px_rgba(11,27,63,0.10)] backdrop-blur-xl'
    : 'bg-transparent';
  const linkTone = solid ? 'text-[#1b2b4d]' : 'text-white/85';
  const logoTone = solid ? 'text-[#0b1b3f]' : 'text-white';

  const menuButton = (key: string, label: string) => (
    <button
      type="button"
      onClick={() => setOpenMenu(openMenu === key ? null : key)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition ${
        solid
          ? openMenu === key
            ? 'bg-[#eef3ff] text-[#1740c2]'
            : 'text-[#1b2b4d] hover:bg-[#f1f5ff] hover:text-[#1740c2]'
          : openMenu === key
            ? 'bg-white/15 text-white'
            : 'text-white/85 hover:bg-white/10 hover:text-white'
      }`}
      aria-expanded={openMenu === key}
    >
      {label}
      <ChevronDown
        className={`h-3.5 w-3.5 transition-transform duration-200 ${openMenu === key ? 'rotate-180' : ''}`}
      />
    </button>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Announcement bar — Cashfree style */}
      <div
        className={`transition-all duration-500 overflow-hidden ${solid ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'}`}
      >
        <div className="bg-[#0b1b3f] text-white">
          <Link
            href="/dashboard"
            className="mx-auto flex max-w-[1280px] items-center justify-center gap-2 px-4 py-2 text-center text-[11.5px] font-semibold tracking-wide"
          >
            <span className="hidden rounded-full bg-[#2f6bff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest sm:inline-block">
              New
            </span>
            <span className="truncate">
              Zero-API autonomous enrichment — 10 focused workspaces, no keys needed to start
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </Link>
        </div>
      </div>

      {/* Main bar */}
      <div className={`transition-all duration-500 ${barTone} ${solid ? 'border-b border-[#e3e9f7]' : 'border-b border-transparent'}`}>
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group inline-flex shrink-0 items-center gap-2.5" aria-label="Enricher home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2f6bff] to-[#6d3bff] text-white shadow-[0_8px_20px_rgba(47,107,255,0.35)] transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className={`text-[13px] font-extrabold tracking-[0.16em] ${logoTone}`}>ENRICHERLAKE</span>
              <span className={`mt-1 font-mono text-[9px] uppercase tracking-[0.22em] ${solid ? 'text-[#2f6bff]' : 'text-cyan-300'}`}>
                Research workspaces
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            <div onMouseEnter={() => enter('products')} onMouseLeave={leave}>
              {menuButton('products', 'Products')}
            </div>
            <div onMouseEnter={() => enter('solutions')} onMouseLeave={leave}>
              {menuButton('solutions', 'Solutions')}
            </div>
            <div onMouseEnter={() => enter('resources')} onMouseLeave={leave}>
              {menuButton('resources', 'Resources')}
            </div>
            <Link
              href="/dashboard"
              className={`rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition ${solid ? 'text-[#1b2b4d] hover:bg-[#f1f5ff] hover:text-[#1740c2]' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            
            <Link
              href="/tools/company-enrichment"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1f5bff] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_26px_rgba(31,91,255,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1749d6] sm:px-5"
            >
              Start research <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={`grid h-10 w-10 place-items-center rounded-xl transition lg:hidden ${solid ? 'text-[#0b1b3f] hover:bg-[#f1f5ff]' : 'text-white hover:bg-white/10'}`}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mega dropdowns — desktop */}
        {openMenu && (
          <div className="hidden lg:block" onMouseEnter={() => enter(openMenu)} onMouseLeave={leave}>
            <div className="border-t border-[#e8edf9] bg-white shadow-[0_30px_70px_rgba(11,27,63,0.16)]">
              <div className="mx-auto max-w-[1280px] px-6 py-7 lg:px-8">
                {openMenu === 'products' && (
                  <div>
                    <div className="grid grid-cols-4 gap-6">
                      {TOOL_CATEGORIES.map((cat) => (
                        <div key={cat.id}>
                          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#5b6b8c]">
                            {cat.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#8a97b3]">{cat.detail}</p>
                          <div className="mt-3 space-y-1">
                            {cat.tools.map((tool) => {
                              const Icon = TOOL_ICONS[tool.slug] ?? Sparkles;
                              return (
                                <Link
                                  key={tool.slug}
                                  href={`/tools/${tool.slug}`}
                                  onClick={() => setOpenMenu(null)}
                                  className="group flex items-start gap-2.5 rounded-xl p-2.5 transition hover:bg-[#f2f6ff]"
                                >
                                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e9efff] text-[#1f5bff] transition group-hover:bg-[#1f5bff] group-hover:text-white">
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <span>
                                    <span className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#0b1b3f]">
                                      {tool.name}
                                      {tool.badge && (
                                        <span className="rounded-full bg-[#e6f9ef] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-[#0d9b56]">
                                          {tool.badge}
                                        </span>
                                      )}
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-5 text-[#66748f]">{tool.tagline}</span>
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#0b1b3f] to-[#1c3faa] px-5 py-4 text-white">
                      <p className="text-[13px]">
                        <strong className="font-bold">Not sure where to start?</strong>{' '}
                        <span className="text-white/70">Answer one question and open the matching workspace.</span>
                      </p>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpenMenu(null)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0b1b3f] transition hover:bg-[#e5edff]"
                      >
                        Browse all workspaces <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {openMenu === 'solutions' && (
                  <div className="grid grid-cols-4 gap-3">
                    {SOLUTIONS.map((s) => (
                      <Link
                        key={s.title}
                        href={s.href}
                        onClick={() => setOpenMenu(null)}
                        className="group rounded-2xl border border-[#e5ebf9] p-4 transition hover:-translate-y-0.5 hover:border-[#1f5bff]/40 hover:shadow-[0_14px_34px_rgba(31,91,255,0.12)]"
                      >
                        <p className="text-[14px] font-bold text-[#0b1b3f] group-hover:text-[#1f5bff]">{s.title}</p>
                        <p className="mt-1.5 text-xs leading-5 text-[#66748f]">{s.detail}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1f5bff]">
                          Open workspace <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {openMenu === 'resources' && (
                  <div className="grid grid-cols-4 gap-3">
                    {RESOURCES.map((s) => (
                      <Link
                        key={s.title}
                        href={s.href}
                        onClick={() => setOpenMenu(null)}
                        className="group rounded-2xl border border-[#e5ebf9] p-4 transition hover:-translate-y-0.5 hover:border-[#1f5bff]/40 hover:shadow-[0_14px_34px_rgba(31,91,255,0.12)]"
                      >
                        <p className="text-[14px] font-bold text-[#0b1b3f] group-hover:text-[#1f5bff]">{s.title}</p>
                        <p className="mt-1.5 text-xs leading-5 text-[#66748f]">{s.detail}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1f5bff]">
                          Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-[#e8edf9] bg-white shadow-[0_30px_70px_rgba(11,27,63,0.18)] lg:hidden">
            <div className="space-y-5 px-4 py-5 sm:px-6">
              {TOOL_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#5b6b8c]">{cat.label}</p>
                  <div className="mt-2 grid gap-1">
                    {cat.tools.map((tool) => {
                      const Icon = TOOL_ICONS[tool.slug] ?? Sparkles;
                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition hover:bg-[#f2f6ff]"
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9efff] text-[#1f5bff]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>
                            <span className="block text-[13.5px] font-bold text-[#0b1b3f]">{tool.name}</span>
                            <span className="block text-[11px] text-[#8a97b3]">{tool.tagline}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 border-t border-[#eef2fb] pt-4">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-full border border-[#dbe4f8] px-4 py-2.5 text-center text-[13px] font-bold text-[#0b1b3f]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tools/company-enrichment"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1f5bff] px-4 py-2.5 text-[13px] font-bold text-white"
                >
                  Start research <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <span className={`hidden ${linkTone}`} aria-hidden="true" />
    </header>
  );
}
