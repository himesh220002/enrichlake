'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Search } from 'lucide-react';

type Target = 'company' | 'product' | 'maps' | 'actor';

const TARGETS: { value: Target; label: string; placeholder: string; href: string }[] = [
  { value: 'company', label: 'Domain / Company', placeholder: 'Enter domain (e.g. stripe.com)...', href: '/tools/company-enrichment' },
  { value: 'product', label: 'Product / Spec', placeholder: 'Search product or spec (e.g. laptops, cement)...', href: '/tools/product-finder' },
  { value: 'maps', label: 'Local business', placeholder: 'Search place & city (e.g. Cafes in Austin)...', href: '/tools/local-business' },
  { value: 'actor', label: 'URL to crawl', placeholder: 'Enter public URL to crawl...', href: '/tools/web-crawler' },
];

function buildUrl(target: Target, raw: string): string {
  const q = encodeURIComponent(raw.trim());
  if (!q) return TARGETS.find((t) => t.value === target)?.href ?? '/';
  if (target === 'company') return `/tools/company-enrichment?domain=${q}`;
  if (target === 'product') return `/tools/product-finder?q=${q}`;
  if (target === 'maps') return `/tools/local-business?query=${q}`;
  return `/tools/web-crawler?url=${q}`;
}

export default function QuickLaunch() {
  const router = useRouter();
  const [target, setTarget] = useState<Target>('company');
  const [input, setInput] = useState('');
  const [savedCount] = useState<number | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem('enricher_saved_profiles');
      if (!raw) return 0;
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  });

  const active = TARGETS.find((t) => t.value === target)!;

  return (
    <div className="cf-card p-4 shadow-[0_18px_50px_rgba(11,27,63,0.10)] sm:p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(buildUrl(target, input));
        }}
        className="flex flex-col gap-3 lg:flex-row lg:items-center"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9efff] text-[#1f5bff]">
            <Search className="h-4 w-4" />
          </span>
          <div className="lg:w-52">
            <p className="text-sm font-bold text-[#0b1b3f]">Quick launch</p>
            <p className="text-xs text-[#8a97b3]">Jump straight into a workspace.</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="dashboard-target">
            Research type
          </label>
          <select
            id="dashboard-target"
            value={target}
            onChange={(e) => setTarget(e.target.value as Target)}
            className="rounded-xl border border-[#d5e1fb] bg-white px-3 py-2.5 text-xs font-semibold text-[#1b2b4d] focus:border-[#1f5bff] focus:outline-none"
          >
            {TARGETS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="dashboard-query">
            Search input
          </label>
          <input
            id="dashboard-query"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={active.placeholder}
            className="w-full flex-1 rounded-xl border border-[#d5e1fb] bg-[#f6f9ff] px-3 py-2.5 text-sm text-[#0b1b3f] placeholder-[#9aa7c2] focus:border-[#1f5bff] focus:bg-white focus:outline-none"
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1f5bff] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1749d6]"
          >
            Open workspace <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {savedCount !== null && savedCount > 0 && (
        <p className="mt-3 border-t border-[#eef2fb] pt-3 text-xs text-[#55617c]">
          <Link href="/tools/lead-dossiers" className="font-bold text-[#1f5bff] hover:text-[#0b1b3f]">
            {savedCount} saved {savedCount === 1 ? 'profile' : 'profiles'}
          </Link>{' '}
          waiting in your dossiers — continue where you left off.
        </p>
      )}
    </div>
  );
}
