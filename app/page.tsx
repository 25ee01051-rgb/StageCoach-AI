"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Header */}
      <header className="w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20">
              S
            </div>
            <span className="font-semibold text-slate-100 tracking-tight text-lg">
              StageCoach <span className="text-blue-500 font-bold">AI</span>
            </span>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md">
            Step 1 of 3
          </span>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Pitch Training &amp; Real-time Vocal Analytics
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-50 leading-[1.15]">
            Master Your Pitch Deck with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-300">
              StageCoach AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
            Upload your deck, practice under simulated investor pressure, and receive real-time speech and delivery metrics.
          </p>

          {/* Step-by-Step Direct Action */}
          <div className="pt-4 flex flex-col items-center gap-3">
            <Link
              href="/analyze"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              Start Practice Session — Analyze Deck 📄
            </Link>
            <span className="text-xs text-slate-400">
              Upload PDF $\rightarrow$ Rehearse in Studio $\rightarrow$ View Session Metrics
            </span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
        StageCoach AI — Interactive Pitch Rehearsal Platform
      </footer>
    </div>
  );
}