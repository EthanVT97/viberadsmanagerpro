import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Package {
  id: string;
  name: string;
  description: string;
  price_euro: number;
  features: string[];
}

interface PricingSectionProps {
  packages: Package[];
}

const defaultPackages: Package[] = [
  {
    id: '1',
    name: 'Business Exclusive',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 15000,
    features: ['Exclusive business targeting', 'Premium ad placement', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '2',
    name: 'Display Reach',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 15000,
    features: ['Display advertising', 'Wide audience reach', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '3',
    name: 'Daily Essentials',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 15000,
    features: ['Daily engagement ads', 'Essential features', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '4',
    name: 'Video Pulse',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 20000,
    features: ['Video advertising', 'High engagement', 'Myanmar market focus', 'iOS & Android reach']
  }
];

export default function PricingSection({ packages }: PricingSectionProps) {
  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectPackage = async (packageId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to select a package",
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    setSelectedPackage(packageId);

    try {
      // Check if user already has an active subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingSubscription) {
        toast({
          title: "Subscription Exists",
          description: "You already have an active subscription. Please go to your dashboard to manage it.",
        });
        navigate('/dashboard');
        return;
      }

      // Create subscription record
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          package_id: packageId,
          status: 'active'
        });

      if (subscriptionError) {
        throw subscriptionError;
      }

      toast({
        title: "Package Activated!",
        description: "Your package has been activated successfully. Redirecting to dashboard...",
      });

      // Redirect to dashboard after successful subscription
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-muted to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Choose Your Viber Ads Package
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Select the perfect package for your Myanmar business growth on Viber
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayPackages.map((pkg) => (
            <Card 
              key={pkg.id}
              className="relative group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur-sm h-full flex flex-col"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                    {pkg.name}
                  </CardTitle>
                  {pkg.name === "Video Pulse" && (
                    <Badge className="bg-gradient-primary text-primary-foreground border-0">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mb-4">
                  {pkg.description}
                </CardDescription>
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    €{pkg.price_euro / 100}
                  </span>
                  <span className="text-sm sm:text-base text-muted-foreground ml-1">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 flex-1 flex flex-col">
                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full transition-all duration-300 ${
                    pkg.name === "Video Pulse" 
                      ? "bg-gradient-primary hover:shadow-glow text-primary-foreground border-0" 
                      : "bg-secondary hover:bg-secondary/80"
                  } text-sm sm:text-base py-2 sm:py-3`}
                  onClick={() => handleSelectPackage(pkg.id)}
                  disabled={loading && selectedPackage === pkg.id}
                >
                  {loading && selectedPackage === pkg.id ? "Selecting..." : "Select Package"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}