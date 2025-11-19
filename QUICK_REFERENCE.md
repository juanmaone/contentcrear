# 🚀 DEPLOY IN 25 MINUTES - QUICK START

## ⚡ What You Need

```
✓ Supabase project reference ID
✓ Supabase access token  
✓ Replicate API token
✓ GitHub account
✓ Terminal open at: c:\proyectos\ContentCreator
```

## 1️⃣ Deploy Edge Functions (10 min)

```powershell
npx supabase link --project-ref YOUR-REF
npx supabase functions deploy analyze-vision
npx supabase functions deploy generate-ideas
npx supabase functions deploy generate-copy
npx supabase functions deploy generate-styles
npx supabase functions deploy submit-video-job
npx supabase functions deploy check-video-status
npx supabase secrets set REPLICATE_API_TOKEN=r8_YOUR_TOKEN
```

**Verify:** `npx supabase functions list` (shows 6 functions)

## 2️⃣ Push to GitHub (2 min)

```powershell
git add .
git commit -m "Deploy: Edge Functions to cloud"
git push origin main
```

**Wait:** Vercel auto-deploys (check dashboard)

## 3️⃣ Test (10 min)

- Open Vercel URL
- Create account
- Upload image
- Generate video
- Download result

**Done!** 🎉

---

## 🔴 Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't link Supabase | Check project ref and token |
| Functions won't deploy | Run `npx supabase status` |
| Video gen fails | Check REPLICATE_API_TOKEN is set |
| App won't load | Check Vercel env vars match Supabase |

---

## 📖 Need Details?

- **Full checklist:** `FINAL_CHECKLIST.md`
- **Detailed guide:** `EDGE_FUNCTIONS_DEPLOY.md`
- **Troubleshooting:** `DEPLOYMENT_GUIDE.md`

**You've got this!** 🚀
