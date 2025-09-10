import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  BarChart3, 
  Target, 
  Eye, 
  AlertTriangle,
  Crown,
  Zap
} from "lucide-react";
import { usePackageLimits } from "@/hooks/usePackageLimits";

interface PackageLimitsCardProps {
  onUpgradeClick: () => void;
}

export default function PackageLimitsCard({ onUpgradeClick }: PackageLimitsCardProps) {
  const { limits, usage, loading, getUsagePercentage, isNearLimit, isAtLimit } = usePackageLimits();

  if (loading || !limits || !usage) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const campaignUsagePercent = getUsagePercentage(usage.current_campaigns, limits.campaign_limit);
  const impressionsUsagePercent = getUsagePercentage(usage.current_monthly_impressions, limits.monthly_impressions_limit);

  const isPremiumPackage = limits.package_name === 'Video Pulse' || limits.package_name === 'Enterprise Plan';

  return (
    <Card className={`${isPremiumPackage ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-primary/10' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isPremiumPackage ? (
              <Crown className="h-5 w-5 text-primary" />
            ) : (
              <Package className="h-5 w-5" />
            )}
            {limits.package_name}
          </CardTitle>
          {isPremiumPackage && (
            <Badge className="bg-gradient-primary text-primary-foreground border-0">
              Premium
            </Badge>
          )}
        </div>
        <CardDescription>Your current package usage and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Campaigns</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.current_campaigns} / {limits.campaign_limit}
            </span>
          </div>
          <Progress 
            value={campaignUsagePercent} 
            className={`h-2 ${isAtLimit(usage.current_campaigns, limits.campaign_limit) ? 'bg-red-100' : isNearLimit(usage.current_campaigns, limits.campaign_limit) ? 'bg-yellow-100' : ''}`}
          />
          {isAtLimit(usage.current_campaigns, limits.campaign_limit) && (
            <div className="flex items-center gap-2 text-red-600 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>Campaign limit reached</span>
            </div>
          )}
        </div>

        {/* Monthly Impressions Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Monthly Impressions</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.current_monthly_impressions.toLocaleString()} / {limits.monthly_impressions_limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={impressionsUsagePercent} 
            className={`h-2 ${isAtLimit(usage.current_monthly_impressions, limits.monthly_impressions_limit) ? 'bg-red-100' : isNearLimit(usage.current_monthly_impressions, limits.monthly_impressions_limit) ? 'bg-yellow-100' : ''}`}
          />
          {isNearLimit(usage.current_monthly_impressions, limits.monthly_impressions_limit) && (
            <div className="flex items-center gap-2 text-amber-600 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>Approaching monthly limit</span>
            </div>
          )}
        </div>

        {/* Ads Per Campaign Limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ads per Campaign</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Up to {limits.ads_per_campaign_limit} ads
            </span>
          </div>
        </div>

        {/* Campaign Status Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Campaign Status</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-medium text-green-800">{usage.campaigns_by_status.active}</div>
              <div className="text-green-600">Active</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="font-medium text-yellow-800">{usage.campaigns_by_status.paused}</div>
              <div className="text-yellow-600">Paused</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-medium text-gray-800">{usage.campaigns_by_status.draft}</div>
              <div className="text-gray-600">Draft</div>
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        {(isAtLimit(usage.current_campaigns, limits.campaign_limit) || 
          isNearLimit(usage.current_monthly_impressions, limits.monthly_impressions_limit)) && (
          <div className="pt-4 border-t">
            <Button 
              onClick={onUpgradeClick}
              className="w-full bg-gradient-primary text-primary-foreground border-0"
              size="sm"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Package
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}