-- Add test user and fix RLS policies

-- Create test user (will be created via Auth UI, this is just for reference)
-- Email: juanmafunes@gmail.com
-- Password: Martin18

-- Fix RLS policies to allow proper access
DROP POLICY IF EXISTS "Users can insert own business config" ON public.business_config;
CREATE POLICY "Users can insert own business config" ON public.business_config
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own generation history" ON public.generation_history;
CREATE POLICY "Users can insert own generation history" ON public.generation_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
