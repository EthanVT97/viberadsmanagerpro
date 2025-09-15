import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Upload, Eye, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FileUpload from '@/components/FileUpload';

export default function CreateAd() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [adData, setAdData] = useState({
    name: '',
    headline: '',
    description: '',
    ad_type: '',
    budget: '',
    image_url: '',
    video_url: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setAdData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (url: string) => {
    if (adData.ad_type === 'image') {
      setAdData(prev => ({ ...prev, image_url: url }));
    } else if (adData.ad_type === 'video') {
      setAdData(prev => ({ ...prev, video_url: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !campaignId) {
      toast({
        title: "Error",
        description: "User not authenticated or campaign not found.",
        variant: "destructive",
      });
      return;
    }

    if (!adData.name || !adData.ad_type || !adData.headline || !adData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
          name: adData.name,
          ad_type: adData.ad_type,
          headline: adData.headline,
          description: adData.description,
          image_url: adData.image_url || null,
          video_url: adData.video_url || null,
          budget: parseFloat(adData.budget) || 0,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Ad created successfully!",
        description: "Your ad has been created and saved as draft.",
      });

      navigate(`/campaigns/${campaignId}/ads/${data.id}`);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/campaigns/${campaignId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaign
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Ad</h1>
          <p className="text-muted-foreground">Design and configure your advertising campaign</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
            <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for your advertisement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Name *</Label>
                <Input
                  id="name"
                  value={adData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter ad name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline *</Label>
                <Input
                  id="headline"
                  value={adData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="Enter compelling headline"
                  maxLength={60}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {adData.headline.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={adData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product or service"
                  rows={4}
                  maxLength={300}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {adData.description.length}/300 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad_type">Ad Type *</Label>
                  <Select value={adData.ad_type} onValueChange={(value) => handleInputChange('ad_type', value)} required>
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

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (EUR)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={adData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {(adData.ad_type === 'image' || adData.ad_type === 'video') && (
            <Card>
            <CardHeader>
              <CardTitle>Media Upload</CardTitle>
              <CardDescription>
                Upload {adData.ad_type} for your advertisement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adData.ad_type === 'image' ? (
                <FileUpload
                  onUpload={handleFileUpload}
                  acceptedTypes="image/*"
                  maxSize={5 * 1024 * 1024}
                  bucket="campaign-images"
                  label="Upload Image"
                  currentFile={adData.image_url}
                />
              ) : (
                <FileUpload
                  onUpload={handleFileUpload}
                  acceptedTypes="video/*"
                  maxSize={50 * 1024 * 1024}
                  bucket="campaign-videos"
                  label="Upload Video"
                  currentFile={adData.video_url}
                />
              )}
            </CardContent>
          </Card>
          )}
          </form>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Separator />
              
              <Button 
                onClick={handleSubmit} 
                className="w-full flex items-center gap-2 bg-gradient-primary text-primary-foreground border-0"
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? "Creating..." : "Create Ad"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}