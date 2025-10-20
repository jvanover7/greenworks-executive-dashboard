# Greenworks Executive Dashboard

A beautiful, modern, and interactive executive dashboard built with React, TypeScript, and Tailwind CSS. Features real-time metrics, drill-down analytics, and AI-powered insights.

## Features

### Interactive KPI Cards
- **Total Calls** - Track all incoming calls with trends
- **Missed Calls** - Monitor missed opportunities
- **Sales Opportunities** - View pipeline and conversion rates
- **Inspections** - Track inspection metrics and quality scores
- **Bot Calls** - Monitor AI call handling performance
- **Customer Satisfaction** - Real-time satisfaction scores

### Drill-Down Analytics
Click on any metric card to see detailed breakdowns:
- Call sources and distribution
- Missed call analysis and reasons
- Sales pipeline and revenue potential
- Conversion funnel metrics
- Inspection category performance
- Bot intent analysis

### Advanced Visualizations
- **Line Charts** - Trend analysis over time
- **Bar Charts** - Category comparisons
- **Pie Charts** - Distribution analysis
- **Area Charts** - Volume patterns
- **Real-time Updates** - Auto-refresh every 30 seconds

### AI Assistant
Powered by Claude, ask questions like:
- "What's my call performance this week?"
- "Show me inspection trends"
- "How are bot calls performing?"
- "What are my top sales opportunities?"

### Data Integration
- **REST APIs** - Connect to any REST API endpoint
- **MCP Servers** - Use Model Context Protocol for advanced integrations
- **Supabase** - Built-in authentication and database
- **Real-time Sync** - Automatic data updates

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Authentication**: Supabase
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/greenworks-executive-dashboard.git
cd greenworks-executive-dashboard
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_APP_SUPABASE_URL=your-supabase-url
VITE_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Open your browser**:
```
http://localhost:5273
```

## Data Sources

### Option 1: REST API

Configure API endpoints in `.env`:
```env
VITE_API_BASE_URL=https://your-api.com/api
```

The dashboard will automatically fetch from:
- `/api/metrics` - All metrics
- `/api/metrics/calls` - Call data
- `/api/metrics/inspections` - Inspection data
- `/api/metrics/bot-calls` - Bot call data

### Option 2: MCP Server

Use Model Context Protocol for advanced integrations:

1. **Start the example MCP server**:
```bash
cd mcp-server-example
npm install
npm start
```

2. **Configure MCP in `.env`**:
```env
VITE_MCP_SERVER_URL=http://localhost:3001
```

See [MCP_INTEGRATION.md](docs/MCP_INTEGRATION.md) for detailed setup.

### Option 3: Direct Integration

Modify `src/utils/api.ts` to connect directly to your systems:
- Twilio for call data
- Salesforce for CRM data
- Custom databases
- Third-party APIs

## Project Structure

```
greenworks-executive-dashboard/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Card.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   └── DrillDownPanel.tsx
│   │   ├── Dashboard.tsx          # Main dashboard with KPIs
│   │   ├── InspectionsView.tsx    # Inspection analytics
│   │   ├── BotCallsView.tsx       # Bot call analytics
│   │   ├── ClaudeChat.tsx         # AI assistant
│   │   ├── Navigation.tsx         # Sidebar navigation
│   │   └── Authentication.tsx     # Login/signup
│   ├── utils/
│   │   ├── api.ts                 # API client
│   │   └── mcp.ts                 # MCP integration
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── docs/
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── MCP_INTEGRATION.md         # MCP integration guide
├── mcp-server-example/            # Example MCP server
│   ├── index.js
│   └── package.json
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Customization

### Adding New Metrics

1. **Add metric to Dashboard.tsx**:
```tsx
<MetricCard
  title="Your Metric"
  value={yourValue}
  change={12.5}
  icon={YourIcon}
  iconColor="text-blue-500"
  onClick={() => setDrillDownType('your-metric')}
/>
```

2. **Add drill-down panel**:
```tsx
<DrillDownPanel
  isOpen={drillDownType === 'your-metric'}
  onClose={() => setDrillDownType(null)}
  title="Your Metric Details"
>
  <DrillDownSection title="Details">
    <DrillDownItem label="Detail 1" value="Value 1" />
  </DrillDownSection>
</DrillDownPanel>
```

### Styling

All styling uses Tailwind CSS. Key classes:
- `glass-card` - Glassmorphism effect
- `metric-card` - KPI card styling
- `btn-primary` - Primary button
- `btn-secondary` - Secondary button

Customize colors in `tailwind.config.js`.

### Charts

Uses Recharts. Examples in:
- `InspectionsView.tsx` - Line, Bar, Pie charts
- `BotCallsView.tsx` - Area, Bar charts

## Deployment

### Deploy to Supabase

```bash
npm run build
supabase deploy
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## Environment Variables

Required:
- `VITE_APP_SUPABASE_URL` - Your Supabase project URL
- `VITE_APP_SUPABASE_ANON_KEY` - Your Supabase anon key

Optional:
- `VITE_API_BASE_URL` - API endpoint base URL
- `VITE_MCP_SERVER_URL` - MCP server URL
- `VITE_MCP_AUTH_TOKEN` - MCP authentication token

## Features Roadmap

- [ ] Export data to CSV/PDF
- [ ] Custom date range filtering
- [ ] Email report scheduling
- [ ] Mobile responsive improvements
- [ ] Dark/light theme toggle
- [ ] Multi-user role management
- [ ] Custom dashboard layouts
- [ ] Advanced filtering and search
- [ ] Real-time notifications
- [ ] Integration marketplace

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the MCP integration guide

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with React and TypeScript
- UI components inspired by modern dashboard design
- Charts powered by Recharts
- Icons by Lucide React
- Authentication by Supabase

---

Made with care for executives who need beautiful, actionable insights.
