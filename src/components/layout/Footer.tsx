import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-[#060a18]">
      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-20 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><Sparkles className="w-4 h-4 text-indigo-600" /></span>
              <span className="font-extrabold tracking-[0.14em] text-xs text-white">ENRICHER.AI</span>
            </div>
            <p className="mt-3 text-sm text-slate-400 max-w-sm leading-relaxed">Zero-cost stealth scraping, technographics, and B2B sourcing with GST-verified intelligence. Spacious, modern, full-width workspace.</p>
            <div className="mt-4 text-xs text-slate-500">© 2025–2026 Enricher.ai • Built for RevOps teams</div>
          </div>
          {[
            { title:'Products', links:[['Live Domain','/enrich'],['Maps & Keywords','/maps'],['Products & Specs','/products'],['Actor Studio','/actors'],['Profiles','/profiles']] },
            { title:'Platform', links:[['Queue Engine','/queue'],['BYOK Hub','/settings'],['Safeguards','/settings'],['Full Dashboard','/dashboard']] },
            { title:'Resources', links:[['Templates','/products'],['Solutions','/'],['Docs','/'],['Made with Enricher','/enrich']] },
          ].map(col=> (
            <div key={col.title}>
              <div className="text-[11px] tracking-[0.14em] font-bold text-white mb-3">{col.title.toUpperCase()}</div>
              <ul className="space-y-2">
                {col.links.map(([label, href])=> <li key={label}><Link href={href} className="text-sm text-slate-400 hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Full-width • mx-auto • px-20 • spacious modern structure — inspired by Squarespace freeness</span>
          <span>Stealth • Headless • Zero vendor fees • GST-verified</span>
        </div>
      </div>
    </footer>
  );
}
