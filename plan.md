# Chicago Songline Simulator - Project Plan

## Concept
A single-page web app that encodes Chicago transit routes into audio and visual representations, inspired by Aboriginal songlines. Users input two locations in Chicago, and the app translates the journey (via CTA, walking, driving) into:
1. Synthesized audio "song"
2. Waveform timeline with labeled segments
3. Abstract quilt-like visual pattern

**Thesis**: Exploring collaborative creation between human and machine intelligence through generative art based on navigation.

---

## Core Features

### Input
- Two address/location fields (origin → destination in Chicago)
- "Generate Songline" button
- Example preset: "University of Chicago to O'Hare Airport"

### Processing
- Query Google Maps Directions API with transit mode
- Parse route into segments:
  - **Bus**: route number, stops/duration
  - **CTA L Train**: line color, direction, stops
  - **Walking**: distance/duration
  - **Driving**: distance/duration
  - **Transfers**: transition points between modes

### Output (3 Views)

#### 1. Map View
- Google Maps display showing the actual route
- Colored polylines for different transit modes

#### 2. Sound Timeline
- **Audio**: Synthesized playback using Web Audio API
  - Each mode has distinct timbres/tones
  - Pitch/rhythm varies by: route number, line color, duration, stops
- **Visual Waveform**: Canvas/SVG timeline
  - Segments color-coded by transit mode
  - Labels beneath (e.g., "Bus 55 - 12 stops", "Red Line North - 8 stops")
  - Play/pause controls

#### 3. Quilt Pattern
- Abstract geometric/textile-inspired visualization
- Generated from route data (mode sequence, colors, durations)
- Non-literal representation—feels like a generative art piece

---

## Technical Stack

### Single-Page Architecture
- **File**: `index.html` (with inline or separate `style.css` and `script.js`)
- **No backend**: Fully client-side

### APIs & Libraries
- **Google Maps JavaScript API**
  - Directions Service (routing)
  - Map display
- **Web Audio API** (built-in, no library needed)
  - OscillatorNode for tone synthesis
- **Canvas or SVG** for visualizations

### Transit Encoding Rules

| Mode | Sound Mapping | Visual Tag |
|------|---------------|------------|
| **CTA Bus** | Bass tone, pitch = route number mod 12, duration = stops | Orange segments |
| **CTA L Train** | Synthesized train sound, pitch = line color mapping, rhythm = stops | Colored by line (red, blue, etc.) |
| **Walking** | Percussive clicks, tempo = pace | Gray segments |
| **Driving** | White noise with rhythm, tempo = speed | Light blue segments |
| **Transfer** | Short transitional chord | Divider marker |

*(These rules can be refined during implementation)*

---

## Implementation Phases

### Phase 1: Basic Structure ✅
- [ ] Create `index.html` with basic UI
  - Two input fields (autocomplete optional)
  - "Generate" button
  - Three output containers (map, timeline, quilt)
- [ ] Set up Google Maps API
  - Display map centered on Chicago
  - Test Directions API call with hardcoded route

### Phase 2: Route Parsing & Display 🗺️
- [ ] Implement Directions API integration
  - Request transit directions between two points
  - Parse response into structured segments
  - Extract: mode, route number/line, stops, duration, GPS points
- [ ] Display route on map with polylines
- [ ] Log parsed route data to console for debugging

### Phase 3: Sound Generation 🎵
- [ ] Design encoding rules (map transit data → audio parameters)
- [ ] Implement Web Audio API synthesis
  - Create oscillators/noise generators for each mode
  - Sequence sounds based on route segments
  - Add play/pause controls
- [ ] Test with example route (UChicago → O'Hare)

### Phase 4: Timeline Visualization 📊
- [ ] Build canvas/SVG timeline
  - Horizontal segments proportional to duration
  - Color-code by transit mode
  - Draw simplified waveform shapes
- [ ] Add labels beneath each segment
  - "Bus 55", "Red Line North", etc.
- [ ] Sync playback indicator with audio

### Phase 5: Quilt Pattern 🎨
- [ ] Design generative algorithm
  - Map route data to geometric shapes/colors
  - Create abstract, non-literal representation
  - Could use: grid patterns, tessellations, color gradients
- [ ] Render on canvas/SVG
- [ ] Ensure it feels artistic, not diagram-like

### Phase 6: Polish & Documentation 🌟
- [ ] UI refinements (layout, typography, responsiveness)
- [ ] Add example button (auto-fill UChicago → O'Hare)
- [ ] Brief on-page explanation of the concept
- [ ] Error handling (invalid addresses, no transit route found)
- [ ] Optional: Export quilt pattern as image

---

## File Structure (Minimal)
```
/
├── index.html          # Main page
├── style.css           # Styling (or inline)
├── script.js           # Logic (or inline)
└── plan.md             # This file
```

---

## Example Route Encoding
**Route**: University of Chicago → O'Hare Airport
- **Bus 55 West** (12 stops) → Bass tone (pitch based on 55), 12 beats
- **Transfer at Garfield** → Short chord
- **Red Line North** (Jackson, 8 stops) → Train timbre (red = C note?), 8 pulses
- **Transfer at Jackson** → Short chord
- **Blue Line to O'Hare** (22 stops) → Train timbre (blue = E note?), 22 pulses

**Timeline**: `[Orange Bus Bar]--[Dot]--[Red Train Bar]--[Dot]--[Blue Train Bar]`

**Quilt**: Abstract pattern with orange/red/blue blocks, tessellated shapes

---

## Open Questions / Future Ideas
- Should we include Metra trains? (probably out of scope for v1)
- Bike routes?
- Allow users to tweak encoding rules?
- Save/share songlines (would need backend or localStorage)
- Multiple route options (e.g., fastest vs. fewest transfers)?

---

## Next Steps
1. Set up `index.html` with basic structure
2. Get Google Maps API key and test directions
3. Implement Phases 1-2 (input → routing → map display)
4. Design sound encoding rules collaboratively
5. Build out visualizations

**Let's start with Phase 1!**
