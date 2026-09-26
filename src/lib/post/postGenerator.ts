import type {
  ByokConfig,
  CollectedSource,
  GeneratedPack,
  PlatformPost,
  PostPlatform,
  PostTemplateId,
} from './postTypes';

const LIMITS: Record<PostPlatform, number> = {
  linkedin: 3000,
  instagram: 2200,
  facebook: 5000,
  youtube: 5000,
  x: 280,
};

interface TemplateVoice {
  hook: string;
  angle: string;
  cta: string;
  broadTags: string[];
}

function templateVoice(
  template: PostTemplateId,
  customPrompt: string,
  project: string,
  oneLiner: string
): TemplateVoice {
  switch (template) {
    case 'product-launch':
      return {
        hook: `I just launched ${project} — ${oneLiner}`,
        angle: 'launch announcement with first-visit invitation',
        cta: 'Try it live and tell me what breaks — link in comments.',
        broadTags: ['ProductLaunch', 'BuildInPublic', 'NewRelease', 'Startup'],
      };
    case 'popularity-boost':
      return {
        hook: `Stop scrolling — ${project} solves the problem nobody talks about: ${oneLiner}`,
        angle: 'hook-first viral story with share trigger',
        cta: 'Repost this if you know someone who needs it.',
        broadTags: ['Viral', 'MustSee', 'BuildInPublic', 'TechCommunity'],
      };
    case 'business-upgrade':
      return {
        hook: `${project}: ${oneLiner} — built for clients who need results, not slides.`,
        angle: 'client-facing credibility with outreach invitation',
        cta: 'DM me if you want something like this for your business.',
        broadTags: ['Freelance', 'WebDevelopment', 'BusinessGrowth', 'ForClients'],
      };
    case 'career-rebuild':
      return {
        hook: `I built ${project} to prove a point: ${oneLiner}`,
        angle: 'craft showcase that makes recruiters reach out',
        cta: 'Open to new opportunities — hiring managers, my DMs are open.',
        broadTags: ['OpenToWork', 'WebDeveloper', 'Portfolio', 'Hiring'],
      };
    case 'feature-showcase':
      return {
        hook: `What ${project} actually does — a quick tour: ${oneLiner}`,
        angle: 'feature-by-feature walkthrough with demo framing',
        cta: 'Which feature should I demo in detail next? Comment below.',
        broadTags: ['Demo', 'Features', 'Walkthrough', 'BuildInPublic'],
      };
    case 'custom':
    default: {
      const angle = customPrompt.trim().slice(0, 140) || 'custom angle';
      return {
        hook: `${project} — ${oneLiner} (${angle})`,
        angle: `custom direction: ${angle}`,
        cta: 'Link below — feedback welcome.',
        broadTags: ['BuildInPublic', 'Showcase', 'WebDev'],
      };
    }
  }
}

function toHashtag(raw: string): string | null {
  const clean = raw
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join('');
  if (clean.length < 2 || clean.length > 30) return null;
  return `#${clean}`;
}

function hashtagBank(source: CollectedSource, broad: string[]): { core: string[]; niche: string[]; broad: string[] } {
  const { site, github } = source;
  const core = new Set<string>();
  const niche = new Set<string>();

  for (const word of site.title.split(/[\s–—|•/]+/).slice(0, 4)) {
    const tag = toHashtag(word);
    if (tag) core.add(tag);
  }
  for (const word of site.industrySector.split(/[\s&,/]+/).slice(0, 3)) {
    const tag = toHashtag(word);
    if (tag && tag.length > 3) niche.add(tag);
  }
  const techPool = [...site.technologySignals, ...(github?.languages || []), ...(github?.topics || [])];
  for (const tech of techPool.slice(0, 8)) {
    for (const word of tech.split(/[\s./-]+/).slice(0, 2)) {
      const tag = toHashtag(word);
      if (tag && tag.length > 2) niche.add(tag);
    }
  }
  for (const b of broad) {
    const tag = toHashtag(b);
    if (tag) niche.add(tag);
  }

  const broadDefaults = ['WebDevelopment', 'Coding', 'Tech', 'Innovation'];
  const broadTags = broadDefaults.map((b) => `#${b}`);

  return {
    core: Array.from(core).slice(0, 4),
    niche: Array.from(niche).slice(0, 12),
    broad: broadTags,
  };
}

function bullets(features: string[], max: number): string[] {
  return features.filter((f) => f.length > 8).slice(0, max);
}

function fit(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

interface Ctx {
  project: string;
  oneLiner: string;
  features: string[];
  techLine: string;
  siteUrl: string;
  repoUrl: string;
  voice: TemplateVoice;
  author: string;
}

function linkedinBody(c: Ctx): string {
  const feat = bullets(c.features, 4).map((f) => `→ ${f}`).join('\n');
  const tech = c.techLine ? `\n\nStack: ${c.techLine}` : '';
  return `${c.voice.hook}.\n\n${feat}${tech}\n\n${c.voice.cta}\n\nLive: ${c.siteUrl}${c.repoUrl ? `\nCode: ${c.repoUrl}` : ''}`;
}

function instagramBody(c: Ctx): string {
  const feat = bullets(c.features, 4).map((f) => `✦ ${f}`).join('\n');
  return `${c.voice.hook}.\n\n${feat}\n\n${c.voice.cta}\n\nScreenshots above — full demo at the link in bio.`;
}

function facebookBody(c: Ctx): string {
  const feat = bullets(c.features, 3).map((f) => `• ${f}`).join('\n');
  return `Big update, everyone — ${c.voice.hook}.\n\nHere's what it does:\n${feat}\n\n${c.voice.cta}\n\n${c.siteUrl}`;
}

function youtubeTitle(c: Ctx): string {
  return fit(`I Built ${c.project} — ${c.oneLiner}`, 100);
}

function youtubeDescription(c: Ctx, tags: string[]): string {
  const feat = bullets(c.features, 5).map((f, i) => `${i + 1}. ${f}`).join('\n');
  return `${c.voice.hook}.\n\nIn this video I walk through ${c.project}:\n${feat}\n\nTry it: ${c.siteUrl}${c.repoUrl ? `\nSource code: ${c.repoUrl}` : ''}\n\n${c.voice.cta}\n\nTags: ${tags.join(', ')}`;
}

function xBody(c: Ctx, tags: string[]): string {
  const tagStr = tags.slice(0, 2).join(' ');
  // Reserve room for the link (t.co) + tags.
  const reserved = 24 + 1 + tagStr.length + 1;
  const text = `${c.voice.hook}. ${c.voice.cta}`;
  return fit(`${fit(text, 280 - reserved)} ${c.siteUrl} ${tagStr}`.trim(), 280);
}

function buildPost(platform: PostPlatform, c: Ctx, tags: { core: string[]; niche: string[]; broad: string[] }): PlatformPost {
  const allTags = [...tags.core, ...tags.niche].slice(0, 20);
  let headline = '';
  let body = '';
  let hashtags: string[] = [];
  let tagsOut: string[] = [];
  let firstComment = '';
  let cta = c.voice.cta;

  if (platform === 'linkedin') {
    headline = fit(`${c.project} — ${c.voice.angle}`, 220);
    body = linkedinBody(c);
    hashtags = [...tags.core, ...tags.niche.slice(0, 4)].slice(0, 6);
    body = `${fit(body, LIMITS.linkedin - hashtags.join(' ').length - 2)}\n\n${hashtags.join(' ')}`;
    firstComment = `Live demo: ${c.siteUrl}${c.repoUrl ? `\nSource: ${c.repoUrl}` : ''}`;
  } else if (platform === 'instagram') {
    headline = fit(c.voice.hook, 220);
    body = instagramBody(c);
    hashtags = allTags.slice(0, 20);
    body = fit(body, LIMITS.instagram - 60);
    firstComment = `${hashtags.join(' ')}\n${c.siteUrl}`;
    cta = `${c.voice.cta} (Link in bio / first comment.)`;
  } else if (platform === 'facebook') {
    headline = fit(c.voice.hook, 220);
    body = facebookBody(c);
    hashtags = [...tags.core, ...tags.niche.slice(0, 2)].slice(0, 4);
    body = `${fit(body, LIMITS.facebook - hashtags.join(' ').length - 2)}\n\n${hashtags.join(' ')}`;
    firstComment = '';
  } else if (platform === 'youtube') {
    headline = youtubeTitle(c);
    tagsOut = [...tags.core, ...tags.niche, ...tags.broad]
      .map((t) => t.replace(/^#/, ''))
      .filter((t, i, arr) => t.length > 1 && arr.indexOf(t) === i)
      .slice(0, 15);
    // YouTube tags field: 500-char total budget.
    let budget = 500;
    tagsOut = tagsOut.filter((t) => {
      if (t.length + 1 > budget) return false;
      budget -= t.length + 1;
      return true;
    });
    hashtags = tags.core.slice(0, 3);
    body = fit(youtubeDescription(c, tagsOut), LIMITS.youtube);
    firstComment = `Pinned: try it here → ${c.siteUrl}`;
  } else {
    headline = fit(c.voice.hook, 100);
    hashtags = [...tags.core, ...tags.niche.slice(0, 1)].slice(0, 2);
    body = xBody(c, hashtags);
    firstComment = '';
  }

  return {
    platform,
    headline,
    body,
    hashtags,
    tags: tagsOut,
    cta,
    firstComment,
    charCount: body.length,
    charLimit: LIMITS[platform],
    overLimit: body.length > LIMITS[platform],
  };
}

async function enhanceWithByok(
  byok: ByokConfig,
  posts: PlatformPost[],
  context: string
): Promise<'ai_synthesis' | 'heuristic_nlp'> {
  try {
    const prompt = `You are a senior social-media copywriter. Rewrite the SOCIAL POST BODIES below to be punchier and more engaging while keeping every fact, link, and number identical. Keep each rewrite within its character limit.

Context: ${context.slice(0, 1200)}

${posts.map((p) => `[${p.platform}] limit=${p.charLimit}:\n${p.body.slice(0, 1500)}`).join('\n\n')}

Return ONLY JSON: {"bodies": {"<platform>": "<rewritten body>"}}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      let text = '';
      const provider = byok.provider.toLowerCase();
      if (provider === 'gemini' || provider === 'google') {
        const model = byok.model.includes('gemini') ? byok.model : 'gemini-2.5-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${byok.apiKey}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );
        if (!res.ok) return 'heuristic_nlp';
        const json = await res.json();
        text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${byok.apiKey}` },
          body: JSON.stringify({
            model: byok.model || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You rewrite social copy. Always output valid JSON.' },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
          }),
        });
        if (!res.ok) return 'heuristic_nlp';
        const json = await res.json();
        text = json.choices?.[0]?.message?.content || '';
      }
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return 'heuristic_nlp';
      const parsed = JSON.parse(match[0]) as { bodies?: Record<string, string> };
      if (!parsed.bodies) return 'heuristic_nlp';
      let applied = false;
      for (const post of posts) {
        const improved = parsed.bodies[post.platform];
        if (typeof improved === 'string' && improved.length > 40 && improved.length <= post.charLimit) {
          post.body = improved;
          post.charCount = improved.length;
          applied = true;
        }
      }
      return applied ? 'ai_synthesis' : 'heuristic_nlp';
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return 'heuristic_nlp';
  }
}

export async function generateLaunchPosts(params: {
  source: CollectedSource;
  platforms: PostPlatform[];
  template: PostTemplateId;
  customPrompt?: string;
  authorName?: string;
  byok?: ByokConfig;
}): Promise<GeneratedPack> {
  const { source, template } = params;
  const customPrompt = (params.customPrompt || '').slice(0, 500);
  const platforms = params.platforms.length > 0 ? params.platforms : (['linkedin'] as PostPlatform[]);
  const author = params.authorName?.trim().slice(0, 60) || '';

  const project = source.site.title || 'My Project';
  const oneLiner =
    source.site.valueProposition?.split('.')[0]?.slice(0, 140) ||
    source.site.description?.split('.')[0]?.slice(0, 140) ||
    'a new web project';
  const voice = templateVoice(template, customPrompt, project, oneLiner);

  const techParts = [
    ...source.site.technologySignals.slice(0, 4),
    ...(source.github?.languages.slice(0, 3) || []),
  ].filter((t, i, arr) => t && arr.indexOf(t) === i);

  const ctx: Ctx = {
    project,
    oneLiner,
    features: source.site.coreOfferings.length > 0 ? source.site.coreOfferings : source.site.keyTakeaways,
    techLine: techParts.slice(0, 5).join(', '),
    siteUrl: source.site.url,
    repoUrl: source.github?.repoUrl || '',
    voice,
    author,
  };

  const tags = hashtagBank(source, voice.broadTags);
  const posts = platforms.map((p) => buildPost(p, ctx, tags));

  let origin: 'ai_synthesis' | 'heuristic_nlp' = 'heuristic_nlp';
  if (params.byok?.apiKey && params.byok?.provider) {
    origin = await enhanceWithByok(
      params.byok,
      posts,
      `${project}. ${oneLiner}. Features: ${ctx.features.slice(0, 5).join('; ')}. Author: ${author || 'the builder'}.`
    );
  }

  const featureBullets = bullets(ctx.features, 6);

  return {
    template,
    customPrompt,
    source: origin,
    detailFields: {
      featureBullets,
      techLine: ctx.techLine || 'Modern web stack',
      links: [ctx.siteUrl, ...(ctx.repoUrl ? [ctx.repoUrl] : [])],
      statsLine: `${source.site.stats.wordCount} words · ${source.site.stats.headings} sections · ${techParts.length} tech signals${source.github ? ` · ★ ${source.github.stars} · ⑂ ${source.github.forks}` : ''}`,
    },
    tagFields: tags,
    posts,
    generatedAt: new Date().toISOString(),
  };
}
