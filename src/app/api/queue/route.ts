import { NextRequest, NextResponse } from 'next/server';
import { enqueueBulkDomains, enqueueDomainEnrichment, getQueueMetrics, scrapingQueue } from '@/lib/queue/scrapingQueue';

export async function GET() {
  try {
    const metrics = await getQueueMetrics();
    const jobs = await scrapingQueue.getJobs(['active', 'waiting', 'completed', 'failed'], 0, 15);

    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      name: job.name,
      domain: job.data.domain,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      state: job.finishedOn ? (job.failedReason ? 'failed' : 'completed') : (job.processedOn ? 'active' : 'waiting'),
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    }));

    return NextResponse.json({ metrics, recentJobs: formattedJobs });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch queue metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domains } = body;

    if (!Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json({ error: 'Provide an array of domains' }, { status: 400 });
    }

    const enqueued = await enqueueBulkDomains(domains);
    return NextResponse.json({
      success: true,
      enqueuedCount: enqueued.length,
      jobIds: enqueued.map((j) => j.id),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to enqueue jobs' }, { status: 500 });
  }
}
