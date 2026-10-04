'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Globe,
  GitBranch,
  Hash,
  Image as ImageIcon,
  Layers,
  Loader2,
  Lock,
  Maximize2,
  Megaphone,
  Monitor,
  RefreshCw,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import {
  POST_PLATFORMS,
  POST_TEMPLATES,
  type CollectedSource,
  type GeneratedPack,
  type PlatformPost,
  type PostPlatform,
  type PostTemplateId,
} from '@/lib/post/postTypes';

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  };
  return { copied, copy };
}

function CopyButton({ onCopy, copied, label = 'Copy' }: { onCopy: () => void; copied: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
        copied
          ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200'
          : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/30 hover:text-white'
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function Field({
  label,
  value,
  fieldKey,
  mono = false,
  hint,
}: {
  label: string;
  value: string;
  fieldKey: string;
  mono?: boolean;
  hint?: string;
}) {
  const { copied, copy } = useCopy();
  if (!value) return null;
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0a1020]/70 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <CopyButton onCopy={() => copy(fieldKey, value)} copied={copied === fieldKey} />
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
      <p className={`mt-2 whitespace-pre-wrap text-[13px] leading-6 text-slate-200 ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function PlatformCard({ post }: { post: PlatformPost }) {
  const { copied, copy } = useCopy();
  const fullPost = [post.headline, '', post.body, post.firstComment ? `\n${post.firstComment}` : '']
    .join('\n')
    .trim();
  const meta = POST_PLATFORMS.find((p) => p.value === post.platform);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-extrabold tracking-tight text-white">{meta?.label}</h4>
          <p className="mt-0.5 text-xs text-slate-500">
            {post.charCount.toLocaleString()} / {post.charLimit.toLocaleString()} chars
            <span className={`ml-2 font-bold ${post.overLimit ? 'text-amber-300' : 'text-emerald-300'}`}>
              {post.overLimit ? 'over limit' : 'fits'}
            </span>
          </p>
        </div>
        <CopyButton
          onCopy={() => copy(`${post.platform}-full`, fullPost)}
          copied={copied === `${post.platform}-full`}
          label="Copy full post"
        />
      </div>

      <Field label="Headline" value={post.headline} fieldKey={`${post.platform}-headline`} />
      <Field label="Post body" value={post.body} fieldKey={`${post.platform}-body`} />
      {post.hashtags.length > 0 && (
        <Field
          label={`Hashtags (${post.hashtags.length})`}
          value={post.hashtags.join(' ')}
          fieldKey={`${post.platform}-hashtags`}
          mono
        />
      )}
      {post.tags.length > 0 && (
        <Field
          label={`YouTube tags (${post.tags.length})`}
          value={post.tags.join(', ')}
          fieldKey={`${post.platform}-tags`}
          mono
          hint="Paste into YouTube Studio → Details → Tags."
        />
      )}
      <Field label="Call to action" value={post.cta} fieldKey={`${post.platform}-cta`} />
      {post.firstComment && (
        <Field
          label="First comment"
          value={post.firstComment}
          fieldKey={`${post.platform}-comment`}
          hint="Post this as the first comment — links stay clickable there."
        />
      )}
    </div>
  );
}

export default function PostStudio() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [platforms, setPlatforms] = useState<PostPlatform[]>(['linkedin', 'x']);
  const [authorName, setAuthorName] = useState('');
  const [showByok, setShowByok] = useState(false);
  const [byokProvider, setByokProvider] = useState('gemini');
  const [byokModel, setByokModel] = useState('gemini-2.5-flash');
  const [byokKey, setByokKey] = useState('');

  const [collecting, setCollecting] = useState(false);
  const [collectError, setCollectError] = useState('');
  const [source, setSource] = useState<CollectedSource | null>(null);

  const [template, setTemplate] = useState<PostTemplateId>('product-launch');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [pack, setPack] = useState<GeneratedPack | null>(null);
  const [activePlatform, setActivePlatform] = useState<PostPlatform>('linkedin');

  const [screenshotMode, setScreenshotMode] = useState<'viewport' | 'fullpage'>('viewport');
  const [screenshotDelay, setScreenshotDelay] = useState<number>(2000);
  const [screenshotVersion, setScreenshotVersion] = useState<number>(0);
  const [recapturing, setRecapturing] = useState<boolean>(false);
  const [copiedImageKey, setCopiedImageKey] = useState<string | null>(null);
  const [desktopImgLoaded, setDesktopImgLoaded] = useState<boolean>(false);
  const [mobileImgLoaded, setMobileImgLoaded] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  const getScreenshotUrl = (vp: 'desktop' | 'mobile', forDownload = false) => {
    if (!source) return '';
    const u = encodeURIComponent(source.site.url);
    const base = `/api/post-studio/screenshot?url=${u}&viewport=${vp}&mode=${screenshotMode}&delay=${screenshotDelay}`;
    const vParam = screenshotVersion > 0 ? `&v=${screenshotVersion}&refresh=1` : '';
    const dParam = forDownload ? '&download=1' : '';
    return `${base}${vParam}${dParam}`;
  };

  const handleRecapture = () => {
    setRecapturing(true);
    setDesktopImgLoaded(false);
    setMobileImgLoaded(false);
    setScreenshotVersion((v) => v + 1);
    setTimeout(() => setRecapturing(false), 800);
  };

  const handleModeChange = (mode: 'viewport' | 'fullpage') => {
    if (mode === screenshotMode) return;
    setScreenshotMode(mode);
    setDesktopImgLoaded(false);
    setMobileImgLoaded(false);
  };

  const handleDelayChange = (delay: number) => {
    setScreenshotDelay(delay);
    setDesktopImgLoaded(false);
    setMobileImgLoaded(false);
    setScreenshotVersion((v) => v + 1);
  };

  const copyImageToClipboard = async (url: string, key: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      if (blob.type === 'image/png') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const imgLoaded = new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
        img.src = URL.createObjectURL(blob);
        const el = await imgLoaded;
        const canvas = document.createElement('canvas');
        canvas.width = el.naturalWidth;
        canvas.height = el.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(el, 0, 0);
        const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (pngBlob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
        }
      }
      setCopiedImageKey(key);
      setTimeout(() => setCopiedImageKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
    }
  };

  const triggerDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const togglePlatform = (p: PostPlatform) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const collect = async () => {
    if (!websiteUrl.trim() || collecting) return;
    setCollecting(true);
    setCollectError('');
    setSource(null);
    setPack(null);
    setScreenshotMode('viewport');
    setScreenshotVersion(0);
    setDesktopImgLoaded(false);
    setMobileImgLoaded(false);
    try {
      const res = await fetch('/api/post-studio/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: websiteUrl.trim(), githubUrl: githubUrl.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Collection failed.');
      setSource(json.data as CollectedSource);
      setTimeout(() => document.getElementById('post-showcase')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setCollectError(err instanceof Error ? err.message : 'Collection failed.');
    } finally {
      setCollecting(false);
    }
  };

  const generate = async () => {
    if (!source || generating) return;
    setGenerating(true);
    setGenerateError('');
    setPack(null);
    try {
      const res = await fetch('/api/post-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          platforms,
          template,
          customPrompt,
          authorName,
          byok: byokKey.trim()
            ? { provider: byokProvider, model: byokModel, apiKey: byokKey.trim() }
            : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed.');
      const data = json.data as GeneratedPack;
      setPack(data);
      if (data.posts.length > 0) setActivePlatform(data.posts[0].platform);
      setTimeout(() => document.getElementById('post-results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const activeTemplate = POST_TEMPLATES.find((t) => t.value === template);
  const activePost = pack?.posts.find((p) => p.platform === activePlatform) ?? pack?.posts[0];

  return (
    <main className="min-h-screen bg-[#080b16] text-slate-100">
      <div className="mx-auto max-w-[1100px] px-5 pb-20 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 pt-6 text-xs text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1 transition hover:text-slate-300">
            <ArrowLeft className="h-3 w-3" /> Home
          </Link>
          <span>/</span>
          <Link href="/dashboard" className="transition hover:text-slate-300">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-300">Post Studio</span>
        </nav>

        <section className="max-w-2xl pt-8">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-fuchsia-300/15 bg-fuchsia-300/[0.06] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-fuchsia-200">
            <Megaphone className="h-3 w-3" /> POST STUDIO · LAUNCH-POST GENERATOR
          </p>
          <h1 className="mt-5 text-balance text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl">
            Turn your live site into posts clients can feel.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
            Paste a deployed URL, optionally link the GitHub repo, pick where you will post — then
            collect real site intel, capture demo screenshots, and generate copy-ready fields per
            platform. Post regularly, stay relevant, and let recruiters reach out.
          </p>
        </section>

        {/* Steps */}
        <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] font-bold">
          {['01 Source', '02 Showcase', '03 Template', '04 Posts'].map((s, i) => {
            const reached = i === 0 || (i === 1 && source) || (i === 2 && source) || (i === 3 && pack);
            return (
              <span
                key={s}
                className={`rounded-full border px-3 py-1.5 ${
                  reached
                    ? 'border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-200'
                    : 'border-white/10 bg-white/[0.03] text-slate-500'
                }`}
              >
                {s}
              </span>
            );
          })}
        </div>

        {/* STEP 1 — Source */}
        <section className="glass-panel mt-6 p-5 sm:p-6" aria-label="Source">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
            <Globe className="h-4 w-4 text-fuchsia-300" /> 1 · Where is the project?
          </h2>

          <div className="mt-4 grid gap-3">
            <div>
              <label htmlFor="post-url" className="text-xs font-bold text-slate-300">
                Live website URL
              </label>
              <input
                id="post-url"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://your-project.vercel.app"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a1020] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fuchsia-300/40 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="post-gh" className="text-xs font-bold text-slate-300">
                GitHub repository <span className="font-medium text-slate-500">(optional — adds stack, topics & credibility)</span>
              </label>
              <input
                id="post-gh"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/you/repo"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a1020] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fuchsia-300/40 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="post-author" className="text-xs font-bold text-slate-300">
                Your name / handle <span className="font-medium text-slate-500">(optional — used in first-person copy)</span>
              </label>
              <input
                id="post-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Himesh"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a1020] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fuchsia-300/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold text-slate-300">Post to <span className="font-medium text-slate-500">(pick one or many)</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              {POST_PLATFORMS.map((p) => {
                const on = platforms.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => togglePlatform(p.value)}
                    aria-pressed={on}
                    title={p.hint}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                      on
                        ? 'border-fuchsia-300/40 bg-fuchsia-400/15 text-fuchsia-100'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
            <button
              type="button"
              onClick={() => setShowByok((s) => !s)}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 transition hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {showByok ? 'Hide AI polish (BYOK)' : 'Add AI polish with your own key (optional)'}
            </button>
            {showByok && (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <select
                  value={byokProvider}
                  onChange={(e) => setByokProvider(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0a1020] px-3 py-2.5 text-xs font-semibold text-slate-200 focus:border-fuchsia-300/40 focus:outline-none"
                  aria-label="AI provider"
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
                <input
                  value={byokModel}
                  onChange={(e) => setByokModel(e.target.value)}
                  placeholder="model (e.g. gemini-2.5-flash)"
                  className="rounded-xl border border-white/10 bg-[#0a1020] px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-fuchsia-300/40 focus:outline-none"
                  aria-label="AI model"
                />
                <input
                  value={byokKey}
                  onChange={(e) => setByokKey(e.target.value)}
                  placeholder="API key (never stored)"
                  type="password"
                  className="rounded-xl border border-white/10 bg-[#0a1020] px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-fuchsia-300/40 focus:outline-none"
                  aria-label="API key"
                />
              </div>
            )}
          </div>

          {collectError && (
            <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
              {collectError}
            </p>
          )}

          <button
            type="button"
            onClick={collect}
            disabled={!websiteUrl.trim() || collecting || platforms.length === 0}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {collecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            {collecting ? 'Collecting site + repo intel…' : 'Collect website info'}
            {!collecting && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
          {platforms.length === 0 && (
            <p className="mt-2 text-xs text-amber-300">Select at least one platform above.</p>
          )}
        </section>

        {/* STEP 2 — Showcase */}
        {source && (
          <section id="post-showcase" className="mt-6 scroll-mt-20 space-y-4" aria-label="Collected showcase">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
              <ImageIcon className="h-4 w-4 text-fuchsia-300" /> 2 · What we found
            </h2>

            <div className="glass-panel p-5 sm:p-6">
              <p className="font-mono text-[11px] text-fuchsia-200/70">{source.site.url}</p>
              <h3 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white">{source.site.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{source.site.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                  {source.site.stats.wordCount.toLocaleString()} words
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                  {source.site.stats.headings} sections
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                  {source.site.industrySector}
                </span>
                <a
                  href={source.site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-fuchsia-300/25 bg-fuchsia-400/10 px-2.5 py-1 font-bold text-fuchsia-200 transition hover:text-white"
                >
                  Visit live <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {source.site.coreOfferings.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Features to showcase</p>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {source.site.coreOfferings.map((f) => (
                      <li key={f} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs leading-5 text-slate-300">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {source.site.technologySignals.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {source.site.technologySignals.map((t) => (
                    <span key={t} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {source.github && (
              <div className="glass-panel p-5 sm:p-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <GitBranch className="h-4 w-4 text-slate-300" />
                  <a href={source.github.repoUrl} target="_blank" rel="noreferrer" className="transition hover:text-fuchsia-200">
                    {source.github.name}
                  </a>
                </h3>
                {source.github.description && (
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">{source.github.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">★ {source.github.stars}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">⑂ {source.github.forks}</span>
                  {source.github.language && (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">{source.github.language}</span>
                  )}
                  {source.github.license && (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">{source.github.license}</span>
                  )}
                </div>
                {(source.github.topics.length > 0 || source.github.languages.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[...source.github.topics, ...source.github.languages].slice(0, 10).map((t) => (
                      <span key={t} className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {source.github.readmeExcerpt && (
                  <p className="mt-3 border-l-2 border-fuchsia-300/30 pl-3 text-xs leading-5 text-slate-500">
                    {source.github.readmeExcerpt.slice(0, 320)}
                    {source.github.readmeExcerpt.length > 320 ? '…' : ''}
                  </p>
                )}
              </div>
            )}

            <div className="glass-panel p-5 sm:p-6" id="demo-captures-section">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                    <ImageIcon className="h-4 w-4 text-fuchsia-300" /> Demo captures — High-resolution post attachments
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Real Chromium screenshots captured after styles, fonts, and assets settle. Ready to copy or attach directly to your launch posts.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRecapture}
                    disabled={recapturing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-400/10 hover:text-white disabled:opacity-50"
                    title="Bypass cache and take fresh screenshots"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${recapturing ? 'animate-spin text-fuchsia-300' : ''}`} />
                    <span>{recapturing ? 'Capturing...' : 'Re-capture'}</span>
                  </button>
                </div>
              </div>

              {/* Viewport / Mode & Delay Controls */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Capture mode:</span>
                  <button
                    type="button"
                    onClick={() => handleModeChange('viewport')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      screenshotMode === 'viewport'
                        ? 'border border-fuchsia-300/40 bg-fuchsia-500/20 text-fuchsia-100 shadow-sm'
                        : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span>Hero Viewport</span>
                    <span className="hidden sm:inline text-[10px] text-fuchsia-300/80 font-normal">(16:9 / Social feed)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('fullpage')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      screenshotMode === 'fullpage'
                        ? 'border border-fuchsia-300/40 bg-fuchsia-500/20 text-fuchsia-100 shadow-sm'
                        : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Full Page Canvas</span>
                    <span className="hidden sm:inline text-[10px] text-fuchsia-300/80 font-normal">(Top-to-bottom)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-400">Load wait:</span>
                  <select
                    value={screenshotDelay}
                    onChange={(e) => handleDelayChange(Number(e.target.value))}
                    className="rounded-lg border border-white/10 bg-[#0d1424] px-2.5 py-1 text-xs font-semibold text-white focus:border-fuchsia-300/40 focus:outline-none"
                    aria-label="Screenshot settlement delay"
                  >
                    <option value={2000}>2s (Standard)</option>
                    <option value={4000}>4s (Deep load / Animations)</option>
                    <option value={6000}>6s (Heavy SPAs / Video)</option>
                  </select>
                </div>
              </div>

              {/* Mockup Previews */}
              <div className="mt-5 grid gap-6 lg:grid-cols-[1.65fr_1fr]">
                {/* Desktop Mockup Card */}
                <figure className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#090d1a] shadow-xl">
                  {/* macOS / Browser Header Frame */}
                  <div className="flex items-center justify-between border-b border-white/10 bg-[#0d1428] px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex max-w-[280px] items-center gap-1.5 truncate rounded-full border border-white/10 bg-black/40 px-3 py-0.5 text-[11px] text-slate-300">
                      <Lock className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{source.site.url.replace(/^https?:\/\//, '')}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {screenshotMode === 'viewport' ? '1440 × 900 · 16:9' : 'Full Page'}
                    </span>
                  </div>

                  {/* Screenshot Canvas */}
                  <div
                    className={`relative w-full bg-[#05070f] ${
                      screenshotMode === 'viewport' ? 'aspect-[16/10] overflow-hidden' : 'max-h-[460px] overflow-y-auto'
                    }`}
                  >
                    {!desktopImgLoaded && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#090e1c] text-slate-400">
                        <Loader2 className="h-7 w-7 animate-spin text-fuchsia-400" />
                        <span className="text-xs font-semibold text-slate-200">Capturing desktop screenshot...</span>
                        <span className="text-[11px] text-slate-500">Waiting for web fonts & assets to settle</span>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={`desktop-${screenshotMode}-${screenshotVersion}`}
                      src={getScreenshotUrl('desktop')}
                      alt={`${source.site.title} desktop demo capture`}
                      className={`w-full transition-opacity duration-300 ${
                        screenshotMode === 'viewport' ? 'h-full object-cover object-top' : ''
                      } ${desktopImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                      loading="lazy"
                      onLoad={() => setDesktopImgLoaded(true)}
                    />
                  </div>

                  {/* Action Bar */}
                  <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0d1428] px-3.5 py-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-3.5 w-3.5 text-fuchsia-300" />
                      <span className="font-semibold text-slate-300">Desktop {screenshotMode === 'viewport' ? 'Hero' : 'Full'} PNG</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyImageToClipboard(getScreenshotUrl('desktop'), 'desktop')}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                          copiedImageKey === 'desktop'
                            ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200'
                            : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/30 hover:text-white'
                        }`}
                        title="Copy image to clipboard for pasting into LinkedIn/X"
                      >
                        {copiedImageKey === 'desktop' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedImageKey === 'desktop' ? 'Copied image!' : 'Copy image'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDownload(getScreenshotUrl('desktop', true), `demo-desktop-${screenshotMode}.png`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-fuchsia-200 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-400/10 hover:text-white"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            url: getScreenshotUrl('desktop'),
                            title: `${source.site.title} — Desktop Screenshot`,
                            subtitle: `Captured at 1440×900 (${screenshotMode === 'viewport' ? 'Hero Viewport' : 'Full Page Canvas'})`,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1 text-slate-400 transition hover:border-white/20 hover:text-white"
                        title="Expand view"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </figcaption>
                </figure>

                {/* Mobile Mockup Card */}
                <figure className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#090d1a] shadow-xl">
                  {/* Phone Bezel Header */}
                  <div className="flex items-center justify-between border-b border-white/10 bg-[#0d1428] px-3.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-fuchsia-300" />
                      <span className="text-[11px] font-bold text-slate-300">iPhone Mobile</span>
                    </div>
                    <div className="h-3.5 w-16 rounded-full border border-white/10 bg-black/60" title="Dynamic Island" />
                    <span className="text-[10px] font-semibold text-slate-400">390 × 844</span>
                  </div>

                  {/* Screenshot Canvas */}
                  <div
                    className={`relative mx-auto w-full bg-[#05070f] ${
                      screenshotMode === 'viewport'
                        ? 'aspect-[9/19] max-w-[280px] overflow-hidden'
                        : 'max-h-[460px] overflow-y-auto'
                    }`}
                  >
                    {!mobileImgLoaded && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#090e1c] text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin text-fuchsia-400" />
                        <span className="text-xs font-semibold text-slate-200">Capturing mobile view...</span>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={`mobile-${screenshotMode}-${screenshotVersion}`}
                      src={getScreenshotUrl('mobile')}
                      alt={`${source.site.title} mobile demo capture`}
                      className={`w-full transition-opacity duration-300 ${
                        screenshotMode === 'viewport' ? 'h-full object-cover object-top' : ''
                      } ${mobileImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                      loading="lazy"
                      onLoad={() => setMobileImgLoaded(true)}
                    />
                  </div>

                  {/* Phone Bottom Home Bar */}
                  <div className="border-t border-white/10 bg-[#0d1428] py-1.5">
                    <div className="mx-auto h-1 w-20 rounded-full bg-white/20" />
                  </div>

                  {/* Action Bar */}
                  <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0d1428] px-3.5 py-2.5 text-xs">
                    <span className="font-semibold text-slate-400">390×844 Retina</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyImageToClipboard(getScreenshotUrl('mobile'), 'mobile')}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                          copiedImageKey === 'mobile'
                            ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200'
                            : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/30 hover:text-white'
                        }`}
                        title="Copy mobile screenshot"
                      >
                        {copiedImageKey === 'mobile' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedImageKey === 'mobile' ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDownload(getScreenshotUrl('mobile', true), `demo-mobile-${screenshotMode}.png`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-fuchsia-200 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-400/10 hover:text-white"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            url: getScreenshotUrl('mobile'),
                            title: `${source.site.title} — Mobile Screenshot`,
                            subtitle: `Captured at 390×844 (${screenshotMode === 'viewport' ? 'Hero Viewport' : 'Full Page Canvas'})`,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1 text-slate-400 transition hover:border-white/20 hover:text-white"
                        title="Expand view"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>

            {/* STEP 3 — Template */}
            <div className="glass-panel p-5 sm:p-6" aria-label="Template">
              <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
                <Hash className="h-4 w-4 text-fuchsia-300" /> 3 · Pick your angle
              </h2>
              <div className="mt-4 grid gap-3">
                <div>
                  <label htmlFor="post-template" className="text-xs font-bold text-slate-300">
                    Post template
                  </label>
                  <select
                    id="post-template"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as PostTemplateId)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a1020] px-3.5 py-2.5 text-sm font-semibold text-white focus:border-fuchsia-300/40 focus:outline-none"
                  >
                    {POST_TEMPLATES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label} — {t.goal}
                      </option>
                    ))}
                  </select>
                  {activeTemplate && (
                    <p className="mt-1.5 text-xs text-slate-500">Goal: {activeTemplate.goal}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="post-prompt" className="text-xs font-bold text-slate-300">
                    Your prompt <span className="font-medium text-slate-500">(steer the tone, audience, or story)</span>
                  </label>
                  <textarea
                    id="post-prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                    placeholder={activeTemplate?.promptHint}
                    className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-[#0a1020] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fuchsia-300/40 focus:outline-none"
                  />
                </div>
              </div>

              {generateError && (
                <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
                  {generateError}
                </p>
              )}

              <button
                type="button"
                onClick={generate}
                disabled={generating}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-400 to-violet-400 px-5 py-3 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? 'Generating platform copy…' : 'Generate posts'}
              </button>
            </div>
          </section>
        )}

        {/* STEP 4 — Results */}
        {pack && (
          <section id="post-results" className="mt-6 scroll-mt-20 space-y-4" aria-label="Generated posts">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
              <Megaphone className="h-4 w-4 text-fuchsia-300" /> 4 · Copy-ready fields
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-medium text-slate-400">
                {pack.source === 'ai_synthesis' ? 'AI-polished' : 'heuristic draft'}
              </span>
            </h2>

            <div className="glass-panel p-5 sm:p-6">
              <h3 className="text-sm font-extrabold text-white">Detail fields</h3>
              <div className="mt-3 grid gap-2.5">
                <Field label="Feature bullets" value={pack.detailFields.featureBullets.map((f) => `• ${f}`).join('\n')} fieldKey="detail-features" />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Field label="Tech line" value={pack.detailFields.techLine} fieldKey="detail-tech" mono />
                  <Field label="Stats line" value={pack.detailFields.statsLine} fieldKey="detail-stats" mono />
                </div>
                <Field label="Links" value={pack.detailFields.links.join('\n')} fieldKey="detail-links" mono />
              </div>
            </div>

            <div className="glass-panel p-5 sm:p-6">
              <h3 className="text-sm font-extrabold text-white">Tag fields</h3>
              <div className="mt-3 grid gap-2.5">
                <Field label={`Core (${pack.tagFields.core.length})`} value={pack.tagFields.core.join(' ')} fieldKey="tags-core" mono />
                <Field label={`Niche (${pack.tagFields.niche.length})`} value={pack.tagFields.niche.join(' ')} fieldKey="tags-niche" mono />
                <Field label={`Broad (${pack.tagFields.broad.length})`} value={pack.tagFields.broad.join(' ')} fieldKey="tags-broad" mono />
              </div>
            </div>

            <div className="glass-panel p-5 sm:p-6">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Platforms">
                {pack.posts.map((p) => (
                  <button
                    key={p.platform}
                    type="button"
                    role="tab"
                    aria-selected={activePlatform === p.platform}
                    onClick={() => setActivePlatform(p.platform)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                      activePlatform === p.platform
                        ? 'border-fuchsia-300/40 bg-fuchsia-400/15 text-fuchsia-100'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {POST_PLATFORMS.find((x) => x.value === p.platform)?.label}
                  </button>
                ))}
              </div>
              <div className="mt-4">{activePost && <PlatformCard post={activePost} />}</div>
            </div>
          </section>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-6"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0a0f1d] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0d1428] px-5 py-3">
              <div>
                <h3 className="text-sm font-bold text-white">{lightboxImage.title}</h3>
                <p className="text-[11px] text-slate-400">{lightboxImage.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyImageToClipboard(lightboxImage.url, 'modal')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                >
                  {copiedImageKey === 'modal' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedImageKey === 'modal' ? 'Copied image!' : 'Copy image'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerDownload(lightboxImage.url, 'demo-capture.png')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-fuchsia-200 transition hover:border-fuchsia-300/40 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="rounded-lg border border-white/10 bg-white/[0.05] p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-auto bg-[#05070f] p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="mx-auto max-h-[78vh] w-auto rounded-lg object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
