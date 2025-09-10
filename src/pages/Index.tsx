import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PricingSection from "@/components/PricingSection";
import FeaturesSection from "@/components/FeaturesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Package {
  id: string;
  name: string;
  description: string;
  price_euro: number;
  features: string[];
}

const defaultPackages: Package[] = [
  {
    id: '1',
    name: 'Business Exclusive',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 15000,
    features: ['Exclusive business targeting', 'Premium ad placement', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '2',
    name: 'Display Reach',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 15000,
    features: ['Display advertising', 'Wide audience reach', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '3',
    name: 'Daily Essentials',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 15000,
    features: ['Daily engagement ads', 'Essential features', 'Myanmar market focus', 'iOS & Android reach']
  },
  {
    id: '4',
    name: 'Video Pulse',
    description: 'Rakuten Viber - Mobile Application - IOS and ANDROID',
    price_euro: 20000,
    features: ['Video advertising', 'High engagement', 'Myanmar market focus', 'iOS & Android reach']
  }
];

export default function Index() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price_euro', { ascending: true });

      if (error) {
        console.error('Error fetching packages:', error);
        // Use default packages on error
        setPackages(defaultPackages);
      } else {
        setPackages(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPackages:', error);
      setPackages(defaultPackages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <Hero />
      
      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              Why Choose Viber Ads Manager?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for Myanmar businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
                <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Track impressions, clicks, conversions, and ROI with detailed reporting
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
                <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Mobile Optimized</h3>
              <p className="text-muted-foreground">
                Reach users on both iOS and Android Viber applications
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow">
                <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Myanmar Focused</h3>
              <p className="text-muted-foreground">
                Specialized targeting for Myanmar market and local business needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <FeaturesSection />
      
      <section id="pricing">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
              <span className="text-primary-foreground font-bold text-2xl">V</span>
            </div>
            <p className="text-muted-foreground">Loading packages...</p>
          </div>
        ) : (
          <PricingSection packages={packages.length > 0 ? packages : defaultPackages} />
        )}
      </section>

      <ContactSection />

      <Footer />
    </div>
  );
}