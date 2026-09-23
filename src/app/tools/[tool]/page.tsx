import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EnrichmentDashboard from '@/components/EnrichmentDashboard';

const toolConfigs = {
  'company-enrichment': { title: 'Company enrichment', description: 'Build a source-aware company profile from a domain.', initialTab: 'live' as const },
  'local-business': { title: 'Local business discovery', description: 'Find and qualify local businesses with keyword and location research.', initialTab: 'maps' as const },
  'product-finder': { title: 'Product & supplier finder', description: 'Search detailed product specifications and B2B supplier intelligence.', initialTab: 'products' as const },
  'web-crawler': { title: 'Web crawler', description: 'Extract website content, links, and structured signals from a public URL.', initialTab: 'actors' as const, initialActorType: 'web_content' as const },
  'social-intelligence': { title: 'Social intelligence', description: 'Research public Instagram, LinkedIn, and Facebook presence in one workspace.', initialTab: 'actors' as const, initialActorType: 'instagram' as const },
  'ad-intelligence': { title: 'Ad intelligence', description: 'Explore public Meta Ad Library signals, creatives, and campaign activity.', initialTab: 'actors' as const, initialActorType: 'meta_ads' as const },
  'brand-360': { title: 'Brand 360', description: 'Sweep web and public social signals into one brand intelligence dossier.', initialTab: 'actors' as const, initialActorType: 'omnichannel_360' as const },
  'serp-intelligence': { title: 'Google Search & SERP Intelligence', description: 'Scrape Google Search organic results, paid PPC ads, AI Overviews, and extract verified business leads.', initialTab: 'maps' as const, initialMapsMode: 'serp' as const },
  'lead-dossiers': { title: 'Lead dossiers & Saved profiles', description: 'Curate, filter, rate, segment, and bulk manage enriched company profiles and account graph.', initialTab: 'saved' as const },
  'saved-profiles': { title: 'Saved profiles & Account graph', description: 'Curate, filter, rate, segment, and bulk manage enriched company profiles and account graph.', initialTab: 'saved' as const },
} as const;

type ToolSlug = keyof typeof toolConfigs;

function getTool(slug: string) {
  return toolConfigs[slug as ToolSlug];
}

export function generateStaticParams() {
  return Object.keys(toolConfigs).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: 'Workspace not found | Enricher AI' };
  return { title: `${tool.title} | Enricher AI`, description: tool.description };
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <EnrichmentDashboard
      initialTab={tool.initialTab}
      initialActorType={'initialActorType' in tool ? tool.initialActorType : undefined}
      initialMapsMode={'initialMapsMode' in tool ? tool.initialMapsMode : undefined}
      dedicatedTool
    />
  );
}
