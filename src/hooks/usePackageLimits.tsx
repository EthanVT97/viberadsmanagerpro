import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PackageLimits {
  campaign_limit: number;
  monthly_impressions_limit: number;
  ads_per_campaign_limit: number;
  package_name: string;
}

export interface UsageStats {
  current_campaigns: number;
  current_monthly_impressions: number;
  campaigns_by_status: {
    active: number;
    paused: number;
    draft: number;
  };
}

export function usePackageLimits() {
  const { user } = useAuth();
  const [limits, setLimits] = useState<PackageLimits | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLimitsAndUsage();
    }
  }, [user]);

  const fetchLimitsAndUsage = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get package limits
      const { data: limitsData, error: limitsError } = await supabase
        .rpc('get_user_package_limits', { user_uuid: user.id });

      if (limitsError) throw limitsError;

      if (limitsData && limitsData.length > 0) {
        setLimits(limitsData[0]);
      } else {
        // Default limits for users without subscription
        setLimits({
          campaign_limit: 1,
          monthly_impressions_limit: 1000,
          ads_per_campaign_limit: 3,
          package_name: 'Free Trial'
        });
      }

      // Get current usage
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('status')
        .eq('user_id', user.id);

      if (campaignsError) throw campaignsError;

      const campaignsByStatus = {
        active: campaignsData?.filter(c => c.status === 'active').length || 0,
        paused: campaignsData?.filter(c => c.status === 'paused').length || 0,
        draft: campaignsData?.filter(c => c.status === 'draft').length || 0,
      };

      // Get monthly impressions (current month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('campaign_analytics')
        .select(`
          impressions,
          campaigns!inner (user_id)
        `)
        .eq('campaigns.user_id', user.id)
        .gte('date', `${currentMonth}-01`);

      if (analyticsError) throw analyticsError;

      const currentMonthlyImpressions = analyticsData?.reduce(
        (total, record) => total + (record.impressions || 0), 
        0
      ) || 0;

      setUsage({
        current_campaigns: campaignsData?.length || 0,
        current_monthly_impressions: currentMonthlyImpressions,
        campaigns_by_status: campaignsByStatus
      });

    } catch (error) {
      console.error('Error fetching limits and usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateCampaign = async (): Promise<boolean> => {
    // All users can create unlimited campaigns
    return true;
  };

  const canCreateAd = async (campaignId: string): Promise<boolean> => {
    if (!user || !campaignId) return false;
    
    // Check if campaign exists and belongs to user
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (error || !campaign) return false;
    
    // All users can create unlimited ads for their campaigns
    return true;
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    // Always return 0% since all packages are unlimited
    return 0;
  };

  const isNearLimit = (current: number, limit: number, threshold: number = 80): boolean => {
    // Never near limit since all packages are unlimited
    return false;
  };

  const isAtLimit = (current: number, limit: number): boolean => {
    // Never at limit since all packages are unlimited
    return false;
  };

  return {
    limits,
    usage,
    loading,
    fetchLimitsAndUsage,
    canCreateCampaign,
    canCreateAd,
    getUsagePercentage,
    isNearLimit,
    isAtLimit
  };
}