# 🚀 ReelMaker Pro 2025 - QUICK START

## ⚡ 5-Minute Setup

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Start dev server
npm run dev
# Opens http://localhost:5174

# 4. Done! 🎉
```

## 📋 .env.local Variables

```
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_OPENAI_API_KEY=sk-...
VITE_REPLICATE_API_TOKEN=r8_...
VITE_ELEVENLABS_API_KEY=...
```

Get these from:
- Supabase: Project Settings
- OpenAI: https://platform.openai.com/api-keys
- Replicate: https://replicate.com/account
- ElevenLabs: https://elevenlabs.io/

## 🔧 For Phase 5 (Vision API)

```bash
# In another terminal, run Edge Functions
supabase functions serve

# Then test:
curl -X POST http://localhost:54321/functions/v1/analyze-vision \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageUrls": ["..."], "category": "restaurante", "businessName": "Test"}'
```

See `PHASE5_GUIDE.md` for full integration steps.

## 📁 Project Structure

```
src/
├── hooks/           # useAuth, useBusinessConfig, useGeneration
├── pages/           # Login, Register, Dashboard, Crear, etc.
├── components/      # UI components (Button, Card, Input)
├── lib/             # Supabase & OpenAI wrappers
└── utils/           # Constants, helpers, templates

supabase/functions/ # 4 Edge Functions (TypeScript/Deno)
├── analyze-vision/
├── generate-ideas/
├── generate-copy/
└── generate-styles/
```

## 🎯 App Flow

1. **Signup/Login** → `/auth`
2. **Configure Business** → `/configuracion`
3. **Create Reel** → `/crear` (5 steps)
   - Step 1: Upload images
   - Step 2: AI analyzes → shows 6 ideas
   - Step 3: Choose copy variant
   - Step 4: Choose video style
   - Step 5: Choose voice → Generate!
4. **Dashboard** → `/dashboard` (history, download, share)

## 📚 Documentation

- **SETUP.md** - Detailed configuration
- **README_APP.md** - Features & user guide
- **PHASE5_GUIDE.md** - Vision API integration
- **PROJECT_CARD.md** - Full project overview
- **SESSION_SUMMARY.md** - Progress & next steps

## 🛠 Build & Deploy

```bash
# Production build
npm run build

# Preview locally
npm run preview

# Deploy to Vercel
# (Connect your GitHub repo to Vercel)
```

## ❓ Troubleshooting

**Error: Cannot connect to Supabase**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Error: OpenAI API failed**
- Verify API key is correct
- Check quota in OpenAI dashboard

**Error: Edge Function not found**
- Run `supabase functions serve` in another terminal
- Or deploy to Supabase cloud

See **PHASE5_GUIDE.md** for more troubleshooting.

## 🎓 Tech Stack

- **React 19** + **Vite 7** ⚡
- **Tailwind CSS** 🎨
- **Supabase** (Auth, DB, Storage, Edge Functions)
- **OpenAI GPT-4o** + **Vision** 🤖
- **Replicate** (video generation)
- **Vercel** (deployment)

## ✨ Key Features

✅ AI image analysis (GPT-4o Vision)  
✅ 6 viral ideas per image  
✅ 5 copy variations per idea  
✅ 4 video styles to choose from  
✅ 4 voice options (TTS)  
✅ One-click video generation  
✅ Download & share ready  

## 🚀 Next Steps

1. **Phase 5**: Connect Vision API (30 min)
2. **Phase 6**: Polish selection UI (45 min)
3. **Phase 7**: Voice + Timeline (45 min)
4. **Phase 8**: Video generation (1.5 hrs)
5. **Phase 9**: History & dashboard (1 hr)
6. **Phase 10**: Deploy! 🎉

See `PROJECT_CARD.md` for full roadmap.

## 📞 Questions?

Check the documentation files:
- `SETUP.md` - Setup issues
- `PHASE5_GUIDE.md` - Integration help
- `README_APP.md` - Feature questions

---

**Ready? Run `npm run dev` and let's go! 🚀**
