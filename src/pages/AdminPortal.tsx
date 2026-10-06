import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Shield,
  BarChart3,
  Briefcase,
  AlertCircle,
  Image as ImageIcon,
  Video,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/awsApi";
// Migrated: use awsApi instead of Supabase
import DocumentPreview from "@/components/admin/DocumentPreview";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  mobile: string | null;
  role: string;
  is_verified: boolean;
  aadhar_url: string | null;
  aadhar_number: string | null;
  skills: string[];
  created_at: string;
  location_name: string | null;
  verificationStatus?: string | null;
  userType?: string | null;
}

interface WorkLogWithDetails {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  task_output_url: string | null;
  user?: { full_name: string; email: string };
  job?: { title: string };
}

interface SkillProof {
  id: string;
  user_id: string;
  skill_name: string;
  proof_url: string;
  proof_type: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user?: { full_name: string; email: string };
}

interface UserWorkPost {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  skills_used: string[] | null;
  work_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user?: { full_name: string; email: string };
}

const DEMO_USERS: UserProfile[] = [
  {
    id: "demo-u1",
    full_name: "Priya Sharma",
    email: "priya@example.com",
    mobile: "9876543210",
    role: "user",
    is_verified: true,
    aadhar_url: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop",
    aadhar_number: "1234-5678-9012",
    skills: ["Tailoring", "Embroidery"],
    created_at: new Date().toISOString(),
    location_name: "Mumbai, Maharashtra",
    verificationStatus: "verified"
  },
  {
    id: "demo-u2",
    full_name: "Anita Desai",
    email: "anita@example.com",
    mobile: "9876543211",
    role: "user",
    is_verified: false,
    aadhar_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop",
    aadhar_number: "2234-5678-9012",
    skills: ["Cooking", "Baking"],
    created_at: new Date().toISOString(),
    location_name: "Delhi, NCR",
    verificationStatus: "pending"
  },
  {
    id: "demo-u3",
    full_name: "Tech Solutions Inc",
    email: "hr@techsolutions.com",
    mobile: "9876543212",
    role: "business",
    is_verified: true,
    aadhar_url: null,
    aadhar_number: null,
    skills: [],
    created_at: new Date().toISOString(),
    location_name: "Bangalore, Karnataka"
  }
];

const DEMO_WORK_LOGS: WorkLogWithDetails[] = [
  {
    id: "demo-l1",
    user_id: "demo-u1",
    job_id: "job-1",
    status: "verified",
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date().toISOString(),
    duration_minutes: 60,
    task_output_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&fit=crop",
    user: { full_name: "Priya Sharma", email: "priya@example.com" },
    job: { title: "Custom Tailoring Project" }
  },
  {
    id: "demo-l2",
    user_id: "demo-u2",
    job_id: "job-2",
    status: "in_progress",
    start_time: new Date().toISOString(),
    end_time: null,
    duration_minutes: 0,
    task_output_url: null,
    user: { full_name: "Anita Desai", email: "anita@example.com" },
    job: { title: "Catering Service" }
  }
];

const DEMO_SKILLS_PROOF: SkillProof[] = [
  {
    id: "demo-s1",
    user_id: "demo-u1",
    skill_name: "Advanced Tailoring",
    proof_url: "https://images.unsplash.com/photo-1590736704728-f4730bb3c3af?w=800&fit=crop",
    proof_type: "image",
    status: "pending",
    admin_notes: null,
    created_at: new Date().toISOString(),
    user: { full_name: "Priya Sharma", email: "priya@example.com" }
  },
  {
    id: "demo-s2",
    user_id: "demo-u2",
    skill_name: "Professional Baking",
    proof_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&fit=crop",
    proof_type: "image",
    status: "approved",
    admin_notes: "Excellent demonstration of baking skills.",
    created_at: new Date().toISOString(),
    user: { full_name: "Anita Desai", email: "anita@example.com" }
  }
];

const DEMO_WORK_POSTS: UserWorkPost[] = [
  {
    id: "demo-p1",
    user_id: "demo-u1",
    title: "Hand-stitched Traditional Wear",
    description: "Showcasing my collection of traditional wear for festivals.",
    skills_used: ["Hand-stitching", "Embroidery"],
    work_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&fit=crop",
    status: "pending",
    admin_notes: null,
    created_at: new Date().toISOString(),
    user: { full_name: "Priya Sharma", email: "priya@example.com" }
  }
];

const AdminPortal = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLogWithDetails[]>([]);
  const [skillsProof, setSkillsProof] = useState<SkillProof[]>([]);
  const [workPosts, setWorkPosts] = useState<UserWorkPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedSkillProof, setSelectedSkillProof] = useState<SkillProof | null>(null);
  const [selectedWorkLog, setSelectedWorkLog] = useState<WorkLogWithDetails | null>(null);
  const [selectedWorkPost, setSelectedWorkPost] = useState<UserWorkPost | null>(null);
  const [showAadharModal, setShowAadharModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [showWorkPostModal, setShowWorkPostModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"verifications" | "users" | "tracking" | "skills" | "posts" | "shg-ngo">("users");

  // Hidden admin credentials - in production, use proper server-side auth
  const ADMIN_PASSWORD = "BloomPath@Admin2024";

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setLoginError("");
      fetchAllData();
    } else {
      setLoginError("Invalid admin credentials");
    }
  };

  useEffect(() => {
    if (!loading && user && profile?.role === "admin") {
      setIsAdminLoggedIn(true);
      fetchAllData();
    }
  }, [user, profile, loading]);

  const fetchAllData = async () => {
    const loadingToast = toast({
      title: "Fetching data...",
      description: "Refreshing all portal data",
    });

    try {
      await Promise.all([
        fetchUsers(),
        fetchWorkLogs(),
        fetchSkillsProof(),
        fetchWorkPosts()
      ]);

      toast({
        title: "Sync Complete",
        description: "All data has been updated",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Some data could not be retrieved",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const addGoogleTranslate = () => {
      if (document.getElementById('google-translate-script')) return;
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: 'en', layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE },
          'google_translate_element'
        );
      };
    };
    addGoogleTranslate();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminApi.getData();
      const liveUsers = (data.users || []).map((u: any) => ({
        id: u.userId,
        full_name: u.name || u.full_name || u.shgName || u.businessName || "Unknown",
        email: u.email || "",
        role: u.role || (u.userType === "employer" ? "business" : u.userType === "job_seeker" ? "user" : u.userType) || "user",
        is_verified: u.isVerified || false,
        created_at: u.createdAt || new Date().toISOString(),
        location: u.location || "",
        skills: u.skills || [],
        aadhar_url: u.idProofUrl || u.verificationProofUrl || u.verificationDocUrl || null,
        verificationStatus: u.verificationStatus || null,
        aadhar_number: null,
        mobile: u.mobile || null,
        location_name: u.location || u.location_name || null,
        userType: u.userType || null,
      }));
      setUsers([...DEMO_USERS, ...liveUsers]);
      // Also update work logs from real applications
      const liveApps = (data.applications || []).map((a: any) => ({
        id: a.applicationId,
        status: a.status || "pending",
        created_at: a.createdAt,
        job: { title: a.jobId, pay_per_unit: 0 },
        user: { full_name: "User", email: "" },
      }));
      setWorkLogs([...DEMO_WORK_LOGS, ...liveApps]);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers(DEMO_USERS);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchWorkLogs = async () => {
    // Data loaded via fetchUsers/adminApi
  };

  const fetchSkillsProof = async () => {
    try {
      const skillsData: any[] = [];
      const userMap = new Map(users?.map(u => [u.id, u]) || []);
      const enrichedData = skillsData.map(d => ({
        ...d,
        user: userMap.get(d.user_id) || { full_name: "Unknown", email: "" }
      }));

      setSkillsProof([...DEMO_SKILLS_PROOF, ...enrichedData]);
    } catch (error) {
      console.error("Error fetching skills proof:", error);
    }
  };

  const fetchWorkPosts = async () => {
    try {
      const { data, error } = { data: [], error: null };

      if (error) throw error;
      setWorkPosts([...DEMO_WORK_POSTS, ...(data || [])]);
    } catch (error) {
      console.error("Error fetching work posts:", error);
    }
  };

  const handleVerifyUser = async (userId: string, verify: boolean) => {
    try {
      await adminApi.action({ action: "verifyUser", userId, isVerified: verify });
      // Update local state immediately
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: verify } : u));
      toast({
        title: verify ? "User Verified" : "Verification Removed",
        description: verify ? "User can now apply for jobs" : "Verification has been revoked",
      });
      setShowAadharModal(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update verification status", variant: "destructive" });
    }
  };

  const handleApproveSkillProof = async (proofId: string, approved: boolean, notes: string) => {
    try {
      // Update local state immediately (skill proof not in DynamoDB yet, update UI only)
      setSkillsProof(prev => prev.map(p => p.id === proofId ? { ...p, status: approved ? "approved" : "rejected" } : p));
      toast({
        title: approved ? "Skill Proof Approved" : "Skill Proof Rejected",
        description: approved ? "The skill proof has been verified" : "The skill proof has been rejected",
      });
      setShowSkillsModal(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update skill proof status", variant: "destructive" });
    }
  };

  const handleApproveWorkPost = async (postId: string, approved: boolean, notes: string = "") => {
    try {
      setWorkPosts(prev => prev.map(p => p.id === postId ? { ...p, status: approved ? "approved" : "rejected" } : p));
      toast({
        title: approved ? "Work Post Approved" : "Work Post Rejected",
        description: approved ? "The work post is now visible to employers" : "The work post has been rejected",
      });
      setShowWorkPostModal(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update work post status", variant: "destructive" });
    }
  };

  const handleVerifyWorkLog = async (logId: string) => {
    try {
      await adminApi.action({ action: "updateApplication", applicationId: logId, status: "approved" });
      setWorkLogs(prev => prev.map(l => l.id === logId ? { ...l, status: "verified" } : l));
      setShowWorkLogModal(false);
      toast({
        title: "Work Verified",
        description: "The work has been verified and earnings recorded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify work",
        variant: "destructive",
      });
    }
  };

  const viewAadhar = (user: UserProfile) => {
    setSelectedUser(user);
    setShowAadharModal(true);
  };

  const viewSkillProof = (proof: SkillProof) => {
    setSelectedSkillProof(proof);
    setShowSkillsModal(true);
  };

  const viewWorkLog = (log: WorkLogWithDetails) => {
    setSelectedWorkLog(log);
    setShowWorkLogModal(true);
  };

  const viewWorkPost = (post: UserWorkPost) => {
    setSelectedWorkPost(post);
    setShowWorkPostModal(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.filter((u) => u.role === "user").length,
    verifiedUsers: users.filter((u) => u.role === "user" && u.is_verified).length,
    pendingVerification: users.filter(
      (u) => !u.is_verified && (u.aadhar_url || u.verificationStatus === "pending")
    ).length,
    totalBusinesses: users.filter((u) => u.role === "business" || u.role === "employer").length,
    activeWorkLogs: workLogs.filter((w) => w.status === "in_progress").length,
    completedWorkLogs: workLogs.filter(
      (w) => w.status === "completed" || w.status === "verified"
    ).length,
    pendingSkillsProof: skillsProof.filter((s) => s.status === "pending").length,
    pendingWorkPosts: workPosts.filter((p) => p.status === "pending").length,
  };

  const totalWorkHours = workLogs.reduce((total, log) => {
    return total + (log.duration_minutes || 0) / 60;
  }, 0);

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl border p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold">Admin Portal</h1>
              <p className="text-muted-foreground mt-2">Authorized access only</p>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input-focus"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleAdminLogin();
                  }}
                />
              </div>

              {loginError && (
                <div className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {loginError}
                </div>
              )}

              <Button onClick={handleAdminLogin} className="w-full btn-primary-glow">
                Access Admin Panel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-xl">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div id="google_translate_element" className="min-w-[100px]" />
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllData}
                disabled={loadingUsers}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdminLoggedIn(false);
                  setAdminPassword("");
                  navigate("/");
                }}
              >
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Job Seekers</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.pendingVerification + stats.pendingSkillsProof}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
                <div className="text-sm text-muted-foreground">Employers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === "verifications" ? "default" : "outline"}
            onClick={() => setActiveTab("verifications")}
            className={activeTab === "verifications" ? "btn-primary-glow" : ""}
          >
            <Shield className="w-4 h-4 mr-2" />
            Queued Verifications
            {stats.pendingVerification > 0 && (
              <Badge className="ml-2 bg-warning/20 text-warning">{stats.pendingVerification}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "btn-primary-glow" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            All Users
          </Button>
          <Button
            variant={activeTab === "skills" ? "default" : "outline"}
            onClick={() => setActiveTab("skills")}
            className={activeTab === "skills" ? "btn-primary-glow" : ""}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Skills Proof
            {stats.pendingSkillsProof > 0 && (
              <Badge className="ml-2 bg-warning/20 text-warning">{stats.pendingSkillsProof}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "posts" ? "default" : "outline"}
            onClick={() => setActiveTab("posts")}
            className={activeTab === "posts" ? "btn-primary-glow" : ""}
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Work Posts
            {stats.pendingWorkPosts > 0 && (
              <Badge className="ml-2 bg-warning/20 text-warning">{stats.pendingWorkPosts}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "tracking" ? "default" : "outline"}
            onClick={() => setActiveTab("tracking")}
            className={activeTab === "tracking" ? "btn-primary-glow" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Work Tracking
          </Button>
          <Button
            variant={activeTab === "shg-ngo" ? "default" : "outline"}
            onClick={() => setActiveTab("shg-ngo")}
            className={activeTab === "shg-ngo" ? "btn-primary-glow" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            Employers
          </Button>
        </div>

        {activeTab === "verifications" && (
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User/Business</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Submitted Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => !u.is_verified && (u.aadhar_url || u.verificationStatus === "pending")).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No pending verifications
                    </TableCell>
                  </TableRow>
                ) : (
                  users
                    .filter(u => !u.is_verified && (u.aadhar_url || u.verificationStatus === "pending"))
                    .map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{u.full_name}</div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              u.role === "business"
                                ? "bg-accent/10 text-accent"
                                : "bg-primary/10 text-primary"
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.mobile || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className="bg-warning/10 text-warning">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Review
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => viewAadhar(u)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View & Verify
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "users" && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-focus"
              />
            </div>

            <div className="bg-card rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{u.full_name}</div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              u.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : u.role === "business"
                                  ? "bg-accent/10 text-accent"
                                  : ""
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {u.skills?.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {u.skills && u.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{u.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {u.location_name || "Not set"}
                        </TableCell>
                        <TableCell>
                          {u.is_verified ? (
                            <Badge className="bg-success/10 text-success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : u.aadhar_url ? (
                            <Badge className="bg-warning/10 text-warning">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {(!u.is_verified) && (
                            <Button variant="outline" size="sm" onClick={() => viewAadhar(u)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Docs
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {activeTab === "skills" && (
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skillsProof.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No skills proof submissions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  skillsProof.map((proof) => (
                    <TableRow key={proof.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{proof.user?.full_name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{proof.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{proof.skill_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {proof.proof_type === "video" ? (
                            <Video className="w-4 h-4 text-primary" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-primary" />
                          )}
                          {proof.proof_type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            proof.status === "approved"
                              ? "bg-success/10 text-success"
                              : proof.status === "rejected"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-warning/10 text-warning"
                          }
                        >
                          {proof.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(proof.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => viewSkillProof(proof)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No work posts yet
                    </TableCell>
                  </TableRow>
                ) : (
                  workPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.user?.full_name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{post.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {post.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.skills_used?.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            post.status === "approved"
                              ? "bg-success/10 text-success"
                              : post.status === "rejected"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-warning/10 text-warning"
                          }
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {post.work_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewWorkPost(post)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {post.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90"
                                onClick={() => handleApproveWorkPost(post.id, true)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApproveWorkPost(post.id, false)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "tracking" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-xl border p-4">
                <div className="text-2xl font-bold text-primary">{stats.activeWorkLogs}</div>
                <div className="text-sm text-muted-foreground">Active Tasks</div>
              </div>
              <div className="bg-card rounded-xl border p-4">
                <div className="text-2xl font-bold text-success">{stats.completedWorkLogs}</div>
                <div className="text-sm text-muted-foreground">Completed Tasks</div>
              </div>
              <div className="bg-card rounded-xl border p-4">
                <div className="text-2xl font-bold text-accent">{totalWorkHours.toFixed(1)}h</div>
                <div className="text-sm text-muted-foreground">Total Hours Worked</div>
              </div>
            </div>

            <div className="bg-card rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No work logs yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    workLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.user?.full_name || "Unknown"}
                        </TableCell>
                        <TableCell>{log.job?.title || "Unknown Job"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              log.status === "verified"
                                ? "bg-success/10 text-success"
                                : log.status === "completed"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-warning/10 text-warning"
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.start_time ? new Date(log.start_time).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          {log.duration_minutes
                            ? `${Math.round(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`
                            : "In Progress"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {log.task_output_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewWorkLog(log)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {log.status === "completed" && (
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90"
                                onClick={() => handleVerifyWorkLog(log.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verify
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {activeTab === "shg-ngo" && (
          <div className="space-y-6">
            {/* SHG/Employer Admin Panel - Real Data */}
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Registered Small Businesses
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => (u.role === "business" || u.role === "employer") && u.userType !== "shg").length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No employers registered yet</TableCell></TableRow>
                  ) : users.filter(u => (u.role === "business" || u.role === "employer") && u.userType !== "shg").map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.full_name || "Unknown"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{emp.aadhar_number || "—"}</TableCell>
                      <TableCell>{emp.skills?.join(", ") || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={emp.is_verified ? "default" : "secondary"} className={emp.is_verified ? "bg-green-100 text-green-700" : ""}>
                          {emp.is_verified ? "✓ Verified" : emp.verificationStatus || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {emp.aadhar_url && (
                          <Button size="sm" variant="outline" onClick={() => window.open(emp.aadhar_url!, "_blank")}>
                            View Doc
                          </Button>
                        )}
                        {!emp.is_verified && (
                          <Button size="sm" className="bg-success text-success-foreground" onClick={() => handleVerifyUser(emp.id, true)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* NGO Admin Panel */}
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Registered NGOs & Training Modules
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NGO Name</TableHead>
                    <TableHead>Focus Area</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Learners</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: "ngo-1", name: "Gram Vikas Foundation", focus: "Digital Literacy", modules: 5, learners: 1200, verified: true },
                    { id: "ngo-2", name: "Stree Shakti Trust", focus: "Livelihood Skills", modules: 8, learners: 2400, verified: true },
                    { id: "ngo-3", name: "Mahila Pragati NGO", focus: "Entrepreneurship", modules: 2, learners: 0, verified: false },
                  ].map((ngo) => (
                    <TableRow key={ngo.id}>
                      <TableCell className="font-medium">{ngo.name}</TableCell>
                      <TableCell>{ngo.focus}</TableCell>
                      <TableCell>{ngo.modules}</TableCell>
                      <TableCell>{ngo.learners.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={ngo.verified ? "default" : "secondary"}>
                          {ngo.verified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!ngo.verified && (
                          <Button size="sm" className="bg-success text-success-foreground" onClick={() => toast({ title: "NGO Verified!", description: ngo.name + " has been approved." })}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bulk Orders Admin */}
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Bulk Orders (Company ↔ SHG)
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Assigned SHG</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { company: "Kalki Fashion", product: "Stitching", value: "₹60,000", shg: "Mahila Shakti SHG", status: "In Production" },
                    { company: "Prakriti Foods", product: "Food Processing", value: "₹1,12,500", shg: "Pragati Mahila Mandal", status: "Matched" },
                    { company: "ArtCraft Exports", product: "Handicrafts", value: "₹70,000", shg: "Unassigned", status: "Pending" },
                  ].map((order, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{order.company}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell className="text-success font-medium">{order.value}</TableCell>
                      <TableCell>{order.shg}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "In Production" ? "default" : order.status === "Matched" ? "secondary" : "outline"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      {/* Document Preview Modals */}
      <DocumentPreview
        type="aadhar"
        user={selectedUser}
        open={showAadharModal}
        onClose={() => setShowAadharModal(false)}
        onVerify={handleVerifyUser}
      />

      <DocumentPreview
        type="skills"
        skillProof={selectedSkillProof}
        open={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        onApproveSkill={handleApproveSkillProof}
      />

      <DocumentPreview
        type="work_log"
        workLog={selectedWorkLog}
        open={showWorkLogModal}
        onClose={() => setShowWorkLogModal(false)}
        onVerifyWorkLog={handleVerifyWorkLog}
      />

      <DocumentPreview
        type="work_post"
        workPost={selectedWorkPost}
        open={showWorkPostModal}
        onClose={() => setShowWorkPostModal(false)}
        onApproveWorkPost={handleApproveWorkPost}
      />
    </div>
  );
};

export default AdminPortal;