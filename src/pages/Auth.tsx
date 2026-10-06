import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft, Building2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, confirmSignUp, loading } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "signup" | "confirm">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [role, setRole] = useState<"user" | "business" | "ngo" | "shg">(
    (searchParams.get("role") as any) || "user"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmCode: "",
  });

  useEffect(() => {
    if (user && !loading) {
      navigate("/profile");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "confirm") {
        const { error } = await confirmSignUp(pendingEmail, formData.confirmCode);
        if (error) {
          toast({ title: "Confirmation Failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Email Confirmed!", description: "Please sign in." });
          setMode("login");
        }
      } else if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!" });
          navigate("/profile");
        }
      } else {
        const { error, requiresConfirmation } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          role,
        });
        if (error) {
          toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
        } else if (requiresConfirmation) {
          setPendingEmail(formData.email);
          setMode("confirm");
          toast({ title: "Check your email!", description: "Enter the confirmation code we sent you." });
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-8">
            <span className="text-white font-display font-bold text-4xl">B</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            {mode === "login" ? "Welcome Back!" : mode === "confirm" ? "Almost Done!" : "Join BloomPath"}
          </h1>
          <p className="text-white/80 text-lg">Empowering women through livelihood opportunities.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            {mode === "login" ? "Sign In" : mode === "confirm" ? "Confirm Email" : "Create Account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {mode === "login"
              ? "Enter your credentials to access your account"
              : mode === "confirm"
              ? `Enter the code sent to ${pendingEmail}`
              : "Fill in your details to get started"}
          </p>

          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(["user", "business", "ngo", "shg"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-xl border-2 transition-all text-sm ${
                    role === r ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium capitalize">{r === "user" ? "Job Seeker" : r === "business" ? "Employer" : r.toUpperCase()}</div>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "confirm" ? (
              <div>
                <Label>Confirmation Code</Label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="6-digit code"
                    value={formData.confirmCode}
                    onChange={(e) => setFormData({ ...formData, confirmCode: e.target.value })}
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                {mode === "signup" && (
                  <div>
                    <Label>Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      className="pl-10"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      className="pl-10"
                      placeholder="Min 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full btn-primary-glow" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : mode === "login" ? "Sign In" : mode === "confirm" ? "Confirm" : "Create Account"}
            </Button>
          </form>

          {mode !== "confirm" && (
            <p className="text-center text-muted-foreground mt-6">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
                    Sign In
                  </button>
                </>
              )}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
