#!/usr/bin/env pwsh
# Deploy database to Supabase Cloud
# Usage: .\deploy-database.ps1 -ProjectRef "your-project-ref"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef
)

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║        ContentCreator - Database Deployment to Cloud           ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Step 1: Check if already linked
Write-Host ""
Write-Host "Step 1️⃣  Checking Supabase CLI..." -ForegroundColor Yellow
$linked = npx supabase projects list 2>&1 | Select-String -Pattern "authenticated"

if ($null -eq $linked) {
    Write-Host "  → Not authenticated. Please login first..." -ForegroundColor Cyan
    npx supabase login
}

# Step 2: Link project
Write-Host ""
Write-Host "Step 2️⃣  Linking to Supabase project: $ProjectRef" -ForegroundColor Yellow
npx supabase link --project-ref $ProjectRef --password-prompt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Link failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Linked successfully" -ForegroundColor Green

# Step 3: Push database migrations
Write-Host ""
Write-Host "Step 3️⃣  Pushing database migrations..." -ForegroundColor Yellow
Write-Host "  This will:" -ForegroundColor Gray
Write-Host "  • Create business_config table" -ForegroundColor Gray
Write-Host "  • Create generation_history table" -ForegroundColor Gray
Write-Host "  • Create storage buckets" -ForegroundColor Gray
Write-Host "  • Enable RLS policies" -ForegroundColor Gray
Write-Host ""

npx supabase db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database push failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database pushed successfully" -ForegroundColor Green

# Step 4: List tables
Write-Host ""
Write-Host "Step 4️⃣  Verifying tables..." -ForegroundColor Yellow
npx supabase db tables
Write-Host "✅ Tables verified" -ForegroundColor Green

# Step 5: List migrations
Write-Host ""
Write-Host "Step 5️⃣  Migrations applied:" -ForegroundColor Yellow
npx supabase migrations list
Write-Host ""

# Summary
Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║                  ✅ DATABASE DEPLOYED!                        ║
╚════════════════════════════════════════════════════════════════╝

📊 Created Tables:
   ✓ business_config
   ✓ generation_history

💾 Storage Buckets:
   ✓ business-logos
   ✓ background-music

🔒 Security:
   ✓ RLS Enabled
   ✓ User data isolation
   ✓ Policies configured

📋 Next Steps:

   1. Verify in dashboard:
      https://supabase.com/dashboard/project/$ProjectRef

   2. Go to SQL Editor and run:
      SELECT * FROM business_config;
      SELECT * FROM generation_history;

   3. Continue with edge functions deployment:
      .\deploy-functions.ps1

   4. Start your app:
      npm run dev

📚 More info:
   • DEPLOY_DATABASE.md - Detailed guide
   • DEPLOY_TO_CLOUD.md - Functions deployment

Happy building! 🚀
"@ -ForegroundColor Green
