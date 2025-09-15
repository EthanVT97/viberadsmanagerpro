import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Eye,
  TrendingUp,
  MousePointer,
  AlertCircle,
  Zap,
  Crown,
  Package,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import CampaignManager from "@/components/dashboard/CampaignManager";
import ProfileManager from "@/components/dashboard/ProfileManager";
import SubscriptionManager from "@/components/dashboard/SubscriptionManager";
import CampaignSettings from "@/components/dashboard/CampaignSettings";
import DetailedAnalytics from "@/components/dashboard/DetailedAnalytics";
import PackageLimitsCard from "@/components/dashboard/PackageLimitsCard";
import PackageManager from "@/components/dashboard/PackageManager";
import { useCampaignAnalytics } from "@/hooks/useCampaignAnalytics";
import { usePackageLimits } from "@/hooks/usePackageLimits";

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
  const { analytics: campaignAnalytics, loading: analyticsLoading, fetchAnalytics } = useCampaignAnalytics();
  const { canCreateCampaign } = usePackageLimits();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const fetchUserData = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    setError(null);
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Profile error: ${profileError.message}`);
      }

      setProfile(profileData);

      // Fetch user subscriptions with packages
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          packages(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (subsError) {
        throw new Error(`Subscriptions error: ${subsError.message}`);
      }

      setSubscriptions(subsData || []);

      // Fetch user campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (campaignsError) {
        throw new Error(`Campaigns error: ${campaignsError.message}`);
      }

      setCampaigns(campaignsData || []);

      // Fetch available packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price_euro', { ascending: true });

      if (packagesError) {
        throw new Error(`Packages error: ${packagesError.message}`);
      }

      setPackages(packagesData || []);

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('campaign_analytics')
        .select(`
          *,
          campaigns!inner (user_id)
        `)
        .eq('campaigns.user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30);

      if (analyticsError) {
        console.error('Analytics error:', analyticsError);
        // Don't throw for analytics errors, just log them
      }

      setAnalytics(analyticsData || []);

      if (showRefreshToast) {
        toast({
          title: "Data refreshed",
          description: "Dashboard data has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setError(error.message);
      toast({
        title: "Error loading dashboard",
        description: error.message || "Failed to load dashboard data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
      setRefreshing(false);
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

  const handleRefresh = () => {
    fetchUserData(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  };

  const calculateCPC = (spend: number, clicks: number) => {
    return clicks > 0 ? (spend / clicks).toFixed(2) : '0.00';
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-primary-foreground font-bold text-2xl">V</span>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">Loading dashboard...</p>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeSubscription = subscriptions.find(sub => sub.status === 'active');
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.budget_euro || 0), 0) / 100;

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Enhanced Header */}
      <header className="glass-card border-b border-border/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft hover:shadow-glow transition-elegant">
                <span className="text-primary-foreground font-bold text-xl">V</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-foreground">Dashboard</span>
                <div className="text-xs text-muted-foreground">Myanmar Business Platform</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="hover-lift transition-elegant"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-lift transition-elegant">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                        {profile?.business_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 glass-card shadow-strong border border-border/50" align="end">
                  <div className="flex items-center justify-start gap-3 p-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                        {profile?.business_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-foreground">
                        {profile?.business_name || 'Business User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("profile")} className="cursor-pointer hover:bg-primary/10 transition-elegant">
                    <User className="mr-3 h-4 w-4 text-primary" />
                    <span className="font-medium">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer hover:bg-primary/10 transition-elegant">
                    <Settings className="mr-3 h-4 w-4 text-primary" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-destructive/10 text-destructive transition-elegant">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {error}
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2 text-destructive underline p-0 h-auto"
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}!
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Manage your Viber advertising campaigns and track performance across Myanmar.
              </p>
            </div>
            
            {activeSubscription && (
              <div className="flex items-center gap-2 p-3 glass-card rounded-xl border border-primary/20">
                <Crown className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{activeSubscription.packages.name}</p>
                  <p className="text-xs text-muted-foreground">Active Plan</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              onClick={async () => {
                const canCreate = await canCreateCampaign();
                if (canCreate) {
                  navigate("/campaigns/create");
                } else {
                  toast({
                    title: "Campaign limit reached",
                    description: "Please upgrade your package to create more campaigns.",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-gradient-primary text-primary-foreground border-0 hover:shadow-glow hover-lift transition-elegant flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("analytics")}
              className="hover-lift transition-elegant flex-1 sm:flex-none"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("packages")}
              className="hover-lift transition-elegant flex-1 sm:flex-none"
            >
              <Package className="mr-2 h-4 w-4" />
              Packages
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="glass-card hover:shadow-card hover-lift transition-elegant duration-500 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {activeCampaigns.length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {campaigns.length} total campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-card hover-lift transition-elegant duration-500 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Reach</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {totalImpressions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3 text-primary" />
                Myanmar users reached
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-card hover-lift transition-elegant duration-500 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MousePointer className="h-4 w-4 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {calculateCTR(totalClicks, totalImpressions)}% CTR
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-card hover-lift transition-elegant duration-500 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                €{totalSpend.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" />
                Campaign budgets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Performance Summary */}
        {campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="glass-card border-border/30">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  {calculateCTR(totalClicks, totalImpressions)}%
                </div>
                <p className="text-sm text-muted-foreground">Average CTR</p>
                <p className="text-xs text-muted-foreground mt-1">Industry avg: 2.1%</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-border/30">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  €{calculateCPC(totalSpend, totalClicks)}
                </div>
                <p className="text-sm text-muted-foreground">Average CPC</p>
                <p className="text-xs text-muted-foreground mt-1">Industry avg: €0.85</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-border/30">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  {totalConversions}
                </div>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 min-w-max lg:min-w-full">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="campaigns" className="text-xs sm:text-sm">Campaigns</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="detailed-analytics" className="text-xs sm:text-sm">Reports</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
              <TabsTrigger value="packages" className="text-xs sm:text-sm">Packages</TabsTrigger>
              <TabsTrigger value="manage-packages" className="text-xs sm:text-sm">Manage</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Package Limits Card */}
              <PackageLimitsCard onUpgradeClick={() => setActiveTab("packages")} />

              {/* Enhanced Current Subscription */}
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription>Your active advertising package</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeSubscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{activeSubscription.packages.name}</h3>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Active
                          </Badge>
                          {activeSubscription.packages.name === 'Video Pulse' && (
                            <Badge className="bg-gradient-primary text-primary-foreground border-0">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {activeSubscription.packages.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            €{activeSubscription.packages.price_euro / 100}
                            <span className="text-base font-normal text-muted-foreground">/month</span>
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          <p className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Started: {new Date(activeSubscription.start_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setActiveTab("packages")}
                        variant="outline"
                        className="w-full hover-lift transition-elegant"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Switch Package
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No active subscription</h3>
                      <p className="text-muted-foreground mb-4">
                        Choose a package to start advertising on Viber
                      </p>
                      <Button 
                        className="bg-gradient-primary text-primary-foreground border-0 hover:shadow-glow hover-lift transition-elegant"
                        onClick={() => setActiveTab("packages")}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Choose a Package
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns Preview */}
            {campaigns.length > 0 && (
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Campaigns</CardTitle>
                      <CardDescription>Your latest advertising campaigns</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab("campaigns")}
                      className="hover-lift transition-elegant"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-elegant">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusBadgeColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">{campaign.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(campaign.impressions || 0).toLocaleString()} impressions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">€{campaign.budget_euro / 100}</p>
                          <p className="text-xs text-muted-foreground">Budget</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
              <p className="text-muted-foreground">Track your campaign performance and audience engagement across Myanmar</p>
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

          <TabsContent value="detailed-analytics" className="space-y-6">
            <DetailedAnalytics 
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

          <TabsContent value="settings" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Campaign Settings</h2>
              <p className="text-muted-foreground">Configure and optimize your campaign settings</p>
            </div>
            <CampaignSettings 
              campaigns={campaigns}
              onCampaignsChange={fetchUserData}
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

          <TabsContent value="manage-packages" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Package Management</h2>
              <p className="text-muted-foreground">Create and manage advertising packages for the platform</p>
            </div>
            <PackageManager 
              packages={packages}
              onPackagesChange={fetchUserData}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}