import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
// Migrated: use awsApi instead of Supabase
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Earning {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  job?: { title: string } | null;
}

interface WorkLogWithJob {
  id: string;
  status: string;
  duration_minutes: number | null;
  created_at: string | null;
  job?: { title: string; pay_per_unit: number } | null;
}

const Earnings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLogWithJob[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);

    try {
      // Fetch earnings
      const earningsData: Earning[] = [];

      // Fetch work logs for verified jobs
      const workLogsData: WorkLogWithJob[] = [];

      setEarnings(earningsData || []);
      setWorkLogs(workLogsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Calculate stats from work logs (verified = paid)
  const verifiedWorkLogs = workLogs.filter((w) => w.status === "verified");
  const completedWorkLogs = workLogs.filter((w) => w.status === "completed");
  const inProgressWorkLogs = workLogs.filter((w) => w.status === "in_progress");

  const totalEarned = verifiedWorkLogs.reduce(
    (sum, w) => sum + (w.job?.pay_per_unit || 0),
    0
  );
  const pendingAmount = completedWorkLogs.reduce(
    (sum, w) => sum + (w.job?.pay_per_unit || 0),
    0
  );

  // Calculate monthly earnings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthEarnings = verifiedWorkLogs
    .filter((w) => {
      if (!w.created_at) return false;
      const date = new Date(w.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, w) => sum + (w.job?.pay_per_unit || 0), 0);

  const lastMonthEarnings = verifiedWorkLogs
    .filter((w) => {
      if (!w.created_at) return false;
      const date = new Date(w.created_at);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && date.getFullYear() === year;
    })
    .reduce((sum, w) => sum + (w.job?.pay_per_unit || 0), 0);

  const monthlyGrowth =
    lastMonthEarnings > 0
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
      : thisMonthEarnings > 0
      ? 100
      : 0;

  // Filter transactions based on time
  const filteredLogs = workLogs.filter((log) => {
    if (timeFilter === "all") return true;
    if (!log.created_at) return false;
    const date = new Date(log.created_at);
    const now = new Date();

    if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }
    if (timeFilter === "month") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  });

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Earnings Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track your income and payment history
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {monthlyGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(monthlyGrowth).toFixed(1)}%
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">₹{totalEarned.toLocaleString()}</div>
              <div className="text-primary-foreground/80 text-sm">Total Earned</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">₹{pendingAmount.toLocaleString()}</div>
              <div className="text-muted-foreground text-sm">Pending Verification</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">₹{thisMonthEarnings.toLocaleString()}</div>
              <div className="text-muted-foreground text-sm">This Month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{verifiedWorkLogs.length}</div>
              <div className="text-muted-foreground text-sm">Jobs Completed</div>
            </motion.div>
          </div>

          {/* Transactions List */}
          <div className="bg-card rounded-2xl border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Transaction History</h2>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingData ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center">
                <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete jobs to start earning
                </p>
                <Button onClick={() => navigate("/jobs")} className="btn-primary-glow">
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          log.status === "verified"
                            ? "bg-success/10"
                            : log.status === "completed"
                            ? "bg-primary/10"
                            : "bg-warning/10"
                        }`}
                      >
                        {log.status === "verified" ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : log.status === "completed" ? (
                          <Briefcase className="w-5 h-5 text-primary" />
                        ) : (
                          <Clock className="w-5 h-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{log.job?.title || "Unknown Job"}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {log.created_at
                            ? new Date(log.created_at).toLocaleDateString()
                            : "-"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ₹{log.job?.pay_per_unit || 0}
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          log.status === "verified"
                            ? "bg-success/10 text-success"
                            : log.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {log.status === "verified"
                          ? "Paid"
                          : log.status === "completed"
                          ? "Pending"
                          : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Earnings;