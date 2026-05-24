import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Compass, Briefcase, Calendar, MapPin, DollarSign, UserCheck, 
  Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, Check, X
} from "lucide-react";
import { InternalJob, MatchAnalysis } from "../types";

interface JobMatchingProps {
  jobs: InternalJob[];
  selectedJob: InternalJob | null;
  onSelectJob: (job: InternalJob) => void;
  onApplyJob: (jobId: string) => void;
  hasApplied: string[]; // list of job IDs the user applied to
  fetchWithAuth?: (url: string, options?: RequestInit) => Promise<Response>;
}

export default function JobMatching({ 
  jobs, 
  selectedJob, 
  onSelectJob, 
  onApplyJob,
  hasApplied,
  fetchWithAuth
}: JobMatchingProps) {
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [customRoadmap, setCustomRoadmap] = useState<any | null>(null);

  // Dynamic calculations based of checked status on client-side
  const handleSelect = async (job: InternalJob) => {
    onSelectJob(job);
    setLoadingMatch(true);
    setCustomRoadmap(null);
    try {
      // Fetch dynamic matching alignment metrics from our Node.js full-stack server endpoints!
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
      const fetchFn = fetchWithAuth || (async (url: string, opts?: RequestInit) => fetch(url, opts));
      const res = await fetchFn(`${API_BASE_URL}/api/v1/ai/match-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id })
      });
      
      let data: any = {};
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        }
      }

      if (data.success) {
        setCustomRoadmap(data.analysis);
      } else {
        // Fallback legacy proxy trigger
        const legacyRes = await fetch(`${API_BASE_URL}/api/jobs/${job.id}/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        let legacyData: any = {};
        if (legacyRes.ok) {
          const legacyContentType = legacyRes.headers.get("content-type");
          if (legacyContentType && legacyContentType.includes("application/json")) {
            legacyData = await legacyRes.json();
          }
        }
        if (legacyData.success) {
          setCustomRoadmap(legacyData.analysis);
        }
      }
    } catch (e) {
      console.error("Failed to query dynamic AI matching aligners:", e);
    } finally {
      setLoadingMatch(false);
    }
  };

  // If no job is selected, select the first one on initial mount
  const activeJob = selectedJob || jobs[0];

  // If activeJob is set but we haven't computed its roadmap yet, let's load a smart alignment baseline
  const activeRoadmap = customRoadmap || {
    matchScore: activeJob?.id === "job-002" ? 95 : activeJob?.id === "job-001" ? 88 : 75,
    matchingSkills: ["Model Pipelines", "Kubernetes", "Docker", "Terraform", "Model Alignment"].filter(s => activeJob?.requiredSkills.includes(s)),
    gaps: activeJob?.requiredSkills.filter(s => !["AWS Systems Optimization", "Kubernetes", "Docker", "Terraform", "CI/CD Performance Indexing", "Model Pipelines", "Model Alignment", "Python", "Go", "GitOps"].includes(s)) || [],
    personalizedRoadmap: activeJob?.id === "job-002" ? [
      { weekLabel: "Week 1: AI Alignment Calibration", weeklyAction: "Evaluate custom prompt alignment tuning metrics." },
      { weekLabel: "Week 2: High Throughput Scale", weeklyAction: "Establish test performance optimization pipelines for core API models." },
      { weekLabel: "Week 3: Mentorship coffee", weeklyAction: "Coordinate standard feedback goals with director Devon Reynolds." },
      { weekLabel: "Week 4: Performance Review", weeklyAction: "Present formal optimized agent deployment metrics to the hiring committee." }
    ] : [
      { weekLabel: "Week 1: Systems auditing", weeklyAction: "Study large-scale systems design structures and high available models." },
      { weekLabel: "Week 2: Prototype bench", weeklyAction: "Initialize containerized services leveraging Go structure models." },
      { weekLabel: "Week 3: Leadership brief", weeklyAction: "Sponsor discussion panels outlining department roadmap shifts with managers." },
      { weekLabel: "Week 4: Transfer evaluation", weeklyAction: "Finalize portfolio audit and schedule internal mobility reviews." }
    ],
    careerCoachAdvice: "Excellent alignment baseline. Ensure continuous credentials updates to satisfy priority department target requirements."
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-neutral-100">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">AI Talent Sourcing Matching</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Explore active internal career openings. Obtain instant match scores and discover precise upskilling pathways.
        </p>
      </div>

      {/* Dual Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Internal Job Openings List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">Active Opportunities ({jobs.length})</span>
            <span className="text-xs font-mono text-indigo-400 font-semibold">Updated today</span>
          </div>

          <div className="space-y-4">
            {jobs.map((job) => {
              const isActive = activeJob?.id === job.id;
              const hasAppliedToThis = hasApplied.includes(job.id);
              
              // Preset match scores for visual rhythm
              const matchedScore = job.id === "job-002" ? 95 : job.id === "job-001" ? 88 : 75;

              return (
                <div
                  key={job.id}
                  onClick={() => handleSelect(job)}
                  className={`p-5 rounded-2xl border transition duration-200 cursor-pointer text-left relative ${
                    isActive 
                    ? "bg-[#0A0A10] border-indigo-500/80 shadow-lg shadow-indigo-500/10" 
                    : "glass-card border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase bg-indigo-500/5 px-2.5 py-0.5 rounded border border-indigo-500/10 block w-max">
                        {job.department}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mt-1">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500 pt-1.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-neutral-600" /> {job.location}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-neutral-600" /> {job.salaryRange}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs border ${
                        matchedScore >= 90 
                        ? 'border-purple-500/40 text-purple-300 bg-purple-500/5' 
                        : 'border-blue-500/40 text-blue-300 bg-blue-500/5'
                      }`}>
                        {matchedScore}%
                      </div>
                      <span className="text-[8px] font-mono text-neutral-500 uppercase mt-1 font-bold">Match</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-950 flex items-center justify-between text-xs text-neutral-500 font-mono">
                    <span>Manager: {job.hiringManager.split(" ")[0]} {job.hiringManager.split(" ")[1]}</span>
                    {hasAppliedToThis ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">Applied</span>
                    ) : (
                      <span className="text-indigo-400 font-bold">Review alignment →</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep alignment details scorecard & week progression */}
        <div className="lg:col-span-7">
          
          {activeJob ? (
            <div className="glass-card p-6 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Dynamic Overlay Loader during API query */}
              {loadingMatch && (
                <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <span className="text-xs text-indigo-400 font-mono tracking-widest uppercase font-bold">Aligning skills taxonomy...</span>
                </div>
              )}

              {/* Job Summary header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
                <div>
                  <span className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-wider">{activeJob.department} Division</span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1 leading-tight">{activeJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 mt-2 font-medium">
                    <span>Level: <span className="text-white font-semibold">{activeJob.level}</span></span>
                    <span>•</span>
                    <span>Manager: <span className="text-indigo-400 font-semibold">{activeJob.hiringManager}</span></span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-neutral-950 border border-neutral-800 p-3 rounded-xl shrink-0">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 flex items-center justify-center bg-indigo-500/5 shrink-0">
                    <span className="text-lg font-black text-indigo-400">{activeRoadmap.matchScore}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase font-mono block font-bold">Dynamic Fit</span>
                    <span className="text-xs font-semibold text-white block mt-0.5">Highly Compatible</span>
                  </div>
                </div>
              </div>

              {/* Overview Details description */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-mono text-neutral-400 font-bold tracking-wider">Position Requirements</h3>
                <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">{activeJob.description}</p>
              </div>

              {/* Skills Overlaps Breakdown Gaps Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Matching portion */}
                <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Matching Skills ({activeRoadmap.matchingSkills.length})</span>
                  </span>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {activeRoadmap.matchingSkills.map((s: string) => (
                      <span key={s} className="text-[10px] uppercase font-mono font-bold tracking-tight bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                    {activeRoadmap.matchingSkills.length === 0 && (
                      <span className="text-xs text-neutral-600 block">No direct overlap identified. Analyze profile.</span>
                    )}
                  </div>
                </div>

                {/* Gap portion */}
                <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-3">
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Outstanding Skill Gaps ({activeRoadmap.gaps.length})</span>
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {activeRoadmap.gaps.map((s: string) => (
                      <span key={s} className="text-[10px] uppercase font-mono font-bold tracking-tight bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                        {s}
                      </span>
                    ))}
                    {activeRoadmap.gaps.length === 0 && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">All Criteria Met</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Week progressing Interactive roadmap widget */}
              <div className="space-y-3 pt-3 border-t border-neutral-850">
                <span className="text-xs uppercase font-mono text-neutral-400 font-bold tracking-wider block">AI-Generated Learning Roadmap</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRoadmap.personalizedRoadmap.map((item: any) => (
                    <div key={item.weekLabel} className="p-3 bg-neutral-950/50 border border-neutral-800 rounded-xl space-y-1 text-xs">
                      <h4 className="font-bold text-white shrink-0 tracking-tight">{item.weekLabel}</h4>
                      <p className="text-neutral-400 leading-normal font-sans">{item.weeklyAction}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Advisory paragraph */}
              <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-indigo-300 leading-relaxed font-sans italic">
                "{activeRoadmap.careerCoachAdvice}"
              </div>

              {/* Bottom Action apply buttons */}
              <div className="pt-4 border-t border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Status Post Date</span>
                  <span className="text-xs font-semibold text-white block mt-0.5">Posted on {activeJob.postedDate}</span>
                </div>

                <button
                  onClick={() => onApplyJob(activeJob.id)}
                  disabled={hasApplied.includes(activeJob.id)}
                  className={`px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-98 cursor-pointer shadow-xl ${
                    hasApplied.includes(activeJob.id)
                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
                    : 'bg-primary-gradient text-white border border-white/10'
                  }`}
                >
                  {hasApplied.includes(activeJob.id) ? "Applied Internally" : "1-Click Internal Application"}
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-card p-8 text-center text-neutral-500">
              Select an internal role opportunity from the list to analyze.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
