/**
 * ProfileRouter — Universal /profile route
 * Detects user type from Cognito claims or localStorage and redirects to the correct dashboard.
 * If no user type is set, shows a type-selection screen.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Building2, BookOpen, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type UserType = "job_seeker" | "employer" | "ngo" | "admin";

const USER_TYPE_KEY = "bloompath_user_type";

const USER_TYPES: {
  type: UserType;
  label: string;
  description: string;
  icon: React.ElementType;
  route: string;
  color: string;
}[] = [
  {
    type: "job_seeker",
    label: "Job Seeker",
    description: "Find home-based jobs, SHG microjobs, and earn from your skills",
    icon: User,
    route: "/job-seeker-dashboard",
    color: "text-primary border-primary",
  },
  {
    type: "employer",
    label: "Employer / SHG",
    description: "Post jobs, manage workers, track community tasks and payments",
    icon: Building2,
    route: "/employer-dashboard",
    color: "text-accent border-accent",
  },
  {
    type: "ngo",
    label: "NGO",
    description: "Upload training modules, assign counsellors, track learner progress",
    icon: BookOpen,
    route: "/ngo-dashboard",
    color: "text-success border-success",
  },
  {
    type: "admin",
    label: "Admin",
    description: "Manage platform, verify users and NGOs, view all analytics",
    icon: Shield,
    route: "/admin-portal",
    color: "text-warning border-warning",
  },
];

const ProfileRouter = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [selecting, setSelecting] = useState(false);
  const [routing, setRouting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    // Check Cognito role first
    const cognitoRole = user.role;
    if (cognitoRole) {
      const mapping: Record<string, UserType> = {
        admin: "admin",
        business: "employer",
        ngo: "ngo",
        shg: "employer",
        user: "job_seeker",
      };
      const userType = mapping[cognitoRole];
      if (userType) {
        routeToType(userType);
        return;
      }
    }

    // Check profile role
    if (profile?.role) {
      const mapping: Record<string, UserType> = {
        admin: "admin",
        business: "employer",
        ngo: "ngo",
        shg: "employer",
        user: "job_seeker",
      };
      const userType = mapping[profile.role];
      if (userType) {
        routeToType(userType);
        return;
      }
    }

    // Check localStorage for previously selected type
    const savedType = localStorage.getItem(USER_TYPE_KEY) as UserType | null;
    if (savedType) {
      routeToType(savedType);
      return;
    }

    // No type found – show selection screen
    setSelecting(true);
  }, [user, profile, loading]);

  const routeToType = (type: UserType) => {
    const entry = USER_TYPES.find(t => t.type === type);
    if (entry) {
      localStorage.setItem(USER_TYPE_KEY, type);
      setRouting(true);
      navigate(entry.route, { replace: true });
    }
  };

  const handleSelectType = (type: UserType) => {
    localStorage.setItem(USER_TYPE_KEY, type);
    routeToType(type);
  };

  if (loading || routing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to BloomPath</h1>
          <p className="text-muted-foreground">
            How would you like to use BloomPath? Choose your role to get started.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {USER_TYPES.map((ut, i) => (
            <motion.button
              key={ut.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleSelectType(ut.type)}
              className={`bg-card border-2 border-border hover:border-primary/60 rounded-2xl p-6 text-left transition-all hover:shadow-lg group`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-muted group-hover:bg-primary/10 transition-colors`}>
                <ut.icon className={`w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors`} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">{ut.label}</h2>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground">{ut.description}</p>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          You can change your role later from the settings menu.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileRouter;