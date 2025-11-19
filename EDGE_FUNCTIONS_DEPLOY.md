# 🔧 Manual Edge Functions Deployment Guide

**Status:** Supabase CLI installed ✅  
**Next:** Link to your project and deploy functions  
**Time Required:** 10-15 minutes  

---

## 📋 What You Need

### 1. Your Supabase Project Details

You'll need these from your Supabase project:

1. **Project URL:** `https://YOUR-PROJECT-REF.supabase.co`
   - Go to: Supabase Dashboard → Settings → General
   - Copy: "Reference ID" (that's your project-ref)

2. **Supabase Access Token:** For authentication
   - Go to: Supabase Dashboard → Account → Access Tokens
   - Create new token (give it a name)
   - Copy the token

3. **Replicate API Token:** For video generation
   - Go to: https://replicate.com/account/api-tokens
   - Copy your API key

### 2. Environment Variables

Get these from your Supabase project:
- `VITE_SUPABASE_URL` (Project URL)
- `VITE_SUPABASE_ANON_KEY` (in Settings → API)

---

## 🚀 Step-by-Step Deployment

### Step 1: Authenticate with Supabase (2 minutes)

```bash
cd c:\proyectos\ContentCreator

# Link your Supabase project
npx supabase link --project-ref YOUR-PROJECT-REF
```

**What to do:**
1. Replace `YOUR-PROJECT-REF` with your actual project reference ID
2. When prompted for password: paste your Supabase Access Token
3. Wait for confirmation: "✓ Linked to remote"

**Where to get project-ref:**
- Supabase Dashboard → Settings → General → Reference ID

### Step 2: Deploy Edge Functions (8 minutes)

Deploy all 6 functions:

```bash
# Deploy each function one by one
npx supabase functions deploy analyze-vision
npx supabase functions deploy generate-ideas
npx supabase functions deploy generate-copy
npx supabase functions deploy generate-styles
npx supabase functions deploy submit-video-job
npx supabase functions deploy check-video-status
```

**What to expect:**
- Each deployment takes 10-20 seconds
- You'll see: "✓ Function deploy successful"
- Functions are now live on your project

### Step 3: Set Environment Variables (3 minutes)

Set the `REPLICATE_API_TOKEN` for your Edge Functions:

```bash
# Set the token (replace with your actual Replicate token)
npx supabase secrets set REPLICATE_API_TOKEN=r8_YOUR_TOKEN_HERE
```

**Where to get REPLICATE_API_TOKEN:**
- Go to: https://replicate.com/account/api-tokens
- Copy your API key
- Replace `r8_YOUR_TOKEN_HERE` with your actual token

**Verify it's set:**
```bash
npx supabase secrets list
```

You should see `REPLICATE_API_TOKEN` in the list (value will be masked)

---

## ✅ Verification Checklist

### Functions Deployed?
Check Supabase Dashboard:
1. Go to: Functions (sidebar)
2. You should see all 6 functions:
   - [ ] analyze-vision
   - [ ] generate-ideas
   - [ ] generate-copy
   - [ ] generate-styles
   - [ ] submit-video-job
   - [ ] check-video-status

### Token Set?
Check Supabase Dashboard:
1. Go to: Settings → Edge Functions → Environment Variables
2. You should see: `REPLICATE_API_TOKEN` (value masked)

### Ready to Deploy?
All 6 functions deployed + token set = ✅ Ready!

---

## 🧪 Test Locally Before Cloud Deployment (Optional)

If you want to test Edge Functions locally before deploying to cloud:

```bash
# Start local Supabase environment
npx supabase start

# In another terminal, serve functions locally
npx supabase functions serve

# Your local functions will be at:
# http://localhost:54321/functions/v1/analyze-vision
# http://localhost:54321/functions/v1/generate-ideas
# etc.

# Stop local environment when done
npx supabase stop
```

---

## 🚨 Troubleshooting

### Error: "No access token found"

**Solution:** You need to authenticate first
```bash
# Login to Supabase
npx supabase login
# Then link your project
npx supabase link --project-ref YOUR-PROJECT-REF
```

### Error: "Function not found"

**Solution:** Make sure you're in the right directory
```bash
# Should be in project root where supabase/ folder exists
cd c:\proyectos\ContentCreator
npx supabase functions list
```

### Error: "REPLICATE_API_TOKEN not set"

**Solution:** Set the environment variable
```bash
npx supabase secrets set REPLICATE_API_TOKEN=your-token-here
```

### Functions deployed but app still fails

**Solution:** Check VITE environment variables in Vercel
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc... (your anon key)
```

### Video generation times out

**Possible causes:**
1. REPLICATE_API_TOKEN not set correctly
2. Invalid token (check permissions on Replicate)
3. Rate limiting (too many requests)

**Solutions:**
1. Verify token: `npx supabase secrets list`
2. Check Replicate account has video generation credits
3. Wait a bit and try again

---

## 📊 What Happens After Deployment

Once Edge Functions are deployed:

1. **Users upload images**
   → Frontend sends to `/analyze-vision` function

2. **Function analyzes with Vision API**
   → Returns: products, colors, emotion, viral score

3. **User selects idea**
   → Frontend sends to `/generate-ideas` function
   → Also calls `/generate-copy` and `/generate-styles`

4. **User generates video**
   → Frontend calls `/submit-video-job`
   → Job submitted to Replicate
   → Function returns job ID

5. **Polling starts**
   → Frontend calls `/check-video-status` every 5 seconds
   → When done, video URL is saved to database

6. **Video appears on dashboard**
   → User can view, download, share

---

## ✨ After Deployment Completes

Once all functions are deployed:

1. ✅ Commit your changes:
   ```bash
   git add .
   git commit -m "Deploy Edge Functions to Supabase cloud"
   ```

2. ✅ Push to GitHub:
   ```bash
   git push origin main
   ```

3. ✅ Vercel auto-deploys when you push

4. ✅ Test the full workflow on production

---

## 📞 Getting Help

### Supabase CLI Commands Reference

```bash
# List all functions
npx supabase functions list

# Deploy a single function
npx supabase functions deploy function-name

# View function logs
npx supabase functions download function-name

# Set environment variable
npx supabase secrets set KEY=value

# List environment variables
npx supabase secrets list

# Remove environment variable
npx supabase secrets unset KEY
```

### Links

- **Supabase CLI Docs:** https://supabase.com/docs/guides/cli
- **Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Replicate API:** https://replicate.com/docs/api

---

## 🎯 Next Steps

1. **Get your Supabase project-ref** (from dashboard)
2. **Get your Replicate API token** (from replicate.com)
3. **Run the deployment commands** above
4. **Verify functions are deployed** (check dashboard)
5. **Push to GitHub** and Vercel will auto-deploy
6. **Test the app** end-to-end

**Then you're live! 🚀**

---

**Questions? Check the error message above and search this guide.**
