#!/bin/bash
set -e

echo "🚀 Greenworks Executive Dashboard - Deployment Script"
echo "======================================================"
echo ""

# Check for required environment variables
REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "ANTHROPIC_API_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "📝 Please set these variables before deploying:"
  echo "   export NEXT_PUBLIC_SUPABASE_URL='your-value'"
  echo "   export NEXT_PUBLIC_SUPABASE_ANON_KEY='your-value'"
  echo "   export SUPABASE_SERVICE_ROLE_KEY='your-value'"
  echo "   export ANTHROPIC_API_KEY='your-value'"
  echo ""
  echo "Or copy .env.example to .env.local and fill in the values"
  exit 1
fi

echo "✅ Environment variables check passed"
echo ""

# Apply database migration
echo "📊 Applying database migration..."
echo "   Project: greenworks-dashboard-prod"
echo "   Region: us-east-1"
echo ""

# Check if we can connect to Supabase
if command -v curl &> /dev/null; then
  SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
  echo "   Testing connection to $SUPABASE_URL..."

  if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" | grep -q "200\|401"; then
    echo "   ✅ Supabase connection successful"
  else
    echo "   ⚠️  Could not verify Supabase connection"
  fi
else
  echo "   ⚠️  curl not available, skipping connection test"
fi

echo ""
echo "⚠️  Database migration must be applied manually:"
echo "   1. Go to https://supabase.com/dashboard/project/mdjcxlbviwbtbiikiles"
echo "   2. Navigate to SQL Editor"
echo "   3. Copy and paste contents of: supabase/migrations/001_init_schema.sql"
echo "   4. Execute the SQL"
echo ""
read -p "Have you applied the database migration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Please apply the database migration before continuing"
  exit 1
fi

echo "✅ Database migration confirmed"
echo ""

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Deploy to Replit:"
echo "      - Import this repo to Replit"
echo "      - Add secrets in Replit → Secrets tab"
echo "      - Click 'Run' then 'Publish'"
echo ""
echo "   2. Configure webhooks (after deployment):"
echo "      Aircall: https://your-app.replit.app/api/webhooks/aircall"
echo "      WhatConverts: https://your-app.replit.app/api/webhooks/whatconverts"
echo "      ISN: https://your-app.replit.app/api/webhooks/isn"
echo ""
echo "   3. Run initial data sync:"
echo "      curl -X POST https://your-app.replit.app/api/ingest \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"source\":\"all\"}'"
echo ""
