import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { cognitoAuth, CognitoUser } from "@/lib/cognitoAuth";
import { profileApi } from "@/lib/awsApi";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: "user" | "business" | "ngo" | "shg" | "admin";
  skills: string[];
  is_verified: boolean;
}

interface AuthContextType {
  user: CognitoUser | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
    metadata?: { full_name?: string; role?: string }
  ) => Promise<{ error: Error | null; requiresConfirmation?: boolean }>;
  confirmSignUp: (email: string, code: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbProfile, setDbProfile] = useState<Profile | null>(null);

  // profile = DB data merged with Cognito claims (DB takes priority)
  const profile: Profile | null = user
    ? {
        id: user.sub,
        full_name: dbProfile?.full_name || user.name || user.email,
        email: user.email,
        role: (dbProfile?.role as Profile["role"]) || (user.role as Profile["role"]) || "user",
        skills: dbProfile?.skills || [],
        is_verified: dbProfile?.is_verified || false,
      }
    : null;

  const fetchDbProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      console.log("DB profile raw:", data.profile);
      if (data.profile) {
        const p = data.profile;
        setDbProfile({
          id: p.userId,
          full_name: p.full_name || p.name || "",
          email: p.email || "",
          role: p.role || (
            p.userType === "job_seeker" ? "user" :
            p.userType === "employer" ? "business" :
            p.userType === "business" ? "business" :
            p.userType
          ) || "user",
          skills: p.skills || [],
          is_verified: p.isVerified || p.is_verified || p.verificationStatus === "verified" || false,
        });
      }
    } catch (err) {
      console.log("fetchDbProfile error (no profile saved yet):", err);
    }
  };

  useEffect(() => {
    const currentUser = cognitoAuth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    if (currentUser) fetchDbProfile();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; role?: string }
  ) => {
    try {
      await cognitoAuth.signUp(email, password, {
        name: metadata?.full_name,
        role: metadata?.role,
      });
      return { error: null, requiresConfirmation: true };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    try {
      await cognitoAuth.confirmSignUp(email, code);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: cognitoUser } = await cognitoAuth.signIn(email, password);
      setUser(cognitoUser);
      // Fetch real profile from DB after login
      setTimeout(() => fetchDbProfile(), 500);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = () => {
    cognitoAuth.signOut();
    setUser(null);
    setDbProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        signUp,
        confirmSignUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};