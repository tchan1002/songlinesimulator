// manual-test.js - Quick manual test with console output
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[Browser ${type}]:`, text);
  });

  // Capture errors
  page.on('pageerror', error => {
    console.error('[Browser Error]:', error);
  });

  console.log('\n🚀 Opening page...');
  await page.goto('http://localhost:8001');

  console.log('\n⏳ Waiting for page to load...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('\n🎯 Clicking example button...');
  await page.click('#example-btn');
  await page.waitForTimeout(500);

  console.log('\n🚀 Clicking generate button...');
  await page.click('#generate-btn');

  console.log('\n⏳ Waiting for route generation (15 seconds)...');
  await page.waitForTimeout(15000);

  console.log('\n📊 Checking window state...');
  const state = await page.evaluate(() => {
    return {
      hasMap: typeof map !== 'undefined',
      hasGoogleMaps: typeof google !== 'undefined',
      hasRouteSegments: typeof window.routeSegments !== 'undefined',
      segmentCount: window.routeSegments ? window.routeSegments.length : 0,
      hasTimeline: !!document.querySelector('#timeline-canvas'),
      hasQuilt: !!document.querySelector('#quilt-pattern canvas'),
      hasAudioControls: !!document.querySelector('#play-btn')
    };
  });

  console.log('\n✅ Final state:', JSON.stringify(state, null, 2));

  console.log('\n📸 Taking screenshot...');
  await page.screenshot({ path: 'test-result.png', fullPage: true });
  console.log('Screenshot saved as test-result.png');

  console.log('\n🔍 Press Ctrl+C to close browser');
  // Keep open for inspection
  await page.waitForTimeout(60000);

  await browser.close();
})();
