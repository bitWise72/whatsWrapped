# 🚀 WhatsWrapped - Vercel Deployment Instructions

## Quick Links

- **GitHub Repository**: https://github.com/bitWise72/whatsWrapped
- **Live Demo**: https://whats-wrapped.vercel.app (coming soon)
- **Vercel Dashboard**: https://vercel.app/dashboard

---

## Deployment Methods

### Method 1: Automatic Deployment via Vercel Dashboard (Recommended)

This is the easiest method and requires no CLI setup.

#### Steps:

1. **Go to Vercel Dashboard**
   - Visit https://vercel.app/dashboard
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project" button
   - Select "Import Git Repository"

3. **Import GitHub Repository**
   - Paste: `https://github.com/bitWise72/whatsWrapped`
   - Or search for and select the repository from your GitHub account

4. **Configure Project Settings**
   ```
   Project Name: whats-wrapped (or your preference)
   Framework: Vite (auto-detected ✓)
   Root Directory: ./ (auto-detected ✓)
   Build Command: npm run build (auto-detected ✓)
   Output Directory: dist (auto-detected ✓)
   ```

5. **Set Environment Variables**
   - Click "Environment Variables"
   - Add the following (optional, for Supabase integration):
     ```
     VITE_SUPABASE_PROJECT_ID = vhrwiyqozpcxuiqnuyos
     VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     VITE_SUPABASE_URL = https://vhrwiyqozpcxuiqnuyos.supabase.co
     ```

6. **Deploy**
   - Click "Deploy" button
   - Wait for build to complete (usually 2-3 minutes)
   - View live URL when ready!

**Result**: Your app will be live at `https://<project-name>.vercel.app`

---

### Method 2: Deployment via Vercel CLI

For more control and faster deployments during development.

#### Prerequisites:
```bash
# Install Vercel CLI globally
npm install -g vercel

# Or if using npm 7+:
npm i -g vercel@latest
```

#### Authentication:
```bash
# Login to Vercel (opens browser)
vercel login

# Verify authentication
vercel whoami
```

#### Deployment:

**First-time deployment:**
```bash
cd c:\Users\Sayan\whatwrapped
vercel

# Answer prompts:
# ? Set up and deploy? › yes
# ? Which scope? › Your team/account
# ? Link to existing project? › no
# ? Project name? › whats-wrapped
# ? Directory? › ./
# ? Auto-detected settings ok? › yes
# ? Deploy? › yes
```

**Production deployment:**
```bash
vercel --prod
```

**Production deployment (shorthand):**
```bash
vercel -p
```

---

### Method 3: GitHub Integration (Automatic CI/CD)

Once connected to Vercel, every push to the main branch auto-deploys!

#### Setup:

1. Deploy once using Method 1 or 2
2. Vercel automatically integrates with your GitHub repo
3. Enable "Automatic Deployments" in Vercel Project Settings
4. Every commit to `main` triggers a production deployment
5. Pull requests get automatic preview deployments

#### Workflow:
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your project
# 3. Deploys to production
# 4. Shows status on GitHub
```

---

## Post-Deployment Configuration

### Custom Domain (Optional)

1. **Go to Project Settings**
   - Vercel Dashboard > WhatsWrapped > Settings > Domains

2. **Add Custom Domain**
   - Click "Add Domain"
   - Enter your domain (e.g., `whats-wrapped.com`)

3. **Configure DNS**
   - Update your domain registrar's DNS settings
   - Vercel will provide the DNS records
   - Wait for DNS propagation (5-48 hours)

### Environment Variables in Production

1. **Set Variables**
   - Project Settings > Environment Variables
   - Add each variable for Production
   - Save changes

2. **Redeploy if Needed**
   - If variables changed: `vercel --prod`
   - Or manually trigger redeploy in Vercel Dashboard

### Analytics & Monitoring

1. **Enable Web Analytics**
   - Project Settings > Analytics
   - Toggle "Web Analytics"
   - View dashboard for traffic insights

2. **Check Deployment Logs**
   - Deployments tab for build logs
   - Function logs for server errors
   - Analytics for performance metrics

---

## Build & Test Locally

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8080 in browser

# Test production build
npm run build
npm run preview

# Open http://localhost:4173 in browser
```

---

## Troubleshooting

### Build Fails

**Check:**
1. Vercel build logs for specific errors
2. Node version compatibility (18+ required)
3. All environment variables are set
4. No git conflicts or uncommitted changes

**Solution:**
```bash
# Rebuild locally
npm install
npm run build

# Check for errors
npm run lint

# Push fixes
git add .
git commit -m "Fix build issues"
git push origin main
```

### Deployment Hangs

**Check:**
1. Build logs in Vercel Dashboard
2. GitHub Actions status
3. Node version and cache

**Solution:**
```bash
# Clear cache and redeploy
# In Vercel Dashboard:
# Deployments > Latest > Redeploy (with cache cleared)
```

### Environment Variables Not Working

**Check:**
1. Variables are set in correct environment (Production)
2. Variable names match exactly (case-sensitive)
3. Redeployed after setting variables

**Solution:**
```bash
# Redeploy after changing variables
vercel --prod
```

### Custom Domain Not Working

**Check:**
1. DNS propagation (can take up to 48 hours)
2. DNS records are correct in registrar
3. Domain verified in Vercel

**Solution:**
1. Wait for DNS propagation
2. Use DNS lookup tool: `nslookup whats-wrapped.com`
3. Re-verify domain in Vercel if needed

---

## Git Workflow

### Clone Existing Project (for Team Members)

```bash
git clone https://github.com/bitWise72/whatsWrapped.git
cd whatsWrapped
npm install
npm run dev
```

### Make Changes and Deploy

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Test locally: npm run dev

# Commit changes
git add .
git commit -m "Add your feature description"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request on GitHub
# (Vercel automatically creates preview deployment)

# After PR approval, merge to main
# (Vercel automatically deploys to production)
```

### Branch Protection (Optional)

Enable in GitHub Settings:
- Require status checks to pass (Vercel checks)
- Require approval before merging
- Dismiss stale reviews

---

## Monitoring & Analytics

### Vercel Dashboard

- **Overview**: Build time, deployment status, edge middleware
- **Deployments**: View each deployment's details and logs
- **Analytics**: Traffic, performance, browser stats
- **Settings**: Environment variables, custom domains, functions

### Performance Optimization

Current metrics:
- Build Time: ~5 seconds
- Bundle Size: ~720 KB (gzipped: ~211 KB)
- Lighthouse Score: ~90-95

Recommendations:
1. Enable "Automatic ISR" for static content
2. Use image optimization for demos
3. Configure edge caching headers
4. Monitor Core Web Vitals

---

## Rollback (If Needed)

### Revert to Previous Deployment

1. **Via Vercel Dashboard**
   - Deployments tab
   - Click on previous successful deployment
   - Click "Redeploy"

2. **Via Git**
   ```bash
   # Find commit to revert to
   git log --oneline -10
   
   # Revert commit
   git revert <commit-hash>
   git push origin main
   
   # Vercel auto-deploys the revert
   ```

---

## Key Files Reference

### Configuration
- `vercel.json` - Vercel deployment config
- `vite.config.ts` - Vite build configuration
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variables template

### Documentation
- `README.md` - Complete user guide
- `DEPLOYMENT.md` - Detailed deployment steps
- `SETUP_SUMMARY.md` - Project setup summary
- This file: Quick deployment guide

---

## Next Steps

1. ✅ **Code Ready**: GitHub repository is set up
2. 📋 **Choose Deployment Method**: Pick Method 1, 2, or 3
3. 🚀 **Deploy**: Follow the chosen method's steps
4. ✨ **Share**: Get your live URL and share with the world!
5. 📊 **Monitor**: Use Vercel Dashboard to monitor performance

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vite Guide**: https://vitejs.dev/
- **React Docs**: https://react.dev
- **GitHub Issues**: https://github.com/bitWise72/whatsWrapped/issues

---

**Ready to Deploy?** Choose your method above and get started! 🎉

Last Updated: December 26, 2025
