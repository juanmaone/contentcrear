# 🚀 Próximos Pasos - Fase 8-10 Roadmap

**Updated:** December 2024  
**Status:** READY TO START

---

## ⚡ Quick Start for Next Session

### 1. Supabase Setup (5 mins)
```bash
# Deploy Edge Functions to Supabase cloud
supabase functions deploy submit-video-job
supabase functions deploy check-video-status

# Set Replicate API Key
# Go to: https://supabase.com → Project → Functions → Secrets
# Add: REPLICATE_API_TOKEN = (get from replicate.com)
```

### 2. Verify Database Schema (5 mins)
```sql
-- Verify generation_history table has these columns:
SELECT * FROM generation_history LIMIT 1;

-- Required columns:
-- id, user_id, job_id, title, description, category
-- video_url, status, metadata_json, created_at, updated_at
```

### 3. Test Replicate Integration (10 mins)
```javascript
// In browser console on /crear page:
// Step through all 5 steps, click "Generar Video"
// Should:
// 1. Show loading toast
// 2. Submit to Replicate
// 3. Redirect to dashboard
// 4. Check console for jobId
```

---

## 📋 Phase 8: Polling & Progress (30-45 mins)

### What to Implement
```
User submits job with "Generar Video"
  ↓
Job appears in dashboard with "processing" status
  ↓
Every 5 seconds: check Replicate status via /check-video-status
  ↓
Update progress bar as percentage completes
  ↓
When status === "succeeded": 
  - Fetch video_url
  - Store in generation_history
  - Show video preview
  - Enable download/share buttons
```

### Files to Modify
1. `src/hooks/useGeneration.js` - Add polling logic
2. `src/pages/Dashboard.jsx` - Add status monitoring
3. `src/components/dashboard/GenerationCard.jsx` - Show progress

### Code Pattern
```javascript
// Start polling after job submission
const pollInterval = setInterval(async () => {
  const status = await pollVideoStatus(jobId)
  
  if (status.status === 'succeeded') {
    clearInterval(pollInterval)
    updateDatabase(jobId, { video_url: status.videoUrl, status: 'succeeded' })
  }
}, 5000)
```

---

## 📊 Phase 9: Dashboard History (45-60 mins)

### What to Implement
```
Dashboard shows all past generations with:
- Thumbnail (first frame or placeholder)
- Title, description, status
- Progress bar (if processing)
- Action buttons:
  - View (opens video viewer)
  - Download (downloads MP4)
  - Share (copies share link)
- Created date
- Filter by status/category
```

### Files to Create
1. `src/components/dashboard/HistoryGrid.jsx` - Grid of generations
2. `src/components/common/VideoViewer.jsx` - Video preview modal
3. `src/lib/storage.js` - Download/share utilities

### Database Query
```javascript
// Fetch user's generations
const { data: generations } = await supabase
  .from('generation_history')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

---

## 🎨 Phase 10: Mobile Polish (30-45 mins)

### What to Check
- [ ] All pages 100% mobile responsive
- [ ] Touch-friendly buttons (min 44px)
- [ ] Images optimized for mobile
- [ ] Forms mobile-friendly
- [ ] No horizontal scroll
- [ ] Fonts readable on small screens

### Testing Checklist
```
[ ] Open on iPhone SE (375px) - should work
[ ] Open on iPad (768px) - should be beautiful
[ ] Test all interactions on touch
[ ] Check landscape orientation
[ ] Test slow 3G network
[ ] Test with 100% zoom
```

### Tools
```
Chrome DevTools → Device Mode
Test each breakpoint:
- sm (640px)
- md (768px)
- lg (1024px)
- xl (1280px)
```

---

## 🎯 Phase 11: Deployment (30 mins)

### Pre-Deployment Checklist
- [ ] All Edge Functions deployed
- [ ] Database migrated to production
- [ ] Environment variables set
- [ ] API keys secure
- [ ] Tests passing
- [ ] Console errors: 0
- [ ] Performance acceptable

### Vercel Deployment
```bash
# Push to GitHub
git add .
git commit -m "Deploy Phase 8-10"
git push origin main

# Vercel auto-deploys on push
# Check: https://vercel.com → dashboard

# Set environment variables in Vercel:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Post-Deployment
```bash
# Test production build
npm run build
npm run preview

# Visit: https://your-domain.vercel.app
# Go through full flow
# Check all features work
```

---

## 🔑 Environment Variables Needed

### Supabase
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Replicate (Edge Function Secret)
```
REPLICATE_API_TOKEN=<token from replicate.com>
```

### Get from Supabase
```
1. Go to Project Settings → API
2. Copy "Project URL" → VITE_SUPABASE_URL
3. Copy "anon public" key → VITE_SUPABASE_ANON_KEY
```

### Get from Replicate
```
1. Go to https://replicate.com/account/api-tokens
2. Create API token
3. Add to Supabase Edge Function Secrets
```

---

## 📈 Success Metrics

After Phase 8-10, you should have:

| Metric | Target | How to Check |
|--------|--------|-------------|
| Build time | < 5s | `npm run build` |
| Bundle size | < 500KB | Build output |
| Lighthouse | > 80 | Chrome DevTools |
| API latency | < 2s | Network tab |
| Video generation | 1-5 min | Replicate dashboard |
| Uptime | > 99% | Vercel dashboard |

---

## 🎓 Learning Resources

- **Replicate Docs:** https://replicate.com/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Vercel Deployment:** https://vercel.com/docs
- **React Polling:** Search "React useEffect polling pattern"

---

## 💡 Pro Tips

1. **Testing:** Always test with real Replicate API key (costs credits)
2. **Polling:** Can adjust interval (5s default, 1s-30s reasonable)
3. **Progress:** Show estimated time based on model (Luma Ray 2 ≈ 2min)
4. **Error Handling:** Handle network errors, API rate limits
5. **UX:** Show spinners, disable buttons while generating
6. **Performance:** Lazy load GenerationCard components

---

## 🐛 Common Issues & Solutions

### "Job not found on Replicate"
- Check jobId is correct (copy from browser console)
- Verify REPLICATE_API_TOKEN is set
- Check Replicate API status

### "Video URL is null"
- Replicate job might still be processing
- Check `status` is "succeeded" before accessing URL
- Increase polling timeout

### "Edge Function timeout"
- Replicate API might be slow
- Increase timeout in pollVideoStatus() maxAttempts
- Check Replicate dashboard for job status

### "Mobile layout broken"
- Check Tailwind breakpoints (sm, md, lg, xl)
- Use `grid grid-cols-1 md:grid-cols-2` pattern
- Test on actual device (not just DevTools)

---

## 📞 Getting Help

If you get stuck:

1. **Check console logs** - Browser console + Vercel logs
2. **Check Supabase logs** - Project → Logs section
3. **Check Replicate logs** - Replicate dashboard → Job history
4. **Test isolat ed** - Test Edge Functions with curl:
   ```bash
   curl -X POST https://xxx.supabase.co/functions/v1/submit-video-job \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"videoModel":"luma-ray-2","prompt":"test","duration":15}'
   ```

---

## ✅ Pre-Flight Checklist

Before starting Session 3:

- [ ] Read this file completely
- [ ] Ensure Supabase project is ready
- [ ] Get Replicate API key
- [ ] Deploy Edge Functions locally
- [ ] Run `npm run dev`
- [ ] Test full flow (Steps 1-5)
- [ ] Have browser console open
- [ ] Coffee ready ☕

---

## 🎬 Expected Outcomes

After Phases 8-10:

**Phase 8 Complete:**
- Videos show progress while generating
- Dashboard updates in real-time
- User knows job status at all times

**Phase 9 Complete:**
- See all past videos
- Download/share finished videos
- Beautiful history grid

**Phase 10 Complete:**
- Works perfectly on mobile
- Professional appearance
- Ready for user testing

**Phase 11 Complete:**
- Live at custom domain
- Production-ready security
- Available 24/7

---

## 🚀 You've Got This!

Everything is set up. You have:
✅ Clean code  
✅ Good architecture  
✅ Security built-in  
✅ Documentation  
✅ Clear next steps  

**Just execute the phases in order and you'll have a production MVP.**

---

**Next Session: Start with Phase 8!**  
**Estimated time: 2-3 hours for Phases 8-10**  
**Then deploy and celebrate! 🎉**
