import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Play, 
  Pause, 
  Edit,
  BarChart3,
  Target,
  DollarSign,
  Eye,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePackageLimits } from "@/hooks/usePackageLimits";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  budget_euro: number;
  target_audience: string;
  impressions: number;
  clicks: number;
  conversions: number;
  created_at: string;
  updated_at: string;
}

interface Ad {
  id: string;
  campaign_id: string;
  name: string;
  ad_type: string;
  headline: string;
  description: string;
  image_url?: string;
  video_url?: string;
  budget: number;
  status: string;
  performance_data: any;
  created_at: string;
}

export default function CampaignDetails() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreateAd, limits } = usePackageLimits();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !campaignId) return;
    fetchCampaignData();
  }, [user, campaignId]);

  const fetchCampaignData = async () => {
    try {
      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', user?.id)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Fetch campaign ads
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user?.id);

      if (adsError) throw adsError;
      setAds(adsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading campaign",
        description: error.message || "Failed to load campaign data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!campaign) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCampaign(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: "Campaign updated",
        description: `Campaign status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating campaign",
        description: error.message || "Failed to update campaign status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-primary-foreground font-bold text-2xl">V</span>
          </div>
          <p className="text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
          <p className="text-muted-foreground mb-4">The campaign you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">{campaign.name}</h1>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {campaign.status === 'active' ? (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('paused')}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('active')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              )}
              
              <Button
                onClick={() => navigate(`/campaigns/${campaign.id}/ads/create`)}
                className="bg-gradient-primary text-primary-foreground border-0"
                disabled={!limits}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Ad
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{campaign.budget_euro / 100}</div>
              <p className="text-xs text-muted-foreground">Total budget</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.impressions?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Total views</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.clicks?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Total clicks</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.conversions?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Total conversions</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Content */}
        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ads">Ads ({ads.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Campaign Ads</h2>
                <p className="text-muted-foreground">
                  Manage your campaign advertisements
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate(`/campaigns/${campaign.id}/ads/create`)}
                  className="bg-gradient-primary text-primary-foreground border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Ad
                </Button>
              </div>
            </div>

            {ads.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No ads created yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first ad to start reaching Myanmar users on Viber
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => navigate(`/campaigns/${campaign.id}/ads/create`)}
                        className="bg-gradient-primary text-primary-foreground border-0"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Ad
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <Card key={ad.id} className="hover:shadow-card transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{ad.name}</CardTitle>
                        <Badge className={getStatusColor(ad.status)}>
                          {ad.status}
                        </Badge>
                      </div>
                      <CardDescription>{ad.headline}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ad.image_url && (
                        <img 
                          src={ad.image_url} 
                          alt={ad.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <p className="text-sm text-muted-foreground mb-3">
                        {ad.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Budget: €{ad.budget}</span>
                        <span className="text-muted-foreground capitalize">{ad.ad_type}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/campaigns/${campaign.id}/ads/${ad.id}`)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/campaigns/${campaign.id}/ads/${ad.id}`)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
                <CardDescription>Manage your campaign configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Target Audience</h4>
                    <p className="text-sm text-muted-foreground">
                      {campaign.target_audience || 'No target audience specified'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Created</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" className="mr-3">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </Button>
                  <Button variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}