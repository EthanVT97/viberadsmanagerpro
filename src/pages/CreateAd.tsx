import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Eye, Upload, Image, Video } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePackageLimits } from "@/hooks/usePackageLimits";
import FileUpload from "@/components/FileUpload";

interface Campaign {
  id: string;
  name: string;
  budget_euro: number;
}

export default function CreateAd() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const { canCreateAd, limits } = usePackageLimits();
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

    // Check if user can create new ad in this campaign
    const canCreate = await canCreateAd(campaign.id);
    if (!canCreate) {
      toast({
        title: "Ad limit reached",
        description: `You've reached the limit of ${limits?.ads_per_campaign_limit || 3} ads per campaign for your package. Please upgrade to create more ads.`,
        variant: "destructive",
      });
      return;
    }

    // Validation for required fields
    if (!formData.name) {
      toast({
        title: "ကြော်ငြာအမည် လိုအပ်သည်",
        description: "ကြော်ငြာအမည် ထည့်ပေးပါ။",
        variant: "destructive",
      });
      return;
    }

    if (!formData.headline) {
      toast({
        title: "ခေါင်းစဉ် လိုအပ်သည်",
        description: "ကြော်ငြာ ခေါင်းစဉ် ထည့်ပေးပါ။",
        variant: "destructive",
      });
      return;
    }

    if (!formData.about) {
      toast({
        title: "အကြောင်းအရာ လိုအပ်သည်",
        description: "ကြော်ငြာ အကြောင်းအရာ ထည့်ပေးပါ။",
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
      setFormData(prev => ({ ...prev, image_url: url, video_url: '' }));
    } else {
      setFormData(prev => ({ ...prev, video_url: url, image_url: '' }));
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
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/campaigns/${campaignId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                ပြန်သွားမည်
              </Button>
              <div>
                <h1 className="text-xl font-semibold">ကြော်ငြာ အသစ် ဖန်တီးမည်</h1>
                <p className="text-sm text-muted-foreground">
                  ကမ်ပိန်း: {campaign?.name}
                  {limits && (
                    <span className="block text-xs mt-1">
                      Package: {limits.package_name} (Up to {limits.ads_per_campaign_limit} ads per campaign)
                    </span>
                  )}
                </p>
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
          {/* Left Column - Ad Form */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  ကြော်ငြာ အခြေခံ အချက်အလက်များ
                </CardTitle>
                <CardDescription>
                  သင်၏ ကြော်ငြာ အမည်နှင့် အမျိုးအစားကို ရွေးချယ်ပါ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    ကြော်ငြာ အမည် *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ဥပမာ: နွေရာသီ အရောင်းမြှင့်တင်ရေး"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    သင်၏ ကြော်ငြာကို ခွဲခြားသိရှိနိုင်သော အမည်
                  </p>
                </div>

                <div>
                  <Label htmlFor="ad_type" className="text-base font-medium">
                    ကြော်ငြာ အမျိုးအစား
                  </Label>
                  <Select
                    value={formData.ad_type}
                    onValueChange={(value) => setFormData({ ...formData, ad_type: value, image_url: '', video_url: '' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          ပုံ ကြော်ငြာ
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          ဗီဒီယို ကြော်ငြာ
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    ပုံ သို့မဟုတ် ဗီဒီယို ကြော်ငြာ ရွေးချယ်ပါ
                  </p>
                </div>

                <div>
                  <Label htmlFor="headline" className="text-base font-medium">
                    ကြော်ငြာ ခေါင်းစဉ် *
                  </Label>
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="စွဲဆောင်မှုရှိသော ခေါင်းစဉ် ထည့်ပါ"
                    required
                    className="mt-1"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.headline.length}/60 စာလုံး - စွဲဆောင်မှုရှိပြီး တိုတောင်းသော ခေါင်းစဉ်
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  ပစ်မှတ် ပရိသတ်
                </CardTitle>
                <CardDescription>
                  သင်၏ ကြော်ငြာကို မည်သူများ မြင်စေလိုသည်ကို ရွေးချယ်ပါ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target_age" className="text-base font-medium">
                    ပစ်မှတ် အသက်အုပ်စု
                  </Label>
                  <Select
                    value={formData.target_age}
                    onValueChange={(value) => setFormData({ ...formData, target_age: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="အသက်အုပ်စု ရွေးချယ်ပါ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">၁၈-၂၄ နှစ် (လူငယ်များ)</SelectItem>
                      <SelectItem value="25-34">၂၅-၃၄ နှစ် (အလုပ်သမားများ)</SelectItem>
                      <SelectItem value="35-44">၃၅-၄၄ နှစ် (အလယ်အလတ် အသက်)</SelectItem>
                      <SelectItem value="45-54">၄၅-၅၄ နှစ် (အကြီးအကဲများ)</SelectItem>
                      <SelectItem value="55+">၅၅+ နှစ် (အသက်ကြီးများ)</SelectItem>
                      <SelectItem value="all">အသက် အားလုံး</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    သင်၏ ထုတ်ကုန်/ဝန်ဆောင်မှုနှင့် ကိုက်ညီသော အသက်အုပ်စု
                  </p>
                </div>

                <div>
                  <Label htmlFor="target_city" className="text-base font-medium">
                    ပစ်မှတ် မြို့/ဒေသ
                  </Label>
                  <Select
                    value={formData.target_city}
                    onValueChange={(value) => setFormData({ ...formData, target_city: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="မြို့/ဒေသ ရွေးချယ်ပါ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yangon">ရန်ကုန်မြို့</SelectItem>
                      <SelectItem value="mandalay">မန္တလေးမြို့</SelectItem>
                      <SelectItem value="naypyitaw">နေပြည်တော်</SelectItem>
                      <SelectItem value="bago">ပဲခူးမြို့</SelectItem>
                      <SelectItem value="mawlamyine">မော်လမြိုင်မြို့</SelectItem>
                      <SelectItem value="taunggyi">တောင်ကြီးမြို့</SelectItem>
                      <SelectItem value="magway">မကွေးမြို့</SelectItem>
                      <SelectItem value="monywa">မုံရွာမြို့</SelectItem>
                      <SelectItem value="pathein">ပုသိမ်မြို့</SelectItem>
                      <SelectItem value="sittwe">စစ်တွေမြို့</SelectItem>
                      <SelectItem value="myitkyina">မြစ်ကြီးနားမြို့</SelectItem>
                      <SelectItem value="lashio">လားရှိုးမြို့</SelectItem>
                      <SelectItem value="all">မြန်မာနိုင်ငံ တစ်ခုလုံး</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    သင်၏ ဝန်ဆောင်မှု ရရှိနိုင်သော ဒေသများ
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ad Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  ကြော်ငြာ အကြောင်းအရာ
                </CardTitle>
                <CardDescription>
                  သင်၏ ကြော်ငြာ အကြောင်းအရာနှင့် မီဒီယာ ထည့်ပါ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="about" className="text-base font-medium">
                    ကြော်ငြာ အကြောင်း *
                  </Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="သင်၏ ထုတ်ကုန်/ဝန်ဆောင်မှု အကြောင်း အသေးစိတ် ဖော်ပြပါ။ ဘာကြောင့် ဝယ်သင့်သည်၊ ဘယ်လို အကျိုးရှိသည်ကို ရှင်းပြပါ။"
                    rows={5}
                    required
                    className="mt-1"
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.about.length}/300 စာလုံး - ရှင်းလင်းပြီး စွဲဆောင်မှုရှိသော ဖော်ပြချက်
                  </p>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-base font-medium">
                    ကြော်ငြာ ဘတ်ဂျက် (€)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="mt-1"
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
                <CardTitle className="flex items-center gap-2">
                  {formData.ad_type === 'image' ? (
                    <Image className="h-5 w-5" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                  {formData.ad_type === 'image' ? 'ပုံ တင်ခြင်း' : 'ဗီဒီယို တင်ခြင်း'} *
                </CardTitle>
                <CardDescription>
                  သင်၏ ကြော်ငြာအတွက် {formData.ad_type === 'image' ? 'ပုံ' : 'ဗီဒီယို'} တင်ပါ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.ad_type === 'image' ? (
                  <FileUpload
                    onUpload={(url) => handleFileUpload(url, 'image')}
                    acceptedTypes="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    bucket="campaign-images"
                    label="ပုံ တင်မည်"
                    currentFile={formData.image_url}
                  />
                ) : (
                  <FileUpload
                    onUpload={(url) => handleFileUpload(url, 'video')}
                    acceptedTypes="video/*"
                    maxSize={50 * 1024 * 1024} // 50MB
                    bucket="campaign-videos"
                    label="ဗီဒီယို တင်မည်"
                    currentFile={formData.video_url}
                  />
                )}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">အကြံပြုချက်များ:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {formData.ad_type === 'image' ? (
                      <>
                        <li>• ပုံသည် ရှင်းလင်းပြီး အရည်အသွေးမြင့် ဖြစ်ရမည်</li>
                        <li>• အနည်းဆုံး 1080x1080 pixels အရွယ်</li>
                        <li>• JPG သို့မဟုတ် PNG ဖိုင်အမျိုးအစား</li>
                        <li>• စာသားများ ရှင်းလင်းစွာ ဖတ်နိုင်ရမည်</li>
                      </>
                    ) : (
                      <>
                        <li>• ဗီဒီယို သည် 30 စက္ကန့်အောက် ဖြစ်သင့်သည်</li>
                        <li>• အနည်းဆုံး 720p HD အရည်အသွေး</li>
                        <li>• MP4 ဖိုင်အမျိုးအစား အကောင်းဆုံး</li>
                        <li>• အစပိုင်း 3 စက္ကန့်တွင် အာရုံစိုက်စေရမည်</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ad Preview */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  ကြော်ငြာ ကြိုတင်ကြည့်ရှုခြင်း
                </CardTitle>
                <CardDescription>
                  အသုံးပြုသူများ Viber တွင် မြင်ရမည့် ပုံစံ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/10">
                  {/* Viber-style preview */}
                  <div className="bg-white rounded-lg shadow-sm border max-w-sm mx-auto">
                    {/* Ad Media */}
                    <div className="relative">
                      {formData.image_url && formData.ad_type === 'image' ? (
                        <img
                          src={formData.image_url}
                          alt="ကြော်ငြာ ကြိုတင်ကြည့်ရှုခြင်း"
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : formData.video_url && formData.ad_type === 'video' ? (
                        <video
                          src={formData.video_url}
                          className="w-full h-48 object-cover rounded-t-lg"
                          controls
                          muted
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            {formData.ad_type === 'image' ? (
                              <>
                                <Image className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">ပုံ တင်ပါ</p>
                              </>
                            ) : (
                              <>
                                <Video className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">ဗီဒီယို တင်ပါ</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Ad Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {formData.ad_type === 'image' ? 'ပုံ' : 'ဗီဒီယို'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Ad Content */}
                    <div className="p-4">
                      {formData.headline ? (
                        <h3 className="font-bold text-lg mb-2 text-gray-900">
                          {formData.headline}
                        </h3>
                      ) : (
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      )}
                      
                      {formData.about ? (
                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          {formData.about}
                        </p>
                      ) : (
                        <div className="space-y-2 mb-3">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      )}
                      
                      {/* Call to Action Button */}
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        ပိုမိုလေ့လာမည်
                      </Button>
                    </div>
                    
                    {/* Targeting Info */}
                    {(formData.target_age || formData.target_city) && (
                      <div className="px-4 pb-4">
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <p className="font-medium mb-1">ပစ်မှတ် ပရိသတ်:</p>
                          {formData.target_age && (
                            <p>• အသက်: {formData.target_age}</p>
                          )}
                          {formData.target_city && (
                            <p>• ဒေသ: {formData.target_city}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview Status */}
                  <div className="mt-4 text-center">
                    {!formData.image_url && !formData.video_url ? (
                      <p className="text-amber-600 text-sm">
                        ⚠️ ကြိုတင်ကြည့်ရှုရန် မီဒီယာ တင်ပါ
                      </p>
                    ) : !formData.headline || !formData.about ? (
                      <p className="text-amber-600 text-sm">
                        ⚠️ ခေါင်းစဉ်နှင့် အကြောင်းအရာ ထည့်ပါ
                      </p>
                    ) : (
                      <p className="text-green-600 text-sm">
                        ✅ ကြော်ငြာ အဆင်သင့်ဖြစ်ပါပြီ
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">အောင်မြင်သော ကြော်ငြာ အကြံပြုချက်များ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <p>ခေါင်းစဉ်ကို တိုတောင်းပြီး စွဲဆောင်မှုရှိအောင် ရေးပါ</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <p>အကြောင်းအရာတွင် အကျိုးကျေးဇူးများကို ရှင်းလင်းစွာ ဖော်ပြပါ</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <p>ပုံ/ဗီဒီယို သည် အရည်အသွေးမြင့်ပြီး ရှင်းလင်းရမည်</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <p>ပစ်မှတ်ပရိသတ်ကို မှန်ကန်စွာ ရွေးချယ်ပါ</p>
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