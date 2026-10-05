/**
 * Unified site registry — single source of truth for the 3 parts of the site
 * (home, dashboard, tool workspaces). Cashfree-style grouped navigation:
 * tools are unified into 4 categories so related workspaces sit together.
 */

export type ToolCategoryId =
  | 'enrich-qualify'
  | 'discover-markets'
  | 'inspect-signals'
  | 'create-launch';

export interface ToolEntry {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  detail: string;
  flow: string;
  startsWith: string;
  youGet: string;
  badge?: string;
  bullets: string[];
  steps: { title: string; detail: string }[];
  faqs: { q: string; a: string }[];
  stats: { value: string; label: string }[];
}

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  detail: string;
  accent: string;
  tools: ToolEntry[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'enrich-qualify',
    label: 'Enrich & Qualify',
    detail: 'Turn a starting point into a usable, source-aware profile.',
    accent: 'blue',
    tools: [
      {
        slug: 'company-enrichment',
        name: 'Company enrichment',
        shortName: 'Enrichment',
        tagline: 'Domain → dossier',
        detail:
          'Build contacts, technographics, registration, network and location signals from a single domain — then save a CRM-ready dossier.',
        flow: 'Domain → dossier',
        startsWith: 'a domain',
        youGet: 'verified dossier',
        badge: 'Most used',
        bullets: ['DNS, WHOIS, SSL & tech-stack harvest', 'Contact matrix with confidence context', 'One-click save to lead dossiers'],
        steps: [
          { title: 'Enter a domain', detail: 'Type any company domain. TLD shortcuts and benchmark presets keep runs fast.' },
          { title: 'Run the stealth harvest', detail: 'The engine crawls contact, about and metadata surfaces with live progress.' },
          { title: 'Review & save the dossier', detail: 'Refine with AI, export PDF/JSON, or save straight to your workspace.' },
        ],
        faqs: [
          { q: 'What do I need to start?', a: 'Just a domain — for example stripe.com. No API keys or setup are required for the base harvest.' },
          { q: 'Where does the output go?', a: 'Every run produces a dossier you can refine, export as PDF/JSON, or save to Lead dossiers.' },
          { q: 'Is the data source-aware?', a: 'Yes. Verification badges and status tags stay attached to every record you keep.' },
        ],
        stats: [
          { value: '5-pillar', label: 'harvest pipeline' },
          { value: 'PDF + JSON', label: 'one-click export' },
          { value: 'CRM-ready', label: 'dossier output' },
        ],
      },
      {
        slug: 'brand-360',
        name: 'Brand 360',
        shortName: 'Brand 360',
        tagline: 'Brand → dossier',
        detail:
          'Sweep web content and public social signals into one brand intelligence dossier — the fastest way to brief yourself on any name.',
        flow: 'Brand → dossier',
        startsWith: 'a brand name',
        youGet: '360° dossier',
        bullets: ['Web + social sweep in one run', 'Presence and positioning signals', 'Shareable brand brief output'],
        steps: [
          { title: 'Enter the brand', detail: 'A company name or domain is enough to start the sweep.' },
          { title: 'Fuse the surfaces', detail: 'Web content and public social signals merge into one view.' },
          { title: 'Take the brief forward', detail: 'Save, export, or hand the dossier to outreach and research.' },
        ],
        faqs: [
          { q: 'How is this different from Company enrichment?', a: 'Brand 360 fuses web and social surfaces for positioning insight; Company enrichment goes deep on one domain.' },
          { q: 'What do I get?', a: 'A single dossier combining web signals and public social presence.' },
        ],
        stats: [
          { value: 'Web + social', label: 'fused sweep' },
          { value: '1 brief', label: 'single output' },
          { value: 'Minutes', label: 'to insight' },
        ],
      },
      {
        slug: 'lead-dossiers',
        name: 'Lead dossiers',
        shortName: 'Dossiers',
        tagline: 'Saved → action',
        detail:
          'Review, rate, segment and export every profile you have saved — your persistent account graph across all workspaces.',
        flow: 'Saved → action',
        startsWith: 'saved profiles',
        youGet: 'actionable lists',
        bullets: ['Ratings, remarks and list segments', 'Multi-origin filtering', 'CSV / JSON export + CRM sync'],
        steps: [
          { title: 'Collect from any tool', detail: 'Save results from enrichment, maps, products or social runs.' },
          { title: 'Curate the graph', detail: 'Rate, remark, merge duplicates and segment into lists.' },
          { title: 'Export or sync', detail: 'Download CSV/JSON or push forward to HubSpot and other CRMs.' },
        ],
        faqs: [
          { q: 'Where are profiles stored?', a: 'Locally in your workspace with origin, rating and remark context preserved.' },
          { q: 'Can I export everything?', a: 'Yes — bulk CSV and JSON export plus CRM sync are built in.' },
        ],
        stats: [
          { value: 'All origins', label: 'one graph' },
          { value: 'CSV + CRM', label: 'export paths' },
          { value: 'Zero loss', label: 'source context kept' },
        ],
      },
    ],
  },
  {
    id: 'discover-markets',
    label: 'Discover Markets',
    detail: 'Find businesses and suppliers before you enrich them.',
    accent: 'emerald',
    tools: [
      {
        slug: 'local-business',
        name: 'Local business discovery',
        shortName: 'Local',
        tagline: 'Keywords → accounts',
        detail:
          'Search any market by keywords and location, then qualify what you find with ratings, contact probing and geo-grid sweeps.',
        flow: 'Keywords → accounts',
        startsWith: 'keywords + city',
        youGet: 'qualified accounts',
        bullets: ['Places, keywords and grid-sweep modes', 'Auto website probing for emails & phones', 'Curated scenario presets per vertical'],
        steps: [
          { title: 'Describe the market', detail: 'Pick a query and location — or fire a one-click vertical preset.' },
          { title: 'Sweep the grid', detail: 'Places and keyword modes harvest listings, ratings and contact surfaces.' },
          { title: 'Qualify & save', detail: 'Filter by match score, enrich websites, and save winners to dossiers.' },
        ],
        faqs: [
          { q: 'What inputs work best?', a: 'A business category plus a city — e.g. “Dental clinics” in “Brooklyn, NY”. Presets cover coffee, clinics, agencies and more.' },
          { q: 'Do I get contact details?', a: 'Yes. Website auto-probing extracts direct emails, phones and social profiles where public.' },
        ],
        stats: [
          { value: '3 modes', label: 'places · keywords · grid' },
          { value: 'Auto-probe', label: 'website enrichment' },
          { value: 'Geo-grid', label: 'coverage sweeps' },
        ],
      },
      {
        slug: 'product-finder',
        name: 'Product & supplier finder',
        shortName: 'Products',
        tagline: 'Specs → suppliers',
        detail:
          'Build exact specifications, compare live listings with 3-tier B2B pricing, and investigate verified supplier options.',
        flow: 'Specs → suppliers',
        startsWith: 'a spec list',
        youGet: 'prices + suppliers',
        badge: 'B2B engine',
        bullets: ['Spec-builder with quick templates', 'Live price + discount matrix', 'Verified sellers hub with MOQ & terms'],
        steps: [
          { title: 'Define the spec', detail: 'Use the criteria builder or load a category template in one click.' },
          { title: 'Compare the matrix', detail: 'Listings, prices, discounts and distances land in a sortable matrix.' },
          { title: 'Vet the suppliers', detail: 'Open seller cards, deep-enrich, bookmark, flag or save for procurement.' },
        ],
        faqs: [
          { q: 'Do I need an exact model name?', a: 'No. Technical specs alone work — the engine matches listings to your criteria.' },
          { q: 'What about wholesale?', a: 'The sellers hub surfaces 3-tier pricing, MOQ, credit and logistics signals.' },
        ],
        stats: [
          { value: '3-tier', label: 'B2B pricing' },
          { value: '14 templates', label: 'quick starts' },
          { value: 'Sortable', label: 'spec matrix' },
        ],
      },
      {
        slug: 'serp-intelligence',
        name: 'SERP intelligence',
        shortName: 'SERP',
        tagline: 'Query → rankings',
        detail:
          'Research Google organic results, paid PPC ads, AI Overviews and People-Also-Ask — then extract verified business leads.',
        flow: 'Query → rankings',
        startsWith: 'search queries',
        youGet: 'rankings + leads',
        bullets: ['Organic, ads, AI Overview & PAA tabs', 'Multi-query parallel runs', 'Chained lead enrichment from results'],
        steps: [
          { title: 'Enter queries', detail: 'One per line, with country, language and depth controls.' },
          { title: 'Run the extraction', detail: 'Organic, paid, AI and PAA surfaces are captured in parallel.' },
          { title: 'Harvest the leads', detail: 'Enrich result domains into verified business leads in one step.' },
        ],
        faqs: [
          { q: 'How many queries can I run?', a: 'Multiple — enter one per line and the engine processes them in parallel.' },
          { q: 'Does it capture ads and AI answers?', a: 'Yes. Dedicated tabs cover organic, PPC ads, AI Overviews and People-Also-Ask.' },
        ],
        stats: [
          { value: '4 surfaces', label: 'organic · ads · AI · PAA' },
          { value: 'Parallel', label: 'multi-query runs' },
          { value: 'Lead-ready', label: 'chained enrichment' },
        ],
      },
    ],
  },
  {
    id: 'inspect-signals',
    label: 'Inspect Signals',
    detail: 'Look closely at one URL, profile, or campaign.',
    accent: 'violet',
    tools: [
      {
        slug: 'web-crawler',
        name: 'Web crawler',
        shortName: 'Crawler',
        tagline: 'URL → intelligence',
        detail:
          'Extract readable content, links, headings, images and a concise brief from any public URL — RAG-ready markdown included.',
        flow: 'URL → intelligence',
        startsWith: 'a public URL',
        youGet: 'content brief',
        bullets: ['Clean markdown + heading hierarchy', 'Internal link & sub-page discovery', 'Refined AI briefing output'],
        steps: [
          { title: 'Paste a URL', detail: 'Any public page works — news, docs, or company sites.' },
          { title: 'Crawl & structure', detail: 'Content is cleaned into preview, markdown, headings and JSON views.' },
          { title: 'Refine the brief', detail: 'Generate an executive briefing or copy markdown for RAG pipelines.' },
        ],
        faqs: [
          { q: 'What output formats exist?', a: 'Preview, markdown, headings, raw JSON and a refined AI briefing.' },
          { q: 'Does it discover sub-pages?', a: 'Yes — internal links are extracted so you can crawl deeper sections.' },
        ],
        stats: [
          { value: 'RAG-ready', label: 'clean markdown' },
          { value: '5 views', label: 'preview → JSON' },
          { value: 'Sub-pages', label: 'auto-discovered' },
        ],
      },
      {
        slug: 'social-intelligence',
        name: 'Social intelligence',
        shortName: 'Social',
        tagline: 'Handle → presence',
        detail:
          'Check public Instagram, LinkedIn and Facebook presence in one workspace — bios, verification, headcount and engagement signals.',
        flow: 'Handle → presence',
        startsWith: 'a handle',
        youGet: 'presence signals',
        bullets: ['Instagram, LinkedIn & Facebook actors', 'Verification,headcount & follower signals', 'Post and engagement inspection'],
        steps: [
          { title: 'Pick the network', detail: 'Instagram, LinkedIn or Facebook actors are one click apart.' },
          { title: 'Enter the handle', detail: 'A brand or company handle is enough to start.' },
          { title: 'Inspect the presence', detail: 'Review bio, verification, audience and recent activity signals.' },
        ],
        faqs: [
          { q: 'Which networks are covered?', a: 'Public Instagram profiles, LinkedIn companies and Facebook pages.' },
          { q: 'Is login required?', a: 'No — only public presence signals are collected.' },
        ],
        stats: [
          { value: '3 networks', label: 'one workspace' },
          { value: 'Public-only', label: 'no login needed' },
          { value: 'Live', label: 'stage telemetry' },
        ],
      },
      {
        slug: 'ad-intelligence',
        name: 'Ad intelligence',
        shortName: 'Ads',
        tagline: 'Brand → campaigns',
        detail:
          'Review public Meta Ad Library creatives and campaign activity — copy, calls-to-action and impression signals per brand.',
        flow: 'Brand → campaigns',
        startsWith: 'a brand',
        youGet: 'campaign signals',
        bullets: ['Facebook & Instagram ad coverage', 'Creative copy + CTA capture', 'Platform filtering built in'],
        steps: [
          { title: 'Enter the brand', detail: 'Any advertiser name works — e.g. a D2C or SaaS brand.' },
          { title: 'Pull the library', detail: 'Active creatives, copy and CTAs stream in with live logs.' },
          { title: 'Read the playbook', detail: 'Filter by platform and turn patterns into your own brief.' },
        ],
        faqs: [
          { q: 'Which platforms are covered?', a: 'Facebook and Instagram placements via the public Ad Library.' },
          { q: 'What creatives do I see?', a: 'Active ad copy, media, calls-to-action and impression context.' },
        ],
        stats: [
          { value: 'FB + IG', label: 'ad coverage' },
          { value: 'Creatives', label: 'copy + media' },
          { value: 'Live logs', label: 'run telemetry' },
        ],
      },
    ],
  },
  {
    id: 'create-launch',
    label: 'Create & Launch',
    detail: 'Turn finished work into posts that bring clients to you.',
    accent: 'amber',
    tools: [
      {
        slug: 'post-generator',
        name: 'Post Studio',
        shortName: 'Post Studio',
        tagline: 'URL → viral posts',
        detail:
          'Turn a live website and GitHub repo into copy-ready launch posts for LinkedIn, Instagram, Facebook, YouTube and X.',
        flow: 'URL → viral posts',
        startsWith: 'a live URL',
        youGet: 'platform posts',
        badge: 'New',
        bullets: ['Real site intel + demo screenshots', 'Per-platform copy fields', 'Template picker for every voice'],
        steps: [
          { title: 'Link the project', detail: 'Paste the live URL and optionally the GitHub repo.' },
          { title: 'Collect the showcase', detail: 'Site intel and screenshots are captured automatically.' },
          { title: 'Ship the posts', detail: 'Generate per-platform copy and paste straight into each network.' },
        ],
        faqs: [
          { q: 'What do I need?', a: 'A deployed URL. A GitHub link is optional but adds stack credibility.' },
          { q: 'Which platforms are supported?', a: 'LinkedIn, Instagram, Facebook, YouTube and X — each with tuned fields.' },
        ],
        stats: [
          { value: '5 platforms', label: 'tuned copy' },
          { value: 'Auto', label: 'screenshots + intel' },
          { value: 'Copy-ready', label: 'paste & post' },
        ],
      },
    ],
  },
];

export const ALL_TOOLS: ToolEntry[] = TOOL_CATEGORIES.flatMap((c) => c.tools);

export function getToolBySlug(slug: string): ToolEntry | undefined {
  return ALL_TOOLS.find((t) => t.slug === slug);
}

export function getCategoryOfTool(slug: string): ToolCategory | undefined {
  return TOOL_CATEGORIES.find((c) => c.tools.some((t) => t.slug === slug));
}

export function getRelatedTools(slug: string, count = 3): ToolEntry[] {
  const category = getCategoryOfTool(slug);
  const siblings = (category?.tools ?? []).filter((t) => t.slug !== slug);
  const others = ALL_TOOLS.filter(
    (t) => t.slug !== slug && !siblings.some((s) => s.slug === t.slug),
  );
  return [...siblings, ...others].slice(0, count);
}

/** Legacy / alias routes resolve to the canonical tool page. */
export const TOOL_ALIASES: Record<string, string> = {
  'saved-profiles': 'lead-dossiers',
};
