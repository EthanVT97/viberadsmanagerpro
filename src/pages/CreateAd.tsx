import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";

interface Campaign {
  id: string;
  name: string;
  budget_euro: number;
}

export default function CreateAd() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ad_type: "image",
    headline: "",
    description: "",
    budget: "",
    image_url: "",
    video_url: "",
  });

  useEffect(() => {
    if (!user || !campaignId) return;
    fetchCampaign();
  }, [user, campaignId]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, budget_euro')
        .eq('id', campaignId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error: any) {
      toast({
        title: "Error loading campaign",
        description: error.message || "Failed to load campaign",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'active') => {
    e.preventDefault();
    if (!user || !campaign) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('ads')
        .insert({
          campaign_id: campaign.id,
          user_id: user.id,
          name: formData.name,
          ad_type: formData.ad_type,
          headline: formData.headline,
          description: formData.description,
          budget: parseFloat(formData.budget),
          image_url: formData.image_url || null,
          video_url: formData.video_url || null,
          status: status,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Ad created successfully!",
        description: `Ad "${formData.name}" has been ${status === 'draft' ? 'saved as draft' : 'created and activated'}.`,
      });

      navigate(`/campaigns/${campaign.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating ad",
        description: error.message || "Failed to create ad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (url: string, type: 'image' | 'video') => {
    if (type === 'image') {
      setFormData(prev => ({ ...prev, image_url: url }));
    } else {
      setFormData(prev => ({ ...prev, video_url: url }));
    }
  };

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-primary-foreground font-bold text-2xl">V</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
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
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Create New Ad</h1>
                <p className="text-sm text-muted-foreground">For campaign: {campaign.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={(e) => handleSubmit(e, 'active')}
                disabled={loading}
                className="bg-gradient-primary text-primary-foreground border-0"
              >
                <Eye className="h-4 w-4 mr-2" />
                Create Ad
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={(e) => handleSubmit(e, 'active')} className="space-y-8">
          {/* Ad Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Details</CardTitle>
              <CardDescription>Basic information about your advertisement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Summer Sale Banner"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad_type">Ad Type *</Label>
                  <Select
                    value={formData.ad_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, ad_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ad type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image Ad</SelectItem>
                      <SelectItem value="video">Video Ad</SelectItem>
                      <SelectItem value="carousel">Carousel Ad</SelectItem>
                      <SelectItem value="text">Text Ad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline *</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="Catchy headline for your ad"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your offer or call-to-action..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Ad Budget (EUR) *</Label>
                <Input
                  id="budget"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="50.00"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Budget for this specific ad (max: €{campaign.budget_euro / 100})
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Media Content</CardTitle>
              <CardDescription>Upload images or videos for your ad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(formData.ad_type === 'image' || formData.ad_type === 'carousel') && (
                <FileUpload
                  onUpload={(url) => handleFileUpload(url, 'image')}
                  acceptedTypes="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                  bucket="campaign-images"
                  label="Campaign Image"
                  currentFile={formData.image_url}
                />
              )}

              {formData.ad_type === 'video' && (
                <FileUpload
                  onUpload={(url) => handleFileUpload(url, 'video')}
                  acceptedTypes="video/*"
                  maxSize={100 * 1024 * 1024} // 100MB
                  bucket="campaign-videos"
                  label="Campaign Video"
                  currentFile={formData.video_url}
                />
              )}

              {formData.ad_type === 'text' && (
                <div className="p-6 bg-muted/50 rounded-lg text-center">
                  <p className="text-muted-foreground">
                    Text ads don't require media uploads. Your ad will use the headline and description only.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ad Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Preview</CardTitle>
              <CardDescription>How your ad will appear to Myanmar users on Viber</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto border rounded-lg p-4 bg-white">
                {formData.image_url && (
                  <img 
                    src={formData.image_url} 
                    alt="Ad preview"
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                {formData.video_url && (
                  <video 
                    src={formData.video_url} 
                    className="w-full h-40 object-cover rounded mb-3"
                    controls
                  />
                )}
                <h3 className="font-semibold text-gray-900 mb-1">
                  {formData.headline || "Your headline here"}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {formData.description || "Your description here"}
                </p>
                <div className="text-xs text-gray-500">
                  Sponsored • Viber Myanmar
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}