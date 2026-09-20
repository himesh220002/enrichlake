'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
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


export default function EnrichmentDashboard() {
  const [activeTab, setActiveTab] = useState<'live' | 'maps' | 'products' | 'saved' | 'byok' | 'rules' | 'queue'>('products');
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

  // Universal Product & Specs Finder State (User-specified Category, Product, Spec, Price Range, and Scope)
  const [productCategoryInput, setProductCategoryInput] = useState('Electronics & Computers (IT)');
  const [productNameInput, setProductNameInput] = useState('Acer Nitro V15');
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
    { id: 'spec_1', name: 'Processor', mode: 'same', value: 'i5-12450H' },
    { id: 'spec_2', name: 'RAM', mode: 'same', value: '16GB DDR5' },
    { id: 'spec_3', name: 'GPU', mode: 'same', value: 'RTX 3050' },
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

  const [productMinPrice, setProductMinPrice] = useState('70000');
  const [productMaxPrice, setProductMaxPrice] = useState('100000');
  const [productPriceRangeText, setProductPriceRangeText] = useState('₹70,000 - ₹1,00,000');
  const [productScope, setProductScope] = useState<'radius' | 'india' | 'world'>('radius');
  const [productCenterLocation, setProductCenterLocation] = useState('Malda, WB, India');
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
      domains: ['flipkart.com', 'meesho.com', 'nykaa.com', 'tatadigital.com', 'jiomart.com'],
    },
    {
      name: 'Fintech & SaaS',
      domains: ['razorpay.com', 'postman.com', 'linear.app', 'notion.so', 'browserstack.com'],
    },
    {
      name: 'Hardware & PC Brands',
      domains: ['asus.com', 'lenovo.com', 'dell.com', 'hp.com', 'acer.com'],
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
        } catch {}
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
      } catch {}
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
      {/* Top Navigation — unified, seam-free */}
      <header className="border-b border-white/[0.07] bg-[rgba(8,11,24,0.72)] backdrop-blur-xl sticky top-0 z-50">
        <div className="page-shell h-[60px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-400 p-[1.2px] shadow-md shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold tracking-[0.14em] text-[13px] bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  ENRICHER.AI
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  ZERO-API COST
                </span>
                <span className="hidden lg:inline-flex px-2 py-0.5 text-[10px] font-mono rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">Aurora • NeoGlass • FeatherLite</span>
              </div>
              <p className="hidden sm:block text-[11px] leading-none text-slate-400 mt-0.5 truncate">Stealth scraping • Technographics • 2026 BYOK RevOps • B2B sourcing with GST-verified confidence</p>
            </div>
          </div>

          {/* Engine Status + Actions — contextual, lightweight */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono text-emerald-300">Stealth</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Redis/BullMQ</span>
              <span className="text-slate-600">·</span>
              <span className={workerStatus==='active' ? 'text-emerald-400' : 'text-amber-400'}>{workerStatus==='active' ? 'Live' : 'Idle'}</span>
            </div>

            <button
              onClick={() => setActiveTab('saved')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-slate-200 transition feather-btn"
              aria-label="Saved profiles"
            >
              <Bookmark className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Profiles</span>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-200 text-[11px] font-mono">{savedProfiles.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('byok')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/90 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 transition feather-btn"
            >
              <Key className="w-3.5 h-3.5" />
              <span>BYOK Hub</span>
            </button>
          </div>
        </div>
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

        {/* Tab Selection — FeatherLite Pill Strip + ZenFlow minimal */}
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
            {(queueMetrics.waiting+queueMetrics.active)>0 && <span className="ml-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
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
                          <th className="p-3 font-semibold min-w-[180px]">Vendor / Store</th>
                          <th className="p-3 font-semibold min-w-[120px]">Website</th>
                          <th className="p-3 font-semibold min-w-[140px]">Matched Specs</th>
                          <th className="p-3 font-semibold min-w-[145px]">
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>Phone</span>
                            </div>
                          </th>
                          <th className="p-3 font-semibold min-w-[160px]">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>Email</span>
                            </div>
                          </th>
                          <th className="p-3 font-semibold min-w-[200px]">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>Address</span>
                            </div>
                          </th>
                          <th className="p-3 font-semibold min-w-[130px]">
                            <div className="flex items-center space-x-1">
                              <Navigation className="w-3 h-3" />
                              <span>Lat/Long</span>
                            </div>
                          </th>
                          <th className="p-3 font-semibold min-w-[90px]">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>Rating</span>
                            </div>
                          </th>
                          <th className="p-3 font-semibold min-w-[80px]">Budget</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {mapsResults.map((item) => {
                          const isSelected = selectedMapItems.includes(item.id);
                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors duration-150 hover:bg-slate-800/40 ${isSelected ? 'bg-amber-950/20 border-l-2 border-l-amber-500' : 'border-l-2 border-l-transparent'
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
                              <td className="p-3 align-top">
                                <div className="space-y-1">
                                  <a
                                    href={item.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-white text-sm hover:text-amber-400 transition-colors flex items-center space-x-1.5 group"
                                  >
                                    <span className="truncate max-w-[160px]">{item.name}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-amber-400 flex-shrink-0 transition-colors" />
                                  </a>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{item.siteName}</span>
                                    <span className="px-1.5 py-px rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[9px] border border-emerald-500/20 whitespace-nowrap">
                                      {item.matchScore}% match
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Website URL */}
                              <td className="p-3 align-top">
                                {item.websiteUrl ? (
                                  <a
                                    href={item.websiteUrl.startsWith('http') ? item.websiteUrl : `https://${item.websiteUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-900/30 text-cyan-300 text-[11px] font-mono transition-all group max-w-[140px]"
                                  >
                                    <Globe className="w-3 h-3 flex-shrink-0 text-cyan-400 group-hover:text-cyan-300" />
                                    <span className="truncate">{item.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 text-slate-600 text-[11px] italic">
                                    <Globe className="w-3 h-3" />
                                    <span>Not listed</span>
                                  </span>
                                )}
                              </td>

                              {/* Matched Specs Chips */}
                              <td className="p-3 align-top">
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {item.itemSpecs.slice(0, 4).map((spec, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-1.5 py-0.5 rounded-md bg-amber-500/8 text-amber-300/90 font-mono text-[10px] border border-amber-500/15"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                  {item.itemSpecs.length > 4 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700">
                                      +{item.itemSpecs.length - 4}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Phone — with Call + WhatsApp + Copy */}
                              <td className="p-3 align-top font-mono">
                                {item.phone ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1">
                                      <Phone className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                      <a href={`tel:${item.phone}`} className="text-slate-200 hover:text-white text-[12px] transition-colors">{item.phone}</a>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={`https://wa.me/${item.phone.replace(/[^0-9+]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[9px] border border-green-500/20 hover:bg-green-500/20 transition font-semibold"
                                      >
                                        WhatsApp
                                      </a>
                                      <button
                                        onClick={() => handleCopy(item.phone, `p_${item.id}`)}
                                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] border border-slate-700 hover:text-white transition"
                                      >
                                        {copiedField === `p_${item.id}` ? '✓' : 'Copy'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic text-[11px]">In-Store Only</span>
                                )}
                              </td>

                              {/* Email */}
                              <td className="p-3 align-top font-mono">
                                {item.email ? (
                                  <div className="space-y-1">
                                    <a href={`mailto:${item.email}`} className="text-slate-200 hover:text-cyan-400 text-[11px] block truncate max-w-[150px] transition-colors">{item.email}</a>
                                    <button
                                      onClick={() => handleCopy(item.email, `e_${item.id}`)}
                                      className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] border border-slate-700 hover:text-white transition"
                                    >
                                      {copiedField === `e_${item.id}` ? '✓ Copied' : 'Copy Email'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic text-[11px]">—</span>
                                )}
                              </td>

                              {/* Address */}
                              <td className="p-3 align-top max-w-[220px]" title={item.address}>
                                <div className="flex items-start space-x-1.5">
                                  <MapPin className="w-3 h-3 text-rose-400/80 flex-shrink-0 mt-0.5" />
                                  <span className="text-slate-300 text-[11px] leading-tight line-clamp-2">{item.address || 'Address not available'}</span>
                                </div>
                              </td>

                              {/* Coordinates */}
                              <td className="p-3 align-top font-mono text-[11px] whitespace-nowrap">
                                {item.latitude !== null && item.longitude !== null ? (
                                  <a
                                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-900/80 text-cyan-300 rounded-lg border border-cyan-800/30 hover:border-cyan-400/50 transition-all"
                                  >
                                    <Navigation className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-600">—</span>
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

                              {/* Price Estimate */}
                              <td className="p-3 align-top whitespace-nowrap">
                                <span className="font-mono text-[11px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/8 border border-emerald-500/15">
                                  {item.priceEstimate || '—'}
                                </span>
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
                    <span className="hidden sm:inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-mono"><Sparkles className="w-3 h-3" /> AI</span>
                  </div>
                  <h2 className="text-[22px] font-bold text-white tracking-tight mt-2 flex items-center gap-2">
                    <span>Universal Product Finder & Specs Enrichment</span>
                  </h2>
                  <p className="text-[13px] text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Keyword-matched scraping with geo-radius perimeter, taxonomy-aware spec normalisation, and B2B seller enrichment — 100s–1000s of sources filtered to verified channels.
                  </p>
                </div>

                {/* Mode Switcher — FeatherLite */}
                <div className="flex items-center p-1 bg-white/[0.06] border border-white/10 rounded-full">
                  <button
                    onClick={() => setProductViewMode('specs')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition border ${productViewMode === 'specs' ? 'bg-white text-slate-900 border-white shadow-sm' : 'text-slate-300 border-transparent hover:text-white'}`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Product Specs & Marketplace View</span>
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
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          productNameInput.trim()
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
                          {appliedTemplateId && <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-bold">Active · {CATEGORY_QUICK_TEMPLATES.find(t=>t.id===appliedTemplateId)?.title.slice(0,22)}</span>}
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
                  <button type="button" onClick={() => setShowSpecBuilder(v=>!v)} className="w-full flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-white/[0.03] transition">
                    <span className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-white text-slate-900 flex items-center justify-center"><Terminal className="w-3.5 h-3.5" /></span>
                      <span className="text-xs font-bold tracking-widest uppercase text-white">Spec Criteria</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-bold font-mono">{specsList.length} · AI normalized</span>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/12 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono"><Sparkles className="w-3 h-3" /> taxonomy-aware</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span onClick={(e)=>{e.stopPropagation(); handleAddSpec();}} className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 transition"><Plus className="w-3 h-3" /> Add</span>
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
                          className={`p-3 rounded-xl border transition-all ${
                            isInvalidRange
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
                                        className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono ${
                                          isInvalidRange ? 'border-amber-500/60' : 'border-slate-700'
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <input
                                        type="text"
                                        value={spec.maxValue || ''}
                                        onChange={(e) => handleUpdateSpec(spec.id, { maxValue: e.target.value })}
                                        placeholder="Max (e.g. 32GB, 240Hz)"
                                        className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono ${
                                          isInvalidRange ? 'border-amber-500/60' : 'border-slate-700'
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
                        className={`p-2 rounded-lg border text-left flex items-start space-x-2 transition cursor-pointer ${
                          productScope === 'radius'
                            ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                          productScope === 'radius' ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-slate-600'
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
                        className={`p-2 rounded-lg border text-left flex items-start space-x-2 transition cursor-pointer ${
                          productScope === 'india'
                            ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                          productScope === 'india' ? 'border-amber-400 bg-amber-500 text-black' : 'border-slate-600'
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
                        className={`p-2 rounded-lg border text-left flex items-start space-x-2 transition cursor-pointer ${
                          productScope === 'world'
                            ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                          productScope === 'world' ? 'border-cyan-400 bg-cyan-500 text-black' : 'border-slate-600'
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
                <button type="button" onClick={() => setShowLegend(v=>!v)} className="w-full flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-white/[0.03] transition text-left">
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
                <button type="button" onClick={() => setShowAudit(v=>!v)} className="w-full flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-white/[0.03] transition text-left">
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
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  item.statusTag === 'completed'
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
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  seller.businessStatus === 'Active' || seller.businessStatus === 'Operational'
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
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border inline-flex items-center space-x-1 ${
                                  seller.verificationStatus === 'Google Maps Verified'
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
                                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded w-max border ${
                                  seller.operationalHealth?.healthGrade === 'A+'
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
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${
                                (seller.tradeCreditTerms || '').includes('Net')
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
                                  className={`p-1 rounded border transition ${
                                    bookmarkedSellerIds.includes(seller.id)
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
                                  className={`p-1 rounded border transition ${
                                    flaggedSellerIds.includes(seller.id)
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
        {/* Tab 2: Saved Profiles Workspace (Filter, Search, Merge, Rate, Remarks) */}{/* ============================================================== */}
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
                      className={`glass-panel p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                        isMergeSelected ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-800'
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
                                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                                      prof.sourceOrigin === 'product_spec_matrix'
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
                    <button
                      onClick={() => setInspectingProfile(null)}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
                    >
                      Close Dossier
                    </button>
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
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                                    alreadySaved
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
                              className={`flex-shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                log.domain === 'system'
                                  ? 'bg-slate-800 text-slate-300'
                                  : 'bg-violet-950 text-violet-300'
                              }`}
                            >
                              {log.domain}
                            </span>
                            <span
                              className={`break-all ${
                                isSuccess
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
      </div>
    </div>
  );
}
