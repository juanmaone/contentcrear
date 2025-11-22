-- Initialize storage buckets and database tables for ContentCreator

-- ===== STORAGE BUCKETS =====
INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'business-logos',
  'business-logos',
  NULL,
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'background-music',
  'background-music',
  NULL,
  true,
  52428800,
  ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ===== DATABASE TABLES =====

-- Create business_config table
CREATE TABLE IF NOT EXISTS public.business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  logo_url TEXT,
  address VARCHAR(500),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  website VARCHAR(255),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  music_url TEXT,
  hashtag VARCHAR(255),
  target_platforms TEXT[] DEFAULT ARRAY['instagram', 'tiktok', 'youtube'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create generation_history table
CREATE TABLE IF NOT EXISTS public.generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id VARCHAR(255),
  title VARCHAR(500),
  category VARCHAR(100),
  analysis_json JSONB,
  selected_idea JSONB,
  selected_copy VARCHAR(500),
  selected_style JSONB,
  video_url TEXT,
  status VARCHAR(50) DEFAULT 'processing',
  metadata_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_config_user_id ON public.business_config(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_status ON public.generation_history(status);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON public.generation_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.business_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_config
DROP POLICY IF EXISTS "Users can view own business config" ON public.business_config;
CREATE POLICY "Users can view own business config" ON public.business_config
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert own business config" ON public.business_config;
CREATE POLICY "Users can insert own business config" ON public.business_config
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own business config" ON public.business_config;
CREATE POLICY "Users can update own business config" ON public.business_config
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own business config" ON public.business_config;
CREATE POLICY "Users can delete own business config" ON public.business_config
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for generation_history
DROP POLICY IF EXISTS "Users can view own generation history" ON public.generation_history;
CREATE POLICY "Users can view own generation history" ON public.generation_history
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert own generation history" ON public.generation_history;
CREATE POLICY "Users can insert own generation history" ON public.generation_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own generation history" ON public.generation_history;
CREATE POLICY "Users can update own generation history" ON public.generation_history
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generation history" ON public.generation_history;
CREATE POLICY "Users can delete own generation history" ON public.generation_history
  FOR DELETE USING (auth.uid() = user_id);
