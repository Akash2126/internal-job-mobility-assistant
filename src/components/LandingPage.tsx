import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, Bot, Zap, Award, FileText, BarChart3, ArrowRight, CheckCircle2, 
  Briefcase, TrendingUp, Users, Shield, Globe 
} from "lucide-react";

interface LandingPageProps {
  onLaunchApp: () => void;
  onSelectNav: (tab: string) => void;
}

export default function LandingPage({ onLaunchApp, onSelectNav }: LandingPageProps) {
  // Navigation items for slick display
  const navigation = [
    { name: "Dynamic Matching", tab: "matching" },
    { name: "Coach Aura", tab: "coach" },
    { name: "Workforce Insights", tab: "hr" },
    { name: "Skill Profiler", tab: "profile" }
  ];

  return (
    <div className="bg-neutral-950 text-neutral-100 min-h-screen selection:bg-indigo-500 overflow-x-hidden font-sans relative">
      
      {/* Absolute background mesh and radial neon glows */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-radial-at-t from-indigo-950/40 via-neutral-950 to-neutral-950 pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[50%] left-[5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Modern Navbar */}
      <nav id="landing-navbar" className="sticky top-0 z-50 backdrop-blur-md bg-neutral-950/80 border-b border-neutral-900/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-sans font-bold tracking-tight text-white block">Internal Job Mobility</span>
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase block -mt-1">Assistant Portal</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.tab}
                onClick={() => {
                  onLaunchApp();
                  // Short timeout to let state swap and then trigger subpage select
                  setTimeout(() => onSelectNav(item.tab), 120);
                }}
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={onLaunchApp}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-neutral-950 hover:bg-neutral-100 active:scale-95 transition-all duration-200 cursor-pointer shadow-md shadow-white/5"
            >
              Enterprise Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="landing-hero" className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 tracking-wider uppercase inline-flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powering Next-Gen Fortune 500 Workforce Mobility</span>
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto mt-8 font-sans"
        >
          Connecting Employees with <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            Internal Growth Opportunities
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed"
        >
          An AI-powered talent intelligence and internal job mobility ecosystem. Discover strategic career channels, analyze skill alignment in real-time, master missing gaps, and consult interactive AI coaching.
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/15 pointer hover:shadow-indigo-500/20 active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2 border border-white/10"
          >
            <span>Launch Mobility Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              onLaunchApp();
              setTimeout(() => onSelectNav("hr"), 150);
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800/80 cursor-pointer shadow-inner active:scale-98 transition-all duration-300"
          >
            Explore HR Workspace
          </button>
        </motion.div>

        {/* Futuristic Dashboard Preview Mockup (Interactive/Eye-catching) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 max-w-6xl mx-auto relative group"
        >
          {/* Glass background glowing board */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-xl group-hover:opacity-30 transition-all duration-500" />
          
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl overflow-hidden backdrop-blur-sm cursor-pointer" onClick={onLaunchApp}>
            {/* Mock Dashboard Top Control Bar */}
            <div className="px-6 py-4 border-b border-neutral-900 bg-neutral-950/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/50 block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/50 block" />
                <span className="w-3 h-3 rounded-full bg-green-500/50 block" />
                <span className="text-xs text-neutral-500 ml-4 font-mono font-bold tracking-tight">https://internal-job-mobility.enterprise/portal</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded bg-neutral-900 text-[10px] text-neutral-400 uppercase font-mono font-bold">Secure SSL</span>
                <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-[10px] text-indigo-400 uppercase font-mono font-bold">Aura-AI Active</span>
              </div>
            </div>

            {/* Mock Interface Grid */}
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              {/* Left Column (Job Matching scoring system widget preview) */}
              <div className="lg:col-span-5 bg-neutral-900/60 rounded-xl border border-neutral-800/80 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-indigo-400 font-bold tracking-wider uppercase inline-block mb-1">Target Internal Posting</span>
                      <h3 className="text-lg font-bold text-white leading-tight">Principal AI Platform Engineer</h3>
                      <p className="text-xs text-neutral-400">AI Platform Division • Remote TX</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 border border-purple-500/40 flex items-center justify-center shrink-0">
                      <span className="text-sm font-extrabold text-indigo-300">95%</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Model Sizing Compatibility</span>
                      <span className="text-xs text-emerald-400 font-mono">Expert (Match)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Kubernetes & AWS Performance</span>
                      <span className="text-xs text-emerald-400 font-mono">Strong (Match)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 flex items-center"><Zap className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Generative AI Prompt Tuning</span>
                      <span className="text-xs text-indigo-400 font-mono">Upskill Recommended</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-mono font-bold">Hiring Manager</p>
                    <p className="text-xs text-white font-medium">Devon Reynolds (AI Platform)</p>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs border border-indigo-500/30 font-bold hover:bg-indigo-600 hover:text-white transition-all">
                    Initiate Interview
                  </button>
                </div>
              </div>

              {/* Right Column (Aura Career Coach feedback & charts) */}
              <div className="lg:col-span-7 bg-indigo-950/10 rounded-xl border border-neutral-800 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-white">Aura AI Coach Coach</span>
                        <span className="text-[9px] text-indigo-400 font-bold ml-2">• Online</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] uppercase font-mono font-semibold">Active Roadmap</span>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed italic bg-neutral-900/40 border-l-2 border-indigo-500 p-3 rounded">
                    "Alex, completing the 'Prompt Alignment Tuning Guide' course maps directly to Devon's AI Platform Team needs. Your L5 to L6 timeline will accelerate by 4 months once certified."
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono font-bold block">Estimated Transition</span>
                      <span className="text-lg font-bold text-white block mt-1">45 Days</span>
                    </div>
                    <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase font-mono font-bold block">Internal Growth Velocity</span>
                      <span className="text-lg font-bold text-indigo-400 block mt-1">+42% Skillset Improvement</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-neutral-500 font-mono">
                  <span>Interactive Real-time Visualizer</span>
                  <span className="text-indigo-400 hover:underline">Click to open full dashboard →</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Animated Statistics Section */}
      <section id="landing-stats" className="bg-neutral-950/60 border-t border-b border-neutral-900 py-16 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="p-6">
            <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h4 className="text-4xl font-extrabold text-white font-sans">84%</h4>
            <p className="text-neutral-400 text-sm mt-1">Increase in Internal Referral Transitions</p>
          </div>
          <div className="p-6">
            <Users className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
            <h4 className="text-4xl font-extrabold text-white font-sans">15k+</h4>
            <p className="text-neutral-400 text-sm mt-1">Active Daily Employee Alignments Active</p>
          </div>
          <div className="p-6">
            <Award className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h4 className="text-4xl font-extrabold text-white font-sans">65%</h4>
            <p className="text-neutral-400 text-sm mt-1">Reduction in Strategic Employee Churn Rate</p>
          </div>
          <div className="p-6">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <h4 className="text-4xl font-extrabold text-white font-sans">4.2x</h4>
            <p className="text-neutral-400 text-sm mt-1">Faster Skill gap closures with AI Coach Roadmap</p>
          </div>
        </div>
      </section>

      {/* AI-Powered Feature Cards */}
      <section id="landing-features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-sans">
            AI-Powered Corporate Mobility Suites
          </h2>
          <p className="text-neutral-400 mt-4 leading-relaxed">
            Pivoting talent internally eliminates heavy recruitment costs, preserves tribal knowledge, and drives elite, continuous employee upskilling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Resume Intake & Extraction */}
          <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800 p-8 flex flex-col justify-between hover:border-neutral-700 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Resume AI Extraction</h3>
              <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
                Seamless drag-and-drop file ingestion parses external CVs, identifies newly mastered skills, and aggregates certifications into core HR pools instantly.
              </p>
            </div>
            <div className="mt-8 text-xs font-mono text-indigo-400 flex items-center group-hover:underline cursor-pointer" onClick={onLaunchApp}>
              Explore Extraction Suite <ArrowRight className="w-3 h-3 ml-1.5" />
            </div>
          </div>

          {/* Card 2: Strategic Match Analyzer */}
          <div className="bg-neutral-900/40 rounded-2xl border border-purple-900/30 p-8 flex flex-col justify-between hover:border-neutral-700 transition duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Job Matching Engine</h3>
              <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
                Perform direct, server-side skill mapping. Get match analytics percentiles, customized roadmap trackers, and structured alerts indicating department demands.
              </p>
            </div>
            <div className="mt-8 text-xs font-mono text-indigo-400 flex items-center cursor-pointer" onClick={onLaunchApp}>
              Analyze Role Matches <ArrowRight className="w-3 h-3 ml-1.5" />
            </div>
          </div>

          {/* Card 3: Interactive Career Coach */}
          <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800 p-8 flex flex-col justify-between hover:border-neutral-700 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Career Coach Aura</h3>
              <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
                Consult with a fully conversational Career architecture assistant. Undertake technical practice, request dynamic review of milestones, and simulate safe evaluations.
              </p>
            </div>
            <div className="mt-8 text-xs font-mono text-indigo-400 flex items-center cursor-pointer" onClick={onLaunchApp}>
              Consult Aura Assistant <ArrowRight className="w-3 h-3 ml-1.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Workforce Showcases section */}
      <section id="landing-showcase" className="bg-neutral-900/20 py-20 border-t border-neutral-900/80 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs text-indigo-400 font-bold tracking-wider uppercase font-mono block mb-2">Real-time Optimization</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-sans">
              Dynamic Talent Sourcing for People Teams & HR Executives
            </h2>
            <p className="text-neutral-400 mt-4 leading-relaxed">
              Equip your Chief Human Resources Officers, Engineering VPs, and Department Directors with absolute visibility. Track trending skill gaps across divisions, forecast upskilling efforts, and manage transitions.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-white">Skill Gaps Forecasting</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Visualize real-time demand curves of machine learning platform orchestration, safe rust engineering, or cloud scaling frameworks instantly.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-white">Frictionless Internal Transitions</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Automate and streamline internal hiring sequences without complex bureaucracy or disruption to operating teams.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive HR Analytics visualizer preview card */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider font-bold">HR Intelligence Terminal</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Enterprise Skill Density Maps</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">L6-L7 Projections Ready</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-neutral-400 font-semibold text-[11px]">AWS Technology Cluster & Container Scale</span>
                  <span className="text-indigo-400 font-bold text-[11px]">92% High Density</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-neutral-400 font-semibold text-[11px]">Prompt Alignment Optimization & Tuning AI</span>
                  <span className="text-orange-400 font-bold text-[11px]">42% Critical Gap Identified</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-neutral-400 font-semibold text-[11px]">Large-Scale Multi-Service Topologies</span>
                  <span className="text-purple-400 font-bold text-[11px]">78% Standard Growth</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse block" />
                <span className="text-[10px] text-neutral-400">Continuous Sync Engine active</span>
              </div>
              <button 
                onClick={() => {
                  onLaunchApp();
                  setTimeout(() => onSelectNav("hr"), 150);
                }} 
                className="text-[11px] font-bold text-white hover:text-indigo-400 transition"
              >
                Access Workforce Hub →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="landing-testimonials" className="py-24 px-6 max-w-7xl mx-auto border-t border-neutral-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs text-indigo-400 font-bold font-mono tracking-widest uppercase">Verified Customer Testimonies</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-sans mt-2">What Enterprise Leaders Say</h2>
          <p className="text-neutral-400 mt-3 text-sm">Empowering engineers, advocates, and dynamic strategic leaders worldwide.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-neutral-900/30 p-8 rounded-2xl border border-neutral-800 relative">
            <p className="text-neutral-300 italic text-sm leading-relaxed">
              "We successfully transitioned 45 staff engineers internally into our high-priority Generative AI divisions in under 6 months, saving over $1.5M in direct global recruiter placement costs."
            </p>
            <div className="mt-6 flex items-center">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-yellow-400 border border-neutral-700">
                TH
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-white">Tobias Harris</h4>
                <p className="text-xs text-neutral-500">VP of Talent and People Ops at MobilitySystems</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/30 p-8 rounded-2xl border border-neutral-800 relative">
            <p className="text-neutral-300 italic text-sm leading-relaxed">
              "Aura is extremely effective. By simulating system-architect interview preparation based on my actual company profile and skill set, I felt 100% prepared to pass my internal transition peer board evaluation."
            </p>
            <div className="mt-6 flex items-center">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-neutral-700">
                SC
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-white">Alex Chen</h4>
                <p className="text-xs text-neutral-500">Senior DevOps Engineer (Platform Group)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="landing-cta" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-tr from-blue-900/40 via-indigo-950/40 to-purple-950/40 border border-indigo-500/20 p-12 text-center relative overflow-hidden block">
          
          {/* subtle decoration glows context box */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <span className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase">Immediate Integration Available</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-sans mt-4 max-w-2xl mx-auto leading-tight">
            Ready to Accelerate Internal Growth & Retention?
          </h2>
          <p className="text-neutral-300 mt-4 text-base md:text-lg max-w-xl mx-auto">
            Get started today. Seamlessly connect to your workspace systems with no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-950 font-bold rounded-xl shadow-lg hover:bg-neutral-100 transition duration-200 cursor-pointer"
            >
              Start for Free
            </button>
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-4 bg-neutral-900 text-neutral-300 font-semibold rounded-xl hover:bg-neutral-800 border border-neutral-800 transition duration-200 cursor-pointer"
            >
              Talk to Mobility Strategist
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-6 text-neutral-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white block text-sm">Internal Job Mobility Assistant</span>
              <span className="text-[9px] text-neutral-500 font-mono tracking-wider leading-none block -mt-0.5">Connecting Employees with Internal Growth Opportunities</span>
            </div>
          </div>
          <div className="flex items-center space-x-8 text-neutral-500 text-xs">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Enterprise SLA</a>
            <a href="#" className="hover:text-white transition">GCP & Platform Audits</a>
          </div>
          <div className="text-xs font-mono">
            © 2026 Internal Job Mobility Assistant Corp. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Simple Compass fallback icon to prevent missing import
function Compass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
