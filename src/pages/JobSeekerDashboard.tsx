import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, MapPin, GraduationCap, Upload, CheckCircle, Clock, AlertCircle,
  Briefcase, IndianRupee, Star, Home, Zap, Clock3, Target, Plus, X,
  Phone, UserCheck, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { uploadApi, jobsApi, applicationsApi, microJobApi } from "@/lib/awsApi";
import { classifyUser } from "@/lib/mlDecisionLayer";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SUGGESTED_SKILLS = [
  "Tailoring", "Data Entry", "Tutoring", "Cooking", "Handicrafts",
  "Beauty Services", "Cleaning", "Child Care", "Elder Care", "Teaching",
  "Accounting", "Content Writing", "Social Media", "Embroidery", "Mehendi Art",
];

const WORK_PREFERENCES = [
  { id: "home_based", label: "Home Based", icon: Home },
  { id: "flexible", label: "Flexible Hours", icon: Clock3 },
  { id: "part_time", label: "Part Time", icon: Zap },
  { id: "task_based", label: "Task Based", icon: Target },
];

// Demo data for existing users (not shown to new signups)
const DEMO_EARNINGS = [
  { id: "e1", amount: 2300, task: "Blouse Stitching - 23 pieces", date: "2026-02-28", status: "paid" },
  { id: "e2", amount: 940, task: "Papad Rolling - 47 pieces", date: "2026-03-04", status: "paid" },
  { id: "e3", amount: 1800, task: "Embroidery Work - 12 pieces", date: "2026-03-06", status: "pending" },
];

const DEMO_JOBS = [
  {
    jobId: "dj1", title: "Blouse Stitching Bulk Order", organizationType: "shg",
    description: "Stitch cotton blouses from provided patterns. Sewing machine needed.", 
    requiredSkills: ["Tailoring", "Stitching"], locationType: "home", payPerUnit: 100,
    jobLabel: "Community Jobs", status: "open",
  },
  {
    jobId: "dj2", title: "Embroidery Work – Festive Collection",
    organizationType: "shg", description: "Traditional mirror work embroidery on sleeve pieces. Materials provided.",
    requiredSkills: ["Embroidery", "Handicrafts"], locationType: "home", payPerUnit: 170,
    jobLabel: "Community Jobs", status: "open",
  },
  {
    jobId: "dj3", title: "Data Entry – Product Catalog",
    organizationType: "ngo", description: "Enter product details from PDFs into spreadsheets. Good typing speed required.",
    requiredSkills: ["Data Entry", "Computer"], locationType: "remote", payPerUnit: 200,
    jobLabel: "NGO Job", status: "open",
  },
  {
    jobId: "dj4", title: "Online Tutoring – Primary Math",
    organizationType: "ngo", description: "Teach Math to Grade 3-5 students via video call. Minimum 2 sessions/week.",
    requiredSkills: ["Teaching", "Math"], locationType: "remote", payPerUnit: 350,
    jobLabel: "NGO Job", status: "open",
  },
  {
    jobId: "dj5", title: "Papad Rolling & Packaging",
    organizationType: "shg", description: "Roll and dry papad from provided dough. Clean kitchen required.",
    requiredSkills: ["Cooking", "Food Processing"], locationType: "home", payPerUnit: 40,
    jobLabel: "Community Jobs", status: "open",
  },
  {
    jobId: "dj6", title: "Content Writing – Social Media Posts",
    organizationType: "ngo", description: "Write 5–10 social media posts per week in Hindi/English for women's welfare NGO.",
    requiredSkills: ["Content Writing", "Social Media"], locationType: "remote", payPerUnit: 300,
    jobLabel: "NGO Job", status: "open",
  },
];

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("find-jobs");
  const [profileComplete, setProfileComplete] = useState(false); // also set from DB profile below
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
    education: "basic" as "basic" | "intermediate" | "advanced",
    skills: [] as string[],
    workPreferences: [] as string[],
    familyConstraints: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [mlResult, setMlResult] = useState<ReturnType<typeof classifyUser> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<any[]>(DEMO_JOBS);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  const isVerified = profile?.is_verified || false;
  // Profile is complete if we have a name saved in DB
  const isProfileComplete = !!(profile?.full_name && profile.full_name !== profile?.email && profile.full_name.length > 1);
  const isDemoUser = user && !user.sub?.startsWith("new-");

  useEffect(() => {
    fetchJobs();
    if (user) fetchMyTasks();
  }, [user]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await jobsApi.list({ status: "open" });
      const liveJobs = (data.jobs || []).map((j: any) => ({
        // Normalize DB fields → UI fields
        jobId: j.jobId,
        title: j.title,
        description: j.description || "",
        organizationType: j.organizationType || "shg",
        jobLabel: j.jobLabel || "Community Jobs",
        locationType: j.locationType || j.category || "home",
        requiredSkills: j.requiredSkills || [],
        // DB stores ratePerPiece/workerRate, UI expects payPerUnit
        payPerUnit: j.workerRate || j.ratePerPiece || j.payPerUnit || 0,
        status: j.status || "open",
      }));
      // Merge live jobs on top, avoid duplicates with demo jobs
      const liveIds = new Set(liveJobs.map((j: any) => j.jobId));
      const merged = [...liveJobs, ...DEMO_JOBS.filter(d => !liveIds.has(d.jobId))];
      setJobs(merged);
    } catch (err) {
      console.error("fetchJobs error:", err);
      // Fall back to demo jobs silently
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const data = await microJobApi.getWorkerTasks();
      setMyTasks(data.tasks || []);
    } catch (err) {
      console.error("fetchMyTasks error:", err);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) { navigate("/auth"); return; }
    setApplyingJobId(jobId);
    try {
      await applicationsApi.apply({ jobId, piecesRequested: 1 });
      toast({ title: "Applied!", description: "Your application has been submitted." });
      fetchMyTasks();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to apply.", variant: "destructive" });
    } finally {
      setApplyingJobId(null);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setNewSkill("");
  };

  const removeSkill = (s: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }));
  };

  const toggleWorkPref = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      workPreferences: prev.workPreferences.includes(pref)
        ? prev.workPreferences.filter(p => p !== pref)
        : [...prev.workPreferences, pref],
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.location) {
      toast({ title: "Required", description: "Name and location are required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const token = localStorage.getItem("bloompath_id_token");
      const res = await fetch(`${API_URL}/updateProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: formData.name,
          full_name: formData.name,
          age: parseInt(formData.age) || null,
          location: formData.location,
          education: formData.education,
          skills: formData.skills,
          workPreferences: formData.workPreferences,
          familyConstraints: formData.familyConstraints,
          role: "user",
          userType: "job_seeker",
          emergencyContact: formData.emergencyContactName
            ? { name: formData.emergencyContactName, phone: formData.emergencyContactPhone }
            : null,
        }),
      });
      if (res.ok) {
        setProfileComplete(true);
        setShowProfileForm(false);
        const mlRes = classifyUser({
          skills: formData.skills,
          education_level: formData.education,
          is_verified: false,
          has_location: !!formData.location,
          completed_trainings: 0,
          skill_score_boost: 0,
          family_constraints: formData.familyConstraints,
        });
        setMlResult(mlRes);
        toast({ title: "Profile Saved!", description: "Welcome to BloomPath. You can now browse jobs." });
      } else {
        // Still save locally for demo
        setProfileComplete(true);
        setShowProfileForm(false);
        toast({ title: "Profile Saved Locally!", description: "Connect your AWS backend to persist data." });
      }
    } catch {
      setProfileComplete(true);
      setShowProfileForm(false);
      toast({ title: "Profile Saved!", description: "Welcome to BloomPath." });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Welcome, {profile?.full_name || user?.email?.split("@")[0] || "User"} 👋
              </h1>
              <p className="text-muted-foreground">Job Seeker Dashboard</p>
            </div>
            {(!profileComplete && !isProfileComplete) && (
              <Button onClick={() => setShowProfileForm(true)} className="mt-4 md:mt-0 btn-primary-glow">
                <User className="w-4 h-4 mr-2" /> Complete Your Profile
              </Button>
            )}
          </div>

          {/* Verification Banner */}
          {!isVerified && (
            <div className="mb-6 p-4 rounded-xl border border-warning bg-warning/10 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-warning">Verification required to apply for jobs</div>
                <div className="text-sm text-muted-foreground">Upload your ID proof to apply for jobs. You can browse jobs freely.</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("/profile-edit")}>Upload ID</Button>
            </div>
          )}

          {/* ML Smart Routing Banner */}
          {mlResult && (
            <div className={`mb-6 p-4 rounded-xl border ${
              mlResult.classification === "needs-training" ? "border-primary bg-primary/5" :
              mlResult.classification === "shg-suitable" ? "border-accent bg-accent/5" :
              "border-success bg-success/5"
            }`}>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-semibold">{mlResult.recommended_action}</div>
                  {mlResult.classification === "needs-training" && mlResult.suggested_modules && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Recommended: {mlResult.suggested_modules.slice(0, 2).join(", ")}
                    </div>
                  )}
                </div>
                {mlResult.classification === "needs-training" && (
                  <Button size="sm" variant="outline" onClick={() => navigate("/ngo-portal")}>Start Training</Button>
                )}
              </div>
            </div>
          )}

          {/* Profile Form */}
          {showProfileForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Complete Your Profile</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowProfileForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input type="number" value={formData.age} onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} placeholder="Your age" />
                  </div>
                  <div>
                    <Label>Location *</Label>
                    <div className="flex gap-2">
                      <Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="City, State" />
                      <Button type="button" variant="outline" size="icon" onClick={() => {
                        navigator.geolocation?.getCurrentPosition(async pos => {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                          const d = await res.json();
                          setFormData(p => ({ ...p, location: d.address?.city || d.display_name || "" }));
                        });
                      }}>
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Education Level</Label>
                    <Select value={formData.education} onValueChange={v => setFormData(p => ({ ...p, education: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (up to 10th)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (12th / Diploma)</SelectItem>
                        <SelectItem value="advanced">Advanced (Graduate+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skills.map(s => (
                        <Badge key={s} variant="secondary" className="flex items-center gap-1">
                          {s} <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(s)} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add skill..." onKeyDown={e => e.key === "Enter" && addSkill(newSkill)} />
                      <Button type="button" variant="outline" size="icon" onClick={() => addSkill(newSkill)}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {SUGGESTED_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 8).map(s => (
                        <button key={s} onClick={() => addSkill(s)} className="px-2 py-1 text-xs rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors">+{s}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Work Preferences</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {WORK_PREFERENCES.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => toggleWorkPref(id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
                            formData.workPreferences.includes(id)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Icon className="w-4 h-4" /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="family"
                      checked={formData.familyConstraints}
                      onCheckedChange={v => setFormData(p => ({ ...p, familyConstraints: !!v }))}
                    />
                    <Label htmlFor="family" className="cursor-pointer">I have family care responsibilities</Label>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Emergency Contact Name</Label>
                  <Input value={formData.emergencyContactName} onChange={e => setFormData(p => ({ ...p, emergencyContactName: e.target.value }))} placeholder="Contact person name" />
                </div>
                <div>
                  <Label>Emergency Contact Phone</Label>
                  <Input value={formData.emergencyContactPhone} onChange={e => setFormData(p => ({ ...p, emergencyContactPhone: e.target.value }))} placeholder="Phone number" />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary-glow flex-1">
                  {isSaving ? "Saving..." : "Save Profile & Get Started"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/profile-edit")}>Upload ID Proof</Button>
              </div>
            </motion.div>
          )}

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="find-jobs">
                <Briefcase className="w-4 h-4 mr-2" /> Find Jobs
              </TabsTrigger>
              <TabsTrigger value="my-tasks">
                <Target className="w-4 h-4 mr-2" /> My Tasks
              </TabsTrigger>
              <TabsTrigger value="my-earnings">
                <IndianRupee className="w-4 h-4 mr-2" /> My Earnings
              </TabsTrigger>
            </TabsList>

            {/* Find Jobs Tab */}
            <TabsContent value="find-jobs">
              <div className="mb-4">
                <Input
                  placeholder="Search jobs by title, skills..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.jobId}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border p-6 hover:border-primary/50 transition-colors relative"
                  >
                    <Badge className="absolute top-4 right-4 text-xs" variant={job.organizationType === "ngo" ? "default" : "secondary"}>
                      {job.jobLabel}
                    </Badge>
                    <h3 className="font-semibold text-foreground mb-1 pr-24">{job.title}</h3>
                    <div className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.locationType}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(job.requiredSkills || []).map((s: string) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <IndianRupee className="w-4 h-4" /> {job.payPerUnit}/task
                      </div>
                      {isVerified ? (
                        <Button
                          size="sm"
                          className="btn-primary-glow"
                          disabled={applyingJobId === job.jobId}
                          onClick={() => handleApply(job.jobId)}
                        >
                          {applyingJobId === job.jobId ? "Applying..." : "Apply Now"}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => navigate("/profile-edit")} className="text-xs">
                          <Shield className="w-3 h-3 mr-1" /> Verify to Apply
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* My Tasks Tab */}
            <TabsContent value="my-tasks">
              {myTasks.length === 0 ? (
                <div className="text-center py-16">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
                  <p className="text-muted-foreground mb-4">Apply for jobs to start earning</p>
                  <Button onClick={() => setActiveTab("find-jobs")}>Browse Jobs</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTasks.map(task => (
                    <div key={task.id} className="bg-card rounded-xl border p-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{task.jobTitle}</h4>
                        <p className="text-sm text-muted-foreground">{task.pieces} pieces</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                          {task.status === "completed" ? "✓ Completed" : "In Progress"}
                        </Badge>
                        {task.earnedAmount > 0 && (
                          <span className="text-success font-semibold flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />{task.earnedAmount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Earnings Tab */}
            <TabsContent value="my-earnings">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Lifetime Earnings", value: "₹5,040", icon: IndianRupee, color: "text-primary" },
                  { label: "This Week", value: "₹940", icon: TrendingUp, color: "text-success" },
                  { label: "Completed Tasks", value: "2", icon: CheckCircle, color: "text-success" },
                  { label: "Pending Tasks", value: "1", icon: Clock, color: "text-warning" },
                ].map(stat => (
                  <div key={stat.label} className="bg-card rounded-xl border p-4">
                    <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {isDemoUser && (
                <div className="bg-card rounded-xl border">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Recent Earnings</h3>
                  </div>
                  <div className="divide-y">
                    {DEMO_EARNINGS.map(e => (
                      <div key={e.id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{e.task}</div>
                          <div className="text-sm text-muted-foreground">{new Date(e.date).toLocaleDateString("en-IN")}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />{e.amount.toLocaleString()}
                          </div>
                          <Badge variant={e.status === "paid" ? "default" : "secondary"} className="text-xs">
                            {e.status === "paid" ? "✓ Paid" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

// Helper icon component
const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default JobSeekerDashboard;