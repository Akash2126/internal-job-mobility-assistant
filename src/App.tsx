import React, { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Compass, Bot, BarChart3, Sliders, FileText, CheckCircle2, 
  Menu, X, ChevronRight, ArrowLeft, Users, Zap, ExternalLink, Lock, LogOut,
  Bell, Mail, Search, Info, Settings
} from "lucide-react";

// Modular Components & TS Types
import { EmployeeProfile, InternalJob, CareerMessage, HRAnalytics } from "./types";
import SkeletonLoader from "./components/SkeletonLoader";

// Lazy Loaded views for production bundle optimizations
const LandingPage = lazy(() => import("./components/LandingPage"));
const EmployeeDashboard = lazy(() => import("./components/EmployeeDashboard"));
const HRDashboard = lazy(() => import("./components/HRDashboard"));
const CareerCoach = lazy(() => import("./components/CareerCoach"));
const JobMatching = lazy(() => import("./components/JobMatching"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const ResumeUpload = lazy(() => import("./components/ResumeUpload"));
const AuthPage = lazy(() => import("./components/AuthPage"));
const OnboardingFlow = lazy(() => import("./components/OnboardingFlow"));
const EnterpriseMailLogs = lazy(() => import("./components/EnterpriseMailLogs"));

export default function App() {
  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem("mobility_token"));
  const [user, setUser] = useState<{ id: string; email: string; role: "EMPLOYEE" | "HR_ADMIN" } | null>(null);

  // Navigation states
  const [viewMode, setViewMode] = useState<"landing" | "app">("landing");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Corporate DB states
  const [activeDomain, setActiveDomain] = useState<string>("aiml");
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [jobs, setJobs] = useState<InternalJob[]>([]);
  const [hrData, setHrData] = useState<HRAnalytics | null>(null);
  const [chatLogs, setChatLogs] = useState<CareerMessage[]>([]);
  
  // App states
  const [selectedJob, setSelectedJob] = useState<InternalJob | null>(null);
  const [hasAppliedJobs, setHasAppliedJobs] = useState<string[]>([]);
  const [alertNotification, setAlertNotification] = useState<{title: string, msg: string} | null>(null);

  // Onboarding & Skeletons State variables
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChangingDomain, setIsChangingDomain] = useState(false);
  const [notifCenterOpen, setNotifCenterOpen] = useState(false);

  // Seeded notifications to build realistic SaaS visual data
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    msg: string;
    time: string;
    read: boolean;
    category: "credentials" | "application" | "system" | "coaching";
  }>>([
    {
      id: "notif-1",
      title: "Credential Database Sync",
      msg: "Your newly declared credentials have been successfully updated in the corporate SQLite repository.",
      time: "2 hours ago",
      read: false,
      category: "credentials"
    },
    {
      id: "notif-2",
      title: "Hiring Manager Match Alert",
      msg: "CTO Evelyn Vance logged high preference score mapping for candidates containing Kubernetes & Go configurations.",
      time: "4 hours ago",
      read: false,
      category: "application"
    },
    {
      id: "notif-3",
      title: "Aura Intelligence Online",
      msg: "Dynamic career coach system initialized. Ready to simulate software architecture interviews.",
      time: "1 day ago",
      read: true,
      category: "coaching"
    }
  ]);

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Secure request handler
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const activeToken = token || localStorage.getItem("mobility_token");
    const headers = {
      "Content-Type": "application/json",
      ...(activeToken ? { "Authorization": `Bearer ${activeToken}` } : {}),
      ...options.headers,
    };
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
    const targetUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const res = await fetch(targetUrl, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      // Automatic session expire handling
      localStorage.removeItem("mobility_token");
      setToken(null);
      setUser(null);
      setProfile(null);
      setViewMode("landing");
    }
    return res;
  };

  const safeParseJson = async (res: Response, fallback: any = null) => {
    try {
      if (!res.ok) return fallback;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
    } catch (e) {
      console.error("JSON parsing safety fallback triggered:", e);
    }
    return fallback;
  };

  // Sync state data whenever token status gets updated
  useEffect(() => {
    if (!token) return;

    async function initDB() {
      try {
        const meRes = await fetchWithAuth("/api/v1/auth/me");
        if (!meRes.ok) return;
        const meData = await safeParseJson(meRes);
        if (!meData || !meData.user) return;
        setUser(meData.user);
        setViewMode("app"); // Keep user inside the platform dashboard workspace

        // Role-Based initial landing optimization
        if (meData.user.role === "HR_ADMIN") {
          setActiveTab("hr");
        } else {
          setActiveTab("dashboard");
        }

        // Fetch basic info
        const [profileRes, jobsRes, chatRes] = await Promise.all([
          fetchWithAuth("/api/v1/profile"),
          fetchWithAuth("/api/v1/jobs"),
          fetchWithAuth(`/api/v1/coach/chat?domain=${activeDomain}`)
        ]);

        const profileData = await safeParseJson(profileRes);
        const jobsData = await safeParseJson(jobsRes, []);
        const chatData = await safeParseJson(chatRes, []);

        if (profileData && profileData.domain) {
          setActiveDomain(profileData.domain);
          setProfile(profileData);
        } else if (profileData) {
          setProfile(profileData);
        }

        setJobs(jobsData || []);
        setChatLogs(chatData || []);

        // Load applications history from DB to represent historical state
        const appHistoryRes = await fetchWithAuth("/api/v1/jobs/applications");
        if (appHistoryRes.ok) {
          const appHistory = await safeParseJson(appHistoryRes, []);
          const appliedIds = (appHistory || []).map((app: any) => app.jobId);
          setHasAppliedJobs(appliedIds);
        }

        // Conditionally fetch analytics only if authenticated user role is HR_ADMIN
        if (meData.user.role === "HR_ADMIN") {
          const hrRes = await fetchWithAuth(`/api/v1/hr/analytics?domain=${profileData?.domain || "all"}`);
          if (hrRes.ok) {
            const hrDataVal = await safeParseJson(hrRes);
            if (hrDataVal) {
              setHrData(hrDataVal);
            }
          }
        } else {
          // Provide an empty dashboard payload for EMPLOYEES (since it is restricted securely)
          setHrData({
            overviewMetrics: {
              totalEmployees: 450, activeInternalJobs: 34, internalTransitionsThisYear: 82,
              skillGapsIdentified: 104, aiMatchingAccuracy: "94.2%", employeeEngagementScore: "8.8/10",
              averageMobilityCycleDays: 24
            },
            departmentInsights: [], internalMobilityTrends: [], skillDemands: [], recentTransitions: []
          });
        }
      } catch (e) {
        console.error("Failed to load and authenticate full-stack database registries:", e);
      }
    }
    initDB();
  }, [token, activeDomain]);

  // Handle successful login or profile signup
  const handleAuthSuccess = (newToken: string, authedUser: any, authedProfile: any) => {
    localStorage.setItem("mobility_token", newToken);
    setToken(newToken);
    setUser(authedUser);
    setProfile(authedProfile);
    
    // Automatically direct users to appropriate spaces based on clear roles
    if (authedUser.role === "HR_ADMIN") {
      setActiveTab("hr");
    } else {
      setActiveTab("dashboard");
      // Triggers first-time welcome onboarding experience!
      setShowOnboarding(true);
    }
    setViewMode("app");
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("mobility_token");
    setToken(null);
    setUser(null);
    setProfile(null);
    setShowOnboarding(false);
    setViewMode("landing");
  };

  // Fetch dynamic domain switch via profile updates
  const handleSwitchDomain = async (domain: string) => {
    setIsChangingDomain(true);
    // Simulate high-fidelity network sync round-trip
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      const res = await fetchWithAuth("/api/v1/profile/update", {
        method: "POST",
        body: JSON.stringify({ domain, department: getDepartmentByDomain(domain) })
      });
      const data = await safeParseJson(res);
      if (data && data.success) {
        setActiveDomain(domain);
        setProfile(data.profile);

        // Fetch refreshed chat logs reflecting domain focus
        const chatRes = await fetchWithAuth(`/api/v1/coach/chat?domain=${domain}`);
        const chatData = await safeParseJson(chatRes, []);
        setChatLogs(chatData);

        // Refresh analytics if they are HR_ADMIN
        if (user?.role === "HR_ADMIN") {
          const hrRes = await fetchWithAuth(`/api/v1/hr/analytics?domain=${domain}`);
          if (hrRes.ok) {
            const hrDataVal = await safeParseJson(hrRes);
            if (hrDataVal) {
              setHrData(hrDataVal);
            }
          }
        }

        // Add dynamically a system notification log
        const syncNotif = {
          id: `notif-${Date.now()}`,
          title: "Technical Domain Swapped",
          msg: `Internal Job Mobility Assistant synced focus to '${domain.toUpperCase()}'. Automated matching parameters rebuilt successfully.`,
          time: "Just now",
          read: false,
          category: "system" as const
        };
        setNotifications(prev => [syncNotif, ...prev]);

        setAlertNotification({
          title: "Technical Domain Switch Active",
          msg: `Platform initialized for ${data.profile.name} focusing on '${domain.toUpperCase()}'. Recruiting pipelines synced.`
        });
        setTimeout(() => setAlertNotification(null), 5050);
      }
    } catch (err) {
      console.error("Failed to switch domain registry:", err);
    } finally {
      setIsChangingDomain(false);
    }
  };

  // helper utilities
  const getDepartmentByDomain = (domain: string) => {
    switch (domain) {
      case "aiml": return "AIML Engineering";
      case "fullstack": return "Full Stack Development";
      case "data": return "Data Analytics";
      case "salesforce": return "Salesforce Cloud";
      case "servicenow": return "Workflow Engineering";
      default: return "Information Technology";
    }
  };

  // AI Career Coach Send Message Event Handler (SQLite Context)
  const handleSendMessage = async (text: string) => {
    // Optimistic user update
    const userMsg: CareerMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "User",
      text,
      timestamp: new Date().toISOString()
    };
    
    setChatLogs(prev => [...prev, userMsg]);

    const res = await fetchWithAuth("/api/v1/coach/chat", {
      method: "POST",
      body: JSON.stringify({ text, domain: activeDomain })
    });
    const responseData = await safeParseJson(res);
    if (responseData && responseData.success) {
      setChatLogs(responseData.history);
    }
  };

  // Reset chat logs
  const handleResetChat = async () => {
    const res = await fetchWithAuth("/api/v1/coach/reset", {
      method: "POST",
      body: JSON.stringify({ domain: activeDomain })
    });
    const data = await safeParseJson(res);
    if (data && data.success) {
      setChatLogs(data.history);
    }
  };

  // Update employee profile parameters online
  const handleUpdateProfile = async (updated: Partial<EmployeeProfile>) => {
    const res = await fetchWithAuth("/api/v1/profile/update", {
      method: "POST",
      body: JSON.stringify(updated)
    });
    const data = await safeParseJson(res);
    if (data && data.success) {
      setProfile(data.profile);
    }
  };

  // Update profile interests
  const handleUpdateInterests = async (interests: string[]) => {
    await handleUpdateProfile({ interests });
  };

  // Upload/Extract resume logic using authentic Multipart Form-data
  const handleExtractResume = async (resumeText: string, fileName: string) => {
    const file = new File([resumeText], fileName, { type: "text/plain" });
    const formData = new FormData();
    formData.append("resume", file);

    const activeToken = token || localStorage.getItem("mobility_token");
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
    const res = await fetch(`${API_BASE_URL}/api/v1/resume/extract`, {
      method: "POST",
      headers: {
        ...(activeToken ? { "Authorization": `Bearer ${activeToken}` } : {}),
      },
      body: formData
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("mobility_token");
      setToken(null);
      setUser(null);
      setProfile(null);
      setViewMode("landing");
      throw new Error("Expired corporate session. Please login again.");
    }

    const data = await safeParseJson(res);
    if (data && data.success) {
      setProfile(data.updatedProfile);
      return data;
    }
    throw new Error((data && data.message) || "Failed parsing parameters.");
  };

  // Apply for internal role via persistent SQLite applications tracker
  const handleApplyJob = async (jobId: string) => {
    if (hasAppliedJobs.includes(jobId)) return;

    try {
      const res = await fetchWithAuth("/api/v1/jobs/apply", {
        method: "POST",
        body: JSON.stringify({ jobId, matchScore: 95 })
      });
      const data = await safeParseJson(res);
      if (data && data.success) {
        setHasAppliedJobs(prev => [...prev, jobId]);

        const job = jobs.find(j => j.id === jobId);
        if (job) {
          // Add notification to Notification center
          const applyNotif = {
            id: `notif-${Date.now()}`,
            title: "Application Synced",
            msg: `Transfer application for '${job.title}' submitted. High compatibility scorecard emailed to hiring manager ${job.hiringManager}.`,
            time: "Just now",
            read: false,
            category: "application" as const
          };
          setNotifications(prev => [applyNotif, ...prev]);

          setAlertNotification({
            title: "Internal Submission Vetted",
            msg: `Vetting parameters authorized. Matching metrics log transmitted to ${job.hiringManager}. Evaluation schedules active.`
          });
          
          setTimeout(() => {
            setAlertNotification(null);
          }, 6000);
        }
      }
    } catch (err) {
      console.error("Failed to submit applicant data:", err);
    }
  };

  // Switch tabs cleanly with access safeguards
  const handleSelectNav = (tab: string) => {
    if (tab === "hr" && (!user || user.role !== "HR_ADMIN")) {
      setAlertNotification({
        title: "Security Shield: Access Denied",
        msg: "The requested talent analytics panel and administrative workflows are restricted to authorized HR_ADMIN operators."
      });
      setTimeout(() => {
        setAlertNotification(null);
      }, 5000);
      return;
    }
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="bg-[#050508] text-[#E2E8F0] min-h-screen font-sans selection:bg-indigo-500 overflow-x-hidden relative select-none">

      {/* Floating alert compliance notifications */}
      {alertNotification && (
        <div id="compliance-alert-toast" className="fixed bottom-6 right-6 z-50 p-5 rounded-2xl bg-gradient-to-tr from-indigo-950 to-neutral-900 border-2 border-indigo-500/30 max-w-md shadow-2xl flex items-start space-x-3.5 backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <CheckCircle2 className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-white">{alertNotification.title}</h4>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">{alertNotification.msg}</p>
          </div>
          <button 
            onClick={() => setAlertNotification(null)}
            className="text-neutral-500 hover:text-white ml-2 text-sm focus:outline-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* RENDER VIEW MAPS */}
      <Suspense fallback={
        <div className="min-h-screen bg-[#030307] flex flex-col justify-center items-center font-mono text-xs text-neutral-400 space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="animate-pulse tracking-widest uppercase">Initializing Enterprise Portal...</span>
        </div>
      }>
        {viewMode === "landing" ? (
          <LandingPage 
            onLaunchApp={() => {
              if (token) {
                setViewMode("app");
              } else {
                setViewMode("app"); // Redirect flow to Auth page
              }
            }} 
            onSelectNav={handleSelectNav}
          />
        ) : !token ? (
          <AuthPage 
            onAuthSuccess={handleAuthSuccess}
            onBackToLanding={() => setViewMode("landing")}
          />
        ) : (
        /* Workspace App layout panel frame */
        <div id="app-workspace-body" className="min-h-screen flex flex-col md:flex-row relative">
          
          {/* Neon side background ambient drops */}
          <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[5%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          {/* Desktop Left Sidebar navigation */}
          <aside className="hidden md:flex flex-col w-64 border-r border-[#15151F] bg-[#07070E] shrink-0 h-screen sticky top-0 py-6 overflow-y-auto">
            
            {/* Top Corporate Logo */}
            <div className="px-6 flex items-center justify-between">
              <div 
                className="flex items-center space-x-2.5 cursor-pointer"
                onClick={() => setViewMode("landing")}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                   <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white block text-sm leading-none">Internal Job Mobility</span>
                  <span className="text-[9px] text-[#818CF8] font-mono tracking-wider font-semibold block mt-1">Assistant Suite</span>
                </div>
              </div>
            </div>

            {/* Return to Landing link */}
            <div className="px-6 mt-6">
              <button
                onClick={() => setViewMode("landing")}
                className="w-full py-2.5 px-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-400 font-bold hover:text-white transition duration-150 text-[11px] font-mono uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Marketing Portal</span>
              </button>
            </div>

            {/* Enterprise Domain Ecosystem Selector */}
            <div className="px-6 mt-6">
              <span className="text-[9px] font-mono uppercase text-[#818CF8] font-extrabold px-1 block mb-2 tracking-wider">Technical Division</span>
              <div className="relative">
                <select
                  value={activeDomain}
                  onChange={(e) => handleSwitchDomain(e.target.value)}
                  className="w-full bg-[#10101A] border-2 border-indigo-500/20 text-xs text-neutral-200 py-3 pl-3.5 pr-8 rounded-xl outline-none focus:border-indigo-500 font-semibold cursor-pointer appearance-none transition-all duration-300 hover:bg-[#131322]"
                >
                  <option value="aiml">AIML Engineering</option>
                  <option value="fullstack">Full Stack Development</option>
                  <option value="data">Data Analytics</option>
                  <option value="salesforce">Salesforce Development</option>
                  <option value="servicenow">ServiceNow Engineering</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* Main Tabs list */}
            <div className="mt-8 space-y-1 px-4 flex-1">
              <span className="text-[9px] font-mono uppercase text-neutral-600 font-extrabold px-3 block mb-2">Employee Portal</span>
              
              <button
                onClick={() => handleSelectNav("dashboard")}
                className={`w-full py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeTab === "dashboard"
                  ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500 font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                }`}
              >
                <span className="flex items-center gap-2.5"><Compass className="w-4 h-4" /> Employee Dashboard</span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-600 ${activeTab === 'dashboard' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button
                onClick={() => handleSelectNav("matching")}
                className={`w-full py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeTab === "matching"
                  ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500 font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                }`}
              >
                <span className="flex items-center gap-2.5"><Zap className="w-4 h-4" /> Job Match Engine</span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-600 ${activeTab === 'matching' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button
                onClick={() => handleSelectNav("coach")}
                className={`w-full py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeTab === "coach"
                  ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500 font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                }`}
              >
                <span className="flex items-center gap-2.5"><Bot className="w-4 h-4" /> AI Coach chat</span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-600 ${activeTab === 'coach' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button
                onClick={() => handleSelectNav("profile")}
                className={`w-full py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeTab === "profile"
                  ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500 font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                }`}
              >
                <span className="flex items-center gap-2.5"><Sliders className="w-4 h-4" /> Profile & Target Skills</span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-600 ${activeTab === 'profile' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button
                onClick={() => handleSelectNav("upload")}
                className={`w-full py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeTab === "upload"
                  ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500 font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                }`}
              >
                <span className="flex items-center gap-2.5"><FileText className="w-4 h-4" /> Resume Extractor</span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-600 ${activeTab === 'upload' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button
                onClick={() => handleSelectNav("mail")}
                className={`w-full py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeTab === "mail"
                  ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500 font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                }`}
              >
                <span className="flex items-center gap-2.5"><Mail className="w-4 h-4" /> Communications SMTP</span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-600 ${activeTab === 'mail' ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <span className="text-[9px] font-mono uppercase text-neutral-600 font-extrabold px-3 block pt-6 mb-2">Management Workspace</span>

              <button
                onClick={() => handleSelectNav("hr")}
                className={`w-full py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeTab === "hr"
                  ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500 font-bold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                }`}
              >
                <span className="flex items-center gap-2.5"><BarChart3 className="w-4 h-4" /> HR Talent Analytics</span>
                <span className={`w-2.5 h-2.5 rounded-full ${user?.role === "HR_ADMIN" ? "bg-emerald-500" : "bg-neutral-600"} animate-pulse block shrink-0`} />
              </button>
            </div>

            {/* Bottom active status details card */}
            {profile && (
              <div className="px-5 mt-auto pt-6 border-t border-neutral-900">
                <div className="flex items-center space-x-3.5 mb-4">
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    className="w-10 h-10 rounded-full border border-neutral-800 object-cover" 
                  />
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white block truncate leading-none mb-1">{profile.name}</span>
                    <span className="text-[9px] font-mono text-[#818CF8] font-bold block truncate leading-none">{user?.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Session</span>
                </button>
              </div>
            )}
          </aside>

          {/* Mobile Top Navbar Controls Header */}
          <header className={`md:hidden shrink-0 border-b border-neutral-900 bg-neutral-950/90 text-white p-4 flex items-center justify-between z-30 sticky top-0 backdrop-blur`}>
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white leading-none">Internal Job Mobility</span>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="text-neutral-400 hover:text-white p-1 focus:outline-none cursor-pointer"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Mobile Retractable menu slide overlay */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-40 bg-neutral-950/95 backdrop-blur-md flex flex-col p-6 space-y-8 md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-white">Mobility Assistant Portal</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-neutral-500 hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-4 flex-1">
                {/* Mobile Division Selector */}
                <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-800">
                  <span className="text-[9px] font-mono uppercase text-[#818CF8] font-extrabold block mb-2 tracking-wide">Division focus</span>
                  <select
                    value={activeDomain}
                    onChange={(e) => {
                      handleSwitchDomain(e.target.value);
                      setMobileSidebarOpen(false);
                    }}
                    className="w-full bg-[#10101A] border border-[#2B2B3E] text-xs text-neutral-200 py-2.5 px-3 rounded-lg outline-none font-semibold cursor-pointer text-white"
                  >
                    <option value="aiml">AIML Engineering</option>
                    <option value="fullstack">Full Stack Development</option>
                    <option value="data">Data Analytics</option>
                    <option value="salesforce">Salesforce Development</option>
                    <option value="servicenow">ServiceNow Engineering</option>
                  </select>
                </div>

                <span className="text-[10px] font-mono uppercase text-neutral-600 font-extrabold block mb-3">Sections Navigation</span>
                <button onClick={() => handleSelectNav("dashboard")} className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400 text-left' : 'text-neutral-300'}`}>Employee Dashboard</button>
                <button onClick={() => handleSelectNav("matching")} className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold ${activeTab === 'matching' ? 'bg-indigo-600/10 text-indigo-400' : 'text-neutral-300'}`}>Job Match Engine</button>
                <button onClick={() => handleSelectNav("coach")} className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold ${activeTab === 'coach' ? 'bg-indigo-600/10 text-indigo-400' : 'text-neutral-300'}`}>AI Coach Agent</button>
                <button onClick={() => handleSelectNav("profile")} className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold ${activeTab === 'profile' ? 'bg-indigo-600/10 text-indigo-400' : 'text-neutral-300'}`}>Profile & Skill Prefs</button>
                <button onClick={() => handleSelectNav("upload")} className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold ${activeTab === 'upload' ? 'bg-indigo-600/10 text-indigo-400' : 'text-neutral-300'}`}>Resume Parser</button>
                <button onClick={() => handleSelectNav("mail")} className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold ${activeTab === 'mail' ? 'bg-indigo-600/10 text-indigo-400' : 'text-neutral-300'}`}>Communications SMTP</button>
                <button onClick={() => handleSelectNav("hr")} className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold ${activeTab === 'hr' ? 'bg-indigo-600/10 text-indigo-400' : 'text-neutral-300'}`}>HR Talent Analytics</button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-xl font-bold border border-red-500/20 text-xs"
                >
                  Logout Session
                </button>
                <button
                  onClick={() => {
                    setViewMode("landing");
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-3 bg-neutral-900 rounded-xl hover:bg-neutral-800 text-neutral-300 font-bold border border-neutral-800 text-xs"
                >
                  Back to Marketing
                </button>
              </div>
            </div>
          )}

          {/* Onboarding Dialog Wizard overlay */}
          {showOnboarding && (
            <OnboardingFlow 
              onComplete={(domain, bio) => {
                handleSwitchDomain(domain);
                handleUpdateProfile({ bio });
                setShowOnboarding(false);
              }}
              onClose={() => setShowOnboarding(false)}
            />
          )}

          {/* Main workspace frame viewport */}
          <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto w-full z-10 relative">
            
            {/* Full-stack load status shield */}
            {!profile || !hrData ? (
              <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-xs text-neutral-500 font-mono tracking-widest uppercase font-bold">Synchronizing enterprise registry...</span>
              </div>
            ) : (
              /* Render workspace elements */
              <>
                {/* Horizontal Top Command bar */}
                <div id="workspace-top-bar" className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-neutral-900/80 gap-4">
                  <div className="flex items-center space-x-3 bg-neutral-900/40 border border-neutral-850 rounded-xl px-3.5 py-2.5 w-full max-w-md">
                    <Search className="w-4 h-4 text-neutral-500" />
                    <input 
                      type="text" 
                      placeholder="Search vacancies, target skills, upskilling modules..." 
                      className="bg-transparent border-none text-xs text-neutral-200 focus:outline-none w-full font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-end">
                    {user?.role === "EMPLOYEE" && (
                      <button
                        onClick={() => setShowOnboarding(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-600 hover:text-white transition cursor-pointer text-indigo-300 font-sans shadow-md"
                      >
                        Launch Onboard
                      </button>
                    )}

                    {/* Notification center bell container */}
                    <div className="relative">
                      <button 
                        onClick={() => setNotifCenterOpen(!notifCenterOpen)}
                        className="p-2.5 rounded-xl border border-neutral-850 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-400 hover:text-white transition relative cursor-pointer"
                      >
                        <Bell className="w-4 h-4" />
                        {notifications.some(n => !n.read) && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#818CF8] block animate-pulse border border-neutral-950" />
                        )}
                      </button>

                      {notifCenterOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setNotifCenterOpen(false)} />
                          <div className="absolute right-0 mt-3 w-80 bg-[#090910] border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-4 shadow-2xl z-40 space-y-3.5">
                            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                              <span className="text-xs font-bold text-white uppercase tracking-tight">Enterprise Alerts Center</span>
                              <button 
                                onClick={() => {
                                  markAllNotifsRead();
                                  setNotifCenterOpen(false);
                                }}
                                className="text-[10px] text-indigo-400 hover:underline font-bold font-mono uppercase cursor-pointer"
                              >
                                Mark all view
                              </button>
                            </div>
                            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                              {notifications.map(n => (
                                <div 
                                  key={n.id} 
                                  className={`p-3 rounded-xl border text-left space-y-1 text-xs transition ${
                                    n.read 
                                    ? "bg-neutral-950/40 border-neutral-900/60 text-neutral-400" 
                                    : "bg-indigo-600/5 border-indigo-500/20 text-neutral-200 font-medium"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-white block truncate">{n.title}</span>
                                    <span className="text-[8px] font-mono text-neutral-500 block shrink-0">{n.time}</span>
                                  </div>
                                  <p className="text-[10px] text-neutral-400 leading-snug">{n.msg}</p>
                                </div>
                              ))}
                              {notifications.length === 0 && (
                                <span className="text-[11px] text-neutral-500 block text-center py-4">No notifications present.</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skeletons loader or View Content render */}
                <div className="transition-all duration-300">
                  {isChangingDomain ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-neutral-900/10 border border-neutral-850 rounded-2xl animate-pulse">
                        <div className="w-12 h-12 bg-neutral-800 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 bg-neutral-800 rounded-md w-[40%]" />
                          <div className="h-2 bg-neutral-850 rounded-md w-[60%]" />
                        </div>
                      </div>
                      <SkeletonLoader />
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Suspense fallback={
                          <div className="p-6 space-y-6">
                            <div className="animate-pulse flex space-x-4">
                              <div className="rounded-full bg-neutral-800 h-10 w-10"></div>
                              <div className="flex-grow space-y-3 py-1">
                                <div className="h-2 bg-neutral-800 rounded w-[40%]"></div>
                                <div className="h-2 bg-neutral-850 rounded w-[60%]"></div>
                              </div>
                            </div>
                            <SkeletonLoader />
                          </div>
                        }>
                          {activeTab === "dashboard" && (
                  user?.role === "HR_ADMIN" ? (
                    // RBAC PROTECT: Prevent HR_ADMIN from viewing standard IC Dashboard
                    <div className="glass-card p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 mt-12 relative overflow-hidden border border-yellow-500/15 bg-yellow-950/5 rounded-2xl">
                      <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none blur-3xl rounded-full" />
                      <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto border border-yellow-400/20">
                        <Users className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-black text-white">👥 Individual Contributor View Restricted</h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                          You are authenticated with <strong>HR_ADMIN</strong> permissions. The individual employee dashboard tracking personal upskilling and specific match applications is restricted for audit purposes. Please utilize the official Talent Analytics Dashboard.
                        </p>
                      </div>
                      <div className="pt-4 flex justify-center gap-4">
                        <button onClick={() => setActiveTab("hr")} className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-xl hover:border-neutral-700 transition">
                          Go to HR Analytics
                        </button>
                        <button onClick={handleLogout} className="px-5 py-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl hover:border-indigo-500/40 transition">
                          Switch Account
                        </button>
                      </div>
                    </div>
                  ) : (
                    <EmployeeDashboard 
                      profile={profile} 
                      jobs={jobs} 
                      onSelectJob={(job) => {
                         setSelectedJob(job);
                         setActiveTab("matching");
                      }}
                      onNavigateTab={handleSelectNav}
                      onUpdateInterests={handleUpdateInterests}
                      onUpdateProfile={handleUpdateProfile}
                    />
                  )
                )}

                {activeTab === "matching" && (
                  <JobMatching 
                    jobs={jobs} 
                    selectedJob={selectedJob} 
                    onSelectJob={setSelectedJob}
                    onApplyJob={handleApplyJob}
                    hasApplied={hasAppliedJobs}
                    fetchWithAuth={fetchWithAuth}
                  />
                )}

                {activeTab === "coach" && (
                  <CareerCoach 
                    chatHistory={chatLogs} 
                    onSendMessage={handleSendMessage} 
                    onResetChat={handleResetChat}
                  />
                )}

                {activeTab === "profile" && (
                  <ProfilePage 
                    profile={profile} 
                    jobs={jobs}
                    onUpdateProfile={handleUpdateProfile}
                  />
                )}

                {activeTab === "upload" && (
                  <ResumeUpload 
                    profile={profile} 
                    onExtractResume={handleExtractResume}
                  />
                )}

                {activeTab === "hr" && (
                  user?.role === "EMPLOYEE" ? (
                    // RBAC PROTECT: Prevent standard EMPLOYEE from viewing HR Talent Analytics Dashboard
                    <div className="glass-card p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 mt-12 relative overflow-hidden border border-red-500/15 bg-red-950/5 rounded-2xl">
                      <div className="absolute inset-0 bg-red-500/5 pointer-events-none blur-3xl rounded-full" />
                      <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-400/20">
                        <Lock className="w-8 h-8 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-black text-white">🔒 Administrative Access Restricted</h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                          Section reserved exclusively for authorized People Architects and HR Strategists. Employee profiles of tier <strong>{profile?.level || "L5"}</strong> do not possess valid credentials for this portal under enterprise policy.
                        </p>
                      </div>
                      <div className="pt-4 flex justify-center gap-4">
                        <button onClick={() => setActiveTab("dashboard")} className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-xl hover:border-neutral-700 transition">
                          Return to My Dashboard
                        </button>
                        <button onClick={handleLogout} className="px-5 py-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl hover:border-indigo-500/40 transition">
                          Switch Account
                        </button>
                      </div>
                    </div>
                  ) : (
                    <HRDashboard 
                      analytics={hrData}
                      fetchWithAuth={fetchWithAuth}
                      jobs={jobs}
                      onRefreshJobs={async () => {
                        try {
                          const res = await fetchWithAuth("/api/v1/jobs");
                          if (res.ok) {
                            const data = await safeParseJson(res, []);
                            if (data) {
                              setJobs(data);
                            }
                          }
                        } catch (e) {
                          console.error("State sync failed: ", e);
                        }
                      }}
                    />
                  )
                )}

                {activeTab === "mail" && (
                  <EnterpriseMailLogs />
                )}
                        </Suspense>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </>
            )}
          </main>

        </div>
      )}
      </Suspense>

    </div>
  );
}
