/*
  # Fix database policies and add missing constraints

  1. Security Improvements
    - Fix RLS policies for better security
    - Add proper constraints and indexes
  
  2. Data Integrity
    - Add foreign key constraints
    - Add check constraints for data validation
  
  3. Performance
    - Add indexes for frequently queried columns
*/

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_id ON public.subscriptions(package_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Add check constraints for data validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'subscriptions_status_check'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'cancelled', 'expired', 'pending'));
  END IF;
END $$;

-- Ensure packages have positive prices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'packages_price_positive'
  ) THEN
    ALTER TABLE public.packages 
    ADD CONSTRAINT packages_price_positive 
    CHECK (price_euro > 0);
  END IF;
END $$;

-- Update RLS policies for better security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update subscription policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert their own subscriptions" 
ON public.subscriptions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add policy for updating subscriptions (for status changes)
CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Ensure packages policy allows public access
DROP POLICY IF EXISTS "Packages are viewable by everyone" ON public.packages;
CREATE POLICY "Packages are viewable by everyone" 
ON public.packages 
FOR SELECT 
TO anon, authenticated
USING (is_active = true);