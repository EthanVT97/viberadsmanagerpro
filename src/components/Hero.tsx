import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, BarChart3, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      <div className="absolute top-10 left-4 sm:top-20 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-primary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '0s'}}></div>
      <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Viber Ads Manager
            </span>
            <br />
            <span className="text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-6xl">
              for Myanmar Business
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Grow your business with targeted advertising on Viber's platform. 
            Reach millions of Myanmar users with our professional ads management system.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow text-primary-foreground border-0 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg group w-full sm:w-auto"
            >
              {user ? "Go to Dashboard" : "Get Started Today"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-primary/30 hover:bg-primary/10 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
            onClick={() => {
              const pricingSection = document.getElementById('pricing');
              pricingSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Packages
          </Button>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <Target className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">Targeted Reach</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Reach your ideal customers in Myanmar with precision targeting
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">Analytics & Insights</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track performance with detailed analytics and reporting
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <Globe className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground sm:col-span-2 lg:col-span-1">Myanmar Focus</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Specialized platform designed for Myanmar business needs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}