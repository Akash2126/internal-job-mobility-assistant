import React, { useState } from "react";
import { 
  Mail, Send, Calendar, ShieldCheck, Sparkles, AlertCircle, 
  ChevronRight, Inbox, Clock, UserCheck
} from "lucide-react";

interface EmailLog {
  id: string;
  subject: string;
  from: string;
  to: string;
  timestamp: string;
  status: "dispatched" | "delivered" | "received";
  bodyHTML: React.ReactNode;
}

export default function EnterpriseMailLogs() {
  const [activeMailId, setActiveMailId] = useState("mail-001");

  const emails: EmailLog[] = [
    {
      id: "mail-001",
      subject: "CONFIRMED: Application Synced successfully - Alex Chen",
      from: "Internal Job Mobility Assistant <noreply@mobility.acme.corp>",
      to: "Alex Chen <alex.chen@acme.corp>",
      timestamp: "Today, 10:14 AM",
      status: "delivered",
      bodyHTML: (
        <div className="space-y-4 font-sans text-neutral-300 text-xs md:text-sm">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-indigo-300 font-medium">
            🛡️ <strong>Automated System Ingest Note:</strong> This corporate email was compiled and transmitted securely to your personal workspace dossier.
          </div>
          <p>Dear Alex Chen,</p>
          <p>
            Your internal submission matching analysis has been safely logged in the Enterprise SQL server database.
          </p>
          <div className="p-4 bg-[#0a0a14] border border-neutral-800 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold block">Submission Profile Summary</span>
            <p className="text-white font-bold leading-tight">Staff Platform Operations Specialist (L5 → L6 Track)</p>
            <p className="text-[11px] text-neutral-400">Target Role: **Principal AI Platform Engineer (L6)**</p>
            <p className="text-[11px] text-indigo-400 font-mono font-bold">Matching Rating: 95% Compatibility Score</p>
          </div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aura AI Recommended Steps:</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-neutral-450 text-[11px]">
            <li>Take company sandbox workshop: <strong>"Prompt Alignment Optimization & Tuning AI Models"</strong></li>
            <li>Consult with hiring Director <strong>Devon Reynolds</strong> to coordinate a calibration interview</li>
            <li>Register newly acquired <strong>"Certified Kubernetes Administrator (CKA)"</strong> badge with the HR database</li>
          </ul>
          <p className="text-neutral-500 text-[11px]">
            Thank you for pioneering continuous enterprise upskilling. <br />
            Sincerely, <br />
            <strong>Aura Sourcing Gateway Engine</strong>
          </p>
        </div>
      )
    },
    {
      id: "mail-002",
      subject: "CANDIDATE ALERT: 95% Talent Match Identified for Principal AI Platform Engineer",
      from: "Talent Intelligence Core <intelligence@mobility.acme.corp>",
      to: "Devon Reynolds <devon.reynolds@acme.corp>",
      timestamp: "Today, 10:14 AM",
      status: "received",
      bodyHTML: (
        <div className="space-y-4 font-sans text-neutral-300 text-xs md:text-sm">
          <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-purple-300 font-medium">
            📈 <strong>Generative Recruitment Brief:</strong> Autonomous profile mapping has flagged an elite matching candidate within our technical engineering divisions.
          </div>
          <p>Hello Devon,</p>
          <p>
            We detected an internal L5 Staff Specialist, <strong>Alex Chen</strong>, carrying <strong>95% skill compatibility score</strong> for your current vacancy: <strong>Principal AI Platform Engineer (L6)</strong>.
          </p>
          
          <div className="bg-[#0c0c16] rounded-xl border border-neutral-800 p-4 space-y-3">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Candidate Vitals Loged</span>
            <div className="grid grid-cols-2 gap-3 text-xs leading-normal text-neutral-300">
              <div><strong>Tenure:</strong> 3 Years (Platform Team)</div>
              <div><strong>Critical Certs:</strong> AWS Machine Learning, CKA</div>
              <div><strong>Current Domain:</strong> AIML Engineering</div>
              <div><strong>Interview Score history:</strong> 9.4/10</div>
            </div>
          </div>

          <h4 className="text-xs font-bold text-purple-400">Verified Sourcing Overlaps:</h4>
          <p className="text-[11.5px] leading-relaxed">
            Alex actively masters **Threat Modeling**, **Docker container boundaries**, **Go/Python systems orchestration**, and **Kubernetes**. Furthermore, Alex recently uploaded a parsed CV update indicating newly acquired competencies in **OWASP top 10 LLM safety controls**.
          </p>

          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Calendly Sync Suggestion:</span>
            <span className="text-indigo-400 font-bold block underline cursor-pointer">Block 15-Min Meet Slot</span>
          </div>
          
          <p className="text-neutral-500 text-[11px]">
            Best regards,<br />
            <strong>Aura Automatic Scout Dispatcher</strong>
          </p>
        </div>
      )
    },
    {
      id: "mail-003",
      subject: "AUDIT LOG: Internal Sourcing Transition Triggered",
      from: "Workforce Mobility Portal <sourcing-audits@mobility.acme.corp>",
      to: "HR Strategy Compliance <chro-ops@acme.corp>",
      timestamp: "Yesterday, 3:45 PM",
      status: "dispatched",
      bodyHTML: (
        <div className="space-y-4 font-sans text-neutral-300 text-xs md:text-sm">
          <p>HR Management Architects,</p>
          <p>
            This automated audit record documents that L5 Specialist <strong>Alex Chen</strong> triggered an interactive career upskilling roadmap matching sequence targeting <strong>Staff Systems Developer (L6)</strong>.
          </p>

          <div className="border border-neutral-800 bg-[#07070a] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold block">Retention and ROI Metrics saved</span>
            <div className="space-y-1.5 text-xs text-neutral-300">
              <p>💰 Estimated external developer recruitment cost savings: <strong>$55,000 USD</strong></p>
              <p>⚡ Predicted training duration to satisfy outstanding technical gaps: <strong>14 Days</strong></p>
              <p>📈 Retention score elevation forecast: <strong>+18% tenure persistence bonus</strong></p>
            </div>
          </div>

          <p className="text-neutral-455 text-[11px]">
            No action required at this phase. Standard compliance pathways remain active. <br />
            Sincerely, <br />
            <strong>Enterprise HR Sourcing Audit Logger</strong>
          </p>
        </div>
      )
    }
  ];

  const activeMail = emails.find(e => e.id === activeMailId) || emails[0];

  return (
    <div className="glass-card shadow-2xl border border-neutral-800/80 p-5 space-y-4 rounded-2xl">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-mono font-bold uppercase text-[#818CF8]">Email Workflow Integrations System</h3>
          <p className="text-[10px] text-neutral-500">Simulated SMTP server outgoing logs tracking internal actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1.5">
        {/* Left mail triggers bar */}
        <div className="md:col-span-4 space-y-2 max-h-[300px] overflow-y-auto">
          {emails.map((e) => {
            const isActive = e.id === activeMailId;
            return (
              <div
                key={e.id}
                onClick={() => setActiveMailId(e.id)}
                className={`p-3 rounded-xl border cursor-pointer text-left transition ${
                  isActive 
                  ? "bg-indigo-600/10 border-indigo-500 text-indigo-300" 
                  : "bg-neutral-950 hover:bg-neutral-900 border-neutral-850"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-mono uppercase font-bold px-1 rounded ${
                    e.status === "delivered" ? "bg-emerald-500/10 text-emerald-400" : e.status === "received" ? "bg-purple-500/10 text-purple-400" : "bg-neutral-800 text-neutral-455"
                  }`}>
                    {e.status}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500">{e.timestamp.split(", ")[0]}</span>
                </div>
                <h4 className="text-[10.5px] font-bold text-white block mt-1.5 truncate leading-tight">
                  {e.subject}
                </h4>
                <p className="text-[9.5px] text-neutral-500 block mt-0.5 truncate">{e.to.split(" <")[0]}</p>
              </div>
            );
          })}
        </div>

        {/* Right mail rich viewer preview */}
        <div className="md:col-span-8 bg-neutral-950 rounded-xl border border-neutral-850 p-4 relative overflow-hidden">
          <div className="flex flex-col border-b border-neutral-900 pb-3 mb-4 space-y-1.5 text-[10px] md:text-xs">
            <div className="flex justify-between items-center text-neutral-500">
              <span className="font-mono"><strong>Sender:</strong> {activeMail.from}</span>
              <span className="font-mono font-bold leading-none">{activeMail.timestamp}</span>
            </div>
            <div className="text-neutral-400 font-mono">
              <strong>Recipient:</strong> {activeMail.to}
            </div>
            <div className="text-white font-bold text-[11px] md:text-sm pt-1 leading-snug">
              Subject: {activeMail.subject}
            </div>
          </div>

          <div className="max-h-[220px] overflow-y-auto pr-1">
            {activeMail.bodyHTML}
          </div>
        </div>
      </div>
    </div>
  );
}
