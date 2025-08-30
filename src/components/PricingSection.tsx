import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export default function PricingSection({ packages }: PricingSectionProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectPackage = async (packageId: string) => {
    setLoading(true);
    setSelectedPackage(packageId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to select a package",
          variant: "destructive",
        });
        // Redirect to auth page
        window.location.href = '/auth';
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
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      console.error('Error selecting package:', error);
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
    <section className="py-20 px-4 bg-gradient-to-br from-background via-muted to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Choose Your Viber Ads Package
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect package for your Myanmar business growth on Viber
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              className="relative group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {pkg.name}
                  </CardTitle>
                  {pkg.name === "Video Pulse" && (
                    <Badge className="bg-gradient-primary text-primary-foreground border-0">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm text-muted-foreground mb-4">
                  {pkg.description}
                </CardDescription>
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">
                    €{pkg.price_euro / 100}
                  </span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
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