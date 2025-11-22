# 📦 Deploy Database to Supabase Cloud

## What Gets Deployed

Your database includes:

### **Tables:**
- `business_config` - User business settings (logo, colors, social media, etc.)
- `generation_history` - Video generation history and job tracking

### **Storage Buckets:**
- `business-logos` - User business logos
- `background-music` - Background music files

### **Security:**
- Row Level Security (RLS) enabled
- Policies for user-specific data access
- Automatic user ID validation

---

## Step 1: Link Your Supabase Project

If not already linked:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

---

## Step 2: Push Migrations to Cloud

This will run all your migrations on the cloud database:

```powershell
npx supabase db push
```

Output should show:
```
✓ Migrations pushed successfully
✓ Tables created
✓ Indexes created
✓ RLS enabled
```

---

## Step 3: Verify Database in Cloud

### **Option A: Via CLI**
```powershell
# List all tables
npx supabase db tables

# View table structure
npx supabase db columns business_config
```

### **Option B: Via Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** or **Tables**
4. You should see:
   - `business_config` table
   - `generation_history` table
   - Both storage buckets

---

## Step 4: Create Storage Policies

Go to **Storage** in Supabase dashboard and add policies:

### **For `business-logos` bucket:**

**Public Read Policy:**
```sql
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-logos');
```

**User Upload Policy:**
```sql
CREATE POLICY "User Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-logos' 
    AND auth.uid()::text = owner
  );
```

### **For `background-music` bucket:**

```sql
CREATE POLICY "Public Read Music" ON storage.objects
  FOR SELECT USING (bucket_id = 'background-music');

CREATE POLICY "User Upload Music" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'background-music'
    AND auth.uid()::text = owner
  );
```

---

## Step 5: Enable Realtime (Optional)

If you want real-time updates on generation progress:

```powershell
# Enable realtime on generation_history table
npx supabase realtime enable -- --table generation_history
```

Or in the dashboard:
1. Go to **Realtime**
2. Click the table name
3. Toggle **Enable realtime**

---

## Complete Deployment Commands

Run these in order:

```powershell
cd C:\proyectos\ContentCreator

# 1. Link to cloud
npx supabase link --project-ref YOUR_PROJECT_REF

# 2. Push database
npx supabase db push

# 3. Verify
npx supabase db tables

# 4. Check migrations
npx supabase migrations list
```

---

## Verification Checklist

- [ ] `npx supabase link` succeeded
- [ ] `npx supabase db push` shows "✓ Migrations pushed"
- [ ] Can see `business_config` table in dashboard
- [ ] Can see `generation_history` table in dashboard
- [ ] Can see `business-logos` storage bucket
- [ ] Can see `background-music` storage bucket
- [ ] RLS policies are enabled on both tables

---

## Test the Database

### Via CLI:
```powershell
# Connect to cloud database
npx supabase db connect

# Query tables
SELECT * FROM business_config;
SELECT * FROM generation_history;
```

### Via Dashboard:
1. Go to **SQL Editor**
2. Run queries to test

---

## 🔄 Make Changes Later

If you need to modify the database schema:

1. Create a new migration:
   ```powershell
   npx supabase migration new add_new_column
   ```

2. Edit the migration file in `supabase/migrations/`

3. Push to cloud:
   ```powershell
   npx supabase db push
   ```

---

## ⚠️ Important Notes

### **Local vs Cloud**
- Local database is in Docker (your machine)
- Cloud database is on Supabase servers
- `npx supabase db push` syncs local → cloud

### **Data Loss Risk**
- ⚠️ **NEVER** run `npx supabase db reset` on a linked cloud project
- That will **delete all data**
- Use `db push` to apply migrations safely

### **RLS Policies**
- Enabled for security
- Prevents users from seeing other users' data
- Service role can bypass RLS (for admin/backend tasks)

---

## Troubleshooting

### **Error: "Not linked to project"**
```powershell
npx supabase link --project-ref YOUR_PROJECT_REF
```

### **Error: "Migration failed"**
Check the migration file syntax and ensure:
- No syntax errors
- Table/column names are correct
- Foreign keys reference existing tables

View the error:
```powershell
npx supabase migrations list --verbose
```

### **Tables not appearing in dashboard**
1. Refresh the page
2. Check that migrations completed
3. Verify user has correct Supabase role

---

## Next Steps

Once database is deployed:

1. Update `.env.local` with cloud credentials ✅
2. Deploy edge functions ✅
3. Run `npm run dev`
4. Test the full workflow:
   - Create business config
   - Upload images
   - Generate videos
   - Check generation_history table

Everything should work with your cloud database! 🎉
