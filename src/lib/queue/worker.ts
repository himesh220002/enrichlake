import { Worker, Job } from 'bullmq';
import { redisConnection } from '../redis';
import { SCRAPING_QUEUE_NAME, EnrichmentJobData } from './scrapingQueue';
import { enrichDomain, EnrichedCompanyProfile } from '../scraper/enrichDomain';

export function createScrapingWorker(concurrency = 3) {
  const worker = new Worker<EnrichmentJobData, EnrichedCompanyProfile>(
    SCRAPING_QUEUE_NAME,
    async (job: Job<EnrichmentJobData>) => {
      console.log(`[Worker] Starting job ${job.id} for domain: ${job.data.domain}`);
      await job.updateProgress(10);

      const result = await enrichDomain(job.data.domain);

      await job.updateProgress(100);
      console.log(`[Worker] Finished job ${job.id} for domain: ${job.data.domain} in ${result.executionTimeMs}ms`);
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
    console.log(`[Worker Event] Job ${job.id} has completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker Event] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}
