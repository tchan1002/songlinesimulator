# Setup & Deployment Guide

## 🚀 Quick Setup (Local Development)

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Directions API**
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > API Key**
6. Copy your API key

### Step 2: Configure Locally

```bash
cd /Users/tobychan/songlinesimulator

# Copy the example config
cp config.example.js config.js

# Edit config.js and paste your API key
# Replace 'YOUR_API_KEY_HERE' with your actual key
```

Your `config.js` should look like:
```javascript
const CONFIG = {
  GOOGLE_MAPS_API_KEY: 'AIzaSyAbc123...'  // Your actual key
};
```

### Step 3: Test Locally

```bash
# Start a local server (pick one):
python -m http.server 8000
# or
python3 -m http.server 8000
# or
npx serve
```

Open http://localhost:8000 in your browser.

### Step 4: Try It Out

1. Click "Example Route" button
2. Or enter: **University of Chicago** to **O'Hare Airport**
3. Click "Generate Songline"
4. Play audio, explore timeline, download quilt!

---

## 🌐 Deployment Options

### Option 1: GitHub Pages (Easiest)

```bash
# 1. Create a GitHub repo
git init
git add .
git commit -m "Initial commit: Chicago Songline Simulator"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/chicago-songline.git
git push -u origin main

# 2. Edit index.html line 130
# Replace YOUR_API_KEY_HERE with your actual key

# 3. Commit the change
git add index.html
git commit -m "Add production API key"
git push

# 4. Enable GitHub Pages
# Go to repo Settings > Pages
# Source: Deploy from main branch
# Visit: https://YOURUSERNAME.github.io/chicago-songline/
```

**Secure your API key:**
- Go to Google Cloud Console > Credentials
- Edit your API key
- Add website restriction: `https://YOURUSERNAME.github.io/*`

---

### Option 2: Netlify (Most Popular)

```bash
# 1. Install Netlify CLI (optional)
npm install -g netlify-cli

# 2. Deploy
netlify deploy --prod

# Or use drag-and-drop:
# - Go to https://app.netlify.com/drop
# - Drag your songlinesimulator folder
# - Done!
```

**With Environment Variables:**
```bash
# 1. Don't commit your API key to index.html
# 2. Use Netlify's build system to inject it
# 3. Create netlify.toml:
```

Create `netlify.toml`:
```toml
[build]
  command = "echo 'No build needed'"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Then use Netlify dashboard to set environment variable.

**Secure your API key:**
- Add website restriction: `https://YOUR-SITE.netlify.app/*`

---

### Option 3: Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd /Users/tobychan/songlinesimulator
vercel

# Follow prompts, it will deploy instantly
```

**Secure your API key:**
- Add website restriction: `https://YOUR-PROJECT.vercel.app/*`

---

### Option 4: Cloudflare Pages

```bash
# 1. Push to GitHub (see Option 1)
# 2. Go to https://pages.cloudflare.com/
# 3. Connect your GitHub repo
# 4. Deploy settings:
#    - Build command: (leave empty)
#    - Build output directory: /
# 5. Deploy!
```

**Secure your API key:**
- Add website restriction: `https://YOUR-PROJECT.pages.dev/*`

---

## 🔒 Security Best Practices

### For Production Deployment:

1. **Always restrict your API key by domain:**
   ```
   Go to Google Cloud Console
   → Credentials
   → Edit API Key
   → Application restrictions
   → HTTP referrers (web sites)
   → Add: yourdomain.com/*
   ```

2. **Set API quotas to prevent abuse:**
   - Go to API quotas page
   - Set daily limits (e.g., 1,000 requests/day for personal projects)

3. **Monitor usage:**
   - Check Google Cloud Console regularly
   - Set up billing alerts

### Why can't we use .env files?

Client-side apps (like this one) run entirely in the browser. The API key **must** be visible to the browser to work. A `.env` file can't hide it.

**Solution:** Domain restrictions! Your API key only works on your specified domains, so even if someone sees it, they can't use it on their site.

---

## 🧪 Testing Your Deployment

1. Open your deployed URL
2. Open browser DevTools (F12)
3. Check Console for errors
4. Test the example route
5. Verify all three outputs render (map, audio, quilt)
6. Test on mobile device

---

## 📊 Estimated Costs

Google Maps API has a **free tier**:
- **$200 free credit per month**
- Maps JavaScript API: $7 per 1,000 loads
- Directions API: $5 per 1,000 requests

**For personal use, this is FREE.**
Most projects stay well under the free tier limits.

---

## 🐛 Troubleshooting

### "This page can't load Google Maps correctly"
- Check your API key is correct
- Ensure Maps JavaScript API is enabled
- Check billing is enabled in Google Cloud (even for free tier)

### Map loads but route doesn't generate
- Ensure Directions API is enabled
- Check browser console for errors
- Verify addresses are in Chicago

### Local development works but deployment doesn't
- Did you update the API key in index.html line 130?
- Did you add domain restriction in Google Cloud Console?
- Check if restriction matches your deployment URL

---

## 🎯 Recommended Deployment

**For beginners:** GitHub Pages (simplest)
**For best experience:** Netlify (automatic HTTPS, fast CDN)
**For serverless features:** Vercel (if you add API routes later)

All three are **free** for personal projects!
