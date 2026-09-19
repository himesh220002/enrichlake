// Unified keyword taxonomy: maps user intent -> normalized specs -> optimized search queries
// Covers IT, metals, agri, chemicals, textiles, solar, construction, machinery/PPE
export type IndustryGroup = 'it' | 'metals' | 'agri' | 'solar' | 'textiles' | 'chemicals' | 'construction' | 'machinery' | 'generic';

export interface TaxonomyEntry {
  group: IndustryGroup;
  label: string;
  // human hints that imply this group
  triggers: RegExp[];
  // per-field patterns with canonical unit normalization
  specPatterns: Array<{ field: string; regex: RegExp; canonicalUnit?: string; example: string }>;
  queryBuilders: string[]; // templates, {specs} {product} {category}
}

export const KEYWORD_TAXONOMY: TaxonomyEntry[] = [
  {
    group: 'it', label: 'Electronics & Computers',
    triggers: [/\b(laptop|nitro|victus|tuf|rtx|gtx|ram|ssd|ddr|processor|core i\d|ryzen|144hz|1080p|oled)\b/i],
    specPatterns: [
      { field: 'Processor', regex: /\b(i[3579][-\s]?\d{4,5}[A-Z]?|ryzen\s*\d\s*\d{4}[A-Z]?)\b/i, example: 'i5-12450H' },
      { field: 'RAM', regex: /\b(4|8|16|32|64)\s*gb\s*(ddr[45])?\b/i, canonicalUnit: 'GB', example: '16GB DDR5' },
      { field: 'GPU', regex: /\b(rtx|gtx)\s*(3050|4050|4060|4070|4080|1650)\b/i, example: 'RTX 3050' },
      { field: 'Storage', regex: /\b(256|512|1024)\s*gb\s*ssd|\b1\s*tb\s*(ssd|nvme)\b/i, example: '512GB SSD' },
      { field: 'Display', regex: /\b(120|144|165|240|300)\s*hz\b/i, canonicalUnit: 'Hz', example: '144Hz' },
    ],
    queryBuilders: ['{product} {specs} buy online price', '{product} {specs} site:indiamart.com OR site:tradeindia.com', '{category} {specs} wholesale supplier']
  },
  {
    group: 'machinery', label: 'Hydraulics & Machinery',
    triggers: [/\b(hydraulic|valve|cetop|ng6|bar|lpm|spool|solenoid|pump|motor)\b/i],
    specPatterns: [
      { field: 'Working Pressure', regex: /\b(150|200|250|315|350)\s*bar\b/i, canonicalUnit: 'Bar', example: '250 Bar' },
      { field: 'Flow Capacity', regex: /\b(20|40|60|80|120)\s*lpm\b/i, canonicalUnit: 'LPM', example: '60 LPM' },
      { field: 'Mounting', regex: /\b(cetop\s*3|ng6|subplate)\b/i, example: 'CETOP 3' },
      { field: 'Spool Operation', regex: /\b(24v\s*dc|double solenoid)\b/i, example: '24V DC Double Solenoid' },
    ],
    queryBuilders: ['hydraulic directional valve {specs} site:indiamart.com', '{product} {specs} CETOP3 hydraulic supplier']
  },
  {
    group: 'metals', label: 'Industrial Metals & Steel',
    triggers: [/\b(steel|tmt|rebar|fe\s*500|stainless|pipe|rod|is\s*1786)\b/i],
    specPatterns: [
      { field: 'Grade', regex: /\bfe\s*500d?\b/i, example: 'Fe 500D' },
      { field: 'Diameter', regex: /\b(8|10|12|16|20|25|32)\s*mm\b/i, canonicalUnit: 'mm', example: '12mm' },
      { field: 'Standard', regex: /\bis\s*1786\b/i, example: 'IS 1786' },
    ],
    queryBuilders: ['{product} {specs} steel supplier mm IS 1786', '{category} {specs} site:indiamart.com']
  },
  {
    group: 'agri', label: 'Agriculture & Food',
    triggers: [/\b(rice|basmati|sella|wheat|grain|quintal|moisture|broken ratio|packing)\b/i],
    specPatterns: [
      { field: 'Grain Length', regex: /\b8\.\d+\s*mm\b/i, example: '8.35mm' },
      { field: 'Moisture', regex: /\b(10|11|12|12\.5)\s*%\b/i, example: '12.5%' },
      { field: 'Broken Ratio', regex: /\b(0\.5|1\.0|2\.0)\s*%\b/i, example: '1.0%' },
    ],
    queryBuilders: ['{product} {specs} rice mandi indiamart', '{category} {specs} quintal wholesale']
  },
  {
    group: 'textiles', label: 'Textiles & Fabrics',
    triggers: [/\b(textile|cotton|fabric|yarn|gsm|twill|weave)\b/i],
    specPatterns: [
      { field: 'GSM Weight', regex: /\b(150|180|200|220|250)\s*gsm\b/i, canonicalUnit: 'GSM', example: '220 GSM' },
      { field: 'Material', regex: /\b(100%\s*cotton|poly-?cotton|cotton)\b/i, example: '100% Cotton' },
    ],
    queryBuilders: ['{product} {specs} textile fabric GSM supplier', '{category} {specs} yarn textile indiamart']
  },
  {
    group: 'chemicals', label: 'Chemicals & Solvents',
    triggers: [/\b(chemical|ipa|isopropyl|purity|solvent|acetone|reagent)\b/i],
    specPatterns: [
      { field: 'Purity', regex: /\b99\.\d+\s*%\b/i, example: '99.9%' },
      { field: 'Packaging', regex: /\b160\s*kg\b|\btanker\b/i, example: '160kg Drum' },
    ],
    queryBuilders: ['{product} {specs} chemical supplier IPA purity', '{category} {specs} chemical solvent wholesale']
  },
  {
    group: 'solar', label: 'Solar & Renewable',
    triggers: [/\b(solar|pv|bifacial|topcon|lifepo4|bms|battery|watt)\b/i],
    specPatterns: [
      { field: 'Power Output', regex: /\b(540|550|580)\s*w\b/i, canonicalUnit: 'W', example: '550W' },
      { field: 'Efficiency', regex: /\b2[12]\.\d+\s*%\b/i, example: '21.5%' },
    ],
    queryBuilders: ['{product} {specs} solar panel 550W bifacial', '{category} {specs} LiFePO4 battery solar']
  },
  {
    group: 'construction', label: 'Construction & Cement',
    triggers: [/\b(cement|opc|ppc|aggregate|concrete|mpa)\b/i],
    specPatterns: [
      { field: 'Grade', regex: /\bopc\s*53\b/i, example: 'OPC 53 Grade' },
      { field: 'Strength', regex: /\b(53|55|60)\s*mpa\b/i, example: '53 MPa' },
    ],
    queryBuilders: ['{product} {specs} cement OPC IS 269', '{category} {specs} construction material dealer']
  },
];

export function detectIndustryGroup(text: string): IndustryGroup {
  const t = (text || '').toLowerCase();
  for (const entry of KEYWORD_TAXONOMY) {
    if (entry.triggers.some(r => r.test(t))) return entry.group;
  }
  return 'generic';
}

export function normalizeSpecValue(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
    .replace(/\bbar\b/gi, 'Bar').replace(/\blpm\b/gi, 'LPM')
    .replace(/\bgsm\b/gi, 'GSM').replace(/\bhz\b/gi, 'Hz')
    .replace(/\bmm\b/gi, 'mm');
}

export function buildOptimizedQueries(opts: { product: string; category: string; specs: string; group: IndustryGroup }): string[] {
  const entry = KEYWORD_TAXONOMY.find(e => e.group === opts.group) || KEYWORD_TAXONOMY[0];
  const specs = opts.specs || '';
  const product = opts.product || opts.category || 'commercial procurement';
  return entry.queryBuilders.map(tpl =>
    tpl.replace('{product}', product).replace('{specs}', specs).replace('{category}', opts.category || product)
       .replace(/\s+/g, ' ').trim()
  ).slice(0, 3);
}

export function scoreSpecMatch(querySpecs: string, recordSpecs: string): number {
  if (!querySpecs.trim()) return 100;
  const qtokens = querySpecs.toLowerCase().split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean);
  const lowerRec = recordSpecs.toLowerCase();
  let hits = 0;
  for (const tok of qtokens) {
    const core = tok.replace(/^[^:]+:\s*/, '').trim(); // strip "Field: value" prefix
    if (!core) continue;
    if (lowerRec.includes(core.toLowerCase())) hits++;
    else {
      // fuzzy unit normalization: "250Bar" matches "250 Bar"
      const normCore = core.replace(/\s+/g, '').toLowerCase();
      const normRec = lowerRec.replace(/\s+/g, '').toLowerCase();
      if (normRec.includes(normCore)) hits++;
    }
  }
  return qtokens.length === 0 ? 100 : Math.round((hits / qtokens.length) * 100);
}
