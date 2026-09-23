import { Page } from 'playwright';

export interface TechStackItem {
  name: string;
  category:
    | 'Analytics'
    | 'Marketing'
    | 'CRM'
    | 'Framework'
    | 'Hosting/CDN'
    | 'E-commerce'
    | 'Tag Managers'
    | 'Security'
    | 'Libraries'
    | 'Monitoring'
    | 'UI/CSS';
  confidence: number;
}

export interface TechnographicResult {
  technologies: TechStackItem[];
  cms?: string;
  framework?: string;
  marketingAutomation?: string[];
  analytics?: string[];
  rawDetectionsCount: number;
}

export interface TechnographicContext {
  headers?: Record<string, string>;
  domain?: string;
  nameservers?: string[];
}

interface TechSignature {
  name: string;
  category: TechStackItem['category'];
  patterns?: RegExp[];
  domSelectors?: string[];
  headerMatch?: (headers: Record<string, string>) => boolean;
  htmlMatch?: (html: string, pageDomain?: string) => boolean;
}

const SIGNATURES: TechSignature[] = [
  // Analytics
  {
    name: 'Google Analytics 4',
    category: 'Analytics',
    patterns: [
      /googletagmanager\.com\/gtag\/js\?id=G-/i,
      /google-analytics\.com\/g\/collect/i,
      /gtag\(['"]config['"],\s*['"]G-[A-Z0-9]+['"]\)/i,
    ],
    htmlMatch: (html) => /gtag\(['"]config['"],\s*['"]G-[A-Z0-9]+['"]\)/i.test(html) || /G-[A-Z0-9]{8,12}/.test(html),
  },
  {
    name: 'Mixpanel',
    category: 'Analytics',
    patterns: [/cdn\.mxpnl\.com/i, /api-js\.mixpanel\.com/i],
  },
  {
    name: 'PostHog',
    category: 'Analytics',
    patterns: [/app\.posthog\.com/i, /us\.i\.posthog\.com/i, /eu\.i\.posthog\.com/i],
  },
  {
    name: 'Segment',
    category: 'Analytics',
    patterns: [/cdn\.segment\.com\/analytics\.js/i],
  },
  {
    name: 'Hotjar',
    category: 'Analytics',
    patterns: [/static\.hotjar\.com\/c\/hotjar-/i],
  },

  // CRM & Marketing Automation
  {
    name: 'HubSpot',
    category: 'CRM',
    patterns: [/js\.hs-scripts\.com/i, /js\.hs-analytics\.net/i, /forms\.hsforms\.com/i],
  },
  {
    name: 'Marketo',
    category: 'Marketing',
    patterns: [/munchkin\.marketo\.net/i],
  },
  {
    name: 'Klaviyo',
    category: 'Marketing',
    patterns: [/static\.klaviyo\.com\/onsite\/js\/klaviyo\.js/i],
  },
  {
    name: 'Intercom',
    category: 'CRM',
    patterns: [/widget\.intercom\.io\/widget/i],
  },
  {
    name: 'Drift',
    category: 'CRM',
    patterns: [/js\.driftt\.com\/include/i],
  },
  {
    name: 'Salesforce Live Agent',
    category: 'CRM',
    patterns: [/salesforceliveagent\.com/i],
  },

  // Frameworks & Web Platforms
  {
    name: 'Next.js',
    category: 'Framework',
    patterns: [/_next\/static/i, /\/__next/i],
    domSelectors: ['#__next', 'script[id="__NEXT_DATA__"]', 'script[src*="/_next/static/"]'],
    headerMatch: (headers) =>
      Boolean(headers['x-nextjs-prerender'] || headers['x-matched-path'] || headers['x-nextjs-stale-time'] || headers['x-powered-by']?.toLowerCase().includes('next.js')),
    htmlMatch: (html) => html.includes('/_next/') || html.includes('__NEXT_DATA__'),
  },
  {
    name: 'React',
    category: 'Framework',
    patterns: [/react(\.production)?\.min\.js/i, /react-dom/i],
    domSelectors: ['[data-reactroot]', '[data-react-helmet]', '#__next', 'div[id="root"]'],
    htmlMatch: (html) => html.includes('/_next/') || html.includes('react-dom') || html.includes('__NEXT_DATA__'),
  },
  {
    name: 'Tailwind CSS',
    category: 'UI/CSS',
    patterns: [/tailwindcss/i],
    htmlMatch: (html) => {
      if (/tailwindcss/i.test(html)) return true;
      // Look for distinctive Tailwind utility class cluster in class attributes
      const tailwindClasses = /class="[^"]*(?:flex\s+flex-col|grid\s+grid-cols|bg-slate-|text-slate-|rounded-xl|border-slate-)[^"]*"/i;
      return tailwindClasses.test(html);
    },
    domSelectors: ['style[id*="tailwind" i]', 'link[href*="tailwind" i]'],
  },
  {
    name: 'Lucide Icons',
    category: 'Libraries',
    patterns: [/lucide/i],
    htmlMatch: (html) => /class="[^"]*lucide\s+lucide-[^"]*"/i.test(html) || /data-lucide/i.test(html),
    domSelectors: ['svg.lucide', '[data-lucide]'],
  },
  {
    name: 'Framer Motion',
    category: 'Libraries',
    patterns: [/framer-motion/i],
    htmlMatch: (html) => /framer-motion/i.test(html) || /data-framer-/i.test(html),
  },
  {
    name: 'Sentry',
    category: 'Monitoring',
    patterns: [/browser\.sentry-cdn\.com/i, /sentry\.io/i, /@sentry/i],
    htmlMatch: (html) => /@sentry\/nextjs/i.test(html) || /sentry\.io/i.test(html) || /browser\.sentry-cdn\.com/i.test(html),
  },
  {
    name: 'WordPress',
    category: 'Framework',
    // Strict matching: NEVER match third-party image URLs (e.g. srcdn.com/wordpress/...)
    domSelectors: [
      'meta[name="generator"][content*="WordPress" i]',
      'link[rel="stylesheet"][href*="/wp-content/themes/"]',
      'link[rel="stylesheet"][href*="/wp-content/plugins/"]',
      'script[src*="/wp-includes/js/"]',
    ],
    htmlMatch: (html, pageDomain) => {
      // Only match if script or link is root-relative or hosted on the same domain
      if (/<meta\s+name=["']generator["']\s+content=["'][^"']*WordPress/i.test(html)) return true;
      if (/window\._wpemojiSettings/i.test(html)) return true;
      if (/<link[^>]+href=["'](\/|[a-z0-9.-]+\/)?wp-content\/(themes|plugins)\//i.test(html)) {
        // Exclude external third-party domain images
        if (pageDomain && html.includes(pageDomain + '/wp-content/')) return true;
        if (/<link[^>]+href=["']\/wp-content\//i.test(html)) return true;
      }
      return false;
    },
  },
  {
    name: 'Shopify',
    category: 'E-commerce',
    patterns: [/cdn\.shopify\.com/i],
    domSelectors: ['link[href*="cdn.shopify.com"]', 'meta[name="generator"][content*="Shopify" i]'],
  },
  {
    name: 'Webflow',
    category: 'Framework',
    patterns: [/assets\.webflow\.com/i],
    domSelectors: ['html[data-wf-page]', 'meta[name="generator"][content*="Webflow" i]'],
  },

  // Hosting / CDN / Cloud
  {
    name: 'Vercel',
    category: 'Hosting/CDN',
    patterns: [/vercel-insights\.com/i, /vercel\.live/i],
    headerMatch: (headers) =>
      headers['server']?.toLowerCase() === 'vercel' ||
      Boolean(headers['x-vercel-cache'] || headers['x-vercel-id']),
  },
  {
    name: 'Cloudflare',
    category: 'Hosting/CDN',
    patterns: [/challenges\.cloudflare\.com/i, /cloudflare-static/i],
    headerMatch: (headers) =>
      headers['server']?.toLowerCase().includes('cloudflare') ||
      Boolean(headers['cf-ray'] || headers['cf-cache-status']),
  },

  // Payments
  {
    name: 'Stripe',
    category: 'E-commerce',
    patterns: [/js\.stripe\.com\/v3/i],
  },
  {
    name: 'PayPal',
    category: 'E-commerce',
    patterns: [/paypal\.com\/sdk\/js/i],
  },

  // Tag Managers & Security
  {
    name: 'Google Tag Manager',
    category: 'Tag Managers',
    patterns: [/googletagmanager\.com\/gtm\.js/i],
    htmlMatch: (html) => /googletagmanager\.com\/gtm\.js/i.test(html) || /gtm\.start/i.test(html),
  },
  {
    name: 'Google reCAPTCHA',
    category: 'Security',
    patterns: [/recaptcha\/api\.js/i],
  },
];

export async function detectTechnographics(
  page: Page,
  context?: TechnographicContext
): Promise<TechnographicResult> {
  const html = await page.content().catch(() => '');
  const scriptSources = await page.$$eval('script[src]', (elements) =>
    elements.map((el) => el.getAttribute('src') || '')
  ).catch(() => []);

  const headers = context?.headers || {};
  const cleanDomain = (context?.domain || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  const nameservers = context?.nameservers || [];

  const matchedTechs: Map<string, TechStackItem> = new Map();

  // Test signatures against script URLs, response headers, and DOM selectors
  for (const sig of SIGNATURES) {
    let matched = false;

    // 1. Check response headers
    if (sig.headerMatch && sig.headerMatch(headers)) {
      matched = true;
    }

    // 2. Check script sources
    if (!matched && sig.patterns) {
      for (const pattern of sig.patterns) {
        if (scriptSources.some((src) => pattern.test(src))) {
          matched = true;
          break;
        }
      }
    }

    // 3. Check custom HTML matcher (or DOM selectors)
    if (!matched && sig.htmlMatch) {
      try {
        if (sig.htmlMatch(html, cleanDomain)) {
          matched = true;
        }
      } catch { }
    }

    // 4. Check DOM selectors on active page
    if (!matched && sig.domSelectors) {
      for (const selector of sig.domSelectors) {
        try {
          const exists = (await page.$(selector)) !== null;
          if (exists) {
            matched = true;
            break;
          }
        } catch { }
      }
    }

    if (matched) {
      matchedTechs.set(sig.name, {
        name: sig.name,
        category: sig.category,
        confidence: 0.95,
      });
    }
  }

  // Cross-signature inference:
  // If Next.js is detected, React is guaranteed to be in the stack
  if (matchedTechs.has('Next.js') && !matchedTechs.has('React')) {
    matchedTechs.set('React', {
      name: 'React',
      category: 'Framework',
      confidence: 1.0,
    });
  }

  // Check nameservers for hosting detection (e.g. ns1.vercel-dns.com -> Vercel)
  if (nameservers.some((ns) => ns.toLowerCase().includes('vercel-dns.com')) && !matchedTechs.has('Vercel')) {
    matchedTechs.set('Vercel', {
      name: 'Vercel',
      category: 'Hosting/CDN',
      confidence: 0.95,
    });
  }
  if (nameservers.some((ns) => ns.toLowerCase().includes('cloudflare.com')) && !matchedTechs.has('Cloudflare')) {
    matchedTechs.set('Cloudflare', {
      name: 'Cloudflare',
      category: 'Hosting/CDN',
      confidence: 0.95,
    });
  }

  const technologies = Array.from(matchedTechs.values());
  const cms = technologies.find((t) => t.category === 'Framework' && ['WordPress', 'Webflow', 'Shopify'].includes(t.name))?.name;
  const framework = technologies.find((t) => t.category === 'Framework' && ['Next.js', 'React'].includes(t.name))?.name;
  const marketingAutomation = technologies.filter((t) => t.category === 'Marketing' || t.category === 'CRM').map((t) => t.name);
  const analytics = technologies.filter((t) => t.category === 'Analytics').map((t) => t.name);

  return {
    technologies,
    cms,
    framework,
    marketingAutomation,
    analytics,
    rawDetectionsCount: technologies.length,
  };
}
