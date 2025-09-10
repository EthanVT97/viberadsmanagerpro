/*
  # Add package-based campaign limits

  1. Schema Updates
    - Add campaign_limit column to packages table
    - Add monthly_impressions_limit column to packages table
    - Update existing packages with appropriate limits

  2. Functions
    - Function to check if user can create new campaign
    - Function to get user's current package limits

  3. Security
    - Ensure users can only create campaigns within their package limits
    - Add validation for campaign creation based on subscription
*/

-- Add campaign limits to packages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'campaign_limit'
  ) THEN
    ALTER TABLE packages ADD COLUMN campaign_limit integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'monthly_impressions_limit'
  ) THEN
    ALTER TABLE packages ADD COLUMN monthly_impressions_limit integer DEFAULT 1000;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'ads_per_campaign_limit'
  ) THEN
    ALTER TABLE packages ADD COLUMN ads_per_campaign_limit integer DEFAULT 3;
  END IF;
END $$;

-- Update existing packages with appropriate limits
UPDATE packages SET 
  campaign_limit = CASE 
    WHEN name = 'Business Exclusive' THEN 5
    WHEN name = 'Display Reach' THEN 3
    WHEN name = 'Daily Essentials' THEN 2
    WHEN name = 'Video Pulse' THEN 10
    ELSE 1
  END,
  monthly_impressions_limit = CASE 
    WHEN name = 'Business Exclusive' THEN 50000
    WHEN name = 'Display Reach' THEN 30000
    WHEN name = 'Daily Essentials' THEN 15000
    WHEN name = 'Video Pulse' THEN 100000
    ELSE 1000
  END,
  ads_per_campaign_limit = CASE 
    WHEN name = 'Business Exclusive' THEN 10
    WHEN name = 'Display Reach' THEN 5
    WHEN name = 'Daily Essentials' THEN 3
    WHEN name = 'Video Pulse' THEN 15
    ELSE 3
  END
WHERE name IN ('Business Exclusive', 'Display Reach', 'Daily Essentials', 'Video Pulse');

-- Create function to get user's current package limits
CREATE OR REPLACE FUNCTION get_user_package_limits(user_uuid uuid)
RETURNS TABLE (
  campaign_limit integer,
  monthly_impressions_limit integer,
  ads_per_campaign_limit integer,
  package_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.campaign_limit,
    p.monthly_impressions_limit,
    p.ads_per_campaign_limit,
    p.name as package_name
  FROM packages p
  JOIN subscriptions s ON s.package_id = p.id
  WHERE s.user_id = user_uuid 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can create new campaign
CREATE OR REPLACE FUNCTION can_user_create_campaign(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  user_campaign_count integer;
  user_limit integer;
BEGIN
  -- Get current campaign count
  SELECT COUNT(*) INTO user_campaign_count
  FROM campaigns
  WHERE user_id = user_uuid AND status IN ('active', 'paused', 'draft');

  -- Get user's campaign limit
  SELECT campaign_limit INTO user_limit
  FROM get_user_package_limits(user_uuid);

  -- If no active subscription, allow 1 free campaign
  IF user_limit IS NULL THEN
    user_limit := 1;
  END IF;

  RETURN user_campaign_count < user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can create new ad in campaign
CREATE OR REPLACE FUNCTION can_user_create_ad(user_uuid uuid, campaign_uuid uuid)
RETURNS boolean AS $$
DECLARE
  campaign_ad_count integer;
  user_limit integer;
BEGIN
  -- Get current ad count for this campaign
  SELECT COUNT(*) INTO campaign_ad_count
  FROM ads
  WHERE campaign_id = campaign_uuid AND user_id = user_uuid;

  -- Get user's ads per campaign limit
  SELECT ads_per_campaign_limit INTO user_limit
  FROM get_user_package_limits(user_uuid);

  -- If no active subscription, allow 3 ads per campaign
  IF user_limit IS NULL THEN
    user_limit := 3;
  END IF;

  RETURN campaign_ad_count < user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ads_campaign_user ON ads(campaign_id, user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);