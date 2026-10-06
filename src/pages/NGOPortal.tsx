import { ngoApi } from "@/lib/awsApi";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  CheckCircle,
  Clock,
  Star,
  Award,
  Play,
  Upload,
  Users,
  TrendingUp,
  Shield,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  Globe,
  Smartphone,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const MODULE_CATEGORIES = [
  "Digital Literacy",
  "Financial Literacy",
  "Livelihood Skills",
  "Health & Safety",
  "Legal Rights",
  "Entrepreneurship",
  "Communication Skills",
  "Vocational Training",
];

interface NGOProfile {
  id: string;
  ngo_name: string;
  registration_number: string;
  focus_area: string;
  location: string;
  contact_person: string;
  is_verified: boolean;
  website: string | null;
  modules_published: number;
  total_learners: number;
}

interface TrainingModule {
  id: string;
  ngo_id: string;
  title: string;
  category: string;
  description: string;
  duration_hours: number;
  skill_score_boost: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  language: string;
  content_url: string | null;
  certificate_template: string | null;
  is_verified: boolean;
  enrolled_count: number;
  completion_rate: number;
  rating: number;
  ngo?: { ngo_name: string; is_verified: boolean };
}

interface UserEnrollment {
  id: string;
  module_id: string;
  user_id: string;
  progress_percent: number;
  status: "enrolled" | "in_progress" | "completed" | "certified";
  score: number | null;
  certificate_url: string | null;
  completed_at: string | null;
  module?: { title: string; skill_score_boost: number; duration_hours: number };
}

// Demo NGO data
const DEMO_NGOS: NGOProfile[] = [
  {
    id: "ngo-1",
    ngo_name: "Gram Vikas Foundation",
    registration_number: "NGO-MH-2019-0023",
    focus_area: "Digital Literacy",
    location: "Nashik, Maharashtra",
    contact_person: "Dr. Anjali Mehta",
    is_verified: true,
    website: "https://gramvikas.org",
    modules_published: 5,
    total_learners: 1200,
  },
  {
    id: "ngo-2",
    ngo_name: "Stree Shakti Trust",
    registration_number: "NGO-MH-2017-0087",
    focus_area: "Livelihood Skills",
    location: "Nagpur, Maharashtra",
    contact_person: "Mrs. Kavita Raut",
    is_verified: true,
    website: null,
    modules_published: 8,
    total_learners: 2400,
  },
];

const DEMO_MODULES: TrainingModule[] = [
  {
    id: "mod-1",
    ngo_id: "ngo-1",
    title: "Smartphone Basics for Earning",
    category: "Digital Literacy",
    description: "Learn to use a smartphone for finding jobs, making payments, and accessing government schemes. Includes UPI, WhatsApp Business, and job portals.",
    duration_hours: 4,
    skill_score_boost: 15,
    difficulty: "beginner",
    language: "Hindi/Marathi",
    content_url: null,
    certificate_template: null,
    is_verified: true,
    enrolled_count: 450,
    completion_rate: 82,
    rating: 4.7,
    ngo: { ngo_name: "Gram Vikas Foundation", is_verified: true },
  },
  {
    id: "mod-2",
    ngo_id: "ngo-1",
    title: "Online Safety & Digital Rights",
    category: "Digital Literacy",
    description: "Protect yourself online. Learn about privacy, scams, safe browsing, and your rights as a digital citizen.",
    duration_hours: 2,
    skill_score_boost: 10,
    difficulty: "beginner",
    language: "Hindi/Marathi",
    content_url: null,
    certificate_template: null,
    is_verified: true,
    enrolled_count: 280,
    completion_rate: 91,
    rating: 4.5,
    ngo: { ngo_name: "Gram Vikas Foundation", is_verified: true },
  },
  {
    id: "mod-3",
    ngo_id: "ngo-2",
    title: "Starting a Home Business",
    category: "Entrepreneurship",
    description: "From idea to income — learn how to register a home business, manage accounts, price your products, and sell online.",
    duration_hours: 8,
    skill_score_boost: 25,
    difficulty: "intermediate",
    language: "Marathi",
    content_url: null,
    certificate_template: null,
    is_verified: true,
    enrolled_count: 320,
    completion_rate: 65,
    rating: 4.9,
    ngo: { ngo_name: "Stree Shakti Trust", is_verified: true },
  },
  {
    id: "mod-4",
    ngo_id: "ngo-2",
    title: "Financial Literacy & Savings",
    category: "Financial Literacy",
    description: "Understand banking, savings, micro-loans, government schemes like PM Jan Dhan, and how to build financial independence.",
    duration_hours: 6,
    skill_score_boost: 20,
    difficulty: "beginner",
    language: "Hindi/Marathi",
    content_url: null,
    certificate_template: null,
    is_verified: true,
    enrolled_count: 680,
    completion_rate: 77,
    rating: 4.6,
    ngo: { ngo_name: "Stree Shakti Trust", is_verified: true },
  },
  {
    id: "mod-5",
    ngo_id: "ngo-2",
    title: "Workplace Safety & Legal Rights",
    category: "Health & Safety",
    description: "Know your rights at work. Covers POSH Act, maternity benefits, minimum wage, safety guidelines, and where to seek help.",
    duration_hours: 3,
    skill_score_boost: 12,
    difficulty: "beginner",
    language: "Hindi/Marathi/English",
    content_url: null,
    certificate_template: null,
    is_verified: true,
    enrolled_count: 520,
    completion_rate: 88,
    rating: 4.8,
    ngo: { ngo_name: "Stree Shakti Trust", is_verified: true },
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  "Digital Literacy": Smartphone,
  "Financial Literacy": TrendingUp,
  "Livelihood Skills": GraduationCap,
  "Health & Safety": Heart,
  "Legal Rights": Shield,
  "Entrepreneurship": Star,
  "Communication Skills": Globe,
  "Vocational Training": BookOpen,
};

const NGOPortal = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("modules");
  const [modules] = useState<TrainingModule[]>(DEMO_MODULES);
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [ngoProfile, setNgoProfile] = useState<NGOProfile | null>(null);
  const [showRegisterNGO, setShowRegisterNGO] = useState(false);
  const [showUploadModule, setShowUploadModule] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const [ngoForm, setNgoForm] = useState({
    ngo_name: "", registration_number: "", focus_area: "", location: "",
    contact_person: "", website: "",
  });

  const [moduleForm, setModuleForm] = useState({
    title: "", category: "", description: "", duration_hours: "",
    skill_score_boost: "", difficulty: "beginner", language: "Hindi",
  });

  const totalSkillBoost = enrollments
    .filter(e => e.status === "completed" || e.status === "certified")
    .reduce((a, e) => a + (e.module?.skill_score_boost || 0), 0);

  const handleEnroll = async (module: TrainingModule) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to enroll in training modules." });
      return;
    }
    setLoading(true);
    try {
      const newEnrollment: UserEnrollment = {
        id: `enr-${Date.now()}`,
        module_id: module.id,
        user_id: user.id,
        progress_percent: 0,
        status: "enrolled",
        score: null,
        certificate_url: null,
        completed_at: null,
        module: { title: module.title, skill_score_boost: module.skill_score_boost, duration_hours: module.duration_hours },
      };
      setEnrollments(prev => [newEnrollment, ...prev]);
      toast({ title: "Enrolled!", description: `You're now enrolled in "${module.title}". Completing this will boost your skill score by +${module.skill_score_boost} points!` });
      setShowEnrollModal(false);
    } catch {
      toast({ title: "Error", description: "Enrollment failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const simulateProgress = (enrollmentId: string) => {
    setEnrollments(prev => prev.map(e => {
      if (e.id !== enrollmentId) return e;
      const newProgress = Math.min(100, e.progress_percent + 25);
      const newStatus = newProgress >= 100 ? "completed" : "in_progress";
      return { ...e, progress_percent: newProgress, status: newStatus, completed_at: newProgress >= 100 ? new Date().toISOString() : null };
    }));
    toast({ title: "Progress Updated!", description: "Keep going! Complete the module to earn your certificate." });
  };

  const filteredModules = filterCategory === "all"
    ? modules
    : modules.filter(m => m.category === filterCategory);

  const getDifficultyColor = (d: string) =>
    d === "beginner" ? "text-success" : d === "intermediate" ? "text-warning" : "text-destructive";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-primary" />
                NGO Training Hub
              </h1>
              <p className="text-muted-foreground">
                Free verified training modules · Boost your skills · Earn certificates
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              {!ngoProfile && (
                <Button onClick={() => setShowRegisterNGO(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Register NGO
                </Button>
              )}
              {ngoProfile && (
                <Button onClick={() => setShowUploadModule(true)} className="btn-primary-glow">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Module
                </Button>
              )}
            </div>
          </div>

          {/* Skill Score Banner */}
          {user && totalSkillBoost > 0 && (
            <div className="mb-6 p-4 rounded-xl border border-success bg-success/10 flex items-center gap-4">
              <Award className="w-8 h-8 text-success flex-shrink-0" />
              <div>
                <div className="font-semibold text-success">Your Skill Score Boosted by +{totalSkillBoost} points!</div>
                <div className="text-sm text-muted-foreground">Completed NGO training improves your job recommendations and match scores.</div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Verified NGOs", value: DEMO_NGOS.length.toString(), icon: Shield, color: "text-primary" },
              { label: "Training Modules", value: modules.length.toString(), icon: BookOpen, color: "text-success" },
              { label: "My Enrollments", value: enrollments.length.toString(), icon: GraduationCap, color: "text-accent" },
              { label: "Skill Score Boost", value: `+${totalSkillBoost}`, icon: TrendingUp, color: "text-warning" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl border p-4">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="modules">All Modules</TabsTrigger>
              <TabsTrigger value="my-learning">My Learning</TabsTrigger>
              <TabsTrigger value="ngos">NGOs</TabsTrigger>
              {ngoProfile && <TabsTrigger value="ngo-dashboard">NGO Dashboard</TabsTrigger>}
            </TabsList>

            {/* Modules Tab */}
            <TabsContent value="modules">
              <div className="flex gap-3 mb-6 flex-wrap">
                <Button
                  size="sm"
                  variant={filterCategory === "all" ? "default" : "outline"}
                  onClick={() => setFilterCategory("all")}
                >All</Button>
                {MODULE_CATEGORIES.map(c => (
                  <Button
                    key={c}
                    size="sm"
                    variant={filterCategory === c ? "default" : "outline"}
                    onClick={() => setFilterCategory(c)}
                  >{c}</Button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((mod, i) => {
                  const Icon = categoryIcons[mod.category] || BookOpen;
                  const enrolled = enrollments.find(e => e.module_id === mod.id);
                  return (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border p-6 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        {mod.is_verified && (
                          <Badge className="bg-success/10 text-success border-success/20 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />Verified
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-foreground mb-1">{mod.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{mod.ngo?.ngo_name}</p>

                      <Badge variant="outline" className="text-xs mb-3">{mod.category}</Badge>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{mod.description}</p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mod.duration_hours}h</span>
                        <span className={`font-medium ${getDifficultyColor(mod.difficulty)}`}>{mod.difficulty}</span>
                        <span>{mod.language}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs mb-4">
                        <span className="flex items-center gap-1 text-warning">
                          <Star className="w-3 h-3 fill-warning" />{mod.rating}
                        </span>
                        <span className="text-muted-foreground">{mod.enrolled_count} enrolled</span>
                        <span className="text-success">+{mod.skill_score_boost} pts</span>
                      </div>

                      {enrolled ? (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{enrolled.progress_percent}%</span>
                          </div>
                          <Progress value={enrolled.progress_percent} className="h-2 mb-3" />
                          {enrolled.status !== "completed" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => simulateProgress(enrolled.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Continue Learning
                            </Button>
                          ) : (
                            <Button size="sm" className="w-full bg-success text-success-foreground" disabled>
                              <Award className="w-4 h-4 mr-1" />Completed · Certificate Earned
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full btn-primary-glow"
                          onClick={() => { setSelectedModule(mod); setShowEnrollModal(true); }}
                        >
                          Enroll Free
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* My Learning Tab */}
            <TabsContent value="my-learning">
              {enrollments.length === 0 ? (
                <div className="text-center py-16">
                  <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Learning Today</h3>
                  <p className="text-muted-foreground mb-4">Enroll in free training modules to boost your skill score and unlock better jobs.</p>
                  <Button onClick={() => setActiveTab("modules")}>Browse Modules</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-card rounded-xl border p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{enrollment.module?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.module?.duration_hours}h · +{enrollment.module?.skill_score_boost} skill points
                          </p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{enrollment.progress_percent}%</span>
                            </div>
                            <Progress value={enrollment.progress_percent} className="h-2" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={enrollment.status === "completed" ? "default" : "secondary"}>
                            {enrollment.status === "completed" ? "✓ Completed" : enrollment.status.replace("_", " ")}
                          </Badge>
                          {enrollment.status !== "completed" && (
                            <Button size="sm" variant="outline" onClick={() => simulateProgress(enrollment.id)}>
                              <Play className="w-4 h-4 mr-1" />Continue
                            </Button>
                          )}
                          {enrollment.status === "completed" && (
                            <Button size="sm" variant="outline">
                              <Award className="w-4 h-4 mr-1" />Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* NGOs Tab */}
            <TabsContent value="ngos">
              <div className="grid md:grid-cols-2 gap-6">
                {DEMO_NGOS.map((ngo) => (
                  <div key={ngo.id} className="bg-card rounded-xl border p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{ngo.ngo_name}</h3>
                        <p className="text-sm text-muted-foreground">{ngo.location}</p>
                      </div>
                      {ngo.is_verified && (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <Shield className="w-3 h-3 mr-1" />Verified
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="mb-3">{ngo.focus_area}</Badge>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-semibold">{ngo.modules_published}</div>
                        <div className="text-muted-foreground">Modules</div>
                      </div>
                      <div>
                        <div className="font-semibold">{ngo.total_learners.toLocaleString()}</div>
                        <div className="text-muted-foreground">Learners</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* NGO Dashboard */}
            {ngoProfile && (
              <TabsContent value="ngo-dashboard">
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                  <p>NGO Dashboard will be available after verification.</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </main>
      <Footer />

      {/* Enroll Modal */}
      <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll in Training</DialogTitle>
            <DialogDescription>{selectedModule?.title}</DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedModule.duration_hours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className={`font-medium ${getDifficultyColor(selectedModule.difficulty)}`}>{selectedModule.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span>{selectedModule.language}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Skill Score Boost</span>
                  <span className="font-bold text-success">+{selectedModule.skill_score_boost} points</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Completing this module will boost your skill score, improving job recommendations and making you eligible for higher-paying opportunities.</span>
              </div>
              <Button
                onClick={() => selectedModule && handleEnroll(selectedModule)}
                disabled={loading}
                className="w-full btn-primary-glow"
              >
                {loading ? "Enrolling..." : "Enroll for Free"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Register NGO Modal */}
      <Dialog open={showRegisterNGO} onOpenChange={setShowRegisterNGO}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register Your NGO</DialogTitle>
            <DialogDescription>Partner with BloomPath to offer training modules for women.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>NGO Name *</Label>
              <Input value={ngoForm.ngo_name} onChange={e => setNgoForm(p => ({...p, ngo_name: e.target.value}))} placeholder="e.g., Stree Shakti Trust" />
            </div>
            <div>
              <Label>Registration Number *</Label>
              <Input value={ngoForm.registration_number} onChange={e => setNgoForm(p => ({...p, registration_number: e.target.value}))} />
            </div>
            <div>
              <Label>Focus Area *</Label>
              <Select onValueChange={v => setNgoForm(p => ({...p, focus_area: v}))}>
                <SelectTrigger><SelectValue placeholder="Select focus area" /></SelectTrigger>
                <SelectContent>{MODULE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location *</Label>
                <Input value={ngoForm.location} onChange={e => setNgoForm(p => ({...p, location: e.target.value}))} placeholder="City, State" />
              </div>
              <div>
                <Label>Contact Person *</Label>
                <Input value={ngoForm.contact_person} onChange={e => setNgoForm(p => ({...p, contact_person: e.target.value}))} />
              </div>
            </div>
            <div>
              <Label>Website (optional)</Label>
              <Input value={ngoForm.website} onChange={e => setNgoForm(p => ({...p, website: e.target.value}))} placeholder="https://" />
            </div>
            <Button
              onClick={() => {
                setNgoProfile({
                  id: `ngo-${Date.now()}`,
                  ...ngoForm,
                  is_verified: false,
                  modules_published: 0,
                  total_learners: 0,
                });
                setShowRegisterNGO(false);
                toast({ title: "NGO Registered!", description: "Your NGO is under review. Approval expected within 48 hours." });
              }}
              disabled={!ngoForm.ngo_name || !ngoForm.registration_number}
              className="w-full btn-primary-glow"
            >
              Submit Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Module Modal */}
      <Dialog open={showUploadModule} onOpenChange={setShowUploadModule}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Training Module</DialogTitle>
            <DialogDescription>Add a new verified training module for women.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Module Title *</Label>
              <Input value={moduleForm.title} onChange={e => setModuleForm(p => ({...p, title: e.target.value}))} />
            </div>
            <div>
              <Label>Category *</Label>
              <Select onValueChange={v => setModuleForm(p => ({...p, category: v}))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{MODULE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={moduleForm.description} onChange={e => setModuleForm(p => ({...p, description: e.target.value}))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (hours) *</Label>
                <Input type="number" value={moduleForm.duration_hours} onChange={e => setModuleForm(p => ({...p, duration_hours: e.target.value}))} />
              </div>
              <div>
                <Label>Skill Score Boost *</Label>
                <Input type="number" value={moduleForm.skill_score_boost} onChange={e => setModuleForm(p => ({...p, skill_score_boost: e.target.value}))} placeholder="e.g., 15" />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select onValueChange={v => setModuleForm(p => ({...p, difficulty: v}))}>
                  <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Language</Label>
                <Input value={moduleForm.language} onChange={e => setModuleForm(p => ({...p, language: e.target.value}))} placeholder="Hindi/Marathi" />
              </div>
            </div>
            <Button
              onClick={() => {
                setShowUploadModule(false);
                toast({ title: "Module Submitted!", description: "Your training module is under review by BloomPath." });
              }}
              disabled={!moduleForm.title || !moduleForm.category}
              className="w-full btn-primary-glow"
            >
              Submit for Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NGOPortal;
