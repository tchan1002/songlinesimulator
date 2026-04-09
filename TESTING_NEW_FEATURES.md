# Testing New Features Checklist

## Setup
- [ ] Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari)
- [ ] **Put on headphones** (essential for testing directional audio)
- [ ] Ensure audio is enabled

---

## Test 1: Slower Audio with Speed Control

### Steps:
1. Generate a route (click "Example" button for quick test)
2. Click Play
3. Observe that audio plays at a comfortable, followable pace (not rushed)
4. Look for the speed slider above the play button

### Expected Results:
- [ ] Audio plays slower than before (3x longer base durations)
- [ ] There are noticeable gaps between segments (breathing room)
- [ ] Speed slider is visible with "1.0x" displayed
- [ ] Slider range is 0.25x to 4x

### Test Speed Control:
- [ ] Slide to 0.5x - audio plays slower, easier to study
- [ ] Slide to 2x - audio plays faster
- [ ] Slide to 4x - quick overview
- [ ] Changing speed during playback restarts at current position

---

## Test 2: Directional Audio Cues

### Visual Indicators:
- [ ] Timeline segments show direction arrows (↑ ↗ → ↘ ↓ ↙ ← ↖)
- [ ] Cardinal directions appear below segments (North, East, SW, etc.)
- [ ] Console log shows bearing calculations (open DevTools to verify)

### Audio Panning (East/West):
Generate a route with clear east-west movement:
- Origin: `University of Chicago, Chicago, IL`
- Destination: `O'Hare International Airport, Chicago, IL`

**Listen with headphones:**
- [ ] Segments heading **EAST** sound louder in **RIGHT ear**
- [ ] Segments heading **WEST** sound louder in **LEFT ear**
- [ ] Segments heading NORTH/SOUTH sound centered

### Pitch Modulation (North/South):
Listen for pitch changes:
- [ ] Segments heading **NORTH** have **higher pitch** (brighter sound)
- [ ] Segments heading **SOUTH** have **lower pitch** (deeper sound)
- [ ] Pitch difference is subtle but noticeable (~10%)

### Test Different Routes:
Try routes with varied directions:
- North: `Loop, Chicago` → `Rogers Park, Chicago`
- South: `Loop, Chicago` → `Hyde Park, Chicago`  
- East: `West Loop, Chicago` → `Navy Pier, Chicago`
- West: `Loop, Chicago` → `Oak Park, IL`

---

## Test 3: Songline Quilt Pattern (Authentic Style)

### Overall Impression:
- [ ] **CLEAR JOURNEY PATH** visible from start to end
- [ ] Flowing dotted/dashed lines connecting waypoints
- [ ] Concentric circles at stops (Aboriginal style)
- [ ] Organized dots along the path
- [ ] Looks like traditional Aboriginal songline art
- [ ] **NOT** chaotic or randomly scattered

### Background:
- [ ] **Warm earth tone gradient** (beige to tan)
- [ ] **Subtle texture** (300 small dots at 3% opacity)
- [ ] Clean and simple, not overly busy
- [ ] Lets the journey path stand out

### Journey Path (Main Element):
- [ ] **Clear flowing line** from start to end
- [ ] **Thick base line** (gray, low opacity, 12px)
- [ ] **Colored dotted line on top** (8px, with gaps)
- [ ] Path follows journey chronologically
- [ ] Organic curves (not straight, not chaotic)
- [ ] Can **trace the route** visually

### Path Dots (Organized):
- [ ] **Dots follow the journey line**
- [ ] 20-50+ dots per segment (more stops = more dots)
- [ ] **NOT randomly scattered** - organized along path
- [ ] Slight variation for organic feel
- [ ] Size: 2-4px
- [ ] Match segment colors

### Concentric Circles at Stops:
- [ ] **Start point**: Large circles (5 rings, 30px) labeled "START"
- [ ] **End point**: Large circles (5 rings, 30px) labeled "END"
- [ ] **Waypoints**: Medium circles (3-6 rings based on stops)
- [ ] More stops = more rings and larger radius
- [ ] Traditional Aboriginal songline marker style
- [ ] Center has filled dot with white highlight

### Color Coding:
- [ ] **Bus** segments = orange lines and dots
- [ ] **Train** segments = CTA line colors (red, blue, brown, etc.)
- [ ] **Walking** segments = gray lines and dots
- [ ] Colors consistent throughout journey
- [ ] Easy to identify different transit modes

### Directional Arrows:
- [ ] **Arrow symbols** (↑→↓←) visible along path
- [ ] Positioned between waypoints
- [ ] White background circles
- [ ] Colored borders matching segment
- [ ] Clear indication of direction

### Path Structure:
- [ ] Journey flows from **top-left area** generally
- [ ] Path **stays within canvas** bounds
- [ ] **Organic curves** (not straight lines)
- [ ] Length of path segments relates to duration
- [ ] Can follow journey start → middle → end

### Border:
- [ ] **Brown frame** (~20px wide)
- [ ] **Decorative dots** in border (80 gold dots)
- [ ] **Dashed inner line** for decoration
- [ ] Simple and traditional
- [ ] Frames the journey nicely

### Composition:
- [ ] **Journey flows through canvas**
- [ ] Clear start and end points
- [ ] Path is readable
- [ ] Artistic but structured
- [ ] Could hang as artwork
- [ ] Looks like authentic Aboriginal songline

### Download:
- [ ] "Download Pattern" button appears below quilt
- [ ] Clicking downloads a PNG file
- [ ] Filename includes timestamp
- [ ] Downloaded image looks like abstract textile art

---

## Test 4: Integration Test

### Complete User Flow:
1. [ ] Enter origin and destination
2. [ ] Click Generate
3. [ ] Map displays route with colored polylines
4. [ ] Timeline appears with segments, arrows, and directions
5. [ ] Quilt appears as flowing songline map
6. [ ] Click Play - audio starts
7. [ ] Adjust speed slider - audio adjusts
8. [ ] Listen with headphones - hear directional panning and pitch
9. [ ] Visual playback indicator moves across timeline
10. [ ] Download quilt as PNG

---

## Test 5: Console Verification

Open browser DevTools (F12) and check console:
- [ ] "🧭 Bearing: XXX.X° (Direction) Arrow" messages appear for each segment
- [ ] No JavaScript errors
- [ ] Audio sequence shows updated durations (longer than before)

---

## Known Working Routes

### Short Route (Quick Test):
- Origin: `Chicago Union Station`
- Destination: `Millennium Park, Chicago`

### Long Route (Full Feature Test):
- Origin: `University of Chicago`
- Destination: `O'Hare Airport`
- This route typically has multiple modes, transfers, and directional changes

### Directional Test Routes:
- **North-South**: `Loop` ↔ `Rogers Park`
- **East-West**: `West Loop` ↔ `Navy Pier`
- **Diagonal**: `Hyde Park` → `Evanston, IL`

---

## Troubleshooting

### No Audio:
- Check browser allows audio playback
- Try clicking play twice (browser autoplay policy)
- Check system audio volume

### No Directional Panning:
- **Verify headphones are on**
- Test with a known east-west route
- Some browsers may not support StereoPannerNode (modern browsers only)

### Quilt Doesn't Look Right:
- Refresh page and regenerate
- Check canvas is rendering (white/beige background should appear)
- Open DevTools console for errors

### Speed Control Not Working:
- Slider should be visible above play controls
- Try stopping and replaying
- Check console for errors

---

## Expected Improvements Summary

| Feature | Before | After |
|---------|--------|-------|
| Audio Duration | Too fast, hard to follow | 3x slower, easier to navigate |
| Speed Control | None | 0.25x - 4x slider |
| Directional Audio | No directional info | Stereo pan + pitch modulation |
| Visual Direction | No arrows on timeline | Arrows + cardinal directions on timeline |
| Quilt Style | Rigid geometric grid | **Flowing songline paths with dots & circles** |
| Quilt Layout | Grid blocks | Journey path from start to end |
| Path Visibility | No clear path | **Clear dotted lines showing journey** |
| Stops Shown | Grid squares | **Concentric circles (Aboriginal style)** |
| Dots | Random or geometric | **Organized along path lines** |
| Direction in Quilt | None | Arrow symbols at waypoints |
| Aboriginal Art | Minimal geometric | **Authentic songline structure** |
| Information Encoding | Literal/explicit | **Clear journey with Aboriginal aesthetics** |

---

## Success Criteria

All features working correctly if:
- ✅ Audio plays at comfortable pace with adjustable speed
- ✅ Headphones reveal clear left/right panning for E/W directions
- ✅ Pitch changes noticeably for N/S directions
- ✅ Timeline shows direction arrows and labels
- ✅ Quilt shows **authentic songline structure** with:
  - **Clear flowing path** from start to end
  - **Dotted/dashed lines** showing journey
  - **Concentric circles at stops** (traditional markers)
  - **Organized dots along path** (NOT randomly scattered)
  - **Directional arrows** at waypoints
  - **Start/End labels** clearly visible
  - Colors match transit modes (orange=bus, CTA colors=train, gray=walk)
  - Organic flowing curves (not straight, not chaotic)
  - Clean earth-tone background
  - Simple traditional border
  - **Looks like authentic Aboriginal songline art**
  - **Can trace the journey** visually from A to B
