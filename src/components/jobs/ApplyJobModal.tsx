import { useState, useRef } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Send, FileCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { applicationsApi, uploadApi } from "@/lib/awsApi";

interface Job {
  jobId?: string;
  id?: string;
  title: string;
  description?: string;
}

interface ApplyJobModalProps {
  open: boolean;
  onClose: () => void;
  job: Job;
}

const ApplyJobModal = ({ open, onClose, job }: ApplyJobModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [workDescription, setWorkDescription] = useState("");
  const [workFile, setWorkFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setWorkFile(file);
  };

  const handleSubmit = async () => {
    if (!user) return;
    const jobId = job.jobId || job.id;
    if (!jobId) return;

    setIsSubmitting(true);
    try {
      let workProofUrl: string | undefined;

      if (workFile) {
        const { uploadUrl, publicUrl } = await uploadApi.getPresignedUrl({
          fileType: workFile.type,
          uploadType: "work_proof",
          fileName: workFile.name,
        });
        await uploadApi.uploadFile(uploadUrl, workFile);
        workProofUrl = publicUrl;
      }

      await applicationsApi.apply({
        jobId,
        coverNote: workDescription || undefined,
      });

      toast({ title: "Application Submitted!", description: "Your application has been sent." });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Application failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for Job</DialogTitle>
          <DialogDescription>{job?.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Cover Note (optional)</Label>
            <Textarea
              placeholder="Describe your relevant experience..."
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Attach Work Sample (optional)</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {workFile ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <FileCheck className="w-4 h-4 text-success" />
                  {workFile.name}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
                  <Upload className="w-6 h-6" />
                  <span>Click to upload</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting || !user} className="w-full btn-primary-glow">
            {isSubmitting ? "Submitting..." : (
              <><Send className="w-4 h-4 mr-2" />Submit Application</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyJobModal;
