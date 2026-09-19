import { Worker, Job } from 'bullmq';
import { redisConnection } from '../redis';
import { SCRAPING_QUEUE_NAME, EnrichmentJobData } from './scrapingQueue';
import { enrichDomain, EnrichedCompanyProfile } from '../scraper/enrichDomain';

export interface QueueLogEntry {
  id: string;
  timestamp: string;
  domain: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  step?: number;
  durationMs?: number;
}

// In-Memory Streaming Activity Log (Ring Buffer of 60 events)
const MAX_LOGS = 60;
export const queueActivityLogs: QueueLogEntry[] = [
  {
    id: 'init_log_1',
    timestamp: new Date().toISOString(),
    domain: 'system',
    type: 'info',
    message: 'BullMQ Stealth Scraping Engine initialized with concurrency control & Redis persistence.',
  }
];

export function addQueueLog(entry: Omit<QueueLogEntry, 'id' | 'timestamp'>) {
  const log: QueueLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  queueActivityLogs.unshift(log);
  if (queueActivityLogs.length > MAX_LOGS) {
    queueActivityLogs.pop();
  }
  return log;
}

let activeWorkerInstance: Worker<EnrichmentJobData, EnrichedCompanyProfile> | null = null;

export function createScrapingWorker(concurrency = 3) {
  const worker = new Worker<EnrichmentJobData, EnrichedCompanyProfile>(
    SCRAPING_QUEUE_NAME,
    async (job: Job<EnrichmentJobData>) => {
      const startTime = Date.now();
      const domain = job.data.domain;

      console.log(`[BullMQ Worker] Picked up job ${job.id} for domain: ${domain}`);
      addQueueLog({
        domain,
        type: 'info',
        step: 1,
        message: `🚀 Launching stealth browser worker for ${domain} (Job #${job.id})`,
      });

      await job.updateProgress(25);

      addQueueLog({
        domain,
        type: 'info',
        step: 2,
        message: `📡 Extracting local business meta, emails, phones, and Schema.org for ${domain}...`,
      });

      await job.updateProgress(50);

      // Perform stealth domain enrichment
      const result = await enrichDomain(domain);

      await job.updateProgress(80);
      addQueueLog({
        domain,
        type: 'info',
        step: 3,
        message: `⚡ Technographic scanner identified ${result.technographics.technologies.length} technologies on ${domain}`,
      });

      const totalDuration = Date.now() - startTime;
      await job.updateProgress(100);

      addQueueLog({
        domain,
        type: 'success',
        step: 4,
        durationMs: totalDuration,
        message: `✓ Completed enrichment for ${result.companyName || domain} in ${totalDuration}ms (${result.contactInfo.emails.length} emails, ${result.contactInfo.phones.length} phones)`,
      });

      console.log(`[BullMQ Worker] Finished job ${job.id} for domain: ${domain} in ${totalDuration}ms`);
      return result;
    },
    {
      connection: redisConnection,
      concurrency,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`[BullMQ Worker Event] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    const domain = job?.data?.domain || 'unknown';
    console.error(`[BullMQ Worker Event] Job ${job?.id} (${domain}) failed:`, err.message);
    addQueueLog({
      domain,
      type: 'error',
      message: `✗ Job #${job?.id} for ${domain} failed: ${err.message}`,
    });
  });

  return worker;
}

/**
 * Singleton worker getter to avoid duplicate listeners in Next.js development server
 */
export function getOrCreateScrapingWorker(concurrency = 3) {
  if (!activeWorkerInstance) {
    console.log('[BullMQ] Initializing singleton Scraping Worker...');
    activeWorkerInstance = createScrapingWorker(concurrency);
  }
  return activeWorkerInstance;
}
