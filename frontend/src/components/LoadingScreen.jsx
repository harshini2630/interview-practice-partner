// src/components/LoadingScreen.jsx  (debug-safe)
import { useEffect, useState } from 'react';
import { Loader2, Server, Globe, Database } from 'lucide-react';

export default function LoadingScreen({ company = 'ACME', role = 'Engineer' }) {
  const [step, setStep] = useState(0);

  const techPrompts = [
    "Prompt Engineering — crafting role-specific system prompts",
    "Whisper Transcription — preparing audio -> text pipeline",
    "Edge-TTS Synthesis — preparing spoken interviewer voice",
    "DuckDuckGo Retrieval — fetching recent interview snippets",
    "Prompt Context Synthesis — merging resume, JD, web context",
    "Persona Injection — adjusting tone for Confused/Efficient users",
    "Llama Reasoning — preparing next-question generation",
    "Session Orchestration — initializing interview runtime"
  ];

  // Use only icons we can be sure exist; fallback to simple <div> if needed
  const icons = [Server, Globe, Database, Loader2, Loader2, Loader2, Loader2, Loader2];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % techPrompts.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = icons[step] || Loader2;

  const terminalLines = [
    "MCP_CORE: Active",
    `> SEARCH_TOOL: Running: "${company} ${role} interview query"`,
    "> RESULT: Top 4 sources identified",
    "> EXTRACTION: Parsing behavioral & technical Qs",
    "> PROMPT: Merging resume, JD, and web context",
    "> PERSONA: Configured (Confused / Efficient / Chatty)",
    "> MODEL: Priming LLM with company-specific cues",
    "> STATUS: READY_TO_START"
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-black">
      <div className="max-w-md w-full text-center space-y-8">

        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            {/* safe icon rendering */}
            {CurrentIcon ? <CurrentIcon className="w-8 h-8 text-black" /> : <div className="w-6 h-6 rounded-full bg-black" />}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight uppercase">Tech Context</h2>
          <p className="text-gray-600 font-medium">
            <span className="font-semibold">Now building:</span> {techPrompts[step]}
          </p>
        </div>

        {/* Terminal output area */}
        <div className="bg-gray-50 border border-gray-200 rounded p-6 text-left font-mono text-[11px] text-gray-600 space-y-2 overflow-hidden shadow-inner h-48">
          {terminalLines.map((line, idx) => (
            <p key={idx} className={idx <= step ? 'text-black' : 'opacity-40'}>
              {line}
            </p>
          ))}

          {/* visible debug info */}
          <div className="mt-3 text-xs text-gray-500">
            <div>DEBUG: step = {step}</div>
            <div>DEBUG: techPrompts length = {techPrompts.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
