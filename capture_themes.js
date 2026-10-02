import { chromium } from 'playwright';
import path from 'path';

const artifactDir = 'C:\\Users\\K S Indra Kumar\\.gemini\\antigravity-ide\\brain\\5b7e7fd8-9aae-4cc4-ac74-4b70c81b2878';

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Dark Moonlight: Home Hero & Header
  await page.screenshot({ path: path.join(artifactDir, 'moonlight_home_hero.png'), fullPage: false });
  console.log('Saved moonlight_home_hero.png');

  // 2. Dark Moonlight: Interactive Customizer Studio
  const customizer = page.locator('#customizer-section');
  await customizer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'moonlight_customizer_studio.png'), fullPage: false });
  console.log('Saved moonlight_customizer_studio.png');

  // 3. Dark Moonlight: Collections Page (Pic 2 reference)
  await page.click('[data-view="shop"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'moonlight_collections_page.png'), fullPage: false });
  console.log('Saved moonlight_collections_page.png');

  // 4. Toggle to Light Theme (Light Gold Creamy)
  await page.click('#theme-toggle-btn');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'light_gold_creamy_collections.png'), fullPage: false });
  console.log('Saved light_gold_creamy_collections.png');

  // 5. Light Gold Creamy: Interactive Customizer Studio
  const customizerLight = page.locator('#customizer-section');
  await customizerLight.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'light_gold_creamy_customizer.png'), fullPage: false });
  console.log('Saved light_gold_creamy_customizer.png');

  // 6. Light Gold Creamy: Home Page
  await page.click('[data-view="home"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'light_gold_creamy_home.png'), fullPage: false });
  console.log('Saved light_gold_creamy_home.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
