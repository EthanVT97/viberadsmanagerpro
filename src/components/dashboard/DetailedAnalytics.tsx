import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter,
  BarChart3
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface DetailedAnalyticsProps {
  campaigns: Campaign[];
}

export default function DetailedAnalytics({ campaigns }: DetailedAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // Generate comprehensive mock data
  const generateDetailedData = () => {
    const days = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayData = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 3000) + 1000,
        clicks: Math.floor(Math.random() * 150) + 50,
        conversions: Math.floor(Math.random() * 20) + 5,
        spend: Math.floor(Math.random() * 100) + 30,
        ctr: 0,
        cpc: 0,
        cpa: 0,
        reach: Math.floor(Math.random() * 2500) + 800
      };
      
      dayData.ctr = ((dayData.clicks / dayData.impressions) * 100);
      dayData.cpc = dayData.spend / dayData.clicks;
      dayData.cpa = dayData.spend / dayData.conversions;
      
      data.push(dayData);
    }
    
    return data;
  };

  const analyticsData = useMemo(() => generateDetailedData(), [selectedPeriod]);

  // Calculate totals and changes
  const totals = useMemo(() => {
    const current = analyticsData.reduce((acc, day) => ({
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
      conversions: acc.conversions + day.conversions,
      spend: acc.spend + day.spend,
      reach: acc.reach + day.reach
    }), { impressions: 0, clicks: 0, conversions: 0, spend: 0, reach: 0 });

    const ctr = (current.clicks / current.impressions) * 100;
    const cpc = current.spend / current.clicks;
    const cpa = current.spend / current.conversions;

    return {
      ...current,
      ctr,
      cpc,
      cpa
    };
  }, [analyticsData]);

  // Demographics data
  const demographicsData = [
    { name: '18-24', value: 25, color: 'hsl(var(--primary))' },
    { name: '25-34', value: 35, color: 'hsl(var(--primary-glow))' },
    { name: '35-44', value: 20, color: 'hsl(var(--secondary))' },
    { name: '45-54', value: 15, color: 'hsl(var(--accent))' },
    { name: '55+', value: 5, color: 'hsl(var(--muted))' }
  ];

  const deviceData = [
    { name: 'iOS', value: 60, color: 'hsl(var(--primary))' },
    { name: 'Android', value: 40, color: 'hsl(var(--secondary))' }
  ];

  const chartConfig = {
    impressions: {
      label: "Impressions",
      color: "hsl(var(--primary))",
    },
    clicks: {
      label: "Clicks", 
      color: "hsl(var(--primary-glow))",
    },
    conversions: {
      label: "Conversions",
      color: "hsl(var(--secondary))",
    },
    spend: {
      label: "Spend (EUR)",
      color: "hsl(var(--accent))",
    },
    reach: {
      label: "Reach",
      color: "hsl(var(--primary-variant))",
    },
  };

  if (campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No campaign data available</h3>
              <p className="text-muted-foreground">
                Create and activate campaigns to see detailed analytics here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Detailed Analytics</h2>
          <p className="text-muted-foreground">Comprehensive performance insights for your campaigns</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{totals.impressions.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">+12.5%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{totals.clicks.toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">+8.3%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{totals.conversions}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-500">-2.1%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">€{totals.spend.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">+5.7%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Click-Through Rate</p>
            <p className="text-3xl font-bold text-primary">{totals.ctr.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">Industry avg: 2.1%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Cost Per Click</p>
            <p className="text-3xl font-bold text-primary">€{totals.cpc.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Industry avg: €0.85</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Cost Per Acquisition</p>
            <p className="text-3xl font-bold text-primary">€{totals.cpa.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Industry avg: €12.50</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>Track key metrics across the selected time period</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="impressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-impressions)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-impressions)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        stroke="var(--color-impressions)"
                        fillOpacity={1}
                        fill="url(#impressions)"
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="var(--color-clicks)"
                        fillOpacity={1}
                        fill="url(#clicks)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Comparison</CardTitle>
                <CardDescription>Compare performance across all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaigns.map(campaign => ({
                      name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
                      impressions: campaign.impressions,
                      clicks: campaign.clicks,
                      conversions: campaign.conversions
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="impressions" fill="var(--color-impressions)" />
                      <Bar dataKey="clicks" fill="var(--color-clicks)" />
                      <Bar dataKey="conversions" fill="var(--color-conversions)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Age Demographics</CardTitle>
              <CardDescription>Audience breakdown by age groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Distribution</CardTitle>
              <CardDescription>Campaign performance by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Trends</CardTitle>
              <CardDescription>Track spending and cost efficiency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="spend" 
                      stroke="var(--color-spend)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-spend)" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cpc" 
                      stroke="var(--color-clicks)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-clicks)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}