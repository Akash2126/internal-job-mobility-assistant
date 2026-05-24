import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie
} from "recharts";
import { 
  TrendingUp, Users, Award, ShieldAlert, Sparkles, ArrowUpRight, 
  Filter, Download, Briefcase, Plus, Pencil, Trash2, Calendar, Clock, 
  MapPin, DollarSign, ArrowRight, UserCheck, CheckCircle, Search, Mail, 
  FileText, ChevronRight, X, AlertCircle, Info, Lock, Play
} from "lucide-react";
import { HRAnalytics } from "../types";

const safeParseJson = async (res: Response, fallback: any = {}) => {
  try {
    if (!res.ok) return fallback;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (e) {
    console.error("safeParseJson failed in HRDashboard:", e);
  }
  return fallback;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 14
    }
  }
};

interface HRDashboardProps {
  analytics: HRAnalytics;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  jobs: any[];
  onRefreshJobs: () => Promise<void>;
}

export default function HRDashboard({ analytics, fetchWithAuth, jobs, onRefreshJobs }: HRDashboardProps) {
  // Navigation inside HR Workspace
  const [currentSection, setCurrentSection] = useState<"analytics" | "jobs" | "pipeline">("analytics");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  // Recruitment system states
  const [recruitmentJobs, setRecruitmentJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingRecruitment, setLoadingRecruitment] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Job Opening form state
  const [showJobForm, setShowJobForm] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    domain: "aiml",
    department: "",
    level: "L5",
    location: "San Francisco, CA (Hybrid)",
    salaryRange: "$150,000 - $180,000",
    description: "",
    requiredSkills: "",
    preferredSkills: "",
    experienceRequirements: "3+ years technical engineering experience",
    deadline: "2026-08-31",
    hiringManager: "",
    status: "Active"
  });

  // AI Sourcing / Recommendations State
  const [activeRecomJob, setActiveRecomJob] = useState<any | null>(null);
  const [loadingRecom, setLoadingRecom] = useState<boolean>(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [dispatchSponsoringId, setDispatchSponsoringId] = useState<string | null>(null);

  // Interview Scheduler State
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [schedulingApplicant, setSchedulingApplicant] = useState<any | null>(null);
  const [interviewDate, setInterviewDate] = useState<string>("2026-06-01");
  const [interviewTime, setInterviewTime] = useState<string>("10:00");
  const [interviewMode, setInterviewMode] = useState<string>("Google Meet Secure Channel");

  // Detailed Applicant Dossier State
  const [viewingApplicant, setViewingApplicant] = useState<any | null>(null);

  // Pipeline Filter
  const [jobPipelineFilter, setJobPipelineFilter] = useState<string>("all");

  // Success notifications
  const [dashboardNotice, setDashboardNotice] = useState<{ title: string; msg: string; type: "success" | "info" } | null>(null);

  const triggerNotice = (title: string, msg: string, type: "success" | "info" = "success") => {
    setDashboardNotice({ title, msg, type });
    setTimeout(() => setDashboardNotice(null), 5000);
  };

  // Sync / Load HR variables
  const loadRecruitmentStats = async () => {
    if (!fetchWithAuth) return;
    try {
      setLoadingRecruitment(true);
      const [jobsRes, applicantsRes] = await Promise.all([
        fetchWithAuth("/api/v1/hr/jobs"),
        fetchWithAuth("/api/v1/hr/applicants")
      ]);

      if (jobsRes.ok) {
        const data = await safeParseJson(jobsRes);
        setRecruitmentJobs(data.jobs || []);
      }
      if (applicantsRes.ok) {
        const data = await safeParseJson(applicantsRes);
        setApplicants(data.applicants || []);
      }
    } catch (err) {
      console.error("Failed to compile internal recruitment database records:", err);
    } finally {
      setLoadingRecruitment(false);
    }
  };

  useEffect(() => {
    loadRecruitmentStats();
  }, [jobs]);

  // Form handlers
  const openCreateForm = () => {
    setEditingJob(null);
    setJobFormData({
      title: "",
      domain: "aiml",
      department: "AI/ML Engineering",
      level: "L5",
      location: "San Francisco, CA (Hybrid)",
      salaryRange: "$165,000 - $195,000",
      description: "We are seeking an outstanding individual contributor to drive forward our critical core systems architecture. You will design, implement, and maintain high-performance products.",
      requiredSkills: 'Python, PyTorch, SQL',
      preferredSkills: 'Docker, TensorFlow, API Integration',
      experienceRequirements: "4+ years of industry scale expertise",
      deadline: "2026-07-15",
      hiringManager: "Dr. Evelyn Vance (Chief Technical Officer)",
      status: "Active"
    });
    setShowJobForm(true);
  };

  const openEditForm = (job: any) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title,
      domain: job.domain,
      department: job.department,
      level: job.level,
      location: job.location,
      salaryRange: job.salaryRange,
      description: job.description,
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(", ") : job.requiredSkills,
      preferredSkills: Array.isArray(job.preferredSkills) ? job.preferredSkills.join(", ") : job.preferredSkills,
      experienceRequirements: job.experienceRequirements || "3+ years corresponding IT exposure",
      deadline: job.deadline || "2026-08-31",
      hiringManager: job.hiringManager,
      status: job.status
    });
    setShowJobForm(true);
  };

  const saveJobPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fetchWithAuth) return;

    try {
      const payload = {
        ...jobFormData,
        requiredSkills: jobFormData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        preferredSkills: jobFormData.preferredSkills.split(",").map(s => s.trim()).filter(Boolean),
      };

      let url = "/api/v1/hr/jobs";
      let method = "POST";

      if (editingJob) {
        url = `/api/v1/hr/jobs/${editingJob.id}`;
        method = "PUT";
      }

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });

      const data = await safeParseJson(res);
      if (data && data.success) {
        triggerNotice(
          editingJob ? "Position Modified" : "New Opening Created",
          `Internal posting '${payload.title}' has been safely registered. Workforce metrics updated.`,
          "success"
        );
        setShowJobForm(false);
        // Sync parent states
        await onRefreshJobs();
        await loadRecruitmentStats();
      } else {
        alert("Operation Error: " + ((data && data.message) || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Failed to commit job posting draft:", err);
    }
  };

  const deleteJobOpening = async (jobId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to completely delete '${title}' and remove all connected applicant files from active archives?`)) return;
    if (!fetchWithAuth) return;

    try {
      const res = await fetchWithAuth(`/api/v1/hr/jobs/${jobId}`, {
        method: "DELETE"
      });
      const data = await safeParseJson(res);
      if (data && data.success) {
        triggerNotice("Position Deleted", `'${title}' has been successfully pruned from active rosters.`, "info");
        await onRefreshJobs();
        await loadRecruitmentStats();
      }
    } catch (err) {
      console.error("Purge failure for vacancy record: ", err);
    }
  };

  // Status stage management (Kanban Action)
  const progressCandidateStage = async (applicantId: string, currentStatus: string, nextStatus: string) => {
    if (!fetchWithAuth) return;
    try {
      const res = await fetchWithAuth(`/api/v1/hr/applicants/${applicantId}/status`, {
        method: "POST",
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await safeParseJson(res);
      if (data && data.success) {
        triggerNotice(
          "Pipeline Updated",
          `Status transitioned: ${currentStatus} → ${nextStatus} for candidate files.`,
          "success"
        );
        await loadRecruitmentStats();
        // If viewing candidate dossier open, refresh state
        if (viewingApplicant && viewingApplicant.id === applicantId) {
          setViewingApplicant(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      }
    } catch (err) {
      console.error("Workflow stage update error:", err);
    }
  };

  // AI Sourcing Recommendations Trigger
  const loadAISuggestions = async (job: any) => {
    if (!fetchWithAuth) return;
    try {
      setActiveRecomJob(job);
      setLoadingRecom(true);
      setAiRecommendations([]);
      const res = await fetchWithAuth(`/api/v1/hr/recommendations/${job.id}`);
      if (res.ok) {
        const data = await safeParseJson(res);
        setAiRecommendations((data && data.recommendations) || []);
      }
    } catch (err) {
      console.error("AI recommendations generator failed:", err);
    } finally {
      setLoadingRecom(false);
    }
  };

  // Invite candidate via email simulator (Direct integration)
  const dispatchSponsoringEngagement = async (candidate: any) => {
    if (!fetchWithAuth || !activeRecomJob) return;
    try {
      setDispatchSponsoringId(candidate.userId);
      // Create a mock application under 'Applied' or direct status: 'Shortlisted'
      const appRes = await fetchWithAuth("/api/v1/jobs/apply", {
        method: "POST",
        body: JSON.stringify({
          jobId: activeRecomJob.id,
          matchScore: candidate.matchScore
        })
      });

      if (appRes.ok) {
        const appData = await safeParseJson(appRes);
        
        // Progress stage to 'Shortlisted' automatically as recommended elite talent
        if (appData && appData.application && appData.application.id) {
          await fetchWithAuth(`/api/v1/hr/applicants/${appData.application.id}/status`, {
            method: "POST",
            body: JSON.stringify({ status: "Shortlisted" })
          });
        }

        triggerNotice(
          "Automated Invitation Dispatched",
          `Dispatched AI Sourcing Brief to ${candidate.name} (${candidate.department}). Candidate automatically added to Shortlist.`,
          "success"
        );

        // Reload data
        await loadRecruitmentStats();
        // Remove from current suggestions list
        setAiRecommendations(prev => prev.filter(c => c.userId !== candidate.userId));
      }
    } catch (err) {
      console.error("Engagement invite error: ", err);
    } finally {
      setDispatchSponsoringId(null);
    }
  };

  // Interview schedule execution
  const arrangeExecutiveInterviewObj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fetchWithAuth || !schedulingApplicant) return;

    try {
      const res = await fetchWithAuth(`/api/v1/hr/applicants/${schedulingApplicant.id}/schedule`, {
        method: "POST",
        body: JSON.stringify({
          interviewDate,
          interviewTime,
          interviewMode
        })
      });

      const data = await safeParseJson(res);
      if (data && data.success) {
        triggerNotice(
          "Interview Locked",
          `Session arranged with ${schedulingApplicant.candidate.name} for ${interviewDate} at ${interviewTime}. Outgoing corporate notifications logged inside SMTP dispatcher.`,
          "success"
        );
        setShowScheduleModal(false);
        await loadRecruitmentStats();
      }
    } catch (err) {
      console.error("Scheduler failed:", err);
    }
  };

  // Color theme variables based on domains
  const getDomainTheme = (domain: string) => {
    switch (domain) {
      case "aiml": return { color: "#ec4899", text: "AI/ML Engineering", bg: "from-pink-500/10 to-transparent", border: "border-pink-500/25" };
      case "fullstack": return { color: "#3b82f6", text: "Full Stack Development", bg: "from-blue-500/10 to-transparent", border: "border-blue-500/25" };
      case "data": return { color: "#f59e0b", text: "Data Analytics", bg: "from-amber-500/10 to-transparent", border: "border-amber-500/25" };
      case "salesforce": return { color: "#6366f1", text: "Salesforce CRM", bg: "from-indigo-500/10 to-transparent", border: "border-indigo-500/25" };
      case "servicenow": return { color: "#8b5cf6", text: "ServiceNow ESM", bg: "from-purple-500/10 to-transparent", border: "border-purple-500/25" };
      default: return { color: "#737373", text: "Operations Focus", bg: "from-neutral-500/10 to-transparent", border: "border-neutral-500/25" };
    }
  };

  // Preparation of Recharts metrics from department analytics
  const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

  const departmentPieData = analytics.departmentInsights.map((dept, i) => ({
    name: dept.name,
    value: dept.headcount,
    color: COLORS[i % COLORS.length]
  }));

  const filteredInsights = selectedDepartment === "All" 
    ? analytics.departmentInsights 
    : analytics.departmentInsights.filter(d => d.name === selectedDepartment);

  // Filter Jobs List
  const filteredJobs = recruitmentJobs.filter(job => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(term) || job.department.toLowerCase().includes(term) || job.hiringManager.toLowerCase().includes(term);
    return matchesSearch;
  });

  // Filter Applicants linked to Selected Pipeline Filter
  const filteredApplicantsPipeline = applicants.filter(app => {
    if (jobPipelineFilter === "all") return true;
    return app.jobId === jobPipelineFilter;
  });

  // KPI Calculations in Career Pipeline
  const totalOpeningsCount = recruitmentJobs.length;
  const activePipelineCount = applicants.length;
  const shortlistedCount = applicants.filter(a => a.status === "Shortlisted").length;
  const scheduledCount = applicants.filter(a => a.status === "Interviewing" && a.interviewDate).length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8 pb-12 font-sans text-neutral-100"
    >
      
      {/* Top Header Banner + Section Switching Tabs */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">Human Resources Mobility Workspace</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Enterprise Talent Management</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Configure internal job postings, track horizontal applicants pipeline, and leverage real-time AI matchmaking.
          </p>
        </div>

        {/* Global Tab Toggle */}
        <div className="flex flex-wrap items-center bg-neutral-950 border border-neutral-850 p-1.5 rounded-2xl gap-1">
          <button 
            onClick={() => setCurrentSection("analytics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentSection === "analytics" 
                ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-300" 
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Workforce Analytics</span>
          </button>
          
          <button 
            onClick={() => setCurrentSection("jobs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentSection === "jobs" 
                ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-300" 
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Openings Matrix ({totalOpeningsCount})</span>
          </button>

          <button 
            onClick={() => setCurrentSection("pipeline")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentSection === "pipeline" 
                ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-300" 
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Workflow & Board ({activePipelineCount})</span>
          </button>
        </div>
      </motion.div>

      {/* Interstitial Alert Notifications */}
      <AnimatePresence>
        {dashboardNotice && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 border rounded-2xl flex items-center gap-3 text-xs md:text-sm ${
              dashboardNotice.type === "success" 
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 font-medium" 
                : "bg-indigo-500/5 border-indigo-500/20 text-indigo-400 font-medium"
            }`}
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <strong className="text-white font-bold block">{dashboardNotice.title}</strong>
              <p className="opacity-90">{dashboardNotice.msg}</p>
            </div>
            <X className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-100" onClick={() => setDashboardNotice(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: WORKFORCE ANALYTICS DISPLAY */}
      {currentSection === "analytics" && (
        <div className="space-y-8">
          
          {/* KPI Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-5 shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-neutral-500 font-bold">Total Staff Count</span>
                <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +2.4% MoM
                </span>
              </div>
              <p className="text-2xl font-extrabold gradient-text mt-1.5">{analytics.overviewMetrics.totalEmployees}</p>
              <div className="flex items-center space-x-1 text-xs text-indigo-400 font-semibold mt-2">
                <Users className="w-3.5 h-3.5" />
                <span>100% Profile Sync Integrity</span>
              </div>
            </div>

            <div className="glass-card p-5 shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-neutral-500 font-bold">Active Open Roles</span>
                <span className="text-neutral-500 font-mono text-[9px] font-bold">Talent Shortage</span>
              </div>
              <p className="text-2xl font-extrabold gradient-text mt-1.5">{totalOpeningsCount || analytics.overviewMetrics.activeInternalJobs}</p>
              <div className="flex items-center space-x-1 text-xs text-indigo-400 font-semibold mt-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Active Vacancy Listings cataloged</span>
              </div>
            </div>

            <div className="glass-card p-5 shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-neutral-500 font-bold">Internal Transitions</span>
                <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +14.8%
                </span>
              </div>
              <p className="text-2xl font-extrabold gradient-text mt-1.5">{analytics.overviewMetrics.internalTransitionsThisYear}</p>
              <div className="flex items-center space-x-1 text-xs text-indigo-400 font-semibold mt-2">
                <Award className="w-3.5 h-3.5" />
                <span>$2.1M Recruitment Costs Saved</span>
              </div>
            </div>

            <div className="glass-card p-5 shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-neutral-500 font-bold">Critical Gaps Tracked</span>
                <span className="bg-red-500/10 text-red-500 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/20 uppercase">Action required</span>
              </div>
              <p className="text-2xl font-extrabold text-white mt-1.5">{analytics.overviewMetrics.skillGapsIdentified}</p>
              <div className="flex items-center space-x-1 text-xs text-red-400 font-semibold mt-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Fostering Internal Skill-Gaps Closing</span>
              </div>
            </div>
          </motion.div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Card: 5-Month Internal Mobility Trend Area chart */}
            <motion.div variants={itemVariants} className="lg:col-span-8 glass-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-bold text-white leading-tight">Mobility Trends Breakdown</h3>
                  <p className="text-xs text-neutral-500">Historical transfers categorized monthly across core operational fields.</p>
                </div>
                <span className="text-[11px] text-indigo-400 font-mono font-bold">Interactive Recharts Layer</span>
              </div>

              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.internalMobilityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEng2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProd2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="month" stroke="#737373" fontSize={11} />
                    <YAxis stroke="#737373" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', fontSize: 12 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area type="monotone" name="Engineering Developers" dataKey="engineering" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEng2)" strokeWidth={2.5} />
                    <Area type="monotone" name="Product and Growth Managers" dataKey="product" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorProd2)" strokeWidth={2.5} />
                    <Area type="monotone" name="Operations Specialists" dataKey="operations" stroke="#f59e0b" fillOpacity={0} strokeWidth={2} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Right Card: Headcount Distribution (Pie Chart) */}
            <motion.div variants={itemVariants} className="lg:col-span-4 glass-card p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-md font-bold text-white leading-tight">Headcount Distribution</h3>
                <p className="text-xs text-neutral-500">Global allocation percentage.</p>
              </div>

              <div className="h-48 w-full flex items-center justify-center relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center mt-[-4px]">
                  <span className="text-2xl font-black gradient-text">{analytics.overviewMetrics.totalEmployees}</span>
                  <span className="text-[10px] text-neutral-500 block uppercase font-mono font-bold">Employees</span>
                </div>
              </div>

              <div className="space-y-1.5 mt-2">
                {departmentPieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: d.color }} />
                      <span className="text-neutral-400 font-medium">{d.name}</span>
                    </div>
                    <span className="text-white font-bold">{d.value} staff</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Table bottleneck analytics row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 glass-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-bold text-white">Department Mobility Performance Metrics</h3>
                  <p className="text-xs text-neutral-500 mt-1">Analyzing active internal transfers compared to organization target retention metrics.</p>
                </div>
                <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300">
                  <Filter className="w-3.5 h-3.5 text-neutral-500 mr-2" />
                  <span className="text-neutral-500 mr-1.5 font-bold">Filter Dept:</span>
                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="All" className="bg-neutral-950">All Departments</option>
                    {analytics.departmentInsights.map(d => (
                      <option key={d.name} value={d.name} className="bg-neutral-950">{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800/85 text-neutral-500 font-mono uppercase font-bold">
                      <th className="py-3 px-2 font-medium">Department</th>
                      <th className="py-3 font-medium">Headcount</th>
                      <th className="py-3 font-medium">Internal Rate</th>
                      <th className="py-3 font-medium">Target Met</th>
                      <th className="py-3 px-2 font-medium">Critical Skill Gaps Identified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {filteredInsights.map((dept) => {
                      const rateVal = parseFloat(dept.mobilityRate);
                      const targetVal = parseFloat(dept.targetRate);
                      const isMet = rateVal >= targetVal - 2;

                      return (
                        <tr key={dept.name} className="hover:bg-neutral-950/20 transition">
                          <td className="py-4 px-2 font-bold text-white">{dept.name}</td>
                          <td className="py-4 font-mono font-bold text-neutral-300">{dept.headcount}</td>
                          <td className="py-4 text-white font-bold">{dept.mobilityRate}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                              isMet ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {isMet ? "Healthy" : "Deficit"}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-neutral-400">
                            <div className="flex flex-wrap gap-1">
                              {dept.coreGaps.map(g => (
                                <span key={g} className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: JOB OPENINGS MATRIX */}
      {currentSection === "jobs" && (
        <div className="space-y-6">
          
          {/* Sourcing Action bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/80">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search job titles, managers, departments..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 text-xs text-white border border-neutral-800 focus:border-indigo-500 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none"
              />
            </div>

            <button 
              onClick={openCreateForm}
              className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Internal Role</span>
            </button>
          </div>

          {/* Openings Grid */}
          {loadingRecruitment ? (
            <div className="py-12 text-center text-neutral-400 text-xs font-mono animate-pulse">
              Compiling secure corporate SQL registry...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center bg-neutral-950/20 border border-neutral-850 rounded-2xl space-y-2">
              <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
              <p className="text-sm font-bold text-neutral-400">No Job Openings Registered</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto p-1 text-center">
                Query returned empty. Clear search parameters or click the 'Post New Internal Role' button to boost corporate mobility.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJobs.map(job => {
                const theme = getDomainTheme(job.domain);
                const reqSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
                const prefSkills = Array.isArray(job.preferredSkills) ? job.preferredSkills : [];

                return (
                  <motion.div 
                    layout
                    key={job.id} 
                    className="glass-card flex flex-col justify-between overflow-hidden bg-gradient-to-b from-neutral-900/60 to-neutral-950/20 border border-neutral-850 hover:border-neutral-700 transition relative"
                  >
                    <div className="p-5 space-y-3.5">
                      {/* Top badgies */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${theme.border} bg-neutral-950`} style={{ color: theme.color }}>
                          {theme.text}
                        </span>
                        <div className="flex items-center gap-1 opacity-70">
                          <span className={`w-1.5 h-1.5 rounded-full ${job.status === "Active" ? "bg-emerald-400" : "bg-neutral-500"}`} />
                          <span className="text-[10px] font-mono font-bold text-neutral-400">{job.status}</span>
                        </div>
                      </div>

                      {/* Job Title & Specs */}
                      <div>
                        <h3 className="text-sm font-extrabold text-white leading-snug tracking-tight hover:text-indigo-400 transition cursor-pointer" onClick={() => openEditForm(job)}>
                          {job.title}
                        </h3>
                        <p className="text-[11px] text-neutral-400 font-medium mt-1 uppercase tracking-tight">{job.department} • Tier {job.level}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-neutral-950/45 p-2.5 rounded-xl border border-neutral-900/80 font-mono text-neutral-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-neutral-500 shrink-0" />
                          <span className="truncate">{job.salaryRange}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <Calendar className="w-3 h-3 text-neutral-500 shrink-0" />
                          <span>Deadline: <strong>{job.deadline || "2026-08-31"}</strong></span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-neutral-500 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Required Skills Chips */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] font-mono uppercase text-neutral-500 font-bold block">Required Core Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {reqSkills.map(skill => (
                            <span key={skill} className="text-[9px] bg-[#10101b] border border-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-mono font-bold">
                              {skill}
                            </span>
                          ))}
                          {reqSkills.length === 0 && <span className="text-[10px] text-neutral-600">None declared</span>}
                        </div>
                      </div>
                    </div>

                    {/* Bottom control parameters */}
                    <div className="bg-neutral-900/60 p-4 border-t border-neutral-850/80 flex items-center justify-between gap-2">
                      <div className="text-left">
                        <span className="text-[10px] text-neutral-500 block uppercase font-mono leading-none">Applicants</span>
                        <span className="text-sm font-extrabold text-white leading-normal font-mono">{job.applicantsCount || 0}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => loadAISuggestions(job)}
                          className="px-2.5 py-1.5 bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/50 text-purple-400 text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Generate high-compatibility AI recommendations"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Source ({getDomainTheme(job.domain).text.split(' ')[0]})</span>
                        </button>

                        <button 
                          onClick={() => openEditForm(job)}
                          className="p-1.5 bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg transition cursor-pointer hover:border-neutral-700"
                          title="Edit Position"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => deleteJobOpening(job.id, job.title)}
                          className="p-1.5 bg-neutral-950 border border-neutral-800 text-rose-550 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Prune Opening"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: RECRUITMENT WORKFLOW & PIPELINE */}
      {currentSection === "pipeline" && (
        <div className="space-y-6">
          
          {/* Filters & KPI Metrics */}
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/80">
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 w-full md:w-auto">
                <Filter className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
                <span className="text-neutral-500 mr-1.5 font-bold">Filter Pipeline Context:</span>
                <select 
                  value={jobPipelineFilter} 
                  onChange={(e) => setJobPipelineFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer flex-1"
                >
                  <option value="all" className="bg-neutral-950">Show All Vacancies ({applicants.length})</option>
                  {recruitmentJobs.map(j => (
                    <option key={j.id} value={j.id} className="bg-neutral-950">{j.title} ({applicants.filter(a => a.jobId === j.id).length})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Minor Pipeline KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto font-mono text-[10px]">
              <div className="p-2 border border-neutral-850 bg-neutral-950/25 rounded-xl text-center">
                <span className="text-neutral-500 font-bold uppercase block mb-0.5">Vacancies</span>
                <span className="text-white text-xs font-bold block">{totalOpeningsCount}</span>
              </div>
              <div className="p-2 border border-neutral-850 bg-neutral-950/25 rounded-xl text-center">
                <span className="text-neutral-500 font-bold uppercase block mb-0.5">Vetting Registry</span>
                <span className="text-white text-xs font-bold block">{activePipelineCount} files</span>
              </div>
              <div className="p-2 border border-neutral-850 bg-neutral-950/25 rounded-xl text-center">
                <span className="text-purple-400 font-bold uppercase block mb-0.5">Shortlisted</span>
                <span className="text-purple-300 text-xs font-bold block">{shortlistedCount}</span>
              </div>
              <div className="p-2 border border-neutral-850 bg-neutral-950/25 rounded-xl text-center">
                <span className="text-indigo-400 font-bold uppercase block mb-0.5">Scheduled Loops</span>
                <span className="text-indigo-300 text-xs font-bold block">{scheduledCount}</span>
              </div>
            </div>
          </div>

          {/* Interactive Kanban Pipeline */}
          {loadingRecruitment ? (
            <div className="py-12 text-center text-neutral-400 text-xs font-mono animate-pulse">
              Compiling internal recruiting board...
            </div>
          ) : filteredApplicantsPipeline.length === 0 ? (
            <div className="py-12 text-center bg-neutral-950/20 border border-neutral-850 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
              <p className="text-sm font-bold text-neutral-400 mt-2">No Active Applicants Found</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                There are currently no internal mobility applications recorded for this selection. Go to the Employee Dashboard to file mobility tests.
              </p>
            </div>
          ) : (
            <div>
              {/* Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* Column 1: Vetting / Applied */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Incoming Vetting</h4>
                    </div>
                    <span className="bg-neutral-905 border border-neutral-850 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-500">
                      {filteredApplicantsPipeline.filter(a => a.status === "Applied" || a.status === "Pending").length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredApplicantsPipeline
                      .filter(a => a.status === "Applied" || a.status === "Pending")
                      .map(app => (
                        <CandidateCard 
                          key={app.id} 
                          applicant={app} 
                          onView={() => setViewingApplicant(app)} 
                          onSchedule={() => { setSchedulingApplicant(app); setShowScheduleModal(true); }}
                          onUpdateStatus={(next) => progressCandidateStage(app.id, app.status, next)}
                        />
                      ))}
                    {filteredApplicantsPipeline.filter(a => a.status === "Applied" || a.status === "Pending").length === 0 && (
                      <span className="text-[11px] text-neutral-500 block text-center py-6 border border-neutral-850/50 border-dashed rounded-2xl">Empty Column</span>
                    )}
                  </div>
                </div>

                {/* Column 2: Shortlisted */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block" />
                      <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Shortlisted (AI Sync)</h4>
                    </div>
                    <span className="bg-neutral-905 border border-neutral-850 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-550">
                      {filteredApplicantsPipeline.filter(a => a.status === "Shortlisted").length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredApplicantsPipeline
                      .filter(a => a.status === "Shortlisted")
                      .map(app => (
                        <CandidateCard 
                          key={app.id} 
                          applicant={app} 
                          onView={() => setViewingApplicant(app)} 
                          onSchedule={() => { setSchedulingApplicant(app); setShowScheduleModal(true); }}
                          onUpdateStatus={(next) => progressCandidateStage(app.id, app.status, next)}
                        />
                      ))}
                    {filteredApplicantsPipeline.filter(a => a.status === "Shortlisted").length === 0 && (
                      <span className="text-[11px] text-neutral-500 block text-center py-6 border border-neutral-850/50 border-dashed rounded-2xl">Empty Column</span>
                    )}
                  </div>
                </div>

                {/* Column 3: Interviewing */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
                      <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Active Interviewing</h4>
                    </div>
                    <span className="bg-neutral-905 border border-neutral-850 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-550">
                      {filteredApplicantsPipeline.filter(a => a.status === "Interviewing").length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredApplicantsPipeline
                      .filter(a => a.status === "Interviewing")
                      .map(app => (
                        <CandidateCard 
                          key={app.id} 
                          applicant={app} 
                          onView={() => setViewingApplicant(app)} 
                          onSchedule={() => { setSchedulingApplicant(app); setShowScheduleModal(true); }}
                          onUpdateStatus={(next) => progressCandidateStage(app.id, app.status, next)}
                        />
                      ))}
                    {filteredApplicantsPipeline.filter(a => a.status === "Interviewing").length === 0 && (
                      <span className="text-[11px] text-neutral-500 block text-center py-6 border border-neutral-850/50 border-dashed rounded-2xl">Empty Column</span>
                    )}
                  </div>
                </div>

                {/* Column 4: Approved & Closed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                      <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Transitioning Placement</h4>
                    </div>
                    <span className="bg-neutral-905 border border-neutral-850 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-550">
                      {filteredApplicantsPipeline.filter(a => a.status === "Approved" || a.status === "Transitioning" || a.status === "Completed").length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredApplicantsPipeline
                      .filter(a => a.status === "Approved" || a.status === "Transitioning" || a.status === "Completed")
                      .map(app => (
                        <CandidateCard 
                          key={app.id} 
                          applicant={app} 
                          onView={() => setViewingApplicant(app)} 
                          onSchedule={() => { setSchedulingApplicant(app); setShowScheduleModal(true); }}
                          onUpdateStatus={(next) => progressCandidateStage(app.id, app.status, next)}
                        />
                      ))}
                    {filteredApplicantsPipeline.filter(a => a.status === "Approved" || a.status === "Transitioning" || a.status === "Completed").length === 0 && (
                      <span className="text-[11px] text-neutral-500 block text-center py-6 border border-neutral-850/50 border-dashed rounded-2xl">Empty Column</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: JOB POSTING FORM WRAPPER */}
      <AnimatePresence>
        {showJobForm && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-800">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-md font-extrabold text-white">
                    {editingJob ? "Adjust Job Posting Blueprint" : "Initiate Internal Job Posting Form"}
                  </h3>
                </div>
                <button onClick={() => setShowJobForm(false)} className="text-neutral-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveJobPosition} className="p-6 space-y-4 text-xs">
                
                {/* Two Column details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Position Title</label>
                    <input 
                      type="text" 
                      required
                      value={jobFormData.title}
                      onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})}
                      placeholder="e.g. Lead Devops & Systems Specialist"
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Target Level</label>
                    <select 
                      value={jobFormData.level}
                      onChange={(e) => setJobFormData({...jobFormData, level: e.target.value})}
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full cursor-pointer"
                    >
                      <option value="L4">L4 - Associate Developer</option>
                      <option value="L5">L5 - Senior/Lead Consultant</option>
                      <option value="L6">L6 - Staff/Principal Architect</option>
                      <option value="L7">L7 - Director/Chief Scientist</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Target Tech-Domain</label>
                    <select 
                      value={jobFormData.domain}
                      onChange={(e) => setJobFormData({...jobFormData, domain: e.target.value})}
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full cursor-pointer"
                    >
                      <option value="aiml">AI/ML Engineering</option>
                      <option value="fullstack">Full Stack Development</option>
                      <option value="data">Data Analytics</option>
                      <option value="salesforce">Salesforce CRM</option>
                      <option value="servicenow">ServiceNow ESM</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Department Node</label>
                    <input 
                      type="text" 
                      required
                      value={jobFormData.department}
                      onChange={(e) => setJobFormData({...jobFormData, department: e.target.value})}
                      placeholder="e.g. AI Sourcing Platform"
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Hiring Manager Lead</label>
                    <input 
                      type="text" 
                      required
                      value={jobFormData.hiringManager}
                      onChange={(e) => setJobFormData({...jobFormData, hiringManager: e.target.value})}
                      placeholder="e.g. Dr. Evelyn Vance (Chief Technical Officer)"
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Workforce Location</label>
                    <input 
                      type="text" 
                      required
                      value={jobFormData.location}
                      onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})}
                      placeholder="e.g. San Francisco Office (Hybrid)"
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Compensation/Salary Band</label>
                    <input 
                      type="text" 
                      required
                      value={jobFormData.salaryRange}
                      onChange={(e) => setJobFormData({...jobFormData, salaryRange: e.target.value})}
                      placeholder="e.g. $165,000 - $195,000"
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Application Deadline</label>
                    <input 
                      type="date" 
                      value={jobFormData.deadline}
                      onChange={(e) => setJobFormData({...jobFormData, deadline: e.target.value})}
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full font-mono cursor-pointer"
                    />
                  </div>

                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Experience Guidelines (Requirements)</label>
                  <input 
                    type="text" 
                    required
                    value={jobFormData.experienceRequirements}
                    onChange={(e) => setJobFormData({...jobFormData, experienceRequirements: e.target.value})}
                    placeholder="e.g. 3+ years in deep systems architectural scale"
                    className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Required Core Skills (Comma Separated list for AI Mapping)</label>
                  <input 
                    type="text" 
                    required
                    value={jobFormData.requiredSkills}
                    onChange={(e) => setJobFormData({...jobFormData, requiredSkills: e.target.value})}
                    placeholder="Python, Terraform, Docker, AWS"
                    className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white-sans font-mono tracking-wide focus:outline-none w-full"
                  />
                  <span className="text-[9px] text-neutral-500 block font-mono">Separate skill names with commas to feed the matching algorithm.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Preferred/Bonus Skills (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={jobFormData.preferredSkills}
                    onChange={(e) => setJobFormData({...jobFormData, preferredSkills: e.target.value})}
                    placeholder="Next.js, Kubernetes"
                    className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-wide focus:outline-none w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Vacancy Description & Strategic Impact</label>
                  <textarea 
                    rows={4}
                    required
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                    placeholder="Write a clear, inspiring description detailing core technical objectives and horizontal growth trajectories..."
                    className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Target Flow Status</label>
                    <select 
                      value={jobFormData.status}
                      onChange={(e) => setJobFormData({...jobFormData, status: e.target.value})}
                      className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full cursor-pointer"
                    >
                      <option value="Active">Active (Publish Immediately to Staff)</option>
                      <option value="Draft">Draft (Internal Strategy Sandbox)</option>
                      <option value="Inactive">Inactive / Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowJobForm(false)}
                    className="px-4 py-2 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-indigo-600/30"
                  >
                    {editingJob ? "Publish Compliance Modifications" : "Release Internal Vacancy"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INTERVIEW SCHEDULER MODAL */}
      <AnimatePresence>
        {showScheduleModal && schedulingApplicant && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Arrange Calibration Interview</h3>
                    <p className="text-[10px] text-neutral-400">Locking schedule loop for {schedulingApplicant.candidate.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowScheduleModal(false)} className="text-neutral-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={arrangeExecutiveInterviewObj} className="p-6 space-y-4 text-xs">
                
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850/80 space-y-1">
                  <span className="text-[9px] font-mono uppercase text-neutral-500 block">Vacant Role Context:</span>
                  <p className="text-white font-bold">{schedulingApplicant.jobTitle}</p>
                  <p className="text-[10px] text-indigo-400 font-mono font-bold">AI Sourcing Compatible: {schedulingApplicant.matchScore}% Match Score</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-neutral-405">Selected Calendar Date</label>
                  <input 
                    type="date" 
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full font-mono cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-neutral-405">Target Slot Time (UTC/Corporate Standard)</label>
                  <input 
                    type="time" 
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full font-mono cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-neutral-405">Interview Channel Mode</label>
                  <select 
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full cursor-pointer"
                  >
                    <option value="Google Meet Secure Video Channel">Google Meet Video Meeting (Unified Link)</option>
                    <option value="Microsoft Teams Live Integration">Microsoft Teams Corporate Portal</option>
                    <option value="San Francisco Office - Executive Suite C">In-Person: SF HQ Conference Room C</option>
                    <option value="Austin Office - Mobility Huddle Room A">In-Person: Austin HQ Huddle Room A</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-neutral-850 flex items-center justify-end gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-indigo-600/30"
                  >
                    Confirm & Dispatch Invites
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: CANDIDATE DOSSIER PROFILE SLIDEOVER / DETAILED POPUP */}
      <AnimatePresence>
        {viewingApplicant && (
          <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-end z-50">
            <div className="fixed inset-0" onClick={() => setViewingApplicant(null)} />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-neutral-900 border-l border-neutral-800 shadow-2xl w-full max-w-lg h-full overflow-y-auto relative z-10 flex flex-col justify-between"
            >
              {/* Slide-over header */}
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-950 border border-indigo-500/35">
                    {viewingApplicant.candidate.avatar ? (
                      <img src={viewingApplicant.candidate.avatar} alt="Candidate Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-400 font-bold font-mono">
                        {viewingApplicant.candidate.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold text-white leading-tight">{viewingApplicant.candidate.name}</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{viewingApplicant.candidate.title} ({viewingApplicant.candidate.level})</p>
                  </div>
                </div>
                <button onClick={() => setViewingApplicant(null)} className="text-neutral-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Side content area */}
              <div className="p-6 space-y-6 flex-1 text-xs">
                
                {/* Score panel inside dossier */}
                <div className="bg-[#0a0a14] rounded-2xl border border-indigo-500/15 p-4 space-y-2.5 relative overflow-hidden">
                  <div className="absolute right-3 top-3 w-16 h-16 rounded-full border-4 border-indigo-500/10 flex items-center justify-center font-mono font-extrabold text-white text-lg">
                    {viewingApplicant.matchScore}%
                  </div>

                  <span className="text-[9px] font-mono uppercase text-indigo-400 font-extrabold tracking-widest block">Aura Match Engine Core</span>
                  <p className="text-xs text-neutral-300 pr-14 leading-normal">
                    Outstanding technical compatibiliy score formulated. High consistency detected across operations, levels, and skill boundaries.
                  </p>
                  
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-neutral-500">Applicant status:</span>
                    <span className="px-2 py-0.5 rounded font-mono font-extrabold text-[9px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 uppercase">
                      {viewingApplicant.status}
                    </span>
                  </div>
                </div>

                {/* Sourcing details section */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-1 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-neutral-500" />
                    <span>Candidate Vitals Dossier</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-900 leading-relaxed text-neutral-400">
                      <span className="text-[8.5px] uppercase font-mono text-neutral-500 block mb-0.5">Node Department</span>
                      <strong className="text-white text-[10.5px] block">{viewingApplicant.candidate.department}</strong>
                    </div>

                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-900 leading-relaxed text-neutral-400">
                      <span className="text-[8.5px] uppercase font-mono text-neutral-500 block mb-0.5">Corporate Tenure</span>
                      <strong className="text-white text-[10.5px] block">Since {viewingApplicant.candidate.hireDate || "N/A"}</strong>
                    </div>

                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-900 leading-relaxed text-neutral-400">
                      <span className="text-[8.5px] uppercase font-mono text-neutral-500 block mb-0.5">Work Style Choice</span>
                      <strong className="text-white text-[10.5px] block">{viewingApplicant.candidate.workStyle}</strong>
                    </div>

                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-900 leading-relaxed text-neutral-400">
                      <span className="text-[8.5px] uppercase font-mono text-neutral-500 block mb-0.5">Open to Relocation</span>
                      <strong className="text-white text-[10.5px] block">{viewingApplicant.candidate.relocation ? "Yes (Global)" : "No (Static Location)"}</strong>
                    </div>
                  </div>
                </div>

                {/* Bio statement */}
                {viewingApplicant.candidate.bio && (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono text-neutral-500 font-bold block">Biographical Statement (Parsed Profile)</span>
                    <p className="bg-neutral-950/45 p-3.5 rounded-xl border border-neutral-900 text-neutral-400 leading-relaxed italic">
                      "{viewingApplicant.candidate.bio}"
                    </p>
                  </div>
                )}

                {/* Complete skills checklist */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-mono text-neutral-500 font-bold block">Skills Checklist ({viewingApplicant.candidate.skills?.length || 0})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingApplicant.candidate.skills?.map((skill: string) => (
                      <span key={skill} className="text-[9px] bg-neutral-950 border border-neutral-850 px-2 py-1 rounded font-mono font-bold text-neutral-300">
                        🛡️ {skill}
                      </span>
                    ))}
                    {!viewingApplicant.candidate.skills || viewingApplicant.candidate.skills.length === 0 && (
                      <span className="text-neutral-500 text-[10px] italic">No skills cataloged inside profile folder.</span>
                    )}
                  </div>
                </div>

                {/* Resume analyzer advice */}
                <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-indigo-400 font-bold">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-mono uppercase tracking-tight">Interactive AI Resume Analyser Brief</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-neutral-400">
                    Candidate masters core requirements. Calculated skill-gap overlaps are extremely slight. The candidate indicates high horizontal mobility velocity potential and an outstanding track history inside our corporate environment. 
                  </p>
                  <div className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-indigo-300">
                    🎯 <strong>Aura Recommendation:</strong> Fast-track straight into active evaluation loops.
                  </div>
                </div>

                {/* Interview Information if present */}
                {viewingApplicant.interviewDate && (
                  <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl space-y-2">
                    <div className="flex items-center space-x-1.5 text-indigo-400 font-bold font-mono text-[9px] uppercase">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Scheduled Evaluation Loop details</span>
                    </div>
                    <div className="text-neutral-300 text-[11px] space-y-1">
                      <p>Date: <strong className="text-white">{viewingApplicant.interviewDate}</strong></p>
                      <p>Time: <strong className="text-white">{viewingApplicant.interviewTime} Standard</strong></p>
                      <p>Meeting Room: <strong className="text-white">{viewingApplicant.interviewMode || "Google Video Channel"}</strong></p>
                    </div>
                  </div>
                )}

              </div>

              {/* Slider footer controls */}
              <div className="p-6 border-t border-neutral-800 bg-neutral-950/45 flex flex-wrap items-center justify-between gap-3">
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      setSchedulingApplicant(viewingApplicant);
                      setShowScheduleModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{viewingApplicant.interviewDate ? "Re-Schedule Loop" : "Schedule Interview"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {viewingApplicant.status !== "Approved" && (
                    <button 
                      onClick={() => progressCandidateStage(viewingApplicant.id, viewingApplicant.status, "Approved")}
                      className="px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 text-emerald-400 font-bold transition cursor-pointer"
                    >
                      Approve Placement
                    </button>
                  )}

                  {viewingApplicant.status !== "Rejected" && (
                    <button 
                      onClick={() => progressCandidateStage(viewingApplicant.id, viewingApplicant.status, "Rejected")}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-455 font-bold transition cursor-pointer"
                    >
                      Decline File
                    </button>
                  )}
                  
                  {viewingApplicant.status === "Applied" && (
                    <button 
                      onClick={() => progressCandidateStage(viewingApplicant.id, viewingApplicant.status, "Shortlisted")}
                      className="px-3 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600 hover:text-white border border-purple-500/20 text-purple-400 font-bold transition cursor-pointer"
                    >
                      Shortlist
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: AI RECRUITMENT MATCH RECOMMENDATION BAR */}
      <AnimatePresence>
        {activeRecomJob && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">MobilityAI Intel Sourcing Scout</h3>
                    <p className="text-[10px] text-neutral-400">Headhunting suggestions for: <strong className="text-white">{activeRecomJob.title}</strong></p>
                  </div>
                </div>
                <button onClick={() => setActiveRecomJob(null)} className="text-neutral-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-neutral-400 leading-relaxed bg-[#0a0a14] border border-neutral-850 p-3.5 rounded-2xl">
                  <strong>How it works:</strong> Our AI matching algorithms actively scan all system employee profiles, parsed resumes, and declared skills. It isolates top-compatibility candidates who are currently in other teams and haven't applied for this role yet. Clicking the dispatch button sends an invitation.
                </p>

                {loadingRecom ? (
                  <div className="py-12 text-center text-xs font-mono text-neutral-500 animate-pulse">
                    Synthesizing dynamic talent compatibility scores...
                  </div>
                ) : aiRecommendations.length === 0 ? (
                  <div className="py-12 text-center space-y-2 text-neutral-400">
                    <Users className="w-8 h-8 text-neutral-600 mx-auto animate-pulse" />
                    <p className="text-xs font-bold font-mono">No Unapplied Elite Candidates Found</p>
                    <p className="text-[11px] text-neutral-500 max-w-xs mx-auto p-1">
                      Our system did not detect any additional unapplied staff matching the minimum compatibility score of 40% skills overlap.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {aiRecommendations.map(candidate => (
                      <div key={candidate.userId} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850/80 hover:border-neutral-750 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3 max-w-[70%]">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                            {candidate.avatar ? (
                              <img src={candidate.avatar} alt="Candidate avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-mono font-bold text-white text-xs bg-indigo-500/10">
                                {candidate.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 text-xs">
                            <strong className="text-white font-bold block">{candidate.name}</strong>
                            <p className="text-[10px] text-neutral-400 leading-tight">{candidate.title}</p>
                            <p className="text-[10px] text-neutral-500 leading-none">Div Node: {candidate.department} • Tier {candidate.level}</p>

                            <div className="flex flex-wrap gap-1 mt-1.5 pt-0.5">
                              {candidate.skills.slice(0, 4).map((s: string) => (
                                <span key={s} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                                  {s}
                                </span>
                              ))}
                              {candidate.skills.length > 4 && (
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-indigo-400">+ {candidate.skills.length - 4} more</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recommendation compatibility score & CTA */}
                        <div className="flex items-center md:flex-col md:items-end justify-between gap-2 border-t md:border-t-0 border-neutral-900 pt-2.5 md:pt-0 shrink-0">
                          <div className="text-left md:text-right">
                            <span className="text-[8px] font-mono uppercase text-neutral-500 block leading-none">Compatibility Score</span>
                            <span className="text-xs font-mono font-extrabold text-purple-400 block mt-0.5">🔥 {candidate.matchScore}% Match</span>
                          </div>

                          <button 
                            disabled={dispatchSponsoringId === candidate.userId}
                            onClick={() => dispatchSponsoringEngagement(candidate)}
                            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {dispatchSponsoringId === candidate.userId ? (
                              <span className="animate-spin w-3.5 h-3.5 block border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <Mail className="w-3.5 h-3.5" />
                                <span>Invite to Apply</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-neutral-800 flex justify-end">
                <button onClick={() => setActiveRecomJob(null)} className="px-4 py-2 bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-xl hover:text-white transition cursor-pointer">
                  Close intel report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// Sub-component: Candidate Pipeline Card
interface CandidateCardProps {
  key?: any;
  applicant: any;
  onView: () => void;
  onSchedule: () => void;
  onUpdateStatus: (next: string) => any;
}

function CandidateCard({ applicant, onView, onSchedule, onUpdateStatus }: CandidateCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 hover:bg-neutral-900 transition flex flex-col justify-between space-y-3 shadow shadow-neutral-950">
      
      {/* Name and Rating */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0">
            {applicant.candidate.avatar ? (
              <img src={applicant.candidate.avatar} alt="Candidate Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono font-bold text-white text-[11px] bg-indigo-500/10">
                {applicant.candidate.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-xs">
            <strong className="text-white font-extrabold hover:underline block cursor-pointer" onClick={onView}>
              {applicant.candidate.name}
            </strong>
            <span className="text-[10px] text-neutral-400 block mt-0.5">{applicant.candidate.title}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-mono font-bold text-indigo-400">{applicant.matchScore}% Match</span>
        </div>
      </div>

      <div className="p-2 bg-neutral-950 rounded-xl space-y-1 border border-neutral-900 leading-normal text-[10px] text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 font-mono uppercase block shrink-0 text-[8.5px]">Vacancy targeted:</span>
          <span className="truncate text-white text-right max-w-[120px] font-medium">{applicant.jobTitle}</span>
        </div>
        <div className="flex items-center justify-between leading-none text-[8.5px] mt-1 text-neutral-500">
          <span>Applied: {applicant.appliedDate}</span>
          {applicant.interviewDate && <span className="text-indigo-400">Interview Scheduled</span>}
        </div>
      </div>

      {/* Sourcing chips check */}
      <div className="flex flex-wrap gap-1 max-h-[44px] overflow-hidden">
        {applicant.candidate.skills?.slice(0, 3).map((skill: string) => (
          <span key={skill} className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 leading-none">
            {skill}
          </span>
        ))}
      </div>

      {/* Bottom workflows controller buttons */}
      <div className="pt-2 border-t border-neutral-950/80 flex items-center justify-between text-[11px]">
        <button 
          onClick={onView}
          className="text-neutral-400 hover:text-white font-bold leading-none cursor-pointer flex items-center gap-0.5"
        >
          <span>Talent Dossier</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {applicant.status === "Shortlisted" && (
            <button 
              onClick={onSchedule}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg leading-tight cursor-pointer"
              title="Arrange meeting slot"
            >
              <span>Schedule Loop</span>
            </button>
          )}

          {applicant.status === "Applied" && (
            <button 
              onClick={() => onUpdateStatus("Shortlisted")}
              className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white font-bold rounded-lg leading-tight cursor-pointer"
            >
              <span>Shortlist</span>
            </button>
          )}

          {applicant.status === "Interviewing" && (
            <button 
              onClick={() => onUpdateStatus("Approved")}
              className="px-2 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-650 hover:text-white font-bold rounded-lg leading-tight cursor-pointer"
            >
              <span>Approve</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
