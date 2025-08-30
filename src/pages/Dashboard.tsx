import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Eye,
  TrendingUp,
  Users,
  MousePointer
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CampaignManager from "@/components/dashboard/CampaignManager";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
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
  status: 'active' | 'paused' | 'draft';
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  targetAudience: string;
  description: string;
  createdAt: string;
}

interface Profile {
  id: string;
  user_id: string;
  business_name: string | null;
  contact_email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      loadInitialCampaigns();
    }
  }, [user]);

  const loadInitialCampaigns = () => {
    // Load campaigns from localStorage or create initial mock data
    const savedCampaigns = localStorage.getItem('viber-campaigns');
    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns));
    } else {
      // Create some initial demo campaigns
      const demoCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Myanmar Food Delivery',
          status: 'active',
          budget: 500,
          impressions: 12500,
          clicks: 340,
          conversions: 28,
          targetAudience: 'young-adults',
          description: 'Promote our food delivery service to young professionals',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Fashion Store Promotion',
          status: 'paused',
          budget: 300,
          impressions: 8200,
          clicks: 156,
          conversions: 12,
          targetAudience: 'families',
          description: 'Seasonal fashion collection for families',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setCampaigns(demoCampaigns);
      localStorage.setItem('viber-campaigns', JSON.stringify(demoCampaigns));
    }
  };

  const handleCampaignsChange = (newCampaigns: Campaign[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('viber-campaigns', JSON.stringify(newCampaigns));
  };

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
        setPackages(data || []);
        variant: "destructive",
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

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const handleSubscriptionChange = () => {
    fetchUserData();
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

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
              <span className="text-lg sm:text-xl font-bold text-foreground">Dashboard</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {profile?.business_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm truncate">{user?.email}</p>
                    {profile?.business_name && (
                      <p className="text-xs text-muted-foreground">{profile.business_name}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")}>
                  <Target className="mr-2 h-4 w-4" />
                  Home
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your Viber advertising campaigns and track your performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {campaigns.length > 0 ? `${campaigns.length} total campaigns` : 'No campaigns yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total views across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}% CTR` : 'No data yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversions}</div>
              <p className="text-xs text-muted-foreground">
                {totalClicks > 0 ? `${((totalConversions / totalClicks) * 100).toFixed(1)}% conversion rate` : 'No data yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:grid-cols-none sm:flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Subscription Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                  <CardDescription>Your current advertising package</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeSubscription ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm sm:text-base">{activeSubscription.packages.name}</h3>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {activeSubscription.packages.description}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-primary mb-2">
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
                        onClick={() => {
                          const profileTab = document.querySelector('[value="profile"]') as HTMLButtonElement;
                          if (profileTab) {
                            profileTab.click();
                          }
                        }}
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
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const campaignsTab = document.querySelector('[value="campaigns"]') as HTMLButtonElement;
                      if (campaignsTab) {
                        campaignsTab.click();
                      }
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Campaign
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const analyticsTab = document.querySelector('[value="analytics"]') as HTMLButtonElement;
                      if (analyticsTab) {
                        analyticsTab.click();
                      }
                    }}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const profileTab = document.querySelector('[value="profile"]') as HTMLButtonElement;
                      if (profileTab) {
                        profileTab.click();
                      }
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaign Activity</CardTitle>
                <CardDescription>Your latest campaign performance</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="mb-2 sm:mb-0">
                          <h4 className="font-medium text-sm sm:text-base">{campaign.name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {campaign.impressions.toLocaleString()} impressions • {campaign.clicks} clicks • {campaign.conversions} conversions
                          </p>
                        </div>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <CampaignManager 
              campaigns={campaigns} 
              onCampaignsChange={handleCampaignsChange}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Analytics & Insights</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track your campaign performance and optimize your advertising strategy
              </p>
            </div>
            <AnalyticsChart campaigns={campaigns} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ProfileManager 
                  profile={profile} 
                  user={user} 
                  onProfileUpdate={handleProfileUpdate}
                />
              </div>
              <div>
                <SubscriptionManager 
                  subscriptions={subscriptions}
                  packages={packages}
                  user={user}
                  onSubscriptionChange={handleSubscriptionChange}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}