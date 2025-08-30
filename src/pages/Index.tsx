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

        if (error) {
          console.error('Error fetching packages:', error);
          throw error;
        }
        setPackages(data || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
        // Set empty array as fallback to prevent app crash
        setPackages([]);
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
        <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Why Choose Our Platform?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 sm:mb-16 px-4">
              Built specifically for Myanmar businesses to succeed on Viber
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-card border border-border/50 hover:shadow-card transition-shadow">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">Myanmar Market Focus</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Specialized targeting and content optimized for Myanmar users and culture.
                </p>
              </div>
              
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-card border border-border/50 hover:shadow-card transition-shadow">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">iOS & Android Reach</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Complete coverage across all mobile platforms for maximum audience reach.
                </p>
              </div>
              
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-card border border-border/50 hover:shadow-card transition-shadow sm:col-span-2 lg:col-span-1">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">Professional Management</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Expert campaign management with dedicated support for your business growth.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Ready to Grow Your Business?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              Contact our team to get started with Viber advertising in Myanmar
            </p>
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
                <div className="text-center sm:text-left">
                  <p className="text-base sm:text-lg text-muted-foreground mb-2">
                    Email us at:
                  </p>
                  <a href="mailto:info@ygnb2b.com" className="text-primary hover:underline text-lg sm:text-xl font-medium">
                    info@ygnb2b.com
                  </a>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border"></div>
                <div className="text-center sm:text-left">
                  <p className="text-base sm:text-lg text-muted-foreground mb-2">
                    Or call:
                  </p>
                  <a href="tel:+959784340688" className="text-primary hover:underline text-lg sm:text-xl font-medium">
                    +95 9784340688
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
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