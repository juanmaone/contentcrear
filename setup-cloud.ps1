#!/usr/bin/env pwsh
# Complete deployment workflow
# Run this file: .\setup-cloud.ps1

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║  ContentCreator - Supabase Cloud Setup Wizard                  ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Ask for project details
$projectRef = Read-Host "Enter your Supabase Project Ref (e.g., yvmlqxgokiauvmaxxovv)"
$anonKey = Read-Host "Enter your Supabase Anon Key"
$openrouterKey = Read-Host "Enter your OpenRouter API Key (press Enter to use default)"

if ([string]::IsNullOrWhiteSpace($openrouterKey)) {
    $openrouterKey = "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"
}

Write-Host ""
Write-Host "🔄 Starting deployment..." -ForegroundColor Yellow
Write-Host ""

# Step 1: Login
Write-Host "Step 1️⃣  Authenticating with Supabase..." -ForegroundColor Cyan
npx supabase login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Authentication failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Authenticated" -ForegroundColor Green
Write-Host ""

# Step 2: Link project
Write-Host "Step 2️⃣  Linking to project: $projectRef" -ForegroundColor Cyan
npx supabase link --project-ref $projectRef
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Link failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Linked" -ForegroundColor Green
Write-Host ""

# Step 3: Set secrets
Write-Host "Step 3️⃣  Setting secrets..." -ForegroundColor Cyan
npx supabase secrets set OPENROUTER_API_KEY=$openrouterKey
npx supabase secrets set OPENROUTER_VISION_MODEL="openai/gpt-4o-mini"
npx supabase secrets set OPENROUTER_TEXT_MODEL="openai/gpt-4o-mini"
npx supabase secrets set OPENROUTER_SITE_URL="https://your-domain.com"
npx supabase secrets set OPENROUTER_APP_NAME="ContentCreator"
Write-Host "✅ Secrets set" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy functions
Write-Host "Step 4️⃣  Deploying edge functions..." -ForegroundColor Cyan
$functions = @("analyze-vision", "generate-ideas", "generate-copy", "generate-styles", "check-video-status")
foreach ($func in $functions) {
    Write-Host "  ↳ Deploying: $func"
    npx supabase functions deploy $func
}
Write-Host "✅ All functions deployed" -ForegroundColor Green
Write-Host ""

# Step 5: Update .env.local
Write-Host "Step 5️⃣  Updating .env.local..." -ForegroundColor Cyan

$envContent = @"
# Supabase Cloud
VITE_SUPABASE_URL=https://$projectRef.supabase.co
VITE_SUPABASE_ANON_KEY=$anonKey

# OAuth - Google
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# OAuth - Twitter/X
VITE_TWITTER_CLIENT_ID=your-twitter-client-id
VITE_TWITTER_REDIRECT_URI=http://localhost:5173/auth/callback

# OAuth - Apple
VITE_APPLE_CLIENT_ID=your-apple-client-id
VITE_APPLE_REDIRECT_URI=http://localhost:5173/auth/callback

# App Config
VITE_APP_NAME=ReelMaker Pro 2025
VITE_API_BASE_URL=http://localhost:3000
"@

Set-Content -Path ".env.local" -Value $envContent
Write-Host "✅ .env.local updated" -ForegroundColor Green
Write-Host ""

# Final summary
Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║                    ✅ SETUP COMPLETE!                         ║
╚════════════════════════════════════════════════════════════════╝

🎉 Your functions are now deployed to Supabase Cloud!

📊 Deployed Functions:
   • analyze-vision
   • generate-ideas  
   • generate-copy
   • generate-styles
   • check-video-status

🚀 Next Steps:

   1. Start your app:
      npm run dev

   2. Open in browser:
      http://localhost:5173

   3. Test the workflow:
      - Go to /crear
      - Upload an image
      - Click "Analizar imágenes"

📚 Useful commands:

   # View function logs
   npx supabase functions logs analyze-vision --tail

   # List all deployed functions
   npx supabase functions list

   # List all secrets
   npx supabase secrets list

🆘 Need help? Check these files:
   • CLOUD_QUICKSTART.md - Quick reference
   • DEPLOY_TO_CLOUD.md - Detailed guide
   • LOCAL_SETUP.md - Local development

Happy coding! 🎨
"@ -ForegroundColor Green
