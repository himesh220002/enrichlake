import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { scraperCache } from '@/lib/cache/scraperCache';
import { assertSafeHttpUrl } from '@/lib/post/postCollector';

chromium.use(stealthPlugin());

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1.5, isMobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
} as const;

export async function GET(req: NextRequest) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    const url = req.nextUrl.searchParams.get('url') || '';
    const viewportKey = req.nextUrl.searchParams.get('viewport') === 'mobile' ? 'mobile' : 'desktop';
    const mode = req.nextUrl.searchParams.get('mode') === 'fullpage' ? 'fullpage' : 'viewport';
    const isDownload = req.nextUrl.searchParams.get('download') === '1';
    const refresh = req.nextUrl.searchParams.get('refresh') === '1' || req.nextUrl.searchParams.get('nocache') === '1';
    const rawDelay = parseInt(req.nextUrl.searchParams.get('delay') || '2000', 10);
    const delayMs = Math.min(Math.max(isNaN(rawDelay) ? 2000 : rawDelay, 500), 10000);

    const safeUrl = assertSafeHttpUrl(url, 'Screenshot URL');

    const cacheKey = scraperCache.generateKey('post-shot-v2', {
      url: safeUrl,
      vp: viewportKey,
      mode,
      delay: delayMs,
    });

    if (!refresh) {
      const cached = scraperCache.get<string>(cacheKey);
      if (cached) {
        const headers: Record<string, string> = {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
        };
        if (isDownload) {
          headers['Content-Disposition'] = `attachment; filename="demo-${viewportKey}-${mode}.png"`;
        } else {
          headers['Content-Disposition'] = `inline; filename="demo-${viewportKey}-${mode}.png"`;
        }
        return new NextResponse(Buffer.from(cached, 'base64'), { headers });
      }
    }

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
      ],
    });

    const vpConfig = VIEWPORTS[viewportKey];
    const context = await browser.newContext({
      viewport: { width: vpConfig.width, height: vpConfig.height },
      deviceScaleFactor: vpConfig.deviceScaleFactor,
      isMobile: vpConfig.isMobile,
      hasTouch: 'hasTouch' in vpConfig ? vpConfig.hasTouch : false,
      locale: 'en-US',
      ignoreHTTPSErrors: true,
      userAgent:
        viewportKey === 'mobile'
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    page.setDefaultNavigationTimeout(30000);

    try {
      // 1. Initial navigation waiting for full page load
      try {
        await page.goto(safeUrl, { waitUntil: 'load', timeout: 25000 });
      } catch {
        // Fallback if 'load' event times out (e.g. streaming or lingering analytics)
        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 8000 });
        } catch {}
      }

      // 2. Allow dynamic scripts and network requests to settle
      try {
        await page.waitForLoadState('networkidle', { timeout: 6000 });
      } catch {
        // Safe to proceed if background polling or websockets are open
      }

      // 3. Ensure web fonts are fully rendered to avoid FOUT/FOIT
      try {
        await page.evaluate(async () => {
          if (document.fonts && document.fonts.ready) {
            await Promise.race([
              document.fonts.ready,
              new Promise((r) => setTimeout(r, 2500)),
            ]);
          }
        });
      } catch {}

      // 4. Scroll down and back up to trigger IntersectionObserver, lazy loading images and reveal animations
      try {
        await page.evaluate(async () => {
          const scrollHeight = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
          const maxScroll = Math.min(scrollHeight(), 6000);
          const step = 450;
          for (let y = 0; y < maxScroll; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 50));
          }
          // Scroll back to top
          window.scrollTo(0, 0);
        });
      } catch {}

      // 5. Wait for all visible DOM images to finish loading
      try {
        await page.evaluate(async () => {
          const imgs = Array.from(document.querySelectorAll('img'));
          await Promise.all(
            imgs.slice(0, 30).map((img) => {
              if (img.complete) return Promise.resolve();
              return new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
                setTimeout(resolve, 2000);
              });
            })
          );
        });
      } catch {}

      // 6. Dismiss or hide common cookie consent and popup banners that obscure demo views
      try {
        await page.evaluate(() => {
          const selectors = [
            '#onetrust-consent-sdk',
            '.cookie-banner',
            '#cookie-banner',
            '.cookie-consent',
            '#cookie-notice',
            '[aria-label*="cookie" i]',
            '[id*="cookie" i]',
            '[class*="cookieBanner" i]',
            '[class*="CookieConsent" i]',
          ];
          selectors.forEach((sel) => {
            document.querySelectorAll(sel).forEach((el) => {
              try {
                (el as HTMLElement).style.display = 'none';
              } catch {}
            });
          });
        });
      } catch {}

      // 7. Configurable settlement buffer for smooth transitions / hydration
      await page.waitForTimeout(delayMs);

      // 8. Capture screenshot
      const isFullPage = mode === 'fullpage';
      const png = await page.screenshot({
        fullPage: isFullPage,
        type: 'png',
      });

      scraperCache.set(cacheKey, Buffer.from(png).toString('base64'), 10 * 60 * 1000);

      const headers: Record<string, string> = {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300',
      };
      if (isDownload) {
        headers['Content-Disposition'] = `attachment; filename="demo-${viewportKey}-${mode}.png"`;
      } else {
        headers['Content-Disposition'] = `inline; filename="demo-${viewportKey}-${mode}.png"`;
      }

      return new NextResponse(Buffer.from(png), { headers });
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
