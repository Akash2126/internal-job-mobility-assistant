import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Building, User, Cpu, Award, BadgeAlert, Sparkles, ArrowUpRight, 
  ChevronRight, CheckCircle2, CircleDot, TrendingUp, Compass, Calendar, Edit3,
  AlertCircle, Check, ArrowRight
} from "lucide-react";
import { EmployeeProfile, InternalJob } from "../types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
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

interface EmployeeDashboardProps {
  profile: EmployeeProfile;
  jobs: InternalJob[];
  onSelectJob: (job: InternalJob) => void;
  onNavigateTab: (tab: string) => void;
  onUpdateInterests: (interests: string[]) => void;
  onUpdateProfile: (updated: Partial<EmployeeProfile>) => Promise<void>;
}

export default function EmployeeDashboard({ 
  profile, 
  jobs, 
  onSelectJob, 
  onNavigateTab,
  onUpdateInterests,
  onUpdateProfile
}: EmployeeDashboardProps) {
  const [editingBio, setEditingBio] = useState(false);
  const [quickBioText, setQuickBioText] = useState(profile.bio);
  const [selectedGapJobId, setSelectedGapJobId] = useState<string>(jobs[0]?.id || "");

  // Sync selected job state on dynamic domain switch
  React.useEffect(() => {
    if (jobs && jobs.length > 0) {
      const exists = jobs.some(j => j.id === selectedGapJobId);
      if (!exists) {
        setSelectedGapJobId(jobs[0].id);
      }
    }
  }, [jobs, selectedGapJobId]);
  
  // Track check marks on upskilling tasks to dynamically elevate the match simulation!
  const [completedRoadmapSteps, setCompletedRoadmapSteps] = useState<string[]>([
    "Foundational AWS Cloud Specialization",
    "Certified Kubernetes Administrator (CKA)"
  ]);

  const toggleStep = (step: string) => {
    if (completedRoadmapSteps.includes(step)) {
      setCompletedRoadmapSteps(completedRoadmapSteps.filter(s => s !== step));
    } else {
      setCompletedRoadmapSteps([...completedRoadmapSteps, step]);
    }
  };

  const [newInterestInput, setNewInterestInput] = useState("");
  const handleAddInterest = () => {
    if (newInterestInput.trim()) {
      onUpdateInterests([...profile.interests, newInterestInput.trim()]);
      setNewInterestInput("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    onUpdateInterests(profile.interests.filter(i => i !== interest));
  };

  // Mock Roadmap tasks
  const upskillingTasks = [
    { id: "step-1", title: "Robust Prompt Alignment and Agent Tuning Systems", category: "LLM Orchestration" },
    { id: "step-2", title: "High-Performance Systems & gRPC Layer Architecting", category: "Microservices" },
    { id: "step-3", title: "Enterprise Decoupling Patterns & Spanner SQL Tuning", category: "Backend Scaling" },
    { id: "step-4", title: "High-Throughput Analytics for AI Agents", category: "Enterprise AI" }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12 font-sans text-neutral-100"
    >
      
      {/* Dynamic Welcome Banner */}
      <motion.div 
        id="dashboard-banner" 
        variants={itemVariants}
        className="relative p-6 md:p-8 rounded-2xl border border-indigo-500/10 bg-gradient-to-tr from-indigo-950/20 via-neutral-900/60 to-purple-950/20 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-75 blur group-hover:opacity-100 transition" />
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-neutral-800 object-cover" 
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-indigo-500 border border-neutral-950 text-white flex items-center justify-center text-[8px] font-bold">
                L5
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">{profile.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] uppercase font-mono font-bold">
                  Active Career Map
                </span>
              </div>
              <p className="text-sm md:text-base text-neutral-300 font-medium mt-1">
                {profile.title} • <span className="text-indigo-400 font-semibold">{profile.department}</span>
              </p>
              <div className="flex items-center space-x-4 text-xs text-neutral-400 mt-2">
                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-neutral-500" /> Tenure: 3 Years</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-neutral-500" /> Mobility Stage: L5 → L6</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-4 shrink-0 shadow-md">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">Mobility Readiness</span>
              <span className="text-2xl font-extrabold gradient-text block mt-0.5">88%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout: Profile & Gaps (Left) vs Job Alignments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Profile Bio, Skills & Upskilling progress */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Card: Portfolio Bio & Interests */}
          <motion.div id="dashboard-bio" variants={itemVariants} className="glass-card p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-400" />
                <h3 className="text-md font-bold text-white">Interactive Profile Statement</h3>
              </div>
              <button 
                onClick={() => setEditingBio(!editingBio)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono uppercase tracking-wider"
              >
                <Edit3 className="w-3 h-3" />
                {editingBio ? "[ Save bio ]" : "Edit Bio"}
              </button>
            </div>

            {editingBio ? (
              <textarea
                value={quickBioText}
                onChange={(e) => setQuickBioText(e.target.value)}
                className="w-full h-24 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-300 text-sm focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            ) : (
              <p className="text-sm text-neutral-300 leading-relaxed font-sans mt-2">
                {quickBioText}
              </p>
            )}

            {/* Quick interests management */}
            <div className="space-y-3 pt-3 border-t border-neutral-800/80">
              <span className="text-xs uppercase font-mono text-neutral-400 font-bold">Priority Target Pathways</span>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span 
                    key={interest} 
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/5 text-purple-400 text-xs border border-purple-500/20 font-bold flex items-center space-x-1"
                  >
                    <span>{interest}</span>
                    <button 
                      onClick={() => handleRemoveInterest(interest)} 
                      className="text-[10px] text-red-400/70 hover:text-red-400 ml-1.5 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add target path (e.g. AI System Engineer)"
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition w-full"
                  onKeyDown={(e) => e.key === "Enter" && handleAddInterest()}
                />
                <button 
                  onClick={handleAddInterest}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card: Core Skill Tokens & Certifications */}
          <motion.div id="dashboard-skills" variants={itemVariants} className="glass-card p-6 shadow-xl space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <h3 className="text-md font-bold text-white">Active Skills Taxonomy</h3>
              </div>
              <p className="text-xs text-neutral-500 mt-1">Identified and verified technical or management abilities.</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.skills.map((skill) => {
                  const isCrucial = skill.toLowerCase().includes("performance") || skill.toLowerCase().includes("ai") || skill.toLowerCase().includes("architecture");
                  return (
                    <span 
                      key={skill} 
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        isCrucial 
                        ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300' 
                        : 'bg-neutral-800 text-neutral-300 border border-neutral-700/50'
                      }`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="pt-5 border-t border-neutral-800/80">
              <div className="flex items-center space-x-2 mb-3">
                <Award className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-neutral-400">Credentials & Credits</h3>
              </div>
              <div className="space-y-3">
                {profile.certifications.map((cert) => (
                  <div key={cert} className="flex items-center space-x-3 bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-300 leading-tight">{cert}</span>
                    <span className="ml-auto text-[10px] font-mono text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card: AI-Powered Career Skill Gap Analyzer */}
          <motion.div id="dashboard-skill-gaps" variants={itemVariants} className="glass-card p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-md font-bold text-white">AI Skill Gap Alignment Board</h3>
                  <p className="text-xs text-neutral-500">Real-time delta metrics comparing profile + CV against L6 internal mobility roles.</p>
                </div>
              </div>
            </div>

            {/* Toggle Recommended Roles */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Recommended Internal Roles Selector</span>
              <div className="flex flex-wrap gap-2">
                {jobs.map((job) => {
                  const isActive = selectedGapJobId === job.id;
                  
                  // Compute gap counts inline
                  const userSkillsSet = new Set(profile.skills.map(s => s.toLowerCase().trim()));
                  const gaps = job.requiredSkills.filter(s => !userSkillsSet.has(s.toLowerCase().trim()));
                  
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedGapJobId(job.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                        isActive
                          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/5"
                          : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <span>{job.title.split(" (")[0]}</span>
                      {gaps.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                          {gaps.length} gaps
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Ready
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gap Analysis Box */}
            {(() => {
              const activeGapJob = jobs.find(j => j.id === selectedGapJobId) || jobs[0];
              if (!activeGapJob) return null;

              const userSkillsSet = new Set(profile.skills.map(s => s.toLowerCase().trim()));
              
              // Helper to check skill source
              const isFromResume = (skillName: string) => {
                const baselineSkills = [
                  "aws systems optimization", "kubernetes", "docker", "terraform", "ci/cd performance indexing",
                  "model pipelines", "model alignment", "python", "go", "gitops",
                  "react", "node.js", "fastapi", "mongodb", "sql", "power bi", "tableau",
                  "apex", "lightning", "crm", "soql", "itsm", "cmdb", "workflow automation"
                ];
                return !baselineSkills.includes(skillName.toLowerCase().trim());
              };

              const matchingSkills = activeGapJob.requiredSkills.filter(s => userSkillsSet.has(s.toLowerCase().trim()));
              const gaps = activeGapJob.requiredSkills.filter(s => !userSkillsSet.has(s.toLowerCase().trim()));

              // Matching level calculation
              const baseScore = 65;
              const matchPercent = Math.min(100, Math.round(baseScore + (matchingSkills.length / activeGapJob.requiredSkills.length) * (100 - baseScore)));

              const getActionForSkill = (skill: string) => {
                const skillLower = skill.toLowerCase();
                if (skillLower.includes("grpc")) {
                  return "Take enterprise module 'High Performance Systems & gRPC Layer Architecting' on L5 suite.";
                }
                if (skillLower.includes("owasp") || skillLower.includes("prompt")) {
                  return "Complete company premium course 'Robust Prompt Alignment' sponsored by Devon Reynolds.";
                }
                if (skillLower.includes("large scale") || skillLower.includes("cloud-native")) {
                  return "Read Decoupled System Architecture guidelines inside the CTO Core Hub.";
                }
                if (skillLower.includes("advocacy") || skillLower.includes("storytelling")) {
                  return "Co-sponsor technical sample workshops or review Developer Relations core guides.";
                }
                if (skillLower.includes("cuda") || skillLower.includes("pytorch") || skillLower.includes("tensorflow") || skillLower.includes("ml")) {
                  return "Study CUDA Core Allocation frameworks or ML Pipelines in the AI platform library.";
                }
                if (skillLower.includes("react") || skillLower.includes("typescript") || skillLower.includes("next.js")) {
                  return "Study internal course: 'Advanced Front-End Rendering Architectures and Rendering Optimizations'.";
                }
                if (skillLower.includes("fastapi") || skillLower.includes("node") || skillLower.includes("mongodb")) {
                  return "Attend core sandbox training: 'High Throughput Backend Server APIs Engineering'.";
                }
                if (skillLower.includes("snowflake") || skillLower.includes("sql") || skillLower.includes("data lake")) {
                  return "Review operational guide: 'Enterprise Data Lake Analytics Queries Tuning & Warehousing'.";
                }
                if (skillLower.includes("apex") || skillLower.includes("lightning") || skillLower.includes("salesforce") || skillLower.includes("soql")) {
                  return "Complete standard qualification track: 'Salesforce Certified Systems Integration Architectural Protocols'.";
                }
                if (skillLower.includes("itsm") || skillLower.includes("cmdb") || skillLower.includes("workflow") || skillLower.includes("itsm")) {
                  return "Complete IT governance modules: 'ServiceNow System Workflows Automation & ITSM Service Catalogs'.";
                }
                return `Access the internal skill portal to complete certificate standards for ${skill}.`;
              };

              const handleCloseGap = async (skill: string) => {
                if (!profile.skills.includes(skill)) {
                  const updatedSkills = [...profile.skills, skill];
                  await onUpdateProfile({ skills: updatedSkills });
                }
              };

              return (
                <div className="space-y-5 pt-3 border-t border-neutral-900">
                  {/* Progress Sourcing bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-400">Matched Competency Score</span>
                      <span className="font-mono font-bold text-indigo-400">{matchPercent}% Alignment</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${matchPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Dual Grid: Matchings vs Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Matching list */}
                    <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-3">
                      <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Closing the Gap ({matchingSkills.length})</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {matchingSkills.map((s) => {
                          const resumeSource = isFromResume(s);
                          return (
                            <div key={s} className="flex items-center justify-between bg-[#080B09] p-2 rounded-lg border border-emerald-500/15">
                              <span className="text-xs text-neutral-300 font-semibold">{s}</span>
                              <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${
                                resumeSource
                                  ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              }`}>
                                {resumeSource ? "CV Ingested" : "Core Profile"}
                              </span>
                            </div>
                          );
                        })}
                        {matchingSkills.length === 0 && (
                          <span className="text-[11px] text-neutral-600 italic block">No matching skills identified for this role.</span>
                        )}
                      </div>
                    </div>

                    {/* Gap list with action buttons! */}
                    <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-3">
                      <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Outstanding Skill Gaps ({gaps.length})</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {gaps.map((s) => (
                          <div key={s} className="flex flex-col gap-1.5 bg-[#0D0A08] p-2.5 rounded-lg border border-amber-500/15">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-amber-200 font-bold">{s}</span>
                              <button
                                onClick={() => handleCloseGap(s)}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-extrabold text-[10px] rounded border border-amber-500/20 hover:border-amber-500/40 uppercase tracking-widest transition active:scale-95 cursor-pointer shrink-0"
                              >
                                + Acquire Skill
                              </button>
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-snug">
                              <span className="font-mono text-neutral-500 block uppercase text-[8px] font-bold tracking-wider">Action Step:</span>
                              {getActionForSkill(s)}
                            </p>
                          </div>
                        ))}
                        {gaps.length === 0 && (
                          <div className="flex items-center justify-center py-5 bg-emerald-500/5 rounded-lg border border-emerald-500/25 text-emerald-400 text-xs font-bold gap-1">
                            <Check className="w-4 h-4" />
                            <span>Sourcing Criteria Met! 100% Fit</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Career advice quote segment */}
                  <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-indigo-300 font-medium italic">
                    💡 <span className="font-bold underline uppercase font-mono text-[9px] tracking-wider shrink-0 mr-1">Coaching Note:</span> 
                    Analyzing your candidate background, getting verified credentials in <span className="text-white font-semibold">
                      {gaps[0] || "these competencies"}
                    </span> would strengthen your eligibility for matching L6 positions immediately.
                  </div>
                </div>
              );
            })()}
          </motion.div>

          {/* Card: Active Upskilling Roadmap progression */}
          <motion.div id="dashboard-roadmap" variants={itemVariants} className="glass-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-md font-bold text-white">Upskilling Blueprint Tasks</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                {Math.round((completedRoadmapSteps.length / (upskillingTasks.length + 2)) * 100)}% Complete
              </span>
            </div>
            
            <p className="text-xs text-neutral-500 leading-normal">
              Close detected gaps to elevate alignment parameters across target roles. Click checkboxes to mock upskilling achievements!
            </p>

            <div className="space-y-3 pt-2">
              {upskillingTasks.map((task) => {
                const isCompleted = completedRoadmapSteps.includes(task.title);
                return (
                  <div 
                    key={task.id} 
                    onClick={() => toggleStep(task.title)}
                    className={`p-3.5 rounded-xl border transition duration-200 cursor-pointer flex items-center justify-between ${
                      isCompleted 
                      ? 'bg-indigo-950/20 border-indigo-500/40' 
                      : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : (
                        <CircleDot className="w-4 h-4 text-neutral-500 shrink-0" />
                      )}
                      <div>
                        <h4 className={`text-xs font-semibold leading-tight ${isCompleted ? 'text-indigo-200' : 'text-neutral-300'}`}>
                          {task.title}
                        </h4>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold block mt-1">{task.category}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono leading-none px-2 py-0.5 rounded uppercase font-bold ${
                      isCompleted ? 'text-indigo-400 bg-indigo-500/5' : 'text-neutral-400 bg-neutral-900'
                    }`}>
                      {isCompleted ? "Active Credential" : "To-Do"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Recommended Opportunities & Alignments */}
        <div className="lg:col-span-5 space-y-8">
          
          <motion.div id="dashboard-jobs" variants={itemVariants} className="glass-card p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <h3 className="text-md font-bold text-white">Recommended Internal Openings</h3>
              </div>
              <button 
                onClick={() => onNavigateTab("matching")}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-mono"
              >
                View Match Board →
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              AI recommendations compiled by comparing active taxonomies, credentials, and preferences.
            </p>

            <div className="space-y-4">
              {jobs.map((job) => {
                // Determine mock custom alignment percent based on job and current upskilling tasks checked!
                let percentage = 70;
                let statusColor = "from-red-500 to-orange-500";
                let textStyle = "text-orange-400";
                
                if (job.id === "job-001") {
                  percentage = completedRoadmapSteps.includes("High-Performance Systems & gRPC Layer Architecting") ? 94 : 88;
                  statusColor = "from-blue-600 to-indigo-600 animate-pulse";
                  textStyle = "text-indigo-300";
                } else if (job.id === "job-002") {
                  percentage = completedRoadmapSteps.includes("Robust Prompt Alignment and Agent Tuning Systems") ? 98 : 95;
                  statusColor = "from-purple-600 to-indigo-600 animate-pulse";
                  textStyle = "text-purple-300";
                }

                return (
                  <div 
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/80 hover:border-neutral-700/80 cursor-pointer hover:bg-neutral-900/20 transition group flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase block w-max mb-1.5">
                          {job.department}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                          {job.title}
                        </h4>
                        <p className="text-[10px] text-neutral-500 mt-1">{job.level} • {job.location}</p>
                      </div>

                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${statusColor} p-[1px] shadow-md`}>
                          <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center">
                            <span className={`text-[11px] font-extrabold ${textStyle}`}>{percentage}%</span>
                          </div>
                        </div>
                        <span className="text-[8px] text-neutral-500 uppercase font-mono mt-1 font-bold">Match</span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>{job.applicantsCount} internal candidates applied</span>
                      <span className="text-indigo-400 group-hover:translate-x-1 transition flex items-center gap-1 font-mono font-bold leading-none">
                        Interactive Map <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* AI Career Coach Quick Advice Bubble */}
          <motion.div id="dashboard-coach-callout" variants={itemVariants} className="glass-card p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-indigo-950/20 to-neutral-900/40 border border-purple-500/15">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center space-x-2.5 mb-3.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Aura Career Advisor Advice</span>
            </div>

            <p className="text-xs text-neutral-300 leading-normal italic">
              "Alex, targeting L6 pathways demands immediate expansion of your high-performance distributed systems knowledge. Focus on completing your **Prompt Alignment and Tuning** modules to elevate matching scores above 95%."
            </p>

            <button 
              onClick={() => onNavigateTab("coach")}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow active:scale-98 flex items-center justify-center gap-1.5"
            >
              <span>Initiate Coaching Dialogue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
        
      </div>
    </motion.div>
  );
}
