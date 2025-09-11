import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  BarChart3,
  Eye,
  MousePointer,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePackageLimits } from "@/hooks/usePackageLimits";

interface Campaign {
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

interface CampaignManagerProps {
  campaigns: Campaign[];
  onCampaignsChange: () => void;
}

export default function CampaignManager({ campaigns, onCampaignsChange }: CampaignManagerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canCreateCampaign, limits, usage, isAtLimit } = usePackageLimits();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    targetAudience: '',
    description: ''
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: '',
      budget: '',
      targetAudience: '',
      description: ''
    });
  };

  const handleCreateCampaign = async () => {
    if (!formData.name || !formData.budget || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in campaign name and budget.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name: formData.name,
          status: 'draft',
          budget_euro: parseInt(formData.budget) * 100, // Convert to cents
          target_audience: formData.targetAudience,
          description: formData.description
        });

      if (error) throw error;

      resetForm();
      setShowCreateDialog(false);
      onCampaignsChange();

      toast({
        title: "Campaign created!",
        description: "Your new campaign has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating campaign",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCampaign = async () => {
    if (!editingCampaign || !formData.name || !formData.budget || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in campaign name and budget.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          name: formData.name,
          budget_euro: parseInt(formData.budget) * 100, // Convert to cents
          target_audience: formData.targetAudience,
          description: formData.description
        })
        .eq('id', editingCampaign.id)
        .eq('user_id', user.id);

      if (error) throw error;

      resetForm();
      setEditingCampaign(null);
      onCampaignsChange();

      toast({
        title: "Campaign updated!",
        description: "Your campaign has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating campaign",
        description: error.message || "Failed to update campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaignStatus = async (campaignId: string) => {
    if (!user) return;
    
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    
    // Check if campaign has ads with content before activating
    if (newStatus === 'active') {
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('id, image_url, video_url, headline, description')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id);

      if (adsError || !adsData || adsData.length === 0) {
        toast({
          title: "No ads found",
          description: "Please create ads with images and content before activating the campaign.",
          variant: "destructive",
        });
        return;
      }

      // Check if ads have required content
      const adsWithContent = adsData.filter(ad => 
        (ad.image_url || ad.video_url) && ad.headline && ad.description
      );

      if (adsWithContent.length === 0) {
        toast({
          title: "Incomplete ad content",
          description: "Ads must have images/videos, headlines, and descriptions before campaign activation.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If activating campaign, start analytics tracking
      if (newStatus === 'active') {
        await supabase.functions.invoke('update-campaign-analytics', {
          body: { campaignId, action: 'start' }
        });
      }

      onCampaignsChange();

      toast({
        title: newStatus === 'paused' 
          ? "Campaign paused" 
          : "Campaign activated",
        description: newStatus === 'paused' 
          ? `${campaign.name} has been paused.` 
          : `${campaign.name} is now active. Analytics will update gradually.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating campaign",
        description: error.message || "Failed to update campaign status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!user) return;
    
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    setLoading(true);
    try {
      // First delete all ads in the campaign
      const { error: adsError } = await supabase
        .from('ads')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id);

      if (adsError) throw adsError;

      // Then delete campaign analytics
      const { error: analyticsError } = await supabase
        .from('campaign_analytics')
        .delete()
        .eq('campaign_id', campaignId);

      if (analyticsError) throw analyticsError;

      // Finally delete the campaign
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', user.id);

      if (error) throw error;

      onCampaignsChange();

      toast({
        title: "Campaign deleted",
        description: `${campaign.name} has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting campaign",
        description: error.message || "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      budget: campaign.budget.toString(),
      targetAudience: campaign.targetAudience,
      description: campaign.description
    });
  };

  const closeEditDialog = () => {
    setEditingCampaign(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Campaigns</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your Viber advertising campaigns
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            className="bg-gradient-primary text-primary-foreground border-0 w-full sm:w-auto"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-card transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <h3 className="font-semibold text-base sm:text-lg">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'paused' ? 'secondary' : 'outline'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Impressions
                        </p>
                        <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          Clicks
                        </p>
                        <p className="font-medium">{campaign.clicks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Conversions
                        </p>
                        <p className="font-medium">{campaign.conversions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">€{campaign.budget}</p>
                      </div>
                    </div>
                  </div>
                  
                   <div className="flex flex-row lg:flex-col gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => toggleCampaignStatus(campaign.id)}
                       className="flex-1 lg:flex-none"
                       disabled={loading}
                     >
                       {campaign.status === 'active' ? (
                         <>
                           <Pause className="mr-2 h-4 w-4" />
                           Pause
                         </>
                       ) : (
                         <>
                           <Play className="mr-2 h-4 w-4" />
                           Start
                         </>
                       )}
                     </Button>
                     
                     <Button
                       variant="outline"
                       size="sm"
                      onClick={() => navigate(`/campaigns/${campaign.id}/ads/create`)}
                       className="flex-1 lg:flex-none"
                     >
                       <Plus className="mr-2 h-4 w-4" />
                       Add Ad
                     </Button>
                     
                     <Button
                       variant="outline"
                       size="sm"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="flex-1 lg:flex-none"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                     
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => openEditDialog(campaign)}
                       className="flex-1 lg:flex-none"
                       disabled={loading}
                     >
                       <Edit className="mr-2 h-4 w-4" />
                       Edit
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => deleteCampaign(campaign.id)}
                       className="flex-1 lg:flex-none text-destructive hover:text-destructive"
                       disabled={loading}
                     >
                       <Trash2 className="mr-2 h-4 w-4" />
                       Delete
                     </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first campaign to start advertising on Viber
              </p>
              <div className="space-y-2">
                <Button 
                  className="bg-gradient-primary text-primary-foreground border-0"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new advertising campaign for your business.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-budget">Budget (EUR)</Label>
              <Input
                id="campaign-budget"
                type="number"
                placeholder="Enter budget amount"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="young-adults">Young Adults (18-35)</SelectItem>
                  <SelectItem value="professionals">Professionals (25-45)</SelectItem>
                  <SelectItem value="families">Families (30-50)</SelectItem>
                  <SelectItem value="seniors">Seniors (50+)</SelectItem>
                  <SelectItem value="all">All Demographics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea
                id="campaign-description"
                placeholder="Describe your campaign goals"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} className="bg-gradient-primary text-primary-foreground border-0 flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={!!editingCampaign} onOpenChange={() => closeEditDialog()}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Update your campaign settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-campaign-name">Campaign Name</Label>
              <Input
                id="edit-campaign-name"
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-campaign-budget">Budget (EUR)</Label>
              <Input
                id="edit-campaign-budget"
                type="number"
                placeholder="Enter budget amount"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-target-audience">Target Audience</Label>
              <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="young-adults">Young Adults (18-35)</SelectItem>
                  <SelectItem value="professionals">Professionals (25-45)</SelectItem>
                  <SelectItem value="families">Families (30-50)</SelectItem>
                  <SelectItem value="seniors">Seniors (50+)</SelectItem>
                  <SelectItem value="all">All Demographics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-campaign-description">Description</Label>
              <Textarea
                id="edit-campaign-description"
                placeholder="Describe your campaign goals"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={closeEditDialog} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleEditCampaign} className="bg-gradient-primary text-primary-foreground border-0 flex-1" disabled={loading}>
              {loading ? "Updating..." : "Update Campaign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}