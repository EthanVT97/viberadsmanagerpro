import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Settings, 
  BarChart3, 
  Target, 
  DollarSign, 
  Calendar,
  Plus,
  Play,
  Pause,
  Eye
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch user subscriptions
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          packages(*)
        `)
        .eq('user_id', user?.id);

      setSubscriptions(subsData || []);

      // Fetch available packages
      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price_euro', { ascending: true });

      setPackages(packagesData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "See you again soon!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribeToPackage = async (packageId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user?.id,
          package_id: packageId,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Subscription activated!",
        description: "Your package has been activated successfully.",
      });

      fetchUserData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate subscription.",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-primary-foreground font-bold text-2xl">V</span>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeSubscription = subscriptions.find(sub => sub.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-foreground">Dashboard</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.email}</p>
                    {profile?.business_name && (
                      <p className="text-xs text-muted-foreground">{profile.business_name}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Manage your Viber advertising campaigns and track your performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeSubscription ? '1' : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reach</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Myanmar users reached
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€0</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>Your active advertising package</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeSubscription ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{activeSubscription.packages.name}</h3>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {activeSubscription.packages.description}
                      </p>
                      <p className="text-2xl font-bold text-primary mb-2">
                        €{activeSubscription.packages.price_euro / 100}/month
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date(activeSubscription.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">No active subscription</p>
                      <Button 
                        className="bg-gradient-primary text-primary-foreground border-0"
                        onClick={() => setActiveTab("packages")}
                      >
                        Choose a Package
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your advertising</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Campaign
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Campaign Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Campaigns</h2>
                <p className="text-muted-foreground">Manage your Viber advertising campaigns</p>
              </div>
              <Button className="bg-gradient-primary text-primary-foreground border-0">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first campaign to start advertising on Viber
                  </p>
                  <Button className="bg-gradient-primary text-primary-foreground border-0">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Available Packages</h2>
              <p className="text-muted-foreground">Choose the perfect package for your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`relative group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur-sm ${
                    activeSubscription?.package_id === pkg.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {pkg.name}
                      </CardTitle>
                      {activeSubscription?.package_id === pkg.id && (
                        <Badge className="bg-gradient-primary text-primary-foreground border-0">
                          Current
                        </Badge>
                      )}
                      {pkg.name === "Video Pulse" && activeSubscription?.package_id !== pkg.id && (
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
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full transition-all duration-300 ${
                        activeSubscription?.package_id === pkg.id
                          ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          : pkg.name === "Video Pulse" 
                            ? "bg-gradient-primary hover:shadow-glow text-primary-foreground border-0" 
                            : "bg-secondary hover:bg-secondary/80"
                      }`}
                      onClick={() => activeSubscription?.package_id !== pkg.id && handleSubscribeToPackage(pkg.id)}
                      disabled={activeSubscription?.package_id === pkg.id}
                    >
                      {activeSubscription?.package_id === pkg.id ? "Current Package" : "Select Package"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}