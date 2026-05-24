import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  FileText, UploadCloud, AlertCircle, Sparkles, CheckCircle2, 
  Terminal, ArrowRight, Play, RefreshCw, Layers 
} from "lucide-react";
import { EmployeeProfile } from "../types";

interface ResumeUploadProps {
  profile: EmployeeProfile;
  onExtractResume: (resumeText: string, fileName: string) => Promise<any>;
}

export default function ResumeUpload({ profile, onExtractResume }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  
  const [parsing, setParsing] = useState(false);
  const [parseSteps, setParseSteps] = useState<string>("");
  const [extractedResult, setExtractedResult] = useState<any | null>(null);

  // Suggested plain text resumes templates to let the user immediately experience high-performance parsed outcomes!
  const mockCVTemplates = [
    {
      title: "AI platform CV (Alex - 2026)",
      text: `ALEX CHEN - STAFF MACHINE LEARNING PLATFORM ENGINEER
Current Focus: Generative AI performance tuning, model alignment and pipeline optimization.
Newly Mastered skills: Advanced prompt alignment formats, Hyperparameter tuning parameters, Vector Databases performance indexing, LangChain system architectures.
Completed credentials: AWS Certified Machine Learning Specialty, Certified AI Platform Architect (CAPA).
Completed projects: Leading development of high-throughput orchestration patterns for the corporate Gemini platform integration.`
    },
    {
      title: "Lead Developer Advocate CV",
      text: `ALEX CHEN - SITE SYSTEM PLATFORM ADVOCATE
Technical skills: Public systems storytelling, RESTful API design protocols, go development, Python automation scripts, container orchestration.
Soft skills: Public speaking, developer advocacy, cross-team workshops coordination, technical paper writing.
Certifications completed: CKA Kubernetes Admin, CNCF Cloud Native Speaker credential.
Tenure: 3 years. Willing to transition into the Innovation relations division.`
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileSelected(file);
      simulateTextFromCV(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileSelected(file);
      simulateTextFromCV(file.name);
    }
  };

  const simulateTextFromCV = (fileName: string) => {
    // Generate simulated context text based on filenames
    if (fileName.toLowerCase().includes("ai") || fileName.toLowerCase().includes("model")) {
      setResumeText(mockCVTemplates[0].text);
    } else {
      setResumeText(mockCVTemplates[1].text);
    }
  };

  const handleParse = async () => {
    if (!resumeText.trim()) return;
    setParsing(true);
    setExtractedResult(null);

    // Dynamic processing messages sifting simulation
    const steps = [
      "Verifying document sandbox vector...",
      "Reading document textual stream context...",
      "Extracting semantic tokens, title designations, and tenure limits...",
      "Consulting Gemini-3.5-Flash to isolate certified skills & certifications...",
      "Cataloguing verified credentials and merging taxonomy profiles..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setParseSteps(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const fileName = fileSelected ? fileSelected.name : "custom_input.txt";
      const resultObj = await onExtractResume(resumeText, fileName);
      setExtractedResult(resultObj);
    } catch (e) {
      console.error(e);
    } finally {
      setParsing(false);
      setParseSteps("");
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-neutral-100">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">Resume CV Talent Profiler</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Drag and drop external CVs to parse technical skills, credentials, and update your active mobility profile instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Drag and drop + Plaintext CV workspace */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Box: File Drag and drop uploader */}
          <div 
            onDragEnter={handleDrag} 
            onDragOver={handleDrag} 
            onDragLeave={handleDrag} 
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition bg-neutral-950/40 relative overflow-hidden flex flex-col items-center justify-center ${
              dragActive 
              ? "border-indigo-500 bg-indigo-500/5" 
              : "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950/60"
            }`}
          >
            <input
              type="file"
              id="cv-file-picker"
              accept=".pdf,.txt,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            
            <UploadCloud className="w-10 h-10 text-indigo-400 mb-3" />
            
            {fileSelected ? (
              <div className="space-y-1 relative z-10">
                <p className="text-xs font-bold text-white uppercase font-mono tracking-wider">File Selected successfully</p>
                <p className="text-sm font-semibold text-indigo-300">{fileSelected.name}</p>
                <p className="text-[10px] text-neutral-500 font-mono">{(fileSelected.size/1024).toFixed(1)} KB • Ingested details parsed below</p>
              </div>
            ) : (
              <div className="space-y-2 relative z-10">
                <span className="text-xs uppercase font-mono text-neutral-400 font-bold block">Integrative Drag and Drop Suite</span>
                <p className="text-sm font-medium text-neutral-200">Drag your PDF/Text CV here or <span className="text-indigo-400 underline decoration-indigo-400/30">browse files</span></p>
                <p className="text-[10px] text-neutral-500 leading-none">Supports PDF, DOCX, TXT up to 10MB</p>
              </div>
            )}
          </div>

          {/* Quick Sandbox templates buttons details */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest shrink-0">CV templates:</span>
            {mockCVTemplates.map(t => (
              <button
                key={t.title}
                onClick={() => {
                  setResumeText(t.text);
                  setFileSelected(new File([t.text], `${t.title.replace(/\s+/g, '_')}.txt`, {type: "text/plain"}));
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs hover:border-neutral-700 transition cursor-pointer"
              >
                {t.title}
              </button>
            ))}
          </div>

          {/* Custom text box for manual input / review pasted parameters */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-neutral-500">Plaintext CV text content</span>
              <span className="text-[10px] text-indigo-400 font-bold">(Analyze CV content to extract credentials)</span>
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste details of CV, accomplishments, or experienced parameters directly here..."
              className="w-full h-64 bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs md:text-sm rounded-xl p-4 focus:outline-none focus:border-indigo-500 transition font-mono whitespace-pre-wrap leading-relaxed"
            />

            <div className="flex items-center justify-end">
              <button
                onClick={handleParse}
                disabled={parsing || !resumeText.trim()}
                className="px-6 py-3 bg-primary-gradient font-bold text-xs uppercase tracking-wider text-white shadow-lg rounded-xl flex items-center justify-center gap-2 border border-white/5 disabled:opacity-40 select-none cursor-pointer"
              >
                {parsing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>Analyzing Document...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 shrink-0" />
                    <span>Execute Resume parsing</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right column: Extraction results tickers */}
        <div className="lg:col-span-5 space-y-6">
          
          {parsing ? (
            <div className="glass-card p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3 mb-2 animate-pulse">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">AI Solder Active</span>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                  <span className="text-xs text-neutral-300 font-semibold leading-none">{parseSteps}</span>
                </div>
                <div className="w-full h-1 bg-neutral-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          ) : extractedResult ? (
            <div className="glass-card p-6 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center space-x-2 border-b border-neutral-800 pb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Ingestion Metrics Complete</h3>
                  <span className="text-[10px] text-neutral-400 font-semibold block">Profile synchronized successfully</span>
                </div>
              </div>

              {/* Extracted designations */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Extracted Occupational Title</span>
                  <p className="text-sm font-bold text-white mt-0.5">{extractedResult.extractedContent.currentTitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">Evaluation Rank</span>
                    <span className="text-xs font-semibold text-emerald-400 block mt-0.5">{extractedResult.extractedContent.estimatedLevel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">Ingested Source</span>
                    <span className="text-xs font-semibold text-white block mt-0.5">Vetted document</span>
                  </div>
                </div>

                {/* Extracted new skills */}
                <div className="space-y-2 pt-2 border-t border-neutral-850">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Extracted skills mapped</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {extractedResult.extractedContent.newTechnicalSkills.map((s: string) => (
                      <span key={s} className="text-[10px] uppercase font-mono font-bold tracking-tight bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/20">
                        {s}
                      </span>
                    ))}
                    {extractedResult.extractedContent.softSkills.map((s: string) => (
                      <span key={s} className="text-[10px] uppercase font-mono tracking-tight bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700/60 font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Extracted new certs */}
                {extractedResult.extractedContent.newCertifications?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-850">
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">Certifications credits found</span>
                    <div className="space-y-2">
                      {extractedResult.extractedContent.newCertifications.map((c: string) => (
                        <div key={c} className="flex items-center space-x-2 text-xs text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-semibold leading-tight">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="space-y-2 pt-3 border-t border-neutral-850">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Strategic Placement Advices</span>
                  <ul className="space-y-1.5">
                    {extractedResult.extractedContent.hiringRecommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-xs text-neutral-400 flex items-start space-x-2">
                        <span className="text-indigo-400 font-bold mt-0.5">•</span>
                        <span className="leading-snug">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-neutral-500">
              Paste or drag a CV in the left panel and click "Execute Resume parsing" to parse dynamic skills and view strategic alignment maps here.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
