import { createClient } from 'npm:@supabase/supabase-js@2.56.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Campaign {
  id: string;
  created_at: string;
  status: string;
  budget_euro: number;
}

interface AnalyticsUpdate {
  campaignId: string;
  action: 'start' | 'update';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { campaignId, action }: AnalyticsUpdate = await req.json();

    console.log(`Processing analytics update for campaign ${campaignId}, action: ${action}`);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    if (action === 'start') {
      // Initialize analytics for newly started campaign
      await initializeCampaignAnalytics(supabaseClient, campaign);
    } else {
      // Update existing analytics
      await updateCampaignAnalytics(supabaseClient, campaign);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Analytics updated successfully' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error updating campaign analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function initializeCampaignAnalytics(supabaseClient: any, campaign: Campaign) {
  const now = new Date();
  const campaignStart = new Date(campaign.created_at);
  
  // Calculate days since campaign creation
  const daysSinceStart = Math.floor((now.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Initialize with realistic starting values
  const baseReach = Math.max(50, Math.floor(campaign.budget_euro * 0.1));
  const baseImpressions = Math.max(100, Math.floor(campaign.budget_euro * 0.2));
  const baseClicks = Math.max(5, Math.floor(baseImpressions * 0.02)); // 2% CTR
  const baseConversions = Math.max(1, Math.floor(baseClicks * 0.05)); // 5% conversion rate

  // Create initial analytics entry
  const { error } = await supabaseClient
    .from('campaign_analytics')
    .upsert({
      campaign_id: campaign.id,
      date: now.toISOString().split('T')[0],
      reach: baseReach,
      impressions: baseImpressions,
      clicks: baseClicks,
      conversions: baseConversions,
      spend: Math.floor(campaign.budget_euro * 0.1) // Start with 10% of budget
    });

  if (error) {
    console.error('Error initializing analytics:', error);
    throw error;
  }

  // Update campaign with initial metrics
  await supabaseClient
    .from('campaigns')
    .update({
      impressions: baseImpressions,
      clicks: baseClicks,
      conversions: baseConversions
    })
    .eq('id', campaign.id);

  console.log(`Initialized analytics for campaign ${campaign.id}`);
}

async function updateCampaignAnalytics(supabaseClient: any, campaign: Campaign) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get existing analytics for today
  const { data: existingAnalytics } = await supabaseClient
    .from('campaign_analytics')
    .select('*')
    .eq('campaign_id', campaign.id)
    .eq('date', today)
    .single();

  let newReach, newImpressions, newClicks, newConversions, newSpend;

  if (existingAnalytics) {
    // Gradual increase based on time of day and campaign performance
    const hourOfDay = new Date().getHours();
    const growthMultiplier = getGrowthMultiplier(hourOfDay);
    
    newReach = Math.floor(existingAnalytics.reach * growthMultiplier);
    newImpressions = Math.floor(existingAnalytics.impressions * growthMultiplier);
    newClicks = Math.floor(existingAnalytics.clicks * growthMultiplier);
    newConversions = Math.floor(existingAnalytics.conversions * growthMultiplier);
    newSpend = Math.floor(existingAnalytics.spend * growthMultiplier);
  } else {
    // First update of the day
    const baseGrowth = Math.random() * 0.2 + 0.9; // 90-110% of previous day
    newReach = Math.floor((campaign.impressions || 100) * baseGrowth);
    newImpressions = Math.floor((campaign.impressions || 150) * baseGrowth);
    newClicks = Math.floor((campaign.clicks || 10) * baseGrowth);
    newConversions = Math.floor((campaign.conversions || 2) * baseGrowth);
    newSpend = Math.floor(campaign.budget_euro * 0.05); // 5% daily spend
  }

  // Update or insert today's analytics
  const { error } = await supabaseClient
    .from('campaign_analytics')
    .upsert({
      campaign_id: campaign.id,
      date: today,
      reach: newReach,
      impressions: newImpressions,
      clicks: newClicks,
      conversions: newConversions,
      spend: newSpend
    });

  if (error) {
    console.error('Error updating analytics:', error);
    throw error;
  }

  // Update campaign totals
  const { data: totalAnalytics } = await supabaseClient
    .from('campaign_analytics')
    .select('impressions, clicks, conversions')
    .eq('campaign_id', campaign.id);

  if (totalAnalytics) {
    const totalImpressions = totalAnalytics.reduce((sum: number, day: any) => sum + (day.impressions || 0), 0);
    const totalClicks = totalAnalytics.reduce((sum: number, day: any) => sum + (day.clicks || 0), 0);
    const totalConversions = totalAnalytics.reduce((sum: number, day: any) => sum + (day.conversions || 0), 0);

    await supabaseClient
      .from('campaigns')
      .update({
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions
      })
      .eq('id', campaign.id);
  }

  console.log(`Updated analytics for campaign ${campaign.id}`);
}

function getGrowthMultiplier(hourOfDay: number): number {
  // Simulate realistic daily growth patterns
  if (hourOfDay >= 6 && hourOfDay <= 10) return 1.05; // Morning peak
  if (hourOfDay >= 11 && hourOfDay <= 14) return 1.03; // Lunch time
  if (hourOfDay >= 18 && hourOfDay <= 22) return 1.08; // Evening peak
  if (hourOfDay >= 23 || hourOfDay <= 5) return 1.01; // Overnight
  return 1.02; // Regular hours
}