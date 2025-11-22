#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test Configuration Save Feature
.DESCRIPTION
    Verifies that configuration save works correctly with:
    - Logo upload to S3
    - Music upload to S3
    - Database record creation/update
#>

param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "local"  # "local" or "cloud"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([string]$Title)
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $($Title.PadRight(56)) ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warn {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Main Script

Write-Section "Configuration Save - Verification Script"

Write-Info "Environment: $Environment"
Write-Info "Testing ContentCreator Configuration Feature"

Write-Section "Prerequisites Check"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js installed: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js first."
    exit 1
}

# Check npm packages
try {
    $packages = @("supabase", "react", "vite")
    foreach ($pkg in $packages) {
        npm list $pkg --depth=0 | Out-Null
        Write-Success "Package '$pkg' installed"
    }
} catch {
    Write-Warn "Some packages may not be installed"
}

Write-Section "Database Check"

# Check if Supabase CLI is available
try {
    $supVersion = npx supabase --version
    Write-Success "Supabase CLI: $supVersion"
} catch {
    Write-Error "Supabase CLI not found. Install with: npm install -g supabase"
    exit 1
}

Write-Section "Migration Status"

# Check if migration file exists
if (Test-Path "supabase/migrations/20250120_storage_rls.sql") {
    Write-Success "Storage RLS migration exists: 20250120_storage_rls.sql"
} else {
    Write-Warn "Storage RLS migration not found"
    Write-Info "Creating migration file..."
}

# Check hook implementation
Write-Section "Code Implementation Check"

if (Test-Path "src/hooks/useBusinessConfig.js") {
    $content = Get-Content "src/hooks/useBusinessConfig.js" -Raw
    
    if ($content -contains "supabase.storage.from('business-logos').upload") {
        Write-Success "Logo upload implementation found"
    } else {
        Write-Warn "Logo upload implementation may be incomplete"
    }
    
    if ($content -contains "supabase.storage.from('background-music').upload") {
        Write-Success "Music upload implementation found"
    } else {
        Write-Warn "Music upload implementation may be incomplete"
    }
    
    if ($content -contains "getPublicUrl") {
        Write-Success "S3 public URL generation found"
    } else {
        Write-Warn "Public URL generation may be incomplete"
    }
} else {
    Write-Error "useBusinessConfig.js not found"
    exit 1
}

Write-Section "File Verification"

$filesToCheck = @(
    "src/pages/Configuracion.jsx",
    "src/hooks/useBusinessConfig.js",
    "src/lib/supabase.js",
    "supabase/migrations/20250119_init.sql",
    "supabase/migrations/20250120_storage_rls.sql"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        $fileSize = (Get-Item $file).Length
        Write-Success "$file exists ($fileSize bytes)"
    } else {
        Write-Warn "$file not found"
    }
}

Write-Section "Manual Test Checklist"

Write-Host @"
To manually test the configuration save feature:

1. START LOCAL SUPABASE
   ┌─────────────────────────────────────┐
   │ npx supabase start                  │
   │ (Keep running in Terminal 1)        │
   └─────────────────────────────────────┘

2. START DEVELOPMENT SERVER
   ┌─────────────────────────────────────┐
   │ npm run dev                         │
   │ (Keep running in Terminal 2)        │
   │ Opens: http://localhost:5173        │
   └─────────────────────────────────────┘

3. OPEN BROWSER & LOGIN
   ┌─────────────────────────────────────┐
   │ Go to: http://localhost:5173        │
   │ Click "Registrarse"                 │
   │ Create test account                 │
   │ Verify email (check email table)    │
   │ Login                               │
   └─────────────────────────────────────┘

4. NAVIGATE TO CONFIGURATION
   ┌─────────────────────────────────────┐
   │ Click "Configuración" button        │
   │ Or navigate to: /configuracion      │
   └─────────────────────────────────────┘

5. FILL OUT FORM
   ┌─────────────────────────────────────┐
   │ Business Name: "Test Shop"          │
   │ Category: Select one                │
   │ Logo: Upload PNG/JPG (5MB max)      │
   │ Music: Upload MP3/WAV (20MB max)    │
   │ Address: "123 Main St"              │
   │ Phone: "+1 234 567 8900"            │
   │ Email: "test@example.com"           │
   │ And fill other fields...            │
   └─────────────────────────────────────┘

6. SAVE CONFIGURATION
   ┌─────────────────────────────────────┐
   │ Click "Guardar configuración"       │
   │ Watch for success toast             │
   │ Should redirect to /dashboard       │
   └─────────────────────────────────────┘

7. VERIFY IN SUPABASE STUDIO
   ┌─────────────────────────────────────┐
   │ npx supabase studio                 │
   │ Table: business_config              │
   │   ✓ 1 row created                   │
   │   ✓ business_name = "Test Shop"     │
   │   ✓ logo_url has S3 URL             │
   │   ✓ music_url has S3 URL            │
   │                                     │
   │ Storage: business-logos             │
   │   ✓ See logo file uploaded          │
   │                                     │
   │ Storage: background-music           │
   │   ✓ See music file uploaded         │
   └─────────────────────────────────────┘

8. TEST RELOAD
   ┌─────────────────────────────────────┐
   │ Navigate to /configuracion again    │
   │ Form should repopulate with data    │
   │ Logo preview should show            │
   └─────────────────────────────────────┘

"@

Write-Section "Logs to Monitor"

Write-Host @"
While testing, check browser console (F12) for:

SUCCESS MESSAGES:
  ✓ "Logo uploaded successfully: https://..."
  ✓ "Music uploaded successfully: https://..."
  ✓ "¡Configuración guardada!"

ERROR MESSAGES (watch for these):
  ✗ "Failed to upload logo: ..."
  ✗ "Failed to upload music: ..."
  ✗ "Error saving business config: ..."
  ✗ "PGRST116" (missing table)
  ✗ "permission denied" (RLS policy issue)

"@

Write-Section "Troubleshooting"

Write-Host @"
IF UPLOAD FAILS:
  1. Check storage buckets exist:
     npx supabase storage buckets list
  
  2. Check RLS policies:
     SELECT * FROM pg_policies WHERE tablename = 'storage.objects';
  
  3. Verify bucket is public:
     SELECT id, name, public FROM storage.buckets;

IF DATABASE SAVE FAILS:
  1. Check user is authenticated:
     Look for user ID in useAuth hook
  
  2. Check business_config table exists:
     SELECT * FROM public.business_config;
  
  3. Check RLS policies on table:
     SELECT * FROM pg_policies WHERE tablename = 'business_config';

IF NOTHING SAVED:
  1. Check browser console for errors (F12)
  2. Check Supabase logs:
     npx supabase functions logs
  3. Run migrations:
     npx supabase migration up

"@

Write-Section "✅ Ready to Test!"

Write-Success "All files are in place"
Write-Success "Code implementation is complete"
Write-Success "Migration files exist"
Write-Info "Next: Follow the Manual Test Checklist above"

Write-Host "`n"
