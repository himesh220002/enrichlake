import { enqueueDomainEnrichment, getQueueMetrics } from '../src/lib/queue/scrapingQueue';
import { createScrapingWorker } from '../src/lib/queue/worker';

async function main() {
  console.log('\n[Queue Test] Initializing BullMQ Worker...');
  const worker = createScrapingWorker(2);

  console.log('[Queue Test] Enqueuing enrichment jobs for vercel.com and github.com...');
  const job1 = await enqueueDomainEnrichment({ domain: 'vercel.com', depth: 'deep' });
  const job2 = await enqueueDomainEnrichment({ domain: 'github.com', depth: 'basic' });

  console.log(`[Queue Test] Jobs enqueued: ${job1.id}, ${job2.id}`);

  const initialMetrics = await getQueueMetrics();
  console.log('[Queue Test] Queue metrics after enqueue:', initialMetrics);

  // Wait for jobs to complete
  await new Promise<void>((resolve) => {
    let completedCount = 0;
    worker.on('completed', async (job) => {
      console.log(`[Queue Test] Completed job: ${job.id} for domain: ${job.data.domain}`);
      completedCount++;
      if (completedCount >= 2) {
        resolve();
      }
    });
  });

  const finalMetrics = await getQueueMetrics();
  console.log('[Queue Test] Final queue metrics:', finalMetrics);

  console.log('[Queue Test] Closing worker and connections...');
  await worker.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('[Queue Test] Error:', err);
  process.exit(1);
});
