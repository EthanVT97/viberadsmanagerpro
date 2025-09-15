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
    <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-surface relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-glow/8 rounded-full blur-3xl opacity-40"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 sm:mb-20 animate-fade-in-scale">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Powerful Features for Myanmar Businesses
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Everything you need to create, manage, and optimize successful advertising campaigns on Viber's platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group glass-card hover:shadow-strong transition-elegant duration-500 border-border/30 hover:border-primary/30 hover-lift"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardHeader className="pb-6">
                <div className="w-16 h-16 mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center hover-glow hover-scale transition-elegant shadow-soft">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-3">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
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