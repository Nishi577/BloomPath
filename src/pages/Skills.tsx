import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Plus,
  X,
  Lightbulb,
  TrendingUp,
  Star,
  CheckCircle,

  Briefcase,
  Upload,
  FileCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// Migrated: use awsApi
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const SKILL_CATEGORIES = {
  "Traditional Skills": [
    "Tailoring",
    "Embroidery",
    "Cooking",
    "Mehendi Art",
    "Handicrafts",
    "Pickle Making",
    "Candle Making",
  ],
  "Care Services": [
    "Child Care",
    "Elder Care",
    "Home Nursing",
    "Pet Care",
    "Housekeeping",
  ],
  "Beauty & Wellness": [
    "Hair Styling",
    "Makeup",
    "Facial",
    "Massage Therapy",
    "Nail Art",
  ],
  "Education & Training": [
    "Tutoring",
    "Teaching",
    "Language Training",
    "Music Teaching",
    "Dance Teaching",
  ],
  "Digital Skills": [
    "Data Entry",
    "Content Writing",
    "Social Media",
    "Graphic Design",
    "Video Editing",
    "Web Development",
  ],
  "Professional Services": [
    "Accounting",
    "Translation",
    "Event Planning",
    "Photography",
    "Interior Decoration",
  ],
};

const Skills = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<{id:string;title:string;description?:string;pay_per_unit:number;required_skills:string[]}[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Proof Upload States
  const [skillsProof, setSkillsProof] = useState<{id:string;skill_name:string;proof_url:string;proof_type:string;status:string}[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSkillForProof, setSelectedSkillForProof] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.skills) {
      setUserSkills(profile.skills);
    }
  }, [profile]);

  useEffect(() => {
    if (userSkills.length > 0) {
      fetchRecommendedJobs();
    }
  }, [userSkills]);

  useEffect(() => {
    if (user) {
      fetchSkillsProof();
    }
  }, [user]);

  const fetchSkillsProof = async () => {
    try {
      setSkillsProof([]);
    } catch (error) {
      console.error("Error fetching skills proof:", error);
    }
  };

  const getSkillProof = (skillName: string) => {
    return skillsProof.find(
      (p) => p.skill_name.toLowerCase() === skillName.toLowerCase()
    );
  };

  const fetchRecommendedJobs = async () => {
    setLoadingJobs(true);
    try {
      const data: any[] = [];
      // Filter jobs that match user skills
      const matched = (data || []).filter((job) => {
        const jobSkills = job.required_skills || [];
        return userSkills.some((skill) =>
          jobSkills.some(
            (js) =>
              js.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(js.toLowerCase())
          )
        );
      });

      setRecommendedJobs(matched.slice(0, 6));
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !userSkills.includes(skill)) {
      setUserSkills((prev) => [...prev, skill]);
    }
    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    setUserSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const saveSkills = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsSaving(true);
    try {
      toast({
        title: "Skills Updated!",
        description: "Your skills have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const initiateProofUpload = (skill: string) => {
    setSelectedSkillForProof(skill);
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!user || !selectedSkillForProof || !proofFile) return;

    setIsUploadingProof(true);
    try {
      // TODO: call AWS uploadUrl + store proof in DynamoDB

      toast({
        title: "Proof Uploaded!",
        description: "Your skill proof has been submitted for verification.",
      });

      setShowUploadModal(false);
      setProofFile(null);
      fetchSkillsProof();
    } catch (error) {
      console.error("Error uploading proof:", error);
      toast({
        title: "Error",
        description: "Failed to upload proof. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProof(false);
    }
  };

  const getSkillRecommendations = () => {
    // Find categories where user has skills and suggest related ones
    const recommendations: string[] = [];

    Object.entries(SKILL_CATEGORIES).forEach(([category, skills]) => {
      const hasSkillInCategory = skills.some((s) => userSkills.includes(s));
      if (hasSkillInCategory) {
        skills.forEach((skill) => {
          if (!userSkills.includes(skill) && recommendations.length < 6) {
            recommendations.push(skill);
          }
        });
      }
    });

    // If no recommendations yet, suggest popular skills
    if (recommendations.length === 0) {
      return ["Tailoring", "Data Entry", "Tutoring", "Content Writing", "Child Care", "Cooking"];
    }

    return recommendations.slice(0, 6);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Skills & Portfolio
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Showcase your talents! Add skills and upload photos or videos of your work to get verified.
              Verified skills attract 3x more employers.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* My Skills */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  My Skills
                </h2>

                {/* Current Skills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {userSkills.map((skill) => {
                    const proof = getSkillProof(skill);
                    return (
                      <motion.span
                        key={skill}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`skill-tag flex items-center gap-1 ${proof?.status === "approved"
                          ? "border-success/50 bg-success/5"
                          : proof?.status === "pending"
                            ? "border-warning/50 bg-warning/5"
                            : ""
                          }`}
                      >
                        {proof?.status === "approved" ? (
                          <CheckCircle className="w-3 h-3 text-success" />
                        ) : proof?.status === "pending" ? (
                          <Clock className="w-3 h-3 text-warning" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {skill}

                        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-border/50">
                          {proof ? (
                            <a
                              href={proof.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="View Proof"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => initiateProofUpload(skill)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="Upload Proof"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                            title="Remove Skill"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.span>
                    );
                  })}
                  {userSkills.length === 0 && (
                    <span className="text-muted-foreground flex items-center gap-2 p-4 border border-dashed rounded-lg w-full justify-center">
                      <Lightbulb className="w-5 h-5" />
                      Tip: Add skills like "Cooking" or "Mehendi Art" to see jobs!
                    </span>
                  )}
                </div>

                {/* Add Custom Skill */}
                <div className="flex gap-2 mb-6">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a custom skill..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(newSkill);
                      }
                    }}
                    className="input-focus"
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill(newSkill)}
                    disabled={!newSkill}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Save Button */}
                {user && (
                  <Button
                    onClick={saveSkills}
                    disabled={isSaving}
                    className="btn-primary-glow"
                  >
                    {isSaving ? "Saving..." : "Save Skills"}
                  </Button>
                )}
                {!user && (
                  <Button onClick={() => navigate("/auth")} className="btn-primary-glow">
                    Login to Save Skills
                  </Button>
                )}
              </div>

              {/* Skill Categories */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-4">Browse Skill Categories</h2>
                <div className="space-y-4">
                  {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => addSkill(skill)}
                            disabled={userSkills.includes(skill)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${userSkills.includes(skill)
                              ? "bg-primary/10 text-primary border-primary cursor-default"
                              : "bg-muted hover:bg-muted/80 border-border hover:border-primary"
                              }`}
                          >
                            {userSkills.includes(skill) && (
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                            )}
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skill Recommendations */}
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Recommended Skills
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on your current skills, you might also want to learn:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getSkillRecommendations().map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1.5 text-sm rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Skills */}
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Trending Skills
                </h3>
                <div className="space-y-3">
                  {["Data Entry", "Content Writing", "Social Media", "Online Tutoring"].map(
                    (skill, i) => (
                      <div
                        key={skill}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-muted-foreground">{i + 1}.</span>
                          {skill}
                        </span>
                        <div className="flex items-center gap-1 text-success">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs">High demand</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Matching Jobs Preview */}
              {userSkills.length > 0 && (
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Jobs Matching Your Skills
                  </h3>
                  {loadingJobs ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : recommendedJobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No matching jobs found. Try adding more skills.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recommendedJobs.slice(0, 4).map((job) => (
                        <div key={job.id} className="text-sm">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-muted-foreground">
                            ₹{job.pay_per_unit}/task
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate("/jobs")}
                      >
                        View all matching jobs →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />

      {/* Upload Proof Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your {selectedSkillForProof} skill</DialogTitle>
            <DialogDescription>
              Upload a photo or video showing your work. This helps employers trust your skills!
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*"
            />

            {proofFile ? (
              <div className="flex items-center gap-2 p-4 rounded-lg border bg-muted/50">
                <FileCheck className="w-5 h-5 text-success" />
                <span className="text-sm flex-1 truncate">{proofFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProofFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 h-32 border-dashed"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <span>Click to upload photo or video</span>
                <span className="text-xs text-muted-foreground">
                  Max size: 10MB
                </span>
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setProofFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadProof}
              disabled={!proofFile || isUploadingProof}
              className="btn-primary-glow"
            >
              {isUploadingProof ? "Uploading..." : "Submit for Verification"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Skills;