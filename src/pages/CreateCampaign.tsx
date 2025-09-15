import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CreateCampaign() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget_euro: "",
    target_audience: "",
    status: "draft"
  });

  const [objectives, setObjectives] = useState({
    brand_awareness: false,
    lead_generation: false,
    sales_conversion: false,
    app_downloads: false,
    website_traffic: false,
  });

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'active') => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const selectedObjectives = Object.entries(objectives)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key.replace('_', ' '));

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          budget_euro: Math.round(parseFloat(formData.budget_euro) * 100), // Convert to cents
          target_audience: formData.target_audience,
          status: status,
          // These fields might not exist in the current table structure
          // campaign_objectives: selectedObjectives
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Campaign created successfully!",
        description: `Campaign "${formData.name}" has been ${status === 'draft' ? 'saved as draft' : 'created and activated'}.`,
      });

      navigate(`/campaigns/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating campaign",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Create New Campaign</h1>
                <p className="text-sm text-muted-foreground">Set up your Viber advertising campaign</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={(e) => handleSubmit(e, 'active')}
                disabled={loading}
                className="bg-gradient-primary text-primary-foreground border-0"
              >
                <Eye className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={(e) => handleSubmit(e, 'active')} className="space-y-8">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>Basic information about your advertising campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your campaign goals and target audience..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (EUR) *</Label>
                <Input
                  id="budget"
                  type="number"
                  min="1"
                  value={formData.budget_euro}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_euro: e.target.value }))}
                  placeholder="150"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This is your total campaign budget in Euros
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Textarea
                  id="audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="Describe your target audience: age, interests, location, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Objectives</CardTitle>
              <CardDescription>What do you want to achieve with this campaign?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  brand_awareness: "Brand Awareness",
                  lead_generation: "Lead Generation",
                  sales_conversion: "Sales Conversion",
                  app_downloads: "App Downloads",
                  website_traffic: "Website Traffic",
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={objectives[key as keyof typeof objectives]}
                      onCheckedChange={(checked) => 
                        setObjectives(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                    <Label htmlFor={key} className="text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Myanmar Market Focus */}
          <Card>
            <CardHeader>
              <CardTitle>Myanmar Market Settings</CardTitle>
              <CardDescription>Specialized settings for Myanmar audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">✓ Myanmar Targeting Enabled</h4>
                <p className="text-sm text-muted-foreground">
                  Your campaign will be optimized for Myanmar users on Viber's iOS and Android platforms.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm">Platform Coverage</h5>
                  <p className="text-xs text-muted-foreground">iOS & Android</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm">Market Focus</h5>
                  <p className="text-xs text-muted-foreground">Myanmar Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}