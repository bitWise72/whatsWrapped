# Deployment Information

## GitHub Repository
- **Repository**: https://github.com/bitWise72/whatsWrapped
- **Branch**: main

## Vercel Deployment

### Setup Instructions

The project is configured for automatic deployment via Vercel.

#### Option 1: Automatic Deployment (Recommended)

1. Go to [Vercel Dashboard](https://vercel.app/dashboard)
2. Click "New Project"
3. Import the GitHub repository: `https://github.com/bitWise72/whatsWrapped`
4. Vercel will auto-detect the Vite configuration
5. Click "Deploy"

#### Option 2: Manual Deployment with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project root
cd whatsWrapped

# Deploy to production
vercel --prod
```

### Environment Variables

No environment variables are required for the basic deployment. However, for AI-powered features:

- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key
- `VITE_SUPABASE_URL` - Supabase URL

### Build Configuration

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18+ (automatically detected by Vercel)

### Deployment Success

Once deployed, your application will be available at:
- Default: `https://<project-name>.vercel.app`
- Custom Domain: Configure via Vercel Dashboard > Settings > Domains

## Development

To test locally before deployment:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Performance

Current bundle size: ~652 KB (production build)

### Optimization Tips

1. **Dynamic Imports**: Consider code-splitting large components
2. **Image Optimization**: Compress demo screenshots
3. **Tree Shaking**: Ensure unused dependencies are removed

## Monitoring & Maintenance

### Vercel Analytics
- Monitor deployment performance at Vercel Dashboard
- Check build times and performance metrics
- Review analytics for traffic patterns

### Git Workflow
- Main branch deployments trigger automatic Vercel builds
- Preview deployments for pull requests are created automatically
- Use GitHub Actions for additional CI/CD if needed

## Troubleshooting Deployment

### Build Failures
1. Check Vercel logs for detailed error messages
2. Ensure all environment variables are configured
3. Verify Node.js version compatibility

### Runtime Errors
1. Check browser console for client-side errors
2. Review Vercel Function logs for server-side issues
3. Ensure all dependencies are in package.json

### Slow Performance
1. Analyze bundle size: `npm run build`
2. Check lighthouse reports in Vercel Analytics
3. Consider enabling Compression in Vercel settings

---

**Last Updated**: December 26, 2025
