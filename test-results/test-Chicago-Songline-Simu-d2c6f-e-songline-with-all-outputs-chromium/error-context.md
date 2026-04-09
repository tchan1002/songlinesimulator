# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test.spec.js >> Chicago Songline Simulator >> generates complete songline with all outputs
- Location: test.spec.js:64:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - heading "Chicago Songline Simulator ◆ ◆ ◆" [level=1] [ref=e6]
        - paragraph [ref=e7]: Inspired by Aboriginal Songlines
        - generic [ref=e8]:
          - generic [ref=e9]: Origin
          - textbox "Origin" [ref=e10]:
            - /placeholder: Enter starting address
            - text: University of Chicago, Chicago, IL
        - generic [ref=e11]:
          - generic [ref=e12]: Destination
          - textbox "Destination" [ref=e13]:
            - /placeholder: Enter destination address
            - text: O'Hare International Airport, Chicago, IL
        - generic [ref=e14]:
          - button "Generate" [ref=e15] [cursor=pointer]
          - button "Example" [ref=e16] [cursor=pointer]
      - generic [ref=e19]:
        - generic:
          - button "Keyboard shortcuts"
        - region "Map" [ref=e20]
        - generic [ref=e21]:
          - generic [ref=e22]:
            - generic:
              - generic:
                - generic [ref=e45]: A
                - generic [ref=e50]: B
            - generic [ref=e55]:
              - generic:
                - generic:
                  - 'img "Origin: 5801 S Ellis Ave, Chicago, IL 60637, USA" [ref=e57]':
                    - generic:
                      - 'generic "Origin: 5801 S Ellis Ave, Chicago, IL 60637, USA"'
                  - 'img "Destination: Chicago O''Hare International Airport (ORD), 10000 W O''Hare Ave, Chicago, IL 60666, USA" [ref=e58]':
                    - generic:
                      - 'generic "Destination: Chicago O''Hare International Airport (ORD), 10000 W O''Hare Ave, Chicago, IL 60666, USA"'
          - iframe [ref=e59]:
            
          - menubar [ref=e60] [cursor=pointer]:
            - menuitemradio "Show street map" [checked] [ref=e62]: Map
            - menuitemradio "Show satellite imagery" [ref=e64]: Satellite
          - button "Toggle fullscreen view" [ref=e65] [cursor=pointer]
          - link "Open this area in Google Maps (opens a new window)" [ref=e67]:
            - /url: https://maps.google.com/maps?ll=41.888992,-87.752635&z=2&t=m&hl=en-US&gl=US&mapclient=apiv3
            - img "Google" [ref=e69]
          - generic [ref=e70]:
            - button "Keyboard shortcuts" [ref=e76] [cursor=pointer]
            - generic [ref=e81]: Map data ©2026
            - link "Terms (opens in new tab)" [ref=e86] [cursor=pointer]:
              - /url: https://www.google.com/intl/en-US_US/help/terms_maps.html
              - text: Terms
    - generic [ref=e88]:
      - heading "Visualize Quilt" [level=2] [ref=e89]
      - generic [ref=e90]:
        - generic [ref=e91]: 🎨
        - paragraph [ref=e92]: Your unique textile pattern will appear here
  - heading "Song Line" [level=2] [ref=e95]
```

# Test source

```ts
  1   | // test.spec.js - Automated tests for Chicago Songline Simulator
  2   | const { test, expect } = require('@playwright/test');
  3   | 
  4   | test.describe('Chicago Songline Simulator', () => {
  5   | 
  6   |   test('loads the page successfully', async ({ page }) => {
  7   |     await page.goto('http://localhost:8000');
  8   | 
  9   |     // Check title
  10  |     await expect(page).toHaveTitle(/Chicago Songline Simulator/);
  11  | 
  12  |     // Check main elements are present
  13  |     await expect(page.locator('h1')).toContainText('Chicago Songline Simulator');
  14  |     await expect(page.locator('#origin')).toBeVisible();
  15  |     await expect(page.locator('#destination')).toBeVisible();
  16  |     await expect(page.locator('#generate-btn')).toBeVisible();
  17  |     await expect(page.locator('#example-btn')).toBeVisible();
  18  | 
  19  |     console.log('✓ Page loaded successfully');
  20  |   });
  21  | 
  22  |   test('Google Maps API key is working', async ({ page }) => {
  23  |     await page.goto('http://localhost:8000');
  24  | 
  25  |     // Wait for Google Maps to load
  26  |     await page.waitForTimeout(3000);
  27  | 
  28  |     // Check for API key errors
  29  |     const errorMessages = await page.evaluate(() => {
  30  |       const errors = [];
  31  |       // Check console for API errors
  32  |       return errors;
  33  |     });
  34  | 
  35  |     // Check if map placeholder is replaced or if there are error indicators
  36  |     const hasMapError = await page.locator('.gm-err-container').count();
  37  |     expect(hasMapError).toBe(0);
  38  | 
  39  |     console.log('✓ Google Maps API initialized successfully');
  40  |   });
  41  | 
  42  |   test('generates route with example button', async ({ page }) => {
  43  |     await page.goto('http://localhost:8000');
  44  | 
  45  |     // Wait for page to be ready
  46  |     await page.waitForLoadState('networkidle');
  47  |     await page.waitForTimeout(2000);
  48  | 
  49  |     // Click example route button
  50  |     await page.click('#example-btn');
  51  | 
  52  |     // Verify inputs are filled
  53  |     const origin = await page.locator('#origin').inputValue();
  54  |     const destination = await page.locator('#destination').inputValue();
  55  | 
  56  |     expect(origin).toContain('University of Chicago');
  57  |     expect(destination).toContain('O\'Hare');
  58  | 
  59  |     console.log('✓ Example route fields populated');
  60  |     console.log(`  Origin: ${origin}`);
  61  |     console.log(`  Destination: ${destination}`);
  62  |   });
  63  | 
  64  |   test('generates complete songline with all outputs', async ({ page }) => {
  65  |     await page.goto('http://localhost:8000');
  66  |     await page.waitForLoadState('networkidle');
  67  |     await page.waitForTimeout(2000);
  68  | 
  69  |     // Click example button and generate
  70  |     await page.click('#example-btn');
  71  |     await page.click('#generate-btn');
  72  | 
  73  |     console.log('⏳ Generating route...');
  74  | 
  75  |     // Wait for route to be generated (increased timeout for API call)
  76  |     await page.waitForTimeout(8000);
  77  | 
  78  |     // Check for error message
  79  |     const errorVisible = await page.locator('#error-message').isVisible();
  80  |     if (errorVisible) {
  81  |       const errorText = await page.locator('#error-message').textContent();
  82  |       console.log(`⚠️  Error occurred: ${errorText}`);
  83  |       throw new Error(`Route generation failed: ${errorText}`);
  84  |     }
  85  | 
  86  |     // 1. Check Map
  87  |     console.log('Checking map...');
  88  |     const mapHasMarkers = await page.evaluate(() => {
  89  |       return window.map !== undefined;
  90  |     });
> 91  |     expect(mapHasMarkers).toBe(true);
      |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  92  |     console.log('✓ Map rendered');
  93  | 
  94  |     // 2. Check Timeline Canvas
  95  |     console.log('Checking timeline...');
  96  |     const timelineCanvas = page.locator('#sound-timeline canvas');
  97  |     await expect(timelineCanvas).toBeVisible({ timeout: 10000 });
  98  |     console.log('✓ Timeline visualization rendered');
  99  | 
  100 |     // 3. Check Audio Controls
  101 |     console.log('Checking audio controls...');
  102 |     const playButton = page.locator('#play-btn');
  103 |     await expect(playButton).toBeVisible({ timeout: 5000 });
  104 |     console.log('✓ Audio controls present');
  105 | 
  106 |     // 4. Check Quilt Pattern
  107 |     console.log('Checking quilt pattern...');
  108 |     const quiltCanvas = page.locator('#quilt-pattern canvas');
  109 |     await expect(quiltCanvas).toBeVisible({ timeout: 5000 });
  110 |     console.log('✓ Quilt pattern rendered');
  111 | 
  112 |     // 5. Check route segments were parsed
  113 |     const segmentCount = await page.evaluate(() => {
  114 |       return window.routeSegments ? window.routeSegments.length : 0;
  115 |     });
  116 |     expect(segmentCount).toBeGreaterThan(0);
  117 |     console.log(`✓ Route parsed into ${segmentCount} segments`);
  118 | 
  119 |     console.log('\n🎉 All outputs generated successfully!');
  120 |   });
  121 | 
  122 |   test('audio controls work', async ({ page }) => {
  123 |     await page.goto('http://localhost:8000');
  124 |     await page.waitForLoadState('networkidle');
  125 |     await page.waitForTimeout(2000);
  126 | 
  127 |     // Generate route first
  128 |     await page.click('#example-btn');
  129 |     await page.click('#generate-btn');
  130 |     await page.waitForTimeout(8000);
  131 | 
  132 |     // Check audio controls exist
  133 |     const playBtn = page.locator('#play-btn');
  134 |     const pauseBtn = page.locator('#pause-btn');
  135 |     const stopBtn = page.locator('#stop-btn');
  136 | 
  137 |     await expect(playBtn).toBeVisible();
  138 |     await expect(pauseBtn).toBeVisible();
  139 |     await expect(stopBtn).toBeVisible();
  140 | 
  141 |     // Test play button
  142 |     await playBtn.click();
  143 |     await page.waitForTimeout(1000);
  144 | 
  145 |     // Check if audio context is running
  146 |     const isPlaying = await page.evaluate(() => {
  147 |       return window.audioContext && window.audioContext.state === 'running';
  148 |     });
  149 | 
  150 |     expect(isPlaying).toBe(true);
  151 |     console.log('✓ Audio playback started');
  152 | 
  153 |     // Stop audio
  154 |     await stopBtn.click();
  155 |     await page.waitForTimeout(500);
  156 | 
  157 |     console.log('✓ Audio controls working');
  158 |   });
  159 | 
  160 |   test('quilt download button works', async ({ page }) => {
  161 |     await page.goto('http://localhost:8000');
  162 |     await page.waitForLoadState('networkidle');
  163 |     await page.waitForTimeout(2000);
  164 | 
  165 |     // Generate route first
  166 |     await page.click('#example-btn');
  167 |     await page.click('#generate-btn');
  168 |     await page.waitForTimeout(8000);
  169 | 
  170 |     // Check download button exists
  171 |     const downloadBtn = page.locator('#download-quilt-btn');
  172 |     await expect(downloadBtn).toBeVisible();
  173 | 
  174 |     console.log('✓ Quilt download button present');
  175 |   });
  176 | 
  177 |   test('handles invalid addresses gracefully', async ({ page }) => {
  178 |     await page.goto('http://localhost:8000');
  179 |     await page.waitForLoadState('networkidle');
  180 | 
  181 |     // Enter invalid addresses
  182 |     await page.fill('#origin', 'Invalid Location XYZ123');
  183 |     await page.fill('#destination', 'Another Invalid Place ABC999');
  184 | 
  185 |     await page.click('#generate-btn');
  186 | 
  187 |     // Wait for error message
  188 |     await page.waitForTimeout(3000);
  189 | 
  190 |     const errorVisible = await page.locator('#error-message').isVisible();
  191 |     expect(errorVisible).toBe(true);
```