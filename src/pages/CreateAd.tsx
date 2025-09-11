import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import FileUpload from '@/components/FileUpload';

export default function CreateAd() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [adData, setAdData] = useState({
    title: '',
    description: '',
    type: '',
    targetAudience: '',
    budget: '',
    duration: '',
    callToAction: '',
    tags: [] as string[],
    mediaUrl: ''
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setAdData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !adData.tags.includes(newTag.trim())) {
      setAdData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAdData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (url: string) => {
    setAdData(prev => ({
      ...prev,
      mediaUrl: url
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    toast({
      title: "Ad saved",
      description: "Your ad has been saved successfully.",
    });
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    toast({
      title: "Preview",
      description: "Opening ad preview...",
    });
  };

  const handleSubmit = () => {
    // TODO: Implement submit functionality
    toast({
      title: "Ad created",
      description: "Your ad has been created and submitted for review.",
    });
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Ad</h1>
          <p className="text-muted-foreground">Design and configure your advertising campaign</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for your advertisement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Ad Title</Label>
                <Input
                  id="title"
                  value={adData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a compelling title for your ad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={adData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product or service"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Ad Type</Label>
                  <Select value={adData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ad type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner Ad</SelectItem>
                      <SelectItem value="video">Video Ad</SelectItem>
                      <SelectItem value="carousel">Carousel Ad</SelectItem>
                      <SelectItem value="story">Story Ad</SelectItem>
                      <SelectItem value="native">Native Ad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta">Call to Action</Label>
                  <Select value={adData.callToAction} onValueChange={(value) => handleInputChange('callToAction', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learn-more">Learn More</SelectItem>
                      <SelectItem value="shop-now">Shop Now</SelectItem>
                      <SelectItem value="sign-up">Sign Up</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                      <SelectItem value="contact-us">Contact Us</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Upload</CardTitle>
              <CardDescription>
                Upload images or videos for your advertisement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUpload={handleFileUpload}
                acceptedTypes="image/*,video/*"
                maxSize={10 * 1024 * 1024}
                bucket="campaign-images"
                label="Upload Media"
              />
              {adData.mediaUrl && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Uploaded media:</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{adData.mediaUrl}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Add relevant tags to help categorize your ad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter a tag"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {adData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {adData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Targeting & Budget</CardTitle>
              <CardDescription>
                Configure your target audience and budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Textarea
                  id="target-audience"
                  value={adData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="Describe your target audience"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={adData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="Enter your budget"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Campaign Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={adData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Enter duration in days"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handlePreview} variant="outline" className="w-full flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview Ad
              </Button>
              
              <Button onClick={handleSave} variant="outline" className="w-full flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              
              <Separator />
              
              <Button onClick={handleSubmit} className="w-full flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Create Ad
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}