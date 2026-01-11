# Netlify Deployment Guide

## Important: Remove Next.js Plugin

**CRITICAL**: This is a Vite + React app, NOT a Next.js app. You must remove the Next.js plugin from Netlify UI:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Plugins**
3. Find `@netlify/plugin-nextjs` and **uninstall/disable** it

## Build Configuration

The project is configured for Netlify deployment with:

- **Build command**: `npm ci && npm run build`
- **Publish directory**: `dist`
- **Node version**: 20 (specified in `.nvmrc`)

## Files Created

- `netlify.toml` - Main Netlify configuration
- `_redirects` - Backup SPA routing (all routes → index.html)
- `.nvmrc` - Node version specification

## Build Output

The build creates optimized chunks:
- `react-vendor.js` - React, React DOM, React Router
- `ui-vendor.js` - Framer Motion, Lucide Icons
- `index.js` - Application code

## After Deployment

1. Remove the Next.js plugin from Netlify UI (if not already done)
2. Commit and push all changes
3. Netlify will automatically rebuild
4. Verify the site works with client-side routing

