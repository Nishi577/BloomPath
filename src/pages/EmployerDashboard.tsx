import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, Users, Briefcase, BarChart3, Plus, CheckCircle,
  Clock, IndianRupee, Eye, AlertCircle, Star, Package,
  TrendingUp, UserCheck, Settings, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { microJobApi, jobsApi, uploadApi } from "@/lib/awsApi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SHG_WORK_TYPES = ["Stitching", "Packaging", "Craft", "Food Processing", "Embroidery", "Candle Making"];
const BIZ_WORK_TYPES = ["Manufacturing", "Packaging", "Assembly", "Data Entry", "Service", "Retail"];

// Demo employer data
const DEMO_WORKERS = [
  { id: "w1", name: "Priya Sharma", task: "Blouse Stitching", pieces: 23, status: "completed", amount: 2300 },
  { id: "w2", name: "Radha Patil", task: "Embroidery Work", pieces: 12, status: "in_progress", amount: 0 },
  { id: "w3", name: "Sunita Devi", task: "Papad Rolling", pieces: 47, status: "completed", amount: 1880 },
];

const DEMO_WEEKLY = [
  { week: "Feb W3", workers: 5, pieces: 320, paid: 12800 },
  { week: "Feb W4", workers: 8, pieces: 480, paid: 19200 },
  { week: "Mar W1", workers: 6, pieces: 390, paid: 15600 },
  { week: "Mar W2", workers: 9, pieces: 520, paid: 20800 },
];

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"loading" | "choose_type" | "shg_form" | "biz_form" | "dashboard">("loading");
  const [employerType, setEmployerType] = useState<"shg" | "small_business" | null>(null);
  const [activeTab, setActiveTab] = useState("post-jobs");
  const [isSaving, setIsSaving] = useState(false);

  // SHG Form
  const [shgForm, setShgForm] = useState({
    shgName: "", registrationId: "", leaderName: "", leaderPhone: "",
    workType: [] as string[], description: "",
  });

  // Business Form
  const [bizForm, setBizForm] = useState({
    businessName: "", gstOrBusinessId: "", workType: [] as string[], description: "",
  });

  // Post job form
  const [jobForm, setJobForm] = useState({
    title: "", description: "", category: "", pieceRate: "", totalPieces: "", deadline: "",
  });

  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const verificationFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const userRole = user.role || profile?.role;
    const isShg = userRole === "shg";
    const API_URL = import.meta.env.VITE_API_URL || "";
    const token = localStorage.getItem("bloompath_id_token");
    fetch(`${API_URL}/getProfile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const p = data.profile || data;
        if (p && (p.shgName || p.businessName)) {
          const empType = p.employerType || (p.shgName ? "shg" : "small_business");
          localStorage.setItem("bloompath_employer_type", empType);
          setEmployerType(empType as "shg" | "small_business");
          setStep("dashboard");
        } else if (isShg) {
          setEmployerType("shg");
          setStep("shg_form");
        } else {
          setEmployerType("small_business");
          setStep("biz_form");
        }
      })
      .catch(() => {
        if (isShg) { setEmployerType("shg"); setStep("shg_form"); }
        else { setEmployerType("small_business"); setStep("biz_form"); }
      });
  }, [user]);

  useEffect(() => {
    if (step === "dashboard") fetchPostedJobs();
  }, [step]);

  const fetchPostedJobs = async () => {
    try {
      const data = await jobsApi.list({ status: "open" });
      const myJobs = (data.jobs || [])
        .filter((j: any) => j.organizationId === user?.sub)
        .map((j: any) => ({
          id: j.jobId,
          title: j.title,
          status: j.status || "open",
          rate: j.workerRate || j.ratePerPiece || j.payPerUnit || 0,
          applicants: j.applicantsCount || 0,
          piecesAssigned: j.piecesAssigned || 0,
          total: j.totalPiecesAvailable || 100,
          createdAt: j.createdAt,
        }));
      setPostedJobs(myJobs);
    } catch (err) {
      console.error("fetchPostedJobs error:", err);
    }
  };

  const [verificationDocUrl, setVerificationDocUrl] = useState<string | null>(null);

  const handleVerificationUpload = async (file: File) => {
    setIsUploadingDoc(true);
    try {
      const result = await uploadApi.getPresignedUrl({
        fileType: file.type,
        uploadType: "ngo_verification",
        fileName: file.name,
      });
      await uploadApi.uploadFile(result.uploadUrl, file);
      setVerificationFile(file);
      setVerificationDocUrl(result.publicUrl);
      toast({ title: "Document Uploaded!", description: "Verification document saved." });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSaveEmployer = async () => {
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const token = localStorage.getItem("bloompath_id_token");
      const payload = employerType === "shg"
        ? {
            employerType: "shg",
            shgName: shgForm.shgName,
            registrationId: shgForm.registrationId,
            leaderDetails: { name: shgForm.leaderName, phone: shgForm.leaderPhone },
            workType: shgForm.workType,
            verificationDocUrl: verificationDocUrl || null,
          }
        : {
            employerType: "small_business",
            businessName: bizForm.businessName,
            gstOrBusinessId: bizForm.gstOrBusinessId,
            workType: bizForm.workType,
            verificationProofUrl: verificationDocUrl || null,
          };

      await fetch(`${API_URL}/createEmployerProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });

      localStorage.setItem("bloompath_employer_type", employerType || "shg");
      setStep("dashboard");
      toast({ title: "Profile Created!", description: "Your employer profile is under review." });
    } catch {
      localStorage.setItem("bloompath_employer_type", employerType || "shg");
      setStep("dashboard");
      toast({ title: "Profile Saved!", description: "Welcome to BloomPath Employer Portal." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.pieceRate) {
      toast({ title: "Required", description: "Job title and rate are required.", variant: "destructive" });
      return;
    }
    setIsPosting(true);
    const token = localStorage.getItem("bloompath_id_token");
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log("=== POST JOB DEBUG ===");
    console.log("API URL:", apiUrl);
    console.log("Token exists:", !!token);
    console.log("Token preview:", token?.substring(0, 30));
    try {
      const payload = {
        title: jobForm.title,
        description: jobForm.description,
        category: jobForm.category || "General",
        ratePerPiece: parseFloat(jobForm.pieceRate),
        totalPiecesAvailable: parseInt(jobForm.totalPieces) || 100,
        deadline: jobForm.deadline || undefined,
        requiredSkills: [],
      };
      console.log("Payload:", payload);
      const result = await microJobApi.create(payload);
      console.log("Success:", result);
      toast({ title: "Job Posted!", description: `"${jobForm.title}" is now live on BloomPath.` });
      setJobForm({ title: "", description: "", category: "", pieceRate: "", totalPieces: "", deadline: "" });
      fetchPostedJobs();
    } catch (err: any) {
      console.error("Post job FAILED:", err);
      console.error("Error message:", err.message);
      toast({ title: "Error posting job", description: err.message || "Failed to post job.", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  const toggleWorkType = (type: string, isShg: boolean) => {
    if (isShg) {
      setShgForm(p => ({
        ...p,
        workType: p.workType.includes(type) ? p.workType.filter(x => x !== type) : [...p.workType, type],
      }));
    } else {
      setBizForm(p => ({
        ...p,
        workType: p.workType.includes(type) ? p.workType.filter(x => x !== type) : [...p.workType, type],
      }));
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // ── Step 1: Choose Type ──────────────────────────────────────────────────
  if (step === "choose_type") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <Building2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Employer Registration</h1>
            <p className="text-muted-foreground">How do you want to post work?</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.button
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              onClick={() => { setEmployerType("shg"); setStep("shg_form"); }}
              className="bg-card border-2 border-border hover:border-primary rounded-2xl p-8 text-left transition-all hover:shadow-lg"
            >
              <Users className="w-10 h-10 text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">SHG (Self Help Group)</h2>
              <p className="text-muted-foreground text-sm">
                Post piece-rate community jobs in stitching, packaging, craft, and food processing. 
                Manage distributed work across your women's group.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Stitching", "Packaging", "Craft"].map(t => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              onClick={() => { setEmployerType("small_business"); setStep("biz_form"); }}
              className="bg-card border-2 border-border hover:border-primary rounded-2xl p-8 text-left transition-all hover:shadow-lg"
            >
              <Building2 className="w-10 h-10 text-accent mb-4" />
              <h2 className="text-xl font-bold mb-2">Small Business</h2>
              <p className="text-muted-foreground text-sm">
                Post regular jobs or task-based work for your business. 
                Hire verified women workers for various roles.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Manufacturing", "Assembly", "Data Entry"].map(t => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </motion.button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Step 2: SHG Form ────────────────────────────────────────────────────
  if (step === "shg_form") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <Button variant="ghost" size="icon" onClick={() => setStep("choose_type")}>←</Button>
              <div>
                <h1 className="text-2xl font-bold">SHG Registration</h1>
                <p className="text-muted-foreground text-sm">Register your Self Help Group</p>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>SHG Name *</Label>
                  <Input value={shgForm.shgName} onChange={e => setShgForm(p => ({ ...p, shgName: e.target.value }))} placeholder="Mahila Shakti SHG" />
                </div>
                <div>
                  <Label>Registration ID *</Label>
                  <Input value={shgForm.registrationId} onChange={e => setShgForm(p => ({ ...p, registrationId: e.target.value }))} placeholder="SHG-MH-2021-001" />
                </div>
                <div>
                  <Label>Leader Name</Label>
                  <Input value={shgForm.leaderName} onChange={e => setShgForm(p => ({ ...p, leaderName: e.target.value }))} placeholder="Leader full name" />
                </div>
                <div className="col-span-2">
                  <Label>Leader Phone</Label>
                  <Input value={shgForm.leaderPhone} onChange={e => setShgForm(p => ({ ...p, leaderPhone: e.target.value }))} placeholder="10-digit mobile" />
                </div>
              </div>

              <div>
                <Label>Type of Work</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SHG_WORK_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleWorkType(t, true)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        shgForm.workType.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Upload Verification Document</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">Registration certificate, bank passbook</p>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    ref={verificationFileRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVerificationUpload(file);
                    }}
                  />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => verificationFileRef.current?.click()}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isUploadingDoc ? "Uploading..." : verificationFile ? `✓ ${verificationFile.name}` : "Choose File"}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSaveEmployer}
                disabled={isSaving || !shgForm.shgName || !shgForm.registrationId}
                className="w-full btn-primary-glow"
              >
                {isSaving ? "Registering..." : "Register SHG"}
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Step 3: Small Business Form ─────────────────────────────────────────
  if (step === "biz_form") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <Button variant="ghost" size="icon" onClick={() => setStep("choose_type")}>←</Button>
              <div>
                <h1 className="text-2xl font-bold">Business Registration</h1>
                <p className="text-muted-foreground text-sm">Register your Small Business</p>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <div>
                <Label>Business Name *</Label>
                <Input value={bizForm.businessName} onChange={e => setBizForm(p => ({ ...p, businessName: e.target.value }))} placeholder="Your business name" />
              </div>
              <div>
                <Label>GST Number or Business ID</Label>
                <Input value={bizForm.gstOrBusinessId} onChange={e => setBizForm(p => ({ ...p, gstOrBusinessId: e.target.value }))} placeholder="GST / MSME / Shop Reg. No." />
              </div>

              <div>
                <Label>Type of Work</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {BIZ_WORK_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleWorkType(t, false)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        bizForm.workType.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Upload Verification Proof</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">GST certificate, business registration, shop license</p>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    ref={verificationFileRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVerificationUpload(file);
                    }}
                  />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => verificationFileRef.current?.click()}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isUploadingDoc ? "Uploading..." : verificationFile ? `✓ ${verificationFile.name}` : "Choose File"}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSaveEmployer}
                disabled={isSaving || !bizForm.businessName}
                className="w-full btn-primary-glow"
              >
                {isSaving ? "Registering..." : "Register Business"}
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Step 4: Dashboard ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Employer Dashboard</h1>
              <p className="text-muted-foreground">
                {employerType === "shg" ? "SHG Community Jobs Manager" : "Small Business Portal"}
              </p>
            </div>
            {profile?.is_verified ? (
              <Badge variant="outline" className="mt-2 md:mt-0 border-green-500 text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" /> Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-2 md:mt-0">
                <AlertCircle className="w-3 h-3 mr-1" /> Verification Pending
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Jobs", value: postedJobs.length.toString(), icon: Briefcase, color: "text-primary" },
              { label: "Total Workers", value: DEMO_WORKERS.length.toString(), icon: Users, color: "text-success" },
              { label: "Pieces Completed", value: "82", icon: Package, color: "text-accent" },
              { label: "Amount Paid", value: "₹33,600", icon: IndianRupee, color: "text-warning" },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-xl border p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="my-profile"><User className="w-4 h-4 mr-1" />My Profile</TabsTrigger>
              <TabsTrigger value="post-jobs"><Plus className="w-4 h-4 mr-1" />Post Jobs</TabsTrigger>
              <TabsTrigger value="manage-tasks"><Settings className="w-4 h-4 mr-1" />Manage Tasks</TabsTrigger>
              <TabsTrigger value="track-workers"><UserCheck className="w-4 h-4 mr-1" />Track Workers</TabsTrigger>
              <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-1" />Analytics</TabsTrigger>
            </TabsList>

            {/* My Profile */}
            <TabsContent value="my-profile">
              <div className="bg-card border rounded-2xl p-6 max-w-2xl">
                <h3 className="font-bold text-lg mb-6">Company Profile</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Employer Type</label>
                      <p className="mt-1 font-medium capitalize">{employerType?.replace("_", " ") || "—"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile?.is_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {profile?.is_verified ? "Verified" : "Pending Verification"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Business / SHG Name</label>
                    <p className="mt-1 font-medium">{user?.name || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="mt-1">{user?.email || "—"}</p>
                  </div>
                  {!profile?.is_verified && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm text-yellow-800 font-medium">⏳ Awaiting Admin Verification</p>
                      <p className="text-xs text-yellow-600 mt-1">Admin will review your registration and verify your account soon.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Post Jobs */}
            <TabsContent value="post-jobs">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4">Post New Job</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Job Title *</Label>
                      <Input value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Blouse Stitching – 200 pieces" />
                    </div>
                    <div>
                      <Label>Description *</Label>
                      <Textarea value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the work, materials, quality requirements..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Rate per Piece (₹) *</Label>
                        <Input type="number" value={jobForm.pieceRate} onChange={e => setJobForm(p => ({ ...p, pieceRate: e.target.value }))} placeholder="100" />
                      </div>
                      <div>
                        <Label>Total Pieces</Label>
                        <Input type="number" value={jobForm.totalPieces} onChange={e => setJobForm(p => ({ ...p, totalPieces: e.target.value }))} placeholder="500" />
                      </div>
                    </div>
                    <div>
                      <Label>Deadline</Label>
                      <Input type="date" value={jobForm.deadline} onChange={e => setJobForm(p => ({ ...p, deadline: e.target.value }))} />
                    </div>
                    <Button onClick={handlePostJob} disabled={isPosting} className="w-full btn-primary-glow">
                      <Plus className="w-4 h-4 mr-2" /> {isPosting ? "Posting..." : "Post Job"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Active Jobs ({postedJobs.length})</h3>
                  {postedJobs.length === 0 ? (
                    <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
                      <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No jobs posted yet. Use the Post Jobs tab to create one.</p>
                    </div>
                  ) : postedJobs.map(job => (
                    <div key={job.id} className="bg-card border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{job.title}</h4>
                        <Badge variant="default">{job.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">₹{job.rate}/piece · {job.applicants} applicants</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((job.piecesAssigned / (job.total || 1)) * 100, 100)}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{job.piecesAssigned}/{job.total} pieces assigned</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Manage Tasks */}
            <TabsContent value="manage-tasks">
              <div className="bg-card border rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Pieces</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEMO_WORKERS.map(w => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell>{w.task}</TableCell>
                        <TableCell>{w.pieces}</TableCell>
                        <TableCell>
                          <Badge variant={w.status === "completed" ? "default" : "secondary"}>
                            {w.status === "completed" ? "✓ Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {w.amount > 0 ? `₹${w.amount.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell>
                          {w.status === "completed" && (
                            <Button size="sm" variant="outline">Approve Payment</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Track Workers */}
            <TabsContent value="track-workers">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {DEMO_WORKERS.map(w => (
                  <div key={w.id} className="bg-card border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {w.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{w.name}</div>
                        <div className="text-xs text-muted-foreground">{w.task}</div>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pieces</span>
                        <span className="font-medium">{w.pieces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={w.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {w.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Weekly Performance
                  </h3>
                  <div className="space-y-3">
                    {DEMO_WEEKLY.map(w => (
                      <div key={w.week} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-16">{w.week}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(w.pieces / 600) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium">₹{w.paid.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="font-bold mb-4">Summary</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Total Workers Engaged", value: "9" },
                      { label: "Total Pieces Completed", value: "1,710" },
                      { label: "Total Amount Paid", value: "₹68,400" },
                      { label: "Average Output Quality", value: "94%" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                        <span className="text-muted-foreground text-sm">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};


export default EmployerDashboard;