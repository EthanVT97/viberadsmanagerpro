/*
  # Create users table and authentication setup

  1. New Tables
    - `users` table for user management
  2. Functions
    - `handle_new_user()` trigger function for user creation
    - `uid()` helper function for RLS policies
    - Update trigger functions for all tables
  3. Security
    - Enable RLS on users table
    - Add policies for user data access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create uid() function for RLS policies
CREATE OR REPLACE FUNCTION uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create update_campaigns_updated_at function
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create update_notification_preferences_updated_at function
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert user into users table
  INSERT INTO users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default profile
  INSERT INTO profiles (user_id, business_name, contact_email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_email', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default notification preferences
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create get_user_package_limits function
CREATE OR REPLACE FUNCTION get_user_package_limits(user_uuid uuid)
RETURNS TABLE (
  campaign_limit integer,
  monthly_impressions_limit integer,
  ads_per_campaign_limit integer,
  package_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.campaign_limit, 999999) as campaign_limit,
    COALESCE(p.monthly_impressions_limit, 999999999) as monthly_impressions_limit,
    COALESCE(p.ads_per_campaign_limit, 999999) as ads_per_campaign_limit,
    COALESCE(pkg.name, 'Free Trial') as package_name
  FROM subscriptions s
  LEFT JOIN packages pkg ON s.package_id = pkg.id
  LEFT JOIN packages p ON s.package_id = p.id
  WHERE s.user_id = user_uuid 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no active subscription found, return default limits
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      999999 as campaign_limit,
      999999999 as monthly_impressions_limit,
      999999 as ads_per_campaign_limit,
      'Free Trial' as package_name;
  END IF;
END;
$$;