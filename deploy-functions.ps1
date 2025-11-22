# Deploy all functions to Supabase Cloud
# Usage: .\deploy-functions.ps1 -ProjectRef "your-project-ref" -OpenrouterKey "sk-or-v1-..."

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef,
    
    [Parameter(Mandatory=$true)]
    [string]$OpenrouterKey,
    
    [string]$SiteUrl = "https://your-domain.com",
    [string]$AppName = "ContentCreator"
)

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 SUPABASE EDGE FUNCTIONS DEPLOYMENT" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login (if not already logged in)
Write-Host "📝 Step 1: Linking to Supabase project..." -ForegroundColor Yellow
npx supabase link --project-ref $ProjectRef
Write-Host "✓ Linked successfully`n" -ForegroundColor Green

# Step 2: Set secrets
Write-Host "🔐 Step 2: Setting environment secrets..." -ForegroundColor Yellow
npx supabase secrets set OPENROUTER_API_KEY=$OpenrouterKey
npx supabase secrets set OPENROUTER_VISION_MODEL="openai/gpt-4o-mini"
npx supabase secrets set OPENROUTER_TEXT_MODEL="openai/gpt-4o-mini"
npx supabase secrets set OPENROUTER_SITE_URL=$SiteUrl
npx supabase secrets set OPENROUTER_APP_NAME=$AppName
Write-Host "✓ Secrets set successfully`n" -ForegroundColor Green

# Step 3: List secrets to verify
Write-Host "📋 Verifying secrets..." -ForegroundColor Yellow
npx supabase secrets list
Write-Host ""

# Step 4: Deploy functions
Write-Host "🚀 Step 3: Deploying functions..." -ForegroundColor Yellow
Write-Host ""

$functions = @("analyze-vision", "generate-ideas", "generate-copy", "generate-styles", "check-video-status")

foreach ($func in $functions) {
    Write-Host "  → Deploying $func..." -ForegroundColor Cyan
    npx supabase functions deploy $func
    Write-Host "    ✓ $func deployed`n" -ForegroundColor Green
}

# Step 5: Verify deployment
Write-Host "📋 Step 4: Listing deployed functions..." -ForegroundColor Yellow
npx supabase functions list
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env.local with your Supabase cloud URL and anon key"
Write-Host "2. Run: npm run dev"
Write-Host "3. Visit: http://localhost:5173"
Write-Host ""
