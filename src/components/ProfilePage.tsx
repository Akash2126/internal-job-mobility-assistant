import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, Cpu, Shield, Award, Sparkles, Sliders, ToggleLeft, 
  ToggleRight, Check, Plus, Trash2, Heart, RefreshCw, AlertCircle, CheckCircle2
} from "lucide-react";
import { EmployeeProfile, InternalJob } from "../types";

interface ProfilePageProps {
  profile: EmployeeProfile;
  jobs: InternalJob[];
  onUpdateProfile: (updated: Partial<EmployeeProfile>) => Promise<void>;
}

export default function ProfilePage({ profile, jobs, onUpdateProfile }: ProfilePageProps) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states initialized from user Profile data
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkill, setNewSkill] = useState("");
  
  const [certs, setCerts] = useState<string[]>(profile.certifications);
  const [newCert, setNewCert] = useState("");

  const [workStyle, setWorkStyle] = useState(profile.preferences.workStyle);
  const [relocation, setRelocation] = useState(profile.preferences.relocation);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(profile.preferences.priorityAreas);
  const [selectedGapJobId, setSelectedGapJobId] = useState<string>(jobs[0]?.id || "");

  const priorityAreasList = [
    "Machine Learning & LLMs",
    "Large-Scale Architecture",
    "High-Throughput Platform Architectures",
    "Enterprise System Decoupling",
    "Developer Ecosystems Advocacy",
    "FinOps Orchestration",
    "GPU Infrastructure Provisioning"
  ];

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (term: string) => {
    setSkills(skills.filter(s => s !== term));
  };

  const handleAddCert = () => {
    if (newCert.trim() && !certs.includes(newCert.trim())) {
      setCerts([...certs, newCert.trim()]);
      setNewCert("");
    }
  };

  const handleRemoveCert = (term: string) => {
    setCerts(certs.filter(c => c !== term));
  };

  const handleToggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await onUpdateProfile({
        skills,
        certifications: certs,
        preferences: {
          workStyle,
          relocation,
          priorityAreas: selectedAreas
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Profile save error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-neutral-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Candidate Profile & Skill Preferences</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Maintain your enterprise qualifications, core technical taxonomies, and mobility targets.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3.5 rounded-xl bg-primary-gradient text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 active:scale-98 transition duration-200 shrink-0 cursor-pointer border border-white/5 disabled:opacity-40"
        >
          {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
          {success ? (
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Sync Completed</span>
          ) : (
            <span>Publish Profile Adjustments</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Skills and Certs management */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Card: Active Technical Talents */}
          <div id="profile-technical-skills" className="glass-card p-6 shadow-xl space-y-6">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-md font-bold text-white">Active Technical Talents</h3>
                <p className="text-xs text-neutral-500">Edit or append certified competencies. Clear tags that do not target your future goals.</p>
              </div>
            </div>

            {/* In-Line skill adding block */}
            <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl p-2 focus-within:border-indigo-500/50 transition">
              <input
                type="text"
                placeholder="Append skill parameter (e.g. LLM fine-tuning, Rust, PyTorch)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                className="flex-1 bg-transparent text-sm placeholder:text-neutral-600 text-neutral-200 focus:outline-none px-2"
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Grid display list of skills with delete options */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => {
                const isPremium = skill.toLowerCase().includes("performance") || skill.toLowerCase().includes("ai") || skill.toLowerCase().includes("architecture");
                return (
                  <span 
                    key={skill}
                    className={`pl-3 pr-2 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isPremium 
                      ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300' 
                      : 'bg-neutral-800/80 text-neutral-300 border border-neutral-700/50'
                    }`}
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white transition focus:outline-none cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Card: Active Certifications */}
          <div id="profile-certifications" className="glass-card p-6 shadow-xl space-y-6">
            <div className="flex items-center space-x-2.5">
              <Award className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-md font-bold text-white">Certifications & Credentials</h3>
                <p className="text-xs text-neutral-500">Provide completed course credentials or industry-standard verified badges.</p>
              </div>
            </div>

            {/* cert adder */}
            <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl p-2 focus-within:border-indigo-500/50 transition">
              <input
                type="text"
                placeholder="Append certification title (e.g. Certified Cloud Platform Architect)..."
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCert()}
                className="flex-1 bg-transparent text-sm placeholder:text-neutral-600 text-neutral-200 focus:outline-none px-2"
              />
              <button
                onClick={handleAddCert}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Cert</span>
              </button>
            </div>

            {/* display list */}
            <div className="space-y-2 pt-2">
              {certs.map((cert) => (
                <div key={cert} className="flex items-center justify-between p-3.5 bg-neutral-950/40 rounded-xl border border-neutral-800 hover:border-neutral-700 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-300">{cert}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveCert(cert)}
                    className="p-1 rounded-lg text-neutral-500 hover:text-red-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: AI Skill Gap Alignment Board */}
          <div id="profile-skill-gaps" className="glass-card p-6 shadow-xl space-y-6">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-md font-bold text-white">AI Skill Gap Alignment Board (Draft Calibration)</h3>
                <p className="text-xs text-neutral-500">
                  Vetting simulator. Add missing requirements to your technical talents list above to test candidacy eligibility.
                </p>
              </div>
            </div>

            {/* Recommended positions tabs chooser */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Test Placement Options</span>
              <div className="flex flex-wrap gap-2">
                {jobs.map((job) => {
                  const isActive = selectedGapJobId === job.id;
                  
                  // Calculate gaps on the fly using local draft state
                  const localSkillsSet = new Set(skills.map(s => s.toLowerCase().trim()));
                  const gaps = job.requiredSkills.filter(s => !localSkillsSet.has(s.toLowerCase().trim()));

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
                          ✓ Ready
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alignment Analysis details based on local drift states */}
            {(() => {
              const activeGapJob = jobs.find(j => j.id === selectedGapJobId) || jobs[0];
              if (!activeGapJob) return null;

              const localSkillsSet = new Set(skills.map(s => s.toLowerCase().trim()));
              const matchingSkills = activeGapJob.requiredSkills.filter(s => localSkillsSet.has(s.toLowerCase().trim()));
              const gaps = activeGapJob.requiredSkills.filter(s => !localSkillsSet.has(s.toLowerCase().trim()));

              // Calculate match percent
              const baseScore = activeGapJob.id === "job-002" ? 75 : activeGapJob.id === "job-001" ? 70 : 60;
              const matchPercent = Math.round(baseScore + (matchingSkills.length / activeGapJob.requiredSkills.length) * (100 - baseScore));

              const isFromResume = (skillName: string) => {
                const baselineSkills = [
                  "aws systems optimization", "kubernetes", "docker", "terraform", "ci/cd performance indexing",
                  "model pipelines", "model alignment", "python", "go", "gitops"
                ];
                return !baselineSkills.includes(skillName.toLowerCase().trim());
              };

              const handleAddDraftGapSkill = (skill: string) => {
                if (!skills.includes(skill)) {
                  setSkills([...skills, skill]);
                }
              };

              return (
                <div className="space-y-4 pt-3 border-t border-neutral-900">
                  {/* Progress Sourcing bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-400">Simulated Match Probability</span>
                      <span className="font-mono font-bold text-indigo-400">{matchPercent}% Eligibility</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${matchPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Dual Grid block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Matching list */}
                    <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-3">
                      <span className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Matching Requirements ({matchingSkills.length})</span>
                      </span>

                      <div className="flex flex-col gap-1.5 font-sans">
                        {matchingSkills.map((s) => {
                          const resumeSource = isFromResume(s);
                          return (
                            <div key={s} className="flex items-center justify-between bg-neutral-950/80 p-2 rounded-lg border border-neutral-850">
                              <span className="text-xs text-neutral-300 font-semibold">{s}</span>
                              <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
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
                          <span className="text-[10px] text-neutral-500 italic">No matching skills currently in draft.</span>
                        )}
                      </div>
                    </div>

                    {/* Discovered gap list */}
                    <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-3">
                      <span className="flex items-center space-x-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4" />
                        <span>Identified Skill Gaps ({gaps.length})</span>
                      </span>

                      <div className="flex flex-col gap-1.5">
                        {gaps.map((s) => (
                          <div key={s} className="flex items-center justify-between bg-[#0B0806] hover:bg-[#110D09] p-2 rounded-lg border border-amber-500/10 transition">
                            <span className="text-xs text-amber-200 font-semibold">{s}</span>
                            <button
                              onClick={() => handleAddDraftGapSkill(s)}
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 font-extrabold text-[10px] rounded border border-amber-500/20 uppercase tracking-wider text-center cursor-pointer transition active:scale-95 shrink-0"
                            >
                              + Add to Skills
                            </button>
                          </div>
                        ))}
                        {gaps.length === 0 && (
                          <div className="text-emerald-400 p-3 bg-emerald-500/5 border border-emerald-500/20 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1">
                            <span>✓ All Requirements Fulfilled!</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="text-[11px] text-neutral-500 bg-neutral-950/60 p-3 rounded-lg border border-neutral-900/50 leading-relaxed">
                    ⚙️ <span className="text-white font-semibold">Note:</span> Adding gap skills simulates full alignment. Make sure to click the <span className="text-indigo-400 font-bold">Publish Profile Adjustments</span> button at the top header of the page to save these credentials to the live internal mobility directory permanently.
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

        {/* Right Column: Dynamic Targets slids */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Card: Mobility Parameters */}
          <div id="profile-mobility-parameters" className="glass-card p-6 shadow-xl space-y-6">
            <div className="flex items-center space-x-2.5">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-md font-bold text-white">Mobility Parameters</h3>
                <p className="text-xs text-neutral-500">Configure global matching preferences.</p>
              </div>
            </div>

            {/* Work style select options */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-neutral-500 font-bold block">Preferred Work Style</span>
              <div className="grid grid-cols-3 gap-2">
                {["Hybrid", "Remote", "On-site"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setWorkStyle(style)}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      workStyle === style 
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50" 
                      : "bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle relocation preferences */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
              <div>
                <span className="text-xs font-semibold text-white block">Open to Corporate relocation</span>
                <span className="text-[10px] text-neutral-500 block">Willing to reposition across major offices</span>
              </div>

              <button
                onClick={() => setRelocation(!relocation)}
                className="text-neutral-400 hover:text-white transition focus:outline-none cursor-pointer"
              >
                {relocation ? (
                  <ToggleRight className="w-9 h-9 text-indigo-500" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-neutral-600" />
                )}
              </button>
            </div>
          </div>

          {/* Card: Targeted Growth Divisions */}
          <div id="profile-growth-divisions" className="glass-card p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-4.5 h-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Priority Interest Focus areas</h3>
            </div>
            
            <p className="text-[11px] text-neutral-500 leading-normal">
              AI uses these preferences as direct coefficients, elevating match priorities on positions checking these focus parameters.
            </p>

            <div className="space-y-2.5 pt-2">
              {priorityAreasList.map((area) => {
                const isChecked = selectedAreas.includes(area);
                return (
                  <div
                    key={area}
                    onClick={() => handleToggleArea(area)}
                    className={`py-2.5 px-3 rounded-xl border cursor-pointer flex items-center justify-between transition text-xs ${
                      isChecked 
                      ? "bg-purple-950/20 border-purple-500/40 text-purple-300" 
                      : "bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span className="font-medium">{area}</span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                      isChecked ? "bg-purple-600 border-purple-500 text-white" : "border-neutral-700 bg-neutral-900"
                    }`}>
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
