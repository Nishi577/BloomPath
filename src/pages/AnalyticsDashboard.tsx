import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, IndianRupee, CheckCircle, Users,
  Target, Star, Clock, ArrowUpRight, Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const WEEKLY_DATA = [
  { week: "Feb W1", tasks: 2, earnings: 400, quality: 88 },
  { week: "Feb W2", tasks: 4, earnings: 800, quality: 92 },
  { week: "Feb W3", tasks: 3, earnings: 600, quality: 90 },
  { week: "Feb W4", tasks: 5, earnings: 940, quality: 95 },
  { week: "Mar W1", tasks: 6, earnings: 1200, quality: 93 },
  { week: "Mar W2", tasks: 4, earnings: 800, quality: 91 },
];

const EMPLOYER_WEEKLY = [
  { week: "Feb W1", workers: 3, pieces: 180, paid: 18000 },
  { week: "Feb W2", workers: 5, pieces: 320, paid: 32000 },
  { week: "Feb W3", workers: 8, pieces: 480, paid: 48000 },
  { week: "Feb W4", workers: 9, pieces: 520, paid: 52000 },
  { week: "Mar W1", workers: 11, pieces: 640, paid: 64000 },
  { week: "Mar W2", workers: 10, pieces: 580, paid: 58000 },
];

const ADMIN_STATS = [
  { label: "Total Users", value: "1,247", change: "+18%", icon: Users, color: "text-primary" },
  { label: "Active Jobs", value: "42", change: "+5%", icon: Target, color: "text-success" },
  { label: "Total Earnings Paid", value: "₹2.4L", change: "+23%", icon: IndianRupee, color: "text-warning" },
  { label: "Completion Rate", value: "87%", change: "+2%", icon: CheckCircle, color: "text-success" },
];

const AnalyticsDashboard = () => {
  const { user, profile } = useAuth();
  const [roleView, setRoleView] = useState<"job_seeker" | "employer" | "admin">("job_seeker");
  const [timeRange, setTimeRange] = useState("6weeks");

  const maxEarnings = Math.max(...WEEKLY_DATA.map(d => d.earnings));
  const maxPaid = Math.max(...EMPLOYER_WEEKLY.map(d => d.paid));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-primary" /> Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">Performance metrics and insights</p>
            </div>
            <div className="flex gap-3">
              <Select value={roleView} onValueChange={v => setRoleView(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_seeker">Job Seeker</SelectItem>
                  <SelectItem value="employer">Employer / SHG</SelectItem>
                  <SelectItem value="admin">Admin View</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4weeks">4 Weeks</SelectItem>
                  <SelectItem value="6weeks">6 Weeks</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Job Seeker View ── */}
          {roleView === "job_seeker" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Lifetime Earnings", value: "₹5,040", change: "+12%", icon: IndianRupee, bg: "bg-primary text-primary-foreground" },
                  { label: "Weekly Earnings", value: "₹940", change: "+18%", icon: TrendingUp, bg: "bg-card" },
                  { label: "Tasks Completed", value: "8", change: "+2", icon: CheckCircle, bg: "bg-card" },
                  { label: "Tasks Pending", value: "2", change: "", icon: Clock, bg: "bg-card" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl border p-6 ${stat.bg}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stat.bg.includes("primary") ? "bg-white/20" : "bg-primary/10"
                      }`}>
                        <stat.icon className={`w-5 h-5 ${stat.bg.includes("primary") ? "text-white" : "text-primary"}`} />
                      </div>
                      {stat.change && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <ArrowUpRight className="w-3 h-3" />{stat.change}
                        </span>
                      )}
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${stat.bg.includes("primary") ? "text-white" : ""}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm ${stat.bg.includes("primary") ? "text-white/70" : "text-muted-foreground"}`}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Weekly Earnings Bar Chart */}
              <div className="bg-card border rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Weekly Earnings
                </h3>
                <div className="flex items-end gap-3 h-40">
                  {WEEKLY_DATA.map((d, i) => (
                    <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground font-medium">₹{(d.earnings / 1000).toFixed(1)}k</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.earnings / maxEarnings) * 120}px` }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="w-full rounded-t-lg bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
                        title={`₹${d.earnings}`}
                      />
                      <span className="text-xs text-muted-foreground">{d.week.replace("Feb ", "B").replace("Mar ", "M")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output Quality + Tasks */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="font-bold mb-4">Output Quality Score</h3>
                  <div className="space-y-3">
                    {WEEKLY_DATA.map(d => (
                      <div key={d.week} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-16">{d.week.replace("Feb ", "B").replace("Mar ", "M")}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${d.quality}%` }} />
                        </div>
                        <span className="text-sm font-medium">{d.quality}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="font-bold mb-4">Task Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Blouse Stitching – 23 pcs", status: "Paid", amount: "₹2,300", color: "text-success" },
                      { label: "Papad Rolling – 47 pcs", status: "Paid", amount: "₹940", color: "text-success" },
                      { label: "Embroidery Work – 12 pcs", status: "Pending", amount: "₹1,800", color: "text-warning" },
                    ].map(t => (
                      <div key={t.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <div className="text-sm font-medium">{t.label}</div>
                          <div className={`text-xs ${t.color}`}>{t.status}</div>
                        </div>
                        <span className="font-semibold">{t.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Employer View ── */}
          {roleView === "employer" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Workers Engaged", value: "11", icon: Users, color: "text-primary" },
                  { label: "Pieces Completed", value: "2,720", icon: Target, color: "text-success" },
                  { label: "Total Payments", value: "₹2.72L", icon: IndianRupee, color: "text-warning" },
                  { label: "Quality Rate", value: "94%", icon: Star, color: "text-accent" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-2xl border p-6"
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Weekly Payments Chart */}
              <div className="bg-card border rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-6">Weekly Payments Distributed</h3>
                <div className="flex items-end gap-3 h-40">
                  {EMPLOYER_WEEKLY.map((d, i) => (
                    <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground font-medium">₹{(d.paid / 1000).toFixed(0)}k</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.paid / maxPaid) * 120}px` }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="w-full rounded-t-lg bg-success/70 hover:bg-success transition-colors cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground">{d.week.replace("Feb ", "B").replace("Mar ", "M")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worker Feedback */}
              <div className="bg-card border rounded-2xl p-6">
                <h3 className="font-bold mb-4">Worker Performance Summary</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: "Priya Sharma", tasks: 3, quality: "96%", earned: "₹4,600" },
                    { name: "Radha Patil", tasks: 2, quality: "91%", earned: "₹2,040" },
                    { name: "Sunita Devi", tasks: 4, quality: "93%", earned: "₹3,760" },
                  ].map(w => (
                    <div key={w.name} className="bg-muted/30 rounded-xl p-4">
                      <div className="font-semibold mb-2">{w.name}</div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between"><span>Tasks</span><span>{w.tasks}</span></div>
                        <div className="flex justify-between"><span>Quality</span><span className="text-success">{w.quality}</span></div>
                        <div className="flex justify-between"><span>Earned</span><span className="text-primary font-semibold">{w.earned}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Admin View ── */}
          {roleView === "admin" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {ADMIN_STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-2xl border p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      <span className="text-xs text-success flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />{stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="font-bold mb-4">Platform Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Job Seekers Registered", value: "894" },
                      { label: "Employers (SHG + Business)", value: "58" },
                      { label: "NGOs Verified", value: "12" },
                      { label: "Training Modules Live", value: "34" },
                      { label: "Counsellors Active", value: "28" },
                      { label: "Verification Pending", value: "23" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                        <span className="text-muted-foreground text-sm">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="font-bold mb-4">Counsellor Feedback (This Week)</h3>
                  <div className="space-y-4">
                    {[
                      { counsellor: "Anjali Mehta", feedback: "32 learners engaged. 8 completed the module. Strong retention.", rating: 4.8 },
                      { counsellor: "Kavita Raut", feedback: "28 active. 5 new enrollments. Some learners need more support with banking apps.", rating: 4.6 },
                      { counsellor: "Pooja Singh", feedback: "19 learners. 3 successfully registered home businesses.", rating: 4.9 },
                    ].map(f => (
                      <div key={f.counsellor} className="bg-muted/30 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{f.counsellor}</span>
                          <span className="flex items-center gap-1 text-xs text-warning">
                            <Star className="w-3 h-3 fill-warning" />{f.rating}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{f.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AnalyticsDashboard;
