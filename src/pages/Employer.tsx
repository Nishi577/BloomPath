import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  IndianRupee,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { jobsApi } from "@/lib/awsApi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";



type Job = {
  id: string;
  title: string;
  description: string;
  location_type: "remote" | "onsite" | "hybrid";
  location_name?: string;
  required_skills: string[];
  pay_per_unit: number;
  task_duration_hours: number;
  status: "open" | "closed";
  employer_id: string;
};

type WorkLog = {
  id: string;
  status: string;
  task_output_url?: string;
  user?: { full_name: string; email: string; skills: string[] };
};

const SKILL_OPTIONS = [
  "Tailoring",
  "Data Entry",
  "Tutoring",
  "Cooking",
  "Handicrafts",
  "Beauty Services",
  "Cleaning",
  "Child Care",
  "Elder Care",
  "Teaching",
  "Accounting",
  "Content Writing",
  "Social Media",
  "Photography",
  "Mehendi Art",
];

const Employer = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<WorkLog[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    location_type: "remote" as "remote" | "onsite" | "hybrid",
    location_name: "",
    required_skills: [] as string[],
    pay_per_unit: "",
    task_duration_hours: "1",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    setLoadingJobs(true);
    try {
      const data = await jobsApi.list({ status: "open" });
      const myJobs = (data.jobs || [])
        .filter((j: any) => j.organizationId === user.sub)
        .map((j: any) => ({
          id: j.jobId,
          title: j.title,
          description: j.description || "",
          location_type: j.locationType || "remote",
          location_name: j.locationName || "",
          required_skills: j.requiredSkills || [],
          pay_per_unit: j.workerRate || j.ratePerPiece || j.payPerUnit || 0,
          task_duration_hours: 1,
          status: j.status || "open",
          employer_id: j.organizationId,
        }));
      setJobs(myJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplicants = async (jobId: string) => {
    try {
      const { data, error } = { data: [], error: null };

      if (error) throw error;
      setApplicants(data || []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const handleCreateJob = async () => {
    if (!user) return;
    if (!jobForm.title || !jobForm.pay_per_unit) {
      toast({ title: "Required", description: "Title and pay rate are required.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      await jobsApi.create({
        title: jobForm.title,
        description: jobForm.description,
        organizationType: "shg",
        requiredSkills: jobForm.required_skills,
        locationType: jobForm.location_type,
        payPerUnit: parseFloat(jobForm.pay_per_unit as string),
      });
      toast({ title: "Job Posted!", description: "Your job listing is now live." });
      setShowCreateModal(false);
      setJobForm({ title: "", description: "", location_type: "remote", location_name: "", required_skills: [], pay_per_unit: "", task_duration_hours: "1" });
      fetchJobs();
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast({ title: "Error", description: error.message || "Failed to create job.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = { error: null };
      if (error) throw error;

      toast({ title: "Job Deleted" });
      fetchJobs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyWork = async (workLogId: string) => {
    try {
      const { error } = { error: null };

      if (error) throw error;

      toast({ title: "Work Verified!" });
      if (selectedJob) {
        fetchApplicants(selectedJob.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify work.",
        variant: "destructive",
      });
    }
  };

  const viewApplicants = (job: Job) => {
    setSelectedJob(job);
    fetchApplicants(job.id);
    setShowApplicantsModal(true);
  };

  const addSkill = (skill: string) => {
    if (!jobForm.required_skills.includes(skill)) {
      setJobForm((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, skill],
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setJobForm((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skill),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Employer Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your job listings and view applicants
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary-glow mt-4 md:mt-0 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                  <div className="text-sm text-muted-foreground">Total Jobs</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {jobs.filter((j) => j.status === "open").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          {loadingJobs ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="job-card animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-16 bg-muted rounded mb-4" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Jobs Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first job listing to find talented workers
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="job-card relative">
                  <Badge
                    className={
                      job.status === "open"
                        ? "bg-success/10 text-success absolute top-4 right-4"
                        : "bg-muted text-muted-foreground absolute top-4 right-4"
                    }
                  >
                    {job.status}
                  </Badge>

                  <h3 className="text-lg font-semibold text-foreground mb-2 pr-16">
                    {job.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location_type}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.task_duration_hours}h
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {job.pay_per_unit}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewApplicants(job)}
                      className="flex-1 flex items-center gap-1"
                    >
                      <Users className="w-4 h-4" />
                      Applicants
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />

      {/* Create Job Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>
              Fill in the details to create a job listing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={jobForm.title}
                onChange={(e) =>
                  setJobForm({ ...jobForm, title: e.target.value })
                }
                placeholder="e.g., Home Tutoring for Class 5"
                className="mt-1 input-focus"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={jobForm.description}
                onChange={(e) =>
                  setJobForm({ ...jobForm, description: e.target.value })
                }
                placeholder="Describe the job requirements..."
                className="mt-1 input-focus"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location Type</Label>
                <Select
                  value={jobForm.location_type}
                  onValueChange={(value) =>
                    setJobForm({
                      ...jobForm,
                      location_type: value as "remote" | "onsite" | "hybrid",
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {jobForm.location_type !== "remote" && (
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={jobForm.location_name}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, location_name: e.target.value })
                    }
                    placeholder="City, Area"
                    className="mt-1 input-focus"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pay">Pay per Task (₹)</Label>
                <Input
                  id="pay"
                  type="number"
                  value={jobForm.pay_per_unit}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, pay_per_unit: e.target.value })
                  }
                  placeholder="500"
                  className="mt-1 input-focus"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={jobForm.task_duration_hours}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      task_duration_hours: e.target.value,
                    })
                  }
                  placeholder="1"
                  className="mt-1 input-focus"
                />
              </div>
            </div>

            <div>
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {jobForm.required_skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.filter(
                  (s) => !jobForm.required_skills.includes(s)
                ).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-2 py-1 rounded text-xs bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateJob}
              disabled={isCreating || !jobForm.title || !jobForm.pay_per_unit}
              className="btn-primary-glow"
            >
              {isCreating ? "Creating..." : "Post Job"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Applicants Modal */}
      <Dialog open={showApplicantsModal} onOpenChange={setShowApplicantsModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicants for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Review and verify submitted work from applicants
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {applicants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No applicants yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="p-4 rounded-xl border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">
                          {applicant.user?.full_name || "Anonymous"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {applicant.user?.email}
                        </p>
                      </div>
                      <Badge
                        className={
                          applicant.status === "verified"
                            ? "bg-success/10 text-success"
                            : applicant.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {applicant.status}
                      </Badge>
                    </div>

                    {applicant.user?.skills && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {applicant.user.skills.slice(0, 5).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {applicant.task_output_url && (
                      <a
                        href={applicant.task_output_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mb-3"
                      >
                        <Eye className="w-4 h-4" />
                        View Submitted Work
                      </a>
                    )}

                    {applicant.status !== "verified" && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyWork(applicant.id)}
                        className="btn-primary-glow"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verify Work
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employer;