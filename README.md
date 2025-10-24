# Greenworks Executive Dashboard

A production-ready, real-time executive dashboard with voice-enabled AI chat, live KPIs, and seamless integrations with Aircall, WhatConverts, and ISN.

## Features

- **Real-time KPIs**: Live dashboards with SSE for instant updates
- **AI Chat with Voice**: Text + voice chat powered by Claude with Web Speech API and ElevenLabs TTS
- **Multi-Source Integrations**: Aircall, WhatConverts, ISN data sync with webhooks
- **RAG over Documents**: Semantic search and Q&A with pgvector embeddings
- **Modern UI**: Built with Next.js 15, Tailwind CSS, and shadcn/ui
- **Authentication**: Supabase magic link auth with role-based access
- **Replit-Ready**: One-click deployment to Replit

## Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **Database**: Supabase (Postgres + pgvector)
- **AI**: Claude (Anthropic) for chat, ElevenLabs for TTS
- **UI**: Tailwind CSS, shadcn/ui, Recharts
- **Voice**: Web Speech API (STT/TTS) + ElevenLabs fallback
- **Real-time**: Server-Sent Events (SSE)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- API keys for: Anthropic, Aircall, WhatConverts, ISN, ElevenLabs

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd greenworks-executive-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Run database migrations**

   Apply the schema to your Supabase instance:
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually execute:
   # supabase/migrations/001_init_schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run playwright

# Run all tests (CI)
npm run ci
```

## Deployment to Replit

1. **Import your repository** to Replit

2. **Add secrets** in Replit → Secrets tab:
   - Copy all variables from `.env.example`
   - Fill in your actual API keys and credentials

3. **Click "Run"** to start the app

4. **Publish as a web app**:
   - Click the "Publish" button
   - Note your published URL (e.g., `https://your-app.replit.app`)

5. **Configure webhooks** in each service:
   - **Aircall**: `https://your-app.replit.app/api/webhooks/aircall`
   - **WhatConverts**: `https://your-app.replit.app/api/webhooks/whatconverts`
   - **ISN**: `https://your-app.replit.app/api/webhooks/isn`

6. **Set up scheduled sync** (if ISN doesn't support webhooks):
   - Use Replit Cron or external service
   - POST to `https://your-app.replit.app/api/ingest` every 1-5 minutes
   - Body: `{ "source": "isn" }`

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | Streaming AI chat |
| `/api/tts` | POST | Text-to-speech (ElevenLabs) |
| `/api/ingest` | POST | On-demand ETL sync |
| `/api/cron/nightly` | POST | Nightly ETL job |
| `/api/sse` | GET | Server-sent events for KPIs |
| `/api/webhooks/aircall` | POST | Aircall webhook receiver |
| `/api/webhooks/whatconverts` | POST | WhatConverts webhook receiver |
| `/api/webhooks/isn` | POST | ISN webhook receiver |

## Dashboard Pages

- **Overview**: Real-time KPIs, charts, activity feed
- **Inspections**: List and manage inspections
- **Sites**: Customer sites and locations
- **Engineers**: Team management
- **Work Orders**: Service orders tracking
- **Documents**: RAG-enabled document search
- **Data Sources**: Connector status and manual sync
- **Settings**: Account preferences

## Project Structure

```
greenworks-executive-dashboard/
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home redirect
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── connectors/        # API adapters
│   │   ├── supabase/          # Supabase clients
│   │   ├── types.ts           # TypeScript types
│   │   └── utils.ts           # Utilities
│   └── middleware.ts          # Auth middleware
├── supabase/
│   └── migrations/            # Database migrations
├── tests/
│   ├── e2e/                   # Playwright tests
│   └── lib/                   # Unit tests
├── .env.example               # Environment template
└── README.md                  # This file
```

## Secrets Needed

Before deploying, ensure you have:

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `AIRCALL_API_ID`
- `AIRCALL_API_TOKEN`
- `WHATCONVERTS_API_KEY`
- `WHATCONVERTS_WEBHOOK_TOKEN`
- `ISN_API_KEY`
- `ISN_BASE_URL`

### Optional (Enhanced Features)
- `ELEVENLABS_API_KEY` - For server-side TTS
- `ELEVENLABS_VOICE_ID` - Custom voice selection
- `OPENAI_API_KEY` - For embeddings (alternative)
- `VOYAGE_API_KEY` - For embeddings (alternative)
- `COHERE_API_KEY` - For embeddings (alternative)

## Next Steps

- [ ] Apply database migrations to Supabase
- [ ] Configure all API credentials
- [ ] Deploy to Replit
- [ ] Set up webhooks in external services
- [ ] Configure nightly ETL cron job
- [ ] Test authentication flow
- [ ] Test real-time data sync
- [ ] Test voice chat functionality
- [ ] Monitor logs and performance

## Support

For issues or questions:
1. Check the Issues page
2. Review the Deployment Guide (docs/DEPLOYMENT.md)
3. Contact your development team

## License

Proprietary - Greenworks Internal Use Only
