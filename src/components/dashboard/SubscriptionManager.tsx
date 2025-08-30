import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, CreditCard, Package, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Package {
  id: string;
  name: string;
  description: string;
  price_euro: number;
  features: string[];
}

interface Subscription {
  id: string;
  package_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  packages: Package;
}

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  packages: Package[];
  user: any;
  onSubscriptionChange: () => void;
}

const defaultPackages: Package[] = [
  {
    id: '1',
    name: 'Business Exclusive',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 150,
    features: ['Exclusive business targeting', 'Premium ad placement', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '2',
    name: 'Display Reach',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 150,
    features: ['Display advertising', 'Wide audience reach', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '3',
    name: 'Daily Essentials',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 150,
    features: ['Daily engagement ads', 'Essential features', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '4',
    name: 'Video Pulse',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 200,
    features: ['Video advertising', 'High engagement', 'Myanmar market focus', 'iOS & Android reach']
  }
];

export default function SubscriptionManager({ 
  subscriptions, 
  packages, 
  user, 
  onSubscriptionChange 
}: SubscriptionManagerProps) {
  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const activeSubscription = subscriptions.find(sub => sub.status === 'active');

  const handleSubscribeToPackage = async (packageId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a package.",
        variant: "destructive",
      });
      return;
    }

    if (activeSubscription) {
      toast({
        title: "Subscription exists",
        description: "You already have an active subscription. Please cancel it first to change packages.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          package_id: packageId,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Subscription activated!",
        description: "Your package has been activated successfully.",
      });

      onSubscriptionChange();
      setShowPackageDialog(false);
      setSelectedPackage(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate subscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          end_date: new Date().toISOString()
        })
        .eq('id', activeSubscription.id);

      if (error) throw error;

      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      onSubscriptionChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openPackageDialog = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPackageDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Your active advertising package</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSubscription ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base sm:text-lg">{activeSubscription.packages.name}</h3>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {activeSubscription.packages.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    €{activeSubscription.packages.price_euro / 100}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started: {new Date(activeSubscription.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Package Features:</h4>
                <ul className="space-y-1">
                  {activeSubscription.packages.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? This action cannot be undone and you will lose access to all premium features.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground">
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No active subscription</h3>
              <p className="text-muted-foreground mb-4">
                Choose a package to start advertising on Viber
              </p>
              <Button 
                className="bg-gradient-primary text-primary-foreground border-0"
                onClick={() => setShowPackageDialog(true)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Choose a Package
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Packages */}
      {!activeSubscription && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Packages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayPackages.map((pkg) => (
              <Card 
                key={pkg.id}
                className="relative group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur-sm h-full flex flex-col cursor-pointer"
                onClick={() => openPackageDialog(pkg)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {pkg.name}
                    </CardTitle>
                    {pkg.name === "Video Pulse" && (
                      <Badge className="bg-gradient-primary text-primary-foreground border-0">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mb-4">
                    {pkg.description}
                  </CardDescription>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary">
                      €{pkg.price_euro / 100}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
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
                    } text-sm py-2`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribeToPackage(pkg.id);
                    }}
                    disabled={loading}
                  >
                    {loading ? "Subscribing..." : "Select Package"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Package Details Dialog */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent className="sm:max-w-[500px] mx-4">
          {selectedPackage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedPackage.name}
                  {selectedPackage.name === "Video Pulse" && (
                    <Badge className="bg-gradient-primary text-primary-foreground border-0">
                      Premium
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedPackage.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-primary">
                    €{selectedPackage.price_euro / 100}
                  </span>
                  <span className="text-lg text-muted-foreground ml-1">/month</span>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Package includes:</h4>
                  <ul className="space-y-2">
                    {selectedPackage.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPackageDialog(false)} 
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleSubscribeToPackage(selectedPackage.id)} 
                  className="bg-gradient-primary text-primary-foreground border-0 flex-1"
                  disabled={loading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {loading ? "Subscribing..." : "Subscribe Now"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}