const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3500);

  // Spending tab
  await page.locator('nav button', { hasText: 'Spending' }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'ss_spending_mobile.png' });
  console.log('spending screenshot done');

  // Plan tab
  await page.locator('nav button', { hasText: 'Plan' }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'ss_plan_mobile.png' });
  console.log('plan screenshot done');

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
