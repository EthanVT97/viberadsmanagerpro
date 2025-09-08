/*
  # Enhanced analytics system for campaign tracking

  1. New Tables
    - Enhanced `campaign_analytics` with more detailed metrics
    - `ad_analytics` for individual ad performance tracking
    - `user_sessions` for tracking user engagement

  2. Functions
    - Analytics aggregation functions
    - Performance calculation functions
    - Real-time update triggers

  3. Security
    - Proper RLS policies for all analytics tables
    - User-specific data access controls
*/

-- Enhance campaign_analytics table with additional metrics
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_analytics' AND column_name = 'ctr'
  ) THEN
    ALTER TABLE campaign_analytics ADD COLUMN ctr numeric(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_analytics' AND column_name = 'cpc'
  ) THEN
    ALTER TABLE campaign_analytics ADD COLUMN cpc numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_analytics' AND column_name = 'cpa'
  ) THEN
    ALTER TABLE campaign_analytics ADD COLUMN cpa numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_analytics' AND column_name = 'roas'
  ) THEN
    ALTER TABLE campaign_analytics ADD COLUMN roas numeric(5,2) DEFAULT 0;
  END IF;
END $$;

-- Create ad_analytics table for individual ad tracking
CREATE TABLE IF NOT EXISTS ad_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  spend numeric(10,2) DEFAULT 0,
  reach integer DEFAULT 0,
  ctr numeric(5,2) DEFAULT 0,
  cpc numeric(10,2) DEFAULT 0,
  cpa numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(ad_id, date)
);

-- Enable RLS on ad_analytics
ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_analytics
CREATE POLICY IF NOT EXISTS "Users can view analytics for their ads"
  ON ad_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ad_analytics.ad_id
      AND ads.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can insert analytics for their ads"
  ON ad_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ad_analytics.ad_id
      AND ads.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "System can insert ad analytics"
  ON ad_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create user_sessions table for engagement tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  pages_viewed integer DEFAULT 0,
  campaigns_viewed integer DEFAULT 0,
  ads_created integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY IF NOT EXISTS "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to calculate campaign metrics
CREATE OR REPLACE FUNCTION calculate_campaign_metrics(campaign_uuid uuid)
RETURNS TABLE (
  total_impressions bigint,
  total_clicks bigint,
  total_conversions bigint,
  total_spend numeric,
  avg_ctr numeric,
  avg_cpc numeric,
  avg_cpa numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ca.impressions), 0)::bigint as total_impressions,
    COALESCE(SUM(ca.clicks), 0)::bigint as total_clicks,
    COALESCE(SUM(ca.conversions), 0)::bigint as total_conversions,
    COALESCE(SUM(ca.spend), 0) as total_spend,
    CASE 
      WHEN SUM(ca.impressions) > 0 
      THEN (SUM(ca.clicks)::numeric / SUM(ca.impressions) * 100)
      ELSE 0 
    END as avg_ctr,
    CASE 
      WHEN SUM(ca.clicks) > 0 
      THEN (SUM(ca.spend) / SUM(ca.clicks))
      ELSE 0 
    END as avg_cpc,
    CASE 
      WHEN SUM(ca.conversions) > 0 
      THEN (SUM(ca.spend) / SUM(ca.conversions))
      ELSE 0 
    END as avg_cpa
  FROM campaign_analytics ca
  WHERE ca.campaign_id = campaign_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update campaign totals
CREATE OR REPLACE FUNCTION update_campaign_totals()
RETURNS trigger AS $$
BEGIN
  -- Update campaign with aggregated analytics
  UPDATE campaigns 
  SET 
    impressions = (
      SELECT COALESCE(SUM(impressions), 0) 
      FROM campaign_analytics 
      WHERE campaign_id = NEW.campaign_id
    ),
    clicks = (
      SELECT COALESCE(SUM(clicks), 0) 
      FROM campaign_analytics 
      WHERE campaign_id = NEW.campaign_id
    ),
    conversions = (
      SELECT COALESCE(SUM(conversions), 0) 
      FROM campaign_analytics 
      WHERE campaign_id = NEW.campaign_id
    ),
    updated_at = now()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update campaign totals when analytics change
DROP TRIGGER IF EXISTS update_campaign_totals_trigger ON campaign_analytics;
CREATE TRIGGER update_campaign_totals_trigger
  AFTER INSERT OR UPDATE ON campaign_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_totals();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_analytics_ad_id ON ad_analytics(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_date ON ad_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON user_sessions(session_start DESC);