import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Bot, Send, Sparkles, RefreshCw, AlertCircle, Compass, 
  HelpCircle, Check, Terminal, Play, ClipboardCheck 
} from "lucide-react";
import { CareerMessage } from "../types";

interface CareerCoachProps {
  chatHistory: CareerMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onResetChat: () => Promise<void>;
}

export default function CareerCoach({ chatHistory, onSendMessage, onResetChat }: CareerCoachProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Suggested prompt blocks
  const starterPrompts = [
    { label: "Staff Systems Architect Fit", text: "Analyze my L5 platform engineering background alignment with the open Staff Systems Architect role." },
    { label: "Staff AI Scientist Pathway", text: "What deep LLM prompt-alignment tuning skill gaps do I have to close for the Staff AI Scientist role?" },
    { label: "Trigger Mock Interview Scenario", text: "Start a mock systems design practice interview centered on AWS multi-region failover protocols." },
    { label: "Help Me Draft Cover Design Strategy", text: "Draft an internal application introduction letter highlighting my 3 years cloud-native container tenure." }
  ];

  // Auto Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    setLoading(true);
    setErrorStatus(null);
    try {
      await onSendMessage(textToSend);
      setInputText("");
    } catch (err: any) {
      setErrorStatus("Aura AI experienced transient connectivity. Retrying simulation parameters.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-[calc(100vh-172px)] overflow-hidden font-sans relative text-neutral-100">
      
      {/* Top Banner Control Header */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-neutral-950 animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5.5 h-5.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white leading-none">Aura Enterprise Coach</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-[9px] uppercase font-mono font-bold text-indigo-300">
                Gemini Active
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">SaaS Career Architecture and Mobility Advisor</span>
          </div>
        </div>

        <button
          onClick={onResetChat}
          className="px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono uppercase bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-800 transition duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Log</span>
        </button>
      </div>

      {/* Main Conversation Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Dynamic Warning if Key not found (Informative but positive) */}
        {!process.env.GEMINI_API_KEY && (
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-300 flex items-start space-x-3 max-w-4xl mx-auto">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block text-white mb-0.5">High-Fidelity Context Simulation Enabled</span>
              To experience native real-time responses powered directly by **Gemini 3.5**, configure your custom **GEMINI_API_KEY** in the top-right **Settings &gt; Secrets** panel.
            </div>
          </div>
        )}

        {/* Message Mapping */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {chatHistory.map((msg) => {
            const isBot = msg.sender === "Aura";
            return (
              <div 
                key={msg.id}
                className={`flex gap-4 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20 font-bold text-xs select-none">
                    AU
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed font-sans ${
                  isBot 
                  ? 'ai-bubble text-neutral-200' 
                  : 'bg-primary-gradient border border-indigo-500/20 text-white ml-auto'
                }`}>
                  {/* Handle Markdown blocks cleanly within CSS */}
                  <div className="whitespace-pre-wrap select-text markdown-body">
                    {msg.text}
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2 pt-1 border-t border-neutral-800/20 font-mono">
                    <span>{isBot ? "Internal Aura Service" : "Alex Chen Profile"}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loader */}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-indigo-400 shrink-0 border border-neutral-700 animate-pulse">
                ...
              </div>
              <div className="bg-neutral-900 border border-neutral-800 shadow-md p-4 rounded-2xl max-w-[300px] flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                <span className="text-xs text-neutral-400 font-mono">Consulting career matrix...</span>
              </div>
            </div>
          )}

          {errorStatus && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 max-w-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorStatus}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggested Template Prompts (Bottom-pinned but scrollable) */}
      <div className="px-6 py-2 bg-neutral-950/30 border-t border-neutral-900 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3 overflow-x-auto py-2 Scrollbar-none">
          <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Direct:
          </span>
          {starterPrompts.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSend(p.text)}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-[11px] font-medium transition cursor-pointer shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Area */}
      <div className="p-6 bg-neutral-950/50 border-t border-neutral-900 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2 focus-within:border-indigo-500 transition duration-200">
          <input
            type="text"
            placeholder="Formulate query to Aura (e.g. Help me prep for SecOps mock board)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
            disabled={loading}
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={loading || !inputText.trim()}
            className="p-1.5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition duration-150 shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Consult</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-neutral-600 mt-2 text-center">
          Secure corporate network • Powered by Generative AI models. All prompts evaluated relative to L4/L5 metrics.
        </p>
      </div>

    </div>
  );
}
