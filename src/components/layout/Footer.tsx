import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Footer = () => {
  const { user } = useAuth();
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">B</span>
              </div>
              <span className="font-display font-semibold text-xl">
                BloomPath
              </span>
            </div>
            <p className="text-background/70 max-w-sm leading-relaxed">
              Empowering women across India with flexible, location-based job
              opportunities that match their skills and schedules.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-background/70 hover:text-background transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-background/70 hover:text-background transition-colors">
                  Login / Sign Up
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup&role=business" className="text-background/70 hover:text-background transition-colors">
                  For Employers
                </Link>
              </li>
              {user && (
                <li>
                  <Link to="/community" className="text-background/70 hover:text-background transition-colors">
                    Community Hub
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-background/60 flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-accent" /> for women empowerment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
