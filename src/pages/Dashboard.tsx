import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Edit,
  Trash2,
  TrendingUp,
  Users,
  MousePointer
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

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    budget: '',
    targetAudience: '',
    description: ''
  });
  const [editingProfile, setEditingProfile] = useState({
    business_name: '',
    contact_email: '',
    phone: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      loadMockCampaigns();
    }
  }, [user]);

  const loadMockCampaigns = () => {
    // Mock campaigns data for demonstration
    setCampaigns([
      {
        id: '1',
        name: 'Myanmar Food Delivery',
        status: 'active',
        budget: 500,
        impressions: 12500,
        clicks: 340,
        conversions: 28
      },
      {
        id: '2',
        name: 'Fashion Store Promotion',
        status: 'paused',
        budget: 300,
        impressions: 8200,
        clicks: 156,
        conversions: 12
      }
    ]);
  };

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // If no profile exists, create one
      if (!profileData && user) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            contact_email: user.email,
            business_name: user.user_metadata?.business_name || '',
            phone: user.user_metadata?.phone || ''
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);
        setEditingProfile({
          business_name: profileData.business_name || '',
          contact_email: profileData.contact_email || '',
          phone: profileData.phone || ''
        });
      }

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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a package.",
        variant: "destructive",
      });
      return;
    }

    // Check if user already has an active subscription
    if (activeSubscription) {
      toast({
        title: "Subscription exists",
        description: "You already have an active subscription. Please cancel it first to change packages.",
        variant: "destructive",
      });
      return;
    }

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

      fetchUserData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate subscription.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.budget) {
      toast({
        title: "Missing information",
        description: "Please fill in campaign name and budget.",
        variant: "destructive",
      });
      return;
    }

    // Mock campaign creation
    const mockCampaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      status: 'draft',
      budget: parseInt(newCampaign.budget),
      impressions: 0,
      clicks: 0,
      conversions: 0
    };

    setCampaigns(prev => [...prev, mockCampaign]);
    setNewCampaign({ name: '', budget: '', targetAudience: '', description: '' });
    setShowCreateCampaign(false);

    toast({
      title: "Campaign created!",
      description: "Your new campaign has been created successfully.",
    });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: editingProfile.business_name,
          contact_email: editingProfile.contact_email,
          phone: editingProfile.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        ...editingProfile
      }));

      setShowEditProfile(false);
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' as 'active' | 'paused' }
        : campaign
    ));

    const campaign = campaigns.find(c => c.id === campaignId);
    toast({
      title: `Campaign ${campaign?.status === 'active' ? 'paused' : 'activated'}`,
      description: `${campaign?.name} has been ${campaign?.status === 'active' ? 'paused' : 'activated'}.`,
    });
  };

  const deleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    
    toast({
      title: "Campaign deleted",
      description: `${campaign?.name} has been deleted.`,
    });
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
  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);

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
                      {user?.email?.[0]?.toUpperCase() || 'U'}
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
                <DropdownMenuItem onClick={() => setShowEditProfile(true)}>
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
              <div className="text-2xl font-bold">
                {campaigns.filter(c => c.status === 'active').length}
              </div>
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
                Total views
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
                Total clicks
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
                {totalClicks > 0 ? `${((totalConversions / totalClicks) * 100).toFixed(1)}% CTR` : 'No data yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-none sm:flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                        <h3 className="font-semibold text-sm sm:text-base">{activeSubscription.packages.name}</h3>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
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
                          // Switch to packages tab
                          const packagesTab = document.querySelector('[value="packages"]') as HTMLButtonElement;
                          if (packagesTab) {
                            packagesTab.click();
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
                    onClick={() => setShowCreateCampaign(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Campaign
                  </Button>
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
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowEditProfile(true)}
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
                <CardTitle>Recent Activity</CardTitle>
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
                            {campaign.impressions.toLocaleString()} impressions • {campaign.clicks} clicks
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Campaigns</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your Viber advertising campaigns</p>
              </div>
              <Button 
                className="bg-gradient-primary text-primary-foreground border-0 w-full sm:w-auto"
                onClick={() => setShowCreateCampaign(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>

            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-card transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg">{campaign.name}</h3>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Budget</p>
                              <p className="font-medium">€{campaign.budget}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Impressions</p>
                              <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Clicks</p>
                              <p className="font-medium">{campaign.clicks}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Conversions</p>
                              <p className="font-medium">{campaign.conversions}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCampaignStatus(campaign.id)}
                            className="flex-1 sm:flex-none"
                          >
                            {campaign.status === 'active' ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Start
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCampaign(campaign.id)}
                            className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first campaign to start advertising on Viber
                    </p>
                    <Button 
                      className="bg-gradient-primary text-primary-foreground border-0"
                      onClick={() => setShowCreateCampaign(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Available Packages</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Choose the perfect package for your business</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`relative group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur-sm h-full flex flex-col ${
                    activeSubscription?.package_id === pkg.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
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
                      } text-sm sm:text-base py-2 sm:py-3`}
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

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new advertising campaign for your business.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-budget">Budget (EUR)</Label>
              <Input
                id="campaign-budget"
                type="number"
                placeholder="Enter budget amount"
                value={newCampaign.budget}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Select value={newCampaign.targetAudience} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="young-adults">Young Adults (18-35)</SelectItem>
                  <SelectItem value="professionals">Professionals (25-45)</SelectItem>
                  <SelectItem value="families">Families (30-50)</SelectItem>
                  <SelectItem value="seniors">Seniors (50+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea
                id="campaign-description"
                placeholder="Describe your campaign goals"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowCreateCampaign(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} className="bg-gradient-primary text-primary-foreground border-0 flex-1">
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your business information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-business-name">Business Name</Label>
              <Input
                id="edit-business-name"
                placeholder="Enter business name"
                value={editingProfile.business_name}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, business_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Contact Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter contact email"
                value={editingProfile.contact_email}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, contact_email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+95 9xxxxxxxxx"
                value={editingProfile.phone}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowEditProfile(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} className="bg-gradient-primary text-primary-foreground border-0 flex-1">
              Update Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}