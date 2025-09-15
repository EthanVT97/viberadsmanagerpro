import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Trash2, 
  Play, 
  Pause,
  Eye,
  MousePointer,
  TrendingUp,
  DollarSign,
  Image,
  Video,
  Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";

interface Ad {
  id: string;
  campaign_id: string;
  name: string;
  ad_type: string;
  headline: string;
  description: string;
  link?: string;
  image_url?: string;
  video_url?: string;
  budget: number;
  status: string;
  performance_data: any;
  created_at: string;
  updated_at: string;
}

interface Campaign {
  id: string;
  name: string;
}

export default function AdDetails() {
  const { campaignId, adId } = useParams<{ campaignId: string; adId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ad, setAd] = useState<Ad | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    description: "",
    link: "",
    budget: "",
    image_url: "",
    video_url: ""
  });

  useEffect(() => {
    if (!user || !campaignId || !adId) return;
    fetchAdData();
  }, [user, campaignId, adId]);

  const fetchAdData = async () => {
    try {
      // Fetch ad details
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .select('*')
        .eq('id', adId)
        .eq('campaign_id', campaignId)
        .eq('user_id', user?.id)
        .single();

      if (adError) throw adError;
      setAd(adData);

      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('id', campaignId)
        .eq('user_id', user?.id)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Set form data
      setFormData({
        name: adData.name,
        headline: adData.headline || "",
        description: adData.description || "",
        link: adData.link || "",
        budget: adData.budget.toString(),
        image_url: adData.image_url || "",
        video_url: adData.video_url || ""
      });
    } catch (error: any) {
      toast({
        title: "Error loading ad",
        description: error.message || "Failed to load ad data",
        variant: "destructive",
      });
      navigate(`/campaigns/${campaignId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAd = async () => {
    if (!ad || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ads')
        .update({
          name: formData.name,
          headline: formData.headline,
          description: formData.description,
          link: formData.link || null,
          budget: parseFloat(formData.budget) || 0,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', ad.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Ad updated successfully!",
        description: "Your ad has been updated.",
      });

      setEditing(false);
      fetchAdData();
    } catch (error: any) {
      toast({
        title: "Error updating ad",
        description: error.message || "Failed to update ad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!ad || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', ad.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Ad deleted",
        description: "Your ad has been deleted successfully.",
      });

      navigate(`/campaigns/${campaignId}`);
    } catch (error: any) {
      toast({
        title: "Error deleting ad",
        description: error.message || "Failed to delete ad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async () => {
    if (!ad || !user) return;

    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: newStatus })
        .eq('id', ad.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAd(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: `Ad ${newStatus}`,
        description: `Your ad has been ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating ad status",
        description: error.message || "Failed to update ad status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ad || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-primary-foreground font-bold text-2xl">V</span>
          </div>
          <p className="text-muted-foreground">Loading ad details...</p>
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
                onClick={() => navigate(`/campaigns/${campaignId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">{ad.name}</h1>
                  <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                    {ad.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Campaign: {campaign.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={toggleAdStatus}
                disabled={loading}
              >
                {ad.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDeleteAd}
                className="text-destructive hover:text-destructive"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ad Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ad Performance</CardTitle>
                <CardDescription>Current performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">
                      {ad.performance_data?.impressions || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Impressions</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <MousePointer className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">
                      {ad.performance_data?.clicks || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Clicks</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">
                      {ad.performance_data?.conversions || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Conversions</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">€{ad.budget}</div>
                    <div className="text-sm text-muted-foreground">Budget</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ad Content</CardTitle>
                <CardDescription>Your ad content and media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium">Headline</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ad.headline || "No headline set"}
                  </p>
                </div>
                
                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ad.description || "No description set"}
                  </p>
                </div>

                <div>
                  <Label className="font-medium">Ad Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {ad.ad_type === 'image' ? (
                      <Image className="h-4 w-4" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )}
                    <span className="text-sm capitalize">{ad.ad_type}</span>
                  </div>
                </div>

                {ad.link && (
                  <div>
                    <Label>Link</Label>
                    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {ad.link}
                    </a>
                  </div>

{ad.image_url && (
  <div className="mt-4">
    <Label className="font-medium">Image</Label>
    <img
      src={ad.image_url}
      alt={ad.name}
      className="w-full max-w-sm h-48 object-cover rounded-lg mt-2"
    />
  </div>
)}

    {ad.video_url && (
  <div className="mt-4">
    <Label className="font-medium">Video</Label>
    <video
      src={ad.video_url}
      controls
      className="w-full max-w-sm h-48 object-cover rounded-lg mt-2"
    />
  </div>
)}
              </CardContent>
            </Card>
          </div>

          {/* Ad Preview */}
<div className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Live Preview</CardTitle>
      <CardDescription>How your ad appears to users</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/10">
        <div className="bg-white rounded-lg shadow-sm border max-w-sm mx-auto">
          {/* Ad Media */}
          <div className="relative">
            {ad.image_url && ad.ad_type === 'image' ? (
              <img
                src={ad.image_url}
                alt="Ad preview"
                className="w-full h-48 object-cover rounded-t-lg"
              />
            ) : ad.video_url && ad.ad_type === 'video' ? (
              <video
                src={ad.video_url}
                className="w-full h-48 object-cover rounded-t-lg"
                controls
                muted
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  {ad.ad_type === 'image' ? (
                    <>
                      <Image className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No image</p>
                    </>
                  ) : (
                    <>
                      <Video className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No video</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="absolute top-2 right-2">
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                {ad.ad_type}
              </span>
            </div>
          </div>

          {/* Ad Content */}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 text-gray-900">
              {ad.headline || "No headline"}
            </h3>

            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {ad.description || "No description"}
            </p>

            {ad.link ? (
              <Button asChild className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                <a href={ad.link} target="_blank" rel="noopener noreferrer">
                  Learn More
                </a>
              </Button>
            ) : (
              <Button className="w-full mt-3 bg-gray-300 text-gray-700" disabled>
                Learn More
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Ad Information */}
  <Card>
    <CardHeader>
      <CardTitle>Ad Information</CardTitle>
      <CardDescription>Technical details and metadata</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between">
        <span className="text-sm font-medium">Created:</span>
        <span className="text-sm text-muted-foreground">
          {new Date(ad.created_at).toLocaleDateString()}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm font-medium">Last Updated:</span>
        <span className="text-sm text-muted-foreground">
          {new Date(ad.updated_at).toLocaleDateString()}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm font-medium">Status:</span>
        <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
          {ad.status}
        </Badge>
      </div>
      <div className="flex justify-between">
        <span className="text-sm font-medium">Budget:</span>
        <span className="text-sm text-muted-foreground">€{ad.budget}</span>
      </div>
    </CardContent>
  </Card>
</div>

  {/* Edit Dialog */}
<Dialog open={editing} onOpenChange={setEditing}>
  <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Edit Ad</DialogTitle>
      <DialogDescription>
        Update your ad content, link, and settings
      </DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 py-4">
      {/* Ad Name */}
      <div className="space-y-2">
        <Label htmlFor="edit-name">Ad Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter ad name"
        />
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="edit-headline">Headline</Label>
        <Input
          id="edit-headline"
          value={formData.headline}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, headline: e.target.value }))
          }
          placeholder="Enter compelling headline"
          maxLength={60}
        />
        <p className="text-xs text-muted-foreground">
          {formData.headline.length}/60 characters
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe your product or service"
          rows={4}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/300 characters
        </p>
      </div>

      {/* Link Field */}
      <div className="space-y-2">
        <Label htmlFor="edit-link">Link</Label>
        <Input
          id="edit-link"
          type="url"
          value={formData.link}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, link: e.target.value }))
          }
          placeholder="https://example.com"
        />
        <p className="text-xs text-muted-foreground">
          Enter the landing page or CTA link
        </p>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <Label htmlFor="edit-budget">Budget (EUR)</Label>
        <Input
          id="edit-budget"
          type="number"
          value={formData.budget}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, budget: e.target.value }))
          }
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>

      {/* Media Upload (kept same) */}
      <div className="space-y-4">
        {ad.ad_type === "image" ? (
          <FileUpload
            onUpload={(url) =>
              setFormData((prev) => ({ ...prev, image_url: url }))
            }
            acceptedTypes="image/*"
            maxSize={5 * 1024 * 1024}
            bucket="campaign-images"
            label="Update Image"
            currentFile={formData.image_url}
          />
        ) : (
          <FileUpload
            onUpload={(url) =>
              setFormData((prev) => ({ ...prev, video_url: url }))
            }
            acceptedTypes="video/*"
            maxSize={50 * 1024 * 1024}
            bucket="campaign-videos"
            label="Update Video"
            currentFile={formData.video_url}
          />
        )}
      </div>
    </div>

    {/* Footer Buttons */}
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        variant="outline"
        onClick={() => setEditing(false)}
        className="flex-1"
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        onClick={handleUpdateAd}
        className="bg-gradient-primary text-primary-foreground border-0 flex-1"
        disabled={loading}
      >
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  </DialogContent>
</Dialog>    

            {/* Media Upload */}
            <div className="space-y-4">
              {ad.ad_type === 'image' ? (
                <FileUpload
                  onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  acceptedTypes="image/*"
                  maxSize={5 * 1024 * 1024}
                  bucket="campaign-images"
                  label="Update Image"
                  currentFile={formData.image_url}
                />
              ) : (
                <FileUpload
                  onUpload={(url) => setFormData(prev => ({ ...prev, video_url: url }))}
                  acceptedTypes="video/*"
                  maxSize={50 * 1024 * 1024}
                  bucket="campaign-videos"
                  label="Update Video"
                  currentFile={formData.video_url}
                />
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditing(false)} 
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAd} 
              className="bg-gradient-primary text-primary-foreground border-0 flex-1"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
