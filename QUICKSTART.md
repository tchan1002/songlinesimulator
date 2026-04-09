# Quick Start Guide - Chicago Songline Simulator

Get up and running in 5 minutes! 🚀

## 1. Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. Enable two APIs:
   - Maps JavaScript API
   - Directions API
4. Create an API key (Credentials > Create Credentials > API Key)
5. Copy your API key

**Important**: Add billing to your project (required for Directions API, but free tier is generous).

## 2. Configure the Application

Open `index.html` in a text editor and find line 72:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places"></script>
```

Replace `YOUR_API_KEY_HERE` with your actual API key.

## 3. Run Locally

You need to serve the files over HTTP (not `file://`). Choose one method:

### Option A: Python (if installed)
```bash
cd /path/to/songlinesimulator
python -m http.server 8000
```
Open: http://localhost:8000

### Option B: Node.js http-server
```bash
npx http-server
```
Open: http://localhost:8080

### Option C: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## 4. Test It Out

1. Enter two Chicago addresses (or click "Example Route")
2. Click "Generate Songline"
3. Watch the magic happen:
   - Map shows your route
   - Audio controls appear
   - Timeline visualizes the journey
   - Quilt pattern generates
4. Click Play to hear your songline
5. Download your quilt pattern

## 5. Keyboard Shortcuts

- **Enter** - Generate route
- **Space** - Play/pause audio
- **Escape** - Stop audio

## Troubleshooting

**Map doesn't load?**
- Check your API key is correct
- Verify APIs are enabled in Google Cloud Console
- Check browser console for errors

**No transit route found?**
- Make sure addresses are in Chicago
- Try the Example Route button
- Be specific with addresses (include "Chicago, IL")

**Audio doesn't play?**
- Click the page once (browser autoplay policy)
- Check your volume isn't muted

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) to deploy online
- Review [FINAL_TESTING_CHECKLIST.md](FINAL_TESTING_CHECKLIST.md) for testing

## File Structure

```
songlinesimulator/
├── index.html              # Main application
├── style.css               # All styling
├── script.js               # All functionality
├── README.md               # Full documentation
├── QUICKSTART.md           # This file
├── DEPLOYMENT_GUIDE.md     # How to deploy
├── CHANGELOG.md            # Version history
├── LICENSE                 # MIT License
└── [other docs]            # Phase guides, testing
```

## Need Help?

1. Check README.md troubleshooting section
2. Review browser console for errors
3. Verify API key setup in Google Cloud Console
4. Ensure you're running over HTTP (not file://)

---

**Ready to go?** Fire up a local server and start creating songlines! 🎵🗺️🎨
