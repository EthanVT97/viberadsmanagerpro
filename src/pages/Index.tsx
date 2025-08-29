import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

interface Package {
  id: string;
  name: string;
  description: string;
  price_euro: number;
  features: string[];
}

const Index = () => {
  const { user, loading } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('price_euro', { ascending: true });

        if (error) throw error;
        setPackages(data || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading || packagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-primary-foreground font-bold text-2xl">V</span>
          </div>
          <p className="text-muted-foreground">Loading Viber Ads Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <main>
        <Hero />
        
        <section id="pricing">
          <PricingSection packages={packages} />
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
              Built specifically for Myanmar businesses to succeed on Viber
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Myanmar Market Focus</h3>
                <p className="text-muted-foreground">
                  Specialized targeting and content optimized for Myanmar users and culture.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="text-xl font-semibold mb-3 text-foreground">iOS & Android Reach</h3>
                <p className="text-muted-foreground">
                  Complete coverage across all mobile platforms for maximum audience reach.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Professional Management</h3>
                <p className="text-muted-foreground">
                  Expert campaign management with dedicated support for your business growth.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-20 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Contact our team to get started with Viber advertising in Myanmar
            </p>
            <div className="bg-card border border-border/50 rounded-2xl p-8">
              <p className="text-lg text-muted-foreground mb-4">
                Email us at: <a href="mailto:info@ygnb2b.com" className="text-primary hover:underline">info@ygnb2b.com</a>
              </p>
              <p className="text-lg text-muted-foreground">
                Or call: <a href="tel:+959784340688" className="text-primary hover:underline">+95 9784340688</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;