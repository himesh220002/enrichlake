import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function generateFallbackSvg(text = 'Media Preview'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
    <rect width="600" height="400" fill="url(#paint0_linear)"/>
    <circle cx="300" cy="180" r="48" fill="#3B82F6" fill-opacity="0.15" stroke="#60A5FA" stroke-width="2"/>
    <path d="M288 168L312 180L288 192V168Z" fill="#93C5FD"/>
    <text x="300" y="260" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle" letter-spacing="0.05em">${text}</text>
    <text x="300" y="285" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="middle">Enricher Intelligence Verified</text>
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="600" y2="400" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0F172A"/>
        <stop offset="1" stop-color="#1E293B"/>
      </linearGradient>
    </defs>
  </svg>`;
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam) {
    return new NextResponse(generateFallbackSvg('No URL Provided'), {
      status: 400,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(urlParam);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    return new NextResponse(generateFallbackSvg('Invalid URL'), {
      status: 400,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }

  try {
    const isMetaCdn =
      targetUrl.hostname.includes('fbcdn.net') ||
      targetUrl.hostname.includes('facebook.com') ||
      targetUrl.hostname.includes('fbsbx.com') ||
      targetUrl.hostname.includes('cdninstagram.com');

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
    };

    if (isMetaCdn) {
      headers['Referer'] = 'https://www.facebook.com/';
      headers['Origin'] = 'https://www.facebook.com';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const upstreamRes = await fetch(targetUrl.toString(), {
      headers,
      signal: controller.signal,
      cache: 'default',
    });

    clearTimeout(timeoutId);

    if (!upstreamRes.ok) {
      console.warn(`[image-proxy] Upstream returned status ${upstreamRes.status} for ${targetUrl.hostname}`);
      return new NextResponse(generateFallbackSvg('Media Unavailable'), {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await upstreamRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.warn(`[image-proxy] Fetch error for ${targetUrl.hostname}: ${error.message}`);
    return new NextResponse(generateFallbackSvg('Media Preview'), {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
