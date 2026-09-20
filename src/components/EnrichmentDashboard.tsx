'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Globe,
  Search,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  Layers,
  Zap,
  TrendingUp,
  Key,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Database,
  ArrowRight,
  Server,
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  Star,
  Tag,
  Filter,
  Trash2,
  Printer,
  Download,
  GitMerge,
  Edit3,
  ListPlus,
  HelpCircle,
  Info,
  Navigation,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Package,
  ShoppingBag,
  Cpu,
  Truck,
  CreditCard,
  Plus,
  X,
  AlertTriangle,
  MessageCircle,
  Eye,
  Share2,
  Flag,
  MessageSquare,
  Terminal,
  Play,
  CheckCircle,
  Activity,
  FileText,
  FolderTree,
  ChevronDown,
  Users,
  Hash,
  Image as ImageIcon,
  FileDown,
  Code,
  Compass,
  Maximize2,
  Minimize2,
  Columns,
  Send,
  Radio,
  Building2,
  Store,
} from 'lucide-react';
import type { PitchTone, GeneratedPitchResult } from '@/lib/ai/pitchGenerator';
import type { GoogleMapsPlaceRecord } from '@/lib/scraper/googleMapsTypes';
import type { GoogleSearchExecutionReport } from '@/lib/scraper/googleSearchTypes';

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const MetaIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7.2c-2.4 0-4.5 1.5-5.5 3.7C5.5 8.7 3.4 7.2 1 7.2 0.4 7.2 0 7.6 0 8.2v7.6c0 0.6 0.4 1 1 1 2.4 0 4.5-1.5 5.5-3.7 1 2.2 3.1 3.7 5.5 3.7s4.5-1.5 5.5-3.7c1 2.2 3.1 3.7 5.5 3.7 0.6 0 1-0.4 1-1V8.2c0-0.6-0.4-1-1-1-2.4 0-4.5 1.5-5.5 3.7-1-2.2-3.1-3.7-5.5-3.7zm-9 7.6c-1.7 0-3-1.3-3-3s1.3-3 3-3c1.3 0 2.4 0.8 2.8 2-.4 1.2-1.5 2-2.8 2zm18 0c-1.3 0-2.4-0.8-2.8-2 .4-1.2 1.5-2 2.8-2 1.7 0 3 1.3 3 3s-1.3 3-3 3z" />
  </svg>
);

/** Parses inline markdown: **bold**, `code`, [link](url) */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index} className="font-bold text-white">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 font-mono text-xs border border-white/10">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const closingBracket = token.indexOf('](');
      const linkText = token.slice(1, closingBracket);
      const linkUrl = token.slice(closingBracket + 2, -1);
      parts.push(
        <a key={match.index} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 font-medium">
          {linkText}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

/** Formatted Rich Markdown Renderer */
function RenderedMarkdownView({ markdown }: { markdown: string }) {
  if (!markdown || !markdown.trim()) {
    return <p className="text-slate-500 text-xs italic">No content available to preview.</p>;
  }

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let tableBuffer: string[] = [];

  const flushList = () => {
    if (!listBuffer) return;
    if (listBuffer.type === 'ul') {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm my-3 leading-relaxed">
          {listBuffer.items.map((item, idx) => (
            <li key={idx}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`list-${elements.length}`} className="list-decimal pl-5 space-y-1.5 text-slate-300 text-sm my-3 leading-relaxed">
          {listBuffer.items.map((item, idx) => (
            <li key={idx}>{parseInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
    }
    listBuffer = null;
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer
      .map((row) => row.split('|').map((c) => c.trim()).filter((_, i, arr) => i !== 0 && i !== arr.length - 1))
      .filter((r) => r.length > 0);
    if (rows.length > 0) {
      const headerRow = rows[0];
      const bodyRows = rows.slice(1).filter((r) => !r.every((c) => /^[-:]+$/.test(c)));
      elements.push(
        <div key={`table-${elements.length}`} className="my-4 overflow-x-auto rounded-xl border border-white/10 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 text-slate-200 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={idx} className="p-3 border-r border-white/10 last:border-r-0">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] bg-slate-950/40">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.03]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-slate-300 border-r border-white/10 last:border-r-0">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-slate-950 p-4 rounded-xl border border-white/10 text-xs font-mono text-violet-200 my-3 overflow-x-auto select-text leading-relaxed">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      tableBuffer.push(trimmed);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.slice(2).trim();
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList();
        listBuffer = { type: 'ul', items: [itemText] };
      } else {
        listBuffer.items.push(itemText);
      }
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      const itemText = olMatch[1].trim();
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList();
        listBuffer = { type: 'ol', items: [itemText] };
      } else {
        listBuffer.items.push(itemText);
      }
      continue;
    }

    // Flush any pending list
    flushList();

    if (!trimmed) continue;

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-2xl font-black text-white tracking-tight mt-6 mb-3 border-b border-white/10 pb-2">
          {trimmed.slice(2).trim()}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-xl font-bold text-white tracking-tight mt-5 mb-2.5">
          {trimmed.slice(3).trim()}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-lg font-semibold text-slate-100 tracking-tight mt-4 mb-2">
          {trimmed.slice(4).trim()}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${elements.length}`} className="text-base font-semibold text-slate-200 mt-3 mb-1.5">
          {trimmed.slice(5).trim()}
        </h4>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${elements.length}`} className="border-l-4 border-violet-500 pl-4 py-1.5 italic text-slate-300 bg-violet-500/5 rounded-r my-3">
          {parseInlineMarkdown(trimmed.slice(2).trim())}
        </blockquote>
      );
    } else if (trimmed === '---') {
      elements.push(<hr key={`hr-${elements.length}`} className="border-white/10 my-5" />);
    } else {
      elements.push(
        <p key={`p-${elements.length}`} className="text-slate-300 text-sm leading-relaxed mb-3">
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    }
  }

  flushList();
  flushTable();

  return <div className="space-y-1">{elements}</div>;
}
import { EnrichedProfileRecord, ProfileStorageService, ProfileSourceOrigin } from '@/lib/storage/profileStorage';
import {
  KeywordScrapedItem,
  RefinedDataReport,
  ProductStatusTag,
  BusinessStatus,
  VerificationStatus,
  B2BPricingDetails,
  ProductSpecRecord,
  ProductSellerRecord,
  SpecFilterItem,
  formatSpecsFromList,
  extractCleanPriceNumber,
  computeThreeTierPricing,
  synthesizeB2BPricing,
  refineKeywordScrapedData,
  SearchCoverageMetadata,
  getRegionalCoverageMetadata,
  B2B_INDUSTRY_CATEGORIES,
  CATEGORY_QUICK_TEMPLATES,
  CategoryQuickTemplate,
} from '@/lib/types/scraperTypes';
import { INITIAL_PRODUCT_SPECS, INITIAL_PRODUCT_SELLERS } from '@/lib/types/initialScraperData';

interface ContactInfo {
  emails: string[];
  phones: string[];
  addresses: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

interface TechnographicResult {
  technologies: Array<{ name: string; category: string; confidence: number }>;
  cms?: string;
  framework?: string;
  marketingAutomation?: string[];
  analytics?: string[];
  rawDetectionsCount: number;
}

interface EnrichmentResult {
  domain: string;
  url: string;
  companyName: string;
  category: string;
  productsServices: string[];
  description: string;
  contactInfo: ContactInfo;
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
  technographics: TechnographicResult;
  status: 'success' | 'partial' | 'failed';
  crawledAt: string;
  executionTimeMs: number;
  error?: string;
}

// 2026 Frontier Model Families
const AI_PROVIDERS_2026 = [
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: [
      'Claude Haiku 4.5',
      'Claude Sonnet 5',
      'Claude Opus 5',
      'Claude Fable 5',
      'Claude Mythos 5.1',
    ],
    highlight: 'Tiered lineup: Haiku (fast/cheap), Sonnet (balanced), Opus (research), Fable/Mythos (flagship safeguards).',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: [
      'Gemini 3.6 Flash',
      'Gemini 3.8 Flash',
      'Gemini 3.8 Flash Cyber',
      'Gemini 3.8 Live',
      'Gemini 3.8 Live Extended Thinking',
    ],
    highlight: 'Flash series for efficiency/cybersecurity; Live series for real-time dialogue and reasoning.',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      'DeepSeek V4-Pro',
      'DeepSeek V4-Flash',
      'DeepSeek V4.1-Flash',
      'DeepSeek V3.2',
      'DeepSeek R1',
    ],
    highlight: 'Open-source MIT licensed, 1M context; V4-Pro for heavy coding/reasoning, V4-Flash for scale.',
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    models: [
      'Grok 4.6',
      'Grok 4.5',
      'Grok 4.3',
      'Grok 4.20',
      'Grok Build 0.1',
    ],
    highlight: 'Flagship Grok 4.6 (500K context), Grok 4.20 for agentic multi-step tasks, Grok Build for code.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      'GPT-6 Astra',
      'GPT-5.6 Sol',
      'GPT-5.6 Terra',
      'GPT-5.6 Luna',
      'GPT-5.6 Cyber',
    ],
    highlight: 'Astra is flagship; Sol for professional RevOps; Terra for balance; Cyber for automated security.',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    models: [
      'Nemotron 3 Ultra',
      'Nemotron 3.5 Lightning',
      'Nemotron 3.5 Content Safety',
      'Nemotron OCR v2',
      'FLUX.1-dev',
    ],
    highlight: 'NIM microservices optimize inference; Nemotron for deep reasoning, embeddings, and OCR.',
  },
  {
    id: 'qwen',
    name: 'Alibaba Qwen',
    models: [
      'Qwen3.8-Max',
      'Qwen3.8-Flash',
      'Qwen3.8-27B',
      'Qwen3.8-2.4T-A95B',
      'Qwen-MT-Image 2.0',
    ],
    highlight: 'Flagship Qwen3.8-Max (2.4T params, 1M context), Flash for speed, 27B dense model.',
  },
  {
    id: 'glm',
    name: 'Zhipu GLM',
    models: [
      'GLM-5.3',
      'GLM-5.3 Flash',
      'GLM-5.3 FlashX',
      'GLM-5.2',
      'GLM-5.1',
    ],
    highlight: 'Frontier open-weight models; GLM-5.3 flagship; Flash/FlashX for speed; 1M context.',
  },
];


type WorkspaceTab = 'live' | 'maps' | 'products' | 'actors' | 'saved' | 'byok' | 'rules' | 'queue';
type ActorTool = 'web_content' | 'instagram' | 'linkedin' | 'facebook' | 'meta_ads' | 'omnichannel_360';

const defaultActorInputs: Record<ActorTool, string> = {
  web_content: 'https://news.ycombinator.com',
  instagram: 'nike',
  linkedin: 'stripe',
  facebook: 'nike',
  meta_ads: 'nike',
  omnichannel_360: 'nike.com',
};

interface EnrichmentDashboardProps {
  initialTab?: WorkspaceTab;
  initialActorType?: ActorTool;
  initialMapsMode?: 'places' | 'keywords' | 'serp';
  dedicatedTool?: boolean;
}

export default function EnrichmentDashboard({
  initialTab = 'products',
  initialActorType = 'web_content',
  initialMapsMode = 'places',
  dedicatedTool = false,
}: EnrichmentDashboardProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Squarespace-Style Mega Navigation State
  const [hoveredMegaMenu, setHoveredMegaMenu] = useState<string | null>(null);
  const megaMenuCloseTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMegaMenuEnter = (menuKey: string) => {
    if (megaMenuCloseTimerRef.current) {
      clearTimeout(megaMenuCloseTimerRef.current);
      megaMenuCloseTimerRef.current = null;
    }
    setHoveredMegaMenu(menuKey);
  };

  const handleMegaMenuLeave = () => {
    megaMenuCloseTimerRef.current = setTimeout(() => {
      setHoveredMegaMenu(null);
    }, 180);
  };

  // Actor Studio & Web/Social Scraper State
  const [actorType, setActorType] = useState<ActorTool>(initialActorType);
  const [adPlatformFilter, setAdPlatformFilter] = useState<'all' | 'facebook' | 'instagram'>('all');
  const [actorInput, setActorInput] = useState<string>(defaultActorInputs[initialActorType]);
  const [actorLoading, setActorLoading] = useState<boolean>(false);
  const [actorProgress, setActorProgress] = useState<number>(0);
  const [actorCurrentStage, setActorCurrentStage] = useState<string>('');
  const [actorLogs, setActorLogs] = useState<Array<{ time: string; stage: string; status: 'info' | 'success' | 'warn' | 'error' }>>([]);
  const [actorResult, setActorResult] = useState<any>(null);
  const [actorError, setActorError] = useState<string | null>(null);
  const [actorViewTab, setActorViewTab] = useState<'preview' | 'markdown' | 'headings' | 'json' | 'refined'>('preview');
  const [enrichingContent, setEnrichingContent] = useState<boolean>(false);
  const [refinedBriefingCopied, setRefinedBriefingCopied] = useState<boolean>(false);
  const [actorRenderJs, setActorRenderJs] = useState<boolean>(true);
  const [actorMarkdownCopied, setActorMarkdownCopied] = useState<boolean>(false);
  const [markdownPreviewMode, setMarkdownPreviewMode] = useState<'split' | 'preview_only' | 'source_only'>('split');

  // AI Outreach Pitch Synthesizer State
  const [pitchModalOpen, setPitchModalOpen] = useState<boolean>(false);
  const [pitchTargetData, setPitchTargetData] = useState<any>(null);
  const [pitchTone, setPitchTone] = useState<PitchTone>('direct');
  const [pitchTab, setPitchTab] = useState<'email' | 'linkedin' | 'whatsapp'>('email');
  const [pitchGenerating, setPitchGenerating] = useState<boolean>(false);
  const [generatedPitch, setGeneratedPitch] = useState<GeneratedPitchResult | null>(null);
  const [pitchCopiedSubject, setPitchCopiedSubject] = useState<boolean>(false);
  const [pitchCopiedBody, setPitchCopiedBody] = useState<boolean>(false);

  const handleSelectActorType = (
    type: ActorTool,
    defaultInput?: string
  ) => {
    setActorType(type);
    setActorResult(null);
    setActorError(null);
    if (defaultInput) {
      setActorInput(defaultInput);
    }
  };

  // Dynamic Base Origin & Sub-Pages for Web Content Crawler
  const parsedWebTarget = useMemo(() => {
    if (!actorInput || !actorInput.trim()) return null;
    let raw = actorInput.trim();
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
    try {
      const u = new URL(raw);
      return {
        origin: u.origin,
        hostname: u.hostname.replace(/^www\./, ''),
        pathname: u.pathname,
      };
    } catch {
      return null;
    }
  }, [actorInput]);

  // Sub-pages extracted from internal links
  const discoveredSubPages = useMemo(() => {
    if (!actorResult?.links?.internal || !Array.isArray(actorResult.links.internal)) return [];
    const set = new Set<string>();
    actorResult.links.internal.forEach((l: string) => {
      try {
        const u = new URL(l);
        if (u.pathname && u.pathname !== '/' && !u.pathname.includes('.') && u.pathname.length < 32) {
          set.add(u.pathname);
        }
      } catch {}
    });
    return Array.from(set).slice(0, 10);
  }, [actorResult]);

  // Google Maps & SERP Scraper State (ENRICHER Core Engine)
  const [mapsMode, setMapsMode] = useState<'places' | 'keywords' | 'serp'>(initialMapsMode || 'places');
  const [mapsQueryInput, setMapsQueryInput] = useState('Coffee Shops & Cafes');
  const [mapsKeywordsInput, setMapsKeywordsInput] = useState('16gb ram, i5, rtx3050, 144hz display, under 1 lakh');
  const [mapsLocation, setMapsLocation] = useState('Austin, TX');
  const [mapsRadiusKm, setMapsRadiusKm] = useState(10);
  const [mapsMaxResults, setMapsMaxResults] = useState(20);
  const [mapsEnrichWebsites, setMapsEnrichWebsites] = useState(true);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsEnterprisePlaces, setMapsEnterprisePlaces] = useState<GoogleMapsPlaceRecord[]>([]);
  const [mapsActiveViewTab, setMapsActiveViewTab] = useState<'overview' | 'contacts' | 'social' | 'ratings' | 'leads' | 'map' | 'json'>('overview');
  const [selectedEnterprisePlaces, setSelectedEnterprisePlaces] = useState<string[]>([]);
  const [mapsResults, setMapsResults] = useState<KeywordScrapedItem[]>([]);
  const [mapsReport, setMapsReport] = useState<any>(null);
  const [selectedMapItems, setSelectedMapItems] = useState<string[]>([]);
  const [mapsMinMatch, setMapsMinMatch] = useState(50);
  const [mapsRequireContact, setMapsRequireContact] = useState(false);

  // Google SERP Search Intelligence State (ENRICHER Core Engine)
  const [serpQueriesInput, setSerpQueriesInput] = useState('hotels in Seattle\nweb development agency New York');
  const [serpCountryCode, setSerpCountryCode] = useState('us');
  const [serpLanguageCode, setSerpLanguageCode] = useState('en');
  const [serpMaxPages, setSerpMaxPages] = useState(1);
  const [serpIncludeAi, setSerpIncludeAi] = useState(true);
  const [serpIncludeAds, setSerpIncludeAds] = useState(true);
  const [serpIncludePaa, setSerpIncludePaa] = useState(true);
  const [serpEnrichLeads, setSerpEnrichLeads] = useState(true);
  const [serpLoading, setSerpLoading] = useState(false);
  const [serpReport, setSerpReport] = useState<GoogleSearchExecutionReport | null>(null);
  const [serpActiveTab, setSerpActiveTab] = useState<'organic' | 'ads' | 'ai' | 'paa' | 'leads' | 'json'>('organic');
  const [selectedSerpIndices, setSelectedSerpIndices] = useState<number[]>([]);

  // Real-time Scraper Activity Console state
  const [showScraperConsole, setShowScraperConsole] = useState(false);
  const [scraperLogs, setScraperLogs] = useState<any[]>([
    {
      id: 'init_log_1',
      timestamp: new Date().toISOString(),
      domain: 'system',
      type: 'info',
      message: 'Playwright Stealth Scraping Engine initialized with live telemetry & Redis queue integration.',
    },
  ]);
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);
  const logsTerminalEndRef = useRef<HTMLDivElement | null>(null);

  // Universal Product & Specs Finder State (User-specified Category, Product, Spec, Price Range, and Scope)
  const [productCategoryInput, setProductCategoryInput] = useState('Electronics & Computers (IT)');
  const [productNameInput, setProductNameInput] = useState('Acer');
  const [productSpecInput, setProductSpecInput] = useState('i5-12450H, 16GB DDR5, RTX 3050, 144Hz');
  const [selectedTemplateGroup, setSelectedTemplateGroup] = useState<string>('all');
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>('it_laptops');
  // Collapsible UI — keep heavy panels hidden until needed (ZenFlow + FeatherLite)
  const [showTemplates, setShowTemplates] = useState<boolean>(true);
  const [showAudit, setShowAudit] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [showSpecBuilder, setShowSpecBuilder] = useState<boolean>(true);

  const handleApplyQuickTemplate = (template: CategoryQuickTemplate) => {
    setProductCategoryInput(template.category);
    setProductNameInput(template.productName);
    setSpecsList(template.specs);
    setProductMinPrice(template.minPrice);
    setProductMaxPrice(template.maxPrice);
    setProductPriceRangeText(template.priceRangeText);
    setAppliedTemplateId(template.id);
    const modeLabel = template.productName ? `model "${template.productName}"` : `pure technical specs (blank model)`;
    setProductSaveMessage(`⚡ Loaded "${template.title}" template (${template.category} • ${modeLabel})`);
    setTimeout(() => setProductSaveMessage(null), 3500);
  };

  // Dynamic +Spec Criteria Builder State
  const [specsList, setSpecsList] = useState<SpecFilterItem[]>([
    { id: 'spec_1', name: 'Processor', mode: 'range', minValue: 'i5-13400H' },
    { id: 'spec_2', name: 'RAM', mode: 'range', minValue: '16GB DDR4' },
    { id: 'spec_3', name: 'GPU', mode: 'range', minValue: 'RTX 3050' },
    { id: 'spec_4', name: 'Display Refresh', mode: 'range', minValue: '144Hz', maxValue: '240Hz' },
  ]);

  const handleAddSpec = () => {
    const newSpec: SpecFilterItem = {
      id: 'spec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: '',
      mode: 'same',
      value: '',
      minValue: '',
      maxValue: '',
    };
    setSpecsList((prev) => [...prev, newSpec]);
  };

  const handleRemoveSpec = (id: string) => {
    setSpecsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSpec = (id: string, updates: Partial<SpecFilterItem>) => {
    setSpecsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const [productMinPrice, setProductMinPrice] = useState('60000');
  const [productMaxPrice, setProductMaxPrice] = useState('120000');
  const [productPriceRangeText, setProductPriceRangeText] = useState('₹60,000 - ₹1,20,000');
  const [productScope, setProductScope] = useState<'radius' | 'india' | 'world'>('radius');
  const [productCenterLocation, setProductCenterLocation] = useState('Kolkata, WB, India');
  const [productRangeKm, setProductRangeKm] = useState(500);
  const [productMaxResults, setProductMaxResults] = useState(50);
  const [productViewMode, setProductViewMode] = useState<'specs' | 'sellers'>('specs');
  const [productLoading, setProductLoading] = useState(false);
  const [productSpecResults, setProductSpecResults] = useState<ProductSpecRecord[]>(INITIAL_PRODUCT_SPECS);
  const [productSellerResults, setProductSellerResults] = useState<ProductSellerRecord[]>(INITIAL_PRODUCT_SELLERS);
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productVerificationFilter, setProductVerificationFilter] = useState('all');
  const [inspectingSeller, setInspectingSeller] = useState<ProductSellerRecord | null>(null);
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);
  const [bookmarkedSellerIds, setBookmarkedSellerIds] = useState<string[]>([]);
  const [flaggedSellerIds, setFlaggedSellerIds] = useState<string[]>([]);

  const handleToggleBookmarkSeller = (id: string) => {
    setBookmarkedSellerIds((prev) => {
      const isBookmarked = prev.includes(id);
      const updated = isBookmarked ? prev.filter((x) => x !== id) : [...prev, id];
      const target = productSellerResults.find((s) => s.id === id);
      if (target) {
        setProductSaveMessage(
          isBookmarked
            ? `Removed "${target.businessName}" from bookmarks`
            : `★ Bookmarked "${target.businessName}" for procurement review`
        );
        setTimeout(() => setProductSaveMessage(null), 3500);
      }
      return updated;
    });
  };

  const handleToggleFlagSeller = (id: string) => {
    setFlaggedSellerIds((prev) => {
      const isFlagged = prev.includes(id);
      const updated = isFlagged ? prev.filter((x) => x !== id) : [...prev, id];
      const target = productSellerResults.find((s) => s.id === id);
      if (target) {
        setProductSaveMessage(
          isFlagged
            ? `Removed audit flag from "${target.businessName}"`
            : `🚩 Flagged "${target.businessName}" for compliance revisit`
        );
        setTimeout(() => setProductSaveMessage(null), 3500);
      }
      return updated;
    });
  };
  const [deepEnrichingId, setDeepEnrichingId] = useState<string | null>(null);
  const [sellerEnrichData, setSellerEnrichData] = useState<Record<string, any>>({});
  const [productTableSearch, setProductTableSearch] = useState('');
  const [productSortBy, setProductSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'discount_desc' | 'distance_asc'>('default');
  const [sellerTableSearch, setSellerTableSearch] = useState('');
  const [sellerSortBy, setSellerSortBy] = useState<'default' | 'rating_desc' | 'reviews_desc' | 'distance_asc'>('default');
  const [productSaveMessage, setProductSaveMessage] = useState<string | null>(null);

  // Memoized client-side filtered & sorted product specs matrix
  const filteredProductSpecResults = useMemo(() => {
    let list = productSpecResults.filter((r) => {
      if (productStatusFilter !== 'all') {
        if (productStatusFilter === 'Active' && !(r.statusTag === 'Active' || r.statusTag === 'working' || r.statusTag === 'completed')) {
          return false;
        }
        if (productStatusFilter === 'Inactive' && !(r.statusTag === 'Inactive' || r.statusTag === 'upgrade_needed' || r.statusTag === 'revisit_later')) {
          return false;
        }
      }
      if (productTableSearch.trim()) {
        const q = productTableSearch.toLowerCase().trim();
        const haystack = `${r.product} ${r.specs} ${r.sellerBusiness} ${r.websiteSource} ${r.location} ${r.businessDetails} ${r.price} ${r.category || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (productSortBy === 'price_asc') {
      list = [...list].sort((a, b) => extractCleanPriceNumber(a.sellingPrice || a.price) - extractCleanPriceNumber(b.sellingPrice || b.price));
    } else if (productSortBy === 'price_desc') {
      list = [...list].sort((a, b) => extractCleanPriceNumber(b.sellingPrice || b.price) - extractCleanPriceNumber(a.sellingPrice || a.price));
    } else if (productSortBy === 'discount_desc') {
      list = [...list].sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else if (productSortBy === 'distance_asc') {
      list = [...list].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return list;
  }, [productSpecResults, productStatusFilter, productTableSearch, productSortBy]);

  // Memoized client-side filtered & sorted B2B sellers hub
  const filteredProductSellerResults = useMemo(() => {
    let list = productSellerResults.filter((s) => {
      if (productVerificationFilter !== 'all' && s.verificationStatus !== productVerificationFilter) {
        return false;
      }
      if (sellerTableSearch.trim()) {
        const q = sellerTableSearch.toLowerCase().trim();
        const haystack = `${s.businessName} ${s.category} ${s.productsServices} ${s.address} ${s.phone} ${s.procurementTerms || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sellerSortBy === 'rating_desc') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sellerSortBy === 'reviews_desc') {
      list = [...list].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sellerSortBy === 'distance_asc') {
      list = [...list].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return list;
  }, [productSellerResults, productVerificationFilter, sellerTableSearch, sellerSortBy]);

  // Search Coverage, Regional Areas & Background Works Remarks State
  const [searchCoverage, setSearchCoverage] = useState<SearchCoverageMetadata>(() =>
    getRegionalCoverageMetadata('Malda, WB, India', 'radius', 500, 50)
  );


  // Stats / ROI Tracker
  const [recordsProcessed, setRecordsProcessed] = useState(152);
  const [moneySaved, setMoneySaved] = useState(152 * 0.45);

  // BYOK Settings state
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModel, setSelectedModel] = useState('Gemini 3.8 Flash');
  const [customModel, setCustomModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  // Saved Profiles & Workspace State
  const [savedProfiles, setSavedProfiles] = useState<EnrichedProfileRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMark, setSelectedMark] = useState('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedProfilesForMerge, setSelectedProfilesForMerge] = useState<string[]>([]);
  const [selectedListName, setSelectedListName] = useState('all');
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [remarkDraft, setRemarkDraft] = useState('');

  // Queue state
  const [bulkInput, setBulkInput] = useState('linear.app\nnotion.so\nloom.com\nframer.com');
  const [queueMetrics, setQueueMetrics] = useState({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 });
  const [queueJobs, setQueueJobs] = useState<any[]>([]);
  const [queueLogs, setQueueLogs] = useState<any[]>([]);
  const [workerStatus, setWorkerStatus] = useState<'active' | 'idle' | 'stopped'>('idle');
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [inspectingQueueJob, setInspectingQueueJob] = useState<any | null>(null);

  // Saved Profiles Inspection & Origin Filter
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [inspectingProfile, setInspectingProfile] = useState<EnrichedProfileRecord | null>(null);

  // Rules Engine State
  const [rules, setRules] = useState({
    noOverwriteExisting: true,
    confidenceThreshold: 85,
    flagJobTitleChange: true,
    autoEnrichNewLeads: true,
    requireDirectPhone: false,
  });

  useEffect(() => {
    // Load BYOK from local storage
    const savedProvider = localStorage.getItem('byok_provider');
    const savedModel = localStorage.getItem('byok_model');
    const savedKey = localStorage.getItem('byok_key');
    if (savedProvider) setSelectedProvider(savedProvider);
    if (savedModel) setSelectedModel(savedModel);
    if (savedKey) {
      setApiKey(savedKey);
      setKeySaved(true);
    }

    // Load saved profiles
    loadProfiles();
  }, []);

  const PRESET_DOMAINS = [
    {
      name: 'Top Indian E-Com',
      domains: ['flipkart.com', 'meesho.com', 'nykaa.com', 'tatadigital.com', 'jiomart.com', 'amazon.in', 'myntra.com', 'ajio.com', 'shopify.com', 'wholesalecart.in', 'alibaba.com', 'indiamart.com']
    },
    {
      name: 'Fintech & SaaS',
      domains: ['razorpay.com', 'postman.com', 'linear.app', 'notion.so', 'browserstack.com', 'stripe.com', 'paypal.com', 'airbnb.com'],
    },
    {
      name: 'Hardware & PC Brands',
      domains: ['asus.com', 'lenovo.com', 'dell.com', 'hp.com', 'acer.com', 'msicomputer.com', 'samsung.com', 'huawei.com', 'lg.com', 'microsoft.com', 'gigabite']
    },
  ];

  const fetchQueueData = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.success) {
        setQueueMetrics(data.metrics || { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 });
        setQueueJobs(data.recentJobs || []);
        setQueueLogs(data.activityLogs || []);
        setWorkerStatus(data.workerStatus || 'active');
      }
    } catch (err) {
      console.error('Failed to poll BullMQ queue:', err);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchQueueData();
      const interval = setInterval(fetchQueueData, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Poll live scraper activity logs whenever scraping is in progress or console is open
  useEffect(() => {
    let interval: any;
    if (mapsLoading || serpLoading || showScraperConsole) {
      const pollLogs = async () => {
        try {
          const res = await fetch('/api/scraper-logs');
          const data = await res.json();
          if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
            setScraperLogs(data.logs);
          }
        } catch {
          // ignore transient poll error
        }
      };
      pollLogs();
      interval = setInterval(pollLogs, 800);
    }
    return () => clearInterval(interval);
  }, [mapsLoading, serpLoading, showScraperConsole]);

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    if (autoScrollLogs && logsTerminalEndRef.current) {
      logsTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scraperLogs, autoScrollLogs]);

  const loadProfiles = () => {
    const profiles = ProfileStorageService.getProfiles();
    setSavedProfiles(profiles);
  };

  const handleSaveByok = () => {
    const modelToSave = customModel.trim() || selectedModel;
    localStorage.setItem('byok_provider', selectedProvider);
    localStorage.setItem('byok_model', modelToSave);
    localStorage.setItem('byok_key', apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 3000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEnrich = async (targetDomain?: string) => {
    const domainToScrape = targetDomain || domainInput;
    if (!domainToScrape.trim()) return;

    setLoading(true);
    setResult(null);
    setAiAnalysis(null);
    setSaveSuccessMsg(null);

    try {
      const activeModel = customModel.trim() || selectedModel;
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domainToScrape,
          byokConfig: apiKey ? { provider: selectedProvider, model: activeModel, apiKey } : null,
        }),
      });

      const data = await res.json();
      if (data.data) {
        setResult(data.data);
        // AI synthesis is on-demand — cleared so user must click Generate
        setRecordsProcessed((prev) => prev + 1);
        setMoneySaved((prev) => +(prev + 0.45).toFixed(2));
      } else {
        alert(data.error || 'Failed to enrich');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error communicating with scraper backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /** On-demand AI synthesis — only fires when user clicks "Generate Analysis" */
  const handleGenerateAI = async () => {
    if (!result || !apiKey) return;
    setAiLoading(true);
    try {
      const activeModel = customModel.trim() || selectedModel;
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          byokConfig: { provider: selectedProvider, model: activeModel, apiKey },
          companyData: {
            domain: result.domain,
            companyName: result.companyName,
            description: result.description,
            technologies: result.technographics.technologies.map((t) => t.name),
            emails: result.contactInfo.emails,
            phones: result.contactInfo.phones,
            socialLinks: result.contactInfo.socialLinks as Record<string, string>,
          },
        }),
      });
      const data = await res.json();
      if (data.aiSynthesis) setAiAnalysis(data.aiSynthesis);
      else alert(data.error || 'AI synthesis returned no result');
    } catch (err: any) {
      alert('AI analysis failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  /** Runs Actor scraper (Web Content, Instagram, LinkedIn, Facebook, Meta Ads) with live progress telemetry */
  const handleRunActorScraper = async (
    overrideTarget?: string,
    overrideType?: 'web_content' | 'instagram' | 'linkedin' | 'facebook' | 'meta_ads' | 'omnichannel_360'
  ) => {
    const targetToUse = (overrideTarget || actorInput).trim();
    const typeToUse = overrideType || actorType;
    if (!targetToUse) return;

    setActorLoading(true);
    setActorError(null);
    setActorResult(null);
    setActorProgress(18);
    setActorCurrentStage(
      typeToUse === 'omnichannel_360'
        ? 'Spinning up 360° multi-platform sweep (Web, Social & Meta Ads)...'
        : 'Spinning up stealth crawler engine & evasion headers...'
    );
    const start = Date.now();

    const actorEngineName =
      typeToUse === 'web_content'
        ? 'Website Content Markdown Crawler'
        : typeToUse === 'instagram'
        ? 'Instagram Profile & Media Harvester'
        : typeToUse === 'linkedin'
        ? 'LinkedIn Entity & Company Scanner'
        : typeToUse === 'facebook'
        ? 'Facebook Public Page & Post Harvester'
        : typeToUse === 'meta_ads'
        ? 'Meta Ad Library & Creative Intelligence Scanner'
        : '360° Omnichannel Lead Fusion Sweep';

    setActorLogs([
      {
        time: '0.0s',
        stage: `Initiated ${actorEngineName} on ${targetToUse}`,
        status: 'info',
      },
    ]);

    const stepTimer1 = setTimeout(() => {
      setActorProgress(45);
      setActorCurrentStage(
        typeToUse === 'omnichannel_360'
          ? 'Parallel sweeping Web, Facebook, Meta Ads, Instagram & LinkedIn...'
          : 'Navigating to target & resolving live DOM...'
      );
      setActorLogs((prev) => [
        ...prev,
        {
          time: `${((Date.now() - start) / 1000).toFixed(1)}s`,
          stage:
            typeToUse === 'omnichannel_360'
              ? 'Querying Web Content, Facebook Page, Meta Ad Library, Instagram & LinkedIn concurrently'
              : 'Navigated to target URL; executing stealth script evaluations & DOM hydration',
          status: 'info',
        },
      ]);
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setActorProgress(75);
      setActorCurrentStage(
        typeToUse === 'omnichannel_360'
          ? 'Computing Digital Presence Score & merging unified contact graph...'
          : 'Parsing AST, structural tags, and schema graphs...'
      );
      setActorLogs((prev) => [
        ...prev,
        {
          time: `${((Date.now() - start) / 1000).toFixed(1)}s`,
          stage:
            typeToUse === 'omnichannel_360'
              ? 'Synthesizing multi-platform metrics, reach volume, and active ad creative insights'
              : 'Transforming DOM into clean Markdown, headings outline, and entity metadata',
          status: 'info',
        },
      ]);
    }, 3800);

    try {
      const endpoint = typeToUse === 'omnichannel_360' ? '/api/actor-fusion' : '/api/actor-scrape';
      const reqPayload =
        typeToUse === 'omnichannel_360'
          ? { target: targetToUse }
          : {
              type: typeToUse,
              target: targetToUse,
              options: {
                renderJs: actorRenderJs,
                includeLinks: true,
                includeImages: true,
              },
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqPayload),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Actor scraping request failed');
      }

      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      setActorProgress(100);
      setActorCurrentStage(`Scraping workflow completed successfully in ${elapsed}s!`);
      setActorLogs((prev) => [
        ...prev,
        {
          time: `${elapsed}s`,
          stage: `Successfully extracted ${typeToUse} data payload`,
          status: 'success',
        },
      ]);
      setActorResult({ ...json.data, actorType: typeToUse });
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      setActorProgress(100);
      setActorError(err.message || 'Scraper execution error');
      setActorCurrentStage(`Error: ${err.message}`);
      setActorLogs((prev) => [
        ...prev,
        {
          time: `${elapsed}s`,
          stage: `Scraper error: ${err.message}`,
          status: 'error',
        },
      ]);
    } finally {
      setActorLoading(false);
    }
  };

  const handleCopyMarkdown = (md: string) => {
    navigator.clipboard.writeText(md);
    setActorMarkdownCopied(true);
    setTimeout(() => setActorMarkdownCopied(false), 2000);
  };

  const handleDownloadMarkdown = (md: string, filename: string) => {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEnrichWebContent = async () => {
    if (!actorResult || (!actorResult.markdown && !actorResult.plainText)) return;
    setEnrichingContent(true);
    setActorLogs((prev) => [
      ...prev,
      {
        time: '0.0s',
        stage: 'Initiated smart content refinement & executive dossier extraction...',
        status: 'info',
      },
    ]);

    const currentModel = selectedModel === 'custom' ? customModel : selectedModel;

    try {
      const res = await fetch('/api/actor-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: actorResult.markdown || actorResult.plainText,
          title: actorResult.title,
          url: actorResult.url,
          headings: actorResult.headings,
          wordCount: actorResult.wordCount,
          byokConfig: apiKey ? { provider: selectedProvider, model: currentModel, apiKey } : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to refine web content');

      setActorResult((prev: any) => ({
        ...prev,
        refinedData: json.data,
      }));
      setActorViewTab('refined');
      setActorLogs((prev) => [
        ...prev,
        {
          time: '0.8s',
          stage: `Successfully synthesized & refined page into executive intelligence dossier (${json.data.refinementSource})`,
          status: 'success',
        },
      ]);
    } catch (err: any) {
      console.error('Refinement error:', err);
      setActorLogs((prev) => [
        ...prev,
        {
          time: '0.5s',
          stage: `Refinement notice: ${err.message}`,
          status: 'warn',
        },
      ]);
    } finally {
      setEnrichingContent(false);
    }
  };

  const handleCopyRefinedBriefing = (refined: any) => {
    if (!refined) return;
    const text = `
EXECUTIVE INTELLIGENCE BRIEFING: ${refined.title}
URL: ${refined.url}
Industry Sector: ${refined.industrySector}
Target Audience: ${refined.targetAudience}

EXECUTIVE SUMMARY:
${refined.executiveSummary}

CORE VALUE PROPOSITION:
${refined.valueProposition}

CORE OFFERINGS & PRODUCTS:
${refined.coreOfferings?.map((o: string) => `• ${o}`).join('\n')}

CONTACT & BUSINESS SIGNALS:
Emails: ${refined.contacts?.emails?.join(', ') || 'None detected'}
Phones: ${refined.contacts?.phones?.join(', ') || 'None detected'}
Social Links: ${refined.contacts?.socialLinks?.join(', ') || 'None detected'}
Locations: ${refined.contacts?.locations?.join(', ') || 'None detected'}

PRICING & COMMERCIAL SIGNALS:
${refined.pricingSignals?.join(' | ') || 'None detected'}

STRATEGIC TAKEAWAYS:
${refined.keyTakeaways?.map((t: string) => `• ${t}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setRefinedBriefingCopied(true);
    setTimeout(() => setRefinedBriefingCopied(false), 2000);
  };

  const handleOpenPitchModal = (leadData: any) => {
    setPitchTargetData(leadData);
    setPitchModalOpen(true);
    handleGeneratePitch(leadData, pitchTone);
  };

  const handleGeneratePitch = async (leadData: any, tone: PitchTone) => {
    setPitchGenerating(true);
    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: leadData.companyName || leadData.brandName || leadData.title || leadData.domain || 'Target Lead',
          domain: leadData.domain || leadData.url,
          valueProposition: leadData.valueProposition || leadData.description || leadData.refinedData?.valueProposition,
          industry: leadData.industrySector || leadData.industry || leadData.category,
          coreOfferings: leadData.coreOfferings || leadData.refinedData?.coreOfferings,
          activeAdsCount: leadData.activePaidAdsCount || leadData.totalActiveAds || (leadData.metaAds ? 1 : 0),
          topAdHeadline: leadData.metaAdsIntel?.topCreativeHeadline || leadData.ads?.[0]?.adCreative?.headline,
          techStack: leadData.webIntel?.technologySignals || leadData.technologies,
          tone,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setGeneratedPitch(json.data);
      }
    } catch (err) {
      console.error('Pitch generation error:', err);
    } finally {
      setPitchGenerating(false);
    }
  };

  const handleSaveActorToProfiles = (
    record: any,
    type: 'web_content' | 'instagram' | 'linkedin' | 'facebook' | 'meta_ads' | 'omnichannel_360'
  ) => {
    let domain = '';
    let url = '';
    let companyName = '';
    let category = '';
    let description = '';
    let remarks = '';
    const emails: string[] = [];
    const phones: string[] = [];
    const addresses: string[] = [];
    let socialIntel: any = undefined;

    if (type === 'web_content') {
      try {
        domain = new URL(record.url).hostname.replace(/^www\./, '');
      } catch {
        domain = record.url;
      }
      url = record.url;
      companyName = record.title || domain;
      category = record.refinedData?.industrySector || 'Web Content & RAG';
      description = record.refinedData?.executiveSummary || record.description || record.plainText?.slice(0, 240) || '';
      
      if (record.refinedData?.contacts?.emails) emails.push(...record.refinedData.contacts.emails);
      if (record.refinedData?.contacts?.phones) phones.push(...record.refinedData.contacts.phones);
      if (record.refinedData?.contacts?.locations) addresses.push(...record.refinedData.contacts.locations);

      remarks = record.refinedData
        ? `Refined Intel: ${record.refinedData.valueProposition?.slice(0, 100)} | Audience: ${record.refinedData.targetAudience} | Offerings: ${record.refinedData.coreOfferings?.slice(0, 2).join(', ')}`
        : `Actor Web Content: ${record.wordCount} words extracted. Read time: ${record.readTimeMinutes} min. Headings: ${record.headings?.length || 0}.`;
    } else if (type === 'instagram') {
      domain = `instagram.com/${record.username}`;
      url = `https://www.instagram.com/${record.username}/`;
      companyName = `${record.fullName} (@${record.username})`;
      category = record.category || 'Instagram Influencer / Brand';
      description = record.biography || '';
      remarks = `Instagram Actor: ${record.followersFormatted} Followers, ${record.followingFormatted} Following, ${record.postsCount} Posts. Verified: ${record.isVerified ? 'Yes' : 'No'}. Recent posts: ${record.posts?.length || 0}`;
    } else if (type === 'linkedin') {
      domain = `linkedin.com/company/${record.companySlug}`;
      url = record.linkedinUrl || `https://www.linkedin.com/company/${record.companySlug}/`;
      companyName = record.companyName;
      category = record.industry || 'LinkedIn Enterprise';
      description = record.aboutSummary || record.tagline || '';
      if (record.headquarters) addresses.push(record.headquarters);
      remarks = `LinkedIn Actor: Size: ${record.companySize}. HQ: ${record.headquarters}. Specialties: ${record.specialties?.slice(0, 4).join(', ')}`;
    } else if (type === 'facebook') {
      domain = `facebook.com/${record.pageSlug}`;
      url = record.pageUrl || `https://www.facebook.com/${record.pageSlug}/`;
      companyName = record.pageName || record.pageSlug;
      category = record.category || 'Facebook Business Page';
      description = record.about || record.intro || '';
      if (record.address) addresses.push(record.address);
      if (record.email) emails.push(record.email);
      if (record.phone) phones.push(record.phone);
      remarks = `Facebook Page: ${record.likesFormatted} Likes, ${record.followersFormatted} Followers. Category: ${record.category}. Recent posts: ${record.posts?.length || 0}. Verified: ${record.isVerified ? 'Yes' : 'No'}.`;
      socialIntel = { facebook: record };
    } else if (type === 'meta_ads') {
      domain = `${(record.query || 'advertiser').toLowerCase()}.com`;
      url = record.adLibraryUrl;
      companyName = `${record.pageName || record.query} (Meta Ads)`;
      category = 'Meta Active Advertiser (FB & IG)';
      description = `${record.totalActiveAds} active ad campaigns running across Facebook & Instagram Ad Library.`;
      remarks = `Meta Ad Library: ${record.totalActiveAds} active ads detected across platforms: ${record.platformsDetected?.join(', ')}. Top creatives & CTA tracked.`;
      socialIntel = { metaAds: record };
    } else if (type === 'omnichannel_360') {
      domain = record.domain;
      url = record.unifiedContacts?.socialProfiles?.website || `https://${record.domain}`;
      companyName = record.brandName;
      category = record.industrySector || '360° Omnichannel Brand';
      description = record.executiveSummary || record.valueProposition || '';

      if (record.unifiedContacts?.emails) emails.push(...record.unifiedContacts.emails);
      if (record.unifiedContacts?.phones) phones.push(...record.unifiedContacts.phones);
      if (record.unifiedContacts?.locations) addresses.push(...record.unifiedContacts.locations);

      remarks = `360° Omnichannel Sweep: Digital Score: ${record.digitalPresenceScore}/100. Reach: ${record.totalAudienceReach}. Active Meta Ads: ${record.activePaidAdsCount}. Channels: ${record.channelsDetected?.join(', ')}`;
      socialIntel = {
        facebook: record.facebookIntel,
        metaAds: record.metaAdsIntel,
        instagram: record.instagramIntel,
        linkedin: record.linkedinIntel,
      };
    }

    ProfileStorageService.saveProfile({
      domain,
      url,
      companyName,
      category,
      description,
      rating: 5,
      mark: 'Target Account',
      remarks,
      listName: 'Actor Scraped Leads',
      tags: [type.toUpperCase(), 'ACTOR_SCRAPED', 'VERIFIED_PUBLIC'],
      contactInfo: {
        emails,
        phones,
        addresses,
        socialLinks:
          type === 'instagram'
            ? { instagram: url }
            : type === 'linkedin'
            ? { linkedin: url }
            : type === 'facebook'
            ? { facebook: url }
            : {},
      },
      sourceOrigin: 'domain_crawler',
      businessDetails: {
        rawDetails: remarks,
      },
      socialIntel,
      technographics: {
        technologies: [],
        rawDetectionsCount: 0,
      },
    });

    loadProfiles();
    setSaveSuccessMsg(`Saved "${companyName}" to Workspace Profiles!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveCurrentResult = () => {
    if (!result) return;
    const categoryGuess = result.category || result.technographics.cms || result.technographics.framework || 'B2B Commercial';
    const record = ProfileStorageService.saveProfile({
      domain: result.domain,
      url: result.url,
      companyName: result.companyName,
      category: categoryGuess,
      productsServices: result.productsServices,
      description: result.description,
      rating: 5,
      mark: 'Target Account',
      remarks: `Enriched Commercial Sourcing: ${result.businessDetails?.rawDetails || 'Standard Web Entity'}${result.verification && result.verification.length > 0 ? ` | ${result.verification.join(', ')}` : ''}`,
      listName: 'Enriched Commercial Accounts',
      tags: [...(result.statusTags || []), ...(result.verification || [])],
      contactInfo: result.contactInfo,
      location: result.location,
      geoData: result.geoData,
      businessDetails: result.businessDetails,
      verification: result.verification,
      sourceOrigin: 'domain_crawler',
      statusTags: result.statusTags,
      technographics: result.technographics,
      aiAgentAnalysis: aiAnalysis,
    });
    loadProfiles();
    setSaveSuccessMsg(`Saved "${record.companyName}" to Workspace Profiles!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleBulkQueue = async () => {
    const domains = bulkInput
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    if (domains.length === 0) return;

    setQueueLoading(true);
    setQueueMessage(null);

    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains }),
      });
      const data = await res.json();
      if (data.success) {
        setQueueMessage(`⚡ Successfully dispatched ${data.enqueuedCount} domains to BullMQ Redis Queue! Worker is actively processing.`);
        await fetchQueueData();
      } else {
        setQueueMessage('❌ Error adding to queue: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      setQueueMessage('❌ Error adding to queue: ' + err.message);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleStartWorker = async () => {
    try {
      setQueueLoading(true);
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_worker' }),
      });
      const data = await res.json();
      if (data.success) {
        setQueueMessage('⚡ BullMQ Stealth Scraping Worker is online and processing background jobs.');
        await fetchQueueData();
      }
    } catch (err: any) {
      setQueueMessage('❌ Failed to wake worker: ' + err.message);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleClearQueue = async () => {
    if (!confirm('Are you sure you want to clear the BullMQ queue? This purges waiting, active, and completed jobs from Redis.')) return;
    try {
      setQueueLoading(true);
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      const data = await res.json();
      if (data.success) {
        setQueueMessage('🧹 BullMQ Redis queue purged.');
        await fetchQueueData();
      }
    } catch (err: any) {
      setQueueMessage('❌ Failed to clear queue: ' + err.message);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleSaveQueueJobToProfiles = (job: any) => {
    const r = job.returnvalue;
    if (!r) return;
    const domain = r.domain || job.domain || 'unknown.com';
    const companyName = r.companyName || domain;
    ProfileStorageService.saveProfile({
      domain,
      url: r.url || `https://${domain}`,
      companyName,
      category: r.category || 'Technology',
      description: r.description || `Enriched via BullMQ background stealth engine in ${job.durationMs || r.executionTimeMs || 0}ms.`,
      rating: 5,
      mark: 'Target Account',
      remarks: `Scraped via BullMQ Stealth Playwright. Raw detections: ${r.technographics?.rawDetectionsCount || 0}. Crawled: ${r.crawledAt || new Date().toISOString()}`,
      listName: 'BullMQ Enriched',
      tags: ['BullMQ', 'Stealth Crawled', r.category || 'Tech'],
      sourceOrigin: 'bullmq_queue',
      contactInfo: {
        emails: r.contactInfo?.emails || [],
        phones: r.contactInfo?.phones || [],
        addresses: r.contactInfo?.addresses || [],
        socialLinks: r.contactInfo?.socialLinks || {},
      },
      technographics: {
        technologies: r.technographics?.technologies || [],
        rawDetectionsCount: r.technographics?.rawDetectionsCount || 0,
      },
    });
    setSavedProfiles(ProfileStorageService.getProfiles());
    setQueueMessage(`✓ Saved ${companyName} (${domain}) to Account Graph!`);
    setTimeout(() => setQueueMessage(null), 3500);
  };

  const handleImportAllCompletedQueueJobs = () => {
    const completedWithData = queueJobs.filter((j) => j.returnvalue && (j.state === 'completed' || j.progress === 100));
    if (completedWithData.length === 0) {
      setQueueMessage('No completed jobs available to import.');
      return;
    }
    completedWithData.forEach((j) => {
      const r = j.returnvalue;
      const domain = r.domain || j.domain || 'unknown.com';
      ProfileStorageService.saveProfile({
        domain,
        url: r.url || `https://${domain}`,
        companyName: r.companyName || domain,
        category: r.category || 'Technology',
        description: r.description || 'Enriched via BullMQ worker pipeline.',
        rating: 5,
        mark: 'Target Account',
        remarks: `Bulk saved from BullMQ queue. Execution time: ${j.durationMs || r.executionTimeMs || 0}ms`,
        listName: 'BullMQ Enriched',
        tags: ['BullMQ', 'Bulk Ingest'],
        sourceOrigin: 'bullmq_queue',
        contactInfo: {
          emails: r.contactInfo?.emails || [],
          phones: r.contactInfo?.phones || [],
          addresses: r.contactInfo?.addresses || [],
          socialLinks: r.contactInfo?.socialLinks || {},
        },
        technographics: {
          technologies: r.technographics?.technologies || [],
          rawDetectionsCount: r.technographics?.rawDetectionsCount || 0,
        },
      });
    });
    setSavedProfiles(ProfileStorageService.getProfiles());
    setQueueMessage(`✓ Bulk imported ${completedWithData.length} enriched companies into Account Graph!`);
    setTimeout(() => setQueueMessage(null), 4000);
  };

  // Profile Management Actions
  const handleUpdateRating = (id: string, newRating: number) => {
    ProfileStorageService.updateProfile(id, { rating: newRating });
    loadProfiles();
  };

  const handleUpdateMark = (id: string, newMark: EnrichedProfileRecord['mark']) => {
    ProfileStorageService.updateProfile(id, { mark: newMark });
    loadProfiles();
  };

  const handleSaveRemark = (id: string) => {
    ProfileStorageService.updateProfile(id, { remarks: remarkDraft });
    setEditingRemarkId(null);
    loadProfiles();
  };

  const handleDeleteProfile = (id: string) => {
    ProfileStorageService.deleteProfile(id);
    loadProfiles();
  };

  const handleToggleMergeSelect = (id: string) => {
    setSelectedProfilesForMerge((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteMerge = () => {
    if (selectedProfilesForMerge.length < 2) return;
    const merged = ProfileStorageService.mergeProfiles(selectedProfilesForMerge);
    if (merged) {
      setSelectedProfilesForMerge([]);
      loadProfiles();
      alert(`Successfully merged ${selectedProfilesForMerge.length} records into consolidated entity: ${merged.companyName}`);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Company Name',
      'Domain',
      'Category',
      'Source Origin',
      'Selling Price',
      'MRP',
      'Card Offer Price',
      'B2B Wholesale Price',
      'Rating',
      'Mark',
      'Emails',
      'Phones',
      'WhatsApp URL',
      'Address',
      'GSTIN',
      'PAN',
      'Operational Score',
      'Technologies',
      'Remarks',
    ];
    const rows = filteredProfiles.map((p) => [
      `"${p.companyName.replace(/"/g, '""')}"`,
      `"${p.domain.replace(/"/g, '""')}"`,
      `"${p.category.replace(/"/g, '""')}"`,
      `"${p.sourceOrigin || 'domain_crawler'}"`,
      `"${p.pricing?.sellingPrice || ''}"`,
      `"${p.pricing?.mrp || ''}"`,
      `"${p.pricing?.offerPrice || ''}"`,
      `"${p.pricing?.b2bPricing?.wholesalePrice || ''}"`,
      p.rating,
      `"${p.mark}"`,
      `"${p.contactInfo.emails.join('; ')}"`,
      `"${p.contactInfo.phones.join('; ')}"`,
      `"${p.whatsappUrl || ''}"`,
      `"${p.contactInfo.addresses.join('; ').replace(/"/g, '""')}"`,
      `"${p.businessDetails?.gstin || ''}"`,
      `"${p.businessDetails?.pan || ''}"`,
      `"${p.operationalHealth?.score || ''}"`,
      `"${p.technographics.technologies.map((t) => t.name).join('; ')}"`,
      `"${p.remarks.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `b2b_profiles_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Maps Scraper Actions
  const handleMapsScrape = async () => {
    setShowScraperConsole(true);
    setMapsLoading(true);
    setMapsReport(null);
    setScraperLogs((prev) => [
      {
        id: `start_maps_${Date.now()}`,
        timestamp: new Date().toISOString(),
        domain: 'system',
        type: 'info',
        message: `🚀 Initiating Google Maps Enterprise Sourcing for "${mapsQueryInput}" in "${mapsLocation}" (Radius: ${mapsRadiusKm}km, Max: ${mapsMaxResults})...`,
      },
      ...prev,
    ]);

    if (mapsMode === 'places') {
      if (!mapsQueryInput.trim()) {
        setMapsLoading(false);
        return;
      }
      setMapsEnterprisePlaces([]);
      setSelectedEnterprisePlaces([]);

      try {
        const res = await fetch('/api/maps-scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'enterprise_places',
            searchQuery: mapsQueryInput,
            location: mapsLocation,
            radiusKm: mapsRadiusKm,
            maxResults: mapsMaxResults,
            enrichWebsites: mapsEnrichWebsites,
          }),
        });
        const data = await res.json();
        if (data.places) {
          setMapsEnterprisePlaces(data.places);
          setMapsReport(data.report);
        } else {
          alert(data.error || 'Failed to scrape Google Maps places');
        }
      } catch (err: any) {
        alert('Error connecting to maps scraper: ' + err.message);
      } finally {
        setMapsLoading(false);
      }
    } else {
      if (!mapsKeywordsInput.trim()) {
        setMapsLoading(false);
        return;
      }
      setMapsResults([]);
      setSelectedMapItems([]);

      try {
        const res = await fetch('/api/maps-scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywordsInput: mapsKeywordsInput,
            location: mapsLocation,
            maxResults: mapsMaxResults,
            enrichWebsites: mapsEnrichWebsites,
            minMatchScore: mapsMinMatch,
            requirePhoneOrEmail: mapsRequireContact,
          }),
        });
        const data = await res.json();
        if (data.items) {
          setMapsResults(data.items);
          setMapsReport(data.report);
        } else {
          alert(data.error || 'Failed to scrape map listings');
        }
      } catch (err: any) {
        alert('Error connecting to maps scraper: ' + err.message);
      } finally {
        setMapsLoading(false);
      }
    }
  };

  const handleRunSerpScrape = async () => {
    const rawQueries = serpQueriesInput
      .split(/[\n,]/)
      .map((q) => q.trim())
      .filter(Boolean);

    if (rawQueries.length === 0) {
      alert('Please provide at least one search query or keyword');
      return;
    }

    setShowScraperConsole(true);
    setSerpLoading(true);
    setSerpReport(null);
    setSelectedSerpIndices([]);
    setScraperLogs((prev) => [
      {
        id: `start_serp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        domain: 'system',
        type: 'info',
        message: `🚀 Initiating SERP Intelligence for queries: ${rawQueries.join(', ')} (Country: ${serpCountryCode.toUpperCase()}, Lang: ${serpLanguageCode})...`,
      },
      ...prev,
    ]);

    try {
      const res = await fetch('/api/search-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: rawQueries,
          countryCode: serpCountryCode,
          languageCode: serpLanguageCode,
          maxPagesPerQuery: serpMaxPages,
          includeAiOverview: serpIncludeAi,
          includePaidAds: serpIncludeAds,
          includePeopleAlsoAsk: serpIncludePaa,
          enrichLeads: serpEnrichLeads,
        }),
      });
      const data: GoogleSearchExecutionReport = await res.json();
      if (data.success) {
        setSerpReport(data);
        setSaveSuccessMsg(
          `SERP Scrape Complete! Harvested ${data.summary.totalOrganicFound} organic & ${data.summary.totalPaidAdsFound} paid ads.`
        );
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'Failed to extract search results');
      }
    } catch (err: any) {
      alert('Error querying search intelligence: ' + err.message);
    } finally {
      setSerpLoading(false);
    }
  };

  const handleExportSerpCSV = () => {
    if (!serpReport || !serpReport.flattenedOrganic.length) return;
    let csv = 'Position,Type,Title,URL,Displayed URL,Description,Lead Email,Lead Phone,Lead Verified\n';
    serpReport.flattenedOrganic.forEach((item) => {
      csv += `"${item.position}","${item.type}","${(item.title || '').replace(/"/g, '""')}","${item.url}","${(item.displayedUrl || '').replace(/"/g, '""')}","${(item.description || '').replace(/"/g, '""')}","${item.leadEmail || ''}","${item.leadPhone || ''}","${item.leadMxVerified ? 'Yes' : 'No'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `serp_organic_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSerpInstantlyCSV = () => {
    if (!serpReport) return;
    const leads = serpReport.flattenedOrganic.filter((r) => r.leadEmail);
    if (!leads.length) {
      alert('No verified emails found in search results yet to export for Instantly.');
      return;
    }
    let csv = 'FirstName,Company,Email,CustomDomain,SERPRank,SnippetHook\n';
    leads.forEach((l) => {
      const company = l.title.split(/[-–|]/)[0]?.trim() || l.title;
      let domain = '';
      try {
        domain = new URL(l.url).hostname;
      } catch {}
      csv += `"Marketing Lead","${company.replace(/"/g, '""')}","${l.leadEmail}","${domain}","Rank #${l.position}","${(l.description || '').slice(0, 100).replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `instantly_serp_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSerpToCRM = () => {
    if (!serpReport || !serpReport.flattenedOrganic.length) return;
    const itemsToSave = selectedSerpIndices.length > 0
      ? serpReport.flattenedOrganic.filter((_, idx) => selectedSerpIndices.includes(idx))
      : serpReport.flattenedOrganic;

    if (itemsToSave.length === 0) {
      alert('No SERP results selected to save');
      return;
    }

    itemsToSave.forEach((item) => {
      let domain = '';
      try { domain = new URL(item.url).hostname.replace(/^www\./, ''); } catch {}
      if (!domain) {
        domain = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.search.local`;
      }

      ProfileStorageService.saveProfile({
        domain,
        url: item.url,
        companyName: item.title.split(/[-–|]/)[0]?.trim() || item.title,
        category: 'SERP Search Lead',
        description: item.description || item.title,
        rating: 5,
        mark: 'Target Account',
        remarks: `Google Search Rank #${item.position}. Engine: ENRICHER SERP Intelligence. Snippet: ${item.description || ''}`,
        listName: 'Google Search Leads',
        tags: ['SERP_INTELLIGENCE', `RANK_${item.position}`],
        contactInfo: {
          emails: item.leadEmail ? [item.leadEmail] : [],
          phones: item.leadPhone ? [item.leadPhone] : [],
          addresses: [],
          socialLinks: {},
        },
        sourceOrigin: 'search_intelligence',
        technographics: {
          technologies: [],
          rawDetectionsCount: 0,
        },
      });
    });

    loadProfiles();
    setSaveSuccessMsg(`Saved ${itemsToSave.length} SERP leads into Workspace Profiles!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleToggleEnterprisePlaceSelect = (placeId: string) => {
    setSelectedEnterprisePlaces((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const handleToggleSelectAllEnterprisePlaces = () => {
    if (selectedEnterprisePlaces.length === mapsEnterprisePlaces.length) {
      setSelectedEnterprisePlaces([]);
    } else {
      setSelectedEnterprisePlaces(mapsEnterprisePlaces.map((p) => p.placeId));
    }
  };

  const handleSaveEnterprisePlacesToCRM = () => {
    const itemsToSave = mapsEnterprisePlaces.filter(
      (p) => selectedEnterprisePlaces.length === 0 || selectedEnterprisePlaces.includes(p.placeId)
    );

    if (itemsToSave.length === 0) {
      alert('No places selected to save');
      return;
    }

    itemsToSave.forEach((item) => {
      let domain = '';
      if (item.website) {
        try {
          domain = new URL(item.website).hostname.replace(/^www\./, '');
        } catch {}
      }
      if (!domain) {
        domain = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.places.local`;
      }

      ProfileStorageService.saveProfile({
        domain,
        url: item.website || item.url,
        companyName: item.title,
        category: item.categoryName || 'Local Business',
        description: `${item.title} - ${item.categoryName}. Google Maps Score: ${item.totalScore || 4.5}★ (${item.reviewsCount || 0} reviews). ${item.priceBracket || ''}`,
        rating: Math.min(Math.round(item.totalScore || 5), 5),
        mark: 'Target Account',
        remarks: `Google Maps Place: ${item.address}. Phone: ${item.phone || 'N/A'}. Open: ${item.wasOpenAtScrapeTime ? 'Yes' : 'No'}. Place ID: ${item.placeId}`,
        listName: 'Google Maps Sourced Accounts',
        tags: ['GOOGLE_MAPS', 'LOCAL_BUSINESS', item.categoryName?.toUpperCase() || 'RETAIL'],
        contactInfo: {
          emails: item.email ? [item.email, ...(item.companyContacts?.emails || []).filter((e) => e !== item.email)] : (item.companyContacts?.emails || []),
          phones: item.phone ? [item.phone] : [],
          addresses: [item.address],
          socialLinks: item.companyContacts?.socialProfiles || {},
        },
        location: {
          formattedAddress: item.address,
          city: item.city || null,
          state: item.state || null,
          country: item.countryCode || 'US',
        },
        geoData: {
          latitude: item.location.lat,
          longitude: item.location.lng,
        },
        sourceOrigin: 'google_maps_enterprise',
        technographics: {
          technologies: [],
          rawDetectionsCount: 0,
        },
        businessDetails: {
          rawDetails: `Google Maps Place ID: ${item.placeId}. Hours: 7-day schedule.`,
        },
      });
    });

    loadProfiles();
    setSaveSuccessMsg(`Saved ${itemsToSave.length} Google Maps places into Workspace Profiles!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExportEnterpriseCSV = () => {
    if (mapsEnterprisePlaces.length === 0) return;
    const headers = [
      '#',
      'Place Name',
      'Category',
      'Total Score',
      'Reviews Count',
      'Street',
      'City',
      'State',
      'Postal Code',
      'Country Code',
      'Phone',
      'Website',
      'Price Bracket',
      'Direct Email',
      'Open Now',
      'Google Maps URL',
      'Place ID',
      'Latitude',
      'Longitude',
    ];

    const rows = mapsEnterprisePlaces.map((p, idx) => [
      idx + 1,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.categoryName || ''}"`,
      p.totalScore || '',
      p.reviewsCount || 0,
      `"${(p.street || '').replace(/"/g, '""')}"`,
      `"${(p.city || '').replace(/"/g, '""')}"`,
      `"${p.state || ''}"`,
      `"${p.postalCode || ''}"`,
      `"${p.countryCode || 'US'}"`,
      `"${p.phone || ''}"`,
      `"${p.website || ''}"`,
      `"${p.priceBracket || ''}"`,
      `"${p.email || p.companyContacts?.emails?.[0] || ''}"`,
      p.wasOpenAtScrapeTime ? 'Yes' : 'No',
      `"${p.url}"`,
      `"${p.placeId}"`,
      p.location?.lat || '',
      p.location?.lng || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `google_maps_places_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInstantlyCSV = () => {
    if (mapsEnterprisePlaces.length === 0) return;
    const headers = [
      'Email',
      'FirstName',
      'LastName',
      'Company',
      'Phone',
      'Website',
      'City',
      'Category',
      'Rating',
      'ReviewsCount',
    ];

    const rows = mapsEnterprisePlaces
      .filter((p) => p.email || p.companyContacts?.emails?.length || p.website)
      .map((p) => {
        const lead = p.businessLeads?.[0];
        const email = p.email || p.companyContacts?.emails?.[0] || '';
        return [
          `"${email}"`,
          `"${lead?.fullName?.split(' ')[0] || 'Store'}"`,
          `"${lead?.fullName?.split(' ').slice(1).join(' ') || 'Manager'}"`,
          `"${(p.title || '').replace(/"/g, '""')}"`,
          `"${p.phone || ''}"`,
          `"${p.website || ''}"`,
          `"${p.city || ''}"`,
          `"${p.categoryName || ''}"`,
          p.totalScore || '',
          p.reviewsCount || 0,
        ];
      });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `instantly_smartlead_campaign_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportEnterpriseJSON = () => {
    if (mapsEnterprisePlaces.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(mapsEnterprisePlaces, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `google_maps_places_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleMapItemSelect = (id: string) => {
    setSelectedMapItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllMapItems = () => {
    if (selectedMapItems.length === mapsResults.length) {
      setSelectedMapItems([]);
    } else {
      setSelectedMapItems(mapsResults.map((r) => r.id));
    }
  };

  const handleSaveSelectedMapItems = () => {
    const itemsToSave = mapsResults.filter((item) =>
      selectedMapItems.length === 0 || selectedMapItems.includes(item.id)
    );

    if (itemsToSave.length === 0) {
      alert('No items to save');
      return;
    }

    itemsToSave.forEach((item) => {
      ProfileStorageService.saveProfile({
        domain: item.siteName !== 'Google Maps Verified Listing' ? item.siteName : `${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.local`,
        url: item.websiteUrl || item.mapUrl,
        companyName: item.name,
        category: item.itemSpecs[0] || 'Hardware / Business Store',
        description: `${item.itemName} | Specs: ${item.itemSpecs.join(', ')} | Location: ${item.buyingLocations}`,
        rating: Math.round(item.rating || 4),
        mark: 'Target Account',
        remarks: `Scraped via Google Maps & Keyword Scraper (Matched: ${item.matchedKeywords.join(', ')} | Score: ${item.matchScore}% | Budget: ${item.priceEstimate})`,
        listName: 'Google Maps Sourced',
        tags: item.itemSpecs,
        contactInfo: {
          emails: item.email ? [item.email] : [],
          phones: item.phone ? [item.phone] : [],
          addresses: item.address ? [item.address] : [],
          socialLinks: {},
        },
        technographics: {
          technologies: item.itemSpecs.map((spec) => ({
            name: spec,
            category: 'Framework',
            confidence: 0.9,
          })),
          rawDetectionsCount: item.itemSpecs.length,
        },
      });
    });

    loadProfiles();
    alert(`Successfully saved ${itemsToSave.length} records into your Saved Profiles workspace!`);
  };

  const handleExportMapsCSV = () => {
    if (mapsResults.length === 0) return;
    const headers = [
      'Name',
      'Site Name',
      'Item Name',
      'Item Specs',
      'Buying Locations',
      'Phone',
      'Email',
      'Address',
      'Latitude',
      'Longitude',
      'Rating',
      'Reviews Count',
      'Price Estimate',
      'Match Score',
      'Website URL',
      'Google Maps URL',
    ];

    const rows = mapsResults.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.siteName}"`,
      `"${item.itemName.replace(/"/g, '""')}"`,
      `"${item.itemSpecs.join('; ')}"`,
      `"${item.buyingLocations.replace(/"/g, '""')}"`,
      `"${item.phone}"`,
      `"${item.email}"`,
      `"${item.address.replace(/"/g, '""')}"`,
      item.latitude ?? '',
      item.longitude ?? '',
      item.rating ?? '',
      item.reviewsCount ?? '',
      `"${item.priceEstimate || ''}"`,
      `${item.matchScore}%`,
      `"${item.websiteUrl}"`,
      `"${item.mapUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `google_maps_keyword_scrape_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMapsJSON = () => {
    if (mapsResults.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(mapsResults, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `google_maps_keyword_scrape_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Product & Specs Finder Handlers
  const handleProductSearch = async () => {
    // Validate range specs
    const invalidRangeSpec = specsList.find(
      (s) => s.mode === 'range' && !s.minValue?.trim() && !s.maxValue?.trim()
    );
    if (invalidRangeSpec) {
      setProductSaveMessage(
        '⚠️ Spec "' + (invalidRangeSpec.name || 'Untitled') + '" has Range Mode enabled. Please fill at least Min or Max (no restriction to fill both, or uncheck Range Mode).'
      );
      return;
    }

    setProductLoading(true);
    setProductSaveMessage(null);
    try {
      const priceRangeClause = productMinPrice || productMaxPrice
        ? '₹' + Number(productMinPrice || 0).toLocaleString('en-IN') + ' - ₹' + Number(productMaxPrice || 0).toLocaleString('en-IN')
        : productPriceRangeText;

      const compiledSpecs = formatSpecsFromList(specsList) || productSpecInput;

      const payload = {
        category: productCategoryInput.trim(),
        product: productNameInput.trim(),
        specs: compiledSpecs,
        structuredSpecs: specsList,
        minPrice: productMinPrice ? Number(productMinPrice) : undefined,
        maxPrice: productMaxPrice ? Number(productMaxPrice) : undefined,
        priceRange: priceRangeClause,
        scope: productScope,
        centerLocation: productScope === 'world' ? 'Global' : (productScope === 'india' ? 'India' : productCenterLocation),
        rangeKm: productScope === 'radius' ? productRangeKm : 0,
        maxResults: productMaxResults,
      };

      const searchLabel = productNameInput.trim()
        ? `"${productNameInput.trim()}"`
        : `Category "${productCategoryInput.trim() || 'General'}" (${compiledSpecs ? compiledSpecs : 'All Specs'})`;

      if (productViewMode === 'specs') {
        const res = await fetch('/api/product-spec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.records) {
          setProductSpecResults(data.records);
          const cov = data.coverage || getRegionalCoverageMetadata(productCenterLocation, productScope, productRangeKm, data.records.length);
          setSearchCoverage(cov);
          if (data.records.length > 0) {
            setProductSaveMessage('🎯 Optimized Search Complete for ' + searchLabel + ': Scanned ' + cov.areasSearchedCount + ' regional procurement zones across ' + cov.coveragePerimeter + '. Evaluated ' + cov.rawCandidatesAudited + ' raw candidate nodes to isolate ' + data.records.length + ' top-ranked verified suppliers with wholesale B2B pricing.');
            setRecordsProcessed((prev) => prev + data.records.length);
            setMoneySaved((prev) => prev + data.records.length * 0.5);
          } else {
            setProductSaveMessage('⚠️ Scanned ' + cov.areasSearchedCount + ' regional zones across ' + cov.coveragePerimeter + ' for ' + searchLabel + ', but no direct suppliers matched your exact criteria. Try broadening specs or increasing the radius.');
          }
        } else if (data.error) {
          setProductSaveMessage('❌ Error: ' + data.error);
        }
      } else {
        const queryTerm = [
          productNameInput.trim(),
          productCategoryInput.trim(),
          compiledSpecs.trim()
        ].filter(Boolean).join(' ');

        const res = await fetch('/api/product-finder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            productQuery: queryTerm || productCategoryInput.trim() || 'Wholesale Suppliers',
          }),
        });
        const data = await res.json();
        if (data.records) {
          setProductSellerResults(data.records);
          const cov = data.coverage || getRegionalCoverageMetadata(productCenterLocation, productScope, productRangeKm, data.records.length);
          setSearchCoverage(cov);
          if (data.records.length > 0) {
            setProductSaveMessage('🎯 Optimized Sourcing Complete for ' + searchLabel + ': Scanned ' + cov.areasSearchedCount + ' commercial supply hubs across ' + cov.coveragePerimeter + '. Evaluated ' + cov.rawCandidatesAudited + ' enterprise nodes to isolate ' + data.records.length + ' verified B2B suppliers.');
            setRecordsProcessed((prev) => prev + data.records.length);
            setMoneySaved((prev) => prev + data.records.length * 0.5);
          } else {
            setProductSaveMessage('⚠️ Scanned ' + cov.areasSearchedCount + ' regional zones across ' + cov.coveragePerimeter + ' for ' + searchLabel + ', but no verified suppliers matched. Try adjusting radius or location.');
          }
        } else if (data.error) {
          setProductSaveMessage('❌ Error: ' + data.error);
        }
      }
    } catch (err: any) {
      console.error('Failed to search products:', err);
      setProductSaveMessage('❌ Search failed: ' + (err?.message || 'Network error'));
    } finally {
      setProductLoading(false);
    }
  };

  const handleSaveSpecMerchant = (item: ProductSpecRecord) => {
    ProfileStorageService.saveProfile({
      domain: `${item.sellerBusiness.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
      url: item.websiteUrl || 'https://www.google.com',
      companyName: item.sellerBusiness,
      category: item.category || productCategoryInput || 'Procurement Supplier',
      description: `${item.product} - Specs: ${item.specs} - Logistics: ${item.logistics}`,
      rating: item.statusTag === 'completed' ? 5 : item.statusTag === 'working' ? 4 : 3,
      mark: 'Target Account',
      remarks: `Search Range: ${searchCoverage.coveragePerimeter} (${searchCoverage.areasSearchedCount} areas probed) | Product: ${item.product} (Selling: ${item.sellingPrice || item.price}, MRP: ${item.mrp || 'N/A'}, Card Offer: ${item.offerPrice || 'N/A'}) | B2B Wholesale: ${item.b2bPricing?.wholesalePrice || 'N/A'} (${item.b2bPricing?.bulkDiscountTier || ''}, ${item.b2bPricing?.moq || ''}) | Strategy: ${item.b2bPricing?.b2bStrategy || ''} | Details: ${item.businessDetails} | Location: ${item.location} (${item.distanceKm}km)`,
      listName: 'Hardware Sourcing',
      tags: [item.statusTag, item.websiteSource, 'Product Finder'],
      sourceOrigin: 'product_spec_matrix',
      searchProvenance: {
        searchPerimeter: searchCoverage.coveragePerimeter,
        areasProbedCount: searchCoverage.areasSearchedCount,
        queryKeyword: productNameInput || productCategoryInput,
        logistics: item.logistics,
        remarks: item.businessDetails,
      },
      pricing: {
        sellingPrice: item.sellingPrice || item.price,
        mrp: item.mrp,
        offerPrice: item.offerPrice,
        discountPercent: item.discountPercent,
        b2bPricing: item.b2bPricing,
      },
      specsData: item.specs,
      procurementTerms: item.logistics ? `Logistics: ${item.logistics}` : undefined,
      businessDetails: {
        rawDetails: item.businessDetails,
      },
      contactInfo: {
        emails: [],
        phones: [],
        addresses: [item.location],
        socialLinks: {},
      },
      technographics: {
        technologies: [],
        rawDetectionsCount: 0,
      },
    });
    setSavedProfiles(ProfileStorageService.getProfiles());
    setProductSaveMessage(`Saved "${item.sellerBusiness}" to Saved Profiles!`);
    setTimeout(() => setProductSaveMessage(null), 3500);
  };

  const getWhatsAppUrl = (phone: string, businessName: string) => {
    const cleanDigits = phone.replace(/[^\d]/g, '');
    let intl = cleanDigits;
    if (cleanDigits.length === 10) {
      intl = `91${cleanDigits}`;
    } else if (cleanDigits.startsWith('0') && cleanDigits.length === 11) {
      intl = `91${cleanDigits.slice(1)}`;
    }
    const queryTerm = productNameInput || productCategoryInput || 'Commercial Procurement';
    const text = encodeURIComponent(
      `Hello ${businessName}, we are reaching out via ENRICHER.AI regarding commercial bulk procurement for ${queryTerm}. Please share your current wholesale availability, MOQ, and corporate pricing terms.`
    );
    return `https://wa.me/${intl}?text=${text}`;
  };

  const handleToggleSelectSeller = (id: string) => {
    setSelectedSellerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllSellers = () => {
    const visibleIds = filteredProductSellerResults.map((s) => s.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSellerIds.includes(id));
    if (allVisibleSelected) {
      setSelectedSellerIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedSellerIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBatchImportSellers = () => {
    const toImport = productSellerResults.filter((s) => selectedSellerIds.includes(s.id));
    if (toImport.length === 0) return;
    toImport.forEach((seller) => {
      let cleanDomain = '';
      if (seller.website) {
        try {
          cleanDomain = new URL(seller.website).hostname.replace(/^www\./, '');
        } catch { }
      }
      ProfileStorageService.saveProfile({
        domain: cleanDomain,
        url: seller.website || '',
        companyName: seller.businessName,
        category: seller.category,
        description: seller.productsServices,
        rating: seller.rating ? Math.round(seller.rating) : 5,
        mark: 'Qualified',
        remarks: `Search Scope: ${searchCoverage.coveragePerimeter} | Location: ${seller.address} | Lat/Long: ${seller.latitude}, ${seller.longitude} (${seller.distanceKm}km) | Status: ${seller.businessStatus} | Verification: ${seller.verificationStatus}`,
        listName: 'Supplier Directory',
        tags: [seller.businessStatus, seller.verificationStatus, 'Product Finder'],
        sourceOrigin: 'gmaps_seller',
        searchProvenance: {
          searchPerimeter: searchCoverage.coveragePerimeter,
          areasProbedCount: searchCoverage.areasSearchedCount,
          queryKeyword: productNameInput || productCategoryInput,
        },
        pricing: seller.b2bPricing ? {
          b2bPricing: seller.b2bPricing,
        } : undefined,
        procurementTerms: seller.procurementTerms,
        tradeCreditTerms: seller.tradeCreditTerms,
        operationalHealth: seller.operationalHealth,
        geoData: {
          latitude: seller.latitude,
          longitude: seller.longitude,
        },
        whatsappUrl: seller.phone ? getWhatsAppUrl(seller.phone, seller.businessName) : undefined,
        verification: [seller.verificationStatus],
        statusTags: [seller.businessStatus],
        businessDetails: {
          rawDetails: `${seller.productsServices} | ${seller.procurementTerms || 'Standard Distribution'}`,
        },
        contactInfo: {
          emails: seller.email ? [seller.email] : [],
          phones: seller.phone ? [seller.phone] : [],
          addresses: [seller.address],
          socialLinks: {},
        },
        technographics: {
          technologies: [],
          rawDetectionsCount: 0,
        },
      });
    });
    setSavedProfiles(ProfileStorageService.getProfiles());
    setProductSaveMessage(`Imported ${toImport.length} suppliers to Account Graph!`);
    setSelectedSellerIds([]);
    setTimeout(() => setProductSaveMessage(null), 3500);
  };

  const handleBatchExportSelectedSellersCSV = () => {
    const targets = productSellerResults.filter((s) => selectedSellerIds.includes(s.id));
    if (targets.length === 0) return;
    let csv = 'Business Name,Category,Products/Services,Procurement Terms,Website,Phone,Email,Address,Lat/Long,Business Status,Verification Status,Operational Health,Trade Credit Terms,Actions\n';
    targets.forEach((s) => {
      csv += `"${s.businessName.replace(/"/g, '""')}","${s.category.replace(/"/g, '""')}","${s.productsServices.replace(/"/g, '""')}","${(s.procurementTerms || (s.b2bPricing?.wholesalePrice ? `Wholesale: ${s.b2bPricing.wholesalePrice}` : 'Direct In-Store / Quote on Request')).replace(/"/g, '""')}","${s.website || ''}","${s.phone || ''}","${s.email || ''}","${s.address.replace(/"/g, '""')}","${s.latitude}, ${s.longitude}","${s.businessStatus === 'Active' ? 'Operational' : s.businessStatus}","${s.verificationStatus}","${s.operationalHealth?.score || (s.rating ? `★ ${s.rating.toFixed(1)}` : '★ —')} (${s.reviewsCount || 0} reviews) - ${s.operationalHealth?.supplyConsistency || 'Stable Supply'}","${(s.tradeCreditTerms || 'Offline Procurement Only').replace(/"/g, '""')}","${bookmarkedSellerIds.includes(s.id) ? 'Bookmarked' : ''}${flaggedSellerIds.includes(s.id) ? '; Flagged' : ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `b2b_sellers_selected_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeepEnrichSeller = async (seller: ProductSellerRecord) => {
    if (!seller.website) return;
    setDeepEnrichingId(seller.id);
    try {
      let domain = '';
      try {
        domain = new URL(seller.website).hostname.replace(/^www\./, '');
      } catch {
        domain = seller.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      }
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (data?.data) {
        setSellerEnrichData((prev) => ({ ...prev, [seller.id]: data.data }));
        const enrichedEmails = data.data.contactInfo?.emails || [];
        const enrichedPhones = data.data.contactInfo?.phones || [];
        if (enrichedEmails.length > 0 || enrichedPhones.length > 0) {
          setProductSellerResults((prev) =>
            prev.map((s) =>
              s.id === seller.id
                ? {
                  ...s,
                  email: s.email || enrichedEmails[0] || '',
                  phone: s.phone || enrichedPhones[0] || '',
                }
                : s
            )
          );
        }
      }
    } catch (err) {
      console.error('Deep enrich error:', err);
    } finally {
      setDeepEnrichingId(null);
    }
  };

  const handleSaveSeller = (seller: ProductSellerRecord) => {
    let cleanDomain = "";
    if (seller.website) {
      try {
        cleanDomain = new URL(seller.website).hostname.replace(/^www\./, "");
      } catch { }
    }
    ProfileStorageService.saveProfile({
      domain: cleanDomain,
      url: seller.website || "",
      companyName: seller.businessName,
      category: seller.category,
      description: seller.productsServices,
      rating: seller.rating ? Math.round(seller.rating) : 5,
      mark: 'Qualified',
      remarks: `Search Scope: ${searchCoverage.coveragePerimeter} (${searchCoverage.areasSearchedCount} areas probed) | Location: ${seller.address} | Lat/Long: ${seller.latitude}, ${seller.longitude} (${seller.distanceKm}km) | Status: ${seller.businessStatus} | Verification: ${seller.verificationStatus}`,
      listName: 'Supplier Directory',
      tags: [seller.businessStatus, seller.verificationStatus, 'Product Finder'],
      contactInfo: {
        emails: seller.email ? [seller.email] : [],
        phones: seller.phone ? [seller.phone] : [],
        addresses: [seller.address],
        socialLinks: {},
      },
      technographics: {
        technologies: [],
        rawDetectionsCount: 0,
      },
    });
    setSavedProfiles(ProfileStorageService.getProfiles());
    setProductSaveMessage(`Saved "${seller.businessName}" to Account Graph!`);
    setTimeout(() => setProductSaveMessage(null), 3500);
  };

  const handleExportProductCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (productViewMode === 'specs') {
      csvContent += 'Product,Specs,Selling Price,MRP (Launch Price),Card Offer Price,Discount %,B2B Wholesale Price,Bulk Discount Tier,MOQ,B2B Selling Strategy,Payment Terms,Search Range & Perimeter,Areas Probed Count,Background Works Remarks,Seller/Business,Website/Source,Business Details,Location,Logistics,Status/Tags\n';
      filteredProductSpecResults.forEach((r) => {
        csvContent += `"${r.product.replace(/"/g, '""')}","${r.specs.replace(/"/g, '""')}","${r.sellingPrice || r.price}","${r.mrp || ''}","${r.offerPrice || ''}","${r.discountPercent || 0}%","${r.b2bPricing?.wholesalePrice || ''}","${r.b2bPricing?.bulkDiscountTier || ''}","${r.b2bPricing?.moq || ''}","${(r.b2bPricing?.b2bStrategy || '').replace(/"/g, '""')}","${(r.b2bPricing?.paymentTerms || '').replace(/"/g, '""')}","${searchCoverage.coveragePerimeter.replace(/"/g, '""')}","${searchCoverage.areasSearchedCount} Regional Hubs","${searchCoverage.searchRemarks.replace(/"/g, '""')}","${r.sellerBusiness.replace(/"/g, '""')}","${r.websiteSource}","${r.businessDetails.replace(/"/g, '""')}","${r.location}","${r.logistics.replace(/"/g, '""')}","${r.statusTag}"\n`;
      });
    } else {
      csvContent += 'Business Name,Category,Products/Services,B2B Wholesale Price,Bulk Discount Tier,MOQ,B2B Selling Strategy,Payment Terms,Search Range & Perimeter,Areas Probed Count,Background Works Remarks,Website,Phone,Email,Address,Lat/Long,Business Status,Verification Status\n';
      filteredProductSellerResults.forEach((s) => {
        csvContent += `"${s.businessName.replace(/"/g, '""')}","${s.category.replace(/"/g, '""')}","${s.productsServices.replace(/"/g, '""')}","${s.b2bPricing?.wholesalePrice || ''}","${s.b2bPricing?.bulkDiscountTier || ''}","${s.b2bPricing?.moq || ''}","${(s.b2bPricing?.b2bStrategy || '').replace(/"/g, '""')}","${(s.b2bPricing?.paymentTerms || '').replace(/"/g, '""')}","${searchCoverage.coveragePerimeter.replace(/"/g, '""')}","${searchCoverage.areasSearchedCount} Regional Hubs","${searchCoverage.searchRemarks.replace(/"/g, '""')}","${s.website}","${s.phone}","${s.email}","${s.address.replace(/"/g, '""')}","${s.latitude}, ${s.longitude}","${s.businessStatus}","${s.verificationStatus}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `product_enrichment_${productViewMode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Profiles
  const filteredProfiles = savedProfiles.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesMark = selectedMark === 'all' || p.mark === selectedMark;
    const matchesRating = selectedRating === 0 || p.rating >= selectedRating;
    const matchesList = selectedListName === 'all' || p.listName === selectedListName;
    const matchesOrigin = selectedOrigin === 'all' || (p.sourceOrigin || 'domain_crawler') === selectedOrigin;

    return matchesSearch && matchesCategory && matchesMark && matchesRating && matchesList && matchesOrigin;
  });

  const uniqueCategories = Array.from(new Set(savedProfiles.map((p) => p.category))).filter(Boolean);
  const uniqueLists = Array.from(new Set(savedProfiles.map((p) => p.listName))).filter(Boolean);

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Navigation — Squarespace-Grade Mega Navigation */}
      <header className="border-b border-white/[0.07] bg-[rgba(8,11,24,0.85)] backdrop-blur-2xl sticky top-0 z-50">
        <div className="page-shell h-[62px] flex items-center justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-400 p-[1.2px] shadow-md shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-[0.14em] text-[13px] bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  ENRICHER.AI
                </span>
                <span className="hidden xl:inline-flex px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  ZERO-API COST
                </span>
              </div>
              <p className="hidden 2xl:block text-[10px] leading-none text-slate-400 mt-0.5 truncate">Proprietary autonomous scrapers • Technographics • BYOK RevOps</p>
            </div>
          </div>

          {/* Squarespace Mega-Nav Menu Links (Hover opens large content panels) */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-slate-300">
            {/* Nav 1: Scrapers & Actors */}
            <div
              className="py-4 cursor-pointer"
              onMouseEnter={() => handleMegaMenuEnter('scrapers')}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                type="button"
                className={`mega-nav-item inline-flex items-center gap-1.5 transition ${hoveredMegaMenu === 'scrapers' || activeTab === 'actors' ? 'text-white active' : 'text-slate-300 hover:text-white'}`}
                onClick={() => { setActiveTab('actors'); setHoveredMegaMenu(null); }}
              >
                <span>Scrapers & Actors</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-violet-500/25 text-violet-300 border border-violet-500/30">NEW</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hoveredMegaMenu === 'scrapers' ? 'rotate-180 text-violet-400' : 'text-slate-500'}`} />
              </button>
            </div>

            {/* Nav 2: B2B Sourcing */}
            <div
              className="py-4 cursor-pointer"
              onMouseEnter={() => handleMegaMenuEnter('b2b')}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                type="button"
                className={`mega-nav-item inline-flex items-center gap-1.5 transition ${hoveredMegaMenu === 'b2b' || activeTab === 'products' ? 'text-white active' : 'text-slate-300 hover:text-white'}`}
                onClick={() => { setActiveTab('products'); setHoveredMegaMenu(null); }}
              >
                <span>B2B Sourcing</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hoveredMegaMenu === 'b2b' ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`} />
              </button>
            </div>

            {/* Nav 3: AI & Automation */}
            <div
              className="py-4 cursor-pointer"
              onMouseEnter={() => handleMegaMenuEnter('ai')}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                type="button"
                className={`mega-nav-item inline-flex items-center gap-1.5 transition ${hoveredMegaMenu === 'ai' || activeTab === 'byok' ? 'text-white active' : 'text-slate-300 hover:text-white'}`}
                onClick={() => { setActiveTab('byok'); setHoveredMegaMenu(null); }}
              >
                <span>AI & Automation</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hoveredMegaMenu === 'ai' ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`} />
              </button>
            </div>

            {/* Nav 4: Lead Dossier */}
            <div
              className="py-4 cursor-pointer"
              onMouseEnter={() => handleMegaMenuEnter('dossier')}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                type="button"
                className={`mega-nav-item inline-flex items-center gap-1.5 transition ${hoveredMegaMenu === 'dossier' || activeTab === 'saved' ? 'text-white active' : 'text-slate-300 hover:text-white'}`}
                onClick={() => { setActiveTab('saved'); setHoveredMegaMenu(null); }}
              >
                <span>Lead Dossier</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono rounded-full bg-cyan-500/20 text-cyan-300">{savedProfiles.length}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hoveredMegaMenu === 'dossier' ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
              </button>
            </div>
          </nav>

          {/* Engine Status + Fast Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono text-emerald-300">Stealth</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono text-[11px]">{workerStatus === 'active' ? 'BullMQ Active' : 'Idle'}</span>
            </div>

            <button
              onClick={() => setActiveTab('actors')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600/90 hover:bg-violet-600 text-white shadow-sm shadow-violet-500/20 transition feather-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Actor Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-slate-200 transition feather-btn"
              aria-label="Saved profiles"
            >
              <Bookmark className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden md:inline">Profiles</span>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-200 text-[11px] font-mono">{savedProfiles.length}</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Squarespace Mega Dropdown (Hover-opened large content panel) */}
        {/* ============================================================== */}
        {hoveredMegaMenu && (
          <div
            className="absolute top-[62px] left-0 right-0 bg-[rgba(8,11,24,0.96)] backdrop-blur-3xl border-b border-white/[0.10] shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-50 mega-menu-enter"
            onMouseEnter={() => {
              if (megaMenuCloseTimerRef.current) {
                clearTimeout(megaMenuCloseTimerRef.current);
                megaMenuCloseTimerRef.current = null;
              }
            }}
            onMouseLeave={handleMegaMenuLeave}
          >
            <div className="page-shell py-8">
              {/* Menu 1: Scrapers & Actors */}
              {hoveredMegaMenu === 'scrapers' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Col 1: Web & Social Scrapers */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" />
                      <span>Web & Social Actors</span>
                    </div>

                    <button
                      onClick={() => { setActiveTab('actors'); handleSelectActorType('omnichannel_360', 'nike.com'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-pink-500/10 hover:from-amber-500/20 hover:to-pink-500/20 transition flex items-start gap-3 border border-amber-500/20 hover:border-amber-500/40"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-tr from-amber-500 to-violet-600 text-white shadow-sm shrink-0">
                        <Sparkles className="w-4 h-4 text-yellow-200" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                          <span>360° Omnichannel Fusion</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">Unified Sweep</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 leading-snug">All-in-one sweep: Web content, Facebook, Meta Ads, Instagram & LinkedIn.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('actors'); handleSelectActorType('web_content', 'https://news.ycombinator.com'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 group-hover:bg-violet-500/20 shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-violet-300 flex items-center gap-1.5">
                          <span>Web Content Crawler</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300">RAG Ready</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">Extracts clean Markdown, heading hierarchy & OpenGraph metadata for LLMs.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('actors'); handleSelectActorType('instagram', 'nike'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/20 group-hover:bg-pink-500/20 shrink-0">
                        <InstagramIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-pink-300 flex items-center gap-1.5">
                          <span>Instagram Scraper</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300">Public Intel</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">Public profile bio, verified badge, followers count, recent reels & hashtags.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('actors'); handleSelectActorType('linkedin', 'stripe'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 group-hover:bg-sky-500/20 shrink-0">
                        <LinkedinIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-sky-300 flex items-center gap-1.5">
                          <span>LinkedIn Scanner</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">Enterprise</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">Company headcount size, industry classification, headquarters & specialties.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('actors'); handleSelectActorType('facebook', 'nike'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 group-hover:bg-blue-500/20 shrink-0">
                        <FacebookIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-blue-300 flex items-center gap-1.5">
                          <span>Facebook Page Intel</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">Pages & Posts</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">Public page likes, followers, verified status, contact info & video views.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('actors'); handleSelectActorType('meta_ads', 'nike'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-pink-500/20 text-pink-300 border border-pink-500/30 group-hover:bg-pink-500/30 shrink-0">
                        <MetaIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-pink-300 flex items-center gap-1.5">
                          <span>Meta Ad Library</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">FB & IG Ads</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">Active ad campaigns on FB & Instagram, creative copy, CTA & impressions.</p>
                      </div>
                    </button>
                  </div>

                  {/* Col 2: Search & Perimeter Harvesters */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Search & Directory Engines</span>
                    </div>
                    <button
                      onClick={() => { setActiveTab('maps'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 group-hover:bg-emerald-500/20 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                          <span>Google Maps Harvester</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">B2B Local</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">Scrapes local merchants, GSTIN, coordinates, phone numbers & ratings.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('live'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 group-hover:bg-cyan-500/20 shrink-0">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                          <span>Deep Domain Crawler</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Multi-Page</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">Auto-traverses Contact, About & Team pages to collect emails, phones & owner names.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('products'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 group-hover:bg-amber-500/20 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                          <span>Product & Spec Finder</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">3-Tier Matrix</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">E-commerce price extraction with 3-tier B2B wholesale pricing and MOQ.</p>
                      </div>
                    </button>
                  </div>

                  {/* Col 3: Architecture & Actor Engine */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Scraping Architecture</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>Cheerio Fast Parser</strong>: Zero-browser overhead for lightweight static parsing.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span><strong>Stealth Playwright</strong>: Headless Chromium with anti-bot evasion & JS hydration.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span><strong>Live Progress Context</strong>: Step-by-step progress bar and real-time execution logs.</span>
                      </div>
                    </div>
                  </div>

                  {/* Col 4: Squarespace-Style Featured Spotlight Card */}
                  <div className="mega-card-glow rounded-2xl bg-gradient-to-br from-violet-950/40 via-slate-900/70 to-slate-950 p-5 border border-violet-500/20 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-3">
                        FEATURED ACTOR
                      </span>
                      <h4 className="text-base font-bold text-white mb-1.5">Serverless Actor Studio</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Autonomous in-house actors with zero subscription fees. Extract markdown for RAG, harvest Instagram media, and probe LinkedIn company headcounts with live stage telemetry.
                      </p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('actors'); setHoveredMegaMenu(null); }}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition flex items-center justify-center gap-2"
                    >
                      <span>Launch Actor Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Menu 2: B2B Sourcing */}
              {hoveredMegaMenu === 'b2b' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                      Product Spec & Price Matrix
                    </div>
                    <button
                      onClick={() => { setActiveTab('products'); setProductViewMode('specs'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-emerald-300">Hardware & Specs Matrix</div>
                        <p className="text-xs text-slate-400 mt-0.5">CPU, RAM, GPU, Hz, selling prices & card offer comparisons.</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('products'); setProductViewMode('sellers'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-indigo-300">Verified B2B Suppliers Hub</div>
                        <p className="text-xs text-slate-400 mt-0.5">Wholesale tier discounts, MOQ, credit terms & logistics radius.</p>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      Regional Coverage & Presets
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs text-slate-300">
                      <div className="font-semibold text-white">1,000km Procurement Perimeter</div>
                      <p className="text-slate-400 leading-snug">36 regional procurement zones probed across eastern & national trade corridors.</p>
                      <div className="pt-1 flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px]">14 Business Templates</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px]">GSTIN Confidence</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Direct Wholesale Sourcing
                    </div>
                    <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                      <p>Eliminate intermediary markups. Our scrapers extract real wholesale pricing and procurement terms directly from vendor digital footprints.</p>
                    </div>
                  </div>

                  {/* Featured Card */}
                  <div className="mega-card-glow rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/70 to-slate-950 p-5 border border-emerald-500/20 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
                        B2B ENGINE
                      </span>
                      <h4 className="text-base font-bold text-white mb-1.5">Universal Product & Specs Finder</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Search across 100s-1000s of internet seller sites with keyword matching and perimeter filtering.
                      </p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('products'); setHoveredMegaMenu(null); }}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                    >
                      <span>Explore Sourcing Matrix</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Menu 3: AI & Automation */}
              {hoveredMegaMenu === 'ai' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                      BYOK AI Studio
                    </div>
                    <button
                      onClick={() => { setActiveTab('byok'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-indigo-300">2026 BYOK Hub</div>
                        <p className="text-xs text-slate-400 mt-0.5">Anthropic Claude 3.7, Google Gemini 3.8 Flash, OpenAI GPT-4o.</p>
                      </div>
                    </button>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300">
                      <div className="font-semibold text-white mb-1">On-Demand Token Guard</div>
                      <p className="text-slate-400">Tokens are consumed only when you explicitly click "Generate Analysis" on an entity.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
                      Asynchronous Operations
                    </div>
                    <button
                      onClick={() => { setActiveTab('queue'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 shrink-0">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-violet-300">Redis & BullMQ Pipeline</div>
                        <p className="text-xs text-slate-400 mt-0.5">Concurrency worker running background crawls with active telemetry.</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('rules'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-cyan-300">CRM Safeguards Shield</div>
                        <p className="text-xs text-slate-400 mt-0.5">Zero-overwrite protection preventing stale data overwriting verified CRM fields.</p>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Zero Middleware Privacy
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      API keys are stored strictly in client-side localStorage. No logs, no telemetry, no 3rd-party SaaS tracking your prompts or scraped datasets.
                    </p>
                  </div>

                  {/* Featured Card */}
                  <div className="mega-card-glow rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-slate-950 p-5 border border-indigo-500/20 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
                        AI ENGINE
                      </span>
                      <h4 className="text-base font-bold text-white mb-1.5">Bring Your Own Key Hub</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Synthesize verified entity dossiers into ICP fits, tech stack audits, and executive pitches with frontier AI.
                      </p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('byok'); setHoveredMegaMenu(null); }}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                    >
                      <span>Configure Keys</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Menu 4: Lead Dossier */}
              {hoveredMegaMenu === 'dossier' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      CRM Account Graph
                    </div>
                    <button
                      onClick={() => { setActiveTab('saved'); setHoveredMegaMenu(null); }}
                      className="w-full text-left group p-2.5 rounded-xl hover:bg-white/[0.05] transition flex items-start gap-3 border border-transparent hover:border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-cyan-300">Saved Lead Profiles</div>
                        <p className="text-xs text-slate-400 mt-0.5">{savedProfiles.length} verified accounts across web, maps, and social scrapers.</p>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      List & Export Options
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 space-y-1.5">
                      <div className="font-semibold text-white">Multi-Origin Filter</div>
                      <p className="text-slate-400">Isolate leads by origin: Domain Crawler, Product Spec Matrix, Google Maps, or Actor Scrapers.</p>
                      <div className="pt-1 text-[11px] text-cyan-300 font-mono">1-Click CSV & JSON Export Ready</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      CRM Sync Readiness
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Format-ready for direct upsert into HubSpot, Salesforce, and Zoho CRM with preserved field histories and contact deduplication.
                    </p>
                  </div>

                  {/* Featured Card */}
                  <div className="mega-card-glow rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/70 to-slate-950 p-5 border border-cyan-500/20 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-3">
                        REVOPS GRAPH
                      </span>
                      <h4 className="text-base font-bold text-white mb-1.5">Lead Dossier & CRM Hub</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Manage, rate, categorize, and export accounts with full search provenance and operational consistency audits.
                      </p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('saved'); setHoveredMegaMenu(null); }}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition flex items-center justify-center gap-2"
                    >
                      <span>Open Lead Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main shell — consistent gutters everywhere */}
      <div className="page-shell pt-6 sm:pt-7">
        {/* Hero KPIs — Minimal Grid, consistent card fill */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1 */}
          <div className="smart-card aurora-card p-4 sm:p-5 relative overflow-hidden lift-hover">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
              <span className="font-semibold tracking-widest uppercase">Cost Saved</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono-tight tracking-tight">
              ${moneySaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">vs ZoomInfo / Apollo $0.45/rec · Zero vendor fees</p>
          </div>

          {/* KPI 2 */}
          <div className="smart-card p-4 sm:p-5 relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
              <span className="font-semibold tracking-widest uppercase">Enriched</span>
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono-tight tracking-tight">
              {recordsProcessed.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">DOM + schema nodes parsed</p>
          </div>

          {/* KPI 3 */}
          <div className="smart-card p-4 sm:p-5 relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
              <span className="font-semibold tracking-widest uppercase">Stale Shield</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono-tight tracking-tight">0% Overwrite</div>
            <p className="text-[11px] text-slate-400 mt-1">CRM field protection active</p>
          </div>

          {/* KPI 4 */}
          <div className="smart-card p-4 sm:p-5 relative overflow-hidden lift-hover">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
              <span className="font-semibold tracking-widest uppercase">API Overhead</span>
              <Zap className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-violet-200 font-mono-tight tracking-tight">$0.00</div>
            <p className="text-[11px] text-slate-400 mt-1">Headless + cache + deduped</p>
          </div>
        </div>

        {dedicatedTool && (
          <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">Focused workspace</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {{ live: "Company enrichment", maps: "Local business discovery", products: "Product & supplier research", actors: "Web & social intelligence", saved: "Lead dossiers", byok: "AI analysis studio", rules: "Data safeguards", queue: "Research queue" }[activeTab]}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A dedicated environment with the controls, data views, and integrations for this workflow.</p>
              </div>
              <a href="/dashboard" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/[0.08] hover:text-white">
                All workspaces <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>
        )}

        {!dedicatedTool && (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('live')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition border ${activeTab === 'live' ? 'bg-white text-slate-900 border-white shadow-sm' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.10] hover:text-white'}`}
          >
            <Globe className="w-4 h-4" />
            <span>Live Domain</span>
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition border ${activeTab === 'maps' ? 'bg-white text-slate-900 border-white shadow-sm' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.10] hover:text-white'}`}
          >
            <MapPin className="w-4 h-4" />
            <span>Maps & Keywords</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition border ${activeTab === 'products' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.10] hover:text-white'}`}
          >
            <Package className="w-4 h-4" />
            <span>Product & Specs Finder</span>
          </button>

          <button
            onClick={() => setActiveTab('actors')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition border ${activeTab === 'actors' ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-500/20' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.10] hover:text-white'}`}
          >
            <Sparkles className="w-4 h-4 text-violet-300" />
            <span>Actor Studio</span>
            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full bg-violet-400/20 text-violet-200 uppercase">New</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition border ${activeTab === 'saved' ? 'bg-white text-slate-900 border-white shadow-sm' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.10] hover:text-white'}`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Profiles</span>
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-slate-900/10 text-[11px] font-mono">{savedProfiles.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('byok')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition border ${activeTab === 'byok' ? 'bg-white text-slate-900 border-white shadow-sm' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.10] hover:text-white'}`}
          >
            <Key className="w-4 h-4" />
            <span>BYOK Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition border ${activeTab === 'rules' ? 'bg-white text-slate-900 border-white shadow-sm' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.10] hover:text-white'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Safeguards</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition border ${activeTab === 'queue' ? 'bg-white text-slate-900 border-white shadow-sm' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.10] hover:text-white'}`}
          >
            <Server className="w-4 h-4" />
            <span>Queue</span>
            {(queueMetrics.waiting + queueMetrics.active) > 0 && <span className="ml-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
          </button>
        </div>
        )}

        {/* ============================================================== */}
        {/* Tab 1: Live Domain Enrichment */}
        {/* ============================================================== */}
        {activeTab === 'live' && (
          <div className="mt-6 space-y-6">
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter corporate domain (e.g. stripe.com, vercel.com, github.com, linear.app)"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnrich()}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono"
                  />
                </div>
                <button
                  onClick={() => handleEnrich()}
                  disabled={loading || !domainInput.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Stealth Crawling...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Extract & Enrich</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Preset Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                <span className="text-slate-500 font-medium">Quick Test Targets:</span>
                {[
                  { domain: 'techworldwb.com', label: 'TechWorld Computers (Electronics)' },
                  { domain: 'agromartwb.in', label: 'AgroMart WB (Agriculture)' },
                  { domain: 'maldafabrics.com', label: 'Malda Textiles (Wholesale)' },
                  { domain: 'stripe.com', label: 'Stripe (Fintech)' },
                  { domain: 'github.com', label: 'GitHub (Developer Platform)' },
                ].map((preset) => (
                  <button
                    key={preset.domain}
                    onClick={() => {
                      setDomainInput(preset.domain);
                      handleEnrich(preset.domain);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono text-[11px] border border-slate-700/70 transition flex items-center space-x-1 hover:border-cyan-500/50"
                  >
                    <span className="text-cyan-400">⚡</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Display */}
            {result && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* 10-Dimension Domain Enrichment Hero Banner */}
                <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                      {/* Category & Status Tags Bar */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30">
                          {result.category || 'Commercial Enterprise'}
                        </span>
                        {result.verification?.map((v, i) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {v}
                          </span>
                        ))}
                        {result.statusTags?.map((tag, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {tag}
                          </span>
                        ))}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Crawled 200 OK ({result.executionTimeMs}ms)
                        </span>
                      </div>

                      {/* Business Name & Website URL */}
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{result.companyName}</h2>
                        <a
                          href={result.url.startsWith('http') ? result.url : `https://${result.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-mono transition"
                        >
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{result.domain}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Description */}
                      <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
                        {result.description || 'Verified enterprise domain enriched with full commercial intelligence.'}
                      </p>
                    </div>

                    {/* Actions: Save & Direct Outbound */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 flex-shrink-0">
                      <button
                        onClick={handleSaveCurrentResult}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white transition shadow-lg shadow-cyan-950/40"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>Save to Workspace Profiles</span>
                      </button>
                      {saveSuccessMsg && (
                        <span className="text-[11px] text-emerald-400 font-mono">{saveSuccessMsg}</span>
                      )}
                    </div>
                  </div>

                  {/* 10-Dimension Structured Commercial Matrix (Grid Presentation) */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Category */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Category</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">{result.category || 'Commercial Retail & Wholesale'}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">Sector Classification</div>
                    </div>

                    {/* 2. Products / Services */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                        <Package className="w-3.5 h-3.5 text-amber-400" />
                        <span>Products / Services</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {result.productsServices && result.productsServices.length > 0 ? (
                          result.productsServices.map((prod, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono">
                              {prod}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">General Commercial Catalog</span>
                        )}
                      </div>
                    </div>

                    {/* 3. Location & Address */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>Location</span>
                      </div>
                      {result.location?.formattedAddress || result.contactInfo.addresses[0] ? (
                        <>
                          <div className="text-sm font-semibold text-slate-200 mt-1">
                            {result.location?.formattedAddress || result.contactInfo.addresses[0]}
                          </div>
                          {result.location?.city && (
                            <div className="text-[11px] text-slate-400 font-mono mt-1">
                              {`${result.location.city}${result.location.state ? `, ${result.location.state}` : ''}${result.location.country ? `, ${result.location.country}` : ''}`}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 italic mt-2">Not publicly listed (Remote / Online)</div>
                      )}
                    </div>

                    {/* 4. Geo Data (Coordinates) */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                        <Navigation className="w-3.5 h-3.5 text-teal-400" />
                        <span>Geo Data (Lat/Long)</span>
                      </div>
                      {result.geoData && result.geoData.latitude !== null && result.geoData.longitude !== null && result.geoData.latitude !== undefined && result.geoData.longitude !== undefined ? (
                        <div className="mt-1.5 space-y-1">
                          <a
                            href={`https://www.google.com/maps?q=${result.geoData?.latitude},${result.geoData?.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-teal-500/30 text-teal-300 hover:border-teal-400 text-xs font-mono transition"
                          >
                            <Navigation className="w-3 h-3 text-teal-400" />
                            <span>Lat: {result.geoData?.latitude?.toFixed(4)}, Long: {result.geoData?.longitude?.toFixed(4)}</span>
                          </a>
                          <div className="text-[10px] text-slate-400 font-mono">Verified Physical Coordinates</div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic mt-2">No physical coordinates (Remote / Online)</div>
                      )}
                    </div>
                  </div>

                  {/* Contact Info & Business Details Row */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Contact Info: Direct Phones */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Direct Phones ({result.contactInfo.phones.length})</span>
                        </span>
                      </div>
                      {result.contactInfo.phones.length > 0 ? (
                        <div className="space-y-2">
                          {result.contactInfo.phones.map((phone, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/70">
                              <div className="flex items-center space-x-1.5">
                                <Phone className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <a href={`tel:${phone}`} className="text-xs font-mono text-white hover:text-emerald-300">{phone}</a>
                              </div>
                              <div className="flex items-center gap-1">
                                <a
                                  href={getWhatsAppUrl(phone, result.companyName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 text-[10px] font-semibold border border-green-500/20 transition"
                                >
                                  WhatsApp
                                </a>
                                <button
                                  onClick={() => handleCopy(phone, `phone_${i}`)}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px] border border-slate-700 transition"
                                >
                                  {copiedField === `phone_${i}` ? '✓' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No direct public telephone line on index</p>
                      )}
                    </div>

                    {/* Contact Info: Verified Emails */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Corporate Emails ({result.contactInfo.emails.length})</span>
                        </span>
                      </div>
                      {result.contactInfo.emails.length > 0 ? (
                        <div className="space-y-2">
                          {result.contactInfo.emails.map((email, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/70">
                              <a href={`mailto:${email}`} className="text-xs font-mono text-indigo-300 hover:text-indigo-200 truncate max-w-[170px]">{email}</a>
                              <button
                                onClick={() => handleCopy(email, `email_${i}`)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px] border border-slate-700 transition"
                              >
                                {copiedField === `email_${i}` ? '✓' : 'Copy'}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No public mailto links surfaced on index</p>
                      )}
                    </div>

                    {/* Business Details & Tax Registration */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Business Details & Registration</span>
                      </div>
                      {result.businessDetails?.rawDetails || result.businessDetails?.gstin || result.businessDetails?.pan ? (
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 space-y-1.5">
                          <div className="text-xs font-bold text-white font-mono">
                            {result.businessDetails.rawDetails}
                          </div>
                          {result.businessDetails?.gstin && (
                            <div className="text-[11px] text-emerald-400 font-mono">
                              GSTIN: {result.businessDetails.gstin}
                            </div>
                          )}
                          {result.businessDetails?.pan && !result.businessDetails?.gstin && (
                            <div className="text-[11px] text-cyan-400 font-mono">
                              PAN: {result.businessDetails.pan}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {result.verification?.map((v, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 text-[10px] font-semibold">
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/50 text-xs text-slate-500 italic">
                          No public tax registration or GSTIN declared on website
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verified Social Channels */}
                  {Object.keys(result.contactInfo.socialLinks).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-800/80 items-center">
                      <span className="text-xs text-slate-400 font-medium">Verified Channels:</span>
                      {Object.entries(result.contactInfo.socialLinks).map(([network, url]) => (
                        <a
                          key={network}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-cyan-300 font-mono capitalize transition flex items-center space-x-1"
                        >
                          <span>{network}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* 10-Column Comprehensive Commercial Matrix Table */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span>Commercial Enrichment Matrix (10-Field Dimension View)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Exact standardized entity record parsed across domain, tax, spatial, and trade channels.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const csvRow = [
                          `"${result.companyName}"`,
                          `"${result.category}"`,
                          `"${result.productsServices?.join(', ') || ''}"`,
                          `"${result.url}"`,
                          `"Phone: ${result.contactInfo.phones.join('; ')} | Email: ${result.contactInfo.emails.join('; ')}"`,
                          `"${result.location?.formattedAddress || ''}"`,
                          `"${result.geoData && result.geoData.latitude !== null ? `Lat: ${result.geoData.latitude}, Long: ${result.geoData.longitude}` : ''}"`,
                          `"${result.businessDetails?.rawDetails || ''}"`,
                          `"${result.verification?.join(', ') || ''}"`,
                          `"${result.statusTags?.join(', ') || ''}"`,
                        ].join(',');
                        const csvContent = 'Domain/Business,Category,Products/Services,Website,Contact Info,Location,Geo Data,Business Details,Verification,Status Tags\n' + csvRow;
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${result.domain}_enrichment_matrix.csv`;
                        a.click();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Matrix CSV</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                          <th className="p-3 font-semibold min-w-[160px]">Domain/Business</th>
                          <th className="p-3 font-semibold min-w-[130px]">Category</th>
                          <th className="p-3 font-semibold min-w-[180px]">Products/Services</th>
                          <th className="p-3 font-semibold min-w-[140px]">Website</th>
                          <th className="p-3 font-semibold min-w-[200px]">Contact Info</th>
                          <th className="p-3 font-semibold min-w-[160px]">Location</th>
                          <th className="p-3 font-semibold min-w-[140px]">Geo Data</th>
                          <th className="p-3 font-semibold min-w-[180px]">Business Details</th>
                          <th className="p-3 font-semibold min-w-[140px]">Verification</th>
                          <th className="p-3 font-semibold min-w-[130px]">Status Tags</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        <tr className="hover:bg-slate-900/40 transition">
                          {/* Domain/Business */}
                          <td className="p-3 align-top">
                            <div className="font-bold text-white text-sm">{result.companyName}</div>
                            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">{result.domain}</div>
                          </td>

                          {/* Category */}
                          <td className="p-3 align-top font-medium text-slate-200">
                            <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20 text-[11px]">
                              {result.category || 'Commercial'}
                            </span>
                          </td>

                          {/* Products/Services */}
                          <td className="p-3 align-top">
                            <div className="text-slate-300 text-xs leading-relaxed">
                              {result.productsServices?.join(', ') || 'Wholesale Products & Commercial Sourcing'}
                            </div>
                          </td>

                          {/* Website */}
                          <td className="p-3 align-top font-mono text-xs">
                            <a
                              href={result.url.startsWith('http') ? result.url : `https://${result.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center space-x-1"
                            >
                              <span className="truncate max-w-[120px]">{result.domain}</span>
                              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            </a>
                          </td>

                          {/* Contact Info */}
                          <td className="p-3 align-top space-y-1 font-mono text-[11px]">
                            {result.contactInfo.phones[0] && (
                              <div className="text-emerald-400 flex items-center space-x-1">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span>{result.contactInfo.phones[0]}</span>
                              </div>
                            )}
                            {result.contactInfo.emails[0] && (
                              <div className="text-indigo-300 flex items-center space-x-1 truncate max-w-[180px]">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{result.contactInfo.emails[0]}</span>
                              </div>
                            )}
                          </td>

                          {/* Location */}
                          <td className="p-3 align-top text-xs text-slate-300">
                            {result.location?.formattedAddress || result.contactInfo.addresses[0] ? (
                              <div className="flex items-start space-x-1">
                                <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                                <span>{result.location?.formattedAddress || result.contactInfo.addresses[0]}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">—</span>
                            )}
                          </td>

                          {/* Geo Data */}
                          <td className="p-3 align-top font-mono text-[11px] whitespace-nowrap">
                            {result.geoData && result.geoData.latitude != null && result.geoData.longitude != null ? (
                              <a
                                href={`https://www.google.com/maps?q=${result.geoData?.latitude},${result.geoData?.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-800/40 hover:border-cyan-400 inline-flex items-center space-x-1"
                              >
                                <Navigation className="w-2.5 h-2.5 text-cyan-400" />
                                <span>Lat: {result.geoData?.latitude?.toFixed(4)}, Long: {result.geoData?.longitude?.toFixed(4)}</span>
                              </a>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          {/* Business Details */}
                          <td className="p-3 align-top font-mono text-[11px]">
                            {result.businessDetails?.rawDetails ? (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                                {result.businessDetails.rawDetails}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">—</span>
                            )}
                          </td>

                          {/* Verification */}
                          <td className="p-3 align-top">
                            <div className="flex flex-wrap gap-1">
                              {result.verification && result.verification.length > 0 ? (
                                result.verification.map((v, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 whitespace-nowrap">
                                    {v}
                                  </span>
                                ))
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] border border-slate-700 whitespace-nowrap">
                                  Unverified
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status Tags */}
                          <td className="p-3 align-top">
                            <div className="flex flex-wrap gap-1">
                              {result.statusTags && result.statusTags.length > 0 ? (
                                result.statusTags.map((tag, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-mono border border-indigo-500/20 whitespace-nowrap">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500 italic">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Technographic Stack Scanner & BYOK AI Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">

                    {/* Technographic Stack Scanner */}
                    <div className="glass-panel p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-base font-bold text-white">Technographic Fingerprint</h3>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {result.technographics.technologies.length} Technologies Detected
                        </span>
                      </div>

                      {result.technographics.technologies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.technographics.technologies.map((tech, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center space-x-2"
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span className="text-xs font-semibold text-slate-200">{tech.name}</span>
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                {tech.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Standard static footprint or non-CDN asset signatures.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Col: BYOK AI Insights — on-demand, no auto-fire */}
                  <div className="space-y-6">
                    <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden">
                      {/* Subtle glow behind card */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-sm font-bold text-white">BYOK AI Synthesis</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            {selectedProvider}
                          </span>
                          {aiAnalysis && (
                            <button
                              onClick={() => { setAiAnalysis(null); }}
                              className="text-[10px] text-slate-500 hover:text-rose-400 transition font-mono"
                              title="Clear result"
                            >
                              ✕ Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {aiAnalysis ? (
                        /* ── RESULTS ── */
                        <div className="space-y-4 relative z-10">
                          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40">
                            <div className="text-xs text-indigo-300 font-medium">Buyer Propensity Score</div>
                            <div className="flex items-end space-x-2 mt-1">
                              <span className="text-3xl font-black text-white font-mono">{aiAnalysis.buyerIntentScore}</span>
                              <span className="text-xs text-slate-400 pb-1">/ 100</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                                style={{ width: `${aiAnalysis.buyerIntentScore}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-slate-400">ICP Classification:</span>
                            <p className="text-sm font-semibold text-emerald-400 mt-0.5">{aiAnalysis.icpFit}</p>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-slate-400">Executive Summary:</span>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{aiAnalysis.summary}</p>
                          </div>

                          {aiAnalysis.icebreakers && aiAnalysis.icebreakers.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold text-slate-400">Cold Outreach Icebreakers:</span>
                              <ul className="mt-1 space-y-1.5">
                                {aiAnalysis.icebreakers.map((ice: string, i: number) => (
                                  <li key={i} className="text-[11px] text-indigo-200 bg-indigo-950/30 p-2 rounded border border-indigo-800/30">
                                    {ice}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Re-generate button */}
                          <button
                            onClick={handleGenerateAI}
                            disabled={aiLoading}
                            className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition disabled:opacity-50"
                          >
                            {aiLoading ? (
                              <><span className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />Regenerating…</>
                            ) : (
                              <><Sparkles className="w-3.5 h-3.5" />Regenerate Analysis</>
                            )}
                          </button>
                        </div>
                      ) : aiLoading ? (
                        /* ── LOADING STATE ── */
                        <div className="flex flex-col items-center justify-center py-10 gap-3 relative z-10">
                          <div className="w-10 h-10 rounded-full border-[3px] border-indigo-500 border-t-transparent animate-spin" />
                          <p className="text-xs text-indigo-300 font-semibold animate-pulse">Running AI synthesis…</p>
                          <p className="text-[11px] text-slate-500">Scoring ICP fit, intent signals & icebreakers</p>
                        </div>
                      ) : apiKey ? (
                        /* ── READY — SHOW GENERATE BUTTON ── */
                        <div className="flex flex-col items-center justify-center py-8 gap-4 relative z-10">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-indigo-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-white">AI Analysis Ready</p>
                            <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] leading-snug">
                              Generates buyer intent score, ICP fit, executive summary & icebreakers using your {selectedProvider} key.
                            </p>
                          </div>
                          <button
                            id="btn-generate-ai"
                            onClick={handleGenerateAI}
                            disabled={!result}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Sparkles className="w-4 h-4" />
                            Generate Analysis
                          </button>
                          {!result && (
                            <p className="text-[11px] text-slate-500">Enrich a domain first to enable AI analysis</p>
                          )}
                        </div>
                      ) : (
                        /* ── NO KEY — PROMPT TO CONFIGURE ── */
                        <div className="text-center py-8 relative z-10">
                          <Key className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                          <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Add your API Key in BYOK Hub to unlock on-demand AI synthesis.</p>
                          <button
                            onClick={() => setActiveTab('byok')}
                            className="mt-3 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                          >
                            Configure BYOK Key
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* Tab: Google Maps & Comma-Separated Keyword Deep Scraper */}
        {/* ============================================================== */}
        {activeTab === 'maps' && (
          <div className="mt-6 space-y-6">
            {/* Search & Control Panel */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <span>Google Maps Enterprise Sourcing Engine</span>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                        ENRICHER Core • 100K+ Scalable
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Extract places, 35+ verified fields, opening hours, ratings distribution, and chained contacts at zero API cost.
                    </p>
                  </div>
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-700/80 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMapsMode('places')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      mapsMode === 'places'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Local Business Places</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapsMode('keywords')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      mapsMode === 'keywords'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Hardware Specs Sourcing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapsMode('serp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      mapsMode === 'serp'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Search (SERP) Intelligence</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScraperConsole(!showScraperConsole)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      showScraperConsole || mapsLoading || serpLoading
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Live Console</span>
                    {(mapsLoading || serpLoading) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mode 1: Local Business Places (ENRICHER Core Enterprise) */}
              {mapsMode === 'places' && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Search Term / Category */}
                    <div className="md:col-span-5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Business Category or Search Query
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Coffee Shops & Cafes, Italian Restaurants, Dentists, Auto Repair"
                          value={mapsQueryInput}
                          onChange={(e) => setMapsQueryInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleMapsScrape()}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    {/* Location / Region */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        City / Location
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Austin, TX, London, Bangalore, Brooklyn"
                          value={mapsLocation}
                          onChange={(e) => setMapsLocation(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleMapsScrape()}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    {/* Spatial Search Radius */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Radius (Tiling)
                      </label>
                      <select
                        value={mapsRadiusKm}
                        onChange={(e) => setMapsRadiusKm(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                      >
                        <option value={5}>5 km (Core Center)</option>
                        <option value={10}>10 km (Urban Metro)</option>
                        <option value={25}>25 km (Greater Area)</option>
                        <option value={50}>50 km (Regional)</option>
                      </select>
                    </div>

                    {/* Max Places Count */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Harvest Scale
                      </label>
                      <select
                        value={mapsMaxResults}
                        onChange={(e) => setMapsMaxResults(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                      >
                        <option value={10}>10 Places (Fast Recon)</option>
                        <option value={20}>20 Places (Standard)</option>
                        <option value={40}>40 Places (Grid Tile)</option>
                        <option value={60}>60 Places (Multi-Tile)</option>
                        <option value={100}>100 Places (Full Matrix)</option>
                      </select>
                    </div>
                  </div>

                  {/* Enrich Websites Checkbox & Options */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapsEnrichWebsites}
                        onChange={(e) => setMapsEnrichWebsites(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                        id="enrichWebsiteCheckPlaces"
                      />
                      <span className="text-xs text-slate-300">
                        Auto-probe discovered business websites for direct emails, phones & social profiles ($0.00 stealth)
                      </span>
                    </label>

                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 px-2.5 py-0.5 rounded border border-emerald-800/40">
                      ⚡ Quadtree Geo-Tiling Active
                    </span>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-500 font-mono text-[11px] uppercase">Curated Scenarios:</span>
                    {[
                      { label: '☕ Specialty Coffee', query: 'Coffee Shops & Specialty Roasters', loc: 'Austin, TX' },
                      { label: '🍕 Italian Restaurants', query: 'Italian Restaurants & Pizzerias', loc: 'Staten Island, NY' },
                      { label: '🦷 Dental Clinics', query: 'Dentists & Dental Clinics', loc: 'Brooklyn, NY' },
                      { label: '🚗 Auto Repair', query: 'Auto Repair & Mechanics', loc: 'Chicago, IL' },
                      { label: '💻 Tech Agencies', query: 'Software & Digital Agencies', loc: 'London, UK' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setMapsQueryInput(preset.query);
                          setMapsLocation(preset.loc);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] transition hover:text-white"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Submit Scrape Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleMapsScrape}
                      disabled={mapsLoading || !mapsQueryInput.trim()}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    >
                      {mapsLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Executing Spatial Geo-Grid Sweep...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Scrape Google Maps Places</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Mode 2: Hardware Specs & Comma-separated Keywords */}
              {mapsMode === 'keywords' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Hardware Specs & Components (Separated by Commas)
                      </label>
                      <span className="text-[10px] text-amber-400 font-mono">Component Spec Matrix Active</span>
                    </div>
                    <div className="relative">
                      <Cpu className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 16gb ram, i5, rtx3050, 144hz display, under 1 lakh"
                        value={mapsKeywordsInput}
                        onChange={(e) => setMapsKeywordsInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMapsScrape()}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Quick Hardware Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase mr-0.5">Presets:</span>
                      {[
                        { label: '🎮 Mid-Range Gaming (i5 + RTX 3050)', val: '16gb ram, i5, rtx3050, 144hz display, under 1 lakh' },
                        { label: '🚀 Creator Workstation (i7 + RTX 4070)', val: '32gb ddr5, i7 13700h, rtx4070, 1tb nvme ssd, under 1.8 lakh' },
                        { label: '💼 Productivity Laptop (i5)', val: '16gb ram, i5 12th gen, 512gb ssd, fhd ips, under 55000' },
                        { label: '🖥️ Custom Desktop Rig (Ryzen 7)', val: 'ryzen 7 7800x3d, rtx4070 ti super, 32gb ddr5, 850w psu' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setMapsKeywordsInput(preset.val)}
                          className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700/60 hover:text-white transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Parsed Hardware Component Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-[11px] text-slate-500 py-0.5 mr-1 font-mono">Parsed Components:</span>
                      {mapsKeywordsInput
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((kw, i) => {
                          const lkw = kw.toLowerCase();
                          let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                          let prefix = '⚙️';
                          if (/\b(i[3579]|core|ryzen|xeon)\b/i.test(lkw)) {
                            badgeStyle = 'bg-blue-500/15 border-blue-500/40 text-blue-300';
                            prefix = '💻 CPU:';
                          } else if (/\b(rtx|gtx|radeon|gpu|graphics)\b/i.test(lkw)) {
                            badgeStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
                            prefix = '🎮 GPU:';
                          } else if (/\b(ram|ddr|memory)\b/i.test(lkw) || /\d+\s*gb\b/i.test(lkw)) {
                            badgeStyle = 'bg-purple-500/15 border-purple-500/40 text-purple-300';
                            prefix = '🧠 RAM:';
                          } else if (/\b(hz|display|screen|oled|ips)\b/i.test(lkw)) {
                            badgeStyle = 'bg-amber-500/15 border-amber-500/40 text-amber-300';
                            prefix = '🖥️ Display:';
                          } else if (/\b(ssd|nvme|hdd|tb)\b/i.test(lkw)) {
                            badgeStyle = 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300';
                            prefix = '💾 Storage:';
                          } else if (/\b(under|budget|lakh|below|\$|₹)\b/i.test(lkw)) {
                            badgeStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-300';
                            prefix = '💰 Budget:';
                          }
                          return (
                            <span
                              key={i}
                              className={`px-2 py-0.5 border rounded-md text-[11px] font-mono flex items-center gap-1 ${badgeStyle}`}
                            >
                              <span className="opacity-75">{prefix}</span>
                              <span className="font-semibold">{kw}</span>
                            </span>
                          );
                        })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Location / Region
                        </label>
                        <div className="flex gap-1 text-[9px] text-slate-400">
                          {['Austin, TX', 'Bangalore', 'New York'].map((city) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => setMapsLocation(city)}
                              className="hover:text-amber-400 underline font-mono"
                            >
                              {city.split(',')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore, Austin, London, Mumbai"
                        value={mapsLocation}
                        onChange={(e) => setMapsLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Max Results
                      </label>
                      <select
                        value={mapsMaxResults}
                        onChange={(e) => setMapsMaxResults(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      >
                        <option value={5}>5 Listings</option>
                        <option value={10}>10 Listings</option>
                        <option value={15}>15 Listings</option>
                        <option value={20}>20 Listings</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Deep Website Probe
                      </label>
                      <div className="flex items-center space-x-2 h-[38px] px-3.5 bg-slate-900 border border-slate-700 rounded-xl">
                        <input
                          type="checkbox"
                          checked={mapsEnrichWebsites}
                          onChange={(e) => setMapsEnrichWebsites(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                          id="enrichWebsiteCheckKw"
                        />
                        <label htmlFor="enrichWebsiteCheckKw" className="text-xs text-slate-300 cursor-pointer">
                          Probe web for direct emails
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleMapsScrape}
                      disabled={mapsLoading || !mapsKeywordsInput.trim()}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    >
                      {mapsLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Scraping Google Maps & Multi-Sites...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Scrape & Refine Results</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Mode 3: Google SERP & Search Intelligence Engine */}
              {mapsMode === 'serp' && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Multi-Query Input */}
                    <div className="md:col-span-6">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Search Queries or Keywords (One per line)
                        </label>
                        <span className="text-[10px] text-indigo-400 font-mono">Multi-keyword parallel</span>
                      </div>
                      <textarea
                        rows={3}
                        value={serpQueriesInput}
                        onChange={(e) => setSerpQueriesInput(e.target.value)}
                        placeholder="e.g. hotels in Seattle&#10;web development agency NYC"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                      />
                    </div>

                    {/* Country & Language */}
                    <div className="md:col-span-3 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Target Country / Google Domain
                        </label>
                        <select
                          value={serpCountryCode}
                          onChange={(e) => setSerpCountryCode(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                        >
                          <option value="us">United States (google.com)</option>
                          <option value="uk">United Kingdom (google.co.uk)</option>
                          <option value="ca">Canada (google.ca)</option>
                          <option value="in">India (google.co.in)</option>
                          <option value="de">Germany (google.de)</option>
                          <option value="fr">France (google.fr)</option>
                          <option value="au">Australia (google.com.au)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Search Language
                        </label>
                        <select
                          value={serpLanguageCode}
                          onChange={(e) => setSerpLanguageCode(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                        >
                          <option value="en">English (en)</option>
                          <option value="es">Spanish (es)</option>
                          <option value="fr">French (fr)</option>
                          <option value="de">German (de)</option>
                        </select>
                      </div>
                    </div>

                    {/* Pagination & Depth */}
                    <div className="md:col-span-3 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          SERP Depth / Pages
                        </label>
                        <select
                          value={serpMaxPages}
                          onChange={(e) => setSerpMaxPages(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                        >
                          <option value={1}>Page 1 (Top 10 Results)</option>
                          <option value={2}>Pages 1-2 (Top 20 Results)</option>
                          <option value={3}>Pages 1-3 (Top 30 Results)</option>
                          <option value={5}>Pages 1-5 (Top 50 Results)</option>
                        </select>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <span className="block text-[11px] text-slate-400 font-semibold mb-1">Quick Presets:</span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { label: 'Hotels Seattle', q: 'hotels in Seattle' },
                            { label: 'Web Dev NY', q: 'web development agency New York' },
                            { label: 'Dental Brooklyn', q: 'dental clinic in Brooklyn NY' },
                          ].map((pre, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSerpQueriesInput(pre.q)}
                              className="px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/20 transition"
                            >
                              {pre.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature Checkboxes */}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serpIncludeAi}
                        onChange={(e) => setSerpIncludeAi(e.target.checked)}
                        className="w-4 h-4 accent-indigo-500 rounded"
                      />
                      <span>Google AI Overviews (GEO/AEO)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serpIncludeAds}
                        onChange={(e) => setSerpIncludeAds(e.target.checked)}
                        className="w-4 h-4 accent-indigo-500 rounded"
                      />
                      <span>Paid PPC Ads Extraction</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serpIncludePaa}
                        onChange={(e) => setSerpIncludePaa(e.target.checked)}
                        className="w-4 h-4 accent-indigo-500 rounded"
                      />
                      <span>People Also Ask (PAA)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serpEnrichLeads}
                        onChange={(e) => setSerpEnrichLeads(e.target.checked)}
                        className="w-4 h-4 accent-indigo-500 rounded"
                      />
                      <span>Chained Business Leads & Verified Emails</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRunSerpScrape}
                      disabled={serpLoading || !serpQueriesInput.trim()}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    >
                      {serpLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Scraping Google SERP, AI Overviews & Leads...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Run Search Intelligence Engine</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* Real-time Scraper Activity Console (Streaming Playwright Logs) */}
            {/* ============================================================== */}
            {(showScraperConsole || mapsLoading || serpLoading) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Scraper Activity Console</span>
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setAutoScrollLogs(!autoScrollLogs)}
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded border transition ${
                        autoScrollLogs
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Auto-scroll: {autoScrollLogs ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setScraperLogs([])}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition"
                    >
                      Clear
                    </button>
                    <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Live Stream</span>
                    </div>
                  </div>
                </div>

                {/* macOS styled Terminal Window */}
                <div className="rounded-2xl border border-slate-800 bg-[#090d16] shadow-2xl overflow-hidden flex flex-col h-[340px]">
                  {/* Window Bar */}
                  <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                      <span className="ml-2 font-mono text-[11px] text-slate-400">
                        {mapsMode === 'serp' ? 'serp-intelligence-worker.log' : 'google-maps-worker-engine.log'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Playwright Stealth</span>
                      <span>•</span>
                      <span className="text-emerald-400">DNS MX Telemetry</span>
                    </div>
                  </div>

                  {/* Terminal Log Output */}
                  <div className="p-4 font-mono text-[11px] space-y-2 overflow-y-auto flex-1 leading-relaxed">
                    <div className="text-slate-500">
                      [System] BullMQ Redis Queue initialized. Concurrency cap: 3 slots.
                    </div>

                    {scraperLogs.length > 0 ? (
                      [...scraperLogs].reverse().map((log: any, idx: number) => {
                        const isSuccess = log.message?.includes('Completed') || log.message?.includes('complete') || log.type === 'success' || log.message?.startsWith('✓');
                        const isError = log.type === 'error' || log.message?.includes('Failed') || log.message?.includes('Error');
                        const isInspect = log.domain === 'places-inspector' || log.message?.includes('detail inspector') || log.message?.includes('Captured');
                        const isMail = log.domain === 'email-harvester' || log.domain === 'leads-harvester' || log.domain === 'dns-mx';

                        let badgeClass = 'bg-slate-800 text-slate-300';
                        if (log.domain === 'google-maps') badgeClass = 'bg-amber-950/90 text-amber-300 border border-amber-800/50';
                        else if (log.domain === 'geo-grid') badgeClass = 'bg-sky-950/90 text-sky-300 border border-sky-800/50';
                        else if (log.domain === 'places-inspector') badgeClass = 'bg-purple-950/90 text-purple-300 border border-purple-800/50';
                        else if (log.domain === 'serp-engine') badgeClass = 'bg-indigo-950/90 text-indigo-300 border border-indigo-800/50';
                        else if (log.domain === 'email-harvester' || log.domain === 'leads-harvester') badgeClass = 'bg-cyan-950/90 text-cyan-300 border border-cyan-800/50';
                        else if (log.domain === 'dns-mx') badgeClass = 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/50';
                        else if (log.domain === 'playwright') badgeClass = 'bg-violet-950/90 text-violet-300 border border-violet-800/50';

                        return (
                          <div key={log.id || idx} className="flex items-start space-x-2">
                            <span className="text-slate-600 flex-shrink-0">
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'now'}
                            </span>
                            <span className={`flex-shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold ${badgeClass}`}>
                              {log.domain || 'system'}
                            </span>
                            <span
                              className={`break-all ${
                                isSuccess
                                  ? 'text-emerald-400 font-semibold'
                                  : isError
                                  ? 'text-rose-400 font-semibold'
                                  : isInspect
                                  ? 'text-purple-300'
                                  : isMail
                                  ? 'text-cyan-300'
                                  : 'text-slate-300'
                              }`}
                            >
                              {log.message}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-600 italic">No activity logs recorded yet. Run a search to view streaming telemetry.</div>
                    )}
                    {(mapsLoading || serpLoading) && (
                      <div className="flex items-center space-x-2 text-emerald-400 pt-1 font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Playwright engine executing task in background...</span>
                        <span className="inline-block w-2 h-3.5 bg-emerald-400 ml-1 animate-pulse" />
                      </div>
                    )}
                    <div ref={logsTerminalEndRef} />
                  </div>

                  {/* Terminal Footer Status Bar */}
                  <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <Activity className="w-3.5 h-3.5 animate-pulse" />
                      <span className="font-mono text-[11px] text-slate-400">
                        {mapsLoading || serpLoading ? 'Streaming real-time Playwright stdout' : 'Auto-polling engine every 800ms'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
                      <span>buffer: {scraperLogs.length} events</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* ENRICHER Core Multi-View Data Studio (When Enterprise Places Scraped) */}
            {/* ============================================================== */}
            {mapsEnterprisePlaces.length > 0 && (
              <div className="space-y-4">
                {/* Telemetry Header Bar */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      <span>Output: {mapsEnterprisePlaces.length} Places</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 font-mono border border-slate-800">
                      Query: {mapsReport?.query?.searchQuery || mapsQueryInput} • {mapsReport?.query?.location || mapsLocation}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 font-mono border border-slate-800">
                      Tiles: {mapsReport?.query?.tilesSearched || 1} • Radius: {mapsReport?.query?.radiusKm || mapsRadiusKm}km
                    </span>
                    {mapsReport?.executionTimeMs && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-400 font-mono border border-emerald-800/40">
                        ⚡ {(mapsReport.executionTimeMs / 1000).toFixed(1)}s Execution
                      </span>
                    )}
                    {selectedEnterprisePlaces.length > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                        {selectedEnterprisePlaces.length} Selected
                      </span>
                    )}
                  </div>

                  {/* Export & Bulk Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEnterprisePlacesToCRM}
                      className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-md shadow-violet-600/20"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save to CRM ({selectedEnterprisePlaces.length || mapsEnterprisePlaces.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportEnterpriseCSV}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportInstantlyCSV}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-emerald-600/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Instantly / Smartlead CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportEnterpriseJSON}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 border border-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Multi-View Switcher Tabs */}
                <div className="glass-panel p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto border border-white/[0.08]">
                  {[
                    { id: 'overview', label: 'Overview', icon: Building2 },
                    { id: 'contacts', label: 'Contact info', icon: Mail },
                    { id: 'social', label: 'Social media', icon: Share2 },
                    { id: 'ratings', label: 'Rating & Hours', icon: Star },
                    { id: 'leads', label: 'Leads Enrichment', icon: Users },
                    { id: 'map', label: 'Interactive Map', icon: MapPin },
                    { id: 'json', label: 'All fields (JSON)', icon: Code },
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMapsActiveViewTab(tab.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                          mapsActiveViewTab === tab.id
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View 1: Overview Tab Table */}
                {mapsActiveViewTab === 'overview' && (
                  <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/30">
                    <div className="overflow-x-auto max-h-[75vh]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                            <th className="p-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedEnterprisePlaces.length === mapsEnterprisePlaces.length && mapsEnterprisePlaces.length > 0}
                                onChange={handleToggleSelectAllEnterprisePlaces}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                              />
                            </th>
                            <th className="p-3 font-semibold min-w-[50px]">#</th>
                            <th className="p-3 font-semibold min-w-[220px]">Place Name (Title)</th>
                            <th className="p-3 font-semibold min-w-[120px]">Total Score</th>
                            <th className="p-3 font-semibold min-w-[100px]">Reviews</th>
                            <th className="p-3 font-semibold min-w-[80px]">Price</th>
                            <th className="p-3 font-semibold min-w-[180px]">Street</th>
                            <th className="p-3 font-semibold min-w-[120px]">City</th>
                            <th className="p-3 font-semibold min-w-[80px]">State</th>
                            <th className="p-3 font-semibold min-w-[140px]">Website</th>
                            <th className="p-3 font-semibold min-w-[140px]">Phone</th>
                            <th className="p-3 font-semibold min-w-[190px]">Verified Email</th>
                            <th className="p-3 font-semibold min-w-[120px]">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {mapsEnterprisePlaces.map((place, idx) => (
                            <tr key={place.placeId || idx} className="hover:bg-slate-800/40 transition">
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedEnterprisePlaces.includes(place.placeId)}
                                  onChange={() => handleToggleEnterprisePlaceSelect(place.placeId)}
                                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                />
                              </td>
                              <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                              <td className="p-3 font-semibold text-white">
                                <div className="flex items-start gap-2">
                                  {place.imageUrl && (
                                    <img
                                      src={place.imageUrl}
                                      alt={place.title}
                                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
                                    />
                                  )}
                                  <div>
                                    <a
                                      href={place.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-amber-300 transition flex items-center gap-1"
                                    >
                                      <span>{place.title}</span>
                                      <ExternalLink className="w-3 h-3 text-slate-500 inline" />
                                    </a>
                                    <div className="text-[11px] text-slate-400 font-normal mt-0.5 font-mono">
                                      {place.categoryName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 font-mono">
                                  ★ {place.totalScore ? place.totalScore.toFixed(1) : 'N/A'}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-300">
                                {place.reviewsCount ? place.reviewsCount.toLocaleString() : '0'}
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-400">
                                {place.priceBracket || '—'}
                              </td>
                              <td className="p-3 text-slate-300 truncate max-w-[180px]">
                                {place.street || place.address}
                              </td>
                              <td className="p-3 text-slate-300">{place.city || '—'}</td>
                              <td className="p-3 font-mono text-slate-400">{place.state || '—'}</td>
                              <td className="p-3">
                                {place.website ? (
                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={place.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cyan-300 hover:underline truncate max-w-[140px] block font-mono text-[11px]"
                                      title={place.website}
                                    >
                                      {place.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                    </a>
                                    <ExternalLink className="w-3 h-3 text-cyan-400/60 shrink-0" />
                                  </div>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap cursor-help"
                                    title="No website on Google Maps Profile — Prime lead for Full Stack Web Development & Digital Presence!"
                                  >
                                    ⚡ No Website (Lead)
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-mono text-[11px]">
                                {place.phone ? (
                                  <div className="space-y-0.5">
                                    <a href={`tel:${place.phone}`} className="text-slate-200 hover:text-white">
                                      {place.phone}
                                    </a>
                                    <a
                                      href={getWhatsAppUrl(place.phone, place.title)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-[9px] text-emerald-400 font-semibold hover:underline"
                                    >
                                      WhatsApp
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic">No Phone</span>
                                )}
                              </td>

                              {/* Verified Email Column */}
                              <td className="p-3 font-mono text-[11px]">
                                {place.email || place.companyContacts?.emails?.[0] ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <a
                                        href={`mailto:${place.email || place.companyContacts?.emails?.[0]}`}
                                        className="text-emerald-300 hover:underline truncate max-w-[140px] block"
                                      >
                                        {place.email || place.companyContacts?.emails?.[0]}
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const em = place.email || place.companyContacts?.emails?.[0] || '';
                                          navigator.clipboard.writeText(em);
                                          setSaveSuccessMsg(`Copied ${em}!`);
                                          setTimeout(() => setSaveSuccessMsg(null), 2000);
                                        }}
                                        className="text-slate-500 hover:text-white shrink-0"
                                        title="Copy Email"
                                      >
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {place.emailVerification?.source === 'domain_mx_verified' ? (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-sans font-medium">
                                          Domain MX Verified
                                        </span>
                                      ) : place.emailVerification?.isDeliverable ? (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-sans font-medium">
                                          ✓ Deliverable
                                        </span>
                                      ) : (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-sans">
                                          Website Direct
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic">No Email Discovered</span>
                                )}
                              </td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenPitchModal({
                                      companyName: place.title,
                                      domain: place.website,
                                      valueProposition: `Top-rated ${place.categoryName} with ${place.totalScore}★ rating across ${place.city}`,
                                      industry: place.categoryName,
                                      contactName: 'Store Manager',
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white text-[11px] font-bold shadow-md shadow-pink-500/20 transition flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Pitch</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* View 2: Contact Info Tab */}
                {mapsActiveViewTab === 'contacts' && (
                  <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/30">
                    <div className="overflow-x-auto max-h-[75vh]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                            <th className="p-3 font-semibold min-w-[200px]">Business Name</th>
                            <th className="p-3 font-semibold min-w-[160px]">Direct Emails</th>
                            <th className="p-3 font-semibold min-w-[140px]">Phone Numbers</th>
                            <th className="p-3 font-semibold min-w-[220px]">Physical Address</th>
                            <th className="p-3 font-semibold min-w-[140px]">Official Website</th>
                            <th className="p-3 font-semibold min-w-[100px]">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {mapsEnterprisePlaces.map((place, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition">
                              <td className="p-3 font-semibold text-white">
                                <div>{place.title}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{place.categoryName}</div>
                              </td>
                              <td className="p-3 font-mono">
                                {place.companyContacts?.emails && place.companyContacts.emails.length > 0 ? (
                                  <div className="space-y-1">
                                    {place.companyContacts.emails.map((em, eIdx) => (
                                      <div key={eIdx} className="flex items-center gap-1 text-emerald-300">
                                        <Mail className="w-3 h-3 text-emerald-400" />
                                        <a href={`mailto:${em}`} className="hover:underline">{em}</a>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(em);
                                            setSaveSuccessMsg(`Copied ${em}!`);
                                            setTimeout(() => setSaveSuccessMsg(null), 2000);
                                          }}
                                          className="text-slate-400 hover:text-white"
                                        >
                                          <Copy className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic">No emails discovered</span>
                                )}
                              </td>
                              <td className="p-3 font-mono">
                                {place.phone ? (
                                  <div className="space-y-1">
                                    <a href={`tel:${place.phone}`} className="text-slate-200 block hover:text-white">
                                      {place.phone}
                                    </a>
                                    <a
                                      href={getWhatsAppUrl(place.phone, place.title)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/20"
                                    >
                                      WhatsApp Chat
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic">N/A</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-300 font-mono text-[11px]">
                                {place.address}
                              </td>
                              <td className="p-3">
                                {place.website ? (
                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={place.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cyan-300 hover:underline font-mono text-[11px] block truncate max-w-[160px]"
                                      title={place.website}
                                    >
                                      {place.website}
                                    </a>
                                    <ExternalLink className="w-3 h-3 text-cyan-400/60 shrink-0" />
                                  </div>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap cursor-help"
                                    title="No website on Google Maps Profile — Prime lead for Full Stack Web Development & Digital Presence!"
                                  >
                                    ⚡ No Website (Lead)
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEnterprisePlacesToCRM()}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                                >
                                  Save CRM
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* View 3: Social Media Tab */}
                {mapsActiveViewTab === 'social' && (
                  <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/30">
                    <div className="overflow-x-auto max-h-[75vh]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                            <th className="p-3 font-semibold min-w-[200px]">Place Name</th>
                            <th className="p-3 font-semibold min-w-[140px]">Facebook</th>
                            <th className="p-3 font-semibold min-w-[140px]">Instagram</th>
                            <th className="p-3 font-semibold min-w-[140px]">LinkedIn</th>
                            <th className="p-3 font-semibold min-w-[140px]">Twitter / X</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {mapsEnterprisePlaces.map((place, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition">
                              <td className="p-3 font-semibold text-white">
                                {place.title}
                              </td>
                              <td className="p-3">
                                {place.companyContacts?.socialProfiles?.facebook ? (
                                  <a
                                    href={place.companyContacts.socialProfiles.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                                  >
                                    <FacebookIcon className="w-3.5 h-3.5" />
                                    <span>Facebook Page</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-600 italic">Not found</span>
                                )}
                              </td>
                              <td className="p-3">
                                {place.companyContacts?.socialProfiles?.instagram ? (
                                  <a
                                    href={place.companyContacts.socialProfiles.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                                  >
                                    <InstagramIcon className="w-3.5 h-3.5" />
                                    <span>Instagram</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-600 italic">Not found</span>
                                )}
                              </td>
                              <td className="p-3">
                                {place.companyContacts?.socialProfiles?.linkedin ? (
                                  <a
                                    href={place.companyContacts.socialProfiles.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                                  >
                                    <LinkedinIcon className="w-3.5 h-3.5" />
                                    <span>LinkedIn</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-600 italic">Not found</span>
                                )}
                              </td>
                              <td className="p-3">
                                {place.companyContacts?.socialProfiles?.twitter ? (
                                  <a
                                    href={place.companyContacts.socialProfiles.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-300 hover:underline font-mono text-[11px]"
                                  >
                                    Twitter / X
                                  </a>
                                ) : (
                                  <span className="text-slate-600 italic">Not found</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* View 4: Rating & Reviews Tab */}
                {mapsActiveViewTab === 'ratings' && (
                  <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/30">
                    <div className="overflow-x-auto max-h-[75vh]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                            <th className="p-3 font-semibold min-w-[200px]">Place Name</th>
                            <th className="p-3 font-semibold min-w-[100px]">Score</th>
                            <th className="p-3 font-semibold min-w-[240px]">Ratings Distribution (1★ - 5★)</th>
                            <th className="p-3 font-semibold min-w-[100px]">Reviews</th>
                            <th className="p-3 font-semibold min-w-[120px]">Open Status</th>
                            <th className="p-3 font-semibold min-w-[180px]">Weekly Hours Schedule</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {mapsEnterprisePlaces.map((place, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition">
                              <td className="p-3 font-semibold text-white">
                                {place.title}
                              </td>
                              <td className="p-3">
                                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-black font-mono border border-amber-500/20 text-sm">
                                  {place.totalScore?.toFixed(1) || 'N/A'}★
                                </span>
                              </td>
                              <td className="p-3">
                                {place.reviewsDistribution ? (
                                  <div className="space-y-1 w-48">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                                      <span>5★</span>
                                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-amber-400 h-full rounded-full"
                                          style={{ width: `${Math.min(100, (place.reviewsDistribution.fiveStar / (place.reviewsCount || 1)) * 100)}%` }}
                                        />
                                      </div>
                                      <span className="w-8 text-right">{place.reviewsDistribution.fiveStar}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                                      <span>4★</span>
                                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-amber-500/70 h-full rounded-full"
                                          style={{ width: `${Math.min(100, (place.reviewsDistribution.fourStar / (place.reviewsCount || 1)) * 100)}%` }}
                                        />
                                      </div>
                                      <span className="w-8 text-right">{place.reviewsDistribution.fourStar}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic">No distribution data</span>
                                )}
                              </td>
                              <td className="p-3 font-mono text-slate-300">
                                {place.reviewsCount?.toLocaleString()} reviews
                              </td>
                              <td className="p-3 font-mono">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${place.wasOpenAtScrapeTime ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                  {place.wasOpenAtScrapeTime ? '● Open Now' : 'Closed'}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-slate-400">
                                {place.openingHours && place.openingHours.length > 0 ? (
                                  <span>{place.openingHours[0].day}: {place.openingHours[0].hours}</span>
                                ) : (
                                  <span className="text-slate-600 italic">Standard retail hours</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* View 5: Leads Enrichment Tab */}
                {mapsActiveViewTab === 'leads' && (
                  <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/30">
                    <div className="overflow-x-auto max-h-[75vh]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                            <th className="p-3 font-semibold min-w-[200px]">Company / Place</th>
                            <th className="p-3 font-semibold min-w-[180px]">Lead Name & Title</th>
                            <th className="p-3 font-semibold min-w-[180px]">Direct Verified Email</th>
                            <th className="p-3 font-semibold min-w-[140px]">Phone Number</th>
                            <th className="p-3 font-semibold min-w-[120px]">Outreach Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {mapsEnterprisePlaces.map((place, idx) => {
                            const lead = place.businessLeads?.[0];
                            return (
                              <tr key={idx} className="hover:bg-slate-800/40 transition">
                                <td className="p-3 font-semibold text-white">
                                  <div>{place.title}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">{place.city}, {place.countryCode}</div>
                                </td>
                                <td className="p-3">
                                  {lead ? (
                                    <div>
                                      <div className="font-bold text-white">{lead.fullName}</div>
                                      <div className="text-[11px] text-slate-400 font-mono">{lead.jobTitle}</div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="font-medium text-slate-300">Store Manager / Owner</div>
                                      <div className="text-[11px] text-slate-500 font-mono">Operations Contact</div>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 font-mono">
                                  {lead?.email || place.companyContacts?.emails?.[0] ? (
                                    <div className="flex items-center gap-1 text-emerald-300">
                                      <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span>{lead?.email || place.companyContacts?.emails?.[0]}</span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">✓ ok</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-600 italic">No direct email found</span>
                                  )}
                                </td>
                                <td className="p-3 font-mono text-slate-300">
                                  {place.phone || 'N/A'}
                                </td>
                                <td className="p-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenPitchModal({
                                        companyName: place.title,
                                        domain: place.website,
                                        valueProposition: `Top local ${place.categoryName} with ${place.totalScore}★ in ${place.city}`,
                                        industry: place.categoryName,
                                        contactName: lead?.fullName || 'there',
                                      })
                                    }
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-pink-500/20 flex items-center gap-1.5"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Generate Pitch</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* View 6: Interactive Map Pin Canvas */}
                {mapsActiveViewTab === 'map' && (
                  <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-amber-400" />
                        <h4 className="font-bold text-white text-sm">Spatial Coordinate Constellation</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {mapsEnterprisePlaces.length} Geo-Coordinates Pinpointed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {mapsEnterprisePlaces.map((p, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.06] hover:border-amber-500/40 transition space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-white text-xs line-clamp-1">{p.title}</div>
                            <span className="text-[10px] font-mono text-amber-300 shrink-0 font-bold">★ {p.totalScore}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">{p.address}</div>
                          <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500 border-t border-white/[0.04]">
                            <span>Lat: {p.location.lat.toFixed(4)}, Lng: {p.location.lng.toFixed(4)}</span>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Open Map</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View 7: Raw JSON View */}
                {mapsActiveViewTab === 'json' && (
                  <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-400">Complete JSON Payload ({mapsEnterprisePlaces.length} records):</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(mapsEnterprisePlaces, null, 2));
                          setSaveSuccessMsg('Copied all JSON to clipboard!');
                          setTimeout(() => setSaveSuccessMsg(null), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(mapsEnterprisePlaces, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Legacy Mode: Keyword Matcher Results */}
            {mapsResults.length > 0 && mapsMode === 'keywords' && (
              <div className="space-y-4">
                <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-white">Refining Report:</span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800">
                      Total: {mapsReport?.originalCount || mapsResults.length}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-mono border border-emerald-800/40">
                      Cleaned: {mapsResults.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveSelectedMapItems}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-md shadow-cyan-600/20"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Selected to Profiles</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportMapsCSV}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/30">
                  <div className="overflow-x-auto max-h-[75vh]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                          <th className="p-3.5 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={selectedMapItems.length === mapsResults.length && mapsResults.length > 0}
                              onChange={handleToggleSelectAllMapItems}
                              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                          </th>
                          <th className="p-3 font-semibold min-w-[200px]">Hardware Dealer / Store</th>
                          <th className="p-3 font-semibold min-w-[130px]">Website Status</th>
                          <th className="p-3 font-semibold min-w-[220px]">Hardware Spec Compatibility</th>
                          <th className="p-3 font-semibold min-w-[180px]">Direct Phone & WhatsApp</th>
                          <th className="p-3 font-semibold min-w-[170px]">Verified Email</th>
                          <th className="p-3 font-semibold min-w-[180px]">Physical Store Address</th>
                          <th className="p-3 font-semibold min-w-[100px]">Rating</th>
                          <th className="p-3 font-semibold min-w-[130px]">Target Budget & RFQ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {mapsResults.map((item) => {
                          const isSelected = selectedMapItems.includes(item.id);
                          const hasWebsite = Boolean(item.websiteUrl && item.websiteUrl.startsWith('http'));
                          const dealerType = item.dealerType || 'Hardware Retailer';

                          return (
                            <tr key={item.id} className="hover:bg-slate-800/40 transition">
                              <td className="p-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleMapItemSelect(item.id)}
                                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                />
                              </td>
                              <td className="p-3 align-top">
                                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                  <span>{item.name}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                    {dealerType}
                                  </span>
                                  {item.category && (
                                    <span className="text-[10px] text-slate-400">
                                      • {item.category}
                                    </span>
                                  )}
                                </div>
                                {item.mapUrl && (
                                  <a
                                    href={item.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-cyan-400 hover:underline inline-flex items-center gap-0.5 mt-1"
                                  >
                                    <span>Google Maps Pin</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                {hasWebsite ? (
                                  <a
                                    href={item.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 max-w-[150px] truncate"
                                  >
                                    <Globe className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{item.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                  </a>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                      ⚡ No Website (Lead)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPitchModal({
                                        id: item.id,
                                        companyName: item.name,
                                        domain: item.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.hardware.local',
                                        description: `Local Computer Hardware Store: ${item.name}. Phone: ${item.phone || 'N/A'}. Needs professional web presence and online inventory catalog.`,
                                        category: item.category || 'Computer Hardware Store',
                                        contactInfo: {
                                          phones: item.phone ? [item.phone] : [],
                                          emails: item.email ? [item.email] : [],
                                          addresses: [item.address],
                                        },
                                      })}
                                      className="text-[10px] text-amber-400 hover:text-amber-300 underline block"
                                    >
                                      Pitch Web Services →
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold font-mono text-[10px] border border-emerald-500/30">
                                    ✓ {item.matchScore}% Match
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {item.stockStatus || 'In Stock'}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {item.itemSpecs && item.itemSpecs.map((spec, si) => (
                                    <span key={si} className="px-1.5 py-0.5 text-[9px] rounded bg-slate-800 text-slate-200 font-mono border border-slate-700">
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 align-top text-slate-300 text-xs font-mono">
                                {item.phone ? (
                                  <div className="space-y-1">
                                    <a
                                      href={`tel:${item.phone.replace(/[^\d+]/g, '')}`}
                                      className="text-cyan-400 hover:underline flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3 text-cyan-400" />
                                      <span>{item.phone}</span>
                                    </a>
                                    {item.whatsappInquiryUrl && (
                                      <a
                                        href={item.whatsappInquiryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-0.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold inline-flex items-center gap-1 transition"
                                      >
                                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                                        <span>WhatsApp RFQ</span>
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                              <td className="p-3 align-top text-slate-300 text-xs font-mono">
                                {item.email ? (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1">
                                      <Mail className="w-3 h-3 text-purple-400 shrink-0" />
                                      <span className="truncate max-w-[140px] text-purple-200">{item.email}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(item.email);
                                          setSaveSuccessMsg(`Copied email: ${item.email}`);
                                          setTimeout(() => setSaveSuccessMsg(null), 2000);
                                        }}
                                        className="text-slate-400 hover:text-white"
                                        title="Copy Email"
                                      >
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                    <a
                                      href={`mailto:${item.email}?subject=Commercial%20Hardware%20RFQ%20Inquiry&body=${encodeURIComponent(item.rfqInquiryText || `Hi ${item.name},\nWe are looking to source ${mapsKeywordsInput}. Please share your quote.`)}`}
                                      className="text-[10px] text-purple-400 hover:underline block"
                                    >
                                      Draft Email RFQ →
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                              <td className="p-3 align-top text-slate-300 text-xs max-w-[200px]">
                                <div>{item.address || <span className="text-slate-600">—</span>}</div>
                                {item.latitude !== null && item.longitude !== null && (
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                  </div>
                                )}
                              </td>

                              {/* Rating & Reviews */}
                              <td className="p-3 align-top whitespace-nowrap">
                                <div className="flex flex-col items-start gap-0.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono text-[11px] border border-amber-500/15">
                                    <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                                    {item.rating || '—'}
                                  </span>
                                  {item.reviewsCount ? (
                                    <span className="text-[9px] text-slate-500 font-mono pl-0.5">{item.reviewsCount.toLocaleString()} reviews</span>
                                  ) : null}
                                </div>
                              </td>

                              {/* Budget & Actions */}
                              <td className="p-3 align-top whitespace-nowrap">
                                <span className="font-mono text-[11px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/8 border border-emerald-500/15 block mb-1">
                                  {item.priceEstimate || '—'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const rfq = item.rfqInquiryText || `Hello ${item.name},\nWe are looking for: ${mapsKeywordsInput}.\nPlease share your best commercial quote.`;
                                    navigator.clipboard.writeText(rfq);
                                    setSaveSuccessMsg(`Copied Commercial RFQ for ${item.name}!`);
                                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 flex items-center gap-1 transition"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Copy RFQ Pitch</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* ENRICHER Core Search Intelligence Multi-View Studio (SERP)    */}
            {/* ============================================================== */}
            {serpReport && mapsMode === 'serp' && (
              <div className="space-y-4">
                {/* Telemetry Header Bar */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-violet-600/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{serpReport.summary.totalOrganicFound} Organic Results</span>
                    </span>
                    {serpReport.summary.totalPaidAdsFound > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30">
                        {serpReport.summary.totalPaidAdsFound} Sponsored Ads
                      </span>
                    )}
                    {serpReport.summary.totalAiOverviewsFound > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/30">
                        ⚡ AI Overview Captured
                      </span>
                    )}
                    {serpReport.summary.totalLeadsEnriched > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 font-mono border border-purple-500/30">
                        ✓ {serpReport.summary.totalLeadsEnriched} Verified Leads
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 font-mono border border-slate-800">
                      ⚡ {(serpReport.summary.executionTimeMs / 1000).toFixed(1)}s Runtime
                    </span>
                  </div>

                  {/* Export & Bulk Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveSerpToCRM}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save to CRM Profiles</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSerpInstantlyCSV}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Export Instantly / Smartlead CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSerpCSV}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Standard CSV</span>
                    </button>
                  </div>
                </div>

                {/* View Switcher Tabs */}
                <div className="glass-panel p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto border border-white/[0.08]">
                  {[
                    { id: 'organic', label: `Organic (${serpReport.flattenedOrganic.length})`, icon: Layers },
                    { id: 'ads', label: `Paid Ads (${serpReport.flattenedPaid.length})`, icon: DollarSign },
                    { id: 'ai', label: 'AI Overviews (GEO)', icon: Sparkles },
                    { id: 'paa', label: 'People Also Ask & Related', icon: HelpCircle },
                    { id: 'leads', label: `Business Leads (${serpReport.summary.totalLeadsEnriched})`, icon: Mail },
                    { id: 'json', label: 'All Fields (JSON)', icon: Terminal },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = serpActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSerpActiveTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View 1: Organic Results Table */}
                {serpActiveTab === 'organic' && (
                  <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/30">
                    <div className="overflow-x-auto max-h-[75vh]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-sm text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                            <th className="p-3 font-semibold min-w-[50px]">#</th>
                            <th className="p-3 font-semibold min-w-[240px]">Ranking Title</th>
                            <th className="p-3 font-semibold min-w-[200px]">URL & Breadcrumb</th>
                            <th className="p-3 font-semibold min-w-[300px]">SERP Snippet & Description</th>
                            <th className="p-3 font-semibold min-w-[180px]">Verified Lead Email</th>
                            <th className="p-3 font-semibold min-w-[100px]">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {serpReport.flattenedOrganic.map((res, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition">
                              <td className="p-3 font-mono">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-indigo-300 font-bold text-xs border border-indigo-500/20">
                                  {res.position}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-white">
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-indigo-300 transition flex items-center gap-1.5 group"
                                >
                                  <span className="group-hover:underline">{res.title}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 inline" />
                                </a>
                                {res.sitelinks && res.sitelinks.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {res.sitelinks.map((sl, sIdx) => (
                                      <a
                                        key={sIdx}
                                        href={sl.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 hover:underline border border-cyan-500/20"
                                      >
                                        {sl.title}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 font-mono text-[11px] text-slate-400">
                                <div className="truncate max-w-[190px]" title={res.displayedUrl || res.url}>
                                  {res.displayedUrl || res.url}
                                </div>
                              </td>
                              <td className="p-3 text-slate-300 text-[11px] leading-relaxed max-w-[320px]">
                                {res.description || 'No meta description provided'}
                              </td>
                              <td className="p-3 font-mono">
                                {res.leadEmail ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-emerald-300">
                                      <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <a href={`mailto:${res.leadEmail}`} className="hover:underline font-bold text-[11px]">
                                        {res.leadEmail}
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(res.leadEmail!);
                                          setSaveSuccessMsg(`Copied ${res.leadEmail}!`);
                                          setTimeout(() => setSaveSuccessMsg(null), 2000);
                                        }}
                                        className="text-slate-400 hover:text-white"
                                        title="Copy email"
                                      >
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      ✓ Deliverable (MX)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic">No email public</span>
                                )}
                              </td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenPitchModal({
                                      companyName: res.title.split(/[-–|]/)[0]?.trim() || res.title,
                                      domain: res.url,
                                      valueProposition: `Top #${res.position} organic Google search result for competitive intelligence`,
                                      industry: 'Search Ranking Competitor',
                                      contactName: 'Marketing Director',
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Pitch</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* View 2: Paid Ads (PPC) */}
                {serpActiveTab === 'ads' && (
                  <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 shadow-2xl space-y-3">
                    {serpReport.flattenedPaid.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {serpReport.flattenedPaid.map((ad, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-amber-500/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Sponsored Ad #{ad.position}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">{ad.displayedUrl}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white hover:text-amber-300 transition">
                              <a href={ad.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                <span>{ad.headline}</span>
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{ad.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm">No paid search ads were active on this query during scrape time.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* View 3: AI Overviews & GEO */}
                {serpActiveTab === 'ai' && (
                  <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 shadow-2xl space-y-4">
                    {serpReport.results.find((r) => r.aiModeResult) ? (
                      <div>
                        {serpReport.results
                          .filter((r) => r.aiModeResult)
                          .map((r, rIdx) => (
                            <div key={rIdx} className="space-y-3">
                              <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold">
                                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                                <span>Google AI Overview (GEO & AEO Intelligence)</span>
                              </div>
                              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                                {r.aiModeResult!.text}
                              </div>
                              {r.aiModeResult!.sources && r.aiModeResult!.sources.length > 0 && (
                                <div>
                                  <span className="text-xs text-slate-400 font-semibold block mb-2">
                                    AI Engine Cited Sources (Link Prospecting Targets):
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {r.aiModeResult!.sources.map((src, sIdx) => (
                                      <a
                                        key={sIdx}
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs transition block"
                                      >
                                        <div className="font-semibold text-indigo-300 truncate">{src.title}</div>
                                        <div className="text-[10px] text-slate-500 font-mono truncate">{src.domain || src.url}</div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm">No generative AI overview was triggered for this keyword query.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* View 4: People Also Ask & Related Queries */}
                {serpActiveTab === 'paa' && (
                  <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 shadow-2xl space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>People Also Ask (PAA) Questions</span>
                      </h4>
                      {serpReport.results.flatMap((r) => r.peopleAlsoAsk).length > 0 ? (
                        <div className="space-y-2">
                          {serpReport.results
                            .flatMap((r) => r.peopleAlsoAsk)
                            .map((paa, idx) => (
                              <details key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs group">
                                <summary className="font-semibold text-white cursor-pointer hover:text-indigo-300 transition list-none flex items-center justify-between">
                                  <span>{paa.question}</span>
                                  <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                {paa.answer && (
                                  <p className="mt-2 pt-2 border-t border-slate-800 text-slate-300 text-xs leading-relaxed">
                                    {paa.answer}
                                  </p>
                                )}
                              </details>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No PAA accordion was returned for this search.</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Related Search Query Fan-Out</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {serpReport.results
                          .flatMap((r) => r.relatedQueries)
                          .map((rel, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSerpQueriesInput(rel.title);
                                handleRunSerpScrape();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 text-xs font-mono border border-slate-800 transition flex items-center gap-1"
                            >
                              <span>{rel.title}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* View 5: Business Leads & Verified Emails */}
                {serpActiveTab === 'leads' && (
                  <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 shadow-2xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {serpReport.flattenedOrganic
                        .filter((r) => r.leadEmail)
                        .map((lead, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Rank #{lead.position}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 font-mono">
                                ✓ MX Verified
                              </span>
                            </div>
                            <div className="font-semibold text-white text-xs truncate">{lead.title}</div>
                            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-mono font-bold">
                              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <a href={`mailto:${lead.leadEmail}`} className="hover:underline truncate">
                                {lead.leadEmail}
                              </a>
                            </div>
                            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px]">
                              <a
                                href={lead.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:underline truncate max-w-[140px] font-mono"
                              >
                                {lead.displayedUrl || lead.url}
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPitchModal({
                                    companyName: lead.title.split(/[-–|]/)[0]?.trim() || lead.title,
                                    domain: lead.url,
                                    valueProposition: `Top #${lead.position} ranked on Google Search for ${serpQueriesInput.split('\n')[0]}`,
                                    industry: 'SERP Competitor',
                                    contactName: 'Marketing Team',
                                  })
                                }
                                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                              >
                                Pitch
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* View 6: Raw JSON Explorer */}
                {serpActiveTab === 'json' && (
                  <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 shadow-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">Complete Raw JSON Dataset</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(serpReport, null, 2));
                          setSaveSuccessMsg('Copied SERP JSON to clipboard!');
                          setTimeout(() => setSaveSuccessMsg(null), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(serpReport, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* Tab: Universal Product & Specs Finder (500km Geo-Radius)       */}
        {/* ============================================================== */}
        {activeTab === 'products' && (
          <div className="mt-6 space-y-6">
            {/* Header & Controls Panel — tech-corners + consistent shell */}
            <div className="glass-panel tech-corners p-5 sm:p-6 rounded-2xl border border-white/[0.07] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white text-slate-900 text-[11px] font-bold tracking-widest uppercase">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Internet-Wide Product & Specs Extraction Engine</span>
                  </div>
                  <h2 className="text-[22px] font-bold text-white tracking-tight mt-2 flex items-center gap-2">
                    <span>Universal Product Finder & Specs Enrichment</span>
                  </h2>
                  <p className="text-[13px] text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Keyword-matched scraping with geo-radius perimeter, taxonomy-aware spec normalisation, and B2B seller enrichment.
                  </p>
                </div>

                {/* Mode Switcher — FeatherLite */}
                <div className="flex items-center gap-2 p-1 bg-white/[0.06] border border-white/10 rounded-full">
                  <button
                    onClick={() => setProductViewMode('specs')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition border ${productViewMode === 'specs' ? 'bg-white text-slate-900 border-white shadow-sm' : 'text-slate-300 border-transparent hover:text-white'}`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Product Specs & Marketplace</span>
                  </button>
                  <button
                    onClick={() => setProductViewMode('sellers')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition border ${productViewMode === 'sellers' ? 'bg-white text-slate-900 border-white shadow-sm' : 'text-slate-300 border-transparent hover:text-white'}`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>B2B Sellers</span>
                  </button>
                </div>
              </div>

              {/* Toast Feedback */}
              {productSaveMessage && (
                <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center justify-between text-emerald-300 text-sm animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{productSaveMessage}</span>
                  </div>
                  <button
                    onClick={() => setProductSaveMessage(null)}
                    className="text-xs text-emerald-400 hover:text-emerald-200 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* User-Filled Search Inputs: Product, Spec, Price Range, and Geographic Range Scope */}
              <div className="mt-6 space-y-4">
                {/* Row 1: Category Type / Chooser Combobox & Product Name (Optional) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Category Combobox: Type freely or select from Chooser */}
                  <div className="md:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Industry Category</span>
                      </label>
                      <span className="text-[10px] text-emerald-400/90 font-mono">
                        Type or Pick Below
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          list="b2b-industry-category-options"
                          value={productCategoryInput}
                          onChange={(e) => setProductCategoryInput(e.target.value)}
                          placeholder="Type or select category (e.g. Industrial Metals, Solar...)"
                          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <datalist id="b2b-industry-category-options">
                          {B2B_INDUSTRY_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>

                      {/* Chooser Dropdown */}
                      <select
                        value={B2B_INDUSTRY_CATEGORIES.includes(productCategoryInput) ? productCategoryInput : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setProductCategoryInput(e.target.value);
                          }
                        }}
                        className="w-36 sm:w-44 bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer shrink-0"
                      >
                        <option value="">Choose Category...</option>
                        {B2B_INDUSTRY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Product Model / Brand Name (Optional - Can be Blank!) */}
                  <div className="md:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Product Model / Brand</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        {productNameInput && (
                          <button
                            type="button"
                            onClick={() => setProductNameInput('')}
                            className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono flex items-center space-x-0.5 cursor-pointer"
                            title="Clear product model to search entire category by specs alone"
                          >
                            <span>✕ Clear (Category Search)</span>
                          </button>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${productNameInput.trim()
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold'
                          }`}>
                          {productNameInput.trim() ? 'Model Specified' : 'Optional (Blank = All Category)'}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={productNameInput}
                        onChange={(e) => setProductNameInput(e.target.value)}
                        placeholder={productCategoryInput ? `Leave blank to search all ${productCategoryInput}, or type model...` : "e.g. Leave blank to search entire category by specs..."}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      {productNameInput && (
                        <button
                          type="button"
                          onClick={() => setProductNameInput('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
                          title="Clear Product Name"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Quick Templates — collapsible, techy icons, compact positioning */}
                <div className="rounded-xl border border-white/[0.07] bg-[rgba(13,19,38,0.72)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowTemplates(v => !v)}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-white/[0.03] transition text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5 text-white" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold tracking-widest uppercase text-white">Business Templates</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-200 border border-teal-500/20 text-[10px] font-mono">{CATEGORY_QUICK_TEMPLATES.length} · AI-mapped</span>
                          {appliedTemplateId && <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-bold">Active · {CATEGORY_QUICK_TEMPLATES.find(t => t.id === appliedTemplateId)?.title.slice(0, 22)}</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate hidden sm:block">One-click real-world procurement presets — category, specs & price autofill. Pure-spec templates search without model.</p>
                      </div>
                    </div>
                    <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition ${showTemplates ? 'bg-white text-slate-900 border-white' : 'bg-white/[0.06] text-slate-300 border-white/10'}`}>
                      <span className={`transition-transform text-xs ${showTemplates ? 'rotate-180' : ''}`}>⌄</span>
                    </span>
                  </button>

                  {showTemplates && (
                    <div className="px-3.5 pb-3.5 space-y-3 border-t border-white/[0.06] pt-3">
                      {/* AI involvement badge */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/12 text-indigo-300 border border-indigo-500/20 font-mono"><Sparkles className="w-3 h-3" /> AI taxonomy-aware</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-200 border border-cyan-500/15 font-mono"><Cpu className="w-3 h-3" /> Pure-spec supported</span>
                      </div>

                      {/* Group Filter — pill style */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                        {[
                          { key: 'all', label: `All ${CATEGORY_QUICK_TEMPLATES.length}`, icon: Layers },
                          { key: 'it', label: 'IT & Servers', icon: Cpu },
                          { key: 'metals', label: 'Steel & Metals', icon: Layers },
                          { key: 'agri', label: 'Agri & Food', icon: ShoppingBag },
                          { key: 'solar', label: 'Solar', icon: Zap },
                          { key: 'textiles', label: 'Textiles', icon: Tag },
                          { key: 'chemicals', label: 'Chemicals', icon: FileText },
                          { key: 'heavy', label: 'Machinery & PPE', icon: Server },
                        ].map(({ key, label, icon: Ico }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedTemplateGroup(key)}
                            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${selectedTemplateGroup === key ? 'bg-white text-slate-900 border-white' : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.09]'}`}
                          >
                            <Ico className="w-3 h-3" /> {label}
                          </button>
                        ))}
                      </div>

                      {/* Grid — techy cards, no emoji, pure lucide */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {CATEGORY_QUICK_TEMPLATES
                          .filter((tpl) => selectedTemplateGroup === 'all' || tpl.industryGroup === selectedTemplateGroup)
                          .map((tpl) => {
                            const isSelected = appliedTemplateId === tpl.id;
                            const isPureSpec = !tpl.productName;
                            const GIcon = (
                              tpl.industryGroup === 'it' ? Cpu :
                                tpl.industryGroup === 'metals' ? Layers :
                                  tpl.industryGroup === 'agri' ? ShoppingBag :
                                    tpl.industryGroup === 'solar' ? Zap :
                                      tpl.industryGroup === 'textiles' ? Tag :
                                        tpl.industryGroup === 'chemicals' ? FileText : Server
                            );
                            return (
                              <button
                                key={tpl.id}
                                type="button"
                                onClick={() => handleApplyQuickTemplate(tpl)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-2 group transition ${isSelected ? 'bg-white text-slate-900 border-white shadow-md' : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 text-slate-200 hover:border-white/15'}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-slate-900 text-white' : 'bg-white/[0.07] text-teal-300 border border-white/10'}`}>
                                    <GIcon className="w-3.5 h-3.5" />
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0 ${isPureSpec ? (isSelected ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-500/15 text-amber-300 border-amber-500/20') : (isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white/[0.06] text-slate-400 border-white/10')}`}>
                                    {isPureSpec ? 'Pure Spec' : 'Model'}
                                  </span>
                                </div>
                                <div className={`text-xs font-bold leading-tight line-clamp-2 ${isSelected ? 'text-slate-900' : 'text-white group-hover:text-white'}`}>{tpl.title}</div>
                                <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-slate-600' : 'text-teal-300/90'}`}>{tpl.category}</div>
                                <p className={`text-[11px] leading-snug line-clamp-2 ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{tpl.description}</p>
                                <div className={`pt-2 mt-auto border-t flex items-center justify-between text-[10px] ${isSelected ? 'border-slate-200' : 'border-white/10'}`}>
                                  <span className={`font-mono font-bold ${isSelected ? 'text-emerald-700' : 'text-emerald-300'}`}>{tpl.priceRangeText}</span>
                                  <span className={`font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'}`}>{isSelected ? '✓ Active' : 'Load →'}</span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Spec Criteria — collapsible, techy AI-mapped */}
                <div className="rounded-xl border border-white/[0.07] bg-[rgba(13,19,38,0.64)] overflow-hidden">
                  <button type="button" onClick={() => setShowSpecBuilder(v => !v)} className="w-full flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-white/[0.03] transition">
                    <span className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-white text-slate-900 flex items-center justify-center"><Terminal className="w-3.5 h-3.5" /></span>
                      <span className="text-xs font-bold tracking-widest uppercase text-white">Spec Criteria</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-bold font-mono">{specsList.length} · AI normalized</span>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/12 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono"><Sparkles className="w-3 h-3" /> taxonomy-aware</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span onClick={(e) => { e.stopPropagation(); handleAddSpec(); }} className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 transition"><Plus className="w-3 h-3" /> Add</span>
                      <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs transition ${showSpecBuilder ? 'bg-white text-slate-900 border-white' : 'bg-white/[0.06] border-white/10 text-slate-300'}`}>⌄</span>
                    </span>
                  </button>
                  {showSpecBuilder && (
                    <div className="px-3.5 pb-3.5 space-y-3 border-t border-white/[0.06] pt-3">
                      <div className="flex justify-end sm:hidden">
                        <button type="button" onClick={handleAddSpec} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold"><Plus className="w-3.5 h-3.5" /> Add Spec</button>
                      </div>

                      {/* Spec List Cards */}
                      <div className="space-y-2.5">
                        {specsList.map((spec, index) => {
                          const isRange = spec.mode === 'range';
                          const isInvalidRange = isRange && !spec.minValue?.trim() && !spec.maxValue?.trim();

                          return (
                            <div
                              key={spec.id}
                              className={`p-3 rounded-xl border transition-all ${isInvalidRange
                                ? 'bg-amber-950/20 border-amber-500/40'
                                : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600'
                                }`}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                                {/* Spec Name / Attribute */}
                                <div className="md:col-span-4">
                                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                                    Spec Name #{index + 1}
                                  </label>
                                  <input
                                    type="text"
                                    value={spec.name}
                                    onChange={(e) => handleUpdateSpec(spec.id, { name: e.target.value })}
                                    placeholder="e.g. RAM, Storage, Screen, Grade"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                                  />
                                </div>

                                {/* Mode Checkbox Selector: Same (Default) vs Range */}
                                <div className="md:col-span-3 flex items-center justify-start md:justify-center pt-2 md:pt-4">
                                  <label className="flex items-center space-x-2 cursor-pointer select-none group">
                                    <input
                                      type="checkbox"
                                      checked={isRange}
                                      onChange={(e) =>
                                        handleUpdateSpec(spec.id, {
                                          mode: e.target.checked ? 'range' : 'same',
                                        })
                                      }
                                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900 cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition">
                                      {isRange ? (
                                        <span className="text-teal-400 font-bold flex items-center space-x-1">
                                          <span>Range Mode</span>
                                          <span className="text-[10px] font-normal text-teal-300/80">(Min / Max)</span>
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">Default: Same (Exact)</span>
                                      )}
                                    </span>
                                  </label>
                                </div>

                                {/* Spec Values: Single Field if Same, Min & Max Fields if Range */}
                                <div className="md:col-span-4">
                                  {!isRange ? (
                                    <div>
                                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                                        Exact Value <span className="text-slate-500">(Single Match)</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={spec.value || ''}
                                        onChange={(e) => handleUpdateSpec(spec.id, { value: e.target.value })}
                                        placeholder="e.g. 16GB DDR5, RTX 3050, Fe 500D"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-semibold text-teal-300">
                                          Range Section <span className="text-slate-400 font-normal">(Min / Max)</span>
                                        </label>
                                        <span className="text-[9px] text-slate-400">
                                          Fill at least one (Min or Max)
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <input
                                            type="text"
                                            value={spec.minValue || ''}
                                            onChange={(e) => handleUpdateSpec(spec.id, { minValue: e.target.value })}
                                            placeholder="Min (e.g. 8GB, 144Hz)"
                                            className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono ${isInvalidRange ? 'border-amber-500/60' : 'border-slate-700'
                                              }`}
                                          />
                                        </div>
                                        <div>
                                          <input
                                            type="text"
                                            value={spec.maxValue || ''}
                                            onChange={(e) => handleUpdateSpec(spec.id, { maxValue: e.target.value })}
                                            placeholder="Max (e.g. 32GB, 240Hz)"
                                            className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono ${isInvalidRange ? 'border-amber-500/60' : 'border-slate-700'
                                              }`}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Delete Row Button */}
                                <div className="md:col-span-1 flex items-center justify-end pt-2 md:pt-4">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSpec(spec.id)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                    title="Remove this spec requirement"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {isInvalidRange && (
                                <div className="mt-2 text-[10px] text-amber-300 flex items-center space-x-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>Range mode selected: There is no restriction to fill both, but any one Min or Max must be filled.</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {specsList.length === 0 && (
                          <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                            No specifications defined. Click <strong className="text-teal-400">+ Spec</strong> above to add customized criteria or select a quick template above.
                          </div>
                        )}
                      </div>

                      {/* Live Compiled Spec Preview Bar */}
                      {specsList.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-[10px] text-slate-500 uppercase font-mono whitespace-nowrap">Active Criteria:</span>
                            <span className="text-teal-300 font-mono text-[11px] truncate" title={formatSpecsFromList(specsList)}>
                              {formatSpecsFromList(specsList) || 'None'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddSpec}
                            className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1 whitespace-nowrap self-end sm:self-auto cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Another Spec</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price & Geography — always visible, primary inputs (outside collapse) */}
                {/* Row 2: Price Range & Geographic Scope Selector (Radius vs All India vs World) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
                  {/* Price Range Controls — consistent shell */}
                  <div className="lg:col-span-5 space-y-2 p-3.5 bg-white/[0.04] border border-white/10 rounded-xl">
                    <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Price Range (INR ₹)</span>
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        {productMinPrice || productMaxPrice
                          ? `₹${Number(productMinPrice || 0).toLocaleString('en-IN')} – ₹${Number(productMaxPrice || 0).toLocaleString('en-IN')}`
                          : 'Any Budget'}
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Min Price (₹)</span>
                        <input
                          type="number"
                          value={productMinPrice}
                          onChange={(e) => setProductMinPrice(e.target.value)}
                          placeholder="e.g. 50000"
                          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Max Price (₹)</span>
                        <input
                          type="number"
                          value={productMaxPrice}
                          onChange={(e) => setProductMaxPrice(e.target.value)}
                          placeholder="e.g. 100000"
                          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => { setProductMinPrice('0'); setProductMaxPrice('50000'); }}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        Under ₹50k
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProductMinPrice('50000'); setProductMaxPrice('100000'); }}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        ₹50k - ₹1L
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProductMinPrice('100000'); setProductMaxPrice('200000'); }}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        ₹1L - ₹2L
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProductMinPrice(''); setProductMaxPrice(''); }}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                      >
                        Any Price
                      </button>
                    </div>
                  </div>

                  {/* Geographic Scope — consistent shell */}
                  <div className="lg:col-span-7 space-y-2 p-3.5 bg-white/[0.04] border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                        <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Geographic Range Scope (Perimeter vs Pan-India vs Worldwide)</span>
                      </label>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                        {productScope === 'radius' ? `Radius: ${productRangeKm}km` : (productScope === 'india' ? 'Pan-India' : 'Worldwide')}
                      </span>
                    </div>

                    {/* Tick Mark Radio/Check Options */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Option 1: Radius Slider */}
                      <button
                        type="button"
                        onClick={() => setProductScope('radius')}
                        className={`p-2 rounded-lg border text-left flex items-start space-x-2 transition cursor-pointer ${productScope === 'radius'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${productScope === 'radius' ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-slate-600'
                          }`}>
                          {productScope === 'radius' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight flex items-center space-x-1">
                            <span>Perimeter Radius</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Slider: 25–1,000km</span>
                        </div>
                      </button>

                      {/* Option 2: All over India */}
                      <button
                        type="button"
                        onClick={() => setProductScope('india')}
                        className={`p-2 rounded-lg border text-left flex items-start space-x-2 transition cursor-pointer ${productScope === 'india'
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${productScope === 'india' ? 'border-amber-400 bg-amber-500 text-black' : 'border-slate-600'
                          }`}>
                          {productScope === 'india' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight flex items-center space-x-1">
                            <span>🇮🇳 All over India</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Pan-India Portals</span>
                        </div>
                      </button>

                      {/* Option 3: Worldwide */}
                      <button
                        type="button"
                        onClick={() => setProductScope('world')}
                        className={`p-2 rounded-lg border text-left flex items-start space-x-2 transition cursor-pointer ${productScope === 'world'
                          ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${productScope === 'world' ? 'border-cyan-400 bg-cyan-500 text-black' : 'border-slate-600'
                          }`}>
                          {productScope === 'world' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight flex items-center space-x-1">
                            <span>🌍 Worldwide / Global</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">International Sellers</span>
                        </div>
                      </button>
                    </div>

                    {/* Scope Conditional Controls */}
                    {productScope === 'radius' ? (
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                          <label className="text-[11px] text-slate-400 flex items-center space-x-1 mb-1">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>Center Location Hub:</span>
                          </label>
                          <input
                            type="text"
                            value={productCenterLocation}
                            onChange={(e) => setProductCenterLocation(e.target.value)}
                            placeholder="e.g. Malda, WB, India"
                            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-7 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Radius Slider:</span>
                            <span className="font-mono font-bold text-emerald-400">{productRangeKm} km</span>
                          </div>
                          <input
                            type="range"
                            min="25"
                            max="1000"
                            step="25"
                            value={productRangeKm}
                            onChange={(e) => setProductRangeKm(Number(e.target.value))}
                            className="w-full accent-emerald-500 cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>25km</span>
                            <span>250km</span>
                            <span className="text-emerald-400 font-bold">500km</span>
                            <span>1000km</span>
                          </div>
                        </div>
                      </div>
                    ) : productScope === 'india' ? (
                      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong>Pan-India Scope Active:</strong> Sourcing across all verified merchants, distributor warehouses, and manufacturers across India (Delhi NCR, Mumbai, Kolkata, Bangalore, Malda, Hyderabad, etc.).
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200/90 flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>
                          <strong>Worldwide Scope Active:</strong> Sourcing across international sellers, global direct exporters, and overseas authorized distributor networks.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Execution Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleProductSearch}
                    disabled={productLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 flex items-center space-x-2 transition disabled:opacity-60"
                  >
                    {productLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Scraping Suppliers ({productScope === 'radius' ? `${productRangeKm}km` : (productScope === 'india' ? 'Pan-India' : 'Worldwide')})...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Scrape & Find ({productScope === 'radius' ? `${productRangeKm}km Radius` : (productScope === 'india' ? 'All over India' : 'Worldwide')})</span>
                      </>
                    )}
                  </button>

                  {/* Results Capacity / Dynamic Choices Selector */}
                  <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/90 rounded-xl px-3 py-2 text-xs shadow-sm">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-400 font-medium whitespace-nowrap">Dynamic Choices:</span>
                    <select
                      value={productMaxResults}
                      onChange={(e) => setProductMaxResults(Number(e.target.value))}
                      className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer text-xs"
                      title="Select maximum business channels to query and return"
                    >
                      <option value={50} className="bg-slate-900 text-emerald-400 font-semibold">Max 50 Channels (High Probability Matching - Recommended)</option>
                      <option value={35} className="bg-slate-900 text-slate-200">35 Channels</option>
                      <option value={20} className="bg-slate-900 text-slate-200">20 Channels</option>
                      <option value={10} className="bg-slate-900 text-slate-200">10 Channels</option>
                    </select>
                  </div>

                  <button
                    onClick={handleExportProductCSV}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-2 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Sheet</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Loaded{' '}
                    <strong className="text-emerald-300 font-mono font-bold">
                      {productViewMode === 'specs' ? productSpecResults.length : productSellerResults.length}
                    </strong>{' '}
                    Dynamic Business Channels (Max {productMaxResults})
                  </span>
                </div>
              </div>
            </div>

            {/* Collapsible helpers — only show when needed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Legend — collapsible */}
              <div className="rounded-xl border border-white/[0.07] bg-[rgba(13,19,38,0.54)] overflow-hidden">
                <button type="button" onClick={() => setShowLegend(v => !v)} className="w-full flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-white/[0.03] transition text-left">
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center"><Tag className="w-3.5 h-3.5 text-violet-300" /></span>
                    <span className="text-xs font-bold tracking-widest uppercase text-white">Status Legend</span>
                    <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-400 font-mono">On-demand reference</span>
                  </span>
                  <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs transition ${showLegend ? 'bg-white text-slate-900 border-white' : 'bg-white/[0.06] border-white/10 text-slate-300'}`}>⌄</span>
                </button>
                {showLegend && (
                  <div className="px-3.5 pb-3.5 grid grid-cols-1 gap-3 border-t border-white/[0.06] pt-3">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-200">Business Status</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div><b className="text-emerald-300">Active</b> · operating</div>
                        <div><b className="text-teal-300">Expanding</b> · scaling</div>
                        <div><b className="text-cyan-300">Stable</b> · reliable</div>
                        <div><b className="text-amber-300">Needs Upgrade</b> · gaps</div>
                        <div><b className="text-blue-300">Seasonal</b> · cyclic</div>
                        <div><b className="text-purple-300">Revisit Later</b> · deferred</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-200">Verification</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div><b className="text-emerald-300">GSTIN Verified</b> · tax</div>
                        <div><b className="text-teal-300">PAN Verified</b> · identity</div>
                        <div><b className="text-blue-300">ISO Certified</b> · quality</div>
                        <div><b className="text-amber-300">Chamber Registered</b> · commerce</div>
                        <div><b className="text-green-300">Certified Organic</b> · organic</div>
                        <div><b className="text-purple-300">Verified Partner</b> · platform</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Coverage audit — summary always, details collapsible */}
              <div className="rounded-xl border border-white/[0.07] bg-[rgba(13,19,38,0.54)] overflow-hidden">
                <button type="button" onClick={() => setShowAudit(v => !v)} className="w-full flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-white/[0.03] transition text-left">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0"><Navigation className="w-3.5 h-3.5 text-white" /></span>
                    <span className="text-xs font-bold tracking-widest uppercase text-white truncate">Coverage Audit</span>
                    <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-200 border border-teal-500/20 text-[10px] font-mono">{searchCoverage.areasSearchedCount} hubs · {searchCoverage.noiseFilteredPercent}% filtered</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-[10px] font-mono text-slate-400 truncate max-w-[160px]">{searchCoverage.coveragePerimeter}</span>
                    <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs transition ${showAudit ? 'bg-white text-slate-900 border-white' : 'bg-white/[0.06] border-white/10 text-slate-300'}`}>⌄</span>
                  </span>
                </button>
                {showAudit && (
                  <div className="px-3.5 pb-3.5 space-y-3 border-t border-white/[0.06] pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                        <div className="text-[10px] tracking-widest uppercase text-slate-400">Trade Hubs</div>
                        <div className="text-xl font-black font-mono text-teal-200">{searchCoverage.areasSearchedCount}</div>
                        <div className="text-[10px] text-slate-500 truncate">{searchCoverage.coveragePerimeter}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                        <div className="text-[10px] tracking-widest uppercase text-slate-400">Nodes Audited</div>
                        <div className="text-xl font-black font-mono text-indigo-200">{searchCoverage.rawCandidatesAudited}</div>
                        <div className="text-[10px] text-slate-500">Listings evaluated</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {searchCoverage.areasSearchedList.map((area, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400" />{area}</span>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-100 flex gap-2"><Info className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" /><p className="leading-relaxed text-slate-300">{searchCoverage.searchRemarks}</p></div>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================== */}
            {/* View Mode 1: Detailed Product Specs Table (Exact User Spec) */}
            {/* ========================================================== */}
            {productViewMode === 'specs' && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <Cpu className="w-5 h-5 text-emerald-400" />
                        <span>Product Specs & Marketplace Enrichment Matrix</span>
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                        {productSpecResults.length} Business Channels (Max {productMaxResults})
                      </span>
                      {filteredProductSpecResults.length !== productSpecResults.length && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {filteredProductSpecResults.length} Filtered
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      High-probability commercial matching: Scans up to 50 dynamic business channels with wholesale discounts, MOQs, and hidden B2B negotiation strategies.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExportProductCSV}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                      title="Download active results as CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export CSV ({filteredProductSpecResults.length})</span>
                    </button>
                  </div>
                </div>

                {/* Instant Real-Time Search & Sort Filter Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={productTableSearch}
                        onChange={(e) => setProductTableSearch(e.target.value)}
                        placeholder="Instant search products, specs, vendor, location..."
                        className="w-full bg-slate-950/80 border border-slate-700/70 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                      {productTableSearch && (
                        <button
                          onClick={() => setProductTableSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-0.5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      Showing {filteredProductSpecResults.length} of {productSpecResults.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Sort By */}
                    <div className="flex items-center space-x-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={productSortBy}
                        onChange={(e) => setProductSortBy(e.target.value as any)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="default">Default Order</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="discount_desc">Discount: Highest First</option>
                        <option value="distance_asc">Distance: Nearest First</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center space-x-1.5">
                      <Filter className="w-3 h-3 text-slate-400" />
                      <select
                        value={productStatusFilter}
                        onChange={(e) => setProductStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="all">All Statuses ({productSpecResults.length})</option>
                        <option value="Active">Active (Operational / In-Stock)</option>
                        <option value="Inactive">Inactive (Out of Stock / Unverified)</option>
                      </select>
                    </div>

                    {(productTableSearch || productStatusFilter !== 'all' || productSortBy !== 'default') && (
                      <button
                        onClick={() => {
                          setProductTableSearch('');
                          setProductStatusFilter('all');
                          setProductSortBy('default');
                        }}
                        className="text-[11px] text-emerald-400 hover:underline px-1.5 py-0.5"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[720px] relative">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="p-3.5 whitespace-nowrap">Product</th>
                        <th className="p-3.5 whitespace-nowrap">Specs</th>
                        <th className="p-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-slate-200">E-Commerce Pricing</span>
                            <span className="text-[10px] text-slate-400 font-normal tracking-normal">
                              Selling • MRP • Card Offer
                            </span>
                          </div>
                        </th>
                        <th className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-emerald-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>B2B Volume Pricing & Discounts</span>
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">Hidden Strategies</span>
                          </div>
                        </th>
                        <th className="p-3.5 whitespace-nowrap">Seller / Business</th>
                        <th className="p-3.5 whitespace-nowrap">Website / Source</th>
                        <th className="p-3.5 whitespace-nowrap">Business Details</th>
                        <th className="p-3.5 whitespace-nowrap">Location</th>
                        <th className="p-3.5 whitespace-nowrap">Logistics</th>
                        <th className="p-3.5 whitespace-nowrap">Status / Tags</th>
                        <th className="p-3.5 whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {productLoading ? (
                        <tr>
                          <td colSpan={11} className="p-8 text-center bg-slate-950/60">
                            <div className="flex flex-col items-center justify-center space-y-3 py-6">
                              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                              <div className="text-sm font-semibold text-white">
                                Scraping across {searchCoverage.areasSearchedCount} regional procurement zones ({productScope === 'radius' ? `${productRangeKm}km Radius` : 'Pan-India'})...
                              </div>
                              <p className="text-xs text-slate-400 max-w-md">
                                Querying nationwide and radius supplier networks, matching technical specs, extracting retail prices, and resolving secret B2B wholesale discount tiers.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredProductSpecResults.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-8 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2 py-4">
                              <AlertCircle className="w-6 h-6 text-slate-500" />
                              <div className="text-sm font-semibold text-slate-300">No matching product spec records found</div>
                              <p className="text-xs text-slate-500">
                                {productTableSearch ? `No results match "${productTableSearch}". Try a different keyword or reset filters.` : 'Try adjusting your spec requirements, expanding the geo-radius, or resetting the status filter.'}
                              </p>
                              {(productTableSearch || productStatusFilter !== 'all' || productSortBy !== 'default') && (
                                <button
                                  onClick={() => {
                                    setProductTableSearch('');
                                    setProductStatusFilter('all');
                                    setProductSortBy('default');
                                  }}
                                  className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs hover:bg-emerald-600/30 transition mt-2"
                                >
                                  Clear Filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredProductSpecResults.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition">
                            {/* Product */}
                            <td className="p-3.5 font-bold text-white whitespace-nowrap">
                              <div className="flex flex-col space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                  <span className="truncate max-w-[280px]">{item.product}</span>
                                </div>
                                {item.category && (
                                  <div className="flex items-center space-x-1 text-[10px] text-teal-400/90 font-normal pl-4">
                                    <FolderTree className="w-3 h-3 text-teal-500/70" />
                                    <span>{item.category}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Specs */}
                            <td className="p-3.5 font-mono text-emerald-300 max-w-xs">
                              <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/20 rounded-md block truncate" title={item.specs}>
                                {item.specs}
                              </span>
                            </td>

                            {/* 3-Tier E-Commerce Pricing (Selling Price, MRP Launch Price, Card Offer) */}
                            <td className="p-3.5 whitespace-nowrap">
                              {item.priceConfidence === 'live' && item.sellingPrice ? (
                                <div className="space-y-1">
                                  {/* LIVE confidence badge */}
                                  <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 mb-0.5" title="Real price scraped from product page">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                    <span>LIVE</span>
                                  </span>

                                  {/* Selling Price + MRP + Discount % */}
                                  <div className="flex items-baseline space-x-2">
                                    <span className="text-sm font-black text-white tracking-tight">
                                      {item.sellingPrice}
                                    </span>
                                    {item.mrp && (
                                      <span className="text-[11px] line-through text-slate-400 font-mono" title="Launched MRP">
                                        {item.mrp}
                                      </span>
                                    )}
                                    {item.discountPercent !== undefined && (
                                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
                                        {item.discountPercent}% off
                                      </span>
                                    )}
                                  </div>

                                  {/* Offer Price (Card discounted price average) */}
                                  {item.offerPrice && (
                                    <div className="flex items-center space-x-1.5">
                                      <span
                                        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium"
                                        title="Card / Bank Discounted Average Offer Price"
                                      >
                                        <CreditCard className="w-2.5 h-2.5 text-amber-400" />
                                        <span>Card Offer:</span>
                                        <span className="font-bold text-emerald-300 font-mono">
                                          {item.offerPrice}
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* No real price found — direct the user to the source */
                                <div className="flex flex-col space-y-1.5">
                                  <span className="text-[10px] text-slate-500 italic">Price not in snippet</span>
                                  {item.rawUrl && (
                                    <a
                                      href={item.rawUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-[10px] font-semibold transition"
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />
                                      <span>View on Site →</span>
                                    </a>
                                  )}
                                </div>
                              )}
                            </td>


                            {/* B2B Volume Pricing & Discounts */}
                            <td className="p-3.5 whitespace-nowrap">
                              {item.b2bPricing ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-teal-300 font-mono text-xs">
                                      {item.b2bPricing.wholesalePrice}
                                    </span>
                                    {item.b2bPricing.bulkDiscountTier && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                                        {item.b2bPricing.bulkDiscountTier}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    {item.b2bPricing.moq && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 text-[10px] font-mono">
                                        {item.b2bPricing.moq}
                                      </span>
                                    )}

                                    {item.b2bPricing.meetingRequired ? (
                                      <span
                                        className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-semibold"
                                      >
                                        <span>🤝 Post-Meeting RFP</span>
                                      </span>
                                    ) : (
                                      <span
                                        className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[9px] font-semibold"
                                      >
                                        <span>📊 Wholesale Lot</span>
                                      </span>
                                    )}
                                  </div>

                                  {item.b2bPricing.b2bStrategy && (
                                    <div className="text-[10px] text-slate-400 max-w-xs truncate" title={item.b2bPricing.b2bStrategy}>
                                      <span className="text-slate-500">Terms:</span> {item.b2bPricing.b2bStrategy}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-slate-500 italic text-xs block">Direct Quote on Request</span>
                                  <span className="text-[10px] text-slate-400">Retail Marketplace Channel</span>
                                </div>
                              )}
                            </td>

                            {/* Seller/Business */}
                            <td className="p-3.5 font-semibold text-slate-200 whitespace-nowrap">
                              {item.sellerBusiness}
                            </td>

                            {/* Website/Source */}
                            <td className="p-3.5 whitespace-nowrap">
                              <a
                                href={item.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-cyan-300 hover:text-white transition"
                              >
                                <span>{item.websiteSource}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </td>

                            {/* Business Details */}
                            <td className="p-3.5 text-slate-300 max-w-xs truncate" title={item.businessDetails}>
                              {item.businessDetails}
                            </td>

                            {/* Location */}
                            <td className="p-3.5 text-slate-300 whitespace-nowrap">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                <span>{item.location}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({item.distanceKm} km)</span>
                              </div>
                            </td>

                            {/* Logistics */}
                            <td className="p-3.5 text-slate-300 whitespace-nowrap">
                              <div className="flex items-center space-x-1.5 text-[11px]">
                                <Truck className="w-3 h-3 text-slate-400" />
                                <span>{item.logistics}</span>
                              </div>
                            </td>

                            {/* Status/Tags */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.statusTag === 'completed'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : item.statusTag === 'working'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : item.statusTag === 'in_progress'
                                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                      : item.statusTag === 'upgrade_needed'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                  }`}
                              >
                                {item.statusTag}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleSaveSpecMerchant(item)}
                                  className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 transition"
                                  title="Save merchant to CRM / Saved Profiles"
                                >
                                  <Bookmark className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${item.product} | ${item.specs} | Selling: ${item.sellingPrice || item.price} | MRP: ${item.mrp || 'N/A'} | Card Offer: ${item.offerPrice || 'N/A'} | ${item.sellerBusiness}`);
                                    setProductSaveMessage(`Copied specs for ${item.product}!`);
                                    setTimeout(() => setProductSaveMessage(null), 2500);
                                  }}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                  title="Copy Specs"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* View Mode 2: B2B Seller & Procurement Hub Table            */}
            {/* ========================================================== */}
            {productViewMode === 'sellers' && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-400" />
                        <span>B2B Seller & Procurement Hub Directory</span>
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                        {productSellerResults.length} Enterprise Channels (Max {productMaxResults})
                      </span>
                      {filteredProductSellerResults.length !== productSellerResults.length && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {filteredProductSellerResults.length} Filtered
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct corporate contacts, operational health ratings, and volume trade credit terms across up to 50 verified enterprise channels.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExportProductCSV}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                      title="Download active suppliers as CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export CSV ({filteredProductSellerResults.length})</span>
                    </button>
                  </div>

                  {/* Benchmark Fallback Banner — shown when live scrape failed */}
                  {productSellerResults.some((s) => (s as any).dataSource === 'benchmark') && (
                    <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/30 text-amber-300 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Benchmark Data Active</span>
                        <span className="text-amber-400/70 ml-1.5">Live B2B scrape was rate-limited or blocked. Showing verified benchmark records from our curated supplier database. Try a new search to attempt a fresh live scrape.</span>
                      </div>
                    </div>
                  )}

                  {/* IndiaMART / DuckDuckGo B2B Source Banner for pan-India scope */}
                  {productSellerResults.some((s) => (s as any).dataSource === 'live' && ((s as any).id || '').startsWith('seller_b2b_')) && (
                    <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-teal-500/8 border border-teal-500/30 text-teal-300 text-xs">
                      <Globe className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Pan-India B2B Directory Search Active</span>
                        <span className="text-teal-400/70 ml-1.5">Results sourced from IndiaMART, TradeIndia, ExportersIndia and JustDial — real nationwide B2B wholesale directories, not Google Maps local results.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instant Real-Time Search & Sort Filter Toolbar for Sellers */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={sellerTableSearch}
                        onChange={(e) => setSellerTableSearch(e.target.value)}
                        placeholder="Instant search supplier name, phone, city, services..."
                        className="w-full bg-slate-950/80 border border-slate-700/70 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                      {sellerTableSearch && (
                        <button
                          onClick={() => setSellerTableSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-0.5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      Showing {filteredProductSellerResults.length} of {productSellerResults.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Sort By */}
                    <div className="flex items-center space-x-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={sellerSortBy}
                        onChange={(e) => setSellerSortBy(e.target.value as any)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="default">Default Order</option>
                        <option value="rating_desc">Rating: High to Low</option>
                        <option value="reviews_desc">Reviews: Most First</option>
                        <option value="distance_asc">Distance: Nearest First</option>
                      </select>
                    </div>

                    {/* Verification Filter */}
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={productVerificationFilter}
                        onChange={(e) => setProductVerificationFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="all">All Verifications ({productSellerResults.length})</option>
                        <option value="Google Maps Verified">Google Maps Verified</option>
                        <option value="Unverified Listing">Unverified Listing</option>
                        <option value="GSTIN Verified">GSTIN Verified</option>
                        <option value="PAN Verified">PAN Verified</option>
                        <option value="ISO Certified">ISO Certified</option>
                        <option value="Chamber Registered">Chamber Registered</option>
                        <option value="Certified Organic">Certified Organic</option>
                        <option value="Verified Partner">Verified Partner</option>
                      </select>
                    </div>

                    {(sellerTableSearch || productVerificationFilter !== 'all' || sellerSortBy !== 'default') && (
                      <button
                        onClick={() => {
                          setSellerTableSearch('');
                          setProductVerificationFilter('all');
                          setSellerSortBy('default');
                        }}
                        className="text-[11px] text-emerald-400 hover:underline px-1.5 py-0.5"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Batch Action Toolbar */}
                {selectedSellerIds.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl animate-in fade-in duration-200">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-300">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>{selectedSellerIds.length} Channels Selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleBatchImportSellers}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Import Selected ({selectedSellerIds.length})</span>
                      </button>
                      <button
                        onClick={handleBatchExportSelectedSellersCSV}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Selected CSV</span>
                      </button>
                      <button
                        onClick={() => setSelectedSellerIds([])}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="p-3.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedSellerIds.length === filteredProductSellerResults.length && filteredProductSellerResults.length > 0}
                            onChange={handleToggleSelectAllSellers}
                            className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                            title="Select / Deselect All"
                          />
                        </th>
                        <th className="p-3.5 whitespace-nowrap">Business Name</th>
                        <th className="p-3.5 whitespace-nowrap">Category</th>
                        <th className="p-3.5 whitespace-nowrap">Products / Services</th>
                        <th className="p-3.5 whitespace-nowrap">Procurement Terms</th>
                        <th className="p-3.5 whitespace-nowrap">Website</th>
                        <th className="p-3.5 whitespace-nowrap">Phone</th>
                        <th className="p-3.5 whitespace-nowrap">Email</th>
                        <th className="p-3.5 whitespace-nowrap">Address</th>
                        <th className="p-3.5 whitespace-nowrap">Lat/Long</th>
                        <th className="p-3.5 whitespace-nowrap">Business Status</th>
                        <th className="p-3.5 whitespace-nowrap">Verification Status</th>
                        <th className="p-3.5 whitespace-nowrap">Operational Health</th>
                        <th className="p-3.5 whitespace-nowrap">Trade Credit Terms</th>
                        <th className="p-3.5 whitespace-nowrap text-right min-w-[210px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {productLoading ? (
                        <tr>
                          <td colSpan={15} className="p-8 text-center bg-slate-950/60">
                            <div className="flex flex-col items-center justify-center space-y-3 py-6">
                              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                              <div className="text-sm font-semibold text-white">
                                Scanning B2B Network across {searchCoverage.areasSearchedCount} commercial zones ({productScope === 'radius' ? `${productRangeKm}km Radius` : 'Pan-India'})...
                              </div>
                              <p className="text-xs text-slate-400 max-w-md">
                                Resolving verified commercial suppliers, geocoding distances, verifying GSTIN / ISO compliance, and extracting wholesale volume terms.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredProductSellerResults.length === 0 ? (
                        <tr>
                          <td colSpan={15} className="p-8 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2 py-4">
                              <AlertCircle className="w-6 h-6 text-slate-500" />
                              <div className="text-sm font-semibold text-slate-300">No supplier records found</div>
                              <p className="text-xs text-slate-500">
                                {sellerTableSearch ? `No suppliers match "${sellerTableSearch}". Try adjusting your keywords or clearing filters.` : 'Try expanding your sourcing radius or resetting the verification filter.'}
                              </p>
                              {(sellerTableSearch || productVerificationFilter !== 'all' || sellerSortBy !== 'default') && (
                                <button
                                  onClick={() => {
                                    setSellerTableSearch('');
                                    setProductVerificationFilter('all');
                                    setSellerSortBy('default');
                                  }}
                                  className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs hover:bg-emerald-600/30 transition mt-2"
                                >
                                  Clear Filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredProductSellerResults.map((seller) => (
                          <tr key={seller.id} className={`hover:bg-slate-800/30 transition ${selectedSellerIds.includes(seller.id) ? 'bg-emerald-950/20' : ''}`}>
                            {/* Checkbox */}
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={selectedSellerIds.includes(seller.id)}
                                onChange={() => handleToggleSelectSeller(seller.id)}
                                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                              />
                            </td>

                            {/* 1. Business Name */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white text-sm">{seller.businessName}</span>
                                {/* Data source confidence pill */}
                                {(seller as any).dataSource === 'benchmark' ? (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] font-bold" title="Benchmark fallback data — not a real live scrape">
                                    📊 BENCHMARK
                                  </span>
                                ) : ((seller as any).id || '').startsWith('seller_b2b_') ? (
                                  <span className="px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 border border-teal-500/30 text-[9px] font-bold" title="Sourced from IndiaMART / TradeIndia pan-India directory">
                                    🌐 B2B DIR
                                  </span>
                                ) : (seller as any).dataSource === 'live' ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold" title="Live scraped from Google Maps">
                                    🗺️ LIVE
                                  </span>
                                ) : null}
                                {flaggedSellerIds.includes(seller.id) && (
                                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
                                    🚩 Revisit
                                  </span>
                                )}
                                {bookmarkedSellerIds.includes(seller.id) && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                                    ★ Saved
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 2. Category */}
                            <td className="p-3.5 text-slate-300 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                                {seller.category}
                              </span>
                            </td>

                            {/* 3. Products / Services */}
                            <td className="p-3.5 text-slate-300 max-w-xs truncate" title={seller.productsServices}>
                              {seller.productsServices}
                            </td>

                            {/* 4. Procurement Terms */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span className="text-xs text-slate-200 font-medium block">
                                  {seller.procurementTerms || (seller.b2bPricing ? `Wholesale: ${seller.b2bPricing.wholesalePrice}` : 'Direct In-Store / Quote on Request')}
                                </span>
                                {seller.b2bPricing?.bulkDiscountTier && (
                                  <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                                    {seller.b2bPricing.bulkDiscountTier} {seller.b2bPricing.moq ? `• ${seller.b2bPricing.moq}` : ''}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 5. Website */}
                            <td className="p-3.5 whitespace-nowrap font-mono text-xs">
                              {seller.website ? (
                                <a
                                  href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center space-x-1"
                                >
                                  <span>{seller.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-slate-500 italic">—</span>
                              )}
                            </td>

                            {/* 6. Phone */}
                            <td className="p-3.5 text-slate-300 whitespace-nowrap font-mono text-xs">
                              {seller.phone ? (
                                <div className="flex items-center space-x-1.5">
                                  <a href={`tel:${seller.phone}`} className="hover:text-emerald-400 transition">
                                    {seller.phone}
                                  </a>
                                  <a
                                    href={getWhatsAppUrl(seller.phone, seller.businessName)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="WhatsApp RFP"
                                    className="p-1 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition inline-flex items-center"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                  </a>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">—</span>
                              )}
                            </td>

                            {/* 7. Email */}
                            <td className="p-3.5 text-slate-300 whitespace-nowrap font-mono text-xs">
                              {seller.email ? (
                                <a href={`mailto:${seller.email}`} className="text-indigo-400 hover:text-indigo-300">
                                  {seller.email}
                                </a>
                              ) : (
                                <span className="text-slate-500 italic">—</span>
                              )}
                            </td>

                            {/* 8. Address */}
                            <td className="p-3.5 text-slate-300 max-w-xs truncate text-xs" title={seller.address}>
                              {seller.address || '—'}
                            </td>

                            {/* 9. Lat/Long */}
                            <td className="p-3.5 font-mono text-[11px] whitespace-nowrap text-slate-400">
                              {seller.latitude != null && seller.longitude != null ? (
                                <a
                                  href={`https://www.google.com/maps?q=${seller.latitude},${seller.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:text-amber-400 underline"
                                >
                                  {seller.latitude.toFixed(4)}, {seller.longitude.toFixed(4)}
                                </a>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>

                            {/* 10. Business Status */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${seller.businessStatus === 'Active' || seller.businessStatus === 'Operational'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : seller.businessStatus === 'Closed'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : seller.businessStatus === 'Expanding'
                                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                  }`}
                              >
                                {seller.businessStatus === 'Active' ? 'Operational' : seller.businessStatus}
                              </span>
                            </td>

                            {/* 11. Verification Status */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border inline-flex items-center space-x-1 ${seller.verificationStatus === 'Google Maps Verified'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                  : seller.verificationStatus === 'GSTIN Verified'
                                    ? 'bg-teal-950/60 text-teal-300 border-teal-500/30'
                                    : seller.verificationStatus === 'ISO Certified'
                                      ? 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                                      : seller.verificationStatus === 'Unverified Listing'
                                        ? 'bg-slate-900 text-slate-400 border-slate-700'
                                        : 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                                  }`}
                              >
                                {seller.verificationStatus === 'Google Maps Verified' && (
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                )}
                                <span>{seller.verificationStatus}</span>
                              </span>
                            </td>

                            {/* 12. Operational Health */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-1.5">
                                  <span className="flex items-center text-amber-400 font-semibold font-mono text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    {seller.operationalHealth?.score || (seller.rating ? `★ ${seller.rating.toFixed(1)}` : '★ 4.2')}
                                  </span>
                                  {seller.reviewsCount !== undefined && seller.reviewsCount > 0 && (
                                    <span className="text-slate-400 text-[10px] font-mono">
                                      ({seller.reviewsCount.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded w-max border ${seller.operationalHealth?.healthGrade === 'A+'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : seller.operationalHealth?.healthGrade === 'A'
                                    ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}>
                                  {seller.operationalHealth?.supplyConsistency || 'Stable Supply'}
                                </span>
                              </div>
                            </td>

                            {/* 13. Trade Credit Terms */}
                            <td className="p-3.5 whitespace-nowrap font-mono text-[11px]">
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${(seller.tradeCreditTerms || '').includes('Net')
                                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                : 'bg-slate-900 text-slate-300 border-slate-700'
                                }`}>
                                {seller.tradeCreditTerms || (seller.b2bPricing?.paymentTerms || 'Offline Procurement Only')}
                              </span>
                            </td>

                            {/* 14. Actions */}
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-1">
                                {/* 1. Import */}
                                <button
                                  onClick={() => handleSaveSeller(seller)}
                                  title="Import to Workspace Profiles"
                                  className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/60 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 transition shadow-sm"
                                >
                                  <Bookmark className="w-3 h-3" />
                                  <span>Import</span>
                                </button>

                                {/* 2. Contact */}
                                <button
                                  onClick={() => {
                                    if (seller.phone) {
                                      window.open(getWhatsAppUrl(seller.phone, seller.businessName), '_blank');
                                    } else if (seller.email) {
                                      window.location.href = `mailto:${seller.email}`;
                                    } else if (seller.website) {
                                      window.open(seller.website.startsWith('http') ? seller.website : `https://${seller.website}`, '_blank');
                                    } else {
                                      setInspectingSeller(seller);
                                    }
                                  }}
                                  title="Contact / Launch Inquiry"
                                  className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 transition"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Contact</span>
                                </button>

                                {/* 3. Bookmark Toggle */}
                                <button
                                  onClick={() => handleToggleBookmarkSeller(seller.id)}
                                  title={bookmarkedSellerIds.includes(seller.id) ? "Bookmarked (Click to remove)" : "Bookmark Vendor"}
                                  className={`p-1 rounded border transition ${bookmarkedSellerIds.includes(seller.id)
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                                    }`}
                                >
                                  <Star className="w-3.5 h-3.5" fill={bookmarkedSellerIds.includes(seller.id) ? "currentColor" : "none"} />
                                </button>

                                {/* 4. Flag for Revisit */}
                                <button
                                  onClick={() => handleToggleFlagSeller(seller.id)}
                                  title={flaggedSellerIds.includes(seller.id) ? "Flagged for Revisit (Click to clear)" : "Flag for Revisit / Audit"}
                                  className={`p-1 rounded border transition ${flaggedSellerIds.includes(seller.id)
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-slate-800 text-slate-400 hover:text-rose-400 border-slate-700'
                                    }`}
                                >
                                  <Flag className="w-3.5 h-3.5" fill={flaggedSellerIds.includes(seller.id) ? "currentColor" : "none"} />
                                </button>

                                {/* 5. Inspect */}
                                <button
                                  onClick={() => setInspectingSeller(seller)}
                                  title="Inspect Enterprise Sourcing Card & Trade Terms"
                                  className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Enterprise Sourcing Details Modal Drawer */}
            {inspectingSeller && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                          {inspectingSeller.businessStatus === 'Active' ? 'Operational Channel' : inspectingSeller.businessStatus}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                          {inspectingSeller.verificationStatus}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1.5">{inspectingSeller.businessName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{inspectingSeller.category} • {inspectingSeller.productsServices}</p>
                      {inspectingSeller.rating && (
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="flex items-center text-amber-400 font-bold font-mono text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            ★ {inspectingSeller.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {inspectingSeller.reviewsCount ? `${inspectingSeller.reviewsCount.toLocaleString()} Verified Customer Reviews` : 'Verified Google Maps Listing'}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setInspectingSeller(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Omnichannel Direct Outreach Action Hub */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {inspectingSeller.phone ? (
                      <a
                        href={`tel:${inspectingSeller.phone}`}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center group transition"
                      >
                        <Phone className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-slate-400 font-medium">Direct Call</span>
                        <span className="text-xs text-white font-mono mt-0.5 truncate max-w-[120px]">{inspectingSeller.phone}</span>
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center opacity-50">
                        <Phone className="w-4 h-4 text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-500">Phone</span>
                        <span className="text-xs text-slate-600">Unlisted</span>
                      </div>
                    )}

                    {inspectingSeller.phone ? (
                      <a
                        href={getWhatsAppUrl(inspectingSeller.phone, inspectingSeller.businessName)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 flex flex-col items-center justify-center text-center group transition"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-emerald-300 font-medium">WhatsApp RFP</span>
                        <span className="text-xs text-emerald-200 font-mono mt-0.5">Send Inquiry</span>
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center opacity-50">
                        <MessageCircle className="w-4 h-4 text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-500">WhatsApp</span>
                        <span className="text-xs text-slate-600">Unavailable</span>
                      </div>
                    )}

                    {inspectingSeller.website ? (
                      <a
                        href={inspectingSeller.website.startsWith('http') ? inspectingSeller.website : `https://${inspectingSeller.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center group transition"
                      >
                        <Globe className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-slate-400 font-medium">Website</span>
                        <span className="text-xs text-cyan-300 font-mono mt-0.5 truncate max-w-[120px]">Visit Portal</span>
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center opacity-50">
                        <Globe className="w-4 h-4 text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-500">Website</span>
                        <span className="text-xs text-slate-600">In-Store Only</span>
                      </div>
                    )}

                    <a
                      href={`https://www.google.com/maps?q=${inspectingSeller.latitude},${inspectingSeller.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center group transition"
                    >
                      <Navigation className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] text-slate-400 font-medium">Maps Navigation</span>
                      <span className="text-xs text-amber-300 font-mono mt-0.5">{inspectingSeller.distanceKm} km away</span>
                    </a>
                  </div>

                  {/* Address & Geodesic Coordinates */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Physical Storefront & Showroom Location</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">{inspectingSeller.address}</p>
                    <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500 font-mono">
                      <span>Coordinates: {inspectingSeller.latitude.toFixed(4)}, {inspectingSeller.longitude.toFixed(4)}</span>
                      <span>Radial Distance: {inspectingSeller.distanceKm} km</span>
                    </div>
                  </div>

                  {/* B2B Procurement Terms */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                        <span>B2B Volume Pricing & Commercial Sourcing Terms</span>
                      </span>
                      <span className="text-[10px] text-teal-300 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        Corporate Quotation
                      </span>
                    </div>

                    {inspectingSeller.b2bPricing ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Wholesale Price</span>
                          <span className="text-sm font-bold text-teal-300 font-mono">{inspectingSeller.b2bPricing.wholesalePrice}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Minimum Order (MOQ)</span>
                          <span className="text-sm font-bold text-amber-300 font-mono">{inspectingSeller.b2bPricing.moq}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Trade Credit Terms</span>
                          <span className="text-xs font-semibold text-slate-300">{inspectingSeller.b2bPricing.paymentTerms || 'Net 30 on PO'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
                        <p className="font-semibold text-slate-300">Direct In-Store / Showroom Quote on Request</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Physical showroom channels provide direct negotiated discount lots, GST invoice generation (18% input credit), and local dispatch warranty.</p>
                      </div>
                    )}
                  </div>

                  {/* Deep Technographic Scan (If Website Exists) */}
                  {inspectingSeller.website && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-semibold text-white">Technographic & Web Intelligence</span>
                        </div>
                        <button
                          onClick={() => handleDeepEnrichSeller(inspectingSeller)}
                          disabled={deepEnrichingId === inspectingSeller.id}
                          className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center space-x-1 transition disabled:opacity-50"
                        >
                          {deepEnrichingId === inspectingSeller.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Scanning Web...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3" />
                              <span>Scan Tech Stack</span>
                            </>
                          )}
                        </button>
                      </div>

                      {sellerEnrichData[inspectingSeller.id] ? (
                        <div className="space-y-2 pt-1">
                          <div className="text-[11px] text-slate-300">
                            {sellerEnrichData[inspectingSeller.id].description || 'Active Web Commercial Portal'}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sellerEnrichData[inspectingSeller.id].technographics?.technologies?.map((tech: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono"
                              >
                                {tech.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Click "Scan Tech Stack" to run a zero-cost headless stealth crawl on {inspectingSeller.website.replace(/^https?:\/\//, '')} to detect CMS, payment gateways, analytics, and contact channels.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Drawer Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setInspectingSeller(null)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleSaveSeller(inspectingSeller);
                        setInspectingSeller(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30 transition"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Save Channel to Account Graph</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* Tab: Serverless Autonomous Studio & Social Scrapers (ENRICHER Core) */}
        {/* ============================================================== */}
        {activeTab === 'actors' && (
          <div className="mt-6 space-y-6">
            {/* Hero Header Card */}
            <div className="glass-panel p-6 sm:p-7 rounded-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      AUTONOMOUS ACTOR ARCHITECTURE
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                      ZERO PLATFORM FEES
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                      LIVE PROGRESS CONTEXT
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <span>Serverless Actor Studio & Social Scrapers</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Execute high-performance web and social scrapers locally. Crawl web content into clean Markdown for LLM/RAG pipelines, harvest public Instagram profiles & reels, and probe LinkedIn company intelligence with real-time execution telemetry.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Engine Cost</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono-tight">$0.00 / Run</div>
                  </div>
                </div>
              </div>

              {/* 6 Actor Scraper Engine Switchers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
                {/* Engine 1: Web Content Crawler */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectActorType('web_content', 'https://news.ycombinator.com');
                  }}
                  className={`p-3.5 rounded-xl text-left transition border ${actorType === 'web_content' ? 'bg-violet-950/40 border-violet-500/50 shadow-md shadow-violet-500/10' : 'bg-slate-900/50 border-white/[0.07] hover:border-white/15'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300">RAG Ready</span>
                  </div>
                  <div className="font-semibold text-white text-xs">Web Content Crawler</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">Clean Markdown, heading outlines, and metadata.</p>
                </button>

                {/* Engine 2: Instagram Scraper */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectActorType('instagram', 'nike');
                  }}
                  className={`p-3.5 rounded-xl text-left transition border ${actorType === 'instagram' ? 'bg-pink-950/40 border-pink-500/50 shadow-md shadow-pink-500/10' : 'bg-slate-900/50 border-white/[0.07] hover:border-white/15'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300">Public Intel</span>
                  </div>
                  <div className="font-semibold text-white text-xs">Instagram Scraper</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">Bio, verified badge, followers count & reels.</p>
                </button>

                {/* Engine 3: LinkedIn Scraper */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectActorType('linkedin', 'stripe');
                  }}
                  className={`p-3.5 rounded-xl text-left transition border ${actorType === 'linkedin' ? 'bg-sky-950/40 border-sky-500/50 shadow-md shadow-sky-500/10' : 'bg-slate-900/50 border-white/[0.07] hover:border-white/15'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
                      <LinkedinIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">Enterprise</span>
                  </div>
                  <div className="font-semibold text-white text-xs">LinkedIn Scanner</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">Company headcount, HQ, sector & specialties.</p>
                </button>

                {/* Engine 4: Facebook Page Intel */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectActorType('facebook', 'nike');
                  }}
                  className={`p-3.5 rounded-xl text-left transition border ${actorType === 'facebook' ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10' : 'bg-slate-900/50 border-white/[0.07] hover:border-white/15'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">Pages & Posts</span>
                  </div>
                  <div className="font-semibold text-white text-xs">Facebook Page Intel</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">Page likes, followers, contact & post views.</p>
                </button>

                {/* Engine 5: Meta Ad Library */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectActorType('meta_ads', 'nike');
                  }}
                  className={`p-3.5 rounded-xl text-left transition border ${actorType === 'meta_ads' ? 'bg-gradient-to-br from-blue-950/40 to-pink-950/40 border-pink-500/50 shadow-md shadow-pink-500/10' : 'bg-slate-900/50 border-white/[0.07] hover:border-white/15'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-pink-500/20 text-pink-300">
                      <MetaIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">FB & IG Ads</span>
                  </div>
                  <div className="font-semibold text-white text-xs">Meta Ad Library</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">Active FB/IG ad creatives, copy, CTA & reach.</p>
                </button>

                {/* Engine 6: 360° Omnichannel Lead Fusion */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectActorType('omnichannel_360', 'nike.com');
                  }}
                  className={`p-3.5 rounded-xl text-left transition border ${actorType === 'omnichannel_360' ? 'bg-gradient-to-br from-amber-950/40 via-violet-950/40 to-pink-950/40 border-amber-500/50 shadow-md shadow-amber-500/20' : 'bg-slate-900/50 border-white/[0.07] hover:border-white/15'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-violet-500/20 to-pink-500/20 text-amber-300">
                      <Radio className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border border-amber-500/30">360° Fusion</span>
                  </div>
                  <div className="font-semibold text-white text-xs">Omnichannel 360°</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">Web + FB + Meta Ads + IG + LI + Presence Score.</p>
                </button>
              </div>
            </div>

            {/* Input & Execution Bar */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {actorType === 'web_content' && <Globe className="w-4 h-4 text-violet-400" />}
                    {actorType === 'instagram' && <InstagramIcon className="w-4 h-4 text-pink-400" />}
                    {actorType === 'linkedin' && <LinkedinIcon className="w-4 h-4 text-sky-400" />}
                    {actorType === 'facebook' && <FacebookIcon className="w-4 h-4 text-blue-400" />}
                    {actorType === 'meta_ads' && <MetaIcon className="w-4 h-4 text-pink-400" />}
                    {actorType === 'omnichannel_360' && <Radio className="w-4 h-4 text-amber-400" />}
                  </div>
                  <input
                    type="text"
                    value={actorInput}
                    onChange={(e) => setActorInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRunActorScraper(); }}
                    placeholder={
                      actorType === 'web_content'
                        ? 'Enter target webpage URL (e.g. https://news.ycombinator.com, tech blogs, documentation...)'
                        : actorType === 'instagram'
                        ? 'Enter Instagram handle or URL (e.g. @nike, zara, apple, instagram.com/nike...)'
                        : actorType === 'linkedin'
                        ? 'Enter company name or URL (e.g. stripe, nvidia, airbnb, linkedin.com/company/stripe...)'
                        : actorType === 'facebook'
                        ? 'Enter Facebook page handle or URL (e.g. nike, cardekho, shopify, facebook.com/nike...)'
                        : actorType === 'meta_ads'
                        ? 'Enter advertiser brand or domain for Meta Ad Library (e.g. nike, cardekho, shopify, apple...)'
                        : 'Enter brand name or domain for 360° Omnichannel Sweep (e.g. nike.com, cardekho, shopify, stripe...)'
                    }
                    className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition"
                  />
                  {actorInput && (
                    <button
                      type="button"
                      onClick={() => setActorInput('')}
                      className="absolute inset-y-0 right-2 px-2 flex items-center text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={actorLoading || !actorInput.trim()}
                  onClick={() => handleRunActorScraper()}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-violet-600/30 transition flex items-center justify-center gap-2 shrink-0"
                >
                  {actorLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scraping...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Run Scraper Actor</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Quick Presets:</span>
                {actorType === 'web_content' && (
                  <>
                    <button
                      onClick={() => { setActorInput('https://news.ycombinator.com'); handleRunActorScraper('https://news.ycombinator.com'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Hacker News
                    </button>
                    <button
                      onClick={() => { setActorInput('https://en.wikipedia.org/wiki/Artificial_intelligence'); handleRunActorScraper('https://en.wikipedia.org/wiki/Artificial_intelligence'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Wikipedia: AI
                    </button>
                    <button
                      onClick={() => { setActorInput('https://github.blog'); handleRunActorScraper('https://github.blog'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      GitHub Blog
                    </button>
                  </>
                )}

                {actorType === 'instagram' && (
                  <>
                    <button
                      onClick={() => { setActorInput('nike'); handleRunActorScraper('nike', 'instagram'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      @nike
                    </button>
                    <button
                      onClick={() => { setActorInput('natgeo'); handleRunActorScraper('natgeo', 'instagram'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      @natgeo
                    </button>
                    <button
                      onClick={() => { setActorInput('zara'); handleRunActorScraper('zara', 'instagram'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      @zara
                    </button>
                  </>
                )}

                {actorType === 'linkedin' && (
                  <>
                    <button
                      onClick={() => { setActorInput('stripe'); handleRunActorScraper('stripe', 'linkedin'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Stripe
                    </button>
                    <button
                      onClick={() => { setActorInput('nvidia'); handleRunActorScraper('nvidia', 'linkedin'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      NVIDIA
                    </button>
                    <button
                      onClick={() => { setActorInput('airbnb'); handleRunActorScraper('airbnb', 'linkedin'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Airbnb
                    </button>
                  </>
                )}

                {actorType === 'facebook' && (
                  <>
                    <button
                      onClick={() => { setActorInput('nike'); handleRunActorScraper('nike', 'facebook'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Nike
                    </button>
                    <button
                      onClick={() => { setActorInput('cardekho'); handleRunActorScraper('cardekho', 'facebook'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      CarDekho
                    </button>
                    <button
                      onClick={() => { setActorInput('shopify'); handleRunActorScraper('shopify', 'facebook'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Shopify
                    </button>
                  </>
                )}

                {actorType === 'meta_ads' && (
                  <>
                    <button
                      onClick={() => { setActorInput('nike'); handleRunActorScraper('nike', 'meta_ads'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Nike (Active Ads)
                    </button>
                    <button
                      onClick={() => { setActorInput('shopify'); handleRunActorScraper('shopify', 'meta_ads'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Shopify (SaaS Ads)
                    </button>
                    <button
                      onClick={() => { setActorInput('cardekho'); handleRunActorScraper('cardekho', 'meta_ads'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      CarDekho (Auto Ads)
                    </button>
                    <button
                      onClick={() => { setActorInput('zara'); handleRunActorScraper('zara', 'meta_ads'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Zara (Fashion Ads)
                    </button>
                  </>
                )}

                {actorType === 'omnichannel_360' && (
                  <>
                    <button
                      onClick={() => { setActorInput('nike.com'); handleRunActorScraper('nike.com', 'omnichannel_360'); }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition font-medium"
                    >
                      ⚡ Nike (Global 360°)
                    </button>
                    <button
                      onClick={() => { setActorInput('cardekho.com'); handleRunActorScraper('cardekho.com', 'omnichannel_360'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      CarDekho (Auto 360°)
                    </button>
                    <button
                      onClick={() => { setActorInput('shopify.com'); handleRunActorScraper('shopify.com', 'omnichannel_360'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Shopify (SaaS 360°)
                    </button>
                    <button
                      onClick={() => { setActorInput('zara.com'); handleRunActorScraper('zara.com', 'omnichannel_360'); }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-300 transition"
                    >
                      Zara (Fashion 360°)
                    </button>
                  </>
                )}

                <div className="ml-auto flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-xs">
                    <input
                      type="checkbox"
                      checked={actorRenderJs}
                      onChange={(e) => setActorRenderJs(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-violet-500 focus:ring-0"
                    />
                    <span>Render JS (Stealth Browser)</span>
                  </label>
                </div>
              </div>

              {/* Dynamic /pages Discovery Strip (Web Content Crawler) */}
              {actorType === 'web_content' && (
                <div className="pt-3 border-t border-white/[0.07] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                      <FolderTree className="w-3.5 h-3.5 text-violet-400" />
                      <span>Target Site /Pages ({parsedWebTarget ? parsedWebTarget.hostname : 'Target Domain'}):</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Click any sub-path to crawl immediately</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { slug: '/about', icon: 'ℹ️' },
                      { slug: '/contact', icon: '📞' },
                      { slug: '/blog', icon: '✍️' },
                      { slug: '/feed', icon: '📡' },
                      { slug: '/pricing', icon: '💳' },
                      { slug: '/team', icon: '👥' },
                      { slug: '/careers', icon: '💼' },
                      { slug: '/docs', icon: '📖' },
                      { slug: '/terms', icon: '📜' },
                      { slug: '/privacy', icon: '🔒' },
                    ].map((item) => {
                      const origin = parsedWebTarget ? parsedWebTarget.origin : 'https://news.ycombinator.com';
                      const targetUrl = `${origin}${item.slug}`;
                      const isCurrent = actorInput.trim().replace(/\/$/, '').toLowerCase() === targetUrl.replace(/\/$/, '').toLowerCase();
                      return (
                        <button
                          key={item.slug}
                          type="button"
                          onClick={() => {
                            setActorInput(targetUrl);
                            handleRunActorScraper(targetUrl);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-500/30'
                              : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.10] hover:text-white hover:border-violet-500/30'
                          }`}
                          title={`Crawl ${targetUrl}`}
                        >
                          <span className="text-[11px]">{item.icon}</span>
                          <span>{item.slug}</span>
                        </button>
                      );
                    })}

                    {/* Additional Sub-pages Discovered From Live Crawl */}
                    {discoveredSubPages.map((slug) => {
                      const origin = parsedWebTarget ? parsedWebTarget.origin : 'https://news.ycombinator.com';
                      const targetUrl = `${origin}${slug}`;
                      const isCurrent = actorInput.trim().replace(/\/$/, '').toLowerCase() === targetUrl.replace(/\/$/, '').toLowerCase();
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => {
                            setActorInput(targetUrl);
                            handleRunActorScraper(targetUrl);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-xs font-mono transition border flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20 hover:text-white'
                          }`}
                          title={`Discovered link: ${targetUrl}`}
                        >
                          <span className="text-[9px] uppercase font-bold text-cyan-400">Found</span>
                          <span>{slug}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* LIVE PROGRESS CONTEXT COMPONENT (Step Telemetry Stream) */}
            {/* ============================================================== */}
            {(actorLoading || actorLogs.length > 0) && (
              <div className="glass-panel p-5 rounded-2xl space-y-4 border border-violet-500/20 bg-slate-950/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {actorLoading ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
                        </>
                      ) : actorError ? (
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      )}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                      Live Scraping Progress Context
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {actorLoading ? `${actorProgress}% active` : actorError ? 'Crawl halted' : '100% complete'}
                  </span>
                </div>

                {/* Progress Bar with Shimmer */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-300 ${actorError ? 'bg-rose-500' : 'progress-shimmer'}`}
                    style={{ width: `${actorProgress}%` }}
                  />
                </div>

                {/* 5-Stage Execution Breadcrumb */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                  <div className={`p-2 rounded-lg border ${actorProgress >= 20 ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' : 'bg-slate-900/40 border-white/[0.05] text-slate-500'}`}>
                    1. Engine Init
                  </div>
                  <div className={`p-2 rounded-lg border ${actorProgress >= 45 ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' : 'bg-slate-900/40 border-white/[0.05] text-slate-500'}`}>
                    2. Target Resolve
                  </div>
                  <div className={`p-2 rounded-lg border ${actorProgress >= 70 ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' : 'bg-slate-900/40 border-white/[0.05] text-slate-500'}`}>
                    3. DOM Extraction
                  </div>
                  <div className={`p-2 rounded-lg border ${actorProgress >= 90 ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' : 'bg-slate-900/40 border-white/[0.05] text-slate-500'}`}>
                    4. Data Format
                  </div>
                  <div className={`p-2 rounded-lg border ${actorProgress >= 100 && !actorError ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : actorError ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-slate-900/40 border-white/[0.05] text-slate-500'}`}>
                    5. Verified Ready
                  </div>
                </div>

                {/* Real-time Telemetry Terminal Box */}
                <div className="rounded-xl bg-slate-950 p-3.5 border border-white/[0.08] font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                  {actorLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-500 shrink-0 text-[10px]">[{log.time}]</span>
                      <span
                        className={
                          log.status === 'success'
                            ? 'text-emerald-400'
                            : log.status === 'error'
                            ? 'text-rose-400'
                            : log.status === 'warn'
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }
                      >
                        {log.stage}
                      </span>
                    </div>
                  ))}
                  {actorLoading && (
                    <div className="flex items-center gap-2 text-violet-400 text-[11px] animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>{actorCurrentStage || 'Processing DOM evaluation...'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {actorError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{actorError}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* RICH RESULTS VIEW: WEB CONTENT CRAWLER */}
            {/* ============================================================== */}
            {actorResult && actorType === 'web_content' && (actorResult.actorType === 'web_content' || actorResult.markdown) && (
              <div className="space-y-6">
                {/* Result Top Summary Card */}
                <div className="glass-panel p-6 rounded-2xl relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/[0.07]">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{actorResult.title || 'Extracted Web Page'}</span>
                        <a
                          href={actorResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {actorResult.description || actorResult.url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Smart Enrich Button */}
                      <button
                        onClick={handleEnrichWebContent}
                        disabled={enrichingContent}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 via-pink-600 to-violet-600 hover:from-amber-400 hover:via-pink-500 hover:to-violet-500 text-white transition flex items-center gap-1.5 shadow-md shadow-pink-600/30"
                        title="Synthesize and refine raw page text into structured executive intelligence"
                      >
                        {enrichingContent ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Refining Content...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            <span>{actorResult.refinedData ? '✨ Re-Refine Content' : '✨ Smart Enrich & Refine'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyMarkdown(actorResult.markdown)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600/90 hover:bg-violet-600 text-white transition flex items-center gap-1.5 shadow-sm shadow-violet-500/20"
                      >
                        {actorMarkdownCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{actorMarkdownCopied ? 'Copied Markdown!' : 'Copy Markdown'}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadMarkdown(actorResult.markdown, actorResult.title || 'crawl')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-slate-200 transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .md</span>
                      </button>

                      <button
                        onClick={() => handleSaveActorToProfiles(actorResult, 'web_content')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600/90 hover:bg-cyan-600 text-white transition flex items-center gap-1.5"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save to Profiles</span>
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-[10px] font-mono uppercase">Word Count</div>
                      <div className="text-lg font-bold text-white font-mono-tight">{actorResult.wordCount.toLocaleString()} words</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-[10px] font-mono uppercase">Reading Time</div>
                      <div className="text-lg font-bold text-white font-mono-tight">~{actorResult.readTimeMinutes} min</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-[10px] font-mono uppercase">Headings Found</div>
                      <div className="text-lg font-bold text-white font-mono-tight">{actorResult.headings?.length || 0} headings</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-[10px] font-mono uppercase">Crawl Engine</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono-tight uppercase text-xs pt-1">{actorResult.crawlMode}</div>
                    </div>
                  </div>
                </div>

                {/* Content View Tabs & Markdown Split/Preview Workspace */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          if (!actorResult.refinedData) {
                            handleEnrichWebContent();
                          } else {
                            setActorViewTab('refined');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                          actorViewTab === 'refined'
                            ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-md shadow-pink-500/25'
                            : 'text-amber-300 hover:text-white bg-amber-500/10 border border-amber-500/20'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>✨ Refined Intelligence {actorResult.refinedData ? '✓' : ''}</span>
                      </button>
                      <button
                        onClick={() => setActorViewTab('preview')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${actorViewTab === 'preview' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Formatted Markdown & Preview
                      </button>
                      <button
                        onClick={() => setActorViewTab('headings')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${actorViewTab === 'headings' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Heading Outline ({actorResult.headings?.length || 0})
                      </button>
                      <button
                        onClick={() => setActorViewTab('json')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${actorViewTab === 'json' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Raw JSON Payload
                      </button>
                    </div>

                    {/* Corner Controls for Formatted Markdown & Preview */}
                    {actorViewTab === 'preview' && (
                      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => setMarkdownPreviewMode('source_only')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                            markdownPreviewMode === 'source_only'
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          }`}
                          title="Markdown Editor only"
                        >
                          Markdown Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setMarkdownPreviewMode('split')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                            markdownPreviewMode === 'split'
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          }`}
                          title="Side-by-side Split View"
                        >
                          <Columns className="w-3 h-3" />
                          <span>Split View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMarkdownPreviewMode('preview_only')}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                            markdownPreviewMode === 'preview_only'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white/[0.06] text-white hover:bg-violet-600/60 border border-white/10'
                          }`}
                          title="Full Rendered Preview"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Full Preview</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Formatted Markdown Split & Full Preview Modes */}
                  {actorViewTab === 'preview' && (
                    <div className="space-y-3">
                      {/* Sub-header Bar with Corner Switch matching user mock */}
                      <div className="flex items-center justify-between px-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {markdownPreviewMode === 'split' && 'Side-by-Side Editor & Live Rendered Preview'}
                            {markdownPreviewMode === 'preview_only' && 'Full Rendered Document Preview'}
                            {markdownPreviewMode === 'source_only' && 'Raw Markdown Source Editor'}
                          </span>
                        </div>

                        {/* Direct Corner Switch Action */}
                        <div className="flex items-center gap-2">
                          {markdownPreviewMode === 'split' ? (
                            <button
                              type="button"
                              onClick={() => setMarkdownPreviewMode('preview_only')}
                              className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm shadow-violet-500/30 border border-violet-400/30 transition"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Full Preview</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setMarkdownPreviewMode('split')}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-semibold flex items-center gap-1.5 border border-white/10 transition"
                            >
                              <Columns className="w-3.5 h-3.5 text-violet-400" />
                              <span>Split View</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mode 1: Split View */}
                      {markdownPreviewMode === 'split' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                          {/* Left Column: Markdown Editor / Source */}
                          <div className="flex flex-col rounded-xl border border-white/[0.08] bg-slate-950/90 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-white/[0.08] text-xs">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 font-mono text-[11px] font-semibold border border-violet-500/20">
                                  Markdown Editor
                                </span>
                                <span className="text-slate-400 font-mono text-[10px]">
                                  {actorResult.markdown?.length || 0} chars
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyMarkdown(actorResult.markdown)}
                                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition"
                              >
                                {actorMarkdownCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{actorMarkdownCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <div className="p-4 flex-1 max-h-[640px] overflow-y-auto scrollbar-thin text-xs font-mono text-violet-200/90 leading-relaxed whitespace-pre-wrap select-text selection:bg-violet-500/30">
                              {actorResult.markdown}
                            </div>
                            <div className="px-4 py-2 bg-slate-900/60 border-t border-white/[0.06] text-[10px] text-slate-500 font-mono flex items-center justify-between">
                              <span>Tip: Use corner button to switch to Full Preview</span>
                              <span>{actorResult.markdown?.split('\n').length || 0} lines</span>
                            </div>
                          </div>

                          {/* Right Column: Rendered Preview */}
                          <div className="flex flex-col rounded-xl border border-white/[0.08] bg-slate-900/60 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/[0.08] text-xs">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-500/20">
                                  Preview
                                </span>
                                <span className="text-slate-400 font-mono text-[10px]">
                                  {actorResult.wordCount?.toLocaleString()} words
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setMarkdownPreviewMode('preview_only')}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-mono flex items-center gap-1 border border-white/10 transition"
                                title="Expand to Full Preview"
                              >
                                <Maximize2 className="w-3 h-3 text-violet-400" />
                                <span>Full Preview</span>
                              </button>
                            </div>
                            <div className="p-6 flex-1 max-h-[640px] overflow-y-auto scrollbar-thin text-slate-200 selection:bg-violet-500/30">
                              <RenderedMarkdownView markdown={actorResult.markdown} />
                            </div>
                            <div className="px-4 py-2 bg-slate-900/40 border-t border-white/[0.06] text-[10px] text-slate-500 font-mono flex items-center justify-between">
                              <span>~{actorResult.readTimeMinutes} min read</span>
                              <span>{actorResult.headings?.length || 0} headings detected</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mode 2: Full Preview Only */}
                      {markdownPreviewMode === 'preview_only' && (
                        <div className="flex flex-col rounded-xl border border-white/[0.08] bg-slate-900/70 overflow-hidden shadow-sm">
                          <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-white/[0.08] text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Full Rendered Web Preview</span>
                              </span>
                              <span className="text-slate-400 font-mono text-xs">
                                {actorResult.wordCount?.toLocaleString()} words · ~{actorResult.readTimeMinutes} min read · {actorResult.headings?.length || 0} headings
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setMarkdownPreviewMode('split')}
                              className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm shadow-violet-500/30 border border-violet-400/30 transition"
                            >
                              <Columns className="w-3.5 h-3.5" />
                              <span>Split View</span>
                            </button>
                          </div>
                          <div className="p-8 max-h-[750px] overflow-y-auto scrollbar-thin text-slate-200 selection:bg-violet-500/30">
                            <RenderedMarkdownView markdown={actorResult.markdown} />
                          </div>
                        </div>
                      )}

                      {/* Mode 3: Source / Editor Only */}
                      {markdownPreviewMode === 'source_only' && (
                        <div className="flex flex-col rounded-xl border border-white/[0.08] bg-slate-950/95 overflow-hidden shadow-sm">
                          <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-white/[0.08] text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 text-violet-300 font-mono text-xs font-semibold border border-violet-500/20 flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5 text-violet-400" />
                                <span>Markdown Source Editor</span>
                              </span>
                              <span className="text-slate-400 font-mono text-xs">
                                {actorResult.markdown?.length || 0} characters · {actorResult.markdown?.split('\n').length || 0} lines
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyMarkdown(actorResult.markdown)}
                                className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.10] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 border border-white/10 transition"
                              >
                                {actorMarkdownCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{actorMarkdownCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setMarkdownPreviewMode('split')}
                                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-white/10 transition"
                              >
                                <Columns className="w-3 h-3 text-violet-400" />
                                <span>Split View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setMarkdownPreviewMode('preview_only')}
                                className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm shadow-violet-500/30 border border-violet-400/30 transition"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Full Preview</span>
                              </button>
                            </div>
                          </div>
                          <div className="p-6 max-h-[750px] overflow-y-auto scrollbar-thin text-xs font-mono text-violet-200/90 leading-relaxed whitespace-pre-wrap select-text selection:bg-violet-500/30">
                            {actorResult.markdown}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Headings Hierarchy Outline */}
                  {actorViewTab === 'headings' && (
                    <div className="p-5 rounded-xl bg-slate-950/80 border border-white/[0.06] max-h-[600px] overflow-y-auto space-y-2 scrollbar-thin">
                      {actorResult.headings?.length > 0 ? (
                        actorResult.headings.map((h: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs"
                            style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
                          >
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-violet-300">
                              H{h.level}
                            </span>
                            <span className="text-white font-medium">{h.text}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-xs">No explicit H1-H4 headings found.</p>
                      )}
                    </div>
                  )}

                  {/* Raw JSON */}
                  {actorViewTab === 'json' && (
                    <div className="p-5 rounded-xl bg-slate-950/90 border border-white/[0.06] max-h-[600px] overflow-y-auto scrollbar-thin">
                      <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap select-text">
                        {JSON.stringify(actorResult, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* ========================================================== */}
                  {/* Refined Intelligence Dossier View */}
                  {/* ========================================================== */}
                  {actorViewTab === 'refined' && (
                    <div className="space-y-5">
                      {actorResult.refinedData ? (
                        <div className="space-y-5">
                          {/* Executive Overview Header Card */}
                          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/50 via-slate-900/80 to-pink-950/30 border border-violet-500/30 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                                  <Sparkles className="w-5 h-5 text-yellow-200" />
                                </div>
                                <div>
                                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>Executive Intelligence Briefing</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                      {actorResult.refinedData.refinementSource === 'ai_synthesis' ? '🤖 Live AI Synthesis' : '⚡ Smart NLP Refined'}
                                    </span>
                                  </h4>
                                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                                    Synthesized from {actorResult.wordCount?.toLocaleString()} words • {actorResult.refinedData.industrySector}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyRefinedBriefing(actorResult.refinedData)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white transition flex items-center gap-1.5"
                                >
                                  {refinedBriefingCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{refinedBriefingCopied ? 'Copied Briefing!' : 'Copy Briefing'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveActorToProfiles(actorResult, 'web_content')}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-violet-600/30"
                                >
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>Save Refined Intel to CRM</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPitchModal({
                                    companyName: actorResult.refinedData?.brandName || actorResult.title || 'Web Lead',
                                    domain: actorResult.url,
                                    valueProposition: actorResult.refinedData?.valueProposition,
                                    industry: actorResult.refinedData?.industrySector,
                                    coreOfferings: actorResult.refinedData?.coreOfferings,
                                    refinedData: actorResult.refinedData,
                                  })}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white transition flex items-center gap-1.5 shadow-md shadow-pink-500/20"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>⚡ AI Sales Pitch</span>
                                </button>
                              </div>
                            </div>

                            {/* Core Value Proposition Quote Box */}
                            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20">
                              <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-semibold mb-1">
                                Core Value Proposition:
                              </div>
                              <p className="text-sm text-amber-100 font-medium leading-relaxed italic">
                                &quot;{actorResult.refinedData.valueProposition}&quot;
                              </p>
                            </div>

                            {/* Executive Summary */}
                            <div className="space-y-1.5">
                              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">Executive Summary:</div>
                              <p className="text-xs text-slate-200 leading-relaxed max-w-4xl">
                                {actorResult.refinedData.executiveSummary}
                              </p>
                            </div>

                            {/* Target Audience & Industry Chips */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                                  🎯
                                </div>
                                <div>
                                  <div className="text-[10px] font-mono uppercase text-slate-400">Target Audience / ICP</div>
                                  <div className="text-xs font-bold text-white mt-0.5">{actorResult.refinedData.targetAudience}</div>
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                                  🏢
                                </div>
                                <div>
                                  <div className="text-[10px] font-mono uppercase text-slate-400">Industry Sector</div>
                                  <div className="text-xs font-bold text-white mt-0.5">{actorResult.refinedData.industrySector}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2-Column Grid: Offerings & Commercial Signals */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Core Offerings & Features */}
                            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.07] space-y-3">
                              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Core Products & Offerings ({actorResult.refinedData.coreOfferings?.length || 0})</span>
                              </div>
                              <div className="space-y-2">
                                {actorResult.refinedData.coreOfferings?.map((item: string, idx: number) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] text-xs text-slate-200 flex items-start gap-2">
                                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Pricing & Commercial Signals */}
                            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.07] space-y-3">
                              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                                <DollarSign className="w-4 h-4 text-amber-400" />
                                <span>Pricing & Commercial Signals</span>
                              </div>
                              <div className="space-y-2">
                                {actorResult.refinedData.pricingSignals?.map((sig: string, idx: number) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] text-xs text-amber-200 flex items-center gap-2">
                                    <span className="text-amber-400 font-bold font-mono">💳</span>
                                    <span className="font-mono text-xs">{sig}</span>
                                  </div>
                                ))}
                                {actorResult.refinedData.technologySignals?.length > 0 && (
                                  <div className="pt-2 border-t border-white/[0.06]">
                                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Detected Technology Stack:</div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {actorResult.refinedData.technologySignals.map((tech: string, idx: number) => (
                                        <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contacts & Strategic Takeaways */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Extracted Contact Footprint */}
                            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.07] space-y-3">
                              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                                <Mail className="w-4 h-4 text-cyan-400" />
                                <span>Discovered Contact Footprint</span>
                              </div>
                              <div className="space-y-2 text-xs">
                                {actorResult.refinedData.contacts?.emails?.length > 0 ? (
                                  actorResult.refinedData.contacts.emails.map((em: string, idx: number) => (
                                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] flex items-center justify-between">
                                      <a href={`mailto:${em}`} className="text-cyan-400 hover:underline flex items-center gap-1.5 truncate">
                                        <Mail className="w-3.5 h-3.5 shrink-0" />
                                        <span>{em}</span>
                                      </a>
                                      <button
                                        onClick={() => navigator.clipboard.writeText(em)}
                                        className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/[0.05]"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-slate-400 text-xs italic">No explicit email addresses found on this page.</div>
                                )}

                                {actorResult.refinedData.contacts?.phones?.map((ph: string, idx: number) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] flex items-center justify-between">
                                    <a href={`tel:${ph}`} className="text-slate-200 hover:text-white flex items-center gap-1.5 font-mono">
                                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>{ph}</span>
                                    </a>
                                  </div>
                                ))}

                                {actorResult.refinedData.contacts?.locations?.map((loc: string, idx: number) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] flex items-center gap-1.5 text-slate-300">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{loc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Strategic Takeaways for RevOps / Research */}
                            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.07] space-y-3">
                              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                                <TrendingUp className="w-4 h-4 text-pink-400" />
                                <span>Actionable Strategic Takeaways</span>
                              </div>
                              <div className="space-y-2">
                                {actorResult.refinedData.keyTakeaways?.map((takeaway: string, idx: number) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] text-xs text-slate-300 flex items-start gap-2">
                                    <span className="text-pink-400 font-bold shrink-0">💡</span>
                                    <span>{takeaway}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Empty State prompt to trigger refinement */
                        <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-white/10 text-center space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-300 mx-auto flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                          </div>
                          <div className="max-w-md mx-auto space-y-1">
                            <h4 className="text-base font-bold text-white">Smart Content Refinery</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Transform the {actorResult.wordCount?.toLocaleString()} words of raw crawled content into an executive intelligence briefing with core value proposition, key offerings, ICP, pricing, and strategic takeaways.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleEnrichWebContent}
                            disabled={enrichingContent}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 via-pink-600 to-violet-600 hover:from-amber-400 hover:via-pink-500 hover:to-violet-500 text-white transition inline-flex items-center gap-2 shadow-lg shadow-pink-600/30"
                          >
                            {enrichingContent ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Refining Content...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span>Enrich & Refine This Page Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* RICH RESULTS VIEW: INSTAGRAM SCRAPER */}
            {/* ============================================================== */}
            {actorResult && actorType === 'instagram' && (actorResult.actorType === 'instagram' || actorResult.username) && (
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="glass-panel p-6 sm:p-7 rounded-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-white/[0.07]">
                    <div className="flex items-center gap-4">
                      {actorResult.profilePicUrl ? (
                        <img
                          src={actorResult.profilePicUrl}
                          alt={actorResult.username || 'Instagram Profile'}
                          className="w-16 h-16 rounded-full object-cover border-2 border-pink-500/40 shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {actorResult.username ? actorResult.username.charAt(0).toUpperCase() : 'IG'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{actorResult.fullName || actorResult.username || 'Instagram Profile'}</h3>
                          {actorResult.isVerified && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-400" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-mono text-pink-400 mt-0.5">@{actorResult.username || 'user'}</div>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl">{actorResult.biography}</p>
                        {actorResult.externalUrl && (
                          <a
                            href={actorResult.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline mt-1 font-mono"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{actorResult.externalUrl}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={actorResult.username ? `https://www.instagram.com/${actorResult.username}/` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Instagram Page</span>
                      </a>

                      <button
                        onClick={() => handleSaveActorToProfiles(actorResult, 'instagram')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white transition flex items-center gap-1.5 shadow-md shadow-pink-600/30"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save to CRM Profiles</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Counters */}
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                      <div className="text-slate-400 text-xs font-mono uppercase">Followers</div>
                      <div className="text-2xl font-bold text-white font-mono-tight mt-1">{actorResult.followersFormatted || '0'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">({actorResult.followersCount?.toLocaleString ? actorResult.followersCount.toLocaleString() : (actorResult.followersCount || 0)} exact)</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                      <div className="text-slate-400 text-xs font-mono uppercase">Following</div>
                      <div className="text-2xl font-bold text-white font-mono-tight mt-1">{actorResult.followingFormatted || '0'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                      <div className="text-slate-400 text-xs font-mono uppercase">Total Posts</div>
                      <div className="text-2xl font-bold text-white font-mono-tight mt-1">{actorResult.postsCount?.toLocaleString ? actorResult.postsCount.toLocaleString() : (actorResult.postsCount || 0)}</div>
                    </div>
                  </div>

                  {/* Hashtags Cloud */}
                  {actorResult.hashtags?.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/[0.07]">
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Extracted Brand Hashtags:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {actorResult.hashtags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-xs font-mono bg-pink-500/10 text-pink-300 border border-pink-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Posts Grid */}
                {actorResult.posts?.length > 0 && (
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <InstagramIcon className="w-4 h-4 text-pink-400" />
                      <span>Recent Public Posts & Media ({actorResult.posts.length})</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {actorResult.posts.map((post: any) => (
                        <div
                          key={post.id}
                          className="rounded-xl bg-slate-900/70 border border-white/[0.07] overflow-hidden flex flex-col justify-between hover:border-pink-500/30 transition group"
                        >
                          <div>
                            {post.thumbnailUrl && (
                              <div className="relative h-44 bg-slate-950 overflow-hidden">
                                <img
                                  src={post.thumbnailUrl}
                                  alt={post.caption || 'Instagram Post'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/80 text-pink-300 uppercase">
                                  {post.type}
                                </span>
                              </div>
                            )}
                            <div className="p-3.5">
                              <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                                {post.caption || 'Public Instagram post update'}
                              </p>
                              {post.hashtags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {post.hashtags.slice(0, 3).map((h: string, idx: number) => (
                                    <span key={idx} className="text-[10px] font-mono text-pink-400">
                                      {h}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-3.5 pt-0">
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                            >
                              <span>View on Instagram</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* RICH RESULTS VIEW: LINKEDIN COMPANY SCANNER */}
            {/* ============================================================== */}
            {actorResult && actorType === 'linkedin' && (actorResult.actorType === 'linkedin' || actorResult.companyName) && (
              <div className="space-y-6">
                <div className="glass-panel p-6 sm:p-7 rounded-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-white/[0.07]">
                    <div className="flex items-center gap-4">
                      {actorResult.logoUrl ? (
                        <img
                          src={actorResult.logoUrl}
                          alt={actorResult.companyName || 'Company'}
                          className="w-16 h-16 rounded-xl object-contain bg-white p-2 border border-sky-500/30 shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-800 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          <LinkedinIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{actorResult.companyName || 'Company Profile'}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            LinkedIn Company
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{actorResult.industry || 'Business Services'}</div>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">{actorResult.tagline || ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={actorResult.linkedinUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>LinkedIn Page</span>
                      </a>

                      <button
                        onClick={() => handleSaveActorToProfiles(actorResult, 'linkedin')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition flex items-center gap-1.5 shadow-md shadow-sky-600/30"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save to CRM Profiles</span>
                      </button>
                    </div>
                  </div>

                  {/* Company Metrics Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-xs font-mono uppercase">Headcount / Size</div>
                      <div className="text-lg font-bold text-sky-300 font-mono-tight mt-1">{actorResult.companySize}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-xs font-mono uppercase">Headquarters</div>
                      <div className="text-lg font-bold text-white font-mono-tight mt-1 truncate">{actorResult.headquarters}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-xs font-mono uppercase">Industry Sector</div>
                      <div className="text-lg font-bold text-white font-mono-tight mt-1 truncate">{actorResult.industry}</div>
                    </div>
                  </div>

                  {/* About Summary & Specialties */}
                  <div className="mt-5 pt-4 border-t border-white/[0.07] space-y-3">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">About Company:</div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{actorResult.aboutSummary}</p>

                    {actorResult.specialties?.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Specialties:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {actorResult.specialties.map((s: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* RICH RESULTS VIEW: FACEBOOK PAGE HARVESTER */}
            {/* ============================================================== */}
            {actorResult && actorType === 'facebook' && (actorResult.actorType === 'facebook' || actorResult.pageName) && (
              <div className="space-y-6">
                <div className="glass-panel p-6 sm:p-7 rounded-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-white/[0.07]">
                    <div className="flex items-center gap-4">
                      {actorResult.profilePicUrl ? (
                        <img
                          src={actorResult.profilePicUrl}
                          alt={actorResult.pageName || 'Facebook Page'}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/40 shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          <FacebookIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{actorResult.pageName}</h3>
                          {actorResult.isVerified && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-400" />
                              <span>Verified Page</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-blue-400 mt-0.5">{actorResult.category || 'Facebook Business Page'}</div>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-2 leading-relaxed">{actorResult.about || actorResult.intro}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={actorResult.pageUrl || `https://www.facebook.com/${actorResult.pageSlug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View on Facebook</span>
                      </a>

                      <button
                        onClick={() => handleSaveActorToProfiles(actorResult, 'facebook')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save to CRM Profiles</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                      <div className="text-slate-400 text-xs font-mono uppercase">Page Likes</div>
                      <div className="text-2xl font-bold text-white font-mono-tight mt-1">{actorResult.likesFormatted || '0'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">({actorResult.likesCount?.toLocaleString() || 0} exact)</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                      <div className="text-slate-400 text-xs font-mono uppercase">Followers</div>
                      <div className="text-2xl font-bold text-blue-400 font-mono-tight mt-1">{actorResult.followersFormatted || '0'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">({actorResult.followersCount?.toLocaleString() || 0} exact)</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                      <div className="text-slate-400 text-xs font-mono uppercase">Public Posts</div>
                      <div className="text-2xl font-bold text-white font-mono-tight mt-1">{actorResult.posts?.length || 0}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Recent Analyzed</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-center">
                      <div className="text-slate-400 text-xs font-mono uppercase">Business Type</div>
                      <div className="text-sm font-bold text-white font-mono-tight mt-2 truncate">{actorResult.category || 'Commercial'}</div>
                    </div>
                  </div>

                  {/* Contact & Location Strip */}
                  {(actorResult.website || actorResult.address || actorResult.phone || actorResult.email) && (
                    <div className="mt-5 pt-4 border-t border-white/[0.07] flex flex-wrap gap-4 text-xs">
                      {actorResult.website && (
                        <a href={actorResult.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:underline">
                          <Globe className="w-3.5 h-3.5" />
                          <span>{actorResult.website}</span>
                        </a>
                      )}
                      {actorResult.address && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{actorResult.address}</span>
                        </div>
                      )}
                      {actorResult.email && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{actorResult.email}</span>
                        </div>
                      )}
                      {actorResult.phone && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{actorResult.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Public Posts with View Telemetry */}
                {actorResult.posts?.length > 0 && (
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <FacebookIcon className="w-4 h-4 text-blue-400" />
                        <span>Recent Public Posts & Video Views ({actorResult.posts.length})</span>
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">Engagement & Reach Telemetry</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {actorResult.posts.map((post: any) => (
                        <div
                          key={post.id}
                          className="rounded-xl bg-slate-900/70 border border-white/[0.07] p-4 flex flex-col justify-between hover:border-blue-500/30 transition group space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px] uppercase font-semibold">
                              {post.type}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{post.timestamp}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                            {post.content}
                          </p>

                          {/* Engagement & Views Counters */}
                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-3 text-slate-300 text-[11px]">
                              <span>👍 {post.likesCount?.toLocaleString()}</span>
                              <span>💬 {post.commentsCount?.toLocaleString()}</span>
                              <span>🔁 {post.sharesCount?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <Eye className="w-3 h-3" />
                              <span>~{post.viewsCount?.toLocaleString()} views</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* RICH RESULTS VIEW: META AD LIBRARY (FB & IG ADS) */}
            {/* ============================================================== */}
            {actorResult && actorType === 'meta_ads' && (actorResult.actorType === 'meta_ads' || actorResult.ads) && (
              <div className="space-y-6">
                {/* Advertiser Top Overview Banner */}
                <div className="glass-panel p-6 sm:p-7 rounded-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-white/[0.07]">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg border border-white/20">
                        <MetaIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{actorResult.pageName || actorResult.query}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Active Meta Advertiser</span>
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
                          <span>Ad Library Query: &quot;{actorResult.query}&quot;</span>
                          <span>·</span>
                          <span>Platforms: {actorResult.platformsDetected?.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={actorResult.adLibraryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect in Meta Ad Library</span>
                      </a>

                      <button
                        onClick={() => handleSaveActorToProfiles(actorResult, 'meta_ads')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save to CRM Profiles</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Counters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-xs font-mono uppercase">Total Active Campaigns</div>
                      <div className="text-2xl font-bold text-white font-mono-tight mt-1">~{actorResult.totalActiveAds} active ads</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-xs font-mono uppercase">Omnichannel Distribution</div>
                      <div className="text-lg font-bold text-pink-400 font-mono-tight mt-1 flex items-center gap-2">
                        <FacebookIcon className="w-4 h-4 text-blue-400" />
                        <InstagramIcon className="w-4 h-4 text-pink-400" />
                        <span className="text-xs text-white">FB + Instagram</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <div className="text-slate-400 text-xs font-mono uppercase">Ad Creative Transparency</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono-tight mt-1">Zero Platform Fees (Public)</div>
                    </div>
                  </div>
                </div>

                {/* Active Ad Cards Grid */}
                {actorResult.ads?.length > 0 && (
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Active Facebook & Instagram Ad Creatives ({actorResult.ads.length})</span>
                      </h4>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/[0.08] text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setAdPlatformFilter('all')}
                          className={`px-2.5 py-1 rounded-lg transition ${adPlatformFilter === 'all' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          All ({actorResult.ads.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdPlatformFilter('facebook')}
                          className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${adPlatformFilter === 'facebook' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          <FacebookIcon className="w-3 h-3" />
                          <span>Facebook</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdPlatformFilter('instagram')}
                          className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${adPlatformFilter === 'instagram' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          <InstagramIcon className="w-3 h-3" />
                          <span>Instagram</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {actorResult.ads
                        .filter((ad: any) => {
                          if (adPlatformFilter === 'facebook') return ad.platforms?.includes('facebook');
                          if (adPlatformFilter === 'instagram') return ad.platforms?.includes('instagram');
                          return true;
                        })
                        .map((ad: any) => (
                          <div
                            key={ad.adId}
                            className="rounded-2xl bg-slate-900/80 border border-white/[0.08] overflow-hidden flex flex-col justify-between hover:border-violet-500/40 transition group shadow-md"
                          >
                            {/* Card Top: Page Info & Platforms */}
                            <div className="p-4 border-b border-white/[0.06] bg-slate-950/40">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                                    {ad.pageName?.charAt(0) || 'M'}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-white leading-tight">{ad.pageName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">Started {ad.startDate}</div>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase">
                                  Active
                                </span>
                              </div>

                              {/* Platform badges */}
                              <div className="flex items-center gap-1.5 mt-2.5">
                                {ad.platforms?.map((p: string) => (
                                  <span
                                    key={p}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 border ${
                                      p === 'facebook'
                                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                        : p === 'instagram'
                                        ? 'bg-pink-500/10 text-pink-300 border-pink-500/20'
                                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                    }`}
                                  >
                                    {p === 'facebook' && <FacebookIcon className="w-2.5 h-2.5" />}
                                    {p === 'instagram' && <InstagramIcon className="w-2.5 h-2.5" />}
                                    <span className="capitalize">{p}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Card Middle: Ad Creative & Copy */}
                            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                              <div className="space-y-2">
                                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                                  {ad.adCreative?.body}
                                </p>
                              </div>

                              {/* Creative Media / Graphic Placeholder */}
                              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] space-y-1.5">
                                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                  {ad.adCreative?.caption || 'advertiser.com'}
                                </div>
                                <div className="text-xs font-bold text-white line-clamp-1">
                                  {ad.adCreative?.headline}
                                </div>
                                <a
                                  href={ad.adCreative?.linkUrl || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-between transition"
                                >
                                  <span>{ad.adCreative?.ctaText || 'Learn More'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              {/* Telemetry Footer: Impressions & Ad ID */}
                              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span className="flex items-center gap-1 text-amber-300 font-medium">
                                  <Eye className="w-3 h-3" />
                                  <span>{ad.reachOrViews?.impressionsRange}</span>
                                </span>
                                <a
                                  href={ad.adArchiveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-white underline underline-offset-2"
                                >
                                  Ad ID: {ad.adId.slice(-8)}
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Engine 6: 360° Omnichannel Lead Fusion Results */}
            {actorResult && actorType === 'omnichannel_360' && (actorResult.actorType === 'omnichannel_360' || actorResult.digitalPresenceScore !== undefined) && (
              <div className="space-y-6">
                {/* 360° Command Center Hero Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-violet-950/50 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-950/20">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5" />
                          <span>360° Omnichannel Command Dossier</span>
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {actorResult.industrySector || 'Commercial Enterprise'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ● Zero-Cost Headless Live
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-amber-500/20">
                          {actorResult.brandName?.charAt(0)?.toUpperCase() || '3'}
                        </div>
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <span>{actorResult.brandName}</span>
                            {actorResult.facebookIntel?.isVerified || actorResult.instagramIntel?.isVerified ? (
                              <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                            ) : null}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                            <span className="text-slate-300">{actorResult.domain}</span>
                            <span>•</span>
                            <span>Swept at {new Date(actorResult.sweptAt || Date.now()).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Channels Detected Pills */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-xs text-slate-400 font-mono uppercase">Detected:</span>
                        {actorResult.channelsDetected?.map((ch: string) => (
                          <span
                            key={ch}
                            className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-900/90 border border-white/10 text-slate-200 flex items-center gap-1.5"
                          >
                            {ch === 'web' && <Globe className="w-3 h-3 text-violet-400" />}
                            {ch === 'facebook' && <FacebookIcon className="w-3 h-3 text-blue-400" />}
                            {ch === 'meta_ads' && <MetaIcon className="w-3 h-3 text-pink-400" />}
                            {ch === 'instagram' && <InstagramIcon className="w-3 h-3 text-pink-400" />}
                            {ch === 'linkedin' && <LinkedinIcon className="w-3 h-3 text-sky-400" />}
                            <span className="capitalize">{ch.replace('_', ' ')}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right side: Radial Score + CTA Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-center lg:items-end gap-4 shrink-0">
                      {/* Radial Digital Presence Score */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center gap-4 shadow-inner">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-800"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={
                                actorResult.digitalPresenceScore >= 80
                                  ? 'text-emerald-400'
                                  : actorResult.digitalPresenceScore >= 50
                                  ? 'text-amber-400'
                                  : 'text-violet-400'
                              }
                              strokeDasharray={`${actorResult.digitalPresenceScore}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-lg font-black text-white font-mono-tight leading-none">
                              {actorResult.digitalPresenceScore}
                            </span>
                            <span className="text-[8px] text-slate-400 uppercase font-mono">Score</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Digital Footprint</div>
                          <div className="text-[11px] font-mono text-amber-300">
                            {actorResult.digitalPresenceScore >= 80
                              ? 'Omnichannel Dominant'
                              : actorResult.digitalPresenceScore >= 50
                              ? 'High Market Footprint'
                              : 'Emerging Brand'}
                          </div>
                          <div className="text-[10px] text-slate-400">Weighted Multi-Platform</div>
                        </div>
                      </div>

                      {/* Primary CTAs */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenPitchModal(actorResult)}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white shadow-lg shadow-pink-500/20 transition flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>⚡ Generate AI Sales Pitch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveActorToProfiles(actorResult, 'omnichannel_360')}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition flex items-center justify-center gap-1.5"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save to CRM</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4-Metric High-Velocity Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border-white/[0.08] relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span className="font-mono uppercase text-[10px] tracking-wider">Total Omnichannel Reach</span>
                      <Users className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="text-2xl font-black text-white font-mono-tight">
                      {actorResult.totalAudienceReach || '0'}
                    </div>
                    <div className="text-[11px] text-violet-300 mt-1">Aggregated FB + IG Followers</div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border-white/[0.08] relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span className="font-mono uppercase text-[10px] tracking-wider">Active Paid Meta Ads</span>
                      <MetaIcon className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="text-2xl font-black text-white font-mono-tight">
                      {actorResult.activePaidAdsCount > 0 ? `${actorResult.activePaidAdsCount} Campaigns` : '0 Active'}
                    </div>
                    <div className="text-[11px] text-pink-300 mt-1">
                      {actorResult.adPlatforms?.length > 0 ? actorResult.adPlatforms.join(', ') : 'Organic Focus'}
                    </div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border-white/[0.08] relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span className="font-mono uppercase text-[10px] tracking-wider">Channel Density</span>
                      <Layers className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-white font-mono-tight">
                      {actorResult.channelsDetected?.length || 0} / 5 Platforms
                    </div>
                    <div className="text-[11px] text-amber-300 mt-1">Web, FB, Meta Ads, IG, LI</div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border-white/[0.08] relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span className="font-mono uppercase text-[10px] tracking-wider">Verified Contact Points</span>
                      <Mail className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-white font-mono-tight">
                      {(actorResult.unifiedContacts?.emails?.length || 0) + (actorResult.unifiedContacts?.phones?.length || 0)} Direct
                    </div>
                    <div className="text-[11px] text-emerald-300 mt-1">
                      {actorResult.unifiedContacts?.emails?.length || 0} Emails • {actorResult.unifiedContacts?.phones?.length || 0} Phones
                    </div>
                  </div>
                </div>

                {/* Value Proposition & Executive Overview */}
                <div className="glass-panel p-6 rounded-2xl border-white/[0.08] space-y-4">
                  {/* Golden Value Proposition Quote */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20">
                    <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-semibold mb-1">
                      Core Value Proposition:
                    </div>
                    <p className="text-sm sm:text-base text-amber-100 font-medium italic leading-relaxed">
                      &quot;{actorResult.valueProposition}&quot;
                    </p>
                  </div>

                  {/* Executive Summary & Strategic Takeaways */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-2">
                      <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">Executive Summary:</div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {actorResult.executiveSummary}
                      </p>
                      {actorResult.targetAudience && (
                        <div className="pt-2 text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">Target Segment: </span>
                          <span>{actorResult.targetAudience}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">Strategic Sourcing Insights:</div>
                      <div className="space-y-1.5">
                        {actorResult.strategicTakeaways?.map((takeaway: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4-Channel Deep Intel Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Channel 1: Facebook Page */}
                  <div className="glass-panel p-5 rounded-2xl border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                          <FacebookIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white text-xs">Facebook Page Intelligence</span>
                      </div>
                      {actorResult.facebookIntel?.isVerified && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300">Verified</span>
                      )}
                    </div>

                    {actorResult.facebookIntel ? (
                      <div className="space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                            <div className="text-[10px] text-slate-400 font-mono">Followers</div>
                            <div className="text-sm font-bold text-white font-mono">
                              {actorResult.facebookIntel.followersCount?.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                            <div className="text-[10px] text-slate-400 font-mono">Page Likes</div>
                            <div className="text-sm font-bold text-white font-mono">
                              {actorResult.facebookIntel.likesCount?.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {actorResult.facebookIntel.samplePost && (
                          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.06] space-y-1">
                            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                              <span>Latest Post Content:</span>
                              {actorResult.facebookIntel.samplePost.viewsCount && (
                                <span className="text-amber-300 font-semibold">
                                  👁️ {actorResult.facebookIntel.samplePost.viewsCount.toLocaleString()} views
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                              &quot;{actorResult.facebookIntel.samplePost.content}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-3 text-center font-mono">No direct Facebook Page record detected</div>
                    )}
                  </div>

                  {/* Channel 2: Meta Ad Library */}
                  <div className="glass-panel p-5 rounded-2xl border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-pink-500/20 text-pink-400">
                          <MetaIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white text-xs">Meta Ad Campaigns (FB & IG)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-pink-500/20 text-pink-300">
                        {actorResult.activePaidAdsCount > 0 ? `${actorResult.activePaidAdsCount} Active` : '0 Active'}
                      </span>
                    </div>

                    {actorResult.metaAdsIntel ? (
                      <div className="space-y-2.5 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04] space-y-1">
                          <div className="text-[10px] text-slate-400 font-mono">Top Ad Creative Headline:</div>
                          <div className="text-xs font-bold text-white line-clamp-2">
                            {actorResult.metaAdsIntel.topCreativeHeadline || 'Omnichannel promotional creative'}
                          </div>
                          {actorResult.metaAdsIntel.topCreativeCta && (
                            <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-600/30 text-violet-300 border border-violet-500/30">
                              CTA: {actorResult.metaAdsIntel.topCreativeCta}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                          <span>Ad Platforms:</span>
                          <span className="text-white">{actorResult.metaAdsIntel.platforms?.join(', ') || 'Facebook, Instagram'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-3 text-center font-mono">No active paid ad campaigns detected</div>
                    )}
                  </div>

                  {/* Channel 3: Instagram Profile */}
                  <div className="glass-panel p-5 rounded-2xl border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                          <InstagramIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white text-xs">Instagram Profile Presence</span>
                      </div>
                      {actorResult.instagramIntel?.isVerified && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-pink-500/20 text-pink-300">Verified</span>
                      )}
                    </div>

                    {actorResult.instagramIntel ? (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                          <div className="text-[10px] text-slate-400 font-mono">Handle</div>
                          <div className="text-xs font-bold text-pink-400 truncate">
                            @{actorResult.instagramIntel.username}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                          <div className="text-[10px] text-slate-400 font-mono">Audience</div>
                          <div className="text-xs font-bold text-white font-mono">
                            {actorResult.instagramIntel.followersFormatted || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-3 text-center font-mono">No direct Instagram match detected</div>
                    )}
                  </div>

                  {/* Channel 4: LinkedIn Company */}
                  <div className="glass-panel p-5 rounded-2xl border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                          <LinkedinIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white text-xs">LinkedIn Enterprise Profile</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300">Corporate</span>
                    </div>

                    {actorResult.linkedinIntel ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Company Size:</span>
                          <span className="font-semibold text-white">{actorResult.linkedinIntel.companySize || 'Enterprise'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Headquarters:</span>
                          <span className="font-semibold text-white">{actorResult.linkedinIntel.headquarters || 'Global'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Industry:</span>
                          <span className="font-semibold text-white">{actorResult.linkedinIntel.industry || actorResult.industrySector}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-3 text-center font-mono">No direct LinkedIn record detected</div>
                    )}
                  </div>
                </div>

                {/* Unified Deduplicated Contact Footprint */}
                <div className="glass-panel p-6 rounded-2xl border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white text-sm">Unified Deduplicated Contact Footprint</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Aggregated across all channels</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Emails */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
                      <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Direct Emails</span>
                        </span>
                        <span>{actorResult.unifiedContacts?.emails?.length || 0} found</span>
                      </div>
                      <div className="space-y-1.5">
                        {actorResult.unifiedContacts?.emails && actorResult.unifiedContacts.emails.length > 0 ? (
                          actorResult.unifiedContacts.emails.map((em: string, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs font-mono text-slate-200">
                              <a href={`mailto:${em}`} className="hover:text-emerald-400 truncate max-w-[180px]">{em}</a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(em);
                                  setSaveSuccessMsg(`Copied ${em}!`);
                                  setTimeout(() => setSaveSuccessMsg(null), 2000);
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 italic py-2">No public emails scraped</div>
                        )}
                      </div>
                    </div>

                    {/* Phones */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
                      <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Direct Phones</span>
                        </span>
                        <span>{actorResult.unifiedContacts?.phones?.length || 0} found</span>
                      </div>
                      <div className="space-y-1.5">
                        {actorResult.unifiedContacts?.phones && actorResult.unifiedContacts.phones.length > 0 ? (
                          actorResult.unifiedContacts.phones.map((ph: string, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs font-mono text-slate-200">
                              <a href={`tel:${ph}`} className="hover:text-cyan-400">{ph}</a>
                              <a
                                href={getWhatsAppUrl(ph, actorResult.brandName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                              >
                                WhatsApp
                              </a>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 italic py-2">No public phone numbers scraped</div>
                        )}
                      </div>
                    </div>

                    {/* Social Channels & Website */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
                      <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 text-violet-400">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Verified Social Profiles</span>
                      </div>
                      <div className="space-y-1.5">
                        {actorResult.unifiedContacts?.socialProfiles?.website && (
                          <a
                            href={actorResult.unifiedContacts.socialProfiles.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs text-slate-200 hover:bg-slate-800 transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-violet-400" />
                              <span>Official Website</span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                        {actorResult.unifiedContacts?.socialProfiles?.facebook && (
                          <a
                            href={actorResult.unifiedContacts.socialProfiles.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs text-slate-200 hover:bg-slate-800 transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <FacebookIcon className="w-3.5 h-3.5 text-blue-400" />
                              <span>Facebook Page</span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                        {actorResult.unifiedContacts?.socialProfiles?.instagram && (
                          <a
                            href={actorResult.unifiedContacts.socialProfiles.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs text-slate-200 hover:bg-slate-800 transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                              <span>Instagram</span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                        {actorResult.unifiedContacts?.socialProfiles?.linkedin && (
                          <a
                            href={actorResult.unifiedContacts.socialProfiles.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs text-slate-200 hover:bg-slate-800 transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <LinkedinIcon className="w-3.5 h-3.5 text-sky-400" />
                              <span>LinkedIn</span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* Tab 2: Saved Profiles Workspace (Filter, Search, Merge, Rate, Remarks) */}
        {/* ============================================================== */}
        {activeTab === 'saved' && (
          <div className="mt-6 space-y-6">
            {/* Top Toolbar */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Bookmark className="w-5 h-5 text-cyan-400" />
                    <span>Saved Profiles & Account Graph</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-coordinated classified records. Filter, rate, add remarks, split into lists, and merge duplicate entities.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedProfilesForMerge.length >= 2 && (
                    <button
                      onClick={handleExecuteMerge}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
                    >
                      <GitMerge className="w-4 h-4" />
                      <span>Merge Selected ({selectedProfilesForMerge.length})</span>
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1 border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Briefs</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-800">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search accounts, tags, remarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Categories ({savedProfiles.length})</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Origin Filter */}
                <div>
                  <select
                    value={selectedOrigin}
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Sourcing Origins</option>
                    <option value="domain_crawler">🌐 Domain Crawler</option>
                    <option value="product_spec_matrix">📦 Spec Finder Matrix</option>
                    <option value="gmaps_seller">📍 Maps B2B Directory</option>
                    <option value="bullmq_queue">⚡ BullMQ Queue Worker</option>
                    <option value="manual_entry">✍️ Manual Entry</option>
                  </select>
                </div>

                {/* Status Mark Filter */}
                <div>
                  <select
                    value={selectedMark}
                    onChange={(e) => setSelectedMark(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Status Marks</option>
                    <option value="Hot Lead">🔥 Hot Lead</option>
                    <option value="Target Account">🎯 Target Account</option>
                    <option value="Qualified">✅ Qualified</option>
                    <option value="Contacted">📞 Contacted</option>
                    <option value="Nurture">🌱 Nurture</option>
                    <option value="Disqualified">🚫 Disqualified</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value={0}>All Star Ratings</option>
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4+ Stars)</option>
                    <option value={3}>⭐⭐⭐ (3+ Stars)</option>
                  </select>
                </div>

                {/* List Segmentation */}
                <div>
                  <select
                    value={selectedListName}
                    onChange={(e) => setSelectedListName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Segmented Lists</option>
                    {uniqueLists.map((list) => (
                      <option key={list} value={list}>
                        📁 {list}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Profiles Grid */}
            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProfiles.map((prof) => {
                  const isMergeSelected = selectedProfilesForMerge.includes(prof.id);
                  return (
                    <div
                      key={prof.id}
                      className={`glass-panel p-5 rounded-2xl border transition relative flex flex-col justify-between ${isMergeSelected ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-800'
                        }`}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={isMergeSelected}
                              onChange={() => handleToggleMergeSelect(prof.id)}
                              className="mt-1 w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                              title="Select to merge duplicate entities"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-white text-base">{prof.companyName}</h3>
                                <a
                                  href={prof.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-slate-400 hover:text-indigo-400 flex items-center space-x-0.5"
                                >
                                  <span>{prof.domain}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                                  {prof.category}
                                </span>
                                {prof.sourceOrigin && (
                                  <span
                                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${prof.sourceOrigin === 'product_spec_matrix'
                                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                                      : prof.sourceOrigin === 'gmaps_seller'
                                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                                        : prof.sourceOrigin === 'bullmq_queue'
                                          ? 'bg-violet-950/40 text-violet-300 border-violet-800/40'
                                          : 'bg-slate-800 text-slate-300 border-slate-700'
                                      }`}
                                  >
                                    {prof.sourceOrigin === 'product_spec_matrix' && '📦 Spec Matrix'}
                                    {prof.sourceOrigin === 'gmaps_seller' && '📍 Maps B2B'}
                                    {prof.sourceOrigin === 'bullmq_queue' && '⚡ BullMQ Queue'}
                                    {prof.sourceOrigin === 'domain_crawler' && '🌐 Crawler'}
                                    {prof.sourceOrigin === 'manual_entry' && '✍️ Manual'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Star Rating Clicker */}
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleUpdateRating(prof.id, star)}
                                  className="text-amber-400 hover:scale-110 transition"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${star <= prof.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => handleDeleteProfile(prof.id)}
                              className="text-slate-500 hover:text-rose-400 transition"
                              title="Delete profile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                          {prof.description || 'Enterprise profile cataloged via stealth browser.'}
                        </p>

                        {/* 3-Tier E-Commerce & Wholesale B2B Pricing Structure */}
                        {prof.pricing &&
                          (prof.pricing.sellingPrice ||
                            prof.pricing.mrp ||
                            prof.pricing.offerPrice ||
                            prof.pricing.b2bPricing?.wholesalePrice) && (
                            <div className="mt-3 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center space-x-3">
                                {prof.pricing.sellingPrice && (
                                  <div className="flex flex-col">
                                    <span className="text-[9px] uppercase font-bold text-slate-400">Selling Price</span>
                                    <span className="text-xs font-black text-emerald-400">{prof.pricing.sellingPrice}</span>
                                  </div>
                                )}
                                {prof.pricing.mrp && (
                                  <div className="flex flex-col">
                                    <span className="text-[9px] uppercase font-bold text-slate-400">MRP / List</span>
                                    <div className="flex items-center space-x-1">
                                      <span className="text-xs line-through text-slate-400">{prof.pricing.mrp}</span>
                                      {prof.pricing.discountPercent ? (
                                        <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-400 font-bold">
                                          -{prof.pricing.discountPercent}%
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                )}
                                {prof.pricing.offerPrice && (
                                  <div className="flex flex-col">
                                    <span className="text-[9px] uppercase font-bold text-slate-400">Card Offer</span>
                                    <span className="text-xs font-bold text-cyan-400">{prof.pricing.offerPrice}</span>
                                  </div>
                                )}
                              </div>

                              {prof.pricing.b2bPricing?.wholesalePrice && (
                                <div className="px-2 py-1 bg-amber-950/40 border border-amber-800/40 rounded-lg flex items-center space-x-1.5">
                                  <Package className="w-3 h-3 text-amber-400" />
                                  <span className="text-[11px] font-bold text-amber-300">
                                    Wholesale: {prof.pricing.b2bPricing.wholesalePrice}
                                  </span>
                                  {prof.pricing.b2bPricing.moq && (
                                    <span className="text-[9px] text-amber-400/80">({prof.pricing.b2bPricing.moq})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                        {/* Search Provenance, Location & Statutory Metadata */}
                        {(prof.searchProvenance || prof.geoData || prof.businessDetails?.gstin) && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                            {prof.searchProvenance?.searchPerimeter && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 flex items-center space-x-1">
                                <Navigation className="w-2.5 h-2.5 text-cyan-400" />
                                <span>Perimeter: {prof.searchProvenance.searchPerimeter}</span>
                                {prof.searchProvenance.areasProbedCount && (
                                  <span className="text-slate-500">({prof.searchProvenance.areasProbedCount} zones probed)</span>
                                )}
                              </span>
                            )}
                            {prof.geoData?.latitude && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 flex items-center space-x-1">
                                <MapPin className="w-2.5 h-2.5 text-rose-400" />
                                <span>
                                  {prof.geoData.latitude.toFixed(4)}, {prof.geoData.longitude?.toFixed(4)}
                                </span>
                              </span>
                            )}
                            {prof.businessDetails?.gstin && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
                                GSTIN: {prof.businessDetails.gstin}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Contact Badges */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {prof.contactInfo.emails.length > 0 && (
                            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-indigo-400" />
                              <span>{prof.contactInfo.emails[0]}</span>
                              {prof.contactInfo.emails.length > 1 && (
                                <span className="text-slate-500">+{prof.contactInfo.emails.length - 1}</span>
                              )}
                            </span>
                          )}

                          {prof.contactInfo.phones.length > 0 && (
                            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{prof.contactInfo.phones[0]}</span>
                            </span>
                          )}

                          {prof.contactInfo.addresses.length > 0 && (
                            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 flex items-center space-x-1 truncate max-w-[200px]">
                              <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                              <span className="truncate">{prof.contactInfo.addresses[0]}</span>
                            </span>
                          )}
                        </div>

                        {/* Remarks Notepad */}
                        <div className="mt-3 pt-3 border-t border-slate-800/80">
                          {editingRemarkId === prof.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={remarkDraft}
                                onChange={(e) => setRemarkDraft(e.target.value)}
                                className="flex-1 px-3 py-1 bg-slate-900 border border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none"
                                placeholder="Type strategic notes..."
                              />
                              <button
                                onClick={() => handleSaveRemark(prof.id)}
                                className="px-2.5 py-1 bg-cyan-600 text-white rounded-lg text-xs font-semibold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingRemarkId(null)}
                                className="px-2 py-1 text-slate-400 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <div className="flex items-center space-x-1 truncate">
                                <Edit3 className="w-3 h-3 text-slate-500" />
                                <span className="text-slate-300 italic truncate">
                                  {prof.remarks || 'No remarks recorded yet.'}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingRemarkId(prof.id);
                                  setRemarkDraft(prof.remarks);
                                }}
                                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex-shrink-0 ml-2"
                              >
                                Edit Remarks
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Status Mark Selector, Intent & Actions */}
                      <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-800/80">
                        <div className="flex items-center space-x-2">
                          <select
                            value={prof.mark}
                            onChange={(e) => handleUpdateMark(prof.id, e.target.value as any)}
                            className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs text-slate-200 font-medium focus:outline-none"
                          >
                            <option value="Target Account">🎯 Target Account</option>
                            <option value="Hot Lead">🔥 Hot Lead</option>
                            <option value="Qualified">✅ Qualified</option>
                            <option value="Contacted">📞 Contacted</option>
                            <option value="Nurture">🌱 Nurture</option>
                            <option value="Disqualified">🚫 Disqualified</option>
                          </select>

                          {prof.aiAgentAnalysis && (
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                              Intent: {prof.aiAgentAnalysis.buyerIntentScore}%
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {(prof.whatsappUrl || (prof.contactInfo.phones && prof.contactInfo.phones.length > 0)) && (
                            <a
                              href={prof.whatsappUrl || getWhatsAppUrl(prof.contactInfo.phones[0], prof.companyName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1 transition"
                              title="Open WhatsApp Commercial RFP Inquiry"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <button
                            onClick={() => setInspectingProfile(prof)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1 transition"
                            title="Inspect full intelligence profile dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 glass-panel rounded-2xl">
                <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No Saved Profiles Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Run an enrichment search in the Live tab or dispatch domains to the BullMQ Queue to start building your classified account graph.
                </p>
                <button
                  onClick={() => setActiveTab('live')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20"
                >
                  Go to Live Search
                </button>
              </div>
            )}

            {/* Comprehensive Intelligence Profile Dossier Inspection Drawer */}
            {inspectingProfile && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider">
                          {inspectingProfile.category}
                        </span>
                        {inspectingProfile.sourceOrigin && (
                          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 text-[10px] font-mono font-semibold uppercase">
                            Origin: {inspectingProfile.sourceOrigin}
                          </span>
                        )}
                        <span className="text-xs text-amber-400">{'⭐'.repeat(inspectingProfile.rating)}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mt-1.5 flex items-center space-x-2">
                        <span>{inspectingProfile.companyName}</span>
                        {inspectingProfile.url && (
                          <a
                            href={inspectingProfile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-400 hover:text-indigo-400 inline-flex items-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </a>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{inspectingProfile.domain}</p>
                    </div>
                    <button
                      onClick={() => setInspectingProfile(null)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 3-Tier Pricing & Procurement Terms */}
                  {inspectingProfile.pricing && (
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>3-Tier E-Commerce & Wholesale B2B Pricing Structure</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                          <div className="text-[10px] uppercase text-slate-400 font-semibold">Selling Price</div>
                          <div className="text-sm font-black text-emerald-400 mt-0.5">
                            {inspectingProfile.pricing.sellingPrice || 'N/A'}
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                          <div className="text-[10px] uppercase text-slate-400 font-semibold">MRP / List Price</div>
                          <div className="text-sm font-semibold line-through text-slate-400 mt-0.5">
                            {inspectingProfile.pricing.mrp || 'N/A'}
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                          <div className="text-[10px] uppercase text-slate-400 font-semibold">Card Offer Price</div>
                          <div className="text-sm font-bold text-cyan-400 mt-0.5">
                            {inspectingProfile.pricing.offerPrice || 'N/A'}
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                          <div className="text-[10px] uppercase text-slate-400 font-semibold">Wholesale Price (B2B)</div>
                          <div className="text-sm font-bold text-amber-300 mt-0.5">
                            {inspectingProfile.pricing.b2bPricing?.wholesalePrice || 'Quote on Request'}
                          </div>
                        </div>
                      </div>

                      {inspectingProfile.pricing.b2bPricing && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div>
                            <span className="text-slate-400">MOQ: </span>
                            <span className="text-white font-medium">
                              {inspectingProfile.pricing.b2bPricing.moq || 'No Minimum'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Tier: </span>
                            <span className="text-white font-medium">
                              {inspectingProfile.pricing.b2bPricing.bulkDiscountTier || 'Standard'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">B2B Strategy: </span>
                            <span className="text-amber-300 font-medium">
                              {inspectingProfile.pricing.b2bPricing.b2bStrategy || 'Tiered Volume'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Statutory Credentials & Operational Health */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Statutory & Compliance Intel</span>
                      </h4>
                      <div className="text-xs space-y-1.5 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">GSTIN:</span>
                          <span className="text-cyan-300 font-bold">
                            {inspectingProfile.businessDetails?.gstin || 'Unrecorded / In-Store'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">PAN:</span>
                          <span className="text-slate-200">
                            {inspectingProfile.businessDetails?.pan || 'Unrecorded'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">ISO Certified:</span>
                          <span className={inspectingProfile.businessDetails?.isoCertified ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {inspectingProfile.businessDetails?.isoCertified ? '✓ Certified ISO-9001' : 'No Certification Tag'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Operational Health & Reliability</span>
                      </h4>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Operational Score:</span>
                          <span className="text-emerald-400 font-bold">
                            {inspectingProfile.operationalHealth?.score || 'High Reliability (92/100)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Supply Consistency:</span>
                          <span className="text-slate-200">
                            {inspectingProfile.operationalHealth?.supplyConsistency || 'Continuous Distribution'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Trade Credit Terms:</span>
                          <span className="text-indigo-300">
                            {inspectingProfile.tradeCreditTerms || 'Commercial Advance / Direct'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Matrix & Omnichannel Launchers */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Phone className="w-4 h-4 text-indigo-400" />
                      <span>Direct Contact Matrix & Sourcing Outreach</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Direct Phone</div>
                        <div className="text-white font-mono mt-0.5">
                          {inspectingProfile.contactInfo.phones[0] || 'No Phone Record'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Corporate Email</div>
                        <div className="text-white font-mono mt-0.5">
                          {inspectingProfile.contactInfo.emails[0] || 'No Public Email'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Location / Address</div>
                        <div className="text-white truncate mt-0.5">
                          {inspectingProfile.contactInfo.addresses[0] || 'Regional Facility'}
                        </div>
                      </div>
                    </div>

                    {(inspectingProfile.whatsappUrl || (inspectingProfile.contactInfo.phones && inspectingProfile.contactInfo.phones.length > 0)) && (
                      <div className="pt-2 flex items-center space-x-2">
                        <a
                          href={inspectingProfile.whatsappUrl || getWhatsAppUrl(inspectingProfile.contactInfo.phones[0], inspectingProfile.companyName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-emerald-600/20"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Launch WhatsApp RFP / Wholesale Inquiry</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Technographics & Search Provenance */}
                  {inspectingProfile.technographics.technologies.length > 0 && (
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                        <Cpu className="w-4 h-4 text-violet-400" />
                        <span>Detected Technographics Stack</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectingProfile.technographics.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-violet-300"
                          >
                            {t.name} ({Math.round(t.confidence * 100)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                    <div className="text-slate-500">
                      Saved on {new Date(inspectingProfile.savedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPitchModal({
                          companyName: inspectingProfile.companyName,
                          domain: inspectingProfile.domain,
                          valueProposition: inspectingProfile.description,
                          industry: inspectingProfile.category,
                          techStack: inspectingProfile.technographics?.technologies?.map((t: any) => t.name),
                          contactName: inspectingProfile.contactInfo?.emails?.[0]?.split('@')[0] || 'there',
                        })}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>⚡ Generate AI Sales Pitch</span>
                      </button>
                      <button
                        onClick={() => setInspectingProfile(null)}
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
                      >
                        Close Dossier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* Tab 3: 2026 BYOK AI Hub */}
        {/* ============================================================== */}
        {activeTab === 'byok' && (
          <div className="mt-6 max-w-4xl glass-panel p-8 rounded-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">2026 BYOK AI Model Hub & Revenue Agent</h2>
                <p className="text-xs text-slate-400">
                  Select from the latest 2026 frontier model families. All keys stay 100% in your local browser storage.
                </p>
              </div>
            </div>

            <div className="space-y-6 mt-6">
              {/* Provider Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Frontier AI Family
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AI_PROVIDERS_2026.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        setSelectedModel(provider.models[0]);
                        setCustomModel('');
                      }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition ${selectedProvider === provider.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      <div className="font-semibold text-white">{provider.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{provider.models[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Highlights Banner */}
              <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl flex items-start space-x-2 text-xs text-indigo-200">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>
                  {AI_PROVIDERS_2026.find((p) => p.id === selectedProvider)?.highlight}
                </span>
              </div>

              {/* Model Variant Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    2026 Model Variant
                  </label>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    Tiered Flagships & Reasoning Engines
                  </span>
                </div>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                >
                  {AI_PROVIDERS_2026.find((p) => p.id === selectedProvider)?.models.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                  <option value="custom">-- Custom Checkpoint / Identifier --</option>
                </select>

                {selectedModel === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom model endpoint or identifier"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="mt-2 w-full px-4 py-2 bg-slate-950 border border-indigo-500/60 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                )}
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {selectedProvider.toUpperCase()} API Key
                </label>
                <input
                  type="password"
                  placeholder={`Paste your ${selectedProvider} API key (e.g. sk-...)`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  {keySaved && <span className="text-emerald-400 font-semibold">Settings saved locally in browser!</span>}
                </div>
                <button
                  onClick={handleSaveByok}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-500/25"
                >
                  Save & Validate Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Tab 4: RevOps Safeguards */}
        {/* ============================================================== */}
        {activeTab === 'rules' && (
          <div className="mt-6 max-w-3xl glass-panel p-8 rounded-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Stale-Data Shield & RevOps Safeguards</h2>
                <p className="text-xs text-slate-400">
                  Guarantee 0% CRM corruption when syncing scraped enrichment back to Salesforce or HubSpot.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">Never Overwrite Populated CRM Fields</div>
                  <div className="text-xs text-slate-400">
                    If an SDR or AE has entered a phone or email manually, shield it from being replaced.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.noOverwriteExisting}
                  onChange={(e) => setRules({ ...rules, noOverwriteExisting: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">Confidence Gate (Minimum 85%)</div>
                  <div className="text-xs text-slate-400">
                    Reject contact records if verification match is below threshold.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.confidenceThreshold === 85}
                  onChange={(e) => setRules({ ...rules, confidenceThreshold: e.target.checked ? 85 : 0 })}
                  className="w-5 h-5 accent-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">Flag Job Title & Leadership Changes</div>
                  <div className="text-xs text-slate-400">
                    Notify account owners when an executive leadership transition is detected.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.flagJobTitleChange}
                  onChange={(e) => setRules({ ...rules, flagJobTitleChange: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 rounded"
                />
              </div>
            </div>

            {/* CRM Safe-Sync Connectors */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-base font-bold text-white mb-1">CRM Safe-Sync Integrations (OAuth & REST)</h3>
              <p className="text-xs text-slate-400 mb-4">
                Pushes enriched records to your CRM without overwriting existing data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* HubSpot */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                        HS
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">HubSpot CRM</div>
                        <div className="text-[10px] text-emerald-400">0% Overwrite Guard Enabled</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ready
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      if (savedProfiles.length === 0) {
                        alert('Save at least one profile first to test CRM safe-sync!');
                        return;
                      }
                      const target = savedProfiles[0];
                      const res = await fetch('/api/crm/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profile: target, crm: 'HubSpot', shieldExisting: true }),
                      });
                      const data = await res.json();
                      if (data.result) {
                        alert(`[HubSpot Safe-Sync Success]\nTarget: ${target.companyName}\nUpdated: ${data.result.fieldsUpdated.join(', ')}\nShielded from Overwrite: ${data.result.fieldsShielded.join(', ') || 'None'}`);
                      }
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1 border border-slate-700"
                  >
                    <span>Test HubSpot Safe-Sync</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Salesforce */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                        SF
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">Salesforce Sales Cloud</div>
                        <div className="text-[10px] text-emerald-400">Account & Lead Payload Safe</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ready
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      if (savedProfiles.length === 0) {
                        alert('Save at least one profile first to test CRM safe-sync!');
                        return;
                      }
                      const target = savedProfiles[0];
                      const res = await fetch('/api/crm/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profile: target, crm: 'Salesforce', shieldExisting: true }),
                      });
                      const data = await res.json();
                      if (data.result) {
                        alert(`[Salesforce Safe-Sync Success]\nTarget: ${target.companyName}\nUpdated: ${data.result.fieldsUpdated.join(', ')}\nShielded from Overwrite: ${data.result.fieldsShielded.join(', ') || 'None'}`);
                      }
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1 border border-slate-700"
                  >
                    <span>Test Salesforce Safe-Sync</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Storage Backend Indicator */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Database Layer:</span>
                <span className="font-mono text-emerald-400 font-semibold">Local Storage & MongoDB Driver Ready</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">.env MONGODB_URI Turnkey</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Tab 5: BullMQ Scraping Engine & Queue Architecture */}
        {/* ============================================================== */}
        {activeTab === 'queue' && (
          <div className="mt-6 space-y-6">
            {/* BullMQ Engine Architecture & Live Worker Status Header */}
            <div className="glass-panel p-6 rounded-2xl border border-violet-500/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex-shrink-0 shadow-lg shadow-violet-600/20">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-white">BullMQ Distributed Stealth Scraping Engine</h2>
                      <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Worker Online (3 Parallel Slots)</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      High-throughput background web scraper orchestrated via <strong>BullMQ + Redis</strong>. Throttles concurrent headless Playwright browsers to safeguard CPU/RAM, executes automatic exponential backoff on timeouts, and streams live extracted data directly into your Account Graph.
                    </p>
                  </div>
                </div>

                {/* Engine Quick Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={fetchQueueData}
                    disabled={queueLoading}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition"
                    title="Refresh Queue Metrics & Logs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleStartWorker}
                    disabled={queueLoading}
                    className="px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                    title="Wake or start worker listener"
                  >
                    <Play className="w-3.5 h-3.5 text-violet-400" />
                    <span>Awake Worker</span>
                  </button>

                  <button
                    onClick={handleClearQueue}
                    disabled={queueLoading}
                    className="px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                    title="Purge waiting and completed jobs from Redis"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Clear Queue</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                    <span>Waiting Queue</span>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-extrabold text-amber-400 mt-1">{queueMetrics.waiting}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Queued in Redis</div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                    <span>Active Processing</span>
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-xl font-extrabold text-cyan-400 mt-1">{queueMetrics.active}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Playwright Browsers</div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                    <span>Enriched & Completed</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-extrabold text-emerald-400 mt-1">{queueMetrics.completed}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Ready for Account Graph</div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                    <span>Failed / Retrying</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-xl font-extrabold text-rose-400 mt-1">{queueMetrics.failed}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Auto Exponential Backoff</div>
                </div>
              </div>
            </div>

            {/* Bulk Domain Enqueue Dispatcher with Presets */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span>Bulk Domain Pipeline Dispatcher</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a preset or paste target domain URLs to enqueue for stealth background enrichment.
                  </p>
                </div>

                {/* 1-Click Domain Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Presets:</span>
                  {PRESET_DOMAINS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setBulkInput(preset.domains.join('\n'))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition hover:border-indigo-500/40"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="e.g.&#10;linear.app&#10;notion.so&#10;razorpay.com&#10;flipkart.com"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                {queueMessage && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                    <span>{queueMessage}</span>
                    <button onClick={() => setQueueMessage(null)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-400 font-mono">
                    Target Domains:{' '}
                    <span className="text-white font-bold">
                      {bulkInput.split('\n').filter((d) => d.trim().length > 0).length}
                    </span>
                  </div>

                  <button
                    onClick={handleBulkQueue}
                    disabled={queueLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-violet-600/25 disabled:opacity-50"
                  >
                    {queueLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Enqueuing Jobs...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Dispatch to BullMQ Queue</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Section: Visual Enriched Results Grid & Live Terminal Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Columns: Visual Enriched Account Cards */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Visual Enriched Accounts ({queueJobs.filter((j) => j.returnvalue).length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live data extracted by BullMQ worker instances. Click to save into Account Graph.
                    </p>
                  </div>

                  {queueJobs.filter((j) => j.returnvalue).length > 0 && (
                    <button
                      onClick={handleImportAllCompletedQueueJobs}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-lg shadow-cyan-500/20"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Import All ({queueJobs.filter((j) => j.returnvalue).length})</span>
                    </button>
                  )}
                </div>

                {queueJobs.filter((j) => j.returnvalue).length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {queueJobs
                      .filter((j) => j.returnvalue)
                      .map((job) => {
                        const r = job.returnvalue;
                        const domain = r.domain || job.domain || 'unknown.com';
                        const alreadySaved = savedProfiles.some((p) => p.domain.toLowerCase() === domain.toLowerCase());

                        return (
                          <div
                            key={job.id}
                            className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-bold text-white text-sm">{r.companyName || domain}</h4>
                                  <a
                                    href={r.url || `https://${domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-0.5 font-mono"
                                  >
                                    <span>{domain}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                                    {r.category || 'Technology'}
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    ⏱️ {job.durationMs || r.executionTimeMs || 0} ms
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => setInspectingQueueJob(job)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                                  title="Inspect extracted payload & technographics"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleSaveQueueJobToProfiles(job)}
                                  disabled={alreadySaved}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${alreadySaved
                                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                    }`}
                                >
                                  {alreadySaved ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>In Graph</span>
                                    </>
                                  ) : (
                                    <>
                                      <Bookmark className="w-3.5 h-3.5" />
                                      <span>Save to Graph</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Description snippet */}
                            {r.description && (
                              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                {r.description}
                              </p>
                            )}

                            {/* Extracted Contacts Badges */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {r.contactInfo?.emails?.length > 0 && (
                                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono flex items-center space-x-1">
                                  <Mail className="w-3 h-3 text-indigo-400" />
                                  <span>{r.contactInfo.emails[0]}</span>
                                </span>
                              )}

                              {r.contactInfo?.phones?.length > 0 && (
                                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono flex items-center space-x-1">
                                  <Phone className="w-3 h-3 text-emerald-400" />
                                  <span>{r.contactInfo.phones[0]}</span>
                                </span>
                              )}

                              {r.contactInfo?.addresses?.length > 0 && (
                                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 flex items-center space-x-1 truncate max-w-[220px]">
                                  <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                                  <span className="truncate">{r.contactInfo.addresses[0]}</span>
                                </span>
                              )}
                            </div>

                            {/* Technographics Badges */}
                            {r.technographics?.technologies?.length > 0 && (
                              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                                <Cpu className="w-3 h-3 text-violet-400 flex-shrink-0" />
                                {r.technographics.technologies.slice(0, 4).map((tech: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-800/40"
                                  >
                                    {tech.name} ({Math.round(tech.confidence * 100)}%)
                                  </span>
                                ))}
                                {r.technographics.technologies.length > 4 && (
                                  <span className="text-[10px] text-slate-500">
                                    +{r.technographics.technologies.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800">
                    <Server className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">No Jobs Completed Yet</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Click "Top Indian E-Com" or "Fintech & SaaS" above and hit "Dispatch to BullMQ Queue" to see real-time extraction results populate here!
                    </p>
                  </div>
                )}
              </div>

              {/* Right 5 Columns: Streaming Real-time Scraper Activity Console */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Scraper Activity Console</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Live Stream</span>
                    </span>
                  </div>
                </div>

                {/* macOS styled Terminal Window */}
                <div className="rounded-2xl border border-slate-800 bg-[#090d16] shadow-2xl overflow-hidden flex flex-col h-[520px]">
                  {/* Window Bar */}
                  <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                      <span className="ml-2 font-mono text-[11px] text-slate-400">
                        bullmq-worker-engine.log
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Playwright Stealth</span>
                  </div>

                  {/* Terminal Log Output */}
                  <div className="p-4 font-mono text-[11px] space-y-2 overflow-y-auto flex-1 leading-relaxed">
                    <div className="text-slate-500">
                      [System] BullMQ Redis Queue initialized. Concurrency cap: 3 slots.
                    </div>

                    {queueLogs.length > 0 ? (
                      queueLogs.map((log: any, idx: number) => {
                        const isSuccess = log.message?.includes('Completed') || log.type === 'success';
                        const isError = log.type === 'error' || log.message?.includes('Failed');
                        const isLaunch = log.message?.includes('[1/4]') || log.message?.includes('Launching');
                        const isMeta = log.message?.includes('[2/4]');
                        const isTech = log.message?.includes('[3/4]');

                        return (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="text-slate-600 flex-shrink-0">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span
                              className={`flex-shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold ${log.domain === 'system'
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-violet-950 text-violet-300'
                                }`}
                            >
                              {log.domain}
                            </span>
                            <span
                              className={`break-all ${isSuccess
                                ? 'text-emerald-400 font-semibold'
                                : isError
                                  ? 'text-rose-400'
                                  : isLaunch
                                    ? 'text-cyan-300'
                                    : isMeta
                                      ? 'text-amber-300'
                                      : isTech
                                        ? 'text-violet-300'
                                        : 'text-slate-300'
                                }`}
                            >
                              {log.message}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-500 italic py-6 text-center">
                        Waiting for jobs... Click "Awake Worker" or dispatch domains above.
                      </div>
                    )}
                  </div>

                  {/* Terminal Footer */}
                  <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Auto-polling Redis every 3s</span>
                    </span>
                    <span className="text-slate-500 font-mono">buffer: {queueLogs.length} events</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspect Queue Job Modal */}
            {inspectingQueueJob && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30 uppercase font-bold">
                        Job #{inspectingQueueJob.id}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">
                        {inspectingQueueJob.returnvalue?.companyName || inspectingQueueJob.domain}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">{inspectingQueueJob.domain}</p>
                    </div>
                    <button
                      onClick={() => setInspectingQueueJob(null)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Detailed Return Value Display */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span>Extracted Technographics & Frameworks</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectingQueueJob.returnvalue?.technographics?.technologies?.map((t: any, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300"
                          >
                            {t.name} ({Math.round(t.confidence * 100)}%)
                          </span>
                        )) || <span className="text-xs text-slate-500">No frameworks isolated</span>}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-violet-400" />
                        <span>Full Return Value JSON</span>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto p-3 bg-slate-900 rounded-lg whitespace-pre-wrap">
                        {JSON.stringify(inspectingQueueJob.returnvalue, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      onClick={() => {
                        handleSaveQueueJobToProfiles(inspectingQueueJob);
                        setInspectingQueueJob(null);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save into Account Graph</span>
                    </button>

                    <button
                      onClick={() => setInspectingQueueJob(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* Global AI Multi-Channel Outreach Pitch Synthesizer Modal */}
        {/* ============================================================== */}
        {pitchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-violet-500/30 shadow-2xl shadow-violet-950/50 flex flex-col max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-violet-950/60 via-slate-900 to-pink-950/40 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>AI Multi-Channel Outreach Pitch Synthesizer</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Zero-Cost Live
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Personalized for: <span className="text-slate-200 font-semibold">{pitchTargetData?.brandName || pitchTargetData?.companyName || pitchTargetData?.domain}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPitchModalOpen(false)}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tone Selection Bar */}
              <div className="px-6 py-3 bg-slate-950/60 border-b border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Outreach Tone:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['direct', 'executive', 'challenger', 'warm'] as PitchTone[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setPitchTone(t);
                          if (pitchTargetData) handleGeneratePitch(pitchTargetData, t);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                          pitchTone === t
                            ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-pink-600/20'
                            : 'bg-white/[0.05] hover:bg-white/[0.10] text-slate-300'
                        }`}
                      >
                        {t === 'direct' && '⚡ Direct & Value'}
                        {t === 'executive' && '👔 Executive C-Suite'}
                        {t === 'challenger' && '🎯 Challenger'}
                        {t === 'warm' && '🤝 Warm & Consultative'}
                      </button>
                    ))}
                  </div>
                </div>

                {pitchGenerating && (
                  <span className="flex items-center gap-1.5 text-xs text-violet-300 font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                    <span>Synthesizing angles...</span>
                  </span>
                )}
              </div>

              {/* Channel Tabs (Email / LinkedIn / WhatsApp) */}
              <div className="px-6 pt-3 flex items-center gap-2 border-b border-white/[0.06] bg-slate-900/50">
                <button
                  onClick={() => setPitchTab('email')}
                  className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                    pitchTab === 'email'
                      ? 'border-violet-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Cold Email (Dual Subject)</span>
                </button>
                <button
                  onClick={() => setPitchTab('linkedin')}
                  className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                    pitchTab === 'linkedin'
                      ? 'border-sky-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn InMail & Note (&lt;300 chars)</span>
                </button>
                <button
                  onClick={() => setPitchTab('whatsapp')}
                  className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                    pitchTab === 'whatsapp'
                      ? 'border-emerald-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp B2B (1-Click Launch)</span>
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {generatedPitch ? (
                  <div className="space-y-4">
                    {/* Personalization Anchors */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Anchors:</span>
                      {generatedPitch.keyPersonalizationAngles?.map((angle: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] bg-violet-500/10 text-violet-300 border border-violet-500/20"
                        >
                          ✓ {angle}
                        </span>
                      ))}
                    </div>

                    {/* Email Tab */}
                    {pitchTab === 'email' && (
                      <div className="space-y-4">
                        {/* Subject Lines Choices */}
                        <div className="space-y-2">
                          <div className="text-xs font-mono uppercase text-slate-400">Subject Line Options:</div>
                          <div className="space-y-2">
                            {generatedPitch.emailPitch.subjectLines.map((subj: string, i: number) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-slate-950 border border-white/[0.08] flex items-center justify-between text-xs text-white group hover:border-violet-500/50 transition"
                              >
                                <span className="font-medium font-mono text-slate-200">&quot;{subj}&quot;</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(subj);
                                    setPitchCopiedSubject(true);
                                    setTimeout(() => setPitchCopiedSubject(false), 2000);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.15] text-slate-300 text-[11px] flex items-center gap-1.5 transition"
                                >
                                  {pitchCopiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{pitchCopiedSubject ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Email Body */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono uppercase text-slate-400">Email Pitch Body:</span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {generatedPitch.emailPitch.wordCount} words
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                            {generatedPitch.emailPitch.body}
                          </div>
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedPitch.emailPitch.body);
                                setPitchCopiedBody(true);
                                setTimeout(() => setPitchCopiedBody(false), 2000);
                              }}
                              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-violet-600/30"
                            >
                              {pitchCopiedBody ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{pitchCopiedBody ? 'Copied Body!' : 'Copy Email Body'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LinkedIn Tab */}
                    {pitchTab === 'linkedin' && (
                      <div className="space-y-4">
                        {/* Connection Request Note */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono uppercase text-slate-400">LinkedIn Connection Note (&lt;300 chars):</span>
                            <span className={`font-mono text-[11px] ${generatedPitch.linkedinPitch.connectionNote.length <= 300 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {generatedPitch.linkedinPitch.connectionNote.length} / 300 chars
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-200">
                            {generatedPitch.linkedinPitch.connectionNote}
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedPitch.linkedinPitch.connectionNote);
                                setPitchCopiedBody(true);
                                setTimeout(() => setPitchCopiedBody(false), 2000);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Connection Note</span>
                            </button>
                          </div>
                        </div>

                        {/* InMail */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                          <div className="text-xs font-mono uppercase text-slate-400">InMail Subject & Body:</div>
                          <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-200 font-semibold">
                            Subject: {generatedPitch.linkedinPitch.inmailSubject}
                          </div>
                          <div className="p-4 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {generatedPitch.linkedinPitch.inmailBody}
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `Subject: ${generatedPitch.linkedinPitch.inmailSubject}\n\n${generatedPitch.linkedinPitch.inmailBody}`
                                );
                                setPitchCopiedBody(true);
                                setTimeout(() => setPitchCopiedBody(false), 2000);
                              }}
                              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy InMail Full Copy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Tab */}
                    {pitchTab === 'whatsapp' && (
                      <div className="space-y-4">
                        <div className="text-xs font-mono uppercase text-slate-400">Direct WhatsApp B2B Pitch:</div>
                        <div className="p-4 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
                          {generatedPitch.whatsappPitch.messageText}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedPitch.whatsappPitch.messageText);
                              setPitchCopiedBody(true);
                              setTimeout(() => setPitchCopiedBody(false), 2000);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Message Text</span>
                          </button>

                          <a
                            href={generatedPitch.whatsappPitch.whatsappWebUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Open in WhatsApp Web ⚡</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
                    <span>Generating personalized pitch copy...</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950/80 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <div className="text-slate-500 font-mono text-[11px]">
                  Targeted with verified domain signals & active campaign data
                </div>
                <button
                  onClick={() => setPitchModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
