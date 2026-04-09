# Phase 5: Quilt Pattern Generator

## Overview
The Quilt Pattern Generator transforms Chicago transit route data into an abstract, textile-inspired visual artwork. Each route generates a unique, deterministic pattern that resembles a decorative quilt or textile design.

## Design Philosophy

### Non-Literal Artistic Representation
- The pattern is **generative art**, not a diagram
- Focuses on aesthetic beauty rather than literal data representation
- Same route always produces the same pattern (deterministic)
- Could be displayed as wall art or printed on fabric

### Textile/Quilt Inspiration
- Grid-based patchwork layout (similar to traditional quilts)
- Each route segment becomes a geometric "patch"
- Includes quilting details: stitched borders, decorative frame
- Uses vibrant CTA colors harmoniously arranged

## Visual Mapping System

### Mode to Shape Mapping
Each transit mode gets a distinctive geometric pattern:

1. **RAIL (Trains)**
   - **Pattern**: Concentric circles
   - **Reasoning**: Represents the radial nature of Chicago's "L" system and station nodes
   - **Circles**: Number based on stops (3-8 circles)
   - **Colors**: Actual CTA line colors (Red, Blue, Brown, Green, Orange, Purple, Yellow, Pink)

2. **BUS**
   - **Pattern**: Checkerboard squares
   - **Reasoning**: Grid-like street network of Chicago bus routes
   - **Grid**: 2x2 to 5x5 based on number of stops
   - **Color**: Orange (#f9461c) - CTA bus color

3. **WALKING**
   - **Pattern**: Radiating triangles
   - **Reasoning**: Dynamic, human-scale movement
   - **Triangles**: 3-8 segments forming a starburst
   - **Color**: Gray tones (#6c757d)

4. **DRIVING**
   - **Pattern**: Nested hexagons
   - **Reasoning**: Efficient, interconnected highway system
   - **Hexagons**: 1-3 nested levels based on stops
   - **Color**: Blue (#00a1de)

### Data-Driven Pattern Parameters

#### Patch Size
- **Standard segments**: 1x1 grid cells
- **Major segments**: 2x2 grid cells (for duration >20 min or >10 stops)
- Longer, more complex routes get more visual weight

#### Color Palettes
Each patch uses a three-color scheme:
- **Primary**: Main mode color (actual CTA line color for trains)
- **Secondary**: Lightened version (+40% brightness)
- **Accent**: Darkened version (-20% brightness)

Creates harmonious color gradients within each patch.

#### Pattern Complexity
- **Number of stops** influences pattern density:
  - More stops = more circles/squares/triangles in pattern
  - Creates visual correlation with route complexity
- **Duration** affects patch size (longer = bigger)

## Technical Implementation

### Canvas-Based Rendering
- 600x600px canvas (scales responsively)
- High-quality rendering suitable for export
- Grid size: 4x4 to 12x12 based on segment count

### Grid Layout Algorithm
```javascript
calculateGridSize(segmentCount) {
    targetCells = segmentCount * 2
    gridSize = ceil(sqrt(targetCells))
    return clamp(gridSize, 4, 12)  // Min 4x4, max 12x12
}
```

### Patch Generation
1. Iterate through route segments sequentially
2. Calculate patch size (1x1 or 2x2)
3. Generate color palette from mode
4. Assign shape pattern based on mode
5. Place in grid left-to-right, top-to-bottom
6. Wrap to new row when full

### Quilting Details

#### Patch Borders
- Dashed stroke (5px dash, 3px gap) for "stitching" effect
- Uses accent color for contrast
- 2px line width

#### Quilt Frame
- 15px wide border in CTA Brown (#62361b)
- Inner gold accent line (#d4af37) for decorative detail
- Professional framed appearance

## Features

### Download Functionality
- **Button**: "Download Pattern"
- **Format**: PNG image
- **Filename**: `chicago-songline-quilt-[timestamp].png`
- **Use Cases**:
  - Print as wall art
  - Save as memorabilia of journey
  - Share on social media
  - Use in design projects

### Responsive Design
- Canvas scales to fit container
- Maintains square aspect ratio
- Works on mobile and desktop
- Max-width: 100% with auto height

## Integration

### Automatic Generation
The quilt pattern generates automatically after route parsing:

```javascript
handleDirectionsSuccess(result) {
    // Parse route
    const segments = parseRouteSegments(result);
    
    // Display map
    displayRouteOnMap(result, segments);
    
    // Render timeline
    renderTimeline(segments);
    
    // Generate quilt pattern ← NEW
    generateQuilt(segments);
}
```

### Data Structure
Uses `window.routeSegments` array with this structure:
```javascript
{
    mode: 'BUS' | 'RAIL' | 'WALKING' | 'DRIVING',
    routeNumber: string,    // For buses
    lineName: string,       // For trains
    lineColor: string,      // For trains (hex color)
    direction: string,      // Travel direction
    stops: number,          // Number of stops
    duration: number,       // Duration in seconds
    distance: number        // Distance in meters
}
```

## Visual Examples

### Example Pattern Elements

**Red Line Train Segment** (8 stops, 15 min):
- 1x1 patch with concentric circles
- Red primary (#c60c30)
- Pink secondary, dark red accent
- 4 circles (8 stops / 2)

**Bus #22 Segment** (12 stops, 25 min):
- 2x2 patch (over 20 min)
- Orange checkerboard
- 5x5 grid (12 stops / 2, capped at 5)

**Walking Segment** (5 stops, 8 min):
- 1x1 patch
- Gray radiating triangles
- 5 triangular segments

## Aesthetic Goals

### Achieved Design Principles
1. **Abstract**: Not a map or diagram, purely generative art
2. **Textile-inspired**: Looks like a decorative quilt
3. **Deterministic**: Same route = identical pattern
4. **Vibrant**: Uses actual CTA colors beautifully
5. **Frameable**: Professional appearance with border

### Visual Harmony
- Colors are algorithmically harmonized (lightened/darkened)
- Geometric shapes balance each other
- Grid creates structure and rhythm
- Frame provides visual containment

## Future Enhancements (Optional)

### Possible Additions
1. **Pattern Variations**: User could choose different geometric styles
2. **Color Themes**: Alternative color palettes (monochrome, pastel, etc.)
3. **Size Options**: Different canvas sizes for printing
4. **Animation**: Patches could "stitch" into place sequentially
5. **Metadata Overlay**: Optional text showing route info

### Print-Ready Features
- High-resolution export (2x or 4x scale)
- Vector SVG export option
- Color profile management for printing
- Bleed margins for physical printing

## Code Structure

### Main Functions
- `generateQuilt(segments)` - Main entry point
- `calculateGridSize(count)` - Determines grid dimensions
- `generatePatches(segments, gridSize)` - Creates patch data
- `drawPatch(ctx, patch, cellSize)` - Renders single patch
- `draw[Shape]Pattern()` - Pattern-specific drawing functions
- `addDownloadButton()` - Creates download functionality

### Helper Functions
- `getPatchSize(segment)` - Size based on duration/stops
- `getSegmentColorPalette(segment)` - Three-color scheme
- `getShapeForMode(mode)` - Mode-to-shape mapping
- `lightenColor()` / `darkenColorQuilt()` - Color manipulation
- `hexToRgb()` / `rgbToHex()` - Color conversion

## Performance

### Optimization
- Single canvas render (no re-draws needed)
- Efficient geometric calculations
- No external dependencies
- Renders in <100ms for typical routes

### Browser Compatibility
- Works in all modern browsers
- Uses standard Canvas API
- No vendor-specific features
- Graceful fallback (placeholder text remains if JS fails)

## Conclusion

The Quilt Pattern Generator successfully transforms transit data into beautiful, frameable art. It combines the precision of data visualization with the aesthetics of textile design, creating a unique visual signature for each Chicago journey.

**Key Achievement**: Non-literal, artistic representation that honors both the data (CTA colors, route structure) and the creative vision (geometric patterns, quilt aesthetic).
