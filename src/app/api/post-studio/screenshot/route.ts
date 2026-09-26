import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { scraperCache } from '@/lib/cache/scraperCache';
import { assertSafeHttpUrl } from '@/lib/post/postCollector';

chromium.use(stealthPlugin());

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

export async function GET(req: NextRequest) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    const url = req.nextUrl.searchParams.get('url') || '';
    const viewportKey = req.nextUrl.searchParams.get('viewport') === 'mobile' ? 'mobile' : 'desktop';
    const safeUrl = assertSafeHttpUrl(url, 'Screenshot URL');

    const cacheKey = scraperCache.generateKey('post-shot', { url: safeUrl, vp: viewportKey });
    const cached = scraperCache.get<string>(cacheKey);
    if (cached) {
      return new NextResponse(Buffer.from(cached, 'base64'), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=300' },
      });
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
    const vp = VIEWPORTS[viewportKey];
    const context = await browser.newContext({
      viewport: vp,
      deviceScaleFactor: 1,
      locale: 'en-US',
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(25000);
    try {
      await page.goto(safeUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1500);
      // Demo-style capture: full page so all features & sections show.
      const png = await page.screenshot({ fullPage: true, type: 'png' });
      scraperCache.set(cacheKey, Buffer.from(png).toString('base64'), 5 * 60 * 1000);
      return new NextResponse(Buffer.from(png), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=300' },
      });
    } finally {
      await page.close().catch(() => {});
      await context.close().catch(() => {});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Screenshot failed.';
    const status = /valid|private|local/i.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  } finally {
    await browser?.close().catch(() => {});
  }
}
