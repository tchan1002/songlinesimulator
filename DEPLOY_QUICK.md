# 🚀 Quick Deploy Commands

## GitHub Pages (2 minutes)

```bash
# 1. Add your API key to index.html line 130
# 2. Create repo and push
git init
git add .
git commit -m "Chicago Songline Simulator v1.0"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/chicago-songline.git
git push -u origin main

# 3. Enable GitHub Pages in repo Settings > Pages
# Done! Visit: https://YOURUSERNAME.github.io/chicago-songline/
```

**Secure your key:** Google Cloud Console > API Key > Add restriction: `https://YOURUSERNAME.github.io/*`

---

## Netlify (30 seconds)

```bash
# Drag & drop method:
# 1. Edit index.html line 130 (add your API key)
# 2. Go to: https://app.netlify.com/drop
# 3. Drag your songlinesimulator folder
# Done! Get instant URL

# Or CLI method:
npm install -g netlify-cli
netlify deploy --prod
# Follow prompts
```

**Secure your key:** Google Cloud Console > API Key > Add restriction: `https://*.netlify.app/*`

---

## Vercel (1 minute)

```bash
npm install -g vercel
cd /Users/tobychan/songlinesimulator
# Edit index.html line 130 first!
vercel
# Answer prompts, get instant deployment
```

**Secure your key:** Google Cloud Console > API Key > Add restriction: `https://*.vercel.app/*`

---

## Test Locally First

```bash
cd /Users/tobychan/songlinesimulator

# Create config.js from example
cp config.example.js config.js
# Edit config.js and add your key

# Start local server
python3 -m http.server 8000

# Visit: http://localhost:8000
# Try "Example Route" button
```

---

## What You Need

1. **Google Maps API Key** (free)
   - Get it: https://console.cloud.google.com/
   - Enable: Maps JavaScript API + Directions API
   
2. **Your key in the right place:**
   - **Local dev:** config.js (gitignored)
   - **Production:** index.html line 130

3. **Domain restriction:** (after deploying)
   - Prevents API key theft
   - Only works on your domains

---

## Pro Tips

✅ **Test locally first** before deploying
✅ **Set API quotas** (1000 requests/day is plenty)
✅ **Use domain restrictions** (never skip this!)
✅ **Monitor usage** in Google Cloud Console
❌ **Don't commit config.js** (it's gitignored)
❌ **Don't share your API key** publicly

---

## Need Help?

Check **SETUP.md** for detailed instructions and troubleshooting.
