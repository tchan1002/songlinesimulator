# Chicago Songline Simulator

![Chicago Songline Simulator](https://img.shields.io/badge/status-complete-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Transform Chicago transit routes into multi-sensory artistic experiences. Inspired by Indigenous Australian songlines, this project explores collaborative human-machine creation by converting urban journeys into generative audio, visual timelines, and textile patterns.

## 🎵 What is a Songline?

In Indigenous Australian culture, songlines are paths across the land (or sky) that mark the route of ancestral spirits during creation. They serve as navigational maps encoded in song, story, and ceremony. This project reimagines that concept for contemporary urban transit—each route becomes a unique "songline" expressed through sound, visualization, and pattern.

## 🌟 Features

### 1. **Interactive Route Mapping**
- Enter any two Chicago addresses
- Real-time transit directions using Google Maps API
- Color-coded visualization of CTA trains and buses
- Click segments for detailed transit information

### 2. **Generative Audio Synthesis**
- Each transit mode produces unique sonic signatures:
  - **Buses**: Bass tones pitched by route number
  - **Trains**: Mid-range rhythmic patterns based on CTA line colors
  - **Walking**: Percussive clicks with pace-based tempo
  - **Driving**: Filtered noise pulses
  - **Transfers**: Brief harmonic chords
- Web Audio API implementation with envelope shaping
- Play/pause/stop controls with synchronized playback

### 3. **Canvas Timeline Visualization**
- High-DPI canvas rendering of route segments
- Decorative waveforms matching transit modes
- Real-time playback indicator synced with audio
- Interactive clicking to seek through the route
- Color-coded segments using actual CTA colors

### 4. **Generative Quilt Patterns**
- Textile-inspired abstract visualizations
- Geometric patterns based on transit characteristics:
  - Circles for trains
  - Squares for buses
  - Triangles for walking
  - Hexagons for driving
- Deterministic generation (same route = same quilt)
- Downloadable as PNG image

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Directions API

### Setup Instructions

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/chicago-songline-simulator.git
   cd chicago-songline-simulator
   ```

2. **Get a Google Maps API Key**
   
   a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Create a new project or select an existing one
   
   c. Enable the required APIs:
      - Navigate to "APIs & Services" > "Library"
      - Search for and enable "Maps JavaScript API"
      - Search for and enable "Directions API"
   
   d. Create credentials:
      - Go to "APIs & Services" > "Credentials"
      - Click "Create Credentials" > "API Key"
   
   e. Secure your API key (recommended):
      - Click on your API key to edit it
      - Under "API restrictions", select "Restrict key"
      - Choose "Maps JavaScript API" and "Directions API"
      - Under "Website restrictions", add your domain
   
   f. Copy your API key

3. **Configure the API Key**
   
   Open `index.html` in a text editor and find line 72:
   
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places"></script>
   ```
   
   Replace `YOUR_API_KEY_HERE` with your actual API key.

4. **Launch the Application**
   
   Simply open `index.html` in your web browser. For best results, serve it through a local web server:
   
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   ```
   
   Then navigate to `http://localhost:8000` in your browser.

## 📖 How to Use

1. **Enter Addresses**: Type your origin and destination addresses in Chicago
2. **Generate Route**: Click "Generate Songline" or press Enter
3. **Explore Outputs**:
   - View the color-coded route map
   - Play the generated audio composition
   - Interact with the timeline visualization
   - Download your unique quilt pattern

### Keyboard Shortcuts

- **Enter** - Generate songline from input addresses
- **Space** - Play/pause audio playback
- **Escape** - Stop audio playback

### Example Routes

Try these Chicago landmarks to see diverse transit combinations:

- **University of Chicago → O'Hare Airport**
- **Navy Pier → Midway Airport**
- **Willis Tower → Wrigley Field**
- **Art Institute of Chicago → Lincoln Park Zoo**

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Mapping**: Google Maps JavaScript API
- **Audio**: Web Audio API
- **Graphics**: HTML5 Canvas (2D Context)
- **Architecture**: Single-page application, no backend required

### Project Structure

```
songlinesimulator/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Core application logic
├── README.md           # This file
└── [documentation]     # Phase implementation docs
```

### Key Components

#### Phase 1-2: Foundation & Route Parsing
- Google Maps integration
- Transit directions API requests
- Route segment parsing
- Polyline visualization with CTA colors

#### Phase 3: Audio Generation System
- Web Audio API synthesis
- Mode-specific sound generation
- Musical note mapping for transit lines
- Playback controls with time display

#### Phase 4: Timeline Visualization
- Canvas-based rendering with high-DPI support
- Waveform overlays for visual interest
- Interactive playback indicator
- Click-to-seek functionality

#### Phase 5: Quilt Pattern Generator
- Grid-based geometric composition
- Deterministic pattern generation
- Mode-specific shape systems
- Canvas export to PNG

#### Phase 6: Polish & Documentation
- On-page explanatory content
- API key status detection
- Keyboard shortcuts
- Loading states and animations
- Comprehensive documentation

## 🎨 Design Philosophy

### Collaborative Creation

This project explores a thesis about human-machine collaboration:

> "Can algorithmic systems serve not as autonomous creators, but as collaborative partners in artistic expression? By providing human intention (the route choice) and letting the machine interpret through generative rules, we create artifacts that neither human nor machine could produce alone."

### Sound Design Principles

- **Deterministic**: Same route always produces same audio
- **Meaningful mapping**: Transit characteristics influence sound parameters
- **Musical coherence**: Using scales and harmonic structures
- **Varied timbres**: Each mode has distinct sonic identity

### Visual Principles

- **Chicago-centric**: Using actual CTA colors and branding
- **Textile metaphor**: Quilt patterns evoke traditional crafts
- **Information density**: Timeline balances aesthetics with data
- **Responsive design**: Adapts to various screen sizes

## 🔮 Future Enhancements

Potential directions for expansion:

- **City expansion**: Adapt for other transit systems (NYC, London, Tokyo)
- **Time-based routing**: Incorporate real-time transit schedules
- **Social sharing**: Generate shareable links with route parameters
- **Audio variations**: Multiple synthesis algorithms or styles
- **3D visualization**: WebGL rendering of routes in 3D space
- **Pattern variations**: User-adjustable quilt styles
- **Accessibility**: Screen reader support, audio descriptions
- **Mobile app**: Native iOS/Android implementations
- **Historical routes**: Archive famous Chicago transit journeys
- **Community gallery**: User-submitted favorite songlines

## 🤝 Contributing

Contributions are welcome! Areas particularly suited for contribution:

- Additional city/transit system support
- Alternative sound synthesis approaches
- New visualization patterns
- Accessibility improvements
- Performance optimizations
- Documentation and examples

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Indigenous Australian cultures** for the songline concept that inspired this work
- **Chicago Transit Authority** for their open transit system and iconic branding
- **Web Audio API community** for synthesis techniques and documentation
- **Google Maps Platform** for robust mapping and directions APIs

## 📧 Contact

For questions, feedback, or collaboration opportunities, please open an issue on GitHub or reach out to the project maintainers.

---

**Built with curiosity and code** | A collaborative human-machine creation | 2026

---

## 🐛 Troubleshooting

### Common Issues

**Map doesn't load**
- Check that your API key is correctly entered in `index.html`
- Verify that Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for specific error messages
- Ensure you're viewing through HTTP/HTTPS, not `file://`

**No route found**
- Both addresses must be within the Chicago area
- Try more specific addresses (include "Chicago, IL")
- Check that transit is available between the locations
- Try the "Example Route" button to test the system

**Audio doesn't play**
- Click the page once to activate audio context (browser autoplay policy)
- Check that your device isn't muted
- Try using headphones if on mobile
- Verify browser supports Web Audio API (all modern browsers do)

**Timeline or quilt doesn't appear**
- Ensure a route has been successfully generated
- Check browser console for JavaScript errors
- Try refreshing the page and generating again
- Verify browser supports Canvas API

**Performance issues**
- Close other browser tabs to free up memory
- Try a shorter route with fewer segments
- Update your browser to the latest version
- Disable browser extensions that might interfere

### Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- JavaScript enabled
- Canvas support
- Web Audio API support
- ES6+ features

---

**Enjoy creating your Chicago songlines!** 🎵🗺️🎨
