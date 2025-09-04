import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, BarChart3, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-surface px-4 sm:px-6 lg:px-8">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="absolute top-10 left-4 sm:top-20 sm:left-20 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-float opacity-60" style={{animationDelay: '0s'}}></div>
      <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-20 w-80 h-80 sm:w-[28rem] sm:h-[28rem] bg-primary-glow/8 rounded-full blur-3xl animate-float opacity-40" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[32rem] sm:h-[32rem] bg-gradient-accent opacity-30 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center animate-fade-in-scale">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
            <span className="text-gradient-hero">
              Viber Ads Manager
            </span>
            <br />
            <span className="text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-medium">
              for Myanmar Business
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 animate-slide-up">
            Grow your business with targeted advertising on Viber's platform. 
            Reach millions of Myanmar users with our professional ads management system.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 sm:mb-20 px-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow hover-lift text-primary-foreground border-0 px-8 sm:px-10 py-6 sm:py-7 text-lg sm:text-xl font-semibold group w-full sm:w-auto transition-elegant rounded-xl shadow-medium"
            >
              {user ? "Go to Dashboard" : "Get Started Today"}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-elegant" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 hover-lift glass-card px-8 sm:px-10 py-6 sm:py-7 text-lg sm:text-xl font-semibold w-full sm:w-auto transition-elegant rounded-xl"
            onClick={() => {
              const pricingSection = document.getElementById('pricing');
              pricingSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Packages
          </Button>
        </div>
        
        {/* Enhanced feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-5xl mx-auto px-4">
          <div className="text-center group animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center hover-glow hover-lift transition-elegant shadow-soft">
              <Target className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">Targeted Reach</h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Reach your ideal customers in Myanmar with precision targeting
            </p>
          </div>
          
          <div className="text-center group animate-slide-up" style={{animationDelay: '0.6s'}}>
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center hover-glow hover-lift transition-elegant shadow-soft">
              <BarChart3 className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">Analytics & Insights</h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Track performance with detailed analytics and reporting
            </p>
          </div>
          
          <div className="text-center group animate-slide-up sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.8s'}}>
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center hover-glow hover-lift transition-elegant shadow-soft">
              <Globe className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">Myanmar Focus</h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Specialized platform designed for Myanmar business needs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}