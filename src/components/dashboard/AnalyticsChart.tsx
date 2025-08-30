import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface AnalyticsChartProps {
  campaigns: Campaign[];
}

export default function AnalyticsChart({ campaigns }: AnalyticsChartProps) {
  // Generate mock time series data for the last 7 days
  const generateTimeSeriesData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayData = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: Math.floor(Math.random() * 2000) + 500,
        clicks: Math.floor(Math.random() * 100) + 20,
        conversions: Math.floor(Math.random() * 10) + 2
      };
      
      data.push(dayData);
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  const campaignPerformanceData = campaigns.map(campaign => ({
    name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    conversions: campaign.conversions,
    ctr: campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0'
  }));

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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Last 7 days performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="var(--color-impressions)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-impressions)" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="var(--color-clicks)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-clicks)" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="var(--color-conversions)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-conversions)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Campaign Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Compare your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaignPerformanceData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformanceData}>
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart className="h-12 w-12 mx-auto mb-4" />
                <p>No campaign data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}