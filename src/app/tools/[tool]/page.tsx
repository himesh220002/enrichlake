import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import EnrichmentDashboard from '@/components/EnrichmentDashboard';
import PostStudio from '@/components/PostStudio';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { RelatedTools, ToolFaq, ToolHero, ToolSteps, WorkspaceFrame } from '@/components/site/ToolShell';
import { TOOL_ALIASES, getToolBySlug } from '@/lib/site/tools';

const toolConfigs = {
  'company-enrichment': { initialTab: 'live' as const },
  'local-business': { initialTab: 'maps' as const },
  'product-finder': { initialTab: 'products' as const },
  'web-crawler': { initialTab: 'actors' as const, initialActorType: 'web_content' as const },
  'social-intelligence': { initialTab: 'actors' as const, initialActorType: 'instagram' as const },
  'ad-intelligence': { initialTab: 'actors' as const, initialActorType: 'meta_ads' as const },
  'brand-360': { initialTab: 'actors' as const, initialActorType: 'omnichannel_360' as const },
  'serp-intelligence': { initialTab: 'maps' as const, initialMapsMode: 'serp' as const },
  'lead-dossiers': { initialTab: 'saved' as const },
  'saved-profiles': { initialTab: 'saved' as const },
  'post-generator': { initialTab: 'live' as const },
} as const;

type ToolSlug = keyof typeof toolConfigs;

export function generateStaticParams() {
  return Object.keys(toolConfigs).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool: slug } = await params;
  const canonical = TOOL_ALIASES[slug] ?? slug;
  const tool = getToolBySlug(canonical);
  if (!tool) return { title: 'Workspace not found | Enricher' };
  return { title: `${tool.name} | Enricher`, description: tool.detail };
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  // Unify alias routes (e.g. /tools/saved-profiles) onto the canonical dossier page.
  if (TOOL_ALIASES[slug]) redirect(`/tools/${TOOL_ALIASES[slug]}`);

  const config = (toolConfigs as Record<string, (typeof toolConfigs)[ToolSlug] | undefined>)[slug];
  const tool = getToolBySlug(slug);
  if (!config || !tool) notFound();

  const isPostStudio = slug === 'post-generator';

  return (
    <div className="cf-light min-h-screen">
      <SiteNavbar variant="solid" />
      <main>
        {/* Cashfree-style hero fills the first viewport — no empty-search-bar feel */}
        <ToolHero tool={tool} showHero={!isPostStudio} />

        {isPostStudio ? (
          <div id="workspace" className="scroll-mt-24 bg-white">
            <div className="cf-container py-10 sm:py-14">
              <div className="cf-workspace-frame min-h-[72vh]">
                <PostStudio embedded />
              </div>
            </div>
          </div>
        ) : (
          <WorkspaceFrame>
            <EnrichmentDashboard
              initialTab={config.initialTab}
              initialActorType={'initialActorType' in config ? config.initialActorType : undefined}
              initialMapsMode={'initialMapsMode' in config ? config.initialMapsMode : undefined}
              dedicatedTool
              hideChrome
            />
          </WorkspaceFrame>
        )}

        <ToolSteps tool={tool} />
        <ToolFaq tool={tool} />
        <RelatedTools slug={tool.slug} />
      </main>
      <SiteFooter />
    </div>
  );
}
