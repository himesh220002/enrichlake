import { NextRequest, NextResponse } from 'next/server';
import { generateLaunchPosts } from '@/lib/post/postGenerator';
import { POST_PLATFORMS, POST_TEMPLATES } from '@/lib/post/postTypes';
import type { CollectedSource, PostPlatform, PostTemplateId } from '@/lib/post/postTypes';

export const maxDuration = 60;

const VALID_PLATFORMS = new Set(POST_PLATFORMS.map((p) => p.value));
const VALID_TEMPLATES = new Set(POST_TEMPLATES.map((t) => t.value));

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, platforms, template, customPrompt, authorName, byok } = body as {
      source?: CollectedSource;
      platforms?: string[];
      template?: string;
      customPrompt?: string;
      authorName?: string;
      byok?: { provider?: string; model?: string; apiKey?: string };
    };

    if (!source?.site?.url || !source?.site?.title) {
      return NextResponse.json(
        { error: 'Collect website info first — source data is missing.' },
        { status: 400 }
      );
    }
    const cleanPlatforms = (Array.isArray(platforms) ? platforms : []).filter((p): p is PostPlatform =>
      VALID_PLATFORMS.has(p as PostPlatform)
    );
    if (cleanPlatforms.length === 0) {
      return NextResponse.json({ error: 'Select at least one platform.' }, { status: 400 });
    }
    if (!template || !VALID_TEMPLATES.has(template as PostTemplateId)) {
      return NextResponse.json({ error: 'Choose a post template.' }, { status: 400 });
    }

    const data = await generateLaunchPosts({
      source,
      platforms: cleanPlatforms,
      template: template as PostTemplateId,
      customPrompt: typeof customPrompt === 'string' ? customPrompt : '',
      authorName: typeof authorName === 'string' ? authorName : '',
      byok:
        byok?.apiKey && byok?.provider
          ? { provider: byok.provider, model: byok.model || 'default', apiKey: byok.apiKey }
          : undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate posts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
