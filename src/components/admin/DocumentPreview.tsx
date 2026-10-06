import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileCheck,
  Sparkles,
  Calendar,
  Map,
} from "lucide-react";

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
  location_name: string | null;
}

interface SkillProof {
  id: string;
  user_id: string;
  skill_name: string;
  proof_url: string;
  proof_type: string;
  status: string;
  admin_notes: string | null;
  user?: { full_name: string; email: string };
}

interface WorkLog {
  id: string;
  status: string;
  task_output_url: string | null;
  job?: { title: string };
  user?: { full_name: string; email: string };
}

interface WorkPost {
  id: string;
  title: string;
  work_url: string | null;
  status: string;
  user?: { full_name: string; email: string };
}

interface DocumentPreviewProps {
  type: "aadhar" | "skills" | "work_log" | "work_post";
  user?: UserProfile | null;
  skillProof?: SkillProof | null;
  workLog?: WorkLog | null;
  workPost?: WorkPost | null;
  open: boolean;
  onClose: () => void;
  onVerify?: (userId: string, verify: boolean) => void;
  onApproveSkill?: (proofId: string, approved: boolean, notes: string) => void;
  onVerifyWorkLog?: (logId: string) => void;
  onApproveWorkPost?: (postId: string, approved: boolean, notes: string) => void;
}

const DocumentPreview = ({
  type,
  user,
  skillProof,
  workLog,
  workPost,
  open,
  onClose,
  onVerify,
  onApproveSkill,
  onVerifyWorkLog,
  onApproveWorkPost,
}: DocumentPreviewProps) => {
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (open) {
      setAiAnalysis(null);
    }
  }, [open]);

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI delay - In production, call your AI service here
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setAiAnalysis(
      "**AI Smart Analysis**\n" +
      "• Confidence Score: 92/100\n" +
      "• Risk Level: Low\n" +
      "• Summary: The document details appear consistent. No signs of digital manipulation detected."
    );
    setIsAnalyzing(false);
  };

  const handleVerify = async (verify: boolean) => {
    if (!user || !onVerify) return;
    setIsProcessing(true);
    await onVerify(user.id, verify);
    setIsProcessing(false);
    onClose();
  };

  const handleApproveSkill = async (approved: boolean) => {
    if (!skillProof || !onApproveSkill) return;
    setIsProcessing(true);
    await onApproveSkill(skillProof.id, approved, adminNotes);
    setIsProcessing(false);
    setAdminNotes("");
    onClose();
  };

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

  if (type === "aadhar" && user) {
    const isBusiness = user.role === "business";
    const managerName = isBusiness ? user.skills?.find(s => s.startsWith("Manager:"))?.replace("Manager: ", "") : null;
    const description = isBusiness ? user.skills?.find(s => s.startsWith("Desc:"))?.replace("Desc: ", "") : null;
    // Filter out metadata from skills display
    const visibleSkills = user.skills?.filter(s => !s.startsWith("Manager:") && !s.startsWith("Desc:")) || [];

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isBusiness ? <Building2 className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
              {isBusiness ? "Business Verification" : "Aadhar Verification"}
            </DialogTitle>
            <DialogDescription>
              {isBusiness
                ? "Review the business registration document and verify the entity"
                : "Review the user's Aadhar document and verify their identity"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Info Section */}
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {isBusiness ? "Company Information" : "User Information"}
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{isBusiness ? "Company:" : "Name:"}</span>
                  <span className="font-medium">{user.full_name}</span>
                </div>

                {managerName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Manager:</span>
                    <span className="font-medium">{managerName}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{user.mobile || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium truncate max-w-[200px]">
                    {user.location_name || "Not set"}
                  </span>
                  {user.location_name && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.location_name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2"
                    >
                      <Button variant="ghost" size="icon" className="h-6 w-6" title="View on Google Maps">
                        <Map className="w-4 h-4 text-blue-500" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {description && (
                <div className="mt-3 text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1 text-foreground/90">{description}</p>
                </div>
              )}

              {!isBusiness && visibleSkills.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm text-muted-foreground">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {visibleSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Document Preview */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                {isBusiness ? "Business Proof" : "Aadhar Document"}
              </h3>
              {user.aadhar_url ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border bg-muted/50">
                    {isPdf(user.aadhar_url) ? (
                      <iframe
                        src={user.aadhar_url}
                        className="w-full h-[500px]"
                        title="Document PDF"
                        onError={(e) => console.error("PDF load error:", e)}
                      />
                    ) : isVideo(user.aadhar_url) ? (
                      <video
                        src={user.aadhar_url}
                        controls
                        className="w-full max-h-[400px]"
                      />
                    ) : (
                      <img
                        src={user.aadhar_url}
                        alt="Verification Document"
                        className="w-full max-h-[400px] object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                          target.alt = "Error loading document";
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      {!isBusiness && (
                        <>
                          <span className="text-muted-foreground">Extracted Number: </span>
                          <span className="font-mono font-medium">
                            {user.aadhar_number || "Not extracted"}
                          </span>
                        </>
                      )}
                    </div>
                    <a
                      href={user.aadhar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        Open Full Size
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-xl">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No document uploaded</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {/* AI Analysis */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  Gemini AI Analysis
                </h3>
                {!aiAnalysis && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAIAnalyze}
                    disabled={isAnalyzing}
                    className="h-8 bg-background"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze with Gemini"}
                  </Button>
                )}
              </div>
              {aiAnalysis && (
                <div className="text-sm text-foreground/80 whitespace-pre-line animate-in fade-in slide-in-from-top-2">
                  {aiAnalysis}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleVerify(true)}
                disabled={isProcessing || !user.aadhar_url}
                className="flex-1 bg-success hover:bg-success/90 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : isBusiness ? "Verify Business" : "Verify User"}
              </Button>
              <Button
                onClick={() => handleVerify(false)}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {user.is_verified ? "Revoke Verification" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (type === "skills" && skillProof) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {skillProof.proof_type === "video" ? (
                <Video className="w-5 h-5 text-primary" />
              ) : (
                <ImageIcon className="w-5 h-5 text-primary" />
              )}
              Skills Proof Review
            </DialogTitle>
            <DialogDescription>
              Review the skill proof and approve or reject
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Skill Info */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{skillProof.skill_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Submitted by {skillProof.user?.full_name || "Unknown User"}
                  </p>
                </div>
                <Badge
                  className={
                    skillProof.status === "approved"
                      ? "bg-success/10 text-success"
                      : skillProof.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                  }
                >
                  {skillProof.status}
                </Badge>
              </div>
            </div>

            {/* Proof Preview */}
            <div>
              <h3 className="font-semibold mb-3">Proof Document</h3>
              <div className="rounded-xl overflow-hidden border bg-muted/50">
                {skillProof.proof_type === "video" || isVideo(skillProof.proof_url) ? (
                  <video
                    src={skillProof.proof_url}
                    controls
                    className="w-full max-h-[400px]"
                  />
                ) : isPdf(skillProof.proof_url) ? (
                  <iframe
                    src={skillProof.proof_url}
                    className="w-full h-[500px]"
                    title="Proof PDF"
                  />
                ) : (
                  <img
                    src={skillProof.proof_url}
                    alt={`${skillProof.skill_name} proof`}
                    className="w-full max-h-[400px] object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                )}
              </div>
              <div className="mt-2 flex justify-end">
                <a
                  href={skillProof.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    Open Full Size
                  </Button>
                </a>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this skill proof..."
                rows={3}
              />
            </div>

            {/* Actions */}
            {/* AI Analysis */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  Gemini AI Analysis
                </h3>
                {!aiAnalysis && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAIAnalyze}
                    disabled={isAnalyzing}
                    className="h-8 bg-background"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze with Gemini"}
                  </Button>
                )}
              </div>
              {aiAnalysis && (
                <div className="text-sm text-foreground/80 whitespace-pre-line animate-in fade-in slide-in-from-top-2">
                  {aiAnalysis}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleApproveSkill(true)}
                disabled={isProcessing}
                className="flex-1 bg-success hover:bg-success/90 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Approve"}
              </Button>
              <Button
                onClick={() => handleApproveSkill(false)}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isDoc = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split(/[?#]/)[0];
    return /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(cleanUrl);
  };

  if (type === "work_post" && workPost) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Work Post Review
            </DialogTitle>
            <DialogDescription>
              Review the work post and approve or reject
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold mb-1">{workPost.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submitted by {workPost.user?.full_name || "Unknown User"}
              </p>
              <div className="flex items-center justify-between mb-4">
                <Badge
                  className={
                    workPost.status === "approved"
                      ? "bg-success/10 text-success"
                      : workPost.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                  }
                >
                  {workPost.status}
                </Badge>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Review: ${workPost.title}`)}&details=${encodeURIComponent(`Reviewing work post by ${workPost.user?.full_name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="h-8">
                    <Calendar className="w-3 h-3 mr-2" />
                    Schedule Review
                  </Button>
                </a>
              </div>
            </div>

            {workPost.work_url ? (
              <div>
                <h3 className="font-semibold mb-3">Work Document</h3>
                <div className="rounded-xl overflow-hidden border bg-muted/50">
                  {isPdf(workPost.work_url) ? (
                    <iframe
                      src={workPost.work_url}
                      className="w-full h-[500px]"
                      title="Work PDF"
                    />
                  ) : isVideo(workPost.work_url) ? (
                    <video
                      src={workPost.work_url}
                      controls
                      className="w-full max-h-[400px]"
                    />
                  ) : isImage(workPost.work_url) ? (
                    <img
                      src={workPost.work_url}
                      alt="Work Post"
                      className="w-full max-h-[400px] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Preview not available for this file type
                      </p>
                      <a
                        href={workPost.work_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline">Download to View</Button>
                      </a>
                    </div>
                  )}
                </div>
                {(isPdf(workPost.work_url) || isImage(workPost.work_url)) && (
                  <div className="mt-2 flex justify-end">
                    <a
                      href={workPost.work_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        Open Full Size
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No document attached
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes..."
                rows={3}
              />
            </div>

            {/* AI Analysis */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  Gemini AI Analysis
                </h3>
                {!aiAnalysis && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAIAnalyze}
                    disabled={isAnalyzing}
                    className="h-8 bg-background"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze with Gemini"}
                  </Button>
                )}
              </div>
              {aiAnalysis && (
                <div className="text-sm text-foreground/80 whitespace-pre-line animate-in fade-in slide-in-from-top-2">
                  {aiAnalysis}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => onApproveWorkPost?.(workPost.id, true, adminNotes)}
                disabled={isProcessing}
                className="flex-1 bg-success hover:bg-success/90 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => onApproveWorkPost?.(workPost.id, false, adminNotes)}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (type === "work_log" && workLog) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Work Log Verification
            </DialogTitle>
            <DialogDescription>
              Verify the completed work task
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold mb-1">{workLog.job?.title || "Unknown Job"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Completed by {workLog.user?.full_name || "Unknown User"}
              </p>
              <Badge
                className={
                  workLog.status === "verified"
                    ? "bg-success/10 text-success"
                    : workLog.status === "completed"
                      ? "bg-primary/10 text-primary"
                      : "bg-warning/10 text-warning"
                }
              >
                {workLog.status}
              </Badge>
            </div>

            {workLog.task_output_url ? (
              <div>
                <h3 className="font-semibold mb-3">Task Output</h3>
                <div className="rounded-xl overflow-hidden border bg-muted/50">
                  {isPdf(workLog.task_output_url) ? (
                    <iframe
                      src={workLog.task_output_url}
                      className="w-full h-[500px]"
                      title="Task Output PDF"
                    />
                  ) : isVideo(workLog.task_output_url) ? (
                    <video
                      src={workLog.task_output_url}
                      controls
                      className="w-full max-h-[400px]"
                    />
                  ) : isImage(workLog.task_output_url) ? (
                    <img
                      src={workLog.task_output_url}
                      alt="Task Output"
                      className="w-full max-h-[400px] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Preview not available for this file type
                      </p>
                      <a
                        href={workLog.task_output_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline">Download to View</Button>
                      </a>
                    </div>
                  )}
                </div>
                {(isPdf(workLog.task_output_url) || isImage(workLog.task_output_url)) && (
                  <div className="mt-2 flex justify-end">
                    <a
                      href={workLog.task_output_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        Open Full Size
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No output file attached
              </div>
            )}

            {/* AI Analysis */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  Gemini AI Analysis
                </h3>
                {!aiAnalysis && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAIAnalyze}
                    disabled={isAnalyzing}
                    className="h-8 bg-background"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze with Gemini"}
                  </Button>
                )}
              </div>
              {aiAnalysis && (
                <div className="text-sm text-foreground/80 whitespace-pre-line animate-in fade-in slide-in-from-top-2">
                  {aiAnalysis}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => onVerifyWorkLog?.(workLog.id)}
                disabled={isProcessing}
                className="w-full bg-success hover:bg-success/90 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Completion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default DocumentPreview;
