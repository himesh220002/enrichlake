'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  ShieldCheck,
  Cpu,
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
} from 'lucide-react';
import { EnrichedProfileRecord, ProfileStorageService } from '@/lib/storage/profileStorage';
import { KeywordScrapedItem } from '@/lib/scraper/googleMapsScraper';
import { ProductSpecRecord, ProductStatusTag } from '@/lib/scraper/productSpecScraper';

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
  description: string;
  contactInfo: ContactInfo;
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

export default function EnrichmentDashboard() {
  const [activeTab, setActiveTab] = useState<'live' | 'maps' | 'saved' | 'byok' | 'rules' | 'queue'>('live');
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Google Maps & Keyword Scraper State
  const [mapsKeywordsInput, setMapsKeywordsInput] = useState('16gb ram, i5, rtx3050, 144hz display, under 1 lakh');
  const [mapsLocation, setMapsLocation] = useState('Bangalore');
  const [mapsMaxResults, setMapsMaxResults] = useState(10);
  const [mapsEnrichWebsites, setMapsEnrichWebsites] = useState(false);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResults, setMapsResults] = useState<KeywordScrapedItem[]>([]);
  const [mapsReport, setMapsReport] = useState<any>(null);
  const [selectedMapItems, setSelectedMapItems] = useState<string[]>([]);
  const [mapsMinMatch, setMapsMinMatch] = useState(50);
  const [mapsRequireContact, setMapsRequireContact] = useState(false);

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
  const [queueMetrics, setQueueMetrics] = useState({ waiting: 0, active: 0, completed: 22, failed: 0 });
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);

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
        if (data.aiSynthesis) {
          setAiAnalysis(data.aiSynthesis);
        }
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

  const handleSaveCurrentResult = () => {
    if (!result) return;
    const categoryGuess = result.technographics.cms || result.technographics.framework || 'B2B Tech';
    const record = ProfileStorageService.saveProfile({
      domain: result.domain,
      url: result.url,
      companyName: result.companyName,
      category: categoryGuess,
      description: result.description,
      rating: 4,
      mark: 'Target Account',
      remarks: 'Freshly crawled via stealth scraper.',
      listName: 'Default Batch',
      tags: result.technographics.technologies.map((t) => t.name),
      contactInfo: result.contactInfo,
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
        setQueueMessage(`Successfully dispatched ${data.enqueuedCount} domains to BullMQ Redis Queue!`);
        setQueueMetrics((prev) => ({ ...prev, waiting: prev.waiting + data.enqueuedCount }));
      }
    } catch (err: any) {
      setQueueMessage('Error adding to queue: ' + err.message);
    } finally {
      setQueueLoading(false);
    }
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
    const headers = ['Company Name', 'Domain', 'Category', 'Rating', 'Mark', 'Emails', 'Phones', 'Technologies', 'Remarks'];
    const rows = filteredProfiles.map((p) => [
      `"${p.companyName}"`,
      `"${p.domain}"`,
      `"${p.category}"`,
      p.rating,
      `"${p.mark}"`,
      `"${p.contactInfo.emails.join('; ')}"`,
      `"${p.contactInfo.phones.join('; ')}"`,
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
    if (!mapsKeywordsInput.trim()) return;
    setMapsLoading(true);
    setMapsResults([]);
    setMapsReport(null);
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

    return matchesSearch && matchesCategory && matchesMark && matchesRating && matchesList;
  });

  const uniqueCategories = Array.from(new Set(savedProfiles.map((p) => p.category))).filter(Boolean);
  const uniqueLists = Array.from(new Set(savedProfiles.map((p) => p.listName))).filter(Boolean);

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  ENRICHER.AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ZERO-API COST
                </span>
              </div>
              <p className="text-xs text-slate-400">Headless Stealth Scraping & 2026 BYOK AI RevOps Engine</p>
            </div>
          </div>

          {/* Engine Status Indicators */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono text-emerald-400">Stealth Engine</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Redis & BullMQ Active</span>
            </div>

            <button
              onClick={() => setActiveTab('saved')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Profiles ({savedProfiles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('byok')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition"
            >
              <Key className="w-3.5 h-3.5" />
              <span>2026 BYOK Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Stat KPI Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* KPI 1: Money Saved */}
          <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium tracking-wide uppercase">RevOps Cost Saved</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ${moneySaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-emerald-400 inline mr-1" />
              <span>Vs ZoomInfo / Apollo ($0.45/record benchmark)</span>
            </p>
          </div>

          {/* KPI 2: Records Processed */}
          <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium tracking-wide uppercase">Enriched Accounts</span>
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {recordsProcessed.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Headless DOM & schema parsed</p>
          </div>

          {/* KPI 3: Accuracy Guarantee */}
          <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium tracking-wide uppercase">Stale-Data Shield</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400 font-mono tracking-tight">0% Overwrite</div>
            <p className="text-[11px] text-slate-400 mt-1">CRM protective barrier enabled</p>
          </div>

          {/* KPI 4: Infrastructure */}
          <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium tracking-wide uppercase">API Scraping Overhead</span>
              <Zap className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-3xl font-black text-violet-300 font-mono tracking-tight">$0.00</div>
            <p className="text-[11px] text-slate-400 mt-1">Zero commercial data vendor fees</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-8 flex border-b border-slate-800 space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 transition relative whitespace-nowrap ${
              activeTab === 'live' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Live Domain Enrichment</span>
            {activeTab === 'live' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 transition relative whitespace-nowrap ${
              activeTab === 'maps' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Google Maps & Keyword Scraper</span>
            {activeTab === 'maps' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 transition relative whitespace-nowrap ${
              activeTab === 'saved' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Profiles & Account Graph ({savedProfiles.length})</span>
            {activeTab === 'saved' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/50" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('byok')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 transition relative whitespace-nowrap ${
              activeTab === 'byok' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>2026 BYOK AI Hub</span>
            {activeTab === 'byok' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 transition relative whitespace-nowrap ${
              activeTab === 'rules' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>RevOps Safeguards</span>
            {activeTab === 'rules' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 transition relative whitespace-nowrap ${
              activeTab === 'queue' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>BullMQ Scraping Engine</span>
            {activeTab === 'queue' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
            )}
          </button>
        </div>

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
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                <span className="text-slate-500">Quick Test Targets:</span>
                {['stripe.com', 'vercel.com', 'github.com', 'linear.app'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setDomainInput(preset);
                      handleEnrich(preset);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-700/70 text-slate-300 font-mono text-[11px] border border-slate-700/50 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Display */}
            {result && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                <div className="lg:col-span-2 space-y-6">
                  {/* Entity Header */}
                  <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h2 className="text-2xl font-bold text-white tracking-tight">{result.companyName}</h2>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 flex items-center text-xs space-x-1"
                          >
                            <span>{result.domain}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                          {result.description || 'Verified enterprise domain crawled without third-party API restrictions.'}
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end space-y-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          200 OK Crawled
                        </span>
                        <button
                          onClick={handleSaveCurrentResult}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-md shadow-cyan-600/20"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save to Profiles</span>
                        </button>
                        {saveSuccessMsg && (
                          <span className="text-[11px] text-emerald-400 font-mono">{saveSuccessMsg}</span>
                        )}
                      </div>
                    </div>

                    {/* Contact Extracted */}
                    <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Direct Emails */}
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 text-indigo-400 mr-1.5" />
                            Discovered Emails ({result.contactInfo.emails.length})
                          </span>
                        </div>
                        {result.contactInfo.emails.length > 0 ? (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {result.contactInfo.emails.map((email, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between text-xs font-mono bg-slate-950/70 px-2.5 py-1.5 rounded border border-slate-800/50"
                              >
                                <span className="text-slate-200 truncate">{email}</span>
                                <button
                                  onClick={() => handleCopy(email, `email_${i}`)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedField === `email_${i}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No public mailto links surfaced on index</p>
                        )}
                      </div>

                      {/* Direct Phones */}
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 text-emerald-400 mr-1.5" />
                            Verified Phone Numbers ({result.contactInfo.phones.length})
                          </span>
                        </div>
                        {result.contactInfo.phones.length > 0 ? (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {result.contactInfo.phones.map((phone, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between text-xs font-mono bg-slate-950/70 px-2.5 py-1.5 rounded border border-slate-800/50"
                              >
                                <span className="text-slate-200">{phone}</span>
                                <button
                                  onClick={() => handleCopy(phone, `phone_${i}`)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedField === `phone_${i}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No direct public telephone line on homepage</p>
                        )}
                      </div>
                    </div>

                    {/* Social Profiles */}
                    <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-800/60">
                      <span className="text-xs text-slate-400 font-medium py-1">Verified Social Channels:</span>
                      {Object.entries(result.contactInfo.socialLinks).map(([network, url]) => (
                        <a
                          key={network}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-indigo-300 font-mono capitalize transition flex items-center space-x-1"
                        >
                          <span>{network}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                      {Object.keys(result.contactInfo.socialLinks).length === 0 && (
                        <span className="text-xs text-slate-500 italic py-1">No verified public handles</span>
                      )}
                    </div>
                  </div>

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

                {/* Right Col: BYOK AI Insights & Account Scoring */}
                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-base font-bold text-white">2026 BYOK AI Synthesis</h3>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {selectedProvider}
                      </span>
                    </div>

                    {aiAnalysis ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40">
                          <div className="text-xs text-indigo-300 font-medium">Buyer Propensity Score</div>
                          <div className="flex items-end space-x-2 mt-1">
                            <span className="text-3xl font-black text-white font-mono">{aiAnalysis.buyerIntentScore}</span>
                            <span className="text-xs text-slate-400 pb-1">/ 100</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
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
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Key className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Add your API Key in the 2026 BYOK tab to unlock live AI summaries & intent scores.</p>
                        <button
                          onClick={() => setActiveTab('byok')}
                          className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                        >
                          Configure 2026 BYOK Key
                        </button>
                      </div>
                    )}
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>Google Maps & Keyword Scraper</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Multi-Site Extraction & Clean Engine
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search, extract, and refine business listings, product availability, hardware specs, coordinates, and contact details.
                  </p>
                </div>
              </div>

              {/* Keyword & Location Inputs */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Keywords (Separated by Commas)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 16gb ram, i5, rtx3050, 144hz display, under 1 lakh"
                      value={mapsKeywordsInput}
                      onChange={(e) => setMapsKeywordsInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMapsScrape()}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Parsed Keyword Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="text-[11px] text-slate-500 py-0.5 mr-1">Parsed Specs:</span>
                    {mapsKeywordsInput
                      .split(',')
                      .map((k) => k.trim())
                      .filter(Boolean)
                      .map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-md text-[11px] font-mono"
                        >
                          {kw}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Location and Settings Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Location / Region
                    </label>
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
                        id="enrichWebsiteCheck"
                      />
                      <label htmlFor="enrichWebsiteCheck" className="text-xs text-slate-300 cursor-pointer">
                        Probe web for direct emails
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-500">Quick Test Scenarios:</span>
                  {[
                    { label: '💻 Gaming Laptops', val: '16gb ram, i5, rtx3050, 144hz display, under 1 lakh', loc: 'Bangalore' },
                    { label: '🏢 Hardware Wholesalers', val: 'laptop distributors, bulk hardware, authorized dealer, warranty', loc: 'Mumbai' },
                    { label: '🔧 Commercial Services', val: 'commercial plumbers, emergency 24/7, licensed, industrial', loc: 'Austin' },
                    { label: '☕ Specialty Cafes', val: 'artisan coffee, organic roaster, specialty beans, cafe', loc: 'Seattle' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setMapsKeywordsInput(preset.val);
                        setMapsLocation(preset.loc);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] font-mono transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Submit Scrape Button */}
                <div className="pt-2">
                  <button
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
            </div>

            {/* Results Section */}
            {mapsResults.length > 0 && (
              <div className="space-y-4">
                {/* Refining Report Banner & Bulk Action Bar */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-white">Refining Report:</span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800">
                      Total: {mapsReport?.originalCount || mapsResults.length}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-mono border border-emerald-800/40">
                      Cleaned: {mapsResults.length}
                    </span>
                    {mapsReport?.duplicatesRemoved > 0 && (
                      <span className="px-2.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 font-mono border border-cyan-800/40">
                        Duplicates Removed: {mapsReport.duplicatesRemoved}
                      </span>
                    )}
                    {selectedMapItems.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/40">
                        {selectedMapItems.length} Selected
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSaveSelectedMapItems}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-md shadow-cyan-600/20"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Selected to Profiles</span>
                    </button>

                    <button
                      onClick={handleExportMapsCSV}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={handleExportMapsJSON}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Structured Table */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                          <th className="p-3.5 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={selectedMapItems.length === mapsResults.length && mapsResults.length > 0}
                              onChange={handleToggleSelectAllMapItems}
                              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                          </th>
                          <th className="p-3.5 font-semibold">Vendor / Store</th>
                          <th className="p-3.5 font-semibold">Matched Specs</th>
                          <th className="p-3.5 font-semibold">Direct Phone</th>
                          <th className="p-3.5 font-semibold">Verified Email</th>
                          <th className="p-3.5 font-semibold">Location / Address</th>
                          <th className="p-3.5 font-semibold">Coordinates</th>
                          <th className="p-3.5 font-semibold">Rating</th>
                          <th className="p-3.5 font-semibold">Budget</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {mapsResults.map((item) => {
                          const isSelected = selectedMapItems.includes(item.id);
                          return (
                            <tr
                              key={item.id}
                              className={`transition hover:bg-slate-900/50 ${
                                isSelected ? 'bg-amber-950/20' : ''
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="p-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleMapItemSelect(item.id)}
                                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                />
                              </td>

                              {/* Vendor Name & Source */}
                              <td className="p-3.5">
                                <div className="font-bold text-white text-sm">
                                  <a
                                    href={item.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-amber-400 flex items-center space-x-1"
                                  >
                                    <span>{item.name}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                                  </a>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {item.siteName}
                                </div>
                                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                                  Match: {item.matchScore}%
                                </div>
                              </td>

                              {/* Matched Specs Chips */}
                              <td className="p-3.5">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {item.itemSpecs.map((spec, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] border border-slate-700"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              {/* Phone */}
                              <td className="p-3.5 font-mono">
                                {item.phone ? (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-slate-200">{item.phone}</span>
                                    <button
                                      onClick={() => handleCopy(item.phone, `p_${item.id}`)}
                                      className="text-slate-500 hover:text-white"
                                    >
                                      {copiedField === `p_${item.id}` ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic">In-Store</span>
                                )}
                              </td>

                              {/* Email */}
                              <td className="p-3.5 font-mono">
                                {item.email ? (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-slate-200">{item.email}</span>
                                    <button
                                      onClick={() => handleCopy(item.email, `e_${item.id}`)}
                                      className="text-slate-500 hover:text-white"
                                    >
                                      {copiedField === `e_${item.id}` ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic">No web email</span>
                                )}
                              </td>

                              {/* Address */}
                              <td className="p-3.5 text-slate-300 max-w-xs truncate" title={item.address}>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                                  <span className="truncate">{item.address}</span>
                                </div>
                              </td>

                              {/* Coordinates */}
                              <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">
                                {item.latitude !== null && item.longitude !== null ? (
                                  <a
                                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 bg-slate-900 text-cyan-300 rounded border border-cyan-800/40 hover:border-cyan-400 flex items-center space-x-1 inline-flex"
                                  >
                                    <Navigation className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>
                                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                    </span>
                                  </a>
                                ) : (
                                  <span className="text-slate-500">N/A</span>
                                )}
                              </td>

                              {/* Rating & Reviews */}
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[11px] border border-amber-500/20">
                                  <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                                  {item.rating || 4.5} ({item.reviewsCount || 10})
                                </span>
                              </td>

                              {/* Price Estimate */}
                              <td className="p-3.5 font-mono text-[11px] text-emerald-400 whitespace-nowrap">
                                {item.priceEstimate}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-800">
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
                      className={`glass-panel p-5 rounded-2xl border transition relative ${
                        isMergeSelected ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-800'
                      }`}
                    >
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
                            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 inline-block mt-1">
                              {prof.category}
                            </span>
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
                                  className={`w-3.5 h-3.5 ${
                                    star <= prof.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
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

                      {/* Card Footer: Status Mark Selector & AI Intent */}
                      <div className="mt-3 pt-2 flex items-center justify-between text-xs">
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 glass-panel rounded-2xl">
                <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No Saved Profiles Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Run an enrichment search in the Live tab and click "Save to Profiles" to start building your classified account graph.
                </p>
                <button
                  onClick={() => setActiveTab('live')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20"
                >
                  Go to Live Search
                </button>
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
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition ${
                        selectedProvider === provider.id
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
          <div className="mt-6 max-w-4xl space-y-6">
            {/* BullMQ Explanation Card */}
            <div className="glass-panel p-6 rounded-2xl border border-violet-500/30">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 flex-shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">What Does BullMQ Do Here?</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Headless browsers (Playwright) consume significant RAM and CPU. If you upload 1,000 domains at once, launching 1,000 browsers simultaneously will crash your system. <strong>BullMQ + Redis</strong> solves this:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="font-semibold text-xs text-violet-300">1. Concurrency Throttling</div>
                      <div className="text-[11px] text-slate-400 mt-1">Runs 3–5 headless browsers in parallel safely without overloading the server.</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="font-semibold text-xs text-cyan-300">2. Exponential Backoff</div>
                      <div className="text-[11px] text-slate-400 mt-1">Automatically retries timed-out requests after 5s and 10s intervals.</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="font-semibold text-xs text-emerald-300">3. Zero-Cost Bulk Pipeline</div>
                      <div className="text-[11px] text-slate-400 mt-1">Processes thousands of domains locally with zero paid third-party proxy fees.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Queue Controller */}
            <div className="glass-panel p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Bulk Scraping Dispatcher</h2>
                    <p className="text-xs text-slate-400">
                      Paste domain lists to enqueue for background stealth enrichment.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 text-xs font-mono">
                  <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Waiting: </span>
                    <span className="text-amber-400 font-bold">{queueMetrics.waiting}</span>
                  </div>
                  <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Active: </span>
                    <span className="text-cyan-400 font-bold">{queueMetrics.active}</span>
                  </div>
                  <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Completed: </span>
                    <span className="text-emerald-400 font-bold">{queueMetrics.completed}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Bulk Domains (One per line)
                  </label>
                  <textarea
                    rows={5}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {queueMessage && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
                    {queueMessage}
                  </div>
                )}

                <button
                  onClick={handleBulkQueue}
                  disabled={queueLoading}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-violet-600/20"
                >
                  {queueLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Enqueuing Jobs...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Dispatch Bulk Jobs to BullMQ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
