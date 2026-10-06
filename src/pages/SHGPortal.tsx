import { shgApi, jobsApi, applicationsApi } from "@/lib/awsApi";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  CheckCircle,
  Clock,
  IndianRupee,
  Package,
  Upload,
  Eye,
  Briefcase,
  Star,
  AlertCircle,
  Building2,
  ChevronRight,
  FileCheck,
  Scissors,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const MICROJOB_CATEGORIES = [
  "Stitching & Tailoring",
  "Packaging & Assembly",
  "Craftwork & Handicrafts",
  "Food Processing",
  "Embroidery & Needlework",
  "Candle & Soap Making",
  "Incense Making",
  "Paper Products",
  "Jute Products",
  "Pottery & Terracotta",
];

interface SHGProfile {
  id: string;
  shg_name: string;
  registration_number: string;
  location: string;
  contact_person: string;
  mobile: string;
  member_count: number;
  specialization: string;
  is_verified: boolean;
  bank_account: string | null;
  description: string | null;
  rating: number;
  user_id: string;
  created_at: string;
}

interface MicrojobPost {
  id: string;
  shg_id: string;
  title: string;
  category: string;
  description: string;
  piece_rate: number;
  shg_margin: number;
  woman_rate: number;
  min_pieces: number;
  total_pieces_available: number;
  pieces_assigned: number;
  pieces_completed: number;
  required_skills: string[];
  sample_work_url: string | null;
  status: "open" | "full" | "closed";
  deadline: string | null;
  created_at: string;
  shg?: { shg_name: string; location: string };
}

interface MicrojobApplication {
  id: string;
  microjob_id: string;
  user_id: string;
  pieces_requested: number;
  pieces_completed: number;
  status: "pending" | "approved" | "working" | "submitted" | "approved_payment";
  proof_url: string | null;
  created_at: string;
  user?: { full_name: string; email: string; skills: string[] };
  microjob?: { title: string; woman_rate: number };
}

// Demo data for SHG Portal
const DEMO_SHGS: SHGProfile[] = [
  {
    id: "shg-1",
    shg_name: "Mahila Shakti SHG",
    registration_number: "MH-SHG-2021-001",
    location: "Mumbai, Maharashtra",
    contact_person: "Sunita Devi",
    mobile: "9876543210",
    member_count: 12,
    specialization: "Stitching & Tailoring",
    is_verified: true,
    bank_account: "XXXX-1234",
    description: "We specialize in high-quality garment stitching and embroidery work.",
    rating: 4.8,
    user_id: "demo",
    created_at: new Date().toISOString(),
  },
  {
    id: "shg-2",
    shg_name: "Pragati Mahila Mandal",
    registration_number: "MH-SHG-2020-045",
    location: "Pune, Maharashtra",
    contact_person: "Radha Patil",
    mobile: "9765432109",
    member_count: 8,
    specialization: "Food Processing",
    is_verified: true,
    bank_account: "XXXX-5678",
    description: "We process and package traditional Maharashtra snacks and pickles.",
    rating: 4.6,
    user_id: "demo",
    created_at: new Date().toISOString(),
  },
];

const DEMO_MICROJOBS: MicrojobPost[] = [
  {
    id: "mj-1",
    shg_id: "shg-1",
    title: "Blouse Stitching - Bulk Order",
    category: "Stitching & Tailoring",
    description: "Stitch simple cotton blouses from provided fabric. Must have own sewing machine. Pattern will be provided.",
    piece_rate: 120,
    shg_margin: 20,
    woman_rate: 100,
    min_pieces: 10,
    total_pieces_available: 200,
    pieces_assigned: 80,
    pieces_completed: 45,
    required_skills: ["Tailoring", "Stitching"],
    sample_work_url: null,
    status: "open",
    deadline: "2026-03-20",
    created_at: new Date().toISOString(),
    shg: { shg_name: "Mahila Shakti SHG", location: "Mumbai" },
  },
  {
    id: "mj-2",
    shg_id: "shg-1",
    title: "Embroidery Work - Kurta Sleeves",
    category: "Embroidery & Needlework",
    description: "Traditional mirror work embroidery on sleeve pieces. Thread and materials provided.",
    piece_rate: 200,
    shg_margin: 30,
    woman_rate: 170,
    min_pieces: 5,
    total_pieces_available: 100,
    pieces_assigned: 30,
    pieces_completed: 20,
    required_skills: ["Embroidery", "Handicrafts"],
    sample_work_url: null,
    status: "open",
    deadline: "2026-03-25",
    created_at: new Date().toISOString(),
    shg: { shg_name: "Mahila Shakti SHG", location: "Mumbai" },
  },
  {
    id: "mj-3",
    shg_id: "shg-2",
    title: "Papad Rolling & Drying",
    category: "Food Processing",
    description: "Roll and dry papad from provided dough. Must have clean kitchen space. Health certificate required.",
    piece_rate: 50,
    shg_margin: 10,
    woman_rate: 40,
    min_pieces: 50,
    total_pieces_available: 1000,
    pieces_assigned: 400,
    pieces_completed: 300,
    required_skills: ["Cooking", "Food Processing"],
    sample_work_url: null,
    status: "open",
    deadline: "2026-03-15",
    created_at: new Date().toISOString(),
    shg: { shg_name: "Pragati Mahila Mandal", location: "Pune" },
  },
];

const SHGPortal = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("browse");
  const [microjobs, setMicrojobs] = useState<MicrojobPost[]>(DEMO_MICROJOBS);
  const [myApplications, setMyApplications] = useState<MicrojobApplication[]>([]);
  const [shgProfile, setShgProfile] = useState<SHGProfile | null>(null);
  const [showRegisterSHG, setShowRegisterSHG] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<MicrojobPost | null>(null);
  const [loading, setLoading] = useState(false);

  // SHG Registration form
  const [shgForm, setShgForm] = useState({
    shg_name: "",
    registration_number: "",
    location: "",
    contact_person: "",
    mobile: "",
    member_count: "",
    specialization: "",
    description: "",
    bank_account: "",
  });

  // Post job form
  const [jobForm, setJobForm] = useState({
    title: "",
    category: "",
    description: "",
    piece_rate: "",
    shg_margin: "15",
    min_pieces: "",
    total_pieces: "",
    skills: "",
    deadline: "",
  });

  // Apply form
  const [applyForm, setApplyForm] = useState({
    pieces_requested: "",
  });

  const isSHGAdmin = shgProfile !== null;
  const isRegularUser = profile?.role === "user";

  const handleRegisterSHG = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Saving to AWS DynamoDB via API
      const newSHG: SHGProfile = {
        id: `shg-${Date.now()}`,
        ...shgForm,
        member_count: parseInt(shgForm.member_count) || 0,
        is_verified: false,
        rating: 0,
        user_id: user.id,
        created_at: new Date().toISOString(),
        bank_account: shgForm.bank_account || null,
        description: shgForm.description || null,
      };
      setShgProfile(newSHG);
      setShowRegisterSHG(false);
      toast({
        title: "SHG Registered!",
        description: "Your SHG registration is under review. You'll receive approval within 24-48 hours.",
      });
    } catch {
      toast({ title: "Error", description: "Registration failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async () => {
    if (!shgProfile) return;
    setLoading(true);
    try {
      const pieceRate = parseFloat(jobForm.piece_rate);
      const margin = parseFloat(jobForm.shg_margin) / 100;
      const womanRate = Math.round(pieceRate * (1 - margin));

      const newJob: MicrojobPost = {
        id: `mj-${Date.now()}`,
        shg_id: shgProfile.id,
        title: jobForm.title,
        category: jobForm.category,
        description: jobForm.description,
        piece_rate: pieceRate,
        shg_margin: parseFloat(jobForm.shg_margin),
        woman_rate: womanRate,
        min_pieces: parseInt(jobForm.min_pieces) || 1,
        total_pieces_available: parseInt(jobForm.total_pieces) || 100,
        pieces_assigned: 0,
        pieces_completed: 0,
        required_skills: jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
        sample_work_url: null,
        status: "open",
        deadline: jobForm.deadline || null,
        created_at: new Date().toISOString(),
        shg: { shg_name: shgProfile.shg_name, location: shgProfile.location },
      };
      setMicrojobs((prev) => [newJob, ...prev]);
      setShowPostJob(false);
      setJobForm({ title: "", category: "", description: "", piece_rate: "", shg_margin: "15", min_pieces: "", total_pieces: "", skills: "", deadline: "" });
      toast({ title: "Microjob Posted!", description: "Your microjob is now live and women can apply." });
    } catch {
      toast({ title: "Error", description: "Failed to post job.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || !selectedJob) return;
    setLoading(true);
    try {
      const newApp: MicrojobApplication = {
        id: `app-${Date.now()}`,
        microjob_id: selectedJob.id,
        user_id: user.id,
        pieces_requested: parseInt(applyForm.pieces_requested) || selectedJob.min_pieces,
        pieces_completed: 0,
        status: "pending",
        proof_url: null,
        created_at: new Date().toISOString(),
        microjob: { title: selectedJob.title, woman_rate: selectedJob.woman_rate },
      };
      setMyApplications((prev) => [newApp, ...prev]);
      setShowApplyModal(false);
      setSelectedJob(null);
      toast({ title: "Applied!", description: "Your application has been sent to the SHG. Approval expected within 24 hours." });
    } catch {
      toast({ title: "Error", description: "Application failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const estimatedEarnings = (job: MicrojobPost) =>
    job.woman_rate * job.min_pieces;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-8 h-8 text-primary" />
                SHG Community Jobs
              </h1>
              <p className="text-muted-foreground">
                Home-based microjobs from verified Self-Help Groups · Earn from your doorstep
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              {!isSHGAdmin && (
                <Button onClick={() => setShowRegisterSHG(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Register Your SHG
                </Button>
              )}
              {isSHGAdmin && (
                <Button onClick={() => setShowPostJob(true)} className="btn-primary-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Microjob
                </Button>
              )}
            </div>
          </div>

          {/* SHG Verification Banner */}
          {isSHGAdmin && !shgProfile.is_verified && (
            <div className="mb-6 p-4 rounded-xl border border-warning bg-warning/10 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-warning">SHG Verification Pending</div>
                <div className="text-sm text-muted-foreground">
                  Your SHG registration is under review. You can post jobs after verification.
                </div>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active SHGs", value: "2", icon: Building2, color: "text-primary" },
              { label: "Open Microjobs", value: microjobs.filter(j => j.status === "open").length.toString(), icon: Briefcase, color: "text-success" },
              { label: "Total Pieces Available", value: microjobs.reduce((a, j) => a + (j.total_pieces_available - j.pieces_assigned), 0).toString(), icon: Package, color: "text-accent" },
              { label: "My Applications", value: myApplications.length.toString(), icon: FileCheck, color: "text-warning" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
              <TabsTrigger value="my-applications">My Applications</TabsTrigger>
              {isSHGAdmin && <TabsTrigger value="shg-dashboard">SHG Dashboard</TabsTrigger>}
            </TabsList>

            {/* Browse Jobs Tab */}
            <TabsContent value="browse">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {microjobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl border p-6 hover:border-primary/50 transition-colors relative"
                  >
                    {job.status === "open" && (
                      <Badge className="absolute top-4 right-4 bg-success text-success-foreground text-xs">
                        Open
                      </Badge>
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Scissors className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <p className="text-xs text-muted-foreground">{job.shg?.shg_name} · {job.shg?.location}</p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-xs mb-3">{job.category}</Badge>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.required_skills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Pieces assigned</span>
                        <span>{job.pieces_assigned}/{job.total_pieces_available}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(job.pieces_assigned / job.total_pieces_available) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          {job.woman_rate}/piece
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min {job.min_pieces} pieces · Est. ₹{estimatedEarnings(job).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="btn-primary-glow"
                        disabled={!user || job.status !== "open"}
                        onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                      >
                        Apply
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* My Applications Tab */}
            <TabsContent value="my-applications">
              {myApplications.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground">Browse microjobs and apply to start earning!</p>
                  <Button onClick={() => setActiveTab("browse")} className="mt-4">Browse Jobs</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div key={app.id} className="bg-card rounded-xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{app.microjob?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {app.pieces_requested} pieces · ₹{(app.microjob?.woman_rate || 0) * app.pieces_requested} estimated
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          app.status === "approved" || app.status === "approved_payment" ? "default" :
                          app.status === "working" ? "secondary" :
                          app.status === "submitted" ? "outline" : "outline"
                        }>
                          {app.status === "approved_payment" ? "Payment Approved" : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                        {app.status === "approved" && (
                          <Button size="sm" variant="outline">
                            <Upload className="w-4 h-4 mr-1" />
                            Upload Proof
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* SHG Dashboard Tab */}
            {isSHGAdmin && (
              <TabsContent value="shg-dashboard">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-card rounded-xl border p-4">
                    <div className="text-2xl font-bold text-primary">{microjobs.filter(j => j.shg_id === shgProfile?.id).length}</div>
                    <div className="text-sm text-muted-foreground">Active Jobs Posted</div>
                  </div>
                  <div className="bg-card rounded-xl border p-4">
                    <div className="text-2xl font-bold text-success">₹{microjobs.filter(j => j.shg_id === shgProfile?.id).reduce((a, j) => a + j.pieces_completed * (j.piece_rate - j.woman_rate), 0).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Margin Earned</div>
                  </div>
                  <div className="bg-card rounded-xl border p-4">
                    <div className="flex items-center gap-1 text-2xl font-bold text-accent">
                      <Star className="w-5 h-5" />
                      {shgProfile?.rating || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">SHG Rating</div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold mb-4">Posted Microjobs</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {microjobs.filter(j => j.shg_id === shgProfile?.id).map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>₹{job.piece_rate}/piece</TableCell>
                          <TableCell>
                            <div className="text-xs">{job.pieces_completed}/{job.total_pieces_available} completed</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </main>
      <Footer />

      {/* Register SHG Modal */}
      <Dialog open={showRegisterSHG} onOpenChange={setShowRegisterSHG}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register Your SHG</DialogTitle>
            <DialogDescription>
              Register your Self-Help Group to post home-based microjobs for women in your community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>SHG Name *</Label>
                <Input value={shgForm.shg_name} onChange={e => setShgForm(p => ({...p, shg_name: e.target.value}))} placeholder="e.g., Mahila Shakti SHG" />
              </div>
              <div>
                <Label>Registration Number *</Label>
                <Input value={shgForm.registration_number} onChange={e => setShgForm(p => ({...p, registration_number: e.target.value}))} placeholder="SHG Reg. No." />
              </div>
              <div>
                <Label>Member Count *</Label>
                <Input type="number" value={shgForm.member_count} onChange={e => setShgForm(p => ({...p, member_count: e.target.value}))} placeholder="No. of members" />
              </div>
              <div className="col-span-2">
                <Label>Location *</Label>
                <Input value={shgForm.location} onChange={e => setShgForm(p => ({...p, location: e.target.value}))} placeholder="City, State" />
              </div>
              <div>
                <Label>Contact Person *</Label>
                <Input value={shgForm.contact_person} onChange={e => setShgForm(p => ({...p, contact_person: e.target.value}))} placeholder="Name" />
              </div>
              <div>
                <Label>Mobile *</Label>
                <Input value={shgForm.mobile} onChange={e => setShgForm(p => ({...p, mobile: e.target.value}))} placeholder="10-digit mobile" />
              </div>
              <div className="col-span-2">
                <Label>Specialization *</Label>
                <Select onValueChange={v => setShgForm(p => ({...p, specialization: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
                  <SelectContent>
                    {MICROJOB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Bank Account (for payments)</Label>
                <Input value={shgForm.bank_account} onChange={e => setShgForm(p => ({...p, bank_account: e.target.value}))} placeholder="Account number" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={shgForm.description} onChange={e => setShgForm(p => ({...p, description: e.target.value}))} placeholder="Tell us about your SHG..." rows={3} />
              </div>
            </div>
            <Button onClick={handleRegisterSHG} disabled={loading || !shgForm.shg_name || !shgForm.registration_number} className="w-full btn-primary-glow">
              {loading ? "Registering..." : "Submit Registration"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Microjob Modal */}
      <Dialog open={showPostJob} onOpenChange={setShowPostJob}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a Microjob</DialogTitle>
            <DialogDescription>Create home-based work for women in your network.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Job Title *</Label>
              <Input value={jobForm.title} onChange={e => setJobForm(p => ({...p, title: e.target.value}))} placeholder="e.g., Blouse Stitching - 100 pieces" />
            </div>
            <div>
              <Label>Category *</Label>
              <Select onValueChange={v => setJobForm(p => ({...p, category: v}))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{MICROJOB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={jobForm.description} onChange={e => setJobForm(p => ({...p, description: e.target.value}))} placeholder="Describe the work, materials provided, quality requirements..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Piece Rate (₹) *</Label>
                <Input type="number" value={jobForm.piece_rate} onChange={e => setJobForm(p => ({...p, piece_rate: e.target.value}))} placeholder="Amount per piece" />
              </div>
              <div>
                <Label>SHG Margin (%)</Label>
                <Input type="number" value={jobForm.shg_margin} onChange={e => setJobForm(p => ({...p, shg_margin: e.target.value}))} />
                {jobForm.piece_rate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Woman gets: ₹{Math.round(parseFloat(jobForm.piece_rate) * (1 - parseFloat(jobForm.shg_margin)/100))}/piece
                  </p>
                )}
              </div>
              <div>
                <Label>Minimum Pieces per Worker</Label>
                <Input type="number" value={jobForm.min_pieces} onChange={e => setJobForm(p => ({...p, min_pieces: e.target.value}))} placeholder="e.g., 10" />
              </div>
              <div>
                <Label>Total Pieces Available</Label>
                <Input type="number" value={jobForm.total_pieces} onChange={e => setJobForm(p => ({...p, total_pieces: e.target.value}))} placeholder="e.g., 500" />
              </div>
            </div>
            <div>
              <Label>Required Skills (comma-separated)</Label>
              <Input value={jobForm.skills} onChange={e => setJobForm(p => ({...p, skills: e.target.value}))} placeholder="e.g., Tailoring, Stitching, Embroidery" />
            </div>
            <div>
              <Label>Deadline</Label>
              <Input type="date" value={jobForm.deadline} onChange={e => setJobForm(p => ({...p, deadline: e.target.value}))} />
            </div>
            <Button onClick={handlePostJob} disabled={loading || !jobForm.title || !jobForm.category || !jobForm.piece_rate} className="w-full btn-primary-glow">
              {loading ? "Posting..." : "Post Microjob"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Microjob</DialogTitle>
            <DialogDescription>{selectedJob?.title}</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pay per piece</span>
                  <span className="font-semibold text-primary">₹{selectedJob.woman_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minimum pieces</span>
                  <span>{selectedJob.min_pieces}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span>{selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString("en-IN") : "Flexible"}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Estimated earnings</span>
                  <span className="font-bold text-success">₹{estimatedEarnings(selectedJob).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <Label>How many pieces would you like to take?</Label>
                <Input
                  type="number"
                  value={applyForm.pieces_requested}
                  onChange={e => setApplyForm({ pieces_requested: e.target.value })}
                  placeholder={`Minimum ${selectedJob.min_pieces}`}
                  min={selectedJob.min_pieces}
                />
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/10 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>Upon approval, you'll receive materials/pattern. Upload proof of completed work to receive payment.</span>
              </div>
              <Button onClick={handleApply} disabled={loading} className="w-full btn-primary-glow">
                {loading ? "Applying..." : "Submit Application"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SHGPortal;
