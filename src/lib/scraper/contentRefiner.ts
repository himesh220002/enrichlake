/**
 * Smart Web Content Refinery (Zero-Cost & AI Hybrid)
 *
 * Takes raw crawled website markdown and refines it into structured,
 * actionable intelligence: Executive Summary, Value Proposition,
 * Core Offerings, Target Audience, Contact Signals, Pricing,
 * and Strategic Takeaways.
 */

export interface RefinedContentData {
  title: string;
  url: string;
  executiveSummary: string;
  valueProposition: string;
  coreOfferings: string[];
  targetAudience: string;
  industrySector: string;
  contacts: {
    emails: string[];
    phones: string[];
    socialLinks: string[];
    locations: string[];
  };
  pricingSignals: string[];
  keyTakeaways: string[];
  technologySignals: string[];
  wordCount: number;
  readingTimeMin: number;
  refinedAt: string;
  refinementSource: 'ai_synthesis' | 'heuristic_nlp';
}

/**
 * Intelligent zero-cost NLP & structural heuristics refinery.
 */
export function refineWebContentHeuristic(params: {
  markdown: string;
  title: string;
  url: string;
  headings?: Array<{ level: number; text: string }>;
  wordCount?: number;
}): RefinedContentData {
  const { markdown = '', title = '', url = '', headings = [], wordCount = 0 } = params;

  // Clean lines and paragraphs
  const rawLines = markdown.split('\n').map((l) => l.trim()).filter(Boolean);
  const textBlocks = rawLines.filter(
    (l) =>
      !l.startsWith('#') &&
      !l.startsWith('!') &&
      !l.startsWith('[') &&
      l.length > 25
  );

  // 1. Executive Summary & Value Proposition Extraction
  let executiveSummary = '';
  let valueProposition = '';

  // Look for introductory paragraphs
  const candidateSummaries = textBlocks.filter(
    (b) =>
      !b.toLowerCase().includes('cookie') &&
      !b.toLowerCase().includes('javascript') &&
      !b.toLowerCase().includes('all rights reserved') &&
      !b.toLowerCase().includes('sign in') &&
      !b.toLowerCase().includes('log in') &&
      b.length > 40
  );

  if (candidateSummaries.length > 0) {
    executiveSummary = candidateSummaries.slice(0, 2).join(' ');
    valueProposition = candidateSummaries[0];
  } else {
    executiveSummary = `${title} is a digital property providing comprehensive solutions, published content, and resources at ${url}.`;
    valueProposition = `${title} serves users with dedicated online services and informative resources.`;
  }

  // 2. Core Offerings & Products Extraction
  const coreOfferings: string[] = [];
  const listItems = rawLines.filter((l) => /^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l));

  for (const item of listItems) {
    const clean = item.replace(/^[-*•\d.]\s+/, '').trim();
    if (
      clean.length > 10 &&
      clean.length < 140 &&
      !clean.toLowerCase().includes('terms') &&
      !clean.toLowerCase().includes('privacy') &&
      !clean.toLowerCase().includes('cookie') &&
      !clean.toLowerCase().includes('contact us')
    ) {
      if (!coreOfferings.includes(clean)) {
        coreOfferings.push(clean);
        if (coreOfferings.length >= 6) break;
      }
    }
  }

  // If list items were scarce, extract from H2/H3 headings
  if (coreOfferings.length < 3 && headings.length > 0) {
    for (const h of headings) {
      if (h.level >= 2 && h.text.length > 5 && h.text.length < 80) {
        const lowerH = h.text.toLowerCase();
        if (
          !lowerH.includes('about') &&
          !lowerH.includes('contact') &&
          !lowerH.includes('footer') &&
          !lowerH.includes('nav') &&
          !lowerH.includes('copyright')
        ) {
          if (!coreOfferings.includes(h.text)) {
            coreOfferings.push(h.text);
            if (coreOfferings.length >= 5) break;
          }
        }
      }
    }
  }

  if (coreOfferings.length === 0) {
    coreOfferings.push(
      'Core Platform Services & Customer Solutions',
      'Automated Workflows & Information Hub',
      'Resource Center & Community Updates'
    );
  }

  // 3. Contacts Extraction (Emails, Phones, Locations, Socials)
  const emails: string[] = [];
  const phones: string[] = [];
  const socialLinks: string[] = [];
  const locations: string[] = [];

  const emailMatches = markdown.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g) || [];
  emailMatches.forEach((e) => {
    const cleanEmail = e.toLowerCase();
    if (!cleanEmail.includes('example.com') && !cleanEmail.includes('w3.org') && !emails.includes(cleanEmail)) {
      emails.push(cleanEmail);
    }
  });

  const phoneMatches = markdown.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
  phoneMatches.forEach((p) => {
    const cleanPhone = p.trim();
    if (cleanPhone.length >= 10 && !phones.includes(cleanPhone)) {
      phones.push(cleanPhone);
    }
  });

  const socialRegex = /(?:https?:\/\/)?(?:www\.)?(linkedin\.com\/[^\s\)"']+)|(?:https?:\/\/)?(?:www\.)?(twitter\.com\/[^\s\)"']+)|(?:https?:\/\/)?(?:www\.)?(x\.com\/[^\s\)"']+)|(?:https?:\/\/)?(?:www\.)?(facebook\.com\/[^\s\)"']+)|(?:https?:\/\/)?(?:www\.)?(instagram\.com\/[^\s\)"']+)|(?:https?:\/\/)?(?:www\.)?(github\.com\/[^\s\)"']+)/gi;
  const socialMatches = markdown.match(socialRegex) || [];
  socialMatches.forEach((s) => {
    const cleanSocial = s.replace(/[\)\]'"]+$/, '').trim();
    if (!socialLinks.includes(cleanSocial) && !cleanSocial.endsWith('.com')) {
      socialLinks.push(cleanSocial);
    }
  });

  // Location heuristics (City, State / Country patterns)
  const locationKeywords = ['San Francisco', 'New York', 'London', 'Berlin', 'Bangalore', 'Mumbai', 'Delhi', 'Jaipur', 'Toronto', 'Singapore', 'Austin', 'Seattle', 'California', 'USA', 'India', 'UK', 'Germany'];
  locationKeywords.forEach((loc) => {
    if (markdown.includes(loc) && !locations.includes(loc)) {
      locations.push(loc);
    }
  });

  // 4. Target Audience & Industry Classification
  let targetAudience = 'Broad Digital Audience / Consumers';
  let industrySector = 'Technology & Digital Services';

  const lowerMd = markdown.toLowerCase();
  if (lowerMd.includes('b2b') || lowerMd.includes('enterprise') || lowerMd.includes('crm') || lowerMd.includes('saas') || lowerMd.includes('api')) {
    targetAudience = 'B2B Enterprise & High-Growth Technology Teams';
    industrySector = 'Enterprise SaaS & Cloud Infrastructure';
  } else if (lowerMd.includes('ecommerce') || lowerMd.includes('shop') || lowerMd.includes('cart') || lowerMd.includes('clothing') || lowerMd.includes('store')) {
    targetAudience = 'Online Shoppers & E-Commerce Consumers';
    industrySector = 'E-Commerce & Retail';
  } else if (lowerMd.includes('car') || lowerMd.includes('automotive') || lowerMd.includes('vehicle') || lowerMd.includes('dealer')) {
    targetAudience = 'Automotive Buyers, Sellers & Dealerships';
    industrySector = 'Automotive & Mobility';
  } else if (lowerMd.includes('developer') || lowerMd.includes('github') || lowerMd.includes('code') || lowerMd.includes('hacker news') || lowerMd.includes('y combinator')) {
    targetAudience = 'Software Engineers, Founders & Technologists';
    industrySector = 'Developer Ecosystem & Venture Tech';
  } else if (lowerMd.includes('finance') || lowerMd.includes('invest') || lowerMd.includes('bank') || lowerMd.includes('payment')) {
    targetAudience = 'Financial Institutions, Investors & Businesses';
    industrySector = 'Fintech & Financial Services';
  }

  // 5. Pricing Signals
  const pricingSignals: string[] = [];
  const priceMatches = markdown.match(/(?:[$€£₹]\s?\d+(?:,\d{3})*(?:\.\d{2})?(?:\/(?:mo|month|yr|year))?)|(?:\bfree\s+(?:trial|tier|plan)\b)|(?:\benterprise\s+pricing\b)|(?:\bcontact\s+sales\b)/gi) || [];
  priceMatches.forEach((pm) => {
    const cleanP = pm.trim();
    if (!pricingSignals.includes(cleanP) && pricingSignals.length < 5) {
      pricingSignals.push(cleanP);
    }
  });

  if (pricingSignals.length === 0) {
    if (lowerMd.includes('free')) pricingSignals.push('Free Access / Community Tier Mentioned');
    if (lowerMd.includes('pricing') || lowerMd.includes('plans')) pricingSignals.push('Commercial Plans Available');
    else pricingSignals.push('Custom Quote / Enterprise Contact Required');
  }

  // 6. Technology Signals
  const technologySignals: string[] = [];
  const techKeywords = ['Next.js', 'React', 'Vue', 'Node.js', 'Python', 'TypeScript', 'Tailwind', 'AWS', 'Google Cloud', 'Cloudflare', 'Stripe', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis'];
  techKeywords.forEach((tk) => {
    if (new RegExp(`\\b${tk}\\b`, 'i').test(markdown) && !technologySignals.includes(tk)) {
      technologySignals.push(tk);
    }
  });

  // 7. Strategic Key Takeaways
  const keyTakeaways = [
    `Strong positioning in ${industrySector} with targeted outreach to ${targetAudience}.`,
    coreOfferings.length > 0
      ? `Primary product highlights emphasize ${coreOfferings[0].slice(0, 70)}.`
      : `Broad catalog of digital tools and service interfaces.`,
    emails.length > 0 || phones.length > 0
      ? `Direct business communication channels available (${[...emails, ...phones].slice(0, 2).join(', ')}).`
      : `High web engagement footprint across digital channels.`,
    `Optimal engagement strategy: Tailor outreach around ${valueProposition.slice(0, 60)}...`,
  ];

  return {
    title,
    url,
    executiveSummary: executiveSummary.slice(0, 480),
    valueProposition: valueProposition.slice(0, 240),
    coreOfferings: coreOfferings.slice(0, 6),
    targetAudience,
    industrySector,
    contacts: {
      emails: emails.slice(0, 4),
      phones: phones.slice(0, 4),
      socialLinks: socialLinks.slice(0, 6),
      locations: locations.slice(0, 4),
    },
    pricingSignals: pricingSignals.slice(0, 5),
    keyTakeaways: keyTakeaways.slice(0, 4),
    technologySignals: technologySignals.slice(0, 8),
    wordCount: wordCount || rawLines.join(' ').split(/\s+/).length,
    readingTimeMin: Math.max(1, Math.ceil((wordCount || 500) / 220)),
    refinedAt: new Date().toISOString(),
    refinementSource: 'heuristic_nlp',
  };
}
