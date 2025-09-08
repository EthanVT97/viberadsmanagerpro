import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  date: string;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  created_at: string;
}

export function useCampaignAnalytics(campaignId?: string) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<CampaignAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    fetchAnalytics();
    
    // Set up real-time updates for active campaigns
    const interval = setInterval(() => {
      updateActiveAnalytics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user, campaignId]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('campaign_analytics')
        .select(`
          *,
          campaigns!inner (
            user_id,
            status
          )
        `)
        .eq('campaigns.user_id', user.id)
        .order('date', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateActiveAnalytics = async () => {
    if (!user) return;

    try {
      // Get active campaigns
      const { data: activeCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (activeCampaigns && activeCampaigns.length > 0) {
        // Update analytics for each active campaign
        for (const campaign of activeCampaigns) {
          await supabase.functions.invoke('update-campaign-analytics', {
            body: { 
              campaignId: campaign.id, 
              action: 'update' 
            }
          });
        }
        
        // Refresh analytics data
        await fetchAnalytics();
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  const getAnalyticsForCampaign = (campaignId: string) => {
    return analytics.filter(a => a.campaign_id === campaignId);
  };

  const getTotalAnalytics = () => {
    return analytics.reduce(
      (totals, day) => ({
        reach: totals.reach + day.reach,
        impressions: totals.impressions + day.impressions,
        clicks: totals.clicks + day.clicks,
        conversions: totals.conversions + day.conversions,
        spend: totals.spend + day.spend,
      }),
      { reach: 0, impressions: 0, clicks: 0, conversions: 0, spend: 0 }
    );
  };

  const getAnalyticsForDateRange = (startDate: string, endDate: string) => {
    return analytics.filter(a => {
      const date = new Date(a.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return date >= start && date <= end;
    });
  };

  return {
    analytics,
    loading,
    fetchAnalytics,
    updateActiveAnalytics,
    getAnalyticsForCampaign,
    getTotalAnalytics,
    getAnalyticsForDateRange
  };
}