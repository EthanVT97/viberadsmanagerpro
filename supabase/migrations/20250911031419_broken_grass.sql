/*
  # Make all packages unlimited

  1. Package Updates
    - Set all campaign limits to unlimited (-1 or very high number)
    - Set all monthly impressions to unlimited
    - Set all ads per campaign to unlimited

  2. Features
    - Remove all package restrictions
    - Allow unlimited campaigns, ads, and impressions for all packages
    - Maintain package pricing structure

  3. Security
    - Keep existing RLS policies
    - Ensure users can still only access their own data
*/

-- Update all existing packages to have unlimited limits
UPDATE packages SET 
  campaign_limit = 999999,
  monthly_impressions_limit = 999999999,
  ads_per_campaign_limit = 999999
WHERE id IN (
  SELECT id FROM packages WHERE is_active = true
);

-- Update the package features to reflect unlimited access
UPDATE packages SET 
  features = CASE 
    WHEN name = 'Business Exclusive' THEN 
      ARRAY['Unlimited campaigns', 'Unlimited monthly impressions', 'Unlimited ads per campaign', 'Exclusive business targeting', 'Premium ad placement', 'Myanmar market focus', 'iOS & Android reach']
    WHEN name = 'Display Reach' THEN 
      ARRAY['Unlimited campaigns', 'Unlimited monthly impressions', 'Unlimited ads per campaign', 'Display advertising', 'Wide audience reach', 'Myanmar market focus', 'iOS & Android reach']
    WHEN name = 'Daily Essentials' THEN 
      ARRAY['Unlimited campaigns', 'Unlimited monthly impressions', 'Unlimited ads per campaign', 'Daily engagement ads', 'Essential features', 'Myanmar market focus', 'iOS & Android reach']
    WHEN name = 'Video Pulse' THEN 
      ARRAY['Unlimited campaigns', 'Unlimited monthly impressions', 'Unlimited ads per campaign', 'Video advertising', 'High engagement', 'Myanmar market focus', 'iOS & Android reach']
    ELSE features
  END
WHERE name IN ('Business Exclusive', 'Display Reach', 'Daily Essentials', 'Video Pulse');

-- Update the functions to always return true for unlimited access
CREATE OR REPLACE FUNCTION can_user_create_campaign(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Always return true for unlimited access
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION can_user_create_ad(user_uuid uuid, campaign_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Always return true for unlimited access
  RETURN true;
END;
$$;

-- Update get_user_package_limits to return unlimited values
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
    999999 as campaign_limit,
    999999999 as monthly_impressions_limit,
    999999 as ads_per_campaign_limit,
    COALESCE(p.name, 'Free Trial') as package_name
  FROM subscriptions s
  JOIN packages p ON s.package_id = p.id
  WHERE s.user_id = user_uuid 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no active subscription found, still return unlimited limits
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 999999 as campaign_limit, 999999999 as monthly_impressions_limit, 999999 as ads_per_campaign_limit, 'Free Trial'::text as package_name;
  END IF;
END;
$$;