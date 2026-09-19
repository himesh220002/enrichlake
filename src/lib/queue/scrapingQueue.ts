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

export interface FormattedQueueJob {
  id: string;
  name: string;
  domain: string;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  progress: number;
  state: 'waiting' | 'active' | 'completed' | 'failed';
  returnvalue?: any;
  failedReason?: string;
  durationMs?: number;
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
      count: 500,
    },
    removeOnFail: {
      age: 3600 * 48,
      count: 200,
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
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      scrapingQueue.getWaitingCount(),
      scrapingQueue.getActiveCount(),
      scrapingQueue.getCompletedCount(),
      scrapingQueue.getFailedCount(),
      scrapingQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  } catch (err: any) {
    console.warn('[BullMQ] getQueueMetrics fallback:', err.message);
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  }
}

/**
 * Fetch detailed recent jobs with state and return value
 */
export async function getDetailedJobs(limit = 20): Promise<FormattedQueueJob[]> {
  try {
    const jobs = await scrapingQueue.getJobs(['active', 'waiting', 'completed', 'failed'], 0, limit - 1, true);

    return jobs.map((job) => {
      let state: FormattedQueueJob['state'] = 'waiting';
      if (job.failedReason) state = 'failed';
      else if (job.finishedOn) state = 'completed';
      else if (job.processedOn) state = 'active';

      let durationMs: number | undefined = undefined;
      if (job.processedOn && job.finishedOn) {
        durationMs = job.finishedOn - job.processedOn;
      }

      return {
        id: String(job.id),
        name: job.name,
        domain: job.data.domain,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        progress: typeof job.progress === 'number' ? job.progress : (state === 'completed' ? 100 : 0),
        state,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        durationMs,
      };
    });
  } catch (err: any) {
    console.warn('[BullMQ] getDetailedJobs fallback:', err.message);
    return [];
  }
}

/**
 * Clear completed, failed, and waiting jobs
 */
export async function clearQueue() {
  try {
    await Promise.all([
      scrapingQueue.clean(0, 1000, 'completed'),
      scrapingQueue.clean(0, 1000, 'failed'),
      scrapingQueue.clean(0, 1000, 'wait'),
    ]);
    return true;
  } catch (err: any) {
    console.warn('[BullMQ] clearQueue error:', err.message);
    return false;
  }
}
