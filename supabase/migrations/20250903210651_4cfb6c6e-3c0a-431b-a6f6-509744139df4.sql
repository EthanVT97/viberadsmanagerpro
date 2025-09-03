-- Create storage buckets for campaign assets (if not exists)
INSERT INTO storage.buckets (id, name, public) VALUES 
('campaign-images', 'campaign-images', true),
('campaign-videos', 'campaign-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create ads table (if not exists)
CREATE TABLE IF NOT EXISTS public.ads (
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

-- Create campaign analytics table (if not exists)
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
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

-- Enable RLS on new tables
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ads
DROP POLICY IF EXISTS "Users can view their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can create their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can update their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can delete their own ads" ON public.ads;

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
DROP POLICY IF EXISTS "Users can view analytics for their campaigns" ON public.campaign_analytics;
DROP POLICY IF EXISTS "System can insert analytics" ON public.campaign_analytics;

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
DROP POLICY IF EXISTS "Users can upload campaign images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view campaign images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their campaign images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their campaign images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload campaign videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view campaign videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their campaign videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their campaign videos" ON storage.objects;

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

-- Add update triggers for new tables
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();