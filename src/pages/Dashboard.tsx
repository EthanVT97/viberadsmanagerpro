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
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import CampaignManager from "@/components/dashboard/CampaignManager";
import ProfileManager from "@/components/dashboard/ProfileManager";
import SubscriptionManager from "@/components/dashboard/SubscriptionManager";

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

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  budget_euro: number;
  target_audience: string;
  impressions: number;
  clicks: number;
  conversions: number;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<any[]>([]);

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

      // Fetch user campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setCampaigns(campaignsData || []);

      // Fetch available packages
      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price_euro', { ascending: true });

      setPackages(packagesData || []);

      // Fetch analytics data
      const { data: analyticsData } = await supabase
        .from('campaign_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      setAnalytics(analyticsData || []);
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
                {campaigns.filter(c => c.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Running campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((total, campaign) => total + (campaign.impressions || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Myanmar users reached
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{campaigns.reduce((total, campaign) => total + (campaign.budget_euro || 0), 0) / 100}
              </div>
              <p className="text-xs text-muted-foreground">
                Campaign budgets
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((total, campaign) => total + (campaign.conversions || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total conversions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
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
                  <Button 
                    onClick={() => navigate("/campaigns/create")}
                    className="w-full justify-start" 
                    variant="outline"
                  >
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
            <CampaignManager 
              campaigns={campaigns.map(campaign => ({
                id: campaign.id,
                name: campaign.name,
                status: campaign.status as 'active' | 'paused' | 'draft',
                budget: campaign.budget_euro / 100,
                impressions: campaign.impressions || 0,
                clicks: campaign.clicks || 0,
                conversions: campaign.conversions || 0,
                targetAudience: campaign.target_audience || '',
                description: campaign.description || '',
                createdAt: campaign.created_at
              }))}
              onCampaignsChange={fetchUserData}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Analytics & Insights</h2>
              <p className="text-muted-foreground">Track your campaign performance and audience engagement</p>
            </div>
            <AnalyticsChart 
              campaigns={campaigns.map(campaign => ({
                id: campaign.id,
                name: campaign.name,
                status: campaign.status as 'active' | 'paused' | 'draft',
                budget: campaign.budget_euro / 100,
                impressions: campaign.impressions || 0,
                clicks: campaign.clicks || 0,
                conversions: campaign.conversions || 0
              }))}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
              <p className="text-muted-foreground">Manage your business profile and account settings</p>
            </div>
            <ProfileManager 
              profile={profile}
              user={user}
              onProfileUpdate={(updatedProfile) => {
                setProfile(updatedProfile);
                toast({
                  title: "Profile updated",
                  description: "Your profile has been updated successfully.",
                });
              }}
            />
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Subscription Management</h2>
              <p className="text-muted-foreground">Manage your Viber advertising packages and subscriptions</p>
            </div>
            <SubscriptionManager 
              subscriptions={subscriptions}
              packages={packages}
              user={user}
              onSubscriptionChange={fetchUserData}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}