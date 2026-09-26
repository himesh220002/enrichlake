import { NextRequest, NextResponse } from 'next/server';
import { assertSafeHttpUrl, collectPostSource } from '@/lib/post/postCollector';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteUrl, githubUrl } = body as { websiteUrl?: string; githubUrl?: string };

    if (!websiteUrl || typeof websiteUrl !== 'string' || !websiteUrl.trim()) {
      return NextResponse.json({ error: 'A live website URL is required.' }, { status: 400 });
    }
    assertSafeHttpUrl(websiteUrl, 'Website URL');
    if (githubUrl && typeof githubUrl === 'string' && githubUrl.trim()) {
      const g = githubUrl.trim();
      if (!/^https?:\/\/(www\.)?github\.com\//i.test(g) && !/^github\.com\//i.test(g)) {
        return NextResponse.json(
          { error: 'GitHub URL must look like https://github.com/owner/repo.' },
          { status: 400 }
        );
      }
    }

    const data = await collectPostSource({ websiteUrl: websiteUrl.trim(), githubUrl: githubUrl?.trim() });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to collect website info.';
    const status = /required|valid|private|GitHub/i.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
