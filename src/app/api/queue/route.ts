import { NextRequest, NextResponse } from 'next/server';
import {
  enqueueBulkDomains,
  enqueueDomainEnrichment,
  getQueueMetrics,
  getDetailedJobs,
  clearQueue,
} from '@/lib/queue/scrapingQueue';
import { getOrCreateScrapingWorker, queueActivityLogs, addQueueLog } from '@/lib/queue/worker';

export async function GET() {
  try {
    // Ensure worker singleton is running
    getOrCreateScrapingWorker(3);

    const [metrics, recentJobs] = await Promise.all([
      getQueueMetrics(),
      getDetailedJobs(25),
    ]);

    return NextResponse.json({
      success: true,
      metrics,
      recentJobs,
      activityLogs: queueActivityLogs.slice(0, 40),
      workerStatus: 'active',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch queue data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Ensure worker singleton is running
    getOrCreateScrapingWorker(3);

    const body = await req.json();
    const { action, domains, domain } = body;

    // 1. Clear Queue Action
    if (action === 'clear') {
      await clearQueue();
      addQueueLog({
        domain: 'system',
        type: 'info',
        message: '🧹 Queue cleared by user action.',
      });
      return NextResponse.json({ success: true, message: 'Queue successfully cleared' });
    }

    // 2. Start Worker / Trigger Processing Action
    if (action === 'start_worker') {
      addQueueLog({
        domain: 'system',
        type: 'info',
        message: '⚡ BullMQ Scraping Worker active and listening for background jobs (concurrency: 3).',
      });
      const metrics = await getQueueMetrics();
      const recentJobs = await getDetailedJobs(25);
      return NextResponse.json({ success: true, metrics, recentJobs, workerStatus: 'active' });
    }

    // 3. Single Domain Enqueue
    if (domain && typeof domain === 'string') {
      const job = await enqueueDomainEnrichment({ domain: domain.trim(), depth: 'deep' });
      addQueueLog({
        domain: domain.trim(),
        type: 'info',
        message: `📥 Enqueued single domain ${domain.trim()} (Job #${job.id})`,
      });
      return NextResponse.json({ success: true, jobId: job.id, domain });
    }

    // 4. Bulk Domains Enqueue
    if (Array.isArray(domains) && domains.length > 0) {
      const cleanDomains = domains
        .map((d: any) => String(d).trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, ''))
        .filter(Boolean);

      const enqueued = await enqueueBulkDomains(cleanDomains);
      addQueueLog({
        domain: cleanDomains[0],
        type: 'info',
        message: `📥 Bulk dispatched ${enqueued.length} domains into BullMQ queue pipeline: ${cleanDomains.slice(0, 3).join(', ')}${cleanDomains.length > 3 ? ` (+${cleanDomains.length - 3} more)` : ''}`,
      });

      return NextResponse.json({
        success: true,
        enqueuedCount: enqueued.length,
        jobIds: enqueued.map((j) => j.id),
      });
    }

    return NextResponse.json({ error: 'Invalid request. Provide domains array or action.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/queue] Error:', error.message);
    return NextResponse.json({ error: error?.message || 'Failed to execute queue operation' }, { status: 500 });
  }
}
