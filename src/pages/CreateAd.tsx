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
import { Plus, Upload, Eye, Save, ArrowLeft, ExternalLink } from 'lucide-react'; // ExternalLink icon ကို ထည့်သွင်းထားပါသည်။
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
    video_url: '',
    link_url: '', // Link URL အတွက် state အသစ်
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
        description: "အသုံးပြုသူအား အတည်ပြုခြင်းမရှိပါ သို့မဟုတ် ကမ်ပိန်းကို ရှာမတွေ့ပါ။",
        variant: "destructive",
      });
      return;
    }

    if (!adData.name || !adData.ad_type || !adData.headline || !adData.description) {
      toast({
        title: "အချက်အလက် မပြည့်စုံပါ",
        description: "လိုအပ်သော ကွက်လပ်အားလုံးကို ဖြည့်ပါ။",
        variant: "destructive",
      });
      return;
    }

    // Link URL validation
    if (adData.link_url && !/^https?:\/\/.+/.test(adData.link_url)) {
        toast({
            title: "Link URL မမှန်ကန်ပါ",
            description: "http:// သို့မဟုတ် https:// ဖြင့် စတင်သော မှန်ကန်သော URL ကို ထည့်ပါ။",
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
          link_url: adData.link_url || null, // link_url ကို ထည့်သွင်းခြင်း
          budget: parseFloat(adData.budget) || 0,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "ကြော်ငြာ ဖန်တီးပြီးပါပြီ။",
        description: "သင်၏ကြော်ငြာကို ဖန်တီးပြီး မူကြမ်းအဖြစ် သိမ်းဆည်းထားပါသည်။",
      });

      navigate(`/campaigns/${campaignId}/ads/${data.id}`);
    } catch (error: any) {
      toast({
        title: "ကြော်ငြာ ဖန်တီးရာတွင် အမှား",
        description: error.message || "ကြော်ငြာ ဖန်တီး၍ မရပါ။",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Preview ခလုတ်ကို နှိပ်သောအခါ လုပ်ဆောင်မည့် function
  const handlePreviewButtonClick = () => {
    if (adData.link_url) {
      window.open(adData.link_url, '_blank');
    } else {
        toast({
            title: "Link URL မရှိသေးပါ",
            description: "Link URL ကို ထည့်သွင်းပေးပါ။",
            variant: "info",
        });
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
          ကမ်ပိန်းသို့ ပြန်သွားရန်
        </Button>
        <div>
          <h1 className="text-3xl font-bold">ကြော်ငြာအသစ် ဖန်တီးပါ</h1>
          <p className="text-muted-foreground">သင်၏ ကြော်ငြာကမ်ပိန်းကို ဒီဇိုင်းဆွဲပြီး ပြင်ဆင်ပါ။</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
            <Card>
            <CardHeader>
              <CardTitle>အခြေခံ အချက်အလက်</CardTitle>
              <CardDescription>
                သင်၏ကြော်ငြာအတွက် အခြေခံအချက်အလက်များကို ထည့်ပါ။
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ကြော်ငြာအမည် *</Label>
                <Input
                  id="name"
                  value={adData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="ကြော်ငြာအမည် ထည့်ပါ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">ခေါင်းစဉ် *</Label>
                <Input
                  id="headline"
                  value={adData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="ဆွဲဆောင်မှုရှိသော ခေါင်းစဉ် ထည့်ပါ"
                  maxLength={60}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {adData.headline.length}/60 စာလုံး
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">ဖော်ပြချက် *</Label>
                <Textarea
                  id="description"
                  value={adData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="သင်၏ ထုတ်ကုန် သို့မဟုတ် ဝန်ဆောင်မှုကို ဖော်ပြပါ"
                  rows={4}
                  maxLength={300}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {adData.description.length}/300 စာလုံး
                </p>
              </div>

              {/* Link URL အတွက် Input Field အသစ် */}
              <div className="space-y-2">
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  type="url" // browser validation အတွက် type="url" ကို အသုံးပြုပါ
                  value={adData.link_url}
                  onChange={(e) => handleInputChange('link_url', e.target.value)}
                  placeholder="https://your-website.com"
                />
                <p className="text-xs text-muted-foreground">
                  အသုံးပြုသူများ သင့်ကြော်ငြာကို နှိပ်သောအခါ ရောက်ရှိမည့် URL။
                </p>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad_type">ကြော်ငြာအမျိုးအစား *</Label>
                  <Select value={adData.ad_type} onValueChange={(value) => handleInputChange('ad_type', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="ကြော်ငြာအမျိုးအစား ရွေးပါ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">ရုပ်ပုံကြော်ငြာ</SelectItem>
                      <SelectItem value="video">ဗီဒီယိုကြော်ငြာ</SelectItem>
                      <SelectItem value="carousel">Carousel ကြော်ငြာ</SelectItem>
                      <SelectItem value="text">စာသားကြော်ငြာ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">ဘတ်ဂျက် (EUR)</Label>
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
              <CardTitle>မီဒီယာ ထည့်သွင်းခြင်း</CardTitle>
              <CardDescription>
                သင်၏ကြော်ငြာအတွက် {adData.ad_type} ကို ထည့်ပါ။
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adData.ad_type === 'image' ? (
                <FileUpload
                  onUpload={handleFileUpload}
                  acceptedTypes="image/*"
                  maxSize={5 * 1024 * 1024}
                  bucket="campaign-images"
                  label="ရုပ်ပုံထည့်ပါ"
                  currentFile={adData.image_url}
                />
              ) : (
                <FileUpload
                  onUpload={handleFileUpload}
                  acceptedTypes="video/*"
                  maxSize={50 * 1024 * 1024}
                  bucket="campaign-videos"
                  label="ဗီဒီယိုထည့်ပါ"
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
              <CardTitle>လုပ်ဆောင်ချက်များ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Separator />
              
              <Button 
                onClick={handleSubmit} 
                className="w-full flex items-center gap-2 bg-gradient-primary text-primary-foreground border-0"
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? "ဖန်တီးနေသည်..." : "ကြော်ငြာ ဖန်တီးပါ"}
              </Button>
            </CardContent>
          </Card>

          {/* Ad Preview Card အသစ် */}
          <Card>
            <CardHeader>
              <CardTitle>ကြော်ငြာ Preview</CardTitle>
              <CardDescription>
                သင့်ကြော်ငြာ မည်သို့ပေါ်လာမည်ကို ကြည့်ပါ။
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {adData.headline && (
                <h3 className="text-xl font-semibold">{adData.headline}</h3>
              )}
              {adData.description && (
                <p className="text-sm text-muted-foreground">{adData.description}</p>
              )}
              {(adData.ad_type === 'image' && adData.image_url) && (
                <img src={adData.image_url} alt="Ad Media" className="w-full h-auto object-cover rounded-md" />
              )}
              {(adData.ad_type === 'video' && adData.video_url) && (
                <video src={adData.video_url} controls className="w-full h-auto object-cover rounded-md" />
              )}
              {adData.link_url && (
                <Button 
                  onClick={handlePreviewButtonClick}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Link သို့ သွားရန်
                </Button>
              )}
              {!adData.headline && !adData.description && !adData.image_url && !adData.video_url && !adData.link_url && (
                <p className="text-center text-muted-foreground italic">အသေးစိတ်အချက်အလက်များကို ဖြည့်စွက်ပြီး preview ကြည့်ပါ။</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}