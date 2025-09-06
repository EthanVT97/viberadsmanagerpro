export default function Footer() {
  return (
    <footer className="glass-card border-t border-border/30 py-12 sm:py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/3 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-glow/5 rounded-full blur-3xl opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Enhanced Company Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-primary-foreground font-bold text-xl">V</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-foreground block">
                  Viber Ads Manager
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Myanmar Business Solutions
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Professional advertising platform for Myanmar businesses on Viber's mobile applications. Grow your reach and engagement effectively.
            </p>
            
            {/* Social/Contact Icons */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center hover-glow hover-scale transition-elegant cursor-pointer shadow-soft">
                <span className="text-primary-foreground text-xs font-bold">V</span>
              </div>
              <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover-lift transition-elegant cursor-pointer">
                <span className="text-primary text-xs">📧</span>
              </div>
              <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover-lift transition-elegant cursor-pointer">
                <span className="text-primary text-xs">📞</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg">Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">Business Exclusive</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">Display Reach</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">Daily Essentials</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">Video Pulse</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">Myanmar Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg">Contact</h3>
            <div className="space-y-4">
              <div className="glass-card p-4 rounded-xl hover-lift transition-elegant">
                <p className="text-sm font-medium text-foreground">Myanmar Business</p>
                <p className="text-xs text-muted-foreground">iOS & Android Platform</p>
              </div>
              <div className="glass-card p-4 rounded-xl hover-lift transition-elegant">
                <p className="text-sm font-medium text-foreground">Rakuten Viber Network</p>
                <p className="text-xs text-muted-foreground">Professional Advertising</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 sm:mt-16 pt-8 sm:pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-sm">
              © 2024 Viber Ads Manager. All rights reserved. | Made for Myanmar Businesses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-elegant text-sm hover-lift">
                Myanmar Legal
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}