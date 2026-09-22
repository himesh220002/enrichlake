import type { Metadata } from 'next';
import HarvestCommandCenter from '@/components/HarvestCommandCenter';

export const metadata: Metadata = {
  title: 'AI Information Harvesting Command Center | Enricher AI',
  description: 'Mission-control telemetry, business synergy engine, and multi-workspace harvesting console.',
};

export default function DashboardPage() {
  return <HarvestCommandCenter />;
}
