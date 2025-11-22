# 🚀 Complete Cloud Deployment Guide

Deploy ContentCreator to Supabase Cloud in 3 steps.

---

## 📋 Prerequisites

1. **Supabase Cloud Account** 
   - Go to https://supabase.com
   - Create a project (free tier is fine)
   - Note your **Project Ref** and **Anon Key**

2. **OpenRouter API Key**
   - You have: `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`

3. **Node.js & Git installed**

---

## 🎯 Deployment Steps

### **Step 1: Deploy Database** 📦

```powershell
cd C:\proyectos\ContentCreator

# Run the database deployment script
.\deploy-database.ps1 -ProjectRef "YOUR_PROJECT_REF"
```

**What it does:**
- Links your local Supabase to cloud project
- Runs all migrations (creates tables, buckets, policies)
- Verifies everything was created

**Tables created:**
- `business_config` - User settings
- `generation_history` - Video generation history

**Storage created:**
- `business-logos` - Logo uploads
- `background-music` - Music files

---

### **Step 2: Deploy Edge Functions** ⚡

```powershell
# Run the functions deployment script
.\deploy-functions.ps1 `
  -ProjectRef "YOUR_PROJECT_REF" `
  -OpenrouterKey "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"
```

**What it does:**
- Authenticates with Supabase
- Sets environment secrets (OpenRouter API key, etc.)
- Deploys 5 edge functions:
  - `analyze-vision` - Image analysis
  - `generate-ideas` - Idea generation
  - `generate-copy` - Copy generation
  - `generate-styles` - Style generation
  - `check-video-status` - Job status polling

---

### **Step 3: Update Environment & Run** 🎬

Edit `.env.local`:

```dotenv
# Your Supabase Cloud URLs
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then run:

```powershell
npm run dev
```

Open http://localhost:5173 and test! ✅

---

## 🏗️ Architecture After Deployment

```
┌─────────────────────┐
│   Your Computer     │
│  (Frontend: Vite)   │
│   localhost:5173    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│       Supabase Cloud (Project)          │
│  ┌─────────────────────────────────┐   │
│  │   PostgreSQL Database           │   │
│  │  • business_config              │   │
│  │  • generation_history           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Edge Functions (Deno)         │   │
│  │  • analyze-vision               │   │
│  │  • generate-ideas               │   │
│  │  • generate-copy                │   │
│  │  • generate-styles              │   │
│  │  • check-video-status           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Storage (S3)                  │   │
│  │  • business-logos               │   │
│  │  • background-music             │   │
│  └─────────────────────────────────┘   │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  OpenRouter API     │
│  (GPT-4 Vision)     │
└─────────────────────┘
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Database linked: `npx supabase status`
- [ ] Tables exist: `npx supabase db tables`
- [ ] Functions deployed: `npx supabase functions list`
- [ ] Secrets set: `npx supabase secrets list`
- [ ] `.env.local` updated with cloud URLs
- [ ] `npm run dev` starts without errors
- [ ] App loads at http://localhost:5173
- [ ] Can create business config
- [ ] Can upload images
- [ ] Can analyze images

---

## 🔧 Manual Deployment (if scripts fail)

### **Database:**
```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### **Functions:**
```powershell
npx supabase secrets set OPENROUTER_API_KEY="sk-or-v1-..."
npx supabase secrets set OPENROUTER_VISION_MODEL="openai/gpt-4o-mini"
npx supabase secrets set OPENROUTER_TEXT_MODEL="openai/gpt-4o-mini"

npx supabase functions deploy analyze-vision
npx supabase functions deploy generate-ideas
npx supabase functions deploy generate-copy
npx supabase functions deploy generate-styles
npx supabase functions deploy check-video-status
```

---

## 📊 Cost & Limits

**Supabase Free Tier:**
- ✅ 500MB database
- ✅ 1GB bandwidth
- ✅ 500K edge function invocations/month
- ✅ 5GB file storage
- ✅ Real-time enabled
- ✅ API rate: 200 req/sec

**Perfect for testing!** When you scale, upgrade to Pro ($25/month).

---

## 🆘 Troubleshooting

### **"Project not found"**
- Check Project Ref is correct
- Go to Supabase dashboard to verify

### **"Not authenticated"**
```powershell
npx supabase login
```

### **"Migration failed"**
Check database syntax:
```powershell
npx supabase migrations list --verbose
```

### **Functions not seeing secrets**
Redeploy after setting secrets:
```powershell
npx supabase functions deploy analyze-vision
```

### **"Missing apikey header"**
Make sure `.env.local` has correct `VITE_SUPABASE_ANON_KEY`

---

## 📚 Additional Resources

- `CLOUD_QUICKSTART.md` - Quick reference
- `DEPLOY_TO_CLOUD.md` - Functions deployment
- `DEPLOY_DATABASE.md` - Database deployment
- `LOCAL_SETUP.md` - Local development

---

## 🎉 You're Ready!

Once everything is deployed:

1. No need for local Supabase
2. No Docker required
3. Just run `npm run dev`
4. Everything uses cloud services

Enjoy! 🚀
