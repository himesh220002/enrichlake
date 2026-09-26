import Link from 'next/link';
import { ArrowRight, Globe, MapPin, Megaphone, Package, Search, Users, Sparkles } from 'lucide-react';

interface Tool {
  n: string;
  name: string;
  eyebrow: string;
  detail: string;
  href: string;
  flow: string;
  startsWith: string;
  youGet: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: 'indigo' | 'cyan' | 'emerald' | 'violet' | 'pink' | 'amber' | 'rose';
}

const TOOLS: Tool[] = [
  {
    n: '01',
    name: 'Company enrichment',
    eyebrow: 'ACCOUNT INTELLIGENCE',
    detail: 'Turn a domain into contacts, technographics, location signals, and a CRM-ready profile.',
    href: '/tools/company-enrichment',
    flow: 'Domain → dossier',
    startsWith: 'a domain',
    youGet: 'verified dossier',
    Icon: Globe,
    tone: 'indigo',
  },
  {
    n: '02',
    name: 'Local business discovery',
    eyebrow: 'GEO RESEARCH',
    detail: 'Search a market by keywords and location, then qualify the businesses you find.',
    href: '/tools/local-business',
    flow: 'Keywords → accounts',
    startsWith: 'keywords + city',
    youGet: 'qualified accounts',
    Icon: MapPin,
    tone: 'cyan',
  },
  {
    n: '03',
    name: 'Product & supplier finder',
    eyebrow: 'PROCUREMENT',
    detail: 'Build exact specifications, compare listings, and investigate B2B supplier options.',
    href: '/tools/product-finder',
    flow: 'Specs → suppliers',
    startsWith: 'a spec list',
    youGet: 'prices + suppliers',
    Icon: Package,
    tone: 'emerald',
  },
  {
    n: '04',
    name: 'Web crawler',
    eyebrow: 'CONTENT SIGNALS',
    detail: 'Extract readable content, links, headings, images, and a concise brief from public URLs.',
    href: '/tools/web-crawler',
    flow: 'URL → intelligence',
    startsWith: 'a public URL',
    youGet: 'content brief',
    Icon: Search,
    tone: 'violet',
  },
  {
    n: '05',
    name: 'Social intelligence',
    eyebrow: 'PUBLIC PRESENCE',
    detail: 'Inspect public Instagram, LinkedIn, and Facebook signals in one focused workspace.',
    href: '/tools/social-intelligence',
    flow: 'Handle → presence',
    startsWith: 'a handle',
    youGet: 'presence signals',
    Icon: Users,
    tone: 'pink',
  },
  {
    n: '06',
    name: 'Ad intelligence',
    eyebrow: 'CAMPAIGN RESEARCH',
    detail: 'Review public Meta Ad Library activity, creatives, calls to action, and campaign signals.',
    href: '/tools/ad-intelligence',
    flow: 'Brand → campaigns',
    startsWith: 'a brand',
    youGet: 'campaign signals',
    Icon: Sparkles,
    tone: 'amber',
  },
  {
    n: '07',
    name: 'Post Studio',
    eyebrow: 'LAUNCH POSTS',
    detail: 'Turn a live site and GitHub repo into copy-ready posts for every platform.',
    href: '/tools/post-generator',
    flow: 'URL → viral posts',
    startsWith: 'a live URL',
    youGet: 'platform posts',
    Icon: Megaphone,
    tone: 'rose',
  },
];

const TONE_TILE: Record<Tool['tone'], string> = {
  indigo: 'border-indigo-300/20 bg-indigo-400/10 text-indigo-200 group-hover:border-indigo-300/40 group-hover:text-indigo-100',
  cyan: 'border-cyan-300/20 bg-cyan-400/10 text-cyan-200 group-hover:border-cyan-300/40 group-hover:text-cyan-100',
  emerald: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200 group-hover:border-emerald-300/40 group-hover:text-emerald-100',
  violet: 'border-violet-300/20 bg-violet-400/10 text-violet-200 group-hover:border-violet-300/40 group-hover:text-violet-100',
  pink: 'border-pink-300/20 bg-pink-400/10 text-pink-200 group-hover:border-pink-300/40 group-hover:text-pink-100',
  amber: 'border-amber-300/20 bg-amber-400/10 text-amber-200 group-hover:border-amber-300/40 group-hover:text-amber-100',
  rose: 'border-rose-300/20 bg-rose-400/10 text-rose-200 group-hover:border-rose-300/40 group-hover:text-rose-100',
};

export default function HomeToolCards() {
  return (
    <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {TOOLS.map(({ n, name, eyebrow, detail, href, flow, startsWith, youGet, Icon, tone }) => (
        <Link
          key={name}
          href={href}
          aria-label={`${name} — starts with ${startsWith}, you get ${youGet}`}
          className={`home-tool-card home-tool-${tone} group relative flex min-h-[295px] flex-col overflow-hidden rounded-[26px] border border-white/[0.09] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[0.18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 active:translate-y-0 sm:p-7`}
        >
          <div className="relative z-10 flex h-full flex-col">
            {/* Top: index + eyebrow + icon */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] font-bold text-slate-500">{n}</span>
                <p className="mt-1 text-[10px] font-bold tracking-[0.18em] text-slate-400">{eyebrow}</p>
              </div>
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition group-hover:scale-110 ${TONE_TILE[tone]}`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
            </div>

            {/* Title + detail */}
            <p className="mt-6 font-mono text-[11px] text-cyan-200/70">{flow}</p>
            <h3 className="mt-2 text-[22px] font-extrabold leading-tight tracking-tight text-white">
              {name}
            </h3>
            <p className="mt-2.5 max-w-md text-sm leading-6 text-slate-400">{detail}</p>

            {/* Per-tool I/O strip — the one-by-one UX upgrade */}
            <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-4 text-[11px] leading-5">
              <div>
                <dt className="font-semibold uppercase tracking-[0.14em] text-slate-500">Starts with</dt>
                <dd className="mt-0.5 font-medium text-slate-200">{startsWith}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-[0.14em] text-slate-500">You get</dt>
                <dd className="mt-0.5 font-medium text-slate-200">{youGet}</dd>
              </div>
            </dl>

            {/* Footer */}
            <span className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-bold text-white">
              Open workspace
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
