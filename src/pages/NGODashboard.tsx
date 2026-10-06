import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Upload, Users, TrendingUp, Shield, CheckCircle,
  AlertCircle, Plus, Clock, Star, GraduationCap, Globe,
  Smartphone, Heart, Calendar, User, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TRAINING_TYPES = [
  "Digital Literacy", "Financial Literacy", "Livelihood Skills",
  "Health & Safety", "Legal Rights", "Entrepreneurship", "Vocational Training",
];

// Demo counsellor schedules
const DEMO_COUNSELLORS = [
  {
    id: "c1", name: "Anjali Mehta", email: "anjali@gramvikas.org",
    specialty: "Digital Literacy", assignedModule: "Smartphone Basics for Earning",
    schedule: "Mon, Wed 10–12am", learners: 32, status: "active",
  },
  {
    id: "c2", name: "Kavita Raut", email: "kavita@stree.org",
    specialty: "Financial Literacy", assignedModule: "Financial Literacy & Savings",
    schedule: "Tue, Thu 2–4pm", learners: 28, status: "active",
  },
  {
    id: "c3", name: "Pooja Singh", email: "pooja@stree.org",
    specialty: "Entrepreneurship", assignedModule: "Starting a Home Business",
    schedule: "Sat 9am–1pm", learners: 19, status: "active",
  },
];

const DEMO_LEARNERS = [
  { id: "l1", name: "Priya Sharma", module: "Smartphone Basics", progress: 75, status: "in_progress" },
  { id: "l2", name: "Radha Patil", module: "Financial Literacy & Savings", progress: 100, status: "completed" },
  { id: "l3", name: "Sunita Devi", module: "Starting a Home Business", progress: 50, status: "in_progress" },
  { id: "l4", name: "Meera Gupta", module: "Smartphone Basics", progress: 100, status: "completed" },
];

const NGODashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"register" | "pending" | "dashboard">("register");
  const [activeTab, setActiveTab] = useState("modules");
  const [isAdminVerified] = useState(false); // Would come from API in production
  const [isSaving, setIsSaving] = useState(false);

  const [ngoForm, setNgoForm] = useState({
    ngoName: "", registrationNumber: "", trainingType: [] as string[],
    contactPerson: "", location: "", website: "",
  });

  const [moduleForm, setModuleForm] = useState({
    title: "", category: "", description: "", durationHours: "",
    skillScoreBoost: "15", difficulty: "beginner", language: "Hindi",
  });

  const [counsellorForm, setCounsellorForm] = useState({
    name: "", email: "", moduleId: "", schedule: "",
  });

  const handleRegisterNGO = async () => {
    if (!ngoForm.ngoName || !ngoForm.registrationNumber) {
      toast({ title: "Required", description: "NGO Name and Registration Number are required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const token = localStorage.getItem("bloompath_id_token");
      await fetch(`${API_URL}/createNGOProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          ngoName: ngoForm.ngoName,
          registrationNumber: ngoForm.registrationNumber,
          trainingType: ngoForm.trainingType,
          contactPerson: ngoForm.contactPerson,
          location: ngoForm.location,
        }),
      });
      setStep("pending");
      toast({ title: "NGO Registered!", description: "Under review. Admin will verify within 48 hours." });
    } catch {
      setStep("pending");
      toast({ title: "NGO Registered!", description: "Your NGO is pending admin verification." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadModule = () => {
    if (!moduleForm.title || !moduleForm.category) {
      toast({ title: "Required", description: "Title and category required.", variant: "destructive" });
      return;
    }
    toast({ title: "Module Submitted!", description: "Training module is under review." });
    setModuleForm({ title: "", category: "", description: "", durationHours: "", skillScoreBoost: "15", difficulty: "beginner", language: "Hindi" });
  };

  const handleAssignCounsellor = () => {
    if (!counsellorForm.email || !counsellorForm.moduleId) {
      toast({ title: "Required", description: "Email and module required.", variant: "destructive" });
      return;
    }
    toast({ title: "Counsellor Assigned!", description: `${counsellorForm.name || counsellorForm.email} assigned.` });
    setCounsellorForm({ name: "", email: "", moduleId: "", schedule: "" });
  };

  const toggleTrainingType = (type: string) => {
    setNgoForm(p => ({
      ...p,
      trainingType: p.trainingType.includes(type)
        ? p.trainingType.filter(x => x !== type)
        : [...p.trainingType, type],
    }));
  };

  // ── Register Step ──────────────────────────────────────────────────────
  if (step === "register") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">NGO Registration</h1>
              <p className="text-muted-foreground">Partner with BloomPath to provide training modules for women</p>
            </div>

            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>NGO Name *</Label>
                  <Input value={ngoForm.ngoName} onChange={e => setNgoForm(p => ({ ...p, ngoName: e.target.value }))} placeholder="Gram Vikas Foundation" />
                </div>
                <div>
                  <Label>Registration Number *</Label>
                  <Input value={ngoForm.registrationNumber} onChange={e => setNgoForm(p => ({ ...p, registrationNumber: e.target.value }))} placeholder="NGO-MH-2019-0023" />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input value={ngoForm.contactPerson} onChange={e => setNgoForm(p => ({ ...p, contactPerson: e.target.value }))} placeholder="Dr. Anjali Mehta" />
                </div>
                <div className="col-span-2">
                  <Label>Location</Label>
                  <Input value={ngoForm.location} onChange={e => setNgoForm(p => ({ ...p, location: e.target.value }))} placeholder="Nashik, Maharashtra" />
                </div>
              </div>

              <div>
                <Label>Type of Training</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TRAINING_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTrainingType(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        ngoForm.trainingType.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
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
                  <p className="text-sm text-muted-foreground">12A/80G certificate, FCRA, CSR registration</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" /> Upload Document
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleRegisterNGO}
                disabled={isSaving || !ngoForm.ngoName || !ngoForm.registrationNumber}
                className="w-full btn-primary-glow"
              >
                {isSaving ? "Registering..." : "Submit for Review"}
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Pending Verification Step ──────────────────────────────────────────
  if (step === "pending" && !isAdminVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 max-w-lg text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-warning" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Verification Pending</h1>
            <p className="text-muted-foreground mb-6">
              Your NGO registration is under review by BloomPath admin. 
              You'll be notified via email within 48 hours.
            </p>
            <div className="bg-card border rounded-xl p-4 text-left mb-6">
              <p className="text-sm font-semibold mb-2">After verification you can:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />Upload training modules</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />Assign counsellors</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" />View learner progress</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep("dashboard")} className="flex-1 btn-primary-glow">
                Preview Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/ngo-portal")}>Go to NGO Portal</Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Full Dashboard ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">NGO Dashboard</h1>
              <p className="text-muted-foreground">Manage training modules, counsellors, and learner progress</p>
            </div>
            {!isAdminVerified && (
              <Badge variant="outline" className="mt-2 md:mt-0 text-warning border-warning">
                <AlertCircle className="w-3 h-3 mr-1" /> Pending Admin Verification
              </Badge>
            )}
            {isAdminVerified && (
              <Badge className="mt-2 md:mt-0 bg-success text-success-foreground">
                <Shield className="w-3 h-3 mr-1" /> Verified NGO
              </Badge>
            )}
          </div>

          {!isAdminVerified && (
            <div className="mb-6 p-4 rounded-xl border border-warning bg-warning/5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-warning">Admin verification required</div>
                <div className="text-sm text-muted-foreground">
                  Uploading modules, assigning counsellors, and viewing learner progress will be enabled after admin verifies your NGO.
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Modules Published", value: "5", icon: BookOpen, color: "text-primary" },
              { label: "Active Counsellors", value: DEMO_COUNSELLORS.length.toString(), icon: Users, color: "text-success" },
              { label: "Total Learners", value: "1,200", icon: GraduationCap, color: "text-accent" },
              { label: "Avg Completion Rate", value: "82%", icon: Star, color: "text-warning" },
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
              <TabsTrigger value="modules"><BookOpen className="w-4 h-4 mr-1" />Upload Modules</TabsTrigger>
              <TabsTrigger value="counsellors"><User className="w-4 h-4 mr-1" />Counsellors</TabsTrigger>
              <TabsTrigger value="learners"><TrendingUp className="w-4 h-4 mr-1" />Learner Progress</TabsTrigger>
            </TabsList>

            {/* Upload Modules */}
            <TabsContent value="modules">
              {!isAdminVerified ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold">Module Upload Locked</p>
                  <p className="text-sm mt-1">Admin verification required to upload training modules</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-card border rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Upload New Module</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Module Title *</Label>
                        <Input value={moduleForm.title} onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Category *</Label>
                        <Select onValueChange={v => setModuleForm(p => ({ ...p, category: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>{TRAINING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea value={moduleForm.description} onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Duration (hours)</Label>
                          <Input type="number" value={moduleForm.durationHours} onChange={e => setModuleForm(p => ({ ...p, durationHours: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Skill Boost Points</Label>
                          <Input type="number" value={moduleForm.skillScoreBoost} onChange={e => setModuleForm(p => ({ ...p, skillScoreBoost: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <Label>Add Learning Material</Label>
                        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center mt-2">
                          <p className="text-sm text-muted-foreground">PDF, video, or presentation</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Upload className="w-4 h-4 mr-2" /> Upload Material
                          </Button>
                        </div>
                      </div>
                      <Button onClick={handleUploadModule} className="w-full btn-primary-glow">Submit Module</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-4">Published Modules</h3>
                    <div className="space-y-3">
                      {["Smartphone Basics", "Online Safety", "Financial Literacy", "Home Business", "Legal Rights"].map((m, i) => (
                        <div key={m} className="bg-card border rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{m}</div>
                            <div className="text-xs text-muted-foreground">Published</div>
                          </div>
                          <Badge className="bg-success/10 text-success text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />Verified
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Counsellors */}
            <TabsContent value="counsellors">
              {!isAdminVerified ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold">Counsellor Assignment Locked</p>
                  <p className="text-sm mt-1">Admin verification required to assign counsellors</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-card border rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Assign Counsellor</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Counsellor Name</Label>
                        <Input value={counsellorForm.name} onChange={e => setCounsellorForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
                      </div>
                      <div>
                        <Label>Counsellor Email *</Label>
                        <Input type="email" value={counsellorForm.email} onChange={e => setCounsellorForm(p => ({ ...p, email: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Assign to Module *</Label>
                        <Select onValueChange={v => setCounsellorForm(p => ({ ...p, moduleId: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                          <SelectContent>
                            {["mod-1", "mod-2", "mod-3", "mod-4"].map(m => <SelectItem key={m} value={m}>Module {m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Schedule</Label>
                        <Input value={counsellorForm.schedule} onChange={e => setCounsellorForm(p => ({ ...p, schedule: e.target.value }))} placeholder="Mon, Wed 10–12am" />
                      </div>
                      <Button onClick={handleAssignCounsellor} className="w-full btn-primary-glow">Assign Counsellor</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-4">Active Counsellors</h3>
                    <div className="space-y-3">
                      {DEMO_COUNSELLORS.map(c => (
                        <div key={c.id} className="bg-card border rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold">{c.name}</div>
                              <div className="text-xs text-muted-foreground">{c.email}</div>
                            </div>
                            <Badge variant="default" className="text-xs">Active</Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <BookOpen className="w-3 h-3" /> {c.assignedModule}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-3 h-3" /> {c.schedule}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-3 h-3" /> {c.learners} learners
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Learner Progress */}
            <TabsContent value="learners">
              {!isAdminVerified ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold">Learner Progress Locked</p>
                  <p className="text-sm mt-1">Admin verification required to view learner progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {DEMO_LEARNERS.map(l => (
                    <div key={l.id} className="bg-card border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold">{l.name}</div>
                          <div className="text-sm text-muted-foreground">{l.module}</div>
                        </div>
                        <Badge variant={l.status === "completed" ? "default" : "secondary"}>
                          {l.status === "completed" ? "✓ Completed" : "In Progress"}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{l.progress}%</span>
                        </div>
                        <Progress value={l.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
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

export default NGODashboard;
