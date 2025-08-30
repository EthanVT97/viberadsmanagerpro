import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  BarChart3, 
  Globe, 
  Smartphone, 
  Users, 
  TrendingUp,
  Shield,
  Clock,
  Zap
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Reach your ideal customers in Myanmar with advanced demographic and behavioral targeting options."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor campaign performance with detailed metrics, conversion tracking, and ROI analysis."
    },
    {
      icon: Globe,
      title: "Myanmar Market Focus",
      description: "Specialized platform designed specifically for Myanmar businesses and local market dynamics."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Approach",
      description: "Optimized for Viber's mobile platform on both iOS and Android devices for maximum reach."
    },
    {
      icon: Users,
      title: "Audience Insights",
      description: "Understand your audience better with detailed demographic and engagement insights."
    },
    {
      icon: TrendingUp,
      title: "Performance Optimization",
      description: "AI-powered recommendations to improve campaign performance and maximize your advertising ROI."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee for your advertising campaigns."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support in Myanmar language for all your advertising needs."
    },
    {
      icon: Zap,
      title: "Quick Setup",
      description: "Get your campaigns running in minutes with our intuitive campaign creation wizard."
    }
  ];

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Powerful Features for Myanmar Businesses
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create, manage, and optimize successful advertising campaigns on Viber's platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="w-12 h-12 mb-4 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}