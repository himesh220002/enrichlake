// Shared data confidence + completeness utilities — client & server safe
export type FieldConfidence = 'high' | 'medium' | 'low' | 'unknown';

export interface FieldProvenance {
  value: string;
  confidence: FieldConfidence;
  source: 'dom_visible' | 'tel_link' | 'mailto' | 'schema_org' | 'meta_tag' | 'ai_inferred' | 'benchmark' | 'missing';
  rawSnippet?: string;
}

export function confidenceBadge(conf: FieldConfidence): { label: string; className: string } {
  switch (conf) {
    case 'high': return { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'medium': return { label: 'Likely', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'low': return { label: 'Uncertain', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    default: return { label: 'Missing', className: 'bg-slate-800 text-slate-500 border-slate-700' };
  }
}

export function computeCompletenessScore(fields: Array<{ present: boolean; weight?: number }>): number {
  let total = 0, scored = 0;
  for (const f of fields) { const w = f.weight ?? 1; total += w; if (f.present) scored += w; }
  return total === 0 ? 0 : Math.round((scored / total) * 100);
}

// GSTIN checksum (mod 36) validator — catches synthetic GSTINs like 27ABCDE1234F1Z
const GSTIN_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function gstinChecksumValid(gstin: string): boolean {
  const s = gstin.toUpperCase().trim();
  if (s.length !== 15) return false;
  let factor = 2, sum = 0;
  const chars = s.split('');
  const checkChar = chars[14];
  for (let i = 0; i < 14; i++) {
    const code = GSTIN_CHARSET.indexOf(chars[i]);
    if (code < 0) return false;
    let digit = factor * code;
    digit = Math.floor(digit / 36) + (digit % 36);
    sum += digit;
    factor = factor === 2 ? 1 : 2;
  }
  const expectedIdx = (36 - (sum % 36)) % 36;
  return GSTIN_CHARSET[expectedIdx] === checkChar;
}

export function isValidGSTIN(gstin: string): boolean {
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(gstin.trim().toUpperCase())) return false;
  const stateCode = parseInt(gstin.slice(0, 2), 10);
  if (stateCode < 1 || stateCode > 38) return false;
  return gstinChecksumValid(gstin);
}

export function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(pan.trim().toUpperCase());
}

// Honeypot / obvious synthetic phone/email detectors
const HONEYPOT_PHONES = new Set(['0000000000','1111111111','1234567890','9999999999']);
export function isHoneypotPhone(digits: string): boolean {
  const d = digits.replace(/\D/g,'');
  if (HONEYPOT_PHONES.has(d)) return true;
  if (/^(\d)\1{7,}$/.test(d)) return true;
  if (d === '0123456789' || d === '9876543210') return true;
  return false;
}

export function deobfuscateEmails(text: string): string[] {
  if (!text) return [];
  let norm = text
    .replace(/\[at\]/gi, '@').replace(/\(at\)/gi, '@').replace(/\s+at\s+/gi, '@')
    .replace(/\[dot\]/gi, '.').replace(/\(dot\)/gi, '.').replace(/\s+dot\s+/gi, '.')
    .replace(/\s*@\s*/g, '@').replace(/\s*\.\s*/g, '.');
  const re = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;
  return Array.from(norm.matchAll(re)).map(m=>m[0].toLowerCase());
}
