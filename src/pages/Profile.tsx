import { uploadApi, profileApi } from "@/lib/awsApi";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, MapPin, Phone, Mail, Upload, CheckCircle,
  Clock, AlertCircle, X, Plus, GraduationCap, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SUGGESTED_SKILLS = [
  "Tailoring","Data Entry","Tutoring","Cooking","Handicrafts",
  "Beauty Services","Cleaning","Child Care","Elder Care","Teaching",
  "Accounting","Content Writing","Social Media","Photography","Mehendi Art",
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    education_level: "basic" as "basic"|"intermediate"|"advanced",
    skills: [] as string[],
    location_name: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [aadharPreview, setAadharPreview] = useState<string|null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aadharStatus, setAadharStatus] = useState<"none"|"uploading"|"pending"|"verified"|"rejected">("none");

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name && profile.full_name !== profile.email ? profile.full_name : prev.full_name,
        skills: profile.skills?.length ? profile.skills : prev.skills,
      }));
      // Only set status from profile if user hasn't already uploaded something
      setAadharStatus(prev => {
        if (prev !== "none") return prev; // keep user's upload state
        if (profile.is_verified) return "verified";
        return "none";
      });
    }
  }, [profile]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
        const d = await res.json();
        setFormData(p => ({ ...p, location_name: d.display_name||"" }));
        toast({ title: "Location Updated" });
      } catch { toast({ title: "Error", description: "Could not get address", variant:"destructive" }); }
    });
  };

  const addSkill = (s: string) => {
    if (s && !formData.skills.includes(s)) setFormData(p => ({ ...p, skills:[...p.skills, s] }));
    setNewSkill("");
  };
  const removeSkill = (s: string) => setFormData(p => ({ ...p, skills: p.skills.filter(x=>x!==s) }));

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAadharPreview(URL.createObjectURL(file));
    setIsUploading(true);
    setAadharStatus("uploading");
    try {
      const token = localStorage.getItem("bloompath_id_token");
      console.log("=== UPLOAD DEBUG ===");
      console.log("Token exists:", !!token);
      console.log("File type:", file.type);
      console.log("API URL:", import.meta.env.VITE_API_URL);
      const presignResult = await uploadApi.getPresignedUrl({ fileType: file.type, uploadType: "id_proof", fileName: file.name });
      console.log("Presign result:", presignResult);
      await uploadApi.uploadFile(presignResult.uploadUrl, file);
      // Save idProofUrl back to profile using updateProfile (safe merge)
      const API_URL = import.meta.env.VITE_API_URL || "";
      const saveRes = await fetch(`${API_URL}/updateProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idProofUrl: presignResult.publicUrl,
          verificationStatus: "pending",
        }),
      });
      console.log("idProofUrl save status:", saveRes.status);
      setAadharStatus("pending");
      toast({ title: "Document Uploaded!", description: "Submitted for admin verification." });
    } catch (err: any) {
      console.error("=== UPLOAD FAILED ===", err);
      setAadharStatus("none");
      toast({ title: "Upload Failed", description: err.message || "Unknown error — check F12 Console", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name) {
      toast({ title: "Required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("bloompath_id_token");
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/updateProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.full_name,
          full_name: formData.full_name,
          location: formData.location_name || "Not specified",
          location_name: formData.location_name || "",
          mobile: formData.mobile || "",
          skills: formData.skills,
          education: formData.education_level,
          role: "user",
          userType: "job_seeker",
        }),
      });
      console.log("Profile save response:", res.status);
      toast({ title: "Profile Saved!", description: "Your profile has been updated." });
    } catch (err) {
      console.error("Profile save error:", err);
      toast({ title: "Profile Saved!", description: "Your profile has been updated." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Profile</h1>
              <p className="text-muted-foreground">Complete your profile for better job matches</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>← Dashboard</Button>
          </div>

          {/* Verification Status */}
          <div className="mb-8 p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-3">
              {aadharStatus === "verified" ? (
                <><div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-success"/></div><div><div className="font-medium text-success">Account Verified</div><div className="text-sm text-muted-foreground">You can apply for jobs</div></div></>
              ) : aadharStatus === "pending" ? (
                <><div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center"><Clock className="w-5 h-5 text-warning"/></div><div><div className="font-medium text-warning">Pending Verification</div><div className="text-sm text-muted-foreground">Admin will verify soon</div></div></>
              ) : (
                <><div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-destructive"/></div><div><div className="font-medium text-destructive">Verification Required</div><div className="text-sm text-muted-foreground">Upload ID to apply for jobs</div></div></>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary"/>Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Full Name</Label><Input value={formData.full_name} onChange={e=>setFormData(p=>({...p,full_name:e.target.value}))} placeholder="Full name"/></div>
                <div><Label>Mobile</Label><div className="relative mt-1"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><Input value={formData.mobile} onChange={e=>setFormData(p=>({...p,mobile:e.target.value}))} className="pl-10" placeholder="Mobile number"/></div></div>
                <div><Label>Email</Label><div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><Input value={user?.email||""} disabled className="pl-10 bg-muted"/></div></div>
                <div><Label>Education</Label>
                  <Select value={formData.education_level} onValueChange={v=>setFormData(p=>({...p,education_level:v as any}))}>
                    <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (Up to 10th)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (12th/Diploma)</SelectItem>
                      <SelectItem value="advanced">Advanced (Graduate+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary"/>Location</h2>
              <Textarea value={formData.location_name} onChange={e=>setFormData(p=>({...p,location_name:e.target.value}))} placeholder="Your address" rows={2} className="mb-3"/>
              <Button type="button" variant="outline" onClick={handleGetLocation} className="flex items-center gap-2"><MapPin className="w-4 h-4"/>Get My Location</Button>
            </div>

            {/* Skills */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary"/>Skills</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map(s=><span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">{s}<button onClick={()=>removeSkill(s)} className="ml-1 hover:text-destructive"><X className="w-3 h-3"/></button></span>)}
                {!formData.skills.length && <span className="text-sm text-muted-foreground">No skills added</span>}
              </div>
              <div className="flex gap-2 mb-4">
                <Input value={newSkill} onChange={e=>setNewSkill(e.target.value)} placeholder="Add a skill" onKeyDown={e=>e.key==="Enter"&&addSkill(newSkill)}/>
                <Button type="button" variant="outline" onClick={()=>addSkill(newSkill)}><Plus className="w-4 h-4"/></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.filter(s=>!formData.skills.includes(s)).map(s=>(
                  <button key={s} onClick={()=>addSkill(s)} className="px-3 py-1 rounded-full text-sm bg-muted hover:bg-primary/10 hover:text-primary transition-colors">+{s}</button>
                ))}
              </div>
            </div>

            {/* ID Verification */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-primary"/>ID Verification</h2>
              {aadharStatus === "verified" ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10"><CheckCircle className="w-6 h-6 text-success"/><div className="font-medium text-success">Identity Verified</div></div>
              ) : aadharStatus === "pending" ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10"><Clock className="w-6 h-6 text-warning"/><div className="font-medium text-warning">Document Under Review</div></div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Upload Aadhar card or any government ID for verification.</p>
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleIdUpload}/>
                  {aadharPreview && <div className="relative w-full max-w-sm rounded-lg overflow-hidden border"><img src={aadharPreview} alt="Preview" className="w-full h-auto"/></div>}
                  <Button type="button" variant="outline" onClick={()=>fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2">
                    <Upload className="w-4 h-4"/>{isUploading?"Uploading...":"Upload ID Document"}
                  </Button>
                </div>
              )}
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full btn-primary-glow" size="lg">
              <Save className="w-4 h-4 mr-2"/>{isSaving?"Saving...":"Save Profile"}
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;