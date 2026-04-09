# Deployment Guide - Chicago Songline Simulator

This guide will help you deploy the Chicago Songline Simulator to various hosting platforms.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Google Maps API key is configured
- [ ] All files are present (index.html, style.css, script.js)
- [ ] Application has been tested locally
- [ ] README.md is up to date
- [ ] No sensitive data or test API keys are committed

## Deployment Options

### Option 1: GitHub Pages (Recommended for Beginners)

GitHub Pages is free, easy to set up, and integrates seamlessly with Git.

#### Steps:

1. **Create a GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Chicago Songline Simulator v1.0.0"
   git branch -M main
   git remote add origin https://github.com/yourusername/chicago-songline-simulator.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings" > "Pages"
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be available at: `https://yourusername.github.io/chicago-songline-simulator/`

3. **Update API Key**
   - For security, consider using environment variables or a separate config
   - Or add your domain to API key restrictions in Google Cloud Console

#### Pros:
- Free hosting
- Automatic HTTPS
- Easy updates via Git push
- Good for portfolios

#### Cons:
- Public repositories only (unless paid)
- Limited to static sites

---

### Option 2: Netlify

Netlify offers excellent performance, custom domains, and automatic deployments.

#### Steps:

1. **Create account** at [netlify.com](https://www.netlify.com/)

2. **Deploy via Drag & Drop:**
   - Zip your project folder (exclude .git if present)
   - Drag and drop to Netlify dashboard
   - Your site goes live immediately

3. **Deploy via Git (Recommended):**
   - Push your code to GitHub/GitLab/Bitbucket
   - In Netlify, click "New site from Git"
   - Connect your repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `.` or `/`
   - Click "Deploy site"

4. **Environment Variables (Optional):**
   - Go to Site settings > Build & deploy > Environment
   - Add `GOOGLE_MAPS_API_KEY` variable
   - Update script.js to read from environment (requires build step)

5. **Custom Domain (Optional):**
   - Go to Domain settings
   - Add your custom domain
   - Update DNS records as instructed

#### Pros:
- Free tier with generous limits
- Automatic HTTPS
- Continuous deployment from Git
- Built-in CDN
- Great performance

#### Cons:
- Build minutes limited on free tier (though not needed for this project)

---

### Option 3: Vercel

Similar to Netlify, with excellent Next.js integration (though not needed here).

#### Steps:

1. **Create account** at [vercel.com](https://vercel.com/)

2. **Deploy:**
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel` in project directory
   - Follow prompts
   - Or connect GitHub repo via Vercel dashboard

3. **Configure:**
   - Automatic HTTPS
   - Custom domains available
   - Environment variables in dashboard

#### Pros:
- Extremely fast CDN
- Free tier
- Great developer experience

#### Cons:
- Primarily focused on Next.js (though works fine with vanilla JS)

---

### Option 4: Traditional Web Hosting (cPanel, etc.)

For traditional shared hosting with FTP access.

#### Steps:

1. **Prepare files:**
   - Ensure all files are in a single folder
   - Test that index.html opens correctly

2. **Upload via FTP:**
   - Connect to your hosting via FTP client (FileZilla, etc.)
   - Navigate to `public_html` or `www` directory
   - Upload all files

3. **Test:**
   - Visit your domain
   - Verify all features work
   - Check browser console for errors

#### Pros:
- Full control
- Can use existing hosting
- No vendor lock-in

#### Cons:
- Manual deployment process
- May need to configure HTTPS separately

---

### Option 5: Cloudflare Pages

Free static site hosting with Cloudflare's global CDN.

#### Steps:

1. **Create Cloudflare account**

2. **Deploy:**
   - Go to Pages dashboard
   - Connect Git repository or upload directly
   - Configure build settings (none needed)
   - Deploy

3. **Benefits:**
   - Cloudflare's fast CDN
   - Free SSL
   - DDoS protection

---

## Post-Deployment Steps

### 1. Verify API Key Security

**Important:** Secure your Google Maps API key!

In Google Cloud Console:
1. Go to Credentials
2. Edit your API key
3. Add "Website restrictions"
4. Add your deployed domain(s):
   ```
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   ```
5. Under "API restrictions", select "Restrict key"
6. Choose only "Maps JavaScript API" and "Directions API"

### 2. Test All Features

Visit your deployed site and test:
- [ ] Map loads correctly
- [ ] Route generation works
- [ ] Audio plays
- [ ] Timeline renders
- [ ] Quilt generates and downloads
- [ ] All buttons function
- [ ] Mobile responsive layout works
- [ ] No console errors

### 3. Set Up Analytics (Optional)

Add Google Analytics or similar to track usage:

```html
<!-- Add before closing </head> tag in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

### 4. Add Custom Domain (Optional)

Most platforms support custom domains:

1. Purchase domain from registrar (Namecheap, Google Domains, etc.)
2. In hosting platform, add custom domain
3. Update DNS records:
   - For GitHub Pages: A records to GitHub IPs
   - For Netlify/Vercel: CNAME to their domain
4. Wait for DNS propagation (up to 48 hours)

### 5. Enable HTTPS

All modern platforms enable HTTPS automatically. If using traditional hosting:

1. Get SSL certificate (Let's Encrypt via cPanel, or purchase)
2. Install certificate
3. Force HTTPS redirect in .htaccess:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST%}%{REQUEST_URI} [L,R=301]
```

---

## Performance Optimization

### Optional Enhancements:

1. **Minify JavaScript:**
   ```bash
   # Using terser
   npm install -g terser
   terser script.js -o script.min.js -c -m
   ```
   Update index.html to use script.min.js

2. **Minify CSS:**
   ```bash
   # Using cssnano
   npm install -g cssnano-cli
   cssnano style.css style.min.css
   ```
   Update index.html to use style.min.css

3. **Add Caching Headers:**
   
   For Apache (.htaccess):
   ```apache
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType application/javascript "access plus 1 year"
   </IfModule>
   ```

4. **Compress Assets:**
   Most CDN platforms (Netlify, Vercel, Cloudflare) handle this automatically.

---

## Continuous Deployment Workflow

For Git-based deployments (GitHub Pages, Netlify, Vercel):

### Making Updates:

1. **Make changes locally**
   ```bash
   # Edit files
   git add .
   git commit -m "Description of changes"
   ```

2. **Test locally**
   ```bash
   # Use simple HTTP server
   python -m http.server 8000
   # Test at http://localhost:8000
   ```

3. **Deploy**
   ```bash
   git push origin main
   # Site updates automatically!
   ```

### Rollback (if needed):

```bash
# Find commit to rollback to
git log

# Rollback
git revert <commit-hash>
git push origin main
```

---

## Troubleshooting Deployment Issues

### Issue: Map doesn't load on deployed site

**Cause:** API key not configured or restricted incorrectly

**Solution:**
1. Check API key in index.html
2. Verify domain is added to restrictions in Google Cloud Console
3. Check browser console for specific error

### Issue: Mixed content errors (HTTP/HTTPS)

**Cause:** Loading resources over HTTP on HTTPS site

**Solution:**
- Ensure all resources use HTTPS or protocol-relative URLs
- Google Maps API should use `https://maps.googleapis.com...`

### Issue: 404 errors on refresh

**Cause:** Not applicable to this single-page app, but common issue

**Solution:**
- For GitHub Pages, no action needed
- For others, configure server to serve index.html for all routes

### Issue: Fonts or styles not loading

**Cause:** Path issues or CORS

**Solution:**
- Verify all paths are relative (not absolute)
- Check browser network tab for failed requests
- Ensure all files uploaded correctly

### Issue: API quota exceeded

**Cause:** Too many requests to Google Maps API

**Solution:**
1. Check usage in Google Cloud Console
2. Increase quota limits (may require billing)
3. Add API key restrictions to prevent abuse
4. Consider caching routes (requires backend)

---

## Monitoring & Maintenance

### Monitor API Usage:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Dashboard"
3. Check "Maps JavaScript API" and "Directions API" usage
4. Set up budget alerts to prevent surprise charges

### Update Dependencies:

This project has no npm dependencies, but if you add any:

```bash
npm update
npm audit fix
git commit -am "Update dependencies"
git push
```

### Keep API Keys Secure:

- Never commit API keys to public repositories
- Rotate keys periodically
- Use restrictions to limit abuse
- Monitor usage for anomalies

---

## Sharing Your Deployment

### Social Media:

Share your deployment with:

**Twitter/X:**
```
Just deployed the Chicago Songline Simulator! 🎵🗺️🎨
Transform transit routes into generative art.
Try it: [your-url]
#GenerativeArt #WebAudio #Chicago #CTA
```

**LinkedIn:**
```
Excited to share my latest project: Chicago Songline Simulator

A web app that transforms Chicago transit routes into multi-sensory experiences:
• Generative audio compositions
• Interactive timeline visualizations  
• Downloadable quilt patterns

Built with vanilla JavaScript, Web Audio API, and Google Maps.

Try it: [your-url]
```

### Portfolio:

Add to your portfolio with:
- Screenshots or GIFs of the interface
- Link to live demo
- Link to GitHub repository
- Description of technologies used
- Explanation of the songlines concept

---

## Advanced: Custom Backend (Optional)

If you want to add features requiring a backend:

### Why you might need a backend:
- Save/share routes via unique URLs
- User accounts and favorites
- Route caching to reduce API calls
- Analytics and usage tracking
- Comment/rating system

### Quick backend options:
- **Serverless functions**: Netlify Functions, Vercel Functions, AWS Lambda
- **Firebase**: For database and authentication
- **Supabase**: Open-source Firebase alternative
- **Simple Node.js**: Express + MongoDB

### Example: Shareable route URLs with serverless function

Create `netlify/functions/save-route.js`:
```javascript
exports.handler = async (event) => {
  // Save route data to database
  // Return unique ID
  // Client can share: yoursite.com?route=abc123
};
```

---

## Deployment Checklist

Before going live:

- [ ] API key configured and restricted
- [ ] All features tested in production
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Analytics set up (optional)
- [ ] README updated with live URL
- [ ] Open Graph meta tags set correctly
- [ ] Favicons added (optional)
- [ ] 404 page created (optional)
- [ ] Legal pages if needed (Privacy Policy, etc.)

---

## Resources

- [GitHub Pages Documentation](https://pages.github.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Google Maps API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Web.dev Performance Guide](https://web.dev/performance/)

---

## Support

If you encounter issues during deployment:

1. Check browser console for errors
2. Review this guide's troubleshooting section
3. Check hosting platform's documentation
4. Open an issue on GitHub (if applicable)

---

**Ready to deploy?** Choose your platform and follow the steps above. Good luck! 🚀

**Deployed your site?** Don't forget to update the README.md with your live URL!
