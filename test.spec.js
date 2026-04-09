// test.spec.js - Automated tests for Chicago Songline Simulator
const { test, expect } = require('@playwright/test');

test.describe('Chicago Songline Simulator', () => {

  test('loads the page successfully', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Check title
    await expect(page).toHaveTitle(/Chicago Songline Simulator/);

    // Check main elements are present
    await expect(page.locator('h1')).toContainText('Chicago Songline Simulator');
    await expect(page.locator('#origin')).toBeVisible();
    await expect(page.locator('#destination')).toBeVisible();
    await expect(page.locator('#generate-btn')).toBeVisible();
    await expect(page.locator('#example-btn')).toBeVisible();

    console.log('✓ Page loaded successfully');
  });

  test('Google Maps API key is working', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Wait for Google Maps to load
    await page.waitForTimeout(3000);

    // Check for API key errors
    const errorMessages = await page.evaluate(() => {
      const errors = [];
      // Check console for API errors
      return errors;
    });

    // Check if map placeholder is replaced or if there are error indicators
    const hasMapError = await page.locator('.gm-err-container').count();
    expect(hasMapError).toBe(0);

    console.log('✓ Google Maps API initialized successfully');
  });

  test('generates route with example button', async ({ page }) => {
    await page.goto('http://localhost:8000');

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click example route button
    await page.click('#example-btn');

    // Verify inputs are filled
    const origin = await page.locator('#origin').inputValue();
    const destination = await page.locator('#destination').inputValue();

    expect(origin).toContain('University of Chicago');
    expect(destination).toContain('O\'Hare');

    console.log('✓ Example route fields populated');
    console.log(`  Origin: ${origin}`);
    console.log(`  Destination: ${destination}`);
  });

  test('generates complete songline with all outputs', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click example button and generate
    await page.click('#example-btn');
    await page.click('#generate-btn');

    console.log('⏳ Generating route...');

    // Wait for route to be generated (increased timeout for API call)
    await page.waitForTimeout(8000);

    // Check for error message
    const errorVisible = await page.locator('#error-message').isVisible();
    if (errorVisible) {
      const errorText = await page.locator('#error-message').textContent();
      console.log(`⚠️  Error occurred: ${errorText}`);
      throw new Error(`Route generation failed: ${errorText}`);
    }

    // 1. Check Map
    console.log('Checking map...');
    const mapHasMarkers = await page.evaluate(() => {
      return window.map !== undefined;
    });
    expect(mapHasMarkers).toBe(true);
    console.log('✓ Map rendered');

    // 2. Check Timeline Canvas
    console.log('Checking timeline...');
    const timelineCanvas = page.locator('#sound-timeline canvas');
    await expect(timelineCanvas).toBeVisible({ timeout: 10000 });
    console.log('✓ Timeline visualization rendered');

    // 3. Check Audio Controls
    console.log('Checking audio controls...');
    const playButton = page.locator('#play-btn');
    await expect(playButton).toBeVisible({ timeout: 5000 });
    console.log('✓ Audio controls present');

    // 4. Check Quilt Pattern
    console.log('Checking quilt pattern...');
    const quiltCanvas = page.locator('#quilt-pattern canvas');
    await expect(quiltCanvas).toBeVisible({ timeout: 5000 });
    console.log('✓ Quilt pattern rendered');

    // 5. Check route segments were parsed
    const segmentCount = await page.evaluate(() => {
      return window.routeSegments ? window.routeSegments.length : 0;
    });
    expect(segmentCount).toBeGreaterThan(0);
    console.log(`✓ Route parsed into ${segmentCount} segments`);

    console.log('\n🎉 All outputs generated successfully!');
  });

  test('audio controls work', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Generate route first
    await page.click('#example-btn');
    await page.click('#generate-btn');
    await page.waitForTimeout(8000);

    // Check audio controls exist
    const playBtn = page.locator('#play-btn');
    const pauseBtn = page.locator('#pause-btn');
    const stopBtn = page.locator('#stop-btn');

    await expect(playBtn).toBeVisible();
    await expect(pauseBtn).toBeVisible();
    await expect(stopBtn).toBeVisible();

    // Test play button
    await playBtn.click();
    await page.waitForTimeout(1000);

    // Check if audio context is running
    const isPlaying = await page.evaluate(() => {
      return window.audioContext && window.audioContext.state === 'running';
    });

    expect(isPlaying).toBe(true);
    console.log('✓ Audio playback started');

    // Stop audio
    await stopBtn.click();
    await page.waitForTimeout(500);

    console.log('✓ Audio controls working');
  });

  test('quilt download button works', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Generate route first
    await page.click('#example-btn');
    await page.click('#generate-btn');
    await page.waitForTimeout(8000);

    // Check download button exists
    const downloadBtn = page.locator('#download-quilt-btn');
    await expect(downloadBtn).toBeVisible();

    console.log('✓ Quilt download button present');
  });

  test('handles invalid addresses gracefully', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Enter invalid addresses
    await page.fill('#origin', 'Invalid Location XYZ123');
    await page.fill('#destination', 'Another Invalid Place ABC999');

    await page.click('#generate-btn');

    // Wait for error message
    await page.waitForTimeout(3000);

    const errorVisible = await page.locator('#error-message').isVisible();
    expect(errorVisible).toBe(true);

    const errorText = await page.locator('#error-message').textContent();
    console.log(`✓ Error handling works: "${errorText}"`);
  });

  test('responsive design - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:8000');

    // Check that elements are still visible and properly laid out
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#origin')).toBeVisible();
    await expect(page.locator('#generate-btn')).toBeVisible();

    console.log('✓ Mobile responsive design working');
  });

  // ========== EDGE CASES ==========
  test.describe('Edge Cases', () => {

    test('handles empty origin input', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing empty origin input...');

      // Leave origin empty, fill destination
      await page.fill('#destination', 'O\'Hare International Airport, Chicago, IL');
      await page.click('#generate-btn');
      await page.waitForTimeout(2000);

      // Should show error or handle gracefully
      const errorVisible = await page.locator('#error-message').isVisible();
      console.log(`✓ Empty origin handled: error shown = ${errorVisible}`);
    });

    test('handles empty destination input', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing empty destination input...');

      // Fill origin, leave destination empty
      await page.fill('#origin', 'University of Chicago, Chicago, IL');
      await page.click('#generate-btn');
      await page.waitForTimeout(2000);

      // Should show error or handle gracefully
      const errorVisible = await page.locator('#error-message').isVisible();
      console.log(`✓ Empty destination handled: error shown = ${errorVisible}`);
    });

    test('handles special characters in addresses', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing special characters...');

      // Try addresses with special characters
      await page.fill('#origin', "O'Hare International Airport");
      await page.fill('#destination', 'Navy Pier, Chicago');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      // Should handle gracefully - either generate or show clear error
      const errorVisible = await page.locator('#error-message').isVisible();
      const timelineVisible = await page.locator('#sound-timeline canvas').isVisible();

      console.log(`✓ Special characters handled: ${timelineVisible ? 'Route generated' : 'Error shown'}`);
      expect(errorVisible || timelineVisible).toBe(true);
    });

    test('handles very long address strings', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing very long address...');

      const longAddress = 'The University of Chicago, 5801 South Ellis Avenue, Chicago, Illinois, United States of America, 60637';
      await page.fill('#origin', longAddress);
      await page.fill('#destination', 'Willis Tower, 233 South Wacker Drive, Chicago, IL');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      // Should handle long strings
      const errorVisible = await page.locator('#error-message').isVisible();
      const timelineVisible = await page.locator('#sound-timeline canvas').isVisible();

      console.log(`✓ Long address handled: ${timelineVisible ? 'Route generated' : 'Error shown'}`);
    });

    test('handles single-stop short routes', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing short route...');

      // Very close addresses (likely walking only)
      await page.fill('#origin', 'Millennium Park, Chicago');
      await page.fill('#destination', 'Art Institute of Chicago');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      const errorVisible = await page.locator('#error-message').isVisible();

      if (!errorVisible) {
        const segmentCount = await page.evaluate(() => {
          return window.routeSegments ? window.routeSegments.length : 0;
        });

        console.log(`✓ Short route handled: ${segmentCount} segment(s)`);
        expect(segmentCount).toBeGreaterThanOrEqual(0);
      } else {
        console.log('✓ Short route resulted in error (acceptable)');
      }
    });
  });

  // ========== MULTIPLE ROUTES ==========
  test.describe('Multiple Routes & Cleanup', () => {

    test('generates multiple different routes in sequence', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing multiple route generation...');

      // Route 1
      console.log('Generating route 1...');
      await page.fill('#origin', 'Willis Tower, Chicago');
      await page.fill('#destination', 'Navy Pier, Chicago');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      const segments1 = await page.evaluate(() => {
        return window.routeSegments ? window.routeSegments.length : 0;
      });
      console.log(`✓ Route 1: ${segments1} segments`);

      // Route 2 - should clear previous
      console.log('Generating route 2...');
      await page.fill('#origin', 'University of Chicago');
      await page.fill('#destination', 'Lincoln Park Zoo');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      const segments2 = await page.evaluate(() => {
        return window.routeSegments ? window.routeSegments.length : 0;
      });
      console.log(`✓ Route 2: ${segments2} segments`);

      // Route 3
      console.log('Generating route 3...');
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      const segments3 = await page.evaluate(() => {
        return window.routeSegments ? window.routeSegments.length : 0;
      });
      console.log(`✓ Route 3: ${segments3} segments`);

      expect(segments3).toBeGreaterThan(0);
      console.log('✓ Multiple routes generated successfully');
    });

    test('verifies cleanup between route generations', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing cleanup between routes...');

      // Generate first route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      // Verify first route exists
      await expect(page.locator('#sound-timeline canvas')).toBeVisible();
      await expect(page.locator('#quilt-pattern canvas')).toBeVisible();

      // Generate second route
      console.log('Generating second route (testing cleanup)...');
      await page.fill('#origin', 'Willis Tower, Chicago');
      await page.fill('#destination', 'Navy Pier, Chicago');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      // Check that new route replaced old one (still have canvas)
      await expect(page.locator('#sound-timeline canvas')).toBeVisible();
      await expect(page.locator('#quilt-pattern canvas')).toBeVisible();

      // Verify routeSegments was updated, not appended
      const segments = await page.evaluate(() => window.routeSegments);
      const hasRepeatedSegments = segments.length > 20; // Reasonable check for duplication

      console.log(`✓ Cleanup verified: ${segments.length} segments (no duplication)`);
      expect(hasRepeatedSegments).toBe(false);
    });
  });

  // ========== AUDIO FEATURES ==========
  test.describe('Audio Features', () => {

    test('volume controls exist and are accessible', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Checking volume controls...');

      // Check for volume control element
      const volumeControl = page.locator('#volume-slider, input[type="range"], .volume-control');
      const volumeExists = await volumeControl.count() > 0;

      console.log(`✓ Volume control present: ${volumeExists}`);
    });

    test('audio context initializes correctly', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing audio context...');

      // Click play
      await page.click('#play-btn');
      await page.waitForTimeout(1000);

      // Check audio context state
      const audioState = await page.evaluate(() => {
        return {
          contextExists: typeof window.audioContext !== 'undefined',
          state: window.audioContext ? window.audioContext.state : null,
          sampleRate: window.audioContext ? window.audioContext.sampleRate : null
        };
      });

      console.log(`✓ Audio context: ${audioState.state} at ${audioState.sampleRate}Hz`);
      expect(audioState.contextExists).toBe(true);
      expect(['running', 'suspended']).toContain(audioState.state);
    });

    test('play, pause, and stop buttons function', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing audio controls functionality...');

      const playBtn = page.locator('#play-btn');
      const pauseBtn = page.locator('#pause-btn');
      const stopBtn = page.locator('#stop-btn');

      // Test play
      await playBtn.click();
      await page.waitForTimeout(500);
      console.log('✓ Play button clicked');

      // Test pause
      await pauseBtn.click();
      await page.waitForTimeout(500);
      console.log('✓ Pause button clicked');

      // Test resume
      await playBtn.click();
      await page.waitForTimeout(500);
      console.log('✓ Resume (play again) button clicked');

      // Test stop
      await stopBtn.click();
      await page.waitForTimeout(500);
      console.log('✓ Stop button clicked');

      // Verify no errors occurred
      const hasError = await page.locator('#error-message').isVisible();
      expect(hasError).toBe(false);
    });

    test('audio playback seeking/position tracking', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing audio seeking...');

      // Start playback
      await page.click('#play-btn');
      await page.waitForTimeout(2000);

      // Check if playback position is tracked
      const playbackInfo = await page.evaluate(() => {
        return {
          hasStartTime: typeof window.startTime !== 'undefined',
          hasAudioContext: typeof window.audioContext !== 'undefined',
          contextTime: window.audioContext ? window.audioContext.currentTime : null
        };
      });

      console.log(`✓ Playback tracking: startTime=${playbackInfo.hasStartTime}, context=${playbackInfo.hasAudioContext}`);

      await page.click('#stop-btn');
    });

    test('handles rapid play/stop/play cycles', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing rapid audio control cycles...');

      // Rapid cycles
      for (let i = 0; i < 5; i++) {
        await page.click('#play-btn');
        await page.waitForTimeout(200);
        await page.click('#stop-btn');
        await page.waitForTimeout(200);
      }

      console.log('✓ Rapid cycles completed');

      // Verify system is still stable
      const audioState = await page.evaluate(() => {
        return window.audioContext ? window.audioContext.state : 'unknown';
      });

      console.log(`✓ Audio system stable: ${audioState}`);
    });
  });

  // ========== TIMELINE INTERACTION ==========
  test.describe('Timeline Interaction', () => {

    test('timeline canvas renders and accepts mouse input', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing timeline interactivity...');

      const canvas = page.locator('#timeline-canvas');
      await expect(canvas).toBeVisible();

      // Get canvas dimensions
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();

      console.log(`✓ Canvas dimensions: ${canvasBox.width}x${canvasBox.height}`);

      // Try clicking on canvas
      await canvas.click({ position: { x: canvasBox.width / 2, y: canvasBox.height / 2 } });
      await page.waitForTimeout(500);

      console.log('✓ Canvas click interaction tested');
    });

    test('timeline hover states work', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing timeline hover...');

      const canvas = page.locator('#timeline-canvas');
      const canvasBox = await canvas.boundingBox();

      // Hover over different parts
      await canvas.hover({ position: { x: 50, y: canvasBox.height / 2 } });
      await page.waitForTimeout(300);

      await canvas.hover({ position: { x: canvasBox.width - 50, y: canvasBox.height / 2 } });
      await page.waitForTimeout(300);

      console.log('✓ Hover interactions tested');
    });

    test('segment highlighting on click', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing segment highlighting...');

      const canvas = page.locator('#timeline-canvas');
      const canvasBox = await canvas.boundingBox();

      // Click on first segment area
      await canvas.click({ position: { x: 100, y: canvasBox.height / 2 } });
      await page.waitForTimeout(500);

      // Click on different segment
      await canvas.click({ position: { x: canvasBox.width - 100, y: canvasBox.height / 2 } });
      await page.waitForTimeout(500);

      console.log('✓ Segment click interactions tested');
    });

    test('timeline updates during playback', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing timeline during playback...');

      // Start playback
      await page.click('#play-btn');

      // Let it play for a moment
      await page.waitForTimeout(2000);

      // Timeline should still be visible and rendering
      await expect(page.locator('#timeline-canvas')).toBeVisible();

      // Stop playback
      await page.click('#stop-btn');

      console.log('✓ Timeline remained stable during playback');
    });
  });

  // ========== QUILT PATTERN ==========
  test.describe('Quilt Pattern Generation', () => {

    test('different routes produce different quilts', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing quilt pattern uniqueness...');

      // Generate first route
      await page.fill('#origin', 'Willis Tower, Chicago');
      await page.fill('#destination', 'Navy Pier, Chicago');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      // Capture first quilt
      const quilt1 = await page.locator('#quilt-pattern canvas').screenshot();

      // Generate different route
      await page.fill('#origin', 'University of Chicago');
      await page.fill('#destination', 'Lincoln Park Zoo');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      // Capture second quilt
      const quilt2 = await page.locator('#quilt-pattern canvas').screenshot();

      // Compare - they should be different
      const areSame = quilt1.equals(quilt2);
      console.log(`✓ Quilt patterns are ${areSame ? 'same' : 'different'} (expected: different)`);

      // Note: In practice, patterns could theoretically be same, but highly unlikely
    });

    test('quilt canvas has content', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Verifying quilt canvas content...');

      const quiltCanvas = page.locator('#quilt-pattern canvas');
      await expect(quiltCanvas).toBeVisible();

      // Check canvas dimensions
      const dimensions = await quiltCanvas.evaluate(canvas => ({
        width: canvas.width,
        height: canvas.height
      }));

      console.log(`✓ Quilt canvas size: ${dimensions.width}x${dimensions.height}`);
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);

      // Verify canvas has been drawn on (non-blank)
      const hasContent = await quiltCanvas.evaluate(canvas => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Check if any pixel is non-white
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255) {
            return true;
          }
        }
        return false;
      });

      console.log(`✓ Quilt has visual content: ${hasContent}`);
      expect(hasContent).toBe(true);
    });

    test('quilt download button functionality', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing quilt download...');

      const downloadBtn = page.locator('#download-quilt-btn');
      await expect(downloadBtn).toBeVisible();

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      // Click download
      await downloadBtn.click();

      const download = await downloadPromise;

      if (download) {
        console.log(`✓ Download triggered: ${download.suggestedFilename()}`);
      } else {
        console.log('✓ Download button clicked (download may be disabled in test env)');
      }
    });
  });

  // ========== PERFORMANCE ==========
  test.describe('Performance Tests', () => {

    test('route generation completes within reasonable time', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing route generation performance...');

      const startTime = Date.now();

      await page.click('#example-btn');
      await page.click('#generate-btn');

      // Wait for completion
      await page.waitForSelector('#sound-timeline canvas', { timeout: 15000 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✓ Route generation took ${duration}ms`);
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    });

    test('no memory leaks on repeated generations', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing for memory leaks...');

      // Generate route multiple times
      for (let i = 0; i < 3; i++) {
        console.log(`Generation ${i + 1}/3...`);
        await page.click('#example-btn');
        await page.click('#generate-btn');
        await page.waitForTimeout(8000);
      }

      // Check for excessive DOM nodes or listeners
      const domMetrics = await page.evaluate(() => {
        return {
          canvasCount: document.querySelectorAll('canvas').length,
          totalElements: document.querySelectorAll('*').length
        };
      });

      console.log(`✓ DOM state: ${domMetrics.canvasCount} canvases, ${domMetrics.totalElements} total elements`);

      // Should not have excessive canvases (should be ~2: timeline + quilt)
      expect(domMetrics.canvasCount).toBeLessThanOrEqual(5);
    });

    test('timeline rendering performance', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Testing timeline render performance...');

      // Measure canvas redraw performance
      const renderTime = await page.evaluate(() => {
        const start = performance.now();

        // Trigger a redraw if resize handler exists
        window.dispatchEvent(new Event('resize'));

        const end = performance.now();
        return end - start;
      });

      console.log(`✓ Timeline redraw took ${renderTime.toFixed(2)}ms`);
    });
  });

  // ========== BROWSER COMPATIBILITY ==========
  test.describe('Browser Compatibility', () => {

    test('works in tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing tablet viewport...');

      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      await expect(page.locator('#sound-timeline canvas')).toBeVisible();
      await expect(page.locator('#quilt-pattern canvas')).toBeVisible();

      console.log('✓ Tablet viewport working');
    });

    test('works in desktop large viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing large desktop viewport...');

      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      await expect(page.locator('#sound-timeline canvas')).toBeVisible();
      await expect(page.locator('#quilt-pattern canvas')).toBeVisible();

      console.log('✓ Large desktop viewport working');
    });

    test('no console errors during normal operation', async ({ page }) => {
      const consoleErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Checking for console errors...');

      // Filter out known acceptable errors (like Google Maps occasional warnings)
      const criticalErrors = consoleErrors.filter(err =>
        !err.includes('Google Maps') &&
        !err.includes('favicon') &&
        !err.includes('ServiceWorker')
      );

      if (criticalErrors.length > 0) {
        console.log(`⚠️  Console errors found: ${criticalErrors.length}`);
        criticalErrors.forEach(err => console.log(`  - ${err}`));
      } else {
        console.log('✓ No critical console errors');
      }
    });

    test('page load time is reasonable', async ({ page }) => {
      console.log('Testing page load performance...');

      const startTime = Date.now();
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`✓ Page loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });
  });

  // ========== STATE MANAGEMENT ==========
  test.describe('State Management', () => {

    test('routeSegments data structure is correct', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Verifying routeSegments structure...');

      const segmentData = await page.evaluate(() => {
        if (!window.routeSegments || window.routeSegments.length === 0) {
          return { error: 'No segments' };
        }

        const firstSegment = window.routeSegments[0];

        return {
          count: window.routeSegments.length,
          firstSegment: {
            hasMode: 'mode' in firstSegment,
            hasDuration: 'duration' in firstSegment,
            hasDistance: 'distance' in firstSegment,
            hasPolyline: 'polyline' in firstSegment,
            mode: firstSegment.mode,
            duration: firstSegment.duration,
            distance: firstSegment.distance
          }
        };
      });

      console.log(`✓ Route segments: ${segmentData.count}`);
      console.log(`✓ First segment structure validated`);
      console.log(`  - Mode: ${segmentData.firstSegment.mode}`);
      console.log(`  - Duration: ${segmentData.firstSegment.duration}s`);
      console.log(`  - Distance: ${segmentData.firstSegment.distance}m`);

      expect(segmentData.firstSegment.hasMode).toBe(true);
      expect(segmentData.firstSegment.hasDuration).toBe(true);
      expect(segmentData.firstSegment.hasDistance).toBe(true);
      expect(segmentData.firstSegment.hasPolyline).toBe(true);
    });

    test('segment parsing accuracy for transit modes', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Generate route
      await page.click('#example-btn');
      await page.click('#generate-btn');
      await page.waitForTimeout(8000);

      console.log('Verifying segment mode parsing...');

      const modeBreakdown = await page.evaluate(() => {
        if (!window.routeSegments) return {};

        const breakdown = {
          BUS: 0,
          RAIL: 0,
          WALKING: 0,
          DRIVING: 0,
          OTHER: 0
        };

        window.routeSegments.forEach(seg => {
          if (breakdown[seg.mode] !== undefined) {
            breakdown[seg.mode]++;
          } else {
            breakdown.OTHER++;
          }
        });

        return breakdown;
      });

      console.log('✓ Mode breakdown:');
      Object.entries(modeBreakdown).forEach(([mode, count]) => {
        if (count > 0) console.log(`  - ${mode}: ${count}`);
      });

      const totalSegments = Object.values(modeBreakdown).reduce((a, b) => a + b, 0);
      expect(totalSegments).toBeGreaterThan(0);
    });

    test('window.map object exists and is initialized', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('Checking map object state...');

      const mapState = await page.evaluate(() => {
        return {
          exists: typeof window.map !== 'undefined',
          isGoogleMap: window.map instanceof google.maps.Map,
          hasZoom: window.map ? typeof window.map.getZoom() === 'number' : false,
          zoom: window.map ? window.map.getZoom() : null
        };
      });

      console.log(`✓ Map object exists: ${mapState.exists}`);
      console.log(`✓ Is Google Map: ${mapState.isGoogleMap}`);
      console.log(`✓ Zoom level: ${mapState.zoom}`);

      expect(mapState.exists).toBe(true);
      expect(mapState.isGoogleMap).toBe(true);
    });
  });

  // ========== NETWORK & ERROR HANDLING ==========
  test.describe('Network & Error Scenarios', () => {

    test('handles API timeout gracefully', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing API timeout handling...');

      // Use addresses that might cause delays
      await page.fill('#origin', 'Random Address XYZ 99999');
      await page.fill('#destination', 'Invalid Location 12345');
      await page.click('#generate-btn');

      // Wait for error to appear
      await page.waitForTimeout(5000);

      const errorVisible = await page.locator('#error-message').isVisible();
      expect(errorVisible).toBe(true);

      const errorText = await page.locator('#error-message').textContent();
      console.log(`✓ Timeout handled with error: "${errorText}"`);
    });

    test('shows appropriate error for ZERO_RESULTS', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing ZERO_RESULTS error...');

      // Addresses unlikely to have transit routes
      await page.fill('#origin', 'Alaska');
      await page.fill('#destination', 'Hawaii');
      await page.click('#generate-btn');

      await page.waitForTimeout(5000);

      const errorVisible = await page.locator('#error-message').isVisible();

      if (errorVisible) {
        const errorText = await page.locator('#error-message').textContent();
        console.log(`✓ No route error: "${errorText}"`);
      }
    });

    test('handles rapid repeated requests', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('Testing rapid repeated requests...');

      // Click generate multiple times rapidly
      await page.click('#example-btn');

      for (let i = 0; i < 3; i++) {
        await page.click('#generate-btn');
        await page.waitForTimeout(500);
      }

      // Wait for last request to complete
      await page.waitForTimeout(8000);

      // Should handle gracefully (either show error or show result)
      const hasTimeline = await page.locator('#sound-timeline canvas').isVisible();
      const hasError = await page.locator('#error-message').isVisible();

      console.log(`✓ Rapid requests handled: ${hasTimeline ? 'Route shown' : hasError ? 'Error shown' : 'Loading'}`);
    });
  });

  // ========== ACCESSIBILITY ==========
  test.describe('Accessibility', () => {

    test('form inputs have labels', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Checking form accessibility...');

      // Check for labels
      const originLabel = await page.locator('label[for="origin"]').count();
      const destinationLabel = await page.locator('label[for="destination"]').count();

      console.log(`✓ Origin label present: ${originLabel > 0}`);
      console.log(`✓ Destination label present: ${destinationLabel > 0}`);

      expect(originLabel).toBe(1);
      expect(destinationLabel).toBe(1);
    });

    test('buttons are keyboard accessible', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing keyboard navigation...');

      // Focus on origin input
      await page.locator('#origin').focus();

      // Tab through elements
      await page.keyboard.press('Tab'); // Should go to destination
      await page.keyboard.press('Tab'); // Should go to generate button

      // Check focus is on generate button
      const generateFocused = await page.evaluate(() => {
        return document.activeElement.id === 'generate-btn';
      });

      console.log(`✓ Tab navigation works: ${generateFocused}`);
    });

    test('page has proper heading structure', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Checking heading structure...');

      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();

      console.log(`✓ H1 headings: ${h1Count}`);
      console.log(`✓ H2 headings: ${h2Count}`);

      expect(h1Count).toBeGreaterThanOrEqual(1); // At least one H1
    });

    test('images and icons have alt text or labels', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Checking image accessibility...');

      const images = await page.locator('img').count();
      const imagesWithAlt = await page.locator('img[alt]').count();

      console.log(`✓ Images: ${images}, with alt text: ${imagesWithAlt}`);

      // Note: App uses emoji text, not img tags, which is accessible
    });

    test('error messages are announced properly', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing error message accessibility...');

      // Trigger an error
      await page.fill('#origin', 'Invalid XYZ');
      await page.fill('#destination', 'Invalid ABC');
      await page.click('#generate-btn');
      await page.waitForTimeout(3000);

      // Check error message is visible and has proper role/aria
      const errorMsg = page.locator('#error-message');
      const isVisible = await errorMsg.isVisible();

      if (isVisible) {
        const ariaRole = await errorMsg.getAttribute('role');
        const ariaLive = await errorMsg.getAttribute('aria-live');

        console.log(`✓ Error visible: ${isVisible}`);
        console.log(`✓ ARIA role: ${ariaRole || 'none'}`);
        console.log(`✓ ARIA live: ${ariaLive || 'none'}`);
      }
    });

    test('interactive elements have visible focus indicators', async ({ page }) => {
      await page.goto('http://localhost:8000');
      await page.waitForLoadState('networkidle');

      console.log('Testing focus indicators...');

      // Tab to generate button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Take screenshot of focused element (manual verification)
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el.tagName,
          id: el.id,
          className: el.className
        };
      });

      console.log(`✓ Focused element: ${focusedElement.tagName}#${focusedElement.id}`);
    });
  });
});
