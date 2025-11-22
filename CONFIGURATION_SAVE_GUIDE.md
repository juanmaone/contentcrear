# ✅ Configuration Save - Complete Guide

## What Just Changed

Updated `useBusinessConfig.js` hook to **properly upload files to S3** instead of using data URLs:

✅ **Logo** → Uploaded to `business-logos` S3 bucket  
✅ **Music** → Uploaded to `background-music` S3 bucket  
✅ **User Data** → Saved to `business_config` database table  
✅ **RLS Policies** → Added storage bucket permissions

---

## 📋 Step-by-Step: How Configuration Save Works Now

### **1. User fills form & clicks "Guardar configuración"**

```
Business Name: "Mi Negocio"
Category: "Restaurante"
Logo: [uploads file.png]
Music: [uploads song.mp3]
Colors, Contact Info, etc.
```

### **2. Logo Upload to S3**

```javascript
// File saved to: business-logos/{user-id}/{timestamp}_{filename}
// Example: business-logos/550e8400-e29b-41d4-a716-446655440000/1700000000000_logo.png
// Public URL: https://[PROJECT].supabase.co/storage/v1/object/public/business-logos/...
```

### **3. Music Upload to S3**

```javascript
// File saved to: background-music/{user-id}/{timestamp}_{filename}
// Example: background-music/550e8400-e29b-41d4-a716-446655440000/1700000000000_song.mp3
// Public URL: https://[PROJECT].supabase.co/storage/v1/object/public/background-music/...
```

### **4. Database Record Created/Updated**

```sql
INSERT INTO business_config (
  user_id,
  business_name,
  category,
  logo_url,         -- S3 public URL
  music_url,        -- S3 public URL
  address,
  phone,
  whatsapp,
  email,
  instagram,
  facebook,
  website,
  primary_color,
  secondary_color,
  hashtag,
  created_at,
  updated_at
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Mi Negocio',
  'Restaurante',
  'https://[PROJECT].supabase.co/storage/v1/object/public/business-logos/...',
  'https://[PROJECT].supabase.co/storage/v1/object/public/background-music/...',
  ...
)
```

---

## 🚀 Local Testing (Supabase Docker)

### **1. Apply Storage RLS Migration**

```powershell
cd C:\proyectos\ContentCreator
npx supabase migration up
```

Or manually:
```sql
-- In Supabase Studio, run DEPLOY_DATABASE.md SQL
-- Or execute supabase/migrations/20250120_storage_rls.sql
```

### **2. Start Supabase (if not running)**

```powershell
# Terminal 1
npx supabase start
```

### **3. Start Development Server**

```powershell
# Terminal 2
npm run dev
```

Opens: http://localhost:5173

### **4. Test Configuration Save**

1. Login to the app
2. Go to "Configuración" page
3. Fill out form:
   - Business Name: "Test Shop"
   - Category: "Retail"
   - Upload a PNG/JPG logo (5MB max)
   - Upload an MP3 music file (20MB max)
   - Fill contact info
4. Click "Guardar configuración"

### **5. Verify in Supabase Studio**

**Check Database:**
```powershell
# Open Supabase Studio
npx supabase studio
```

Navigate to:
- Table → `public.business_config`
- Should see 1 row with your data
- `logo_url` = S3 URL
- `music_url` = S3 URL

**Check Storage:**
- Storage → `business-logos` → Should see your logo
- Storage → `background-music` → Should see your music

---

## ☁️ Cloud Deployment (Supabase Cloud)

### **1. Push Migration to Cloud**

```powershell
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### **2. Verify Cloud Storage**

In Supabase Dashboard:
- Project → Storage → should have both buckets
- Tables → business_config should exist

### **3. Test with Cloud URLs**

Update `.env.local`:
```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Then test the same way as local.

---

## 🔍 Debugging: What to Check

### **Logo/Music Upload Fails**

**Error:** "Failed to upload logo"

**Causes & Fixes:**

1. **Storage bucket doesn't exist**
   ```powershell
   npx supabase storage buckets list
   ```
   Should show: `business-logos`, `background-music`
   
   If missing, run:
   ```powershell
   npx supabase migration up
   ```

2. **RLS policy blocks upload**
   
   Check console logs:
   ```javascript
   // If you see "permission denied"
   // Run: CREATE POLICY statements in DEPLOY_DATABASE.md
   ```

3. **File size exceeds limit**
   - Logo max: 10 MB
   - Music max: 50 MB

4. **Wrong MIME types**
   - Logo: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
   - Music: `audio/mpeg`, `audio/wav`, `audio/ogg`

### **Database Save Fails**

**Error:** "Error saving business config"

**Causes & Fixes:**

1. **User not authenticated**
   ```javascript
   // Check useAuth hook returns valid user
   ```

2. **RLS policy blocks insert**
   ```sql
   -- Check business_config insert policy exists
   SELECT * FROM pg_policies WHERE tablename = 'business_config';
   ```

3. **Invalid column data**
   - `business_name` is required
   - Colors must be hex: `#RRGGBB`
   - Emails must be valid format

### **S3 URLs Not Saved**

**Issue:** Database saved but logo_url/music_url are NULL

**Causes & Fixes:**

1. **Upload succeeded but didn't get public URL**
   ```javascript
   // Check: supabase.storage.from('business-logos').getPublicUrl()
   ```

2. **File path not accessible**
   ```sql
   -- Make sure buckets are public
   SELECT id, name, public FROM storage.buckets;
   ```

---

## 📊 Database Schema Check

Verify all columns exist:

```powershell
# In Supabase Studio → SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'business_config'
ORDER BY ordinal_position;
```

Should include:
```
id                  | uuid
user_id             | uuid
business_name       | character varying
category            | character varying
logo_url            | text ✅
music_url           | text ✅
address             | character varying
phone               | character varying
whatsapp            | character varying
email               | character varying
instagram           | character varying
facebook            | character varying
website             | character varying
primary_color       | character varying
secondary_color     | character varying
hashtag             | character varying
created_at          | timestamp with time zone
updated_at          | timestamp with time zone
```

---

## 🔐 Security: RLS Policies Explained

**Storage Policies:**
```sql
-- Anyone can VIEW logos/music (public content)
SELECT ✅

-- Users can UPLOAD to their folder only
INSERT ✅ if path starts with: {user-id}/

-- Users can UPDATE/DELETE their own files only
UPDATE/DELETE ✅ if path starts with: {user-id}/
```

**Database Policies:**
```sql
-- Users can only SELECT/INSERT/UPDATE/DELETE their own config
WHERE auth.uid() = user_id
```

---

## ✅ Success Indicators

When configuration save works correctly:

1. **Toast message:** "¡Configuración guardada!"
2. **Redirects to:** `/dashboard`
3. **In database:**
   - 1 row in `business_config`
   - All fields filled
   - `logo_url` starts with: `https://[PROJECT].supabase.co/storage/v1/object/public/business-logos/`
   - `music_url` starts with: `https://[PROJECT].supabase.co/storage/v1/object/public/background-music/`
4. **In storage:**
   - Logo file visible in `business-logos` bucket
   - Music file visible in `background-music` bucket
5. **Reload page:**
   - Form repopulates with saved data
   - Logo preview displays
   - Music file selected

---

## 🧪 Manual S3 Upload Test (curl)

Test upload directly:

```powershell
$userId = "550e8400-e29b-41d4-a716-446655440000"
$anonKey = "eyJ..."
$projectUrl = "https://YOUR_PROJECT_REF.supabase.co"

# Upload test file
curl -X POST "$projectUrl/storage/v1/object/business-logos/$userId/test.txt" `
  -H "Authorization: Bearer $anonKey" `
  -H "Content-Type: text/plain" `
  -d "test content"
```

If successful: Returns file metadata

---

## 🎯 Next Steps

1. ✅ Apply migration: `npx supabase migration up`
2. ✅ Test locally with Supabase Docker
3. ✅ Verify files in storage + data in database
4. ✅ Deploy to cloud: `npx supabase db push`
5. ✅ Test with cloud endpoints

---

## 📞 Quick Reference

| Component | Status | Location |
|-----------|--------|----------|
| Logo Upload | ✅ Updated | `useBusinessConfig.js` |
| Music Upload | ✅ Updated | `useBusinessConfig.js` |
| Database Save | ✅ Working | `business_config` table |
| Storage RLS | ✅ New | `20250120_storage_rls.sql` |
| Form UI | ✅ Existing | `Configuracion.jsx` |

All ready to test! 🚀
