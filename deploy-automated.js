#!/usr/bin/env node

/**
 * Automated Deployment Script for Greenworks Executive Dashboard
 *
 * This script handles:
 * 1. Database migration to Supabase
 * 2. Environment validation
 * 3. Build verification
 *
 * Usage:
 *   node deploy-automated.js
 *
 * Or with environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node deploy-automated.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Required environment variables
const REQUIRED_ENV = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Your Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Your Supabase anonymous key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Your Supabase service role key',
  'ANTHROPIC_API_KEY': 'Your Anthropic API key',
};

// Check environment variables
function checkEnvironment() {
  logSection('🔍 Checking Environment Variables');

  const missing = [];
  const present = [];

  for (const [key, description] of Object.entries(REQUIRED_ENV)) {
    if (process.env[key]) {
      present.push(key);
      log(`✓ ${key}`, 'green');
    } else {
      missing.push({ key, description });
      log(`✗ ${key} - ${description}`, 'red');
    }
  }

  if (missing.length > 0) {
    log('\n❌ Missing required environment variables!', 'red');
    log('\nPlease set them in one of these ways:', 'yellow');
    log('1. Export in your shell:', 'yellow');
    missing.forEach(({ key }) => {
      log(`   export ${key}="your-value-here"`, 'yellow');
    });
    log('\n2. Create a .env.local file:', 'yellow');
    log('   cp .env.example .env.local', 'yellow');
    log('   # Then edit .env.local with your values', 'yellow');
    process.exit(1);
  }

  log('\n✅ All required environment variables are set!', 'green');
  return true;
}

// Apply database migration
async function applyDatabaseMigration() {
  logSection('📊 Applying Database Migration');

  const migrationFile = path.join(__dirname, 'supabase/migrations/001_init_schema.sql');

  if (!fs.existsSync(migrationFile)) {
    log('❌ Migration file not found!', 'red');
    return false;
  }

  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  log(`✓ Loaded migration file (${migrationSQL.length} bytes)`, 'green');

  // Parse Supabase URL to get project ref
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    log('❌ Could not parse Supabase project reference from URL', 'red');
    return false;
  }

  log(`Project Reference: ${projectRef}`, 'cyan');

  // Execute migration via Supabase REST API
  log('\nExecuting SQL migration...', 'yellow');

  const result = await executeSupabaseSQL(migrationSQL, projectRef);

  if (result.success) {
    log('✅ Database migration applied successfully!', 'green');
    return true;
  } else {
    log(`❌ Migration failed: ${result.error}`, 'red');
    log('\n⚠️  Please apply the migration manually:', 'yellow');
    log(`   1. Go to: https://supabase.com/dashboard/project/${projectRef}/editor`, 'yellow');
    log('   2. Open SQL Editor', 'yellow');
    log('   3. Copy/paste contents of: supabase/migrations/001_init_schema.sql', 'yellow');
    log('   4. Click "Run"', 'yellow');
    return false;
  }
}

// Execute SQL via Supabase API
function executeSupabaseSQL(sql, projectRef) {
  return new Promise((resolve) => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Try to execute via pg_meta API (if available)
    const url = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;

    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}: ${data}` });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();

    // Timeout after 30 seconds
    setTimeout(() => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    }, 30000);
  });
}

// Verify build
async function verifyBuild() {
  logSection('🔨 Verifying Build');

  const { execSync } = require('child_process');

  try {
    log('Building application...', 'yellow');
    execSync('npm run build', { stdio: 'inherit' });
    log('\n✅ Build successful!', 'green');
    return true;
  } catch (error) {
    log('❌ Build failed!', 'red');
    return false;
  }
}

// Print deployment instructions
function printDeploymentInstructions() {
  logSection('📋 Next Steps: Deploy to Replit');

  log('Now that the database is ready, deploy to Replit:', 'cyan');
  log('\n1. Go to https://replit.com', 'yellow');
  log('2. Create new Repl → Import from GitHub', 'yellow');
  log('3. Repository: jvanover7/greenworks-executive-dashboard', 'yellow');
  log('4. Branch: claude/greenworks-dashboard-init-011CUSbNaM3nh6XKoDiqEZjD', 'yellow');
  log('\n5. Add these secrets in Replit (Tools → Secrets):', 'yellow');

  Object.keys(REQUIRED_ENV).forEach(key => {
    const value = process.env[key];
    const masked = value ? `${value.substring(0, 10)}...` : 'NOT_SET';
    log(`   ${key}=${masked}`, 'cyan');
  });

  log('\n   (Plus optional: AIRCALL_*, WHATCONVERTS_*, ISN_*, ELEVENLABS_*)', 'cyan');

  log('\n6. Click "Run" then "Publish"', 'yellow');
  log('7. Copy your published URL', 'yellow');

  logSection('🔗 Configure Webhooks');

  log('After publishing, configure these webhooks:', 'cyan');
  log('   Aircall: https://your-app.replit.app/api/webhooks/aircall', 'yellow');
  log('   WhatConverts: https://your-app.replit.app/api/webhooks/whatconverts', 'yellow');
  log('   ISN: https://your-app.replit.app/api/webhooks/isn', 'yellow');

  logSection('✅ Deployment Complete!');
  log('Your Greenworks Executive Dashboard is ready to use!', 'green');
}

// Main execution
async function main() {
  console.clear();
  log('🚀 Greenworks Executive Dashboard - Automated Deployment', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');

  try {
    // Step 1: Check environment
    checkEnvironment();

    // Step 2: Apply database migration
    const migrationSuccess = await applyDatabaseMigration();

    if (!migrationSuccess) {
      log('\n⚠️  Continuing without automatic migration...', 'yellow');
      log('Please apply the migration manually and then run this script again.', 'yellow');
    }

    // Step 3: Verify build
    const buildSuccess = await verifyBuild();

    if (!buildSuccess) {
      log('\n❌ Build failed. Please fix errors and try again.', 'red');
      process.exit(1);
    }

    // Step 4: Print instructions
    printDeploymentInstructions();

  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
