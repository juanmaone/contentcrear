# ⚡ Quick Start: Deploy to Supabase Cloud

## What You Need

1. **Supabase Cloud Project**
   - Go to https://supabase.com/dashboard
   - Create a project (free tier works!)
   - Copy your **Project Ref** (e.g., `yvmlqxgokiauvmaxxovv`)
   - Copy your **Anon Key**

2. **OpenRouter API Key**
   - You already have: `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`

---

## Deploy in 3 Commands

### Option A: Automatic (Recommended)
```powershell
cd C:\proyectos\ContentCreator

.\deploy-functions.ps1 `
  -ProjectRef "YOUR_PROJECT_REF" `
  -OpenrouterKey "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"
```

### Option B: Manual (Step by step)

**1. Login & Link**
```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

**2. Set Secrets**
```powershell
npx supabase secrets set OPENROUTER_API_KEY="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"
npx supabase secrets set OPENROUTER_VISION_MODEL="openai/gpt-4o-mini"
npx supabase secrets set OPENROUTER_TEXT_MODEL="openai/gpt-4o-mini"
```

**3. Deploy All Functions**
```powershell
npx supabase functions deploy analyze-vision
npx supabase functions deploy generate-ideas
npx supabase functions deploy generate-copy
npx supabase functions deploy generate-styles
npx supabase functions deploy check-video-status
```

---

## Update Your Environment

Edit `.env.local`:
```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Copy from your Supabase dashboard:
- **VITE_SUPABASE_URL**: Project Settings → API
- **VITE_SUPABASE_ANON_KEY**: Project Settings → API (anon/public key)

---

## Test It

```powershell
npm run dev
```

Then:
1. Go to http://localhost:5173/crear
2. Upload an image
3. Click "Analizar imágenes"
4. Should call your cloud functions! ✅

---

## 🎯 Architecture (After Deployment)

```
Your Computer
    ↓
Vite App (localhost:5173)
    ↓
Supabase Cloud API
    ↓ (via edge functions)
OpenRouter API
    ↓
GPT-4 Vision / Mini Models
```

**No local Supabase needed!** 🎉

---

## Useful Commands

```powershell
# List all secrets
npx supabase secrets list

# List all deployed functions
npx supabase functions list

# View function logs (real-time)
npx supabase functions logs analyze-vision --tail

# Redeploy a single function
npx supabase functions deploy analyze-vision

# Delete a function
npx supabase functions delete analyze-vision

# Get function details
npx supabase functions describe analyze-vision
```

---

## 💰 Supabase Cloud Pricing

- **Free Tier**: Perfect for testing
  - Up to 500K edge function invocations/month
  - Unlimited functions
  - 500MB database
  
- **Pro Tier**: If you need more
  - $25/month
  - Unlimited invocations
  - More database space

---

Need help? Check `DEPLOY_TO_CLOUD.md` for detailed troubleshooting!
