# Component Stress Advisor - Motive Labs MVP

A predictive maintenance application for Motive Labs that ranks fleet vehicles by component-stress score and recommends proactive service actions before failure.

## Overview

The Component Stress Advisor analyzes vehicle health data to identify maintenance risks before they cause breakdowns. It provides maintenance managers with:

- **Real-time risk assessment** across the entire fleet
- **Explainable scoring** showing why each vehicle is flagged
- **Component-level breakdown** for engine, transmission, brakes, and cooling systems
- **Actionable recommendations** with estimated service timelines
- **Confidence metrics** based on available data quality

## Current Status: Motive API Integration Ready

This app supports both demo mode (mock data) and live Motive integration:

- **Demo Mode**: Uses realistic mock data for local development and testing
- **Motive Dashboard**: Automatically connects to Motive Public APIs when embedded in the Motive Dashboard using postMessage authentication

## Features

### Fleet Risk Dashboard
- Color-coded risk levels: Critical (red), At Risk (yellow), Watch (green)
- Sortable by risk score, vehicle name, or estimated days to service
- Filterable by risk level
- Summary cards showing fleet-wide risk distribution

### Component Stress Scoring
- **Engine Score**: Based on fault codes, defects, utilization, and mileage patterns
- **Transmission Score**: Considers mileage, service history, and transmission-specific faults
- **Brake Score**: Weighs inspection defects and utilization intensity
- **Cooling Score**: Evaluates cooling-system fault codes and inspection findings

### Detailed Vehicle Analysis
- Contributing factors with plain-language explanations
- Recommended maintenance actions
- Estimated days until service needed
- Confidence percentage based on data completeness

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Inline styles (ready for design system integration)
- **Data Layer**: Adapter pattern (Mock → Motive API)
- **Hosting**: Vercel (approved for Motive Labs)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/danieldelvalle-crypto/danieldelvalle-crypto-motive-labs-apps.git
cd danieldelvalle-crypto-motive-labs-apps

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
├── src/
│   ├── adapters/
│   │   ├── MockDataAdapter.ts       # Mock data for MVP testing
│   │   └── MotiveDataAdapter.ts     # Placeholder for Motive API integration
│   ├── components/
│   │   ├── VehicleRiskDashboard.tsx # Main dashboard component
│   │   ├── VehicleCard.tsx          # Individual vehicle risk card
│   │   └── ScoreDetails.tsx         # Detailed score breakdown modal
│   ├── services/
│   │   └── StressScoreCalculator.ts # Component-stress scoring logic
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   ├── App.tsx                      # Root application component
│   ├── App.css                      # Global styles
│   └── main.tsx                     # Application entry point
├── public/                          # Static assets
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── DEPLOYMENT.md                    # Vercel deployment guide
└── README.md                        # This file
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

**Quick Deploy:**

1. Push to GitHub
2. Import project in Vercel dashboard
3. Vercel auto-detects Vite configuration
4. Deploy and verify

## Motive Integration

### Authentication Flow

When embedded in the Motive Dashboard:

1. **App loads** as a publicly accessible shell at the Vercel URL
2. **Motive Dashboard** embeds the app in an iframe
3. **Dashboard sends JWT** via postMessage: `{ type: 'SET_TOKEN', token: '<jwt>' }`
4. **App validates token** and stores it for API calls
5. **App switches** from MockDataAdapter to MotiveDataAdapter
6. **API calls** use the token: `Authorization: Bearer <token>`

### Public API Endpoints Used

- `GET /v1/vehicles` - List all vehicles in fleet
- `GET /v1/vehicles/{id}` - Get vehicle details, mileage, engine hours
- `GET /v1/fault_codes?vehicle_id={id}` - Get diagnostic trouble codes
- `GET /v1/inspection_reports?vehicle_id={id}` - Get DVIR inspection results
- `GET /v1/vehicle_stats/{id}` - Get utilization metrics

See `src/adapters/MotiveDataAdapter.ts` for implementation details.

### Testing Motive Integration

**Local Development (Demo Mode)**:
```bash
npm run dev
```
Automatically uses MockDataAdapter with synthetic data.

**Testing with Motive Dashboard**:
1. Deploy to Vercel
2. Register app in Motive Labs
3. Open app from Motive Dashboard
4. App receives token via postMessage and connects to live APIs

## Roadmap

### Phase 1: MVP ✅ Complete
- ✅ Mock data adapter
- ✅ Component-stress scoring algorithm
- ✅ Fleet risk dashboard
- ✅ Detailed vehicle analysis view
- ✅ Vercel deployment configuration

### Phase 2: Motive Integration ✅ Complete
- ✅ Motive authentication handshake (JWT via postMessage)
- ✅ Implement MotiveDataAdapter with Public APIs
- ✅ Integrate Vehicles, Diagnostics, Inspections APIs
- ⏳ Test with real fleet data (pending Labs registration)
- ⏳ Handle API rate limits and errors (pending real-world usage)

### Phase 3: Enhanced Scoring
- [ ] Request access to additional telemetry data
- [ ] Add route profile analysis (if API available)
- [ ] Implement peer baseline comparison
- [ ] Add seasonal adjustments
- [ ] Machine learning model for failure prediction

### Phase 4: Workflow Integration
- [ ] Draft work order creation (read-only recommendation → write action)
- [ ] Parts availability check
- [ ] Integration with Motive Maintenance workflows
- [ ] Manager approval queue
- [ ] Success metrics tracking

## Known Limitations

### Current MVP Limitations
- Uses mock data only (no live Motive connection)
- No authentication or user management
- Static scoring algorithm (not trained on historical data)
- No work order creation or update capabilities

### Motive API Gaps
Based on internal documentation as of 2026-09-23:

- **Raw sensor time-series not available**: RPM, coolant pressure, exhaust temperature, battery voltage time-series are not exposed through Motive Public APIs
- **Purchase order permissions unclear**: Parts ordering is a roadmap item; write access needs verification
- **Work order write access**: Requires permission validation before enabling automatic work order creation

These gaps are documented in `src/adapters/MotiveDataAdapter.ts` and should be revisited as Motive's Vehicle Health Intelligence APIs evolve.

## Architecture Decisions

### Adapter Pattern
The data layer uses an adapter interface to decouple the scoring logic from the data source. This allows:
- MVP development with mock data
- Easy swap to Motive APIs when ready
- Future integration with multiple data sources
- Simplified testing

### Component-Specific Scores
Rather than a single black-box "risk score," the system calculates separate scores for engine, transmission, brakes, and cooling. This provides:
- Explainable results for maintenance managers
- Component-specific service recommendations
- Clear attribution of contributing factors

### Read-Only First
The MVP is intentionally read-only to validate the decision experience before introducing write actions. This:
- Reduces security and permission complexity
- Allows faster stakeholder feedback
- Prevents accidental work order creation during testing
- Aligns with Motive Labs approval process

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally with `npm run dev`
4. Build and verify with `npm run build && npm run preview`
5. Submit a pull request

## License

Internal Motive project - not for external distribution

## Contact

- **Developer**: Daniel Del Valle
- **Repository**: https://github.com/danieldelvalle-crypto/danieldelvalle-crypto-motive-labs-apps
