import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  targetAudience: string;
  description: string;
  createdAt: string;
}

const initialCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Myanmar Food Delivery',
    status: 'active',
    budget: 500,
    impressions: 12500,
    clicks: 340,
    conversions: 28,
    targetAudience: 'young-adults',
    description: 'Promote our food delivery service to young professionals in Yangon',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Fashion Store Promotion',
    status: 'paused',
    budget: 300,
    impressions: 8200,
    clicks: 156,
    conversions: 12,
    targetAudience: 'families',
    description: 'Seasonal fashion collection for families',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function useCampaigns() {
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('viber-campaigns', initialCampaigns);

  const addCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCampaigns(prev => [...prev, newCampaign]);
    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === id) {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        // Simulate some activity when activating
        const activityBoost = newStatus === 'active' ? {
          impressions: campaign.impressions + Math.floor(Math.random() * 1000),
          clicks: campaign.clicks + Math.floor(Math.random() * 50),
          conversions: campaign.conversions + Math.floor(Math.random() * 5)
        } : {};
        
        return { 
          ...campaign, 
          status: newStatus as 'active' | 'paused',
          ...activityBoost
        };
      }
      return campaign;
    }));
  };

  const getActiveCampaigns = () => campaigns.filter(c => c.status === 'active');
  const getTotalImpressions = () => campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const getTotalClicks = () => campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const getTotalConversions = () => campaigns.reduce((sum, c) => sum + c.conversions, 0);

  return {
    campaigns,
    setCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus,
    getActiveCampaigns,
    getTotalImpressions,
    getTotalClicks,
    getTotalConversions
  };
}