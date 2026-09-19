import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, BrowserContext, Page } from 'playwright';

// Add stealth plugin
chromium.use(stealthPlugin());

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0',
];

let _browserRef: any = null;
let _browserAt = 0;
const BROWSER_TTL_MS = 90_000;

export async function launchStealthBrowser(): Promise<{
  browser: Browser;
  context: BrowserContext;
  page: Page;
}> {
  const now = Date.now();
  // Reuse browser within TTL to avoid heavy launch overhead; close stale one proactively
  if (_browserRef && (now - _browserAt) < BROWSER_TTL_MS) {
    try { if (_browserRef.isConnected && !_browserRef.isConnected()) { _browserRef = null; } } catch { _browserRef = null; }
  }
  const browser: Browser = _browserRef || await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  if (!_browserRef) { _browserRef = browser; _browserAt = now; browser.on('disconnected', () => { _browserRef = null; }); }

  const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  const context = await browser.newContext({
    userAgent: randomUserAgent,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: ['geolocation'],
    bypassCSP: true,
    ignoreHTTPSErrors: true,
  });

  // Inject additional anti-bot evasions
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    // @ts-ignore
    window.chrome = {
      runtime: {},
      loadTimes: function() {},
      csi: function() {},
      app: {},
    };
  });

  const page = await context.newPage();
  // Block heavy assets (images, fonts, media) for ~40% faster navigation; keep scripts/styles for DOM fidelity
  await page.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['image', 'media', 'font'].includes(type)) return route.abort();
    return route.continue();
  });
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(20000);

  return { browser, context, page };
}
