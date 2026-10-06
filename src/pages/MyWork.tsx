import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Clock,
  CheckCircle,
  Upload,
  FileCheck,
  Eye,
  Calendar,
  IndianRupee,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { microJobApi, uploadApi } from "@/lib/awsApi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


type WorkLog = {
  id: string;
  status: string;
  job_id: string;
  user_id: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  task_output_url?: string;
  created_at?: string;
  job?: {
    id: string;
    title: string;
    description: string;
    pay_per_unit: number;
  };
};

const MyWork = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingLog, setViewingLog] = useState<WorkLog | null>(null);

  const isImage = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split(/[?#]/)[0];
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl);
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split(/[?#]/)[0];
    return /\.(mp4|webm|ogg|mov)$/i.test(cleanUrl);
  };

  const isPdf = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split(/[?#]/)[0];
    return /\.(pdf)$/i.test(cleanUrl);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWorkLogs();
    }
  }, [user]);

  const fetchWorkLogs = async () => {
    if (!user) return;
    setLoadingLogs(true);
    try {
      const data = await microJobApi.getWorkerTasks();
      setWorkLogs(data.tasks || []);
    } catch (error) {
      console.error("Error fetching work logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadWork = async () => {
    if (!user || !selectedLog || !uploadFile) return;

    setIsUploading(true);
    try {
      const { uploadUrl, publicUrl } = await uploadApi.getPresignedUrl({
        fileType: uploadFile.type,
        uploadType: "work_proof",
        fileName: uploadFile.name,
      });
      await uploadApi.uploadFile(uploadUrl, uploadFile);
      await microJobApi.completeTask({
        applicationId: selectedLog.id,
        piecesCompleted: 1,
        proofUrl: publicUrl,
      });

      toast({
        title: "Work Submitted!",
        description: "Your work has been submitted for employer review.",
      });

      setShowUploadModal(false);
      setUploadFile(null);
      setSelectedLog(null);
      fetchWorkLogs();
    } catch (error) {
      console.error("Error uploading work:", error);
      toast({
        title: "Error",
        description: "Failed to submit work. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openUploadModal = (log: WorkLog) => {
    setSelectedLog(log);
    setShowUploadModal(true);
  };

  const stats = {
    inProgress: workLogs.filter((w) => w.status === "in_progress").length,
    completed: workLogs.filter((w) => w.status === "completed").length,
    verified: workLogs.filter((w) => w.status === "verified").length,
    totalEarnings: workLogs
      .filter((w) => w.status === "verified")
      .reduce((sum, w) => sum + (w.job?.pay_per_unit || 0), 0),
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
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            My Work
          </h1>
          <p className="text-muted-foreground mb-8">
            Track your applications and submit completed work
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">
                    In Progress
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Submitted</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.verified}</div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">₹{stats.totalEarnings}</div>
                  <div className="text-sm text-muted-foreground">Earned</div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Logs */}
          {loadingLogs ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="job-card animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-16 bg-muted rounded mb-4" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : workLogs.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Work Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start applying for jobs to track your work here
              </p>
              <Button
                onClick={() => navigate("/jobs")}
                className="btn-primary-glow"
              >
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workLogs.map((log) => (
                <div key={log.id} className="job-card relative">
                  <Badge
                    className={`absolute top-4 right-4 ${log.status === "verified"
                        ? "bg-success/10 text-success"
                        : log.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : "bg-warning/10 text-warning"
                      }`}
                  >
                    {log.status === "in_progress"
                      ? "In Progress"
                      : log.status === "completed"
                        ? "Submitted"
                        : "Verified"}
                  </Badge>

                  <h3 className="text-lg font-semibold text-foreground mb-2 pr-24">
                    {log.job?.title || "Unknown Job"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {log.job?.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {log.start_time
                        ? new Date(log.start_time).toLocaleDateString()
                        : "-"}
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {log.job?.pay_per_unit || 0}
                    </div>
                  </div>

                  {log.status === "in_progress" ? (
                    <Button
                      onClick={() => openUploadModal(log)}
                      className="w-full btn-primary-glow flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Submit Work
                    </Button>
                  ) : log.task_output_url ? (
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => setViewingLog(log)}
                    >
                      <Eye className="w-4 h-4" />
                      View Submitted Work
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />

      {/* Upload Work Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Your Work</DialogTitle>
            <DialogDescription>
              Upload your completed work for {selectedLog?.job?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />

            {uploadFile ? (
              <div className="flex items-center gap-2 p-4 rounded-lg border bg-muted/50">
                <FileCheck className="w-5 h-5 text-success" />
                <span className="text-sm flex-1 truncate">{uploadFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 h-24 border-dashed"
              >
                <Upload className="w-5 h-5" />
                Click to upload your work
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Accepted: Images, PDF, DOC (max 10MB)
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadWork}
              disabled={!uploadFile || isUploading}
              className="btn-primary-glow"
            >
              {isUploading ? "Uploading..." : "Submit Work"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Work Modal */}
      <Dialog open={!!viewingLog} onOpenChange={() => setViewingLog(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{viewingLog?.job?.title} - Submitted Work</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {viewingLog?.task_output_url && (
              <div className="rounded-xl overflow-hidden border bg-muted/50">
                {isPdf(viewingLog.task_output_url) ? (
                  <iframe src={viewingLog.task_output_url} className="w-full h-[400px]" title="Work PDF" />
                ) : isVideo(viewingLog.task_output_url) ? (
                  <video src={viewingLog.task_output_url} controls className="w-full max-h-[400px]" />
                ) : (
                  <img src={viewingLog.task_output_url} alt="Work" className="w-full max-h-[400px] object-contain mx-auto" />
                )}
              </div>
            )}
            <div className="mt-4 flex justify-between items-center">
              <Badge className={
                viewingLog?.status === "verified" ? "bg-success/10 text-success" :
                  viewingLog?.status === "completed" ? "bg-primary/10 text-primary" :
                    "bg-warning/10 text-warning"
              }>
                {viewingLog?.status}
              </Badge>
              {viewingLog?.task_output_url && (
                <a href={viewingLog.task_output_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" />
                  Open in original quality
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyWork;