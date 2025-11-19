# 🧪 Local Edge Functions Testing Guide

**Goal:** Test Edge Functions locally before deploying to Supabase cloud  
**Time:** 15-20 minutes  
**Prerequisites:** Node.js, Docker (optional), Supabase CLI  

---

## 🚀 Quick Start: Test Functions Locally

### Step 1: Start Local Supabase (3 minutes)

```bash
cd c:\proyectos\ContentCreator

# Start local Supabase environment
npx supabase start
```

**What happens:**
- Starts PostgreSQL database locally
- Starts Supabase auth locally
- Creates local API endpoint (usually http://localhost:54321)
- Initializes storage buckets

**Output:**
You'll see something like:
```
Started: PostgreSQL
Started: GoTrue
Started: Storage
Started: Vector
...
http://localhost:54321
```

### Step 2: Serve Functions Locally (in another terminal)

```bash
cd c:\proyectos\ContentCreator

# In a NEW terminal/PowerShell window, run:
npx supabase functions serve
```

**What happens:**
- Functions available at `http://localhost:54321/functions/v1/FUNCTION_NAME`
- Watch mode enabled (auto-reload on changes)
- Logs printed to console
- Can see function execution in real-time

**Output:**
```
Serving functions:
 - analyze-vision
 - generate-ideas
 - generate-copy
 - generate-styles
 - submit-video-job
 - check-video-status

Ready at http://localhost:54321
```

### Step 3: Update Local Dev URL (in your app)

Your app needs to know to use local functions:

**Current:** App uses `https://your-project.supabase.co/functions/v1/...`  
**Local:** App should use `http://localhost:54321/functions/v1/...`

The app already handles this! When you run `npm run dev`:
- It uses `VITE_SUPABASE_URL` from `.env.local`
- For local testing, set it to `http://localhost:54321`

Update `.env.local`:
```dotenv
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

Get the local anon key:
1. Go to: Supabase Dashboard (http://localhost:54321)
2. Navigate to: Settings → API → anon key
3. Copy and paste into .env.local

### Step 4: Start Your Dev App

```bash
# In another terminal:
npm run dev
```

App will now:
- Connect to local Supabase
- Call local Edge Functions
- Store data in local PostgreSQL

---

## 🧬 What Each Function Does (for testing)

### 1. analyze-vision

**Purpose:** Analyze images with Vision API

**Test with cURL:**
```bash
curl -X POST http://localhost:54321/functions/v1/analyze-vision \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "images": ["data:image/jpeg;base64,..."]
  }'
```

**Expected Response:**
```json
{
  "analysis": [
    {
      "main_product": "Producto",
      "detected_objects": ["objeto1", "objeto2"],
      "colors": ["rojo", "azul"],
      "emotion_style": "Modern y vibrante",
      "viral_potential_score": 8.5,
      "suggested_trends": ["trend1", "trend2"]
    }
  ]
}
```

### 2. generate-ideas

**Purpose:** Generate viral video ideas

**Requirements:** Analysis results from analyze-vision

**Expected:** 6 unique viral ideas with descriptions

### 3. generate-copy

**Purpose:** Generate copy variants

**Expected:** 5 copy options with viral scores

### 4. generate-styles

**Purpose:** Generate video style options

**Expected:** 4 video styles with specifications

### 5. submit-video-job

**Purpose:** Submit video generation job to Replicate

**Needs:** REPLICATE_API_TOKEN environment variable

```bash
# Set token for local testing
export REPLICATE_API_TOKEN=r8_YOUR_TOKEN
npx supabase functions serve
```

**Expected:** Returns job ID from Replicate

### 6. check-video-status

**Purpose:** Check video generation progress

**Parameters:** job ID from submit-video-job

**Expected:** Status (processing/succeeded/failed) + video URL

---

## 📝 Test Workflow

### Complete End-to-End Local Test

1. **Start local Supabase:**
   ```bash
   npx supabase start
   ```

2. **Serve functions locally (new terminal):**
   ```bash
   npx supabase functions serve
   ```

3. **Start dev app (another terminal):**
   ```bash
   npm run dev
   ```

4. **Test in browser:**
   - Go to http://localhost:5173
   - Login (create test account)
   - Configure business
   - Upload test image
   - Click "Analizar imágenes"
   - **Watch the function logs!** They'll show in the `npx supabase functions serve` terminal

5. **Check logs:**
   - Look at the function serve terminal
   - You'll see:
     ```
     POST /functions/v1/analyze-vision
     200 OK
     Duration: 2.3s
     ```

6. **Monitor database:**
   - Go to: http://localhost:54321
   - Click "SQL Editor"
   - View tables being created/updated
   - Verify data storage

---

## 🐛 Debugging Tips

### View Function Logs

When a function runs, you'll see:
```
POST /functions/v1/analyze-vision
Function execution started: id = 12345
...function output...
Duration: 2.3s
Status: 200
```

### Add Console Logs

In any Edge Function (`supabase/functions/*/index.ts`):
```typescript
console.log('User ID:', userId)
console.log('Input data:', data)
```

These appear in the function serve terminal!

### Test Individual Functions

Use the Supabase Studio:
1. Go to: http://localhost:54321
2. Navigate to: Functions
3. Click on a function
4. Click "Invoke"
5. Provide test data
6. See response

### Check Database

1. Go to: http://localhost:54321
2. Navigate to: Tables
3. Check `generation_history` table
4. See what was saved

---

## ⚠️ Common Issues

### Functions not serving

**Problem:** `npx supabase functions serve` fails to start

**Solution:**
```bash
# Make sure Supabase started first
npx supabase status

# If not running, start it
npx supabase start

# Then try functions serve again
npx supabase functions serve
```

### "REPLICATE_API_TOKEN not found"

**Problem:** Video generation functions fail

**Solution:**
```bash
# Set environment variable before serving
set REPLICATE_API_TOKEN=r8_your_token_here

# Then serve
npx supabase functions serve
```

Or edit `.env.local` and use:
```bash
npx supabase functions serve --env-file .env.local
```

### "Cannot connect to localhost:54321"

**Problem:** App can't reach local Supabase

**Solution:**
1. Verify Supabase is running: `npx supabase status`
2. Update `.env.local`:
   ```dotenv
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart app: `npm run dev`

### Functions work locally but fail on cloud

**Problem:** Works on localhost:54321 but fails on Supabase cloud

**Solution:**
1. Check Edge Functions are deployed: `npx supabase functions list`
2. Check environment variables are set: `npx supabase secrets list`
3. Check CORS headers in function responses
4. Check cloud function logs in Supabase Dashboard

---

## 🧹 Cleanup

### Stop Local Environment

```bash
# Stop all local services
npx supabase stop

# Completely reset (WARNING: deletes local DB)
npx supabase stop --no-backup
```

### Clean Up Functions

```bash
# Remove all local function instances
npx supabase functions delete analyze-vision
```

---

## ✅ Testing Checklist

- [ ] Supabase started locally: `npx supabase status` shows all running
- [ ] Functions serving: `npx supabase functions serve` showing no errors
- [ ] App connected: `npm run dev` loads http://localhost:5173
- [ ] Can login: Create test account, login works
- [ ] Can configure: Business config saves
- [ ] Can upload images: Drag-drop works, preview shows
- [ ] Can analyze: Click "Analizar imágenes", logs appear in serve terminal
- [ ] Function responds: Logs show 200 OK
- [ ] Data saved: Check database in http://localhost:54321
- [ ] Ideas generated: Next step shows 6 ideas
- [ ] Can select options: Complete all 5 steps
- [ ] Video job submitted: Check logs for submit-video-job call
- [ ] Job ID returned: Progress bar starts
- [ ] Status polling works: See check-video-status calls every 5 seconds
- [ ] App handles errors: Try invalid inputs, see error messages

---

## 🎓 Learning Resources

### Supabase Local Development
- https://supabase.com/docs/guides/local-development

### Edge Functions
- https://supabase.com/docs/guides/functions

### Testing Best Practices
- https://supabase.com/docs/guides/functions/testing

---

## 🚀 Next Steps

1. **Test locally** using this guide
2. **Fix any issues** found during local testing
3. **Deploy to cloud** using `EDGE_FUNCTIONS_DEPLOY.md`
4. **Test on production** with real Replicate API
5. **Go live!** Push to GitHub and Vercel deploys

---

**Local testing complete? Ready to deploy to cloud? → Read `EDGE_FUNCTIONS_DEPLOY.md`**
