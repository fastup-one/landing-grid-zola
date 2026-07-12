import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Behavior gate. Each test is tagged with the audit finding ID it guards so
// scripts/coverage-matrix.mjs can prove the finding is covered.

test('smoke: page renders all tiles with the count', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(13);
  await expect(page.locator('#nav-counter')).toHaveText('13 apps');
});

test('smoke: stylesheet and JS actually load and apply (not an unstyled page)', async ({ page }) => {
  const failed: string[] = [];
  page.on('requestfailed', (r) => failed.push(r.url()));
  page.on('response', (r) => {
    if (r.url().match(/\.(css|js)$/) && !r.ok()) failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto('/');
  // The compiled Tailwind stylesheet must have applied: the body carries the
  // gradient background image. An unstyled page (blocked/404'd CSS) would be
  // 'none'. This is the guard for the "container serves an unstyled page" bug.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
  expect(bg).toContain('gradient');
  // And the external JS must have executed (it populated the counter).
  await expect(page.locator('#nav-counter')).toHaveText('13 apps');
  expect(failed, `assets failed to load: ${failed.join(', ')}`).toEqual([]);
});

test('@JS-01 number keys do not hijack typing in the search box', async ({ page }) => {
  await page.goto('/');
  const search = page.locator('#search-input');
  await search.click();
  await search.pressSequentially('1');
  // The digit lands in the field (old bug wiped it via a nav click) and we are
  // in search mode, not a category filter.
  await expect(search).toHaveValue('1');
  await expect(page.locator('#nav-counter')).toHaveText(/found/);
});

test('@JS-02 a filter click cancels a pending search (no stale race)', async ({ page }) => {
  await page.goto('/');
  await page.locator('#search-input').fill('xyz'); // fires debounced search
  await page.locator('.nav-item[data-filter="favorite"]').click(); // within debounce
  await page.waitForTimeout(400); // let any stale timer fire

  await expect(page.locator('#search-input')).toHaveValue('');
  await expect(page.locator('.nav-item.active')).toHaveAttribute('data-filter', 'favorite');
  await expect(page.locator('#nav-counter')).not.toHaveText(/found/);
  await expect(page.locator('.tile:not(.is-hidden)')).toHaveCount(4);
});

test('@JS-04 category filter matches whole tokens, not substrings', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-item[data-filter="search"]').click();
  // Only tiles tagged with the exact token "search" (Perplexity, Google).
  await expect(page.locator('.tile:not(.is-hidden)')).toHaveCount(2);
  // A tile tagged only "favorite" must be hidden under the "search" filter.
  await expect(page.locator('.tile[data-name="GitHub"]')).toHaveClass(/is-hidden/);
});

test('@JS-03 empty state reflects real visibility, not style-string parsing', async ({ page }) => {
  await page.goto('/');
  await page.locator('#search-input').fill('zzzznope');
  await page.waitForTimeout(350);
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('.tile:not(.is-hidden)')).toHaveCount(0);

  await page.locator('#search-input').fill('');
  await page.waitForTimeout(350);
  await expect(page.locator('#empty-state')).toBeHidden();
  await expect(page.locator('.tile:not(.is-hidden)')).toHaveCount(13);
});

test('@A11Y-01 each tile link is named by its app, not a single letter', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Google', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Perplexity', exact: true })).toBeVisible();
});

test('@HTML-01 history updates are base-aware, not a hardcoded root', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-item[data-filter="music"]').click();
  await expect(page).toHaveURL(/#music$/);
  await page.locator('.nav-item[data-filter="all"]').click();
  expect(new URL(page.url()).hash).toBe('');
  expect(new URL(page.url()).pathname).toBe('/');
});

test('@A11Y-05 no WCAG A/AA violations (incl. contrast) after JS runs', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(300); // let JS populate the counter and letters
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});
