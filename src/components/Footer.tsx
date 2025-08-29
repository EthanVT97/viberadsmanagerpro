export default function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                Viber Ads Manager
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Professional advertising platform for Myanmar businesses on Viber's mobile applications.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Business Exclusive</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Display Reach</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Daily Essentials</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Video Pulse</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Myanmar Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground text-sm">Myanmar Business</li>
              <li className="text-muted-foreground text-sm">iOS & Android Platform</li>
              <li className="text-muted-foreground text-sm">Rakuten Viber Network</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Viber Ads Manager. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}