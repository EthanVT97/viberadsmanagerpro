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
    target_age: "",
    target_city: "",
    about: "",
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
    } catch (error) {
      console.error('Error fetching campaign:', error);
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'active') => {
    e.preventDefault();
    if (!user || !campaign) return;

    // Validation for required fields
    if (!formData.name || !formData.headline || !formData.about) {
      toast({
        title: "လိုအပ်သော အချက်အလက်များ",
        description: "ကြော်ငြာအမည်၊ ခေါင်းစဉ်နှင့် အကြောင်းအရာ ထည့်ပေးပါ။",
        variant: "destructive",
      });
      return;
    }

    if (!formData.image_url && !formData.video_url) {
      toast({
        title: "မီဒီယာ လိုအပ်သည်",
        description: "ကြော်ငြာတွင် ပုံ သို့မဟုတ် ဗီဒီယို တစ်ခု ပါဝင်ရမည်။",
        variant: "destructive",
      });
      return;
    }

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
          description: formData.about,
          budget: parseFloat(formData.budget) || 0,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null,
          status: status,
          performance_data: {
            target_age: formData.target_age,
            target_city: formData.target_city
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "ကြော်ငြာ အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!",
        description: `ကြော်ငြာ "${formData.name}" ကို ${status === 'draft' ? 'မူကြမ်းအဖြစ် သိမ်းဆည်းပြီး' : 'ဖန်တီးပြီး စတင်လုပ်ဆောင်ပြီ'}ပါပြီ။`,
      });

      navigate(`/campaigns/${campaign.id}`);
    } catch (error: any) {
      toast({
        title: "ကြော်ငြာ ဖန်တီးရာတွင် အမှား",
        description: error.message || "ကြော်ငြာ ဖန်တီးရာတွင် အမှားရှိပါသည်",
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
          <p className="text-muted-foreground">ကမ်ပိန်း ရှာနေသည်...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                ပြန်သွားမည်
              </Button>
              <div className="text-sm text-muted-foreground">
                ကမ်ပိန်း: {campaign?.name}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={(e) => handleSubmit(e, 'draft')}
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                မူကြမ်းသိမ်းမည်
              </Button>
              <Button
                onClick={(e) => handleSubmit(e, 'active')}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-primary text-primary-foreground border-0"
              >
                <Eye className="h-4 w-4" />
                ဖန်တီး၍ စတင်မည်
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Ad Details and Media */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ကြော်ငြာ အချက်အလက်များ</CardTitle>
                <CardDescription>
                  သင်၏ ကြော်ငြာ အကြောင်းအရာနှင့် ပစ်မှတ်ထားခြင်းကို ပြင်ဆင်ပါ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">ကြော်ငြာ အမည် *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ကြော်ငြာ အမည် ထည့်ပါ"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ad_type">ကြော်ငြာ အမျိုးအစား</Label>
                  <Select
                    value={formData.ad_type}
                    onValueChange={(value) => setFormData({ ...formData, ad_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">ပုံ ကြော်ငြာ</SelectItem>
                      <SelectItem value="video">ဗီဒီယို ကြော်ငြာ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="headline">ခေါင်းစဉ် *</Label>
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="စွဲဆောင်မှုရှိသော ခေါင်းစဉ် ထည့်ပါ"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="target_age">ပစ်မှတ် အသက်အုပ်စု</Label>
                  <Select
                    value={formData.target_age}
                    onValueChange={(value) => setFormData({ ...formData, target_age: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="အသက်အုပ်စု ရွေးချယ်ပါ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">၁၈-၂၄ နှစ်</SelectItem>
                      <SelectItem value="25-34">၂၅-၃၄ နှစ်</SelectItem>
                      <SelectItem value="35-44">၃၅-၄၄ နှစ်</SelectItem>
                      <SelectItem value="45-54">၄၅-၅၄ နှစ်</SelectItem>
                      <SelectItem value="55+">၅၅+ နှစ်</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_city">ပစ်မှတ် မြို့</Label>
                  <Select
                    value={formData.target_city}
                    onValueChange={(value) => setFormData({ ...formData, target_city: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="မြို့ ရွေးချယ်ပါ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yangon">ရန်ကုန်</SelectItem>
                      <SelectItem value="mandalay">မန္တလေး</SelectItem>
                      <SelectItem value="naypyitaw">နေပြည်တော်</SelectItem>
                      <SelectItem value="bago">ပဲခူး</SelectItem>
                      <SelectItem value="mawlamyine">မော်လမြိုင်</SelectItem>
                      <SelectItem value="taunggyi">တောင်ကြီး</SelectItem>
                      <SelectItem value="magway">မကွေး</SelectItem>
                      <SelectItem value="monywa">မုံရွာ</SelectItem>
                      <SelectItem value="pathein">ပုသိမ်</SelectItem>
                      <SelectItem value="sittwe">စစ်တွေ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="about">ကြော်ငြာ အကြောင်း *</Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="သင်၏ ကြော်ငြာအကြောင်း အသေးစိတ် ဖော်ပြပါ"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="budget">ဘတ်ဂျက် (€)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ရွေးခြယ်နိုင်သည် - မဖြည့်ပါက ကမ်ပိန်း ဘတ်ဂျက်ကို အသုံးပြုမည်
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card>
              <CardHeader>
                <CardTitle>မီဒီယာ တင်ခြင်း *</CardTitle>
                <CardDescription>
                  သင်၏ ကြော်ငြာအတွက် {formData.ad_type === 'image' ? 'ပုံ' : 'ဗီဒီယို'} တင်ပါ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.ad_type === 'image' ? (
                  <FileUpload
                    onUpload={(url) => handleFileUpload(url, 'image')}
                    acceptedTypes="image/*"
                    maxSize={5}
                    bucket="campaign-images"
                    label="ပုံ တင်မည်"
                    currentFile={formData.image_url}
                  />
                ) : (
                  <FileUpload
                    onUpload={(url) => handleFileUpload(url, 'video')}
                    acceptedTypes="video/*"
                    maxSize={50}
                    bucket="campaign-videos"
                    label="ဗီဒီယို တင်မည်"
                    currentFile={formData.video_url}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ad Preview */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>ကြော်ငြာ ကြိုတင်ကြည့်ရှုခြင်း</CardTitle>
                <CardDescription>
                  အသုံးပြုသူများ မြင်ရမည့် ပုံစံကို ကြည့်ပါ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/10">
                  {/* Preview Content */}
                  <div className="space-y-3">
                    {formData.image_url && formData.ad_type === 'image' && (
                      <div className="rounded-lg overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="ကြော်ငြာ ကြိုတင်ကြည့်ရှုခြင်း"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    
                    {formData.video_url && formData.ad_type === 'video' && (
                      <div className="rounded-lg overflow-hidden">
                        <video
                          src={formData.video_url}
                          className="w-full h-48 object-cover"
                          controls
                        />
                      </div>
                    )}
                    
                    {formData.headline && (
                      <h3 className="font-bold text-lg">{formData.headline}</h3>
                    )}
                    
                    {formData.about && (
                      <p className="text-muted-foreground text-sm">{formData.about}</p>
                    )}
                    
                    {(formData.target_age || formData.target_city) && (
                      <div className="text-xs text-muted-foreground border-t pt-2 mt-3">
                        <p className="font-medium mb-1">ပစ်မှတ် ပရိသတ်:</p>
                        {formData.target_age && <p>• အသက်: {formData.target_age}</p>}
                        {formData.target_city && <p>• မြို့: {formData.target_city}</p>}
                      </div>
                    )}
                    
                    {formData.budget && (
                      <div className="text-xs text-muted-foreground border-t pt-2 mt-3">
                        <p>ဘတ်ဂျက်: €{formData.budget}</p>
                      </div>
                    )}
                    
                    {!formData.image_url && !formData.video_url && (
                      <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                        <p className="text-muted-foreground text-center">
                          ကြိုတင်ကြည့်ရှုရန် မီဒီယာ တင်ပါ<br />
                          <span className="text-xs">(ပုံ သို့မဟုတ် ဗီဒီယို)</span>
                        </p>
                      </div>
                    )}
                    
                    {(!formData.headline || !formData.about) && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        ကြော်ငြာ အပြည့်အစုံ ကြည့်ရှုရန် ခေါင်းစဉ်နှင့် အကြောင်းအရာ ထည့်ပါ
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}