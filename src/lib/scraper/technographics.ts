import { Page } from 'playwright';

export interface TechStackItem {
  name: string;
  category: 'Analytics' | 'Marketing' | 'CRM' | 'Framework' | 'Hosting/CDN' | 'E-commerce' | 'Tag Managers' | 'Security';
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

interface TechSignature {
  name: string;
  category: TechStackItem['category'];
  patterns: RegExp[];
  domSelectors?: string[];
}

const SIGNATURES: TechSignature[] = [
  // Analytics
  {
    name: 'Google Analytics 4',
    category: 'Analytics',
    patterns: [/googletagmanager\.com\/gtag\/js\?id=G-/i, /google-analytics\.com\/g\/collect/i],
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

  // Frameworks & CMS
  {
    name: 'Next.js',
    category: 'Framework',
    patterns: [/_next\/static/i],
    domSelectors: ['#__next', 'script[id="__NEXT_DATA__"]'],
  },
  {
    name: 'React',
    category: 'Framework',
    patterns: [/react(\.production)?\.min\.js/i],
    domSelectors: ['[data-reactroot]', '[data-react-helmet]'],
  },
  {
    name: 'WordPress',
    category: 'Framework',
    patterns: [/wp-content\//i, /wp-includes\//i],
    domSelectors: ['meta[name="generator"][content*="WordPress" i]'],
  },
  {
    name: 'Shopify',
    category: 'E-commerce',
    patterns: [/cdn\.shopify\.com/i],
    domSelectors: ['link[href*="cdn.shopify.com"]'],
  },
  {
    name: 'Webflow',
    category: 'Framework',
    patterns: [/assets\.webflow\.com/i],
    domSelectors: ['html[data-wf-page]', 'meta[name="generator"][content*="Webflow" i]'],
  },

  // Hosting / CDN / Cloud
  {
    name: 'Cloudflare',
    category: 'Hosting/CDN',
    patterns: [/challenges\.cloudflare\.com/i, /cloudflare-static/i],
  },
  {
    name: 'Vercel',
    category: 'Hosting/CDN',
    patterns: [/vercel-insights\.com/i, /vercel\.live/i],
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
  },
  {
    name: 'Google reCAPTCHA',
    category: 'Security',
    patterns: [/recaptcha\/api\.js/i],
  },
];

export async function detectTechnographics(page: Page): Promise<TechnographicResult> {
  const html = await page.content();
  const scriptSources = await page.$$eval('script[src]', (elements) =>
    elements.map((el) => el.getAttribute('src') || '')
  );

  const matchedTechs: Map<string, TechStackItem> = new Map();

  // Test signatures against script URLs and HTML
  for (const sig of SIGNATURES) {
    let matched = false;

    for (const pattern of sig.patterns) {
      if (scriptSources.some((src) => pattern.test(src)) || pattern.test(html)) {
        matched = true;
        break;
      }
    }

    if (!matched && sig.domSelectors) {
      for (const selector of sig.domSelectors) {
        try {
          const exists = (await page.$(selector)) !== null;
          if (exists) {
            matched = true;
            break;
          }
        } catch {
          // Selector query failed or unsupported
        }
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
