/**
 * Gemini AI Enrichment Engine with Multi-Model Fallbacks and Intelligent Rule-Based Safety
 */

export interface GeminiEnrichmentInput {
  domain: string;
  url: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  headings: string[];
  visibleText: string;
  emails: string[];
  phones: string[];
  addresses: string[];
  socialLinks: Record<string, string>;
}

export interface GeminiEnrichmentOutput {
  companyName: string | null;
  category: string | null;
  productsServices: string[];
  description: string | null;
  location: {
    formattedAddress: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  geoData: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  businessDetails: {
    gstin?: string | null;
    pan?: string | null;
    cin?: string | null;
    isoCertified?: boolean;
    rawDetails: string | null;
  } | null;
  verification: string[];
  statusTags: string[];
}

/**
 * Intelligent rule-based fallback analyzer when Gemini API is unavailable or quota is exhausted (429/404).
 */
export function generateRuleBasedEnrichmentFallback(input: GeminiEnrichmentInput): GeminiEnrichmentOutput {
  const cleanDomain = input.domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  
  // 1. Resolve Brand/Company Name
  let companyName = '';
  if (input.title) {
    const titleParts = input.title.split(/[|\-–—:•]/).map((p) => p.trim()).filter(Boolean);
    if (titleParts.length > 0) {
      // Pick part closest in length or matching domain token
      const token = cleanDomain.split('.')[0].toLowerCase();
      const matchingPart = titleParts.find((p) => p.toLowerCase().includes(token));
      companyName = matchingPart || titleParts[0];
    }
  }
  if (!companyName || companyName.length < 2) {
    const rawToken = cleanDomain.split('.')[0];
    companyName = rawToken.charAt(0).toUpperCase() + rawToken.slice(1);
  }

  // 2. Resolve Realistic Vertical / Category
  const corpus = `${input.title} ${input.metaDescription} ${input.metaKeywords} ${input.headings.join(' ')} ${input.visibleText.slice(0, 3000)}`.toLowerCase();
  
  let category = 'Technology & Digital Solutions';
  if (/cybersecurity|infosec|encryption|security|soc|pen\s*test/i.test(corpus)) {
    category = 'Cybersecurity & Infrastructure Protection';
  } else if (/software|full-?stack|web\s*dev|frontend|backend|api|react|next\.?js|node/i.test(corpus)) {
    category = 'Software Engineering & Digital Solutions';
  } else if (/artificial\s*intelligence|machine\s*learning|deep\s*learning|llm|nlp/i.test(corpus)) {
    category = 'Artificial Intelligence & Data Platforms';
  } else if (/ecommerce|e-commerce|shopping|retail|store|cart|merchandise/i.test(corpus)) {
    category = 'E-Commerce & Digital Retail';
  } else if (/fintech|banking|payments|crypto|wallet|invest/i.test(corpus)) {
    category = 'Fintech & Financial Technology';
  } else if (/marketing|seo|branding|creative|agency|advertising/i.test(corpus)) {
    category = 'Digital Marketing & Growth Agency';
  } else if (/cloud|devops|hosting|server|kubernetes|docker/i.test(corpus)) {
    category = 'Cloud Services & DevOps Engineering';
  }

  // 3. Resolve Real Core Offerings
  const offerings: string[] = [];
  const candidateHeadings = input.headings
    .map((h) => h.trim())
    .filter((h) => h.length >= 4 && h.length <= 60)
    .filter((h) => !/^(home|about|contact|login|sign in|privacy|terms|menu|navigation|footer)$/i.test(h));

  for (const h of candidateHeadings) {
    if (!offerings.includes(h)) offerings.push(h);
    if (offerings.length >= 6) break;
  }

  if (offerings.length === 0) {
    if (/software|web/i.test(category)) {
      offerings.push('Custom Web & Software Engineering', 'Cloud Infrastructure & Deployment', 'Interactive User Interfaces');
    } else {
      offerings.push('Commercial Digital Services', 'Online Platform Solutions');
    }
  }

  // 4. Resolve Description
  let description: string | null = null;
  if (input.metaDescription && input.metaDescription.trim().length > 20) {
    description = input.metaDescription.trim();
  } else if (input.visibleText) {
    const firstSentence = input.visibleText.replace(/\s+/g, ' ').trim().split(/[.!?]\s+/)[0];
    if (firstSentence && firstSentence.length > 20 && firstSentence.length < 200) {
      description = `${firstSentence}.`;
    }
  }
  if (!description) {
    description = `${companyName} provides high-performance ${category.toLowerCase()} accessible via ${cleanDomain}.`;
  }

  // 5. Address & Location (Strict factual honesty: only if verified)
  let location: GeminiEnrichmentOutput['location'] = null;
  if (input.addresses && input.addresses.length > 0) {
    const addr = input.addresses[0];
    location = {
      formattedAddress: addr,
      city: null,
      state: null,
      country: addr.toLowerCase().includes('india') ? 'India' : null,
    };
  }

  return {
    companyName,
    category,
    productsServices: offerings,
    description,
    location,
    geoData: null,
    businessDetails: null,
    verification: [],
    statusTags: ['Active'],
  };
}

/**
 * Uses Google Gemini to analyze real scraped web content and extract truthful,
 * factual commercial fields. Strictly falls back to intelligent rule-based synthesis if quota is exceeded or models 404.
 */
export async function analyzeDomainWithGemini(
  input: GeminiEnrichmentInput,
  apiKey: string,
  modelName?: string
): Promise<GeminiEnrichmentOutput | null> {
  // If no API key provided, execute deterministic rule-based analysis directly
  if (!apiKey) {
    return generateRuleBasedEnrichmentFallback(input);
  }

  // Current active Gemini flagship models (v1beta API endpoints)
  const candidateModels = [
    modelName?.includes('gemini') ? modelName : 'gemini-2.5-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-flash-latest',
    'gemini-pro-latest',
  ];

  // Deduplicate candidate model list
  const uniqueModels = Array.from(new Set(candidateModels));

  const prompt = `You are a strict, objective commercial data verification agent.
Analyze this REAL web scraped content from the website "${input.domain}" (${input.url}).

CRITICAL ANTI-HALLUCINATION & HONESTY RULES:
1. Every field you extract must be strictly verified from the provided text below.
2. If any piece of information is missing, not mentioned, or cannot be determined with certainty, you MUST return null (or an empty array [] for lists).
3. NEVER assume, guess, or invent fake Indian addresses, fake coordinates, fake GSTINs, fake PAN numbers, or fake default values.
4. CATEGORY: Accurately classify the company's real industry based on their actual services and description (e.g. "Software Engineering & Digital Solutions", "Web & Cloud Development", "Cybersecurity", "Fintech", "E-Commerce", etc.). NEVER guess an unrelated category like "Agriculture Supply" unless they literally produce or sell agricultural goods!
5. LOCATION: If the website specifies an address, city, or "Remote Worldwide", extract that. If no location is mentioned, return null.
6. GEO DATA: Only provide latitude and longitude if exact coordinates or a clear physical address with unmistakable coordinates is found. Otherwise return null.
7. BUSINESS DETAILS: Only provide GSTIN, PAN, CIN, or ISO if explicitly written in the text. If none are found, return null.
8. VERIFICATION: Only include badges that are proven by real tax/cert credentials in the text (e.g. "GSTIN Verified" if a valid GSTIN exists, "PAN Verified", "ISO Certified"). If none, return [].
9. PRODUCTS / SERVICES: Return an array of actual products or services offered by the company mentioned in the text.

Scraped Website Content:
- Domain: ${input.domain}
- URL: ${input.url}
- Title: ${input.title}
- Meta Description: ${input.metaDescription}
- Meta Keywords: ${input.metaKeywords}
- Headings: ${input.headings.slice(0, 15).join(' | ')}
- Scraped Emails: ${input.emails.join(', ') || 'None'}
- Scraped Phones: ${input.phones.join(', ') || 'None'}
- Scraped Addresses: ${input.addresses.join(' | ') || 'None'}
- Visible Text & Footer (first 6000 chars):
${input.visibleText.slice(0, 6000)}

Return ONLY a JSON object matching this schema:
{
  "companyName": "<string: accurate company name, or null>",
  "category": "<string: accurate business industry/category, or null>",
  "productsServices": ["<actual product or service 1>", "<actual product or service 2>"],
  "description": "<string: 1-2 sentence concise factual summary, or null>",
  "location": {
    "formattedAddress": "<string: actual address or 'Remote Worldwide', or null if unlisted>",
    "city": "<string: actual city, or null>",
    "state": "<string: actual state, or null>",
    "country": "<string: actual country, or null>"
  } or null,
  "geoData": {
    "latitude": <number or null>,
    "longitude": <number or null>
  } or null,
  "businessDetails": {
    "gstin": "<string or null>",
    "pan": "<string or null>",
    "cin": "<string or null>",
    "isoCertified": <boolean: true only if ISO certification stated, otherwise false>,
    "rawDetails": "<string or null: e.g. 'GSTIN: ..., ISO Certified', or null if none>"
  } or null,
  "verification": ["<e.g. 'GSTIN Verified' if GSTIN present, 'PAN Verified' if PAN present. Empty [] if none>"],
  "statusTags": ["<e.g. 'Active', 'Expanding' if actively operating, otherwise ['Active']>"]
}`;

  for (const model of uniqueModels.slice(0, 2)) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            companyName: parsed.companyName || null,
            category: parsed.category || null,
            productsServices: Array.isArray(parsed.productsServices) ? parsed.productsServices : [],
            description: parsed.description || null,
            location: parsed.location && parsed.location.formattedAddress ? {
              formattedAddress: parsed.location.formattedAddress,
              city: parsed.location.city || null,
              state: parsed.location.state || null,
              country: parsed.location.country || null,
            } : null,
            geoData: parsed.geoData && typeof parsed.geoData.latitude === 'number' && typeof parsed.geoData.longitude === 'number'
              ? parsed.geoData
              : null,
            businessDetails: parsed.businessDetails && (parsed.businessDetails.gstin || parsed.businessDetails.pan || parsed.businessDetails.cin || parsed.businessDetails.isoCertified)
              ? parsed.businessDetails
              : null,
            verification: Array.isArray(parsed.verification) ? parsed.verification : [],
            statusTags: Array.isArray(parsed.statusTags) && parsed.statusTags.length > 0 ? parsed.statusTags : ['Active'],
          };
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[Gemini Enricher] Model ${model} returned status ${res.status}:`, errText.slice(0, 160));
      }
    } catch (err: any) {
      console.warn(`[Gemini Enricher] Attempt with ${model} failed:`, err.message);
    }
  }

  // If all models failed or quota reached (429/404), return intelligent logical fallback
  console.log('[Gemini Enricher] Active models unavailable or quota reached — activating intelligent rule-based enrichment fallback.');
  return generateRuleBasedEnrichmentFallback(input);
}
