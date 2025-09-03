-- Create storage buckets for campaign assets
INSERT INTO storage.buckets (id, name, public) VALUES 
('campaign-images', 'campaign-images', true),
('campaign-videos', 'campaign-videos', true);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  total_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  daily_budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  target_audience JSONB,
  campaign_objectives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ads table
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('image', 'video', 'carousel', 'text')),
  headline TEXT,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'rejected')),
  performance_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign analytics table
CREATE TABLE public.campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  reach INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for ads
CREATE POLICY "Users can view their own ads" 
ON public.ads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads" 
ON public.ads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads" 
ON public.ads 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for campaign analytics
CREATE POLICY "Users can view analytics for their campaigns" 
ON public.campaign_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_analytics.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "System can insert analytics" 
ON public.campaign_analytics 
FOR INSERT 
WITH CHECK (true);

-- Storage policies for campaign assets
CREATE POLICY "Users can upload campaign images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view campaign images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-images');

CREATE POLICY "Users can update their campaign images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their campaign images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload campaign videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view campaign videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-videos');

CREATE POLICY "Users can update their campaign videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their campaign videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update triggers for timestamps
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();