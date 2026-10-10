"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SessionRun {
  id: string;
  wpm: number;
  speakingSeconds: number;
  detectedPauses: number;
  timestamp: string;
  score: number;
}

export default function Scorecard() {
  const pathname = usePathname();
  const [history, setHistory] = useState<SessionRun[]>([]);
  const [latestRun, setLatestRun] = useState<SessionRun | null>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem("stagecoach_history");
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setLatestRun(parsed[parsed.length - 1]);
        }
      } catch (e) {
        console.error("Error loading stagecoach_history", e);
      }
    }
  }, []);

  const totalRuns = history.length;
  const avgScore = totalRuns > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalRuns)
    : 0;
  const avgWpm = totalRuns > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.wpm || 0), 0) / totalRuns)
    : 0;

  // Streamlined navigation structure (without app/upload)
  const navigationTabs = [
    { label: "Analyzer 📄", href: "/analyze" },
    { label: "Practice Studio 🎙️", href: "/practice" },
    { label: "Analytics 📊", href: "/analytics" },
    { label: "Results 📉", href: "/results" },
  ];

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">StageCoach AI</h2>
          <p className="text-sm text-gray-500">Presentation coaching and pitch deck analysis</p>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto">
          {navigationTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
          <span className="text-xs text-blue-700 font-bold uppercase tracking-wider block mb-1">Latest Score</span>
          <span className="text-3xl font-extrabold text-blue-900">
            {latestRun ? `${latestRun.score}/100` : "--"}
          </span>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-center">
          <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block mb-1">Avg Score</span>
          <span className="text-3xl font-extrabold text-emerald-900">
            {totalRuns > 0 ? `${avgScore}/100` : "--"}
          </span>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg text-center">
          <span className="text-xs text-purple-700 font-bold uppercase tracking-wider block mb-1">Avg Speed</span>
          <span className="text-3xl font-extrabold text-purple-900">
            {totalRuns > 0 ? `${avgWpm} WPM` : "--"}
          </span>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Total Rehearsals</span>
          <span className="text-3xl font-extrabold text-gray-800">{totalRuns} runs</span>
        </div>
      </div>
    </div>
  );
}