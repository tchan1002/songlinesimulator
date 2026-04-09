# Chicago Songline Simulator - Testing Guide

## Setup Instructions

### Prerequisites
1. Google Maps API key with the following APIs enabled:
   - Maps JavaScript API
   - Directions API

2. Update `index.html` line 72:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places"></script>
   ```
   Replace `YOUR_API_KEY_HERE` with your actual API key.

### Running the Application
1. Open `index.html` in a web browser
2. Or serve via a local web server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## Testing Phase 5: Quilt Pattern

### Test Case 1: Simple Route (Bus Only)
**Input:**
- Origin: `Willis Tower, Chicago, IL`
- Destination: `Navy Pier, Chicago, IL`

**Expected Result:**
- Small grid (4x4 or 6x6)
- Orange square checkerboard patterns (bus segments)
- Gray triangle patterns (walking segments)
- 1-2 patches total

### Test Case 2: Complex Multi-Modal Route
**Input:**
- Origin: `University of Chicago, Chicago, IL`
- Destination: `O'Hare International Airport, Chicago, IL`

**Expected Result:**
- Larger grid (8x8 to 10x10)
- Mix of patterns:
  - Concentric circles (Red Line, Green Line, etc.)
  - Orange checkerboard (buses)
  - Gray triangles (walking connections)
- Multiple patches with varied sizes
- Vibrant CTA line colors visible

### Test Case 3: Long Route (Large Pattern)
**Input:**
- Origin: `Millennium Park, Chicago, IL`
- Destination: `Midway International Airport, Chicago, IL`

**Expected Result:**
- Larger grid (10x10+)
- Some 2x2 patches (segments >20 min)
- Complex color combinations
- Full use of grid space

## Visual Verification Checklist

### Pattern Quality
- [ ] Grid is evenly spaced
- [ ] No overlapping patches
- [ ] Patterns are centered in patches
- [ ] Colors are vibrant and harmonious

### Mode-Specific Patterns
- [ ] **RAIL**: Concentric circles with CTA line colors
- [ ] **BUS**: Orange checkerboard squares
- [ ] **WALKING**: Gray radiating triangles
- [ ] **DRIVING**: Blue nested hexagons (rare in Chicago transit)

### Textile Details
- [ ] Dashed "stitching" borders around each patch
- [ ] Brown frame border around entire quilt
- [ ] Gold inner decorative line
- [ ] Background has subtle gradient

### Interactive Features
- [ ] Canvas renders clearly
- [ ] Download button appears below pattern
- [ ] Clicking download saves PNG file
- [ ] Filename format: `chicago-songline-quilt-[timestamp].png`

### Responsive Design
- [ ] Pattern scales on window resize
- [ ] Maintains square aspect ratio
- [ ] Works on mobile devices
- [ ] No visual artifacts or clipping

## Integration Testing

### End-to-End Flow
1. Enter origin and destination
2. Click "Generate Songline"
3. Verify all three sections render:
   - [ ] Map with colored route polylines
   - [ ] Sound Timeline with waveforms
   - [ ] Quilt Pattern with geometric designs
4. All sections should render simultaneously
5. No console errors

### Data Consistency
- [ ] Quilt colors match map polyline colors (for trains)
- [ ] Number of patches corresponds to route segments
- [ ] Pattern complexity reflects route length
- [ ] Same route produces identical pattern (deterministic)

## Common Issues & Solutions

### Issue: Quilt Not Rendering
**Possible Causes:**
1. Google Maps API not loaded properly
2. Route parsing failed
3. No segments in `window.routeSegments`

**Solution:**
- Check console for errors
- Verify API key is valid
- Try "Example Route" button

### Issue: Patterns Look Squashed
**Possible Causes:**
1. CSS container size issues
2. Canvas scaling incorrect

**Solution:**
- Check `#quilt-pattern` has minimum height (400px)
- Verify canvas max-width: 100%

### Issue: Colors Don't Match CTA Lines
**Possible Causes:**
1. Google Maps not returning line colors
2. Fallback colors being used

**Solution:**
- CTA_COLORS mapping handles this
- Check `getCTALineColor()` function
- Red Line should be #c60c30, Blue Line #00a1de, etc.

### Issue: Download Not Working
**Possible Causes:**
1. Browser security restrictions
2. Canvas.toBlob() not supported

**Solution:**
- Try modern browser (Chrome, Firefox, Safari, Edge)
- Check browser console for errors

## Performance Testing

### Metrics to Monitor
- [ ] Pattern generation time: <100ms
- [ ] Canvas render time: <50ms
- [ ] Download time: <500ms
- [ ] No memory leaks on multiple generations

### Load Testing
1. Generate 5-10 routes in succession
2. Verify each quilt renders correctly
3. Check browser memory usage stays stable
4. No degradation in performance

## Browser Compatibility

### Tested Browsers
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

### Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive layout works
- [ ] Touch interactions functional

## Accessibility

### Checks
- [ ] Placeholder text visible before generation
- [ ] Clear visual feedback during loading
- [ ] Download button has clear label
- [ ] Sufficient color contrast in UI elements

## Example Route Suggestions

### Variety of Patterns
1. **Simple**: `Chicago Union Station` → `Lincoln Park Zoo`
2. **Complex**: `Hyde Park` → `Wrigleyville`
3. **Long**: `South Loop` → `Evanston`
4. **Multi-line**: `Loop` → `O'Hare` (tests multiple train lines)
5. **Bus-heavy**: `Bronzeville` → `Pilsen`

## Success Criteria

Phase 5 is successful if:
1. Quilt pattern generates automatically after route
2. Pattern is visually appealing (looks like wall art)
3. Colors accurately represent transit modes
4. Geometric patterns are distinct per mode
5. Pattern is deterministic (same route = same quilt)
6. Download button works and saves PNG
7. No console errors or warnings
8. Responsive and works on mobile
9. Integrates seamlessly with map and timeline

## Reporting Issues

If you find bugs, please note:
- Browser and version
- Route tested (origin/destination)
- Expected vs actual behavior
- Console errors (if any)
- Screenshot of the issue

## Next Steps

After Phase 5 testing:
- Phase 3: Audio generation (if not yet implemented)
- Integration testing across all phases
- Performance optimization
- User experience polish
- Documentation completion
