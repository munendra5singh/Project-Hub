-- ================================================================
-- MY SECURE VAULT - PRODUCTION HARDENED SUPABASE SCHEMA & RLS POLICIES
-- ================================================================
-- Paste this entire script into your Supabase Dashboard:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ================================================================

-- ----------------------------------------------------------------
-- 1. USER PROFILES TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Production-Optimized Profile RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ----------------------------------------------------------------
-- 2. ENCRYPTED VAULTS TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_vault TEXT NOT NULL,
  salt TEXT NOT NULL,
  verify_iv TEXT NOT NULL,
  verify_cipher TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on Vaults
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

-- Production-Optimized Vault RLS Policies (Owner Access Only)
DROP POLICY IF EXISTS "Users can view own vault" ON public.vaults;
CREATE POLICY "Users can view own vault"
  ON public.vaults FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own vault" ON public.vaults;
CREATE POLICY "Users can insert own vault"
  ON public.vaults FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own vault" ON public.vaults;
CREATE POLICY "Users can update own vault"
  ON public.vaults FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own vault" ON public.vaults;
CREATE POLICY "Users can delete own vault"
  ON public.vaults FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------
-- 3. SECURED AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    updated_at = now();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Catch any database trigger exception to prevent HTTP 500 on auth signup
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- 4. IDEMPOTENT REALTIME PUBLICATION SETUP
-- ----------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'vaults'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vaults;
  END IF;
END $$;
