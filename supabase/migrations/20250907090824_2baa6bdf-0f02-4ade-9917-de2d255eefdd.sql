-- Fix critical security vulnerability in campaign_analytics table
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "System can insert analytics" ON public.campaign_analytics;

-- Create a more secure policy that only allows authenticated users to insert analytics for their own campaigns
CREATE POLICY "Users can insert analytics for their campaigns" 
ON public.campaign_analytics 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.campaigns 
    WHERE campaigns.id = campaign_analytics.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

-- Fix function search path security issue for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, business_name, contact_email, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'business_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$function$;

-- Add missing trigger for campaigns updated_at
CREATE OR REPLACE FUNCTION public.update_campaigns_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create trigger for campaigns if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_campaigns_updated_at_trigger'
    ) THEN
        CREATE TRIGGER update_campaigns_updated_at_trigger
            BEFORE UPDATE ON public.campaigns
            FOR EACH ROW
            EXECUTE FUNCTION public.update_campaigns_updated_at();
    END IF;
END
$$;

-- Create trigger for profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_profiles_updated_at
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Create trigger for subscriptions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_subscriptions_updated_at'
    ) THEN
        CREATE TRIGGER update_subscriptions_updated_at
            BEFORE UPDATE ON public.subscriptions
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Create trigger for packages if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_packages_updated_at'
    ) THEN
        CREATE TRIGGER update_packages_updated_at
            BEFORE UPDATE ON public.packages
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Create trigger for ads if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_ads_updated_at'
    ) THEN
        CREATE TRIGGER update_ads_updated_at
            BEFORE UPDATE ON public.ads
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Create trigger for new user profile creation if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END
$$;

-- Insert default packages if they don't exist
INSERT INTO public.packages (name, description, price_euro, features, is_active)
SELECT * FROM (VALUES
  ('Starter Plan', 'Perfect for small businesses starting with Viber advertising', 2999, ARRAY['Up to 1,000 monthly impressions', '1 active campaign', 'Basic analytics', 'Email support'], true),
  ('Growth Plan', 'Ideal for growing businesses expanding their reach', 9999, ARRAY['Up to 10,000 monthly impressions', '5 active campaigns', 'Advanced analytics', 'Priority support', 'A/B testing'], true),
  ('Professional Plan', 'For established businesses with serious advertising needs', 19999, ARRAY['Up to 50,000 monthly impressions', '15 active campaigns', 'Premium analytics', 'Phone & email support', 'Advanced targeting', 'Custom audiences'], true),
  ('Enterprise Plan', 'For large organizations with maximum advertising requirements', 49999, ARRAY['Unlimited monthly impressions', 'Unlimited campaigns', 'Real-time analytics', 'Dedicated account manager', 'API access', 'White-label solutions'], true)
) AS new_packages(name, description, price_euro, features, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.packages WHERE packages.name = new_packages.name
);