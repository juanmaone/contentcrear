# 🚀 Deploy Edge Functions to Supabase Cloud

## Step 1: Link Your Supabase Project

First, you need to authenticate and link your project:

```powershell
# Login to Supabase (opens browser)
npx supabase login

# Link your project (replace xxxxx with your project ref)
npx supabase link --project-ref xxxxx
```

To find your **project-ref**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Project Settings** → **General**
4. Copy the **Project Ref** (e.g., `yvmlqxgokiauvmaxxovv`)

---

## Step 2: Create Secrets in Supabase Cloud

Set the environment variables that your edge functions need:

```powershell
npx supabase secrets set OPENROUTER_API_KEY="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"
npx supabase secrets set OPENROUTER_VISION_MODEL="openai/gpt-4o-mini"
npx supabase secrets set OPENROUTER_TEXT_MODEL="openai/gpt-4o-mini"
npx supabase secrets set OPENROUTER_SITE_URL="https://your-domain.com"
npx supabase secrets set OPENROUTER_APP_NAME="ContentCreator"
```

Verify they were set:
```powershell
npx supabase secrets list
```

---

## Step 3: Deploy Individual Functions

Deploy each function one by one:

```powershell
# Deploy analyze-vision function
npx supabase functions deploy analyze-vision

# Deploy generate-ideas function
npx supabase functions deploy generate-ideas

# Deploy generate-copy function
npx supabase functions deploy generate-copy

# Deploy generate-styles function
npx supabase functions deploy generate-styles

# Deploy check-video-status function
npx supabase functions deploy check-video-status
```

Each command will:
- Compile the TypeScript
- Upload to Supabase
- Show you the deployed URL

---

## Step 4: Verify Deployment

Check that functions were deployed:

```powershell
npx supabase functions list
```

You should see all 5 functions listed.

---

## Step 5: Update Your `.env.local` with Cloud URLs

Once deployed, your functions will be at:
- `https://xxxxx.supabase.co/functions/v1/analyze-vision`
- `https://xxxxx.supabase.co/functions/v1/generate-ideas`
- `https://xxxxx.supabase.co/functions/v1/generate-copy`
- `https://xxxxx.supabase.co/functions/v1/generate-styles`

The code in `src/lib/openai.js` already uses `SUPABASE_URL/functions/v1/{function-name}`, so it will work automatically!

---

## Step 6: Test a Function

```powershell
$body = @{
  imageUrls = @("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
  category = "restaurant"
  businessName = "TestBiz"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://xxxxx.supabase.co/functions/v1/analyze-vision" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "apikey" = "YOUR_ANON_KEY"
  } `
  -Body $body `
  -SkipHttpErrorCheck

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

---

## 📝 Complete Deployment Checklist

- [ ] Run `npx supabase login`
- [ ] Run `npx supabase link --project-ref xxxxx`
- [ ] Set all 5 secrets with `npx supabase secrets set`
- [ ] Deploy all 5 functions
- [ ] Verify with `npx supabase functions list`
- [ ] Update `.env.local` with cloud Supabase URL
- [ ] Test one function with curl/Postman
- [ ] Run `npm run dev` and test the full workflow

---

## 🆘 Troubleshooting

**Error: "Not authenticated"**
→ Run `npx supabase login` first

**Error: "Project not found"**
→ Check your project-ref is correct

**Functions not seeing secrets**
→ Redeploy: `npx supabase functions deploy analyze-vision`

**404 on function URL**
→ Check the URL matches: `https://[PROJECT-REF].supabase.co/functions/v1/[FUNCTION-NAME]`

---

## 🎯 Once Everything is Deployed

Your setup will be:
```
Frontend (Vite)     → Supabase Cloud API
                    → Edge Functions (Cloud)
                    → OpenRouter API
```

No local Supabase needed! Just:
```powershell
npm run dev
```
