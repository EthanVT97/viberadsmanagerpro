/*
  # Create missing tables and functions for complete functionality

  1. New Tables
    - `notifications` - User notifications system
    - `notification_preferences` - User notification settings
    - `users` - User management table (if not exists from auth)

  2. Functions
    - `uid()` - Get current user ID
    - `get_user_package_limits` - Get user package limits
    - `can_user_create_campaign` - Check campaign creation permission
    - `can_user_create_ad` - Check ad creation permission
    - `update_updated_at_column` - Generic updated_at trigger function

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data access
*/

-- Create users table if it doesn't exist (for auth integration)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('campaign', 'performance', 'billing', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_campaigns boolean DEFAULT true,
  email_performance boolean DEFAULT true,
  email_billing boolean DEFAULT true,
  email_system boolean DEFAULT true,
  push_campaigns boolean DEFAULT false,
  push_performance boolean DEFAULT true,
  push_billing boolean DEFAULT true,
  push_system boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create uid() function if it doesn't exist
CREATE OR REPLACE FUNCTION uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create function to get user package limits
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
    COALESCE(p.campaign_limit, 1) as campaign_limit,
    COALESCE(p.monthly_impressions_limit, 1000) as monthly_impressions_limit,
    COALESCE(p.ads_per_campaign_limit, 3) as ads_per_campaign_limit,
    COALESCE(p.name, 'Free Trial') as package_name
  FROM subscriptions s
  JOIN packages p ON s.package_id = p.id
  WHERE s.user_id = user_uuid 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no active subscription found, return default limits
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 1 as campaign_limit, 1000 as monthly_impressions_limit, 3 as ads_per_campaign_limit, 'Free Trial'::text as package_name;
  END IF;
END;
$$;

-- Create function to check if user can create campaign
CREATE OR REPLACE FUNCTION can_user_create_campaign(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_campaigns integer;
  campaign_limit integer;
BEGIN
  -- Get current campaign count
  SELECT COUNT(*) INTO current_campaigns
  FROM campaigns
  WHERE user_id = user_uuid;
  
  -- Get campaign limit
  SELECT gl.campaign_limit INTO campaign_limit
  FROM get_user_package_limits(user_uuid) gl;
  
  RETURN current_campaigns < campaign_limit;
END;
$$;

-- Create function to check if user can create ad
CREATE OR REPLACE FUNCTION can_user_create_ad(user_uuid uuid, campaign_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_ads integer;
  ads_limit integer;
BEGIN
  -- Get current ads count for the campaign
  SELECT COUNT(*) INTO current_ads
  FROM ads
  WHERE user_id = user_uuid AND campaign_id = campaign_uuid;
  
  -- Get ads per campaign limit
  SELECT gl.ads_per_campaign_limit INTO ads_limit
  FROM get_user_package_limits(user_uuid) gl;
  
  RETURN current_ads < ads_limit;
END;
$$;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create RLS policies for notification preferences
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "Users can manage their own notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Add updated_at triggers
CREATE TRIGGER IF NOT EXISTS update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default packages if they don't exist
INSERT INTO packages (id, name, description, price_euro, features, campaign_limit, monthly_impressions_limit, ads_per_campaign_limit)
VALUES 
  ('pkg_business_exclusive', 'Business Exclusive', 'Rakuten Viber - Mobile Application - IOS and ANDROID', 15000, 
   ARRAY['Up to 5 campaigns', 'Up to 50,000 monthly impressions', '10 ads per campaign', 'Exclusive business targeting', 'Premium ad placement', 'Myanmar market focus', 'iOS & Android reach'],
   5, 50000, 10),
  ('pkg_display_reach', 'Display Reach', 'Rakuten Viber - Mobile Application - IOS and ANDROID', 15000,
   ARRAY['Up to 3 campaigns', 'Up to 30,000 monthly impressions', '5 ads per campaign', 'Display advertising', 'Wide audience reach', 'Myanmar market focus', 'iOS & Android reach'],
   3, 30000, 5),
  ('pkg_daily_essentials', 'Daily Essentials', 'Rakuten Viber - Mobile Application - IOS and ANDROID', 15000,
   ARRAY['Up to 2 campaigns', 'Up to 15,000 monthly impressions', '3 ads per campaign', 'Daily engagement ads', 'Essential features', 'Myanmar market focus', 'iOS & Android reach'],
   2, 15000, 3),
  ('pkg_video_pulse', 'Video Pulse', 'Rakuten Viber - Mobile Application - IOS and ANDROID', 20000,
   ARRAY['Up to 10 campaigns', 'Up to 100,000 monthly impressions', '15 ads per campaign', 'Video advertising', 'High engagement', 'Myanmar market focus', 'iOS & Android reach'],
   10, 100000, 15)
ON CONFLICT (id) DO NOTHING;