import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import VoiceAssistant from "@/components/VoiceAssistant";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProfileRouter from "./pages/ProfileRouter";
import Jobs from "./pages/Jobs";
import Employer from "./pages/Employer";
import MyWork from "./pages/MyWork";
import AdminPortal from "./pages/AdminPortal";
import Counsellor from "./pages/Counsellor";
import Skills from "./pages/Skills";
import Earnings from "./pages/Earnings";
import Community from "./pages/Community";
import SHGPortal from "./pages/SHGPortal";
import NGOPortal from "./pages/NGOPortal";
import CompanyBulkOrders from "./pages/CompanyBulkOrders";
import NotFound from "./pages/NotFound";
// New dashboard pages
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import NGODashboard from "./pages/NGODashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Core routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Profile Router — detects user type and redirects */}
            <Route path="/profile" element={<ProfileRouter />} />
            <Route path="/profile-edit" element={<Profile />} />

            {/* Job Seeker routes */}
            <Route path="/job-seeker-dashboard" element={<JobSeekerDashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/tasks" element={<MyWork />} />
            <Route path="/my-work" element={<MyWork />} />
            <Route path="/earnings" element={<Earnings />} />

            {/* Employer routes */}
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/employer" element={<Employer />} />
            <Route path="/post-job" element={<EmployerDashboard />} />
            <Route path="/manage-workers" element={<EmployerDashboard />} />

            {/* SHG routes */}
            <Route path="/shg-portal" element={<SHGPortal />} />

            {/* NGO routes */}
            <Route path="/ngo-dashboard" element={<NGODashboard />} />
            <Route path="/ngo-portal" element={<NGOPortal />} />
            <Route path="/training" element={<NGOPortal />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsDashboard />} />

            {/* Admin */}
            <Route path="/admin-portal" element={<AdminPortal />} />

            {/* Other existing routes */}
            <Route path="/counsellor" element={<Counsellor />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/community" element={<Community />} />
            <Route path="/bulk-orders" element={<CompanyBulkOrders />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <VoiceAssistant />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
