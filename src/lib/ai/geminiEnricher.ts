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
 * Uses Google Gemini to analyze real scraped web content and extract truthful,
 * factual commercial fields. Strictly returns null for unknown or unverified data.
 */
export async function analyzeDomainWithGemini(
  input: GeminiEnrichmentInput,
  apiKey: string,
  modelName?: string
): Promise<GeminiEnrichmentOutput | null> {
  if (!apiKey) return null;

  const candidateModels = [
    modelName?.includes('gemini') ? modelName : 'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
  ];

  const prompt = `You are a strict, objective commercial data verification agent.
Analyze this REAL web scraped content from the website "${input.domain}" (${input.url}).

CRITICAL ANTI-HALLUCINATION & HONESTY RULES:
1. Every field you extract must be strictly verified from the provided text below.
2. If any piece of information is missing, not mentioned, or cannot be determined with certainty, you MUST return null (or an empty array [] for lists).
3. NEVER assume, guess, or invent fake Indian addresses, fake coordinates, fake GSTINs, fake PAN numbers, or fake default values.
4. CATEGORY: Accurately classify the company's real industry based on their actual services and description (e.g. "Digital Agency & Software Engineering", "Web & Software Development", "Fintech", "Electronics Retail", etc.). NEVER guess an unrelated category like "Agriculture Supply" unless they literally produce or sell agricultural goods!
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

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            location: parsed.location && parsed.location.formattedAddress ? parsed.location : null,
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
        console.warn(`[Gemini Enricher] Model ${model} returned status ${res.status}:`, errText.slice(0, 150));
      }
    } catch (err: any) {
      console.warn(`[Gemini Enricher] Attempt with ${model} failed:`, err.message);
    }
  }

  return null;
}
