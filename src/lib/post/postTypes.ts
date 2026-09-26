/**
 * Post Studio — Launch-post generator types.
 *
 * Turns a live website URL (+ optional GitHub repo) into platform-ready
 * social copy: post fields, detail fields, and tag fields per platform.
 */

export type PostPlatform = 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'x';

export const POST_PLATFORMS: Array<{ value: PostPlatform; label: string; hint: string }> = [
  { value: 'linkedin', label: 'LinkedIn', hint: 'Professional · ~1,300 chars · 3–8 tags' },
  { value: 'instagram', label: 'Instagram', hint: 'Visual · ~1,200 chars · 15–25 tags' },
  { value: 'facebook', label: 'Facebook', hint: 'Conversational · ~600 chars · 2–4 tags' },
  { value: 'youtube', label: 'YouTube', hint: 'Title ≤100 · description + tags' },
  { value: 'x', label: 'X (Twitter)', hint: 'Punchy · ≤280 chars · 1–3 tags' },
];

export type PostTemplateId =
  | 'product-launch'
  | 'popularity-boost'
  | 'business-upgrade'
  | 'career-rebuild'
  | 'feature-showcase'
  | 'custom';

export const POST_TEMPLATES: Array<{
  value: PostTemplateId;
  label: string;
  goal: string;
  promptHint: string;
}> = [
  {
    value: 'product-launch',
    label: 'Product Launch',
    goal: 'Announce the project to the world and drive first visits.',
    promptHint: 'e.g. Announce v1.0, highlight the 3 biggest features, invite beta users',
  },
  {
    value: 'popularity-boost',
    label: 'Popularity Gain',
    goal: 'Maximize reach, saves, and shares with a hook-first story.',
    promptHint: 'e.g. Hook with the problem, tease the demo, ask for reposts',
  },
  {
    value: 'business-upgrade',
    label: 'Business Upgrade',
    goal: 'Speak to clients: outcomes, credibility, and how to reach out.',
    promptHint: 'e.g. Position for freelance clients, stress outcomes and contact CTA',
  },
  {
    value: 'career-rebuild',
    label: 'Career / Recruiter Magnet',
    goal: 'Showcase craft so recruiters and hiring managers reach out.',
    promptHint: 'e.g. Highlight stack, engineering decisions, open-to-work CTA',
  },
  {
    value: 'feature-showcase',
    label: 'Feature Showcase',
    goal: 'Walk through capabilities one by one with demo framing.',
    promptHint: 'e.g. Showcase each feature as its own beat with screenshots',
  },
  {
    value: 'custom',
    label: 'Custom Prompt',
    goal: 'Write your own angle — the generator follows your direction.',
    promptHint: 'e.g. Write it as a build-in-public thread for indie hackers',
  },
];

export interface CollectedSite {
  url: string;
  title: string;
  description: string;
  valueProposition: string;
  executiveSummary: string;
  coreOfferings: string[];
  targetAudience: string;
  industrySector: string;
  technologySignals: string[];
  keyTakeaways: string[];
  headings: string[];
  stats: { wordCount: number; headings: number; links: number };
  links: { internal: string[]; external: string[] };
  ogImage?: string;
  screenshotDesktopUrl: string;
  screenshotMobileUrl: string;
}

export interface CollectedGithub {
  repoUrl: string;
  owner: string;
  repo: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  languages: string[];
  topics: string[];
  license?: string;
  readmeExcerpt: string;
}

export interface CollectedSource {
  site: CollectedSite;
  github: CollectedGithub | null;
  collectedAt: string;
}

export interface PlatformPost {
  platform: PostPlatform;
  headline: string;
  body: string;
  hashtags: string[];
  tags: string[];
  cta: string;
  firstComment: string;
  charCount: number;
  charLimit: number;
  overLimit: boolean;
}

export interface GeneratedPack {
  template: PostTemplateId;
  customPrompt: string;
  source: 'ai_synthesis' | 'heuristic_nlp';
  detailFields: {
    featureBullets: string[];
    techLine: string;
    links: string[];
    statsLine: string;
  };
  tagFields: {
    core: string[];
    niche: string[];
    broad: string[];
  };
  posts: PlatformPost[];
  generatedAt: string;
}

export interface ByokConfig {
  provider: string;
  model: string;
  apiKey: string;
}
