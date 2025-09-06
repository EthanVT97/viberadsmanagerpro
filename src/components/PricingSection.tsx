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
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary-glow/8 rounded-full blur-3xl opacity-30"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 sm:mb-20 animate-fade-in-scale">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Choose Your Viber Ads Package
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
            Select the perfect package for your Myanmar business growth on Viber
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {displayPackages.map((pkg, index) => (
            <Card 
              key={pkg.id}
              className={`relative group glass-card hover:shadow-strong transition-elegant duration-500 border-border/30 hover:border-primary/40 h-full flex flex-col hover-lift animate-slide-up ${
                pkg.name === "Video Pulse" ? "ring-2 ring-primary/20 shadow-glow" : ""
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                    {pkg.name}
                  </CardTitle>
                  {pkg.name === "Video Pulse" && (
                    <Badge className="bg-gradient-primary text-primary-foreground border-0 shadow-soft hover:shadow-glow transition-elegant">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                  {pkg.description}
                </CardDescription>
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">
                    €{pkg.price_euro / 100}
                  </span>
                  <span className="text-base sm:text-lg text-muted-foreground ml-2">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 text-sm sm:text-base">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full transition-elegant duration-500 font-semibold py-3 sm:py-4 text-base shadow-soft hover-lift ${
                    pkg.name === "Video Pulse" 
                      ? "bg-gradient-primary hover:shadow-glow text-primary-foreground border-0 rounded-xl" 
                      : "bg-secondary hover:bg-secondary/80 hover:shadow-medium rounded-xl"
                  }`}
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