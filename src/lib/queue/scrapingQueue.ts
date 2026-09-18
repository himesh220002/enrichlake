import { Queue, Job } from 'bullmq';
import { redisConnection } from '../redis';

export interface EnrichmentJobData {
  id?: string;
  domain: string;
  companyName?: string;
  depth?: 'basic' | 'deep';
  extractTechnographics?: boolean;
  extractContacts?: boolean;
  extractLocalInfo?: boolean;
  priority?: number;
  timestamp: string;
}

export const SCRAPING_QUEUE_NAME = 'enrichment-scraping-queue';

export const scrapingQueue = new Queue<EnrichmentJobData>(SCRAPING_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 3600 * 24, // keep completed jobs for 24h
      count: 1000,
    },
    removeOnFail: {
      age: 3600 * 48,
    },
  },
});

/**
 * Enqueue a single domain for enrichment
 */
export async function enqueueDomainEnrichment(data: Omit<EnrichmentJobData, 'timestamp'>) {
  const job = await scrapingQueue.add(
    `enrich-${data.domain}`,
    {
      ...data,
      timestamp: new Date().toISOString(),
    },
    {
      jobId: `job_${data.domain.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
      priority: data.priority || 5,
    }
  );
  return job;
}

/**
 * Bulk enqueue domain list
 */
export async function enqueueBulkDomains(domains: string[], options: Partial<EnrichmentJobData> = {}) {
  const jobs = domains.map((domain) => ({
    name: `enrich-${domain}`,
    data: {
      domain: domain.trim(),
      depth: options.depth || 'deep',
      extractTechnographics: options.extractTechnographics ?? true,
      extractContacts: options.extractContacts ?? true,
      extractLocalInfo: options.extractLocalInfo ?? true,
      timestamp: new Date().toISOString(),
      ...options,
    },
    opts: {
      jobId: `job_${domain.trim().replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
      priority: options.priority || 5,
    },
  }));

  return await scrapingQueue.addBulk(jobs);
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    scrapingQueue.getWaitingCount(),
    scrapingQueue.getActiveCount(),
    scrapingQueue.getCompletedCount(),
    scrapingQueue.getFailedCount(),
    scrapingQueue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}
