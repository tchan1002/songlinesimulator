# Final Testing Checklist - Chicago Songline Simulator

## Pre-Testing Setup

- [ ] Google Maps API key is configured in `index.html` (line 72)
- [ ] Maps JavaScript API is enabled in Google Cloud Console
- [ ] Directions API is enabled in Google Cloud Console
- [ ] API key restrictions are properly set (if using)
- [ ] Testing in a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 1. Initial Load & API Key Detection

### Expected Behavior
- [ ] Page loads without errors
- [ ] Header displays properly with title and subtitle
- [ ] About section is visible with project description
- [ ] Input fields are ready for interaction
- [ ] Map placeholder shows appropriate message
- [ ] API key status indicator appears (green if valid, red if invalid)
- [ ] Output sections show placeholder content

### Browser Console
- [ ] No JavaScript errors on load
- [ ] "Google Maps initialized" message appears (if API key valid)
- [ ] Welcome message with keyboard shortcuts displays
- [ ] No 404 errors for resources

## 2. Basic Route Generation

### Test: Generate a Simple Route
**Steps:**
1. Enter origin: "Willis Tower, Chicago, IL"
2. Enter destination: "Navy Pier, Chicago, IL"
3. Click "Generate Songline"

**Expected Results:**
- [ ] Loading message appears with spinner
- [ ] Generate button becomes disabled during loading
- [ ] Loading message disappears after response
- [ ] Map displays route with colored polylines
- [ ] Start (A) and end (B) markers appear on map
- [ ] Timeline canvas renders with colored segments
- [ ] Audio controls appear (Play, Pause, Stop buttons)
- [ ] Quilt pattern generates and displays
- [ ] Download button appears below quilt
- [ ] No error messages appear

### Verification
- [ ] CTA train lines show correct colors (Red, Blue, Brown, etc.)
- [ ] Bus routes show in orange
- [ ] Walking segments show in gray
- [ ] Timeline segments match map route
- [ ] Total time display is accurate

## 3. Example Route Button

### Test: Use Example Route
**Steps:**
1. Click "Example Route" button

**Expected Results:**
- [ ] Origin field populates with "University of Chicago, Chicago, IL"
- [ ] Destination field populates with "O'Hare International Airport, Chicago, IL"
- [ ] No automatic generation (must click Generate)
- [ ] Previous error messages clear

### Generate Example
2. Click "Generate Songline"

**Expected Results:**
- [ ] Route generates successfully
- [ ] Complex multi-segment route appears
- [ ] Multiple transit modes shown (train, bus, walking)
- [ ] All three outputs render correctly

## 4. Audio Playback

### Test: Play Audio
**Steps:**
1. After generating a route, click Play button (▶)

**Expected Results:**
- [ ] Play button becomes disabled and highlights
- [ ] Pause button becomes enabled
- [ ] Stop button becomes enabled
- [ ] Audio begins playing
- [ ] Time display updates (0:00 → x:xx)
- [ ] Timeline playback indicator moves (gold line)
- [ ] Indicator syncs with audio time

### Test: Pause Audio
2. Click Pause button (⏸)

**Expected Results:**
- [ ] Audio pauses
- [ ] Play button re-enables
- [ ] Pause button disables
- [ ] Time display freezes at current position
- [ ] Playback indicator stops moving

### Test: Resume Audio
3. Click Play again

**Expected Results:**
- [ ] Audio resumes from paused position
- [ ] Playback indicator continues from where it stopped
- [ ] Time display continues updating

### Test: Stop Audio
4. Click Stop button (⏹)

**Expected Results:**
- [ ] Audio stops completely
- [ ] Play button re-enables
- [ ] Pause and Stop buttons disable
- [ ] Time display resets to 0:00
- [ ] Playback indicator returns to start

### Verification
- [ ] Different transit modes produce distinct sounds
- [ ] Bus sounds are lower pitched (bass)
- [ ] Train sounds are rhythmic with multiple beats
- [ ] Walking sounds are percussive clicks
- [ ] Transfer sounds are brief chords
- [ ] Volume levels are reasonable (not too loud/quiet)
- [ ] No audio glitches or pops

## 5. Timeline Interaction

### Test: Click on Timeline
**Steps:**
1. Generate a route with audio controls visible
2. Click at different positions on the timeline canvas

**Expected Results:**
- [ ] Playback indicator jumps to clicked position
- [ ] Indicator stays at clicked position
- [ ] Can click at start, middle, and end of timeline
- [ ] Visual feedback on click

### Test: Hover on Timeline
**Steps:**
1. Move mouse over different timeline segments

**Expected Results:**
- [ ] Cursor changes to pointer over timeline
- [ ] Tooltip appears showing segment info (if implemented)
- [ ] No visual glitches

## 6. Quilt Pattern Download

### Test: Download Pattern
**Steps:**
1. Generate a route to create quilt pattern
2. Click "Download Pattern" button below quilt

**Expected Results:**
- [ ] File download initiates
- [ ] Filename includes "chicago-songline-quilt" and timestamp
- [ ] File format is PNG
- [ ] Downloaded image matches displayed quilt
- [ ] Image is 600x600 pixels
- [ ] Image has proper borders and patterns
- [ ] Colors match CTA line colors used in route

### Verification
- [ ] Different transit modes create different patterns:
  - Circles for trains
  - Squares for buses
  - Triangles for walking
  - Hexagons for driving
- [ ] Same route always produces same quilt (deterministic)
- [ ] Quilt has decorative border
- [ ] Patterns are visually appealing

## 7. Keyboard Shortcuts

### Test: Enter Key (Submit)
**Steps:**
1. Type addresses in origin field
2. Press Enter key

**Expected Results:**
- [ ] Route generation initiates
- [ ] Same as clicking "Generate Songline" button

### Test: Enter Key (Second Field)
**Steps:**
1. Type address in destination field
2. Press Enter key

**Expected Results:**
- [ ] Route generation initiates
- [ ] Works from either input field

### Test: Space Bar (Play/Pause)
**Steps:**
1. Generate a route
2. Press Space bar

**Expected Results:**
- [ ] Audio begins playing
- [ ] If already playing, audio pauses
- [ ] Space bar toggles between play and pause

### Test: Escape Key (Stop)
**Steps:**
1. While audio is playing, press Escape

**Expected Results:**
- [ ] Audio stops
- [ ] Playback resets to beginning
- [ ] Same as clicking Stop button

### Verification
- [ ] Keyboard shortcuts work when input fields don't have focus
- [ ] Space bar doesn't trigger when typing in input fields

## 8. Error Handling

### Test: Empty Inputs
**Steps:**
1. Leave both fields empty
2. Click "Generate Songline"

**Expected Results:**
- [ ] Error message appears: "Please enter both origin and destination addresses."
- [ ] No API call is made
- [ ] Error message has red styling

### Test: Invalid Address
**Steps:**
1. Enter "asdfghjkl" as origin
2. Enter "Navy Pier, Chicago, IL" as destination
3. Click "Generate Songline"

**Expected Results:**
- [ ] Error message appears indicating address not found
- [ ] Helpful suggestion provided
- [ ] Error has user-friendly language

### Test: No Transit Route
**Steps:**
1. Enter two addresses with no transit connection
2. Click "Generate Songline"

**Expected Results:**
- [ ] Error message explains no transit route found
- [ ] Suggestion to try addresses within Chicago
- [ ] Mention of Example Route button

### Test: Missing API Key
**Steps:**
1. Remove or invalidate API key in index.html
2. Reload page

**Expected Results:**
- [ ] Map placeholder shows error status
- [ ] Red error indicator with helpful message
- [ ] Instructions to add API key in index.html
- [ ] No JavaScript errors (graceful handling)

### Test: API Query Limit
*(Hard to test without exceeding quota)*
- [ ] If encountered, error message should be helpful
- [ ] Suggestion to wait and try again

## 9. Responsive Design

### Test: Desktop (1920x1080)
**Expected Results:**
- [ ] Map and two-column layout for timeline/quilt
- [ ] All content readable and well-spaced
- [ ] No horizontal scrolling
- [ ] Hover effects work smoothly

### Test: Laptop (1366x768)
**Expected Results:**
- [ ] Layout adjusts appropriately
- [ ] All features remain accessible
- [ ] Text remains readable

### Test: Tablet (768px width)
**Expected Results:**
- [ ] Single column layout for outputs
- [ ] Buttons stack vertically
- [ ] Map height reduces to 400px
- [ ] All features remain functional
- [ ] Touch interactions work

### Test: Mobile (375px width - iPhone SE)
**Expected Results:**
- [ ] All content fits without horizontal scroll
- [ ] Text remains legible
- [ ] Buttons are appropriately sized for touch
- [ ] Audio controls are accessible
- [ ] Timeline can be interacted with
- [ ] Map shows properly at 300px height

### Test: Window Resize
**Steps:**
1. Generate a route
2. Resize browser window from wide to narrow
3. Resize back to wide

**Expected Results:**
- [ ] Timeline canvas redraws correctly
- [ ] Layout adapts smoothly
- [ ] No visual glitches
- [ ] Quilt pattern remains properly sized
- [ ] Map remains functional

## 10. Visual Polish & Animations

### Test: Fade-in Animations
**Steps:**
1. Generate a route
2. Observe output sections appearing

**Expected Results:**
- [ ] Output containers fade in smoothly
- [ ] Staggered animation (map, then timeline, then quilt)
- [ ] Animation duration feels natural (~0.6s)

### Test: Button Interactions
**Expected Results:**
- [ ] All buttons have hover states
- [ ] Primary button has gradient and shadow
- [ ] Hover transforms buttons slightly upward
- [ ] Active state (press down) works
- [ ] Focus states visible for keyboard navigation
- [ ] Disabled buttons have reduced opacity

### Test: Loading State
**Expected Results:**
- [ ] Loading message has animated spinner
- [ ] Spinner rotates smoothly
- [ ] Loading message is clearly visible
- [ ] Generate button shows disabled state

### Test: Hover Effects
**Expected Results:**
- [ ] Output containers lift slightly on hover
- [ ] Canvas hover on quilt shows slight zoom
- [ ] Link hover effects work in footer
- [ ] Timeline segments respond to hover

## 11. About Section & Documentation

### Test: About Section
**Expected Results:**
- [ ] About section visible on page load
- [ ] Two descriptive paragraphs display
- [ ] Text is readable and well-formatted
- [ ] Instructions are in collapsible details element

### Test: Instructions Collapsible
**Steps:**
1. Click "How to Use" summary

**Expected Results:**
- [ ] Instructions expand/collapse
- [ ] Arrow or indicator shows state
- [ ] Smooth transition

### Test: Footer Links
**Steps:**
1. Scroll to footer
2. Click "About Songlines" link

**Expected Results:**
- [ ] Smooth scroll to about section
- [ ] Instructions details element opens automatically
- [ ] Page doesn't reload

## 12. Browser Compatibility

### Chrome
- [ ] All features work
- [ ] Web Audio API functions properly
- [ ] Canvas rendering correct
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Audio playback functions
- [ ] Canvas rendering correct
- [ ] Timeline interaction works

### Safari
- [ ] All features work
- [ ] Audio context resumes after user gesture
- [ ] Canvas high-DPI rendering works
- [ ] No webkit-specific issues

### Edge
- [ ] All features work
- [ ] Feature parity with Chrome
- [ ] No edge cases (pun intended)

## 13. Performance

### Test: Route Generation Speed
**Expected Results:**
- [ ] Simple routes load in < 3 seconds
- [ ] Complex routes load in < 5 seconds
- [ ] No browser hanging or freezing

### Test: Audio Performance
**Expected Results:**
- [ ] Audio starts without delay
- [ ] No stuttering during playback
- [ ] Timeline animation is smooth (60fps)
- [ ] CPU usage is reasonable

### Test: Canvas Rendering
**Expected Results:**
- [ ] Timeline renders instantly (< 100ms)
- [ ] Quilt renders quickly (< 500ms)
- [ ] High-DPI rendering works on retina displays
- [ ] No visual artifacts

### Test: Memory Usage
**Steps:**
1. Generate 5-10 different routes in succession
2. Monitor browser memory

**Expected Results:**
- [ ] Memory usage stays reasonable
- [ ] No obvious memory leaks
- [ ] Old audio sources are cleaned up
- [ ] Canvas doesn't leak memory

## 14. Integration Testing

### Test: End-to-End Flow
**Steps:**
1. Load page fresh
2. Read about section
3. Enter addresses
4. Generate route
5. Explore map (zoom, pan, click segments)
6. Play audio
7. Pause audio
8. Click timeline to seek
9. Resume audio
10. Stop audio
11. Download quilt pattern
12. Generate new route

**Expected Results:**
- [ ] All steps complete without errors
- [ ] User experience feels polished
- [ ] Everything works harmoniously
- [ ] No confusing states or behaviors

### Test: Multiple Routes
**Steps:**
1. Generate route A
2. Play audio for route A
3. Generate route B without stopping audio

**Expected Results:**
- [ ] Audio stops automatically
- [ ] Previous route clears
- [ ] New route displays correctly
- [ ] No conflicts between old and new data

## 15. Accessibility

### Test: Keyboard Navigation
**Expected Results:**
- [ ] Can tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] Enter key activates buttons

### Test: Focus States
**Expected Results:**
- [ ] All buttons show focus outline
- [ ] Input fields show focus state
- [ ] Focus outline is clearly visible (3px blue)

### Test: Color Contrast
**Expected Results:**
- [ ] Text is readable on all backgrounds
- [ ] Error messages have sufficient contrast
- [ ] Button text is legible

### Test: Semantic HTML
**Expected Results:**
- [ ] Headings are properly structured (h1, h2)
- [ ] Buttons are actual button elements
- [ ] Links are anchor elements
- [ ] Sections use semantic tags

## 16. Console & Debug Info

### Test: Console Messages
**Expected Results:**
- [ ] Welcome message displays on load
- [ ] Keyboard shortcuts listed in console
- [ ] "Google Maps initialized" confirms API load
- [ ] Parsed route segments logged
- [ ] Audio sequence logged when generated
- [ ] No error messages in normal operation

### Test: Error Logging
**Expected Results:**
- [ ] API errors logged with details
- [ ] Clear error messages in console
- [ ] Stack traces available for debugging

## 17. Edge Cases

### Test: Very Short Route
**Steps:**
1. Enter two addresses < 1 mile apart
2. Generate route

**Expected Results:**
- [ ] Route generates successfully
- [ ] May be walking only
- [ ] Audio is brief but plays
- [ ] Timeline and quilt still generate

### Test: Very Long Route
**Steps:**
1. Enter two far endpoints of Chicago
2. Generate route

**Expected Results:**
- [ ] Route generates (or error if too long)
- [ ] Many segments handled correctly
- [ ] Audio duration reasonable (< 30 seconds)
- [ ] Timeline remains readable
- [ ] Quilt handles many segments

### Test: Route with Many Transfers
**Steps:**
1. Find route requiring 3+ transfers
2. Generate route

**Expected Results:**
- [ ] All transfers visualized
- [ ] Transfer sounds play between segments
- [ ] Timeline shows transfer markers
- [ ] Quilt incorporates all segments

### Test: Rapid Clicking
**Steps:**
1. Click "Generate Songline" rapidly multiple times

**Expected Results:**
- [ ] Button disables after first click
- [ ] Only one request is made
- [ ] No race conditions or conflicts

### Test: Switching Routes Quickly
**Steps:**
1. Generate route A
2. Immediately generate route B (while A is loading)

**Expected Results:**
- [ ] Previous request cancels or is ignored
- [ ] Latest route displays
- [ ] No mixed data from both routes

## 18. Documentation Accuracy

### Test: README.md
- [ ] Setup instructions are accurate
- [ ] Feature descriptions match implementation
- [ ] Troubleshooting section is helpful
- [ ] All links work (if any)
- [ ] Code examples are correct

### Test: In-App Instructions
- [ ] "How to Use" steps are accurate
- [ ] About section describes project correctly
- [ ] No outdated information

## Final Checklist

### Overall Quality
- [ ] Application feels polished and professional
- [ ] Visual design is cohesive
- [ ] Interactions are smooth and responsive
- [ ] Error handling is graceful
- [ ] User experience is intuitive

### Code Quality
- [ ] No console errors in normal use
- [ ] Code is well-commented
- [ ] Functions have clear purposes
- [ ] No obvious bugs or glitches

### Documentation
- [ ] README is comprehensive
- [ ] Code comments are helpful
- [ ] API key setup is clearly explained
- [ ] Troubleshooting covers common issues

### Deployment Readiness
- [ ] Works on localhost
- [ ] Works when served over HTTP/HTTPS
- [ ] API key placeholder is clear
- [ ] No hardcoded sensitive data
- [ ] All assets load correctly

---

## Testing Notes

**Date Tested:** _____________

**Browser/Version:** _____________

**Operating System:** _____________

**Issues Found:**

1. 
2. 
3. 

**Overall Assessment:**

- [ ] Ready for deployment
- [ ] Minor issues to fix
- [ ] Major issues to address

**Tester Signature:** _____________

---

## Common Issues & Solutions

**Issue:** Map doesn't load
- **Solution:** Check API key, verify APIs enabled, check browser console

**Issue:** Audio doesn't play
- **Solution:** Click page first (autoplay policy), check volume, try different browser

**Issue:** Timeline doesn't appear
- **Solution:** Verify route generated successfully, check for JavaScript errors

**Issue:** Quilt download fails
- **Solution:** Check Canvas API support, verify route generated, try different browser

**Issue:** Responsive layout broken
- **Solution:** Clear browser cache, verify CSS loaded, check window size

---

**Testing Complete!** ✅
