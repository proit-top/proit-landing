import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const routes = ['/', '/ai/', '/contacts/', '/support/', '/privacy/', '/terms/'];
for (const path of routes) {
  test(`page + SEO + links + a11y ${path}`, async ({ page, request }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://proit.top${path}`);
    expect((await page.title()).length).toBeGreaterThan(10);
    expect(await page.locator('meta[name=description]').getAttribute('content')).toBeTruthy();
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/[—–�]/);
    expect(body).not.toMatch(/99\.9|SLA гарант|24\/7/);
    const links = await page.locator('a[href]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('href')!))]);
    for (const href of links) {
      const url = new URL(href, page.url());
      if (url.origin !== new URL(page.url()).origin) continue;
      const res = await request.get(url.pathname);
      expect(res.status(), href).toBe(200);
      if (url.hash) expect(await res.text(), href).toContain(`id="${url.hash.slice(1)}"`);
    }
    const assets = await page.locator('img[src]').evaluateAll(els => els.map(e => e.getAttribute('src')!));
    assets.push('/favicon.svg', '/og.png');
    for (const src of assets) expect((await request.get(src)).status(), src).toBe(200);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}
for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of routes) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
    await page.goto('/');
    const cta = await page.locator('.hero .button').boundingBox();
    expect(cta!.y + cta!.height).toBeLessThan(700);
    fs.mkdirSync('reports', { recursive: true });
    await page.screenshot({ path: `reports/home-${width}.png`, fullPage: true, animations: 'disabled' });
    if (width < 768) {
      await page.locator('.mobile-menu summary').click();
      await expect(page.locator('.mobile-menu nav')).toBeVisible();
      await page.locator('.mobile-menu nav a').first().click();
      await expect(page.locator('.mobile-menu')).not.toHaveAttribute('open');
    }
  });
}
test('fallback, focus trap, keyboard, reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('main');
  await expect(page.locator('[data-contact-form] button')).toBeDisabled();
  await expect(page.locator('[data-contact-form] [data-status]')).toContainText('Данные не будут отправлены');
  await page.locator('.chat-launcher').click();
  await expect(page.locator('dialog')).toBeVisible();
  await expect(page.locator('.chat-form button')).toBeDisabled();
  await expect(page.locator('[data-chat-status]')).toContainText('не подключён');
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  await expect(page.locator('.chat-launcher')).toBeFocused();
  expect(await page.locator('.hero-art img').evaluate(e => getComputedStyle(e).animationName)).toBe('none');
});
test('form validation + loading + confirmed success + HTTP and malformed errors', async ({ page }) => {
  await page.goto('/contacts/');
  // Fixture-only endpoints injected in the DOM. No real backend is contacted.
  await page.locator('[data-contact-form]').evaluate((e: HTMLFormElement) => { e.dataset.endpoint = '/test-contact'; e.querySelector('button')!.disabled = false; });
  let payload: any;
  let release: (() => void) | undefined;
  await page.route('**/test-contact', async route => {
    payload = route.request().postDataJSON();
    await new Promise<void>(resolve => { release = resolve; });
    await route.fulfill({ json: { ok: true } });
  });
  const submit = page.locator('[data-contact-form] button');
  await submit.click();
  expect(payload).toBeUndefined();
  await page.getByLabel('Ваше имя', { exact: true }).fill('Проверка');
  await page.getByLabel('Как с вами связаться').fill('test@example.invalid');
  await page.getByLabel('Что нужно решить').fill('Тестовое обращение, не отправлять');
  await page.locator('#consent').check();
  await submit.click();
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state', 'loading');
  await expect(submit).toBeDisabled();
  await expect.poll(() => !!release).toBe(true);
  release!();
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state', 'success');
  expect(payload.consent).toBe(true);
  await expect(page.locator('#name')).toHaveValue('');
  for (const mode of ['http', 'malformed', 'negative', 'network']) {
    await page.unroute('**/test-contact');
    await page.route('**/test-contact', route => mode === 'network' ? route.abort() : route.fulfill(mode === 'http' ? { status: 503 } : mode === 'malformed' ? { contentType:'text/html', body: '<html>not accepted</html>' } : { json:{ ok:false } }));
    await page.locator('#name').fill('Проверка');
    await page.locator('#contact-field').fill('test@example.invalid');
    await page.locator('#task').fill('Данные должны сохраниться при ошибке');
    await page.locator('#consent').check();
    await submit.click();
    await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#task')).toHaveValue('Данные должны сохраниться при ошибке');
    await expect(submit).toBeEnabled();
  }
});
test('chat loading, success, safe text rendering, context and retry', async ({ page }) => {
  await page.goto('/');
  await page.locator('.chat-launcher').click();
  await page.locator('dialog').evaluate((e: HTMLDialogElement) => { e.dataset.endpoint = '/test-chat'; e.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled = false; });
  let release: (() => void) | undefined;
  await page.route('**/test-chat', async route => {
    await new Promise<void>(resolve => { release = resolve; });
    await route.fulfill({ json: { ok: true, reply: '<img src=x onerror=alert(1)>', conversationId: 'fixture-id' } });
  });
  await page.locator('#chat-message').fill('Тестовое сообщение');
  await page.locator('[name=chat-consent]').check();
  await page.locator('.chat-form button').click();
  await expect(page.locator('dialog')).toHaveAttribute('data-state', 'loading');
  await expect.poll(() => !!release).toBe(true); release!();
  await expect(page.locator('dialog')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('.chat-history img')).toHaveCount(0);
  await expect(page.locator('.message')).toHaveCount(2);
  await page.unroute('**/test-chat');
  let payload: any;
  await page.route('**/test-chat', route => { payload = route.request().postDataJSON(); return route.fulfill({ status:503 }); });
  await page.locator('#chat-message').fill('Повторное сообщение');
  await page.locator('.chat-form button').click();
  await expect(page.locator('dialog')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#chat-message')).toHaveValue('Повторное сообщение');
  expect(payload.conversationId).toBe('fixture-id');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test('404, sitemap, robots and no-index drafts', async ({ page, request }) => {
  const response = await page.goto('/missing-page-for-test/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('ничего нет');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('https://proit.top/sitemap-index.xml');
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, follow');
  }
});
test('request timeout is an error, never false success', async ({ page }) => {
  await page.goto('/contacts/');
  await page.clock.install();
  await page.locator('[data-contact-form]').evaluate((e: HTMLFormElement) => { e.dataset.endpoint = '/test-timeout'; e.querySelector('button')!.disabled = false; });
  await page.route('**/test-timeout', () => {});
  await page.locator('#name').fill('Проверка');
  await page.locator('#contact-field').fill('test@example.invalid');
  await page.locator('#task').fill('Проверка таймаута запроса');
  await page.locator('#consent').check();
  await page.locator('[data-contact-form] button').click();
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state', 'loading');
  await page.clock.fastForward(16000);
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('[data-status]')).toContainText('не ответил вовремя');
  await expect(page.locator('#task')).toHaveValue('Проверка таймаута запроса');
});
test('static page usable without JavaScript or WebGL', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.hero-art img')).toBeVisible();
  await page.locator('.mobile-menu summary').click();
  await expect(page.locator('.mobile-menu nav')).toBeVisible();
  await page.locator('.mobile-menu summary').click();
  await page.locator('.service summary').nth(1).click();
  await expect(page.locator('.service').nth(1)).toHaveAttribute('open');
  await context.close();
});
