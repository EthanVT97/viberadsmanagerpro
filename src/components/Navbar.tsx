import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Menu, X, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "See you again soon!",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-elegant hover-lift">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft hover:shadow-glow transition-elegant">
              <span className="text-primary-foreground font-bold text-xl">V</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-foreground">
                Viber Ads Manager
              </span>
              <div className="text-xs text-muted-foreground font-medium">
                Myanmar Business Solutions
              </div>
            </div>
            <span className="text-xl font-bold text-foreground sm:hidden">
              VAM
            </span>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <a 
              href="#pricing" 
              className="text-muted-foreground hover:text-primary transition-elegant cursor-pointer font-medium hover-lift"
              onClick={(e) => {
                e.preventDefault();
                const pricingSection = document.getElementById('pricing');
                pricingSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Packages
            </a>
            <a 
              href="#features" 
              className="text-muted-foreground hover:text-primary transition-elegant cursor-pointer font-medium hover-lift"
              onClick={(e) => {
                e.preventDefault();
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Features
            </a>
            <a 
              href="#contact" 
              className="text-muted-foreground hover:text-primary transition-elegant cursor-pointer font-medium hover-lift"
              onClick={(e) => {
                e.preventDefault();
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact
            </a>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-lift transition-elegant">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 glass-card shadow-strong border border-border/50" align="end">
                  <div className="flex items-center justify-start gap-3 p-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Myanmar Business User</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer hover:bg-primary/10 transition-elegant">
                    <BarChart3 className="mr-3 h-4 w-4 text-primary" />
                    <span className="font-medium">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-elegant">
                    <User className="mr-3 h-4 w-4 text-primary" />
                    <span className="font-medium">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-elegant">
                    <Settings className="mr-3 h-4 w-4 text-primary" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-destructive/10 text-destructive transition-elegant">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleSignIn} className="font-medium hover-lift transition-elegant">
                  Sign In
                </Button>
                <Button className="bg-gradient-primary text-primary-foreground border-0 font-semibold hover:shadow-glow hover-lift transition-elegant rounded-xl px-6 py-2 shadow-soft" onClick={handleSignIn}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/50 bg-background/95 backdrop-blur-sm">
              <a 
                href="#pricing" 
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  const pricingSection = document.getElementById('pricing');
                  pricingSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Packages
              </a>
              <a 
                href="#features" 
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </a>
              <a 
                href="#contact" 
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  const contactSection = document.getElementById('contact');
                  contactSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact
              </a>
              {user ? (
                <div className="pt-2 border-t border-border/50">
                  <div className="px-3 py-2 text-sm text-muted-foreground truncate">{user.email}</div>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/dashboard");
                    }} 
                    className="w-full justify-start"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <Button variant="ghost" onClick={handleSignIn} className="w-full">
                    Sign In
                  </Button>
                  <Button className="w-full bg-gradient-primary text-primary-foreground border-0" onClick={handleSignIn}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}