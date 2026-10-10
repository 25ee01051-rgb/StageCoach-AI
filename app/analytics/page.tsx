"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLatestSession() {
      try {
        // Fetch latest practice session from Supabase
        const { data, error } = await supabase
          .from("practice_sessions")
          .select("*, metrics(*)")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          const metric = data.metrics?.[0] || {};
          setSession({
            wpm: metric.words_per_minute || 135,
            speakingSeconds: data.duration_seconds || 0,
            detectedPauses: metric.pause_count || 0,
            timestamp: data.created_at,
            transcript: data.ai_feedback?.transcript || null,
          });
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to query Supabase practice session:", e);
      }

      // Fallback to localStorage
      const localData = localStorage.getItem("stagecoach_last_session");
      if (localData) {
        try {
          setSession(JSON.parse(localData));
        } catch (e) {
          console.error("Failed to parse session metrics", e);
        }
      }
      setLoading(false);
    }

    loadLatestSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
        <header className="w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20">
                S
              </div>
              <span className="font-semibold text-slate-100 tracking-tight text-lg">
                StageCoach <span className="text-blue-500 font-bold">AI</span>
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            Loading session metrics...
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
        <header className="w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20">
                S
              </div>
              <span className="font-semibold text-slate-100 tracking-tight text-lg">
                StageCoach <span className="text-blue-500 font-bold">AI</span>
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md">
              Step 3 of 3
            </span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-xl mx-auto text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-xl">
            📊
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-100">No Session Data Found</h1>
            <p className="text-sm text-slate-400">
              Complete a live rehearsal session in the Practice Studio first to view detailed metrics and delivery feedback.
            </p>
          </div>
          <Link 
            href="/practice" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-lg shadow-blue-600/20"
          >
            Go to Practice Studio 🎙️
          </Link>
        </main>
      </div>
    );
  }

  // Calculate scores based on session data
  const wpm = session.wpm || 135;
  const activeSeconds = session.speakingSeconds || 0;
  const pauses = session.detectedPauses || 0;

  // Score Logic
  const pacingScore = wpm >= 120 && wpm <= 160 ? 95 : wpm > 160 ? 70 : 60;
  const fluencyScore = Math.max(100 - pauses * 8, 45);
  const overallScore = Math.round((pacingScore + fluencyScore) / 2);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20">
              S
            </div>
            <span className="font-semibold text-slate-100 tracking-tight text-lg">
              StageCoach <span className="text-blue-500 font-bold">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md hidden sm:inline-block">
              Step 3 of 3 — Analytics
            </span>
            <Link 
              href="/practice" 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 rounded-lg transition-all duration-200 flex items-center gap-1.5"
            >
              Practice Again 🔄
            </Link>
            <Link 
              href="/results" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              View Results 📑
            </Link>
          </div>
        </div>
      </header>

      {/* Main Analytics Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Pitch Session Analytics</h1>
            <p className="text-xs text-slate-400">Feedback and performance metrics from your recent rehearsal</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {session.timestamp ? new Date(session.timestamp).toLocaleString() : "Recent Rehearsal"}
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Overall Pitch Score</span>
            <div className="text-3xl font-extrabold text-blue-400">{overallScore} <span className="text-sm font-normal text-slate-500">/ 100</span></div>
          </div>

          <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Speaking Speed</span>
            <div className="text-3xl font-extrabold text-slate-100">{wpm} <span className="text-sm font-normal text-slate-500">WPM</span></div>
            <span className="text-[10px] text-slate-500 block">Target: 120 - 160 WPM</span>
          </div>

          <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Active Delivery</span>
            <div className="text-3xl font-extrabold text-emerald-400">{activeSeconds}s</div>
            <span className="text-[10px] text-slate-500 block">Total vocal time</span>
          </div>

          <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Pauses / Hesitations</span>
            <div className={`text-3xl font-extrabold ${pauses > 4 ? "text-amber-400" : "text-slate-100"}`}>
              {pauses}
            </div>
            <span className="text-[10px] text-slate-500 block">Silence breaks</span>
          </div>
        </div>

        {/* Visual Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chart 1: Performance Score Distribution */}
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-200">Delivery Scores Breakdown</h2>
                <p className="text-xs text-slate-400">Pacing, fluency, and combined rehearsal score</p>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-950/50 border border-blue-500/20 px-2.5 py-1 rounded-md">
                {overallScore}% Score
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {/* Overall Score Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Overall Performance</span>
                  <span className="text-blue-400 font-bold">{overallScore} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
              </div>

              {/* Pacing Score Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Pacing Consistency</span>
                  <span className="text-indigo-400 font-bold">{pacingScore} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                    style={{ width: `${pacingScore}%` }}
                  />
                </div>
              </div>

              {/* Fluency Score Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Speech Fluency &amp; Cadence</span>
                  <span className="text-emerald-400 font-bold">{fluencyScore} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${fluencyScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Vocal Pace vs. Target Range Chart */}
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-200">Speech Cadence (WPM Target)</h2>
                <p className="text-xs text-slate-400">Comparing your WPM against the optimal 120 - 160 range</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                {wpm} WPM
              </span>
            </div>

            {/* Visual Bar Graph Range Indicator */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>0 WPM</span>
                <span className="text-emerald-400 font-semibold">Target: 120-160 WPM</span>
                <span>200+ WPM</span>
              </div>

              <div className="relative w-full h-6 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center">
                <div 
                  className="absolute h-full bg-emerald-500/15 border-x border-emerald-500/30"
                  style={{ left: "60%", width: "20%" }}
                />
                
                <div 
                  className={`h-full transition-all duration-500 ${
                    wpm >= 120 && wpm <= 160 
                      ? "bg-emerald-500" 
                      : wpm > 160 
                      ? "bg-amber-500" 
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min((wpm / 200) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Slow Delivery</span>
                <span className="text-emerald-400 font-medium">Optimal Pitch Zone</span>
                <span>Fast Cadence</span>
              </div>
            </div>
          </div>

        </div>

        {/* AI Performance Breakdown & Full Transcript */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Delivery Assessment Card */}
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl space-y-4">
            <h2 className="text-base font-semibold text-slate-200 border-b border-slate-800/60 pb-3">Delivery Analysis</h2>
            
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl space-y-1">
                <strong className="text-blue-400 block font-semibold">Pacing Assessment:</strong>
                <p className="text-slate-300 leading-relaxed">
                  {wpm >= 120 && wpm <= 160
                    ? "Excellent pace! Your speaking speed is within the optimal 120-160 WPM window for investor pitches."
                    : wpm > 160
                    ? "Slightly rushed. Consider slowing down during key slide transitions to ensure clarity."
                    : "A bit slow. Increasing your cadence slightly will help maintain high audience energy."}
                </p>
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-500/20 rounded-xl space-y-1">
                <strong className="text-amber-400 block font-semibold">Fluency &amp; Pauses:</strong>
                <p className="text-slate-300 leading-relaxed">
                  {pauses <= 2
                    ? "Great confidence and flow with minimal hesitation!"
                    : `Detected ${pauses} noticeable pauses. Use silence intentionally rather than filling space.`}
                </p>
              </div>
            </div>
          </div>

          {/* Transcript & Session Notes Card */}
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-slate-200 border-b border-slate-800/60 pb-3">Full Session Transcript &amp; Notes</h2>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
                {session.transcript || "Full rehearsal recorded without vocal speech text."}
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Status: Synchronized with Supabase</span>
              <span>{session.timestamp ? new Date(session.timestamp).toLocaleTimeString() : ""}</span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        StageCoach AI — Interactive Pitch Analytics &amp; Rehearsal Insights
      </footer>
    </div>
  );
}