import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Target, 
  Clock, 
  DollarSign, 
  Save, 
  Trash2,
  Bell,
  Shield,
  Smartphone,
  Globe,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

interface CampaignSettingsProps {
  campaigns: Campaign[];
  onCampaignsChange: () => void;
}

export default function CampaignSettings({ campaigns, onCampaignsChange }: CampaignSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Campaign Settings
    daily_budget: '',
    schedule_enabled: false,
    start_time: '09:00',
    end_time: '18:00',
    frequency_cap: '3',
    
    // Targeting Settings
    age_min: '18',
    age_max: '65',
    gender: 'all',
    location_radius: '10',
    device_targeting: 'all',
    
    // Notification Settings
    performance_alerts: true,
    budget_alerts: true,
    completion_alerts: true,
    
    // Advanced Settings
    auto_optimization: true,
    custom_audiences: false,
    lookalike_audiences: false,
  });

  useEffect(() => {
    if (selectedCampaign) {
      // Initialize settings with campaign data
      setSettings(prev => ({
        ...prev,
        daily_budget: (selectedCampaign.budget_euro / 100 / 30).toFixed(0), // Rough daily estimate
      }));
    }
  }, [selectedCampaign]);

  const handleSaveSettings = async () => {
    if (!selectedCampaign || !user) return;

    setLoading(true);
    try {
      // Update campaign with new settings
      const { error } = await supabase
        .from('campaigns')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCampaign.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved!",
        description: "Campaign settings have been updated successfully.",
      });

      onCampaignsChange();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', selectedCampaign.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Campaign deleted",
        description: `${selectedCampaign.name} has been deleted successfully.`,
      });

      setSelectedCampaign(null);
      onCampaignsChange();
    } catch (error: any) {
      toast({
        title: "Error deleting campaign",
        description: error.message || "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCampaign) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Campaign Settings
            </CardTitle>
            <CardDescription>Select a campaign to configure its settings</CardDescription>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a campaign to manage its settings, targeting, and performance options.
                </p>
                <div className="grid gap-3">
                  {campaigns.map((campaign) => (
                    <Card 
                      key={campaign.id} 
                      className="cursor-pointer hover:shadow-card transition-shadow bg-card/50"
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{campaign.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Budget: €{campaign.budget_euro / 100} • {campaign.status}
                            </p>
                          </div>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground">
                  Create a campaign first to access its settings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {selectedCampaign.name}
              </CardTitle>
              <CardDescription>Configure campaign settings and optimization</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                Back to Campaigns
              </Button>
              <Button onClick={handleSaveSettings} disabled={loading}>
              <Button onClick={handleSaveSettings} disabled={saveLoading}>
                <Save className="mr-2 h-4 w-4" />
                {saveLoading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{selectedCampaign.impressions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Impressions</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{selectedCampaign.clicks}</div>
              <div className="text-sm text-muted-foreground">Clicks</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{selectedCampaign.conversions}</div>
              <div className="text-sm text-muted-foreground">Conversions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-budget">Daily Budget (EUR)</Label>
                  <Input
                    id="daily-budget"
                    type="number"
                    value={settings.daily_budget}
                    onChange={(e) => setSettings(prev => ({ ...prev, daily_budget: e.target.value }))}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency-cap">Frequency Cap</Label>
                  <Select value={settings.frequency_cap} onValueChange={(value) => setSettings(prev => ({ ...prev, frequency_cap: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 per day</SelectItem>
                      <SelectItem value="3">3 per day</SelectItem>
                      <SelectItem value="5">5 per day</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule"
                  checked={settings.schedule_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, schedule_enabled: checked }))}
                />
                <Label htmlFor="schedule">Enable scheduling</Label>
              </div>
              
              {settings.schedule_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={settings.start_time}
                      onChange={(e) => setSettings(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={settings.end_time}
                      onChange={(e) => setSettings(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Audience Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age-min">Minimum Age</Label>
                  <Select value={settings.age_min} onValueChange={(value) => setSettings(prev => ({ ...prev, age_min: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="13">13</SelectItem>
                      <SelectItem value="18">18</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="35">35</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age-max">Maximum Age</Label>
                  <Select value={settings.age_max} onValueChange={(value) => setSettings(prev => ({ ...prev, age_max: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="35">35</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                      <SelectItem value="55">55</SelectItem>
                      <SelectItem value="65">65+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={settings.gender} onValueChange={(value) => setSettings(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device">Device Targeting</Label>
                  <Select value={settings.device_targeting} onValueChange={(value) => setSettings(prev => ({ ...prev, device_targeting: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      <SelectItem value="mobile">Mobile Only</SelectItem>
                      <SelectItem value="ios">iOS Only</SelectItem>
                      <SelectItem value="android">Android Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="performance-alerts">Performance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about campaign performance changes</p>
                  </div>
                  <Switch
                    id="performance-alerts"
                    checked={settings.performance_alerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, performance_alerts: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="budget-alerts">Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when budget is running low</p>
                  </div>
                  <Switch
                    id="budget-alerts"
                    checked={settings.budget_alerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, budget_alerts: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="completion-alerts">Completion Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when campaigns complete</p>
                  </div>
                  <Switch
                    id="completion-alerts"
                    checked={settings.completion_alerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, completion_alerts: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-optimization">Auto Optimization</Label>
                    <p className="text-sm text-muted-foreground">Let AI optimize your campaign automatically</p>
                  </div>
                  <Switch
                    id="auto-optimization"
                    checked={settings.auto_optimization}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_optimization: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="custom-audiences">Custom Audiences</Label>
                    <p className="text-sm text-muted-foreground">Use your customer data for targeting</p>
                  </div>
                  <Switch
                    id="custom-audiences"
                    checked={settings.custom_audiences}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, custom_audiences: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lookalike-audiences">Lookalike Audiences</Label>
                    <p className="text-sm text-muted-foreground">Target users similar to your customers</p>
                  </div>
                  <Switch
                    id="lookalike-audiences"
                    checked={settings.lookalike_audiences}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, lookalike_audiences: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                These actions cannot be undone. Please be careful.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Campaign
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{selectedCampaign.name}"? This action cannot be undone and will permanently remove all campaign data and analytics.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCampaign} className="bg-destructive text-destructive-foreground">
                      Delete Campaign
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}