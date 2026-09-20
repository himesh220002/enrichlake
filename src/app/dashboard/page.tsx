import type { Metadata } from 'next';
import EnrichmentDashboard from '@/components/EnrichmentDashboard';

export const metadata: Metadata = {
  title: 'All intelligence workspaces | Enricher AI',
  description: 'The complete Enricher AI research dashboard.',
};

export default function DashboardPage() {
  return <EnrichmentDashboard initialTab="products" />;
}
