import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, MapPin, Clock, IndianRupee, Briefcase, Filter,
  Building2, Laptop, AlertCircle, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { jobsApi, applicationsApi } from "@/lib/awsApi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

interface Job {
  jobId: string;
  title: string;
  description: string;
  organizationId: string;
  organizationType: "ngo" | "shg";
  requiredSkills?: string[];
  locationType?: string;
  payPerUnit?: number;
  pieceRate?: number;
  status: string;
  createdAt: string;
}

const Jobs = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsApi.list({ status: "open" });
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast({ title: "Error", description: "Failed to load jobs.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: Job) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to apply.", variant: "destructive" });
      return;
    }
    setApplyingId(job.jobId);
    try {
      await applicationsApi.apply({ jobId: job.jobId });
      toast({ title: "Applied!", description: `Application submitted for "${job.title}".` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Application failed.", variant: "destructive" });
    } finally {
      setApplyingId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation =
      locationFilter === "all" || job.locationType === locationFilter;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">Find Jobs</h1>
              <p className="text-muted-foreground">Browse available opportunities near you</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Location Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-xl border p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                  <div className="h-16 bg-muted rounded mb-4" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.jobId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border p-6 hover:border-primary/50 transition-colors relative"
                >
                  <Badge
                    className="absolute top-4 right-4 text-xs"
                    variant={job.organizationType === "ngo" ? "default" : "secondary"}
                  >
                    {job.organizationType?.toUpperCase()}
                  </Badge>

                  <h3 className="text-lg font-semibold text-foreground mb-1 pr-20">{job.title}</h3>
                  <div className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.organizationType === "ngo" ? "NGO Partner" : "SHG Community"}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.requiredSkills?.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      {job.locationType === "remote" ? <Laptop className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      {job.locationType || "Remote"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <IndianRupee className="w-4 h-4" />
                      {job.payPerUnit || job.pieceRate || 0}/task
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApply(job)}
                      disabled={!user || applyingId === job.jobId}
                      className="btn-primary-glow"
                    >
                      {applyingId === job.jobId ? "Applying..." : "Apply Now"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <div className="container mx-auto px-4 pb-8">
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Community Jobs from SHGs
            </h3>
            <p className="text-muted-foreground text-sm">
              Home-based microjobs in stitching, crafts, food processing and more
            </p>
          </div>
          <a
            href="/shg-portal"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            Browse SHG Jobs →
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Jobs;
