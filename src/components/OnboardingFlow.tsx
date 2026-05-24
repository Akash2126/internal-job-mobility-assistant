import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Compass, Check, ArrowRight, User, Target, 
  Layers, ChevronRight, GraduationCap, Laptop, Cpu
} from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (domain: string, bio: string) => void;
  onClose: () => void;
}

export default function OnboardingFlow({ onComplete, onClose }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState("aiml");
  const [bioInput, setBioInput] = useState(
    "Ambitious technical partner focused on optimizing high-availability cloud platforms, scalable data protocols, and cross-functional team delivery models."
  );
  const [checkedPriorities, setCheckedPriorities] = useState<string[]>([
    "Cloud Architecture & Optimization",
    "Continuous AI System Feedback loops"
  ]);

  const domains = [
    { id: "aiml", name: "AIML Engineering", icon: Cpu, desc: "Generative models, prompt-alignment tuning, high efficiency pipelines." },
    { id: "fullstack", name: "Full Stack Development", icon: Laptop, desc: "React, Node.js backend infrastructure, API caching layers." },
    { id: "data", name: "Data Analytics", icon: Layers, desc: "Big Data processing, interactive dashboards, pipeline profiling." },
    { id: "salesforce", name: "Salesforce Cloud", icon: GraduationCap, desc: "Apex integrations, Lightning experiences, enterprise CRM topologies." },
    { id: "servicenow", name: "Workflow Engineering", icon: Compass, desc: "ITSM, automate complex triggers, CMDB structures." }
  ];

  const prioritiesList = [
    "Cloud Architecture & Optimization",
    "Continuous AI System Feedback loops",
    "Technical Mentorship & Advocacy",
    "Scalable Real-time Data pipelines",
    "Highly Available gRPC Microservices"
  ];

  const togglePriority = (p: string) => {
    if (checkedPriorities.includes(p)) {
      setCheckedPriorities(checkedPriorities.filter(item => item !== p));
    } else {
      setCheckedPriorities([...checkedPriorities, p]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(selectedDomain, bioInput);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#090910] border border-indigo-500/25 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Decorative lighting background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900 z-10 relative">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block">System Warmup</span>
              <span className="text-sm font-extrabold text-white">Internal Job Mobility Assistant</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 font-mono text-[10px] text-neutral-500 font-bold">
            <span className={step === 1 ? "text-indigo-400" : ""}>01</span>
            <span>/</span>
            <span className={step === 2 ? "text-indigo-400" : ""}>02</span>
            <span>/</span>
            <span className={step === 3 ? "text-indigo-400" : ""}>03</span>
          </div>
        </div>

        {/* Step screen render */}
        <div className="min-h-[320px] flex flex-col justify-between z-10 relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight">Welcome, Pioneer! Let's Calibrate Your Career Channels</h2>
                  <p className="text-xs md:text-sm text-neutral-400 leading-relaxed mt-2 font-sans">
                    The <strong>Internal Job Mobility Assistant</strong> partners with Aura Career Intelligence to map your skills directly against senior L6 departments. Let's sync your primary area of focus.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Choose Division Focus</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {domains.map((d) => {
                      const Icon = d.icon;
                      const isSelected = selectedDomain === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDomain(d.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition duration-200 flex items-start gap-3 text-left ${
                            isSelected
                              ? "bg-indigo-600/10 border-indigo-500 text-indigo-300"
                              : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected ? "bg-indigo-500/20 border-indigo-500/30 text-white" : "bg-neutral-900 border-neutral-800 text-neutral-400"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white block">{d.name}</h4>
                            <p className="text-[10px] text-neutral-500 leading-normal mt-1">{d.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight">Map Growth Priorities & Milestones</h2>
                  <p className="text-xs md:text-sm text-neutral-400 leading-relaxed mt-2">
                    Select target areas to help our AI recommend accurate upskilling pathways and credentials to minimize competence gaps.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Select Target priorities</span>
                  <div className="flex flex-wrap gap-2.5">
                    {prioritiesList.map((p) => {
                      const isChecked = checkedPriorities.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePriority(p)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                            isChecked
                              ? "bg-purple-600/10 border-purple-500 text-purple-300 border-2"
                              : "bg-neutral-950/80 border-neutral-805 text-neutral-400 border hover:border-neutral-700"
                          }`}
                        >
                          {isChecked ? <Check className="w-3.5 h-3.5" /> : null}
                          <span>{p}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Draft Operational Statement (Bio)</span>
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="w-full h-16 text-xs bg-neutral-950 border border-neutral-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-neutral-300 font-medium"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight font-sans">Simulating Sourcing Alignments...</h2>
                  <p className="text-xs md:text-sm text-neutral-400 leading-relaxed mt-2 font-sans">
                    Everything is set up! Let's initialize your profile with active vacancies, clear skill deficits, and register credentials.
                  </p>
                </div>

                <div className="bg-neutral-950/80 border border-neutral-800 p-5 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <Check className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span className="text-neutral-300 font-medium font-sans">Corporate Identity Registered (Alex Chen, L5 Employee)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <Check className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span className="text-neutral-300 font-medium font-sans">
                      SaaS Technical Division synced: <strong className="text-indigo-400">{(domains.find(d => d.id === selectedDomain)?.name || "").toUpperCase()}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <Check className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span className="text-neutral-300 font-medium font-sans">Personal Bio & targets established</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <Check className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span className="text-neutral-300 font-medium font-sans">Hiring Vitals synced to Secure SQLite Database</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[11px] text-indigo-300 font-medium font-sans italic">
                  💡 Aura Agent Advice: Launch Resume Extractor anytime to parse credentials directly from external PDF dossiers.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dialog Action button section */}
          <div className="flex items-center justify-between border-t border-neutral-900 pt-5 mt-6">
            <button
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-neutral-300 font-semibold uppercase tracking-wider font-mono cursor-pointer"
            >
              Skip Onboarding
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              <span>{step === 3 ? "Complete Sync" : "Proceed"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
