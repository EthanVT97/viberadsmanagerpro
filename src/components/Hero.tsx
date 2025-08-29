import { Button } from "@/components/ui/button";
import { ArrowRight, Target, BarChart3, Globe } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Viber Ads Manager
            </span>
            <br />
            <span className="text-foreground">
              for Myanmar Business
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Grow your business with targeted advertising on Viber's platform. 
            Reach millions of Myanmar users with our professional ads management system.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-glow text-primary-foreground border-0 px-8 py-6 text-lg group"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-primary/30 hover:bg-primary/10 px-8 py-6 text-lg"
          >
            View Packages
          </Button>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <Target className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Targeted Reach</h3>
            <p className="text-muted-foreground">
              Reach your ideal customers in Myanmar with precision targeting
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Analytics & Insights</h3>
            <p className="text-muted-foreground">
              Track performance with detailed analytics and reporting
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <Globe className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Myanmar Focus</h3>
            <p className="text-muted-foreground">
              Specialized platform designed for Myanmar business needs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}