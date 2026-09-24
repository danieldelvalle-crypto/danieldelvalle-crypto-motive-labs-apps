# Deploying Component Stress Advisor to Vercel

This guide walks you through deploying the Component Stress Advisor MVP to Vercel and configuring it for Motive Labs.

## Prerequisites

1. **Vercel Account Access**: You must have access to the Motive Vercel organization. Request access through Lumos or IT if needed.
2. **GitHub Repository**: This repository should already be connected to GitHub at `danieldelvalle-crypto/danieldelvalle-crypto-motive-labs-apps`.
3. **Motive Labs Review**: Vercel domains must be allowlisted for Labs review (reference: Motive Labs TDD).

## Step 1: Import Project to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and select: `danieldelvalle-crypto/danieldelvalle-crypto-motive-labs-apps`
5. Click **"Import"**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the project root
cd /path/to/danieldelvalle-crypto-motive-labs-apps
vercel
```

## Step 2: Configure Build Settings

When prompted or in the Vercel project settings:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Step 3: Deploy

1. Click **"Deploy"** in the Vercel dashboard
2. Wait for the build to complete (typically 1-3 minutes)
3. Vercel will provide a deployment URL: `https://your-project.vercel.app`

## Step 4: Verify Deployment

1. Visit the deployment URL
2. Confirm the Component Stress Advisor dashboard loads
3. Verify that:
   - All 5 mock vehicles display
   - Risk counts (Critical, At Risk, Watch) are correct
   - Clicking a vehicle card opens the detailed view
   - Sorting and filtering work properly

## Step 5: Register with Motive Labs

Once deployed and verified, register the app with Motive Labs:

### Required Information

- **App Name**: Component Stress Advisor
- **App URL**: Your Vercel deployment URL (e.g., `https://component-stress-advisor.vercel.app`)
- **Description**: Predictive maintenance risk scoring that ranks vehicles by component-stress and recommends service actions before failure
- **Category**: Maintenance
- **Owner**: [Your name/team]
- **Target Accounts**: [Specify pilot fleet or account]
- **Review Date**: [Target date for Labs review]

### Motive Labs Approval Process

According to Motive Labs architecture:

1. Submit app registration with the Vercel URL
2. Labs team will verify:
   - Approved hosting platform (Vercel is allowlisted)
   - GitHub-backed review flow
   - Public API usage only
   - Security and privacy compliance
3. Once approved, the app can be embedded in the Motive Dashboard

## Step 6: Configure Motive Authentication (Future)

**Note**: The current MVP uses mock data and does not require Motive authentication. When ready to connect to real Motive APIs:

1. Implement the authentication handshake in the app:
   - Listen for `postMessage` from Motive Dashboard
   - Extract and validate the short-lived JWT
   - Pass the token to `MotiveDataAdapter.setAuthToken()`

2. Replace `MockDataAdapter` with `MotiveDataAdapter` in:
   - `src/components/VehicleRiskDashboard.tsx`

3. Configure API base URL as a Vercel environment variable:
   ```bash
   VITE_MOTIVE_API_BASE_URL=https://api.gomotive.com/v1
   ```

## Environment Variables

Currently no environment variables are required for the MVP. For production:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_MOTIVE_API_BASE_URL` | Motive Public API base URL | `https://api.gomotive.com/v1` |
| `VITE_APP_MODE` | App mode (mock or production) | `mock` or `production` |

To add environment variables in Vercel:

1. Go to your Vercel project settings
2. Navigate to **"Settings"** → **"Environment Variables"**
3. Add the variable name and value
4. Click **"Save"**
5. Redeploy the application

## Continuous Deployment

Vercel automatically deploys:

- **Production**: Every push to the `main` branch
- **Preview**: Every push to feature branches or pull requests

Each preview deployment gets a unique URL for testing before merging.

## Monitoring and Debugging

- **Deployment Logs**: Available in Vercel dashboard under "Deployments"
- **Runtime Logs**: Available under "Functions" in Vercel dashboard
- **Analytics**: Enable Vercel Analytics for usage metrics

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Verify Node.js version compatibility (Vercel uses Node 18 by default)
- Review build logs in Vercel dashboard

### App Doesn't Load

- Check browser console for errors
- Verify the build output directory is set to `dist`
- Ensure all static assets are correctly referenced

### Mock Data Not Showing

- Verify that `MockDataAdapter` is being used
- Check browser console for API errors
- Confirm the app is loading successfully (white screen vs. error screen)

## Next Steps

After successful deployment:

1. Share the Vercel URL with stakeholders for feedback
2. Plan the transition from mock data to Motive Public APIs
3. Verify API access and required permissions
4. Implement Motive authentication handshake
5. Test with real fleet data in a staging environment
6. Submit for Labs security and privacy review

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Motive Labs TDD**: Internal Google Doc (reference in enterprise context)
- **Project Issues**: GitHub repository issues
