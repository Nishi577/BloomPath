import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Briefcase, User, LogIn, LogOut, Building2, IndianRupee, MessageSquare, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const role = profile?.role || user?.role || null;

  const navLinks = [
    ...(role === "user" ? [
      { path: "/jobs", label: "Find Jobs", icon: Briefcase },
      { path: "/skills", label: "Skills", icon: User },
      { path: "/shg-portal", label: "SHG Jobs", icon: Users },
      { path: "/ngo-portal", label: "Training", icon: BookOpen },
    ] : []),
    ...(user ? [{ path: "/community", label: "Community", icon: MessageSquare }] : []),
    { path: "/counsellor", label: "Counsellor", icon: User },
    ...(user && role !== "business" ? [{ path: "/profile-edit", label: "My Profile", icon: User }] : []),
    ...(user && role === "business" ? [{ path: "/employer-dashboard", label: "My Profile", icon: User }] : []),
    ...(user && role === "user" ? [{ path: "/my-work", label: "My Work", icon: Briefcase }] : []),
    ...(user && role === "user" ? [{ path: "/earnings", label: "Earnings", icon: IndianRupee }] : []),
    ...(role === "business" ? [
      { path: "/employer", label: "Post Jobs", icon: Building2 },
      { path: "/bulk-orders", label: "Bulk Orders", icon: Building2 },
    ] : []),
    ...(role === "admin" ? [{ path: "/admin-portal", label: "Admin", icon: Building2 }] : []),
    ...(!user ? [
      { path: "/shg-portal", label: "SHG Jobs", icon: Users },
      { path: "/ngo-portal", label: "Free Training", icon: BookOpen },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">B</span>
            </div>
            <span className="font-display font-semibold text-xl text-foreground">
              BloomPath
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link flex items-center gap-2 text-sm ${isActive(link.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {profile?.full_name || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="btn-primary-glow flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(link.path)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-border">
                {user ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-muted text-foreground"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
                  >
                    <LogIn className="w-5 h-5" />
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;