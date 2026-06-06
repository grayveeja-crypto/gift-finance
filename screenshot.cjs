const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(4000);

  // Spending tab — donut area
  await page.locator('nav button', { hasText: 'Spending' }).first().click();
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'ss_spending_donut.png' });
  console.log('spending donut done');

  // Plan tab — goals area
  await page.locator('nav button', { hasText: 'Plan' }).first().click();
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 920));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'ss_plan_goals2.png' });
  console.log('plan goals done');

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
