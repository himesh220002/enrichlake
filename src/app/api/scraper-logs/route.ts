import { NextResponse } from 'next/server';
import { queueActivityLogs, addQueueLog } from '@/lib/queue/worker';

export async function GET() {
  return NextResponse.json({
    success: true,
    logs: queueActivityLogs.slice(0, 50),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.message) {
      addQueueLog({
        domain: body.domain || 'system',
        type: body.type || 'info',
        message: body.message,
        step: body.step,
      });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
