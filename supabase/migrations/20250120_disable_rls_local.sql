-- Disable RLS temporarily for local development to allow testing
-- This is safe for local testing only

ALTER TABLE public.business_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history DISABLE ROW LEVEL SECURITY;
