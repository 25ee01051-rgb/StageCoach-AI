"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PracticePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Audio Metrics & Full Accumulated Transcript State
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speakingSeconds, setSpeakingSeconds] = useState<number>(0);
  const [estimatedWpm, setEstimatedWpm] = useState<number>(0);
  const [detectedPauses, setDetectedPauses] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>("");

  // Loaded AI Questions
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  useEffect(() => {
    const savedQuestions = localStorage.getItem("stagecoach_questions");
    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
        }
      } catch (e) {
        console.error("Failed to parse stagecoach_questions:", e);
      }
    }
  }, []);

  const startPracticeSession = async () => {
    try {
      setTranscript("");

      // 1. Get Combined Camera & Microphone Stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // 2. Initialize Web Speech API - Continuous Full Transcript from Start to End
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        let finalTranscriptAcc = "";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscriptAcc += transcriptChunk + " ";
            } else {
              interimTranscript += transcriptChunk;
            }
          }

          // Combines accumulated final text with interim active phrase
          setTranscript((finalTranscriptAcc + interimTranscript).trim());
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // 3. Set up Web Audio API Pipeline
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let totalActiveSeconds = 0;
      let pauseCounter = 0;
      let wasSpeaking = false;
      let lastCheck = Date.now();

      // 4. High-Frequency Real-Time Audio Loop
      const analyzeAudio = () => {
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const averageVolume = Math.round((sum / bufferLength) / 2.55);
        setAudioLevel(averageVolume);

        const now = Date.now();
        if (now - lastCheck >= 1000) { // Every 1 second
          lastCheck = now;

          if (averageVolume > 12) {
            totalActiveSeconds += 1;
            setSpeakingSeconds(totalActiveSeconds);
            wasSpeaking = true;

            const calculatedWpm = Math.round((totalActiveSeconds / 60) * 140);
            setEstimatedWpm(calculatedWpm);
          } else {
            if (wasSpeaking) {
              pauseCounter += 1;
              setDetectedPauses(pauseCounter);
              wasSpeaking = false;
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();
      setIsRecording(true);
    } catch (err: any) {
      alert("Microphone/Camera permission was denied. Please allow access in browser settings.");
      console.error(err);
    }
  };

  const stopPracticeSession = async () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    setIsRecording(false);

    // Score calculations matching analytics logic
    const pacingScore = estimatedWpm >= 120 && estimatedWpm <= 160 ? 95 : estimatedWpm > 160 ? 70 : 60;
    const fluencyScore = Math.max(100 - detectedPauses * 8, 45);
    const overallScore = Math.round((pacingScore + fluencyScore) / 2);

    const rawPresentationId = localStorage.getItem("stagecoach_presentation_id");
    const presentationId =
      rawPresentationId &&
      rawPresentationId !== "undefined" &&
      rawPresentationId !== "null"
        ? rawPresentationId
        : null;

    const fullSessionTranscript = transcript.trim() || "Full rehearsal recorded without vocal speech text.";

    // Save locally for fallback access
    const sessionSummary = {
      wpm: estimatedWpm,
      speakingSeconds,
      detectedPauses,
      transcript: fullSessionTranscript,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("stagecoach_last_session", JSON.stringify(sessionSummary));

    // Save practice session & metrics directly to Supabase with the full accumulated transcript
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("practice_sessions")
        .insert({
          presentation_id: presentationId,
          mode: "Standard Practice",
          duration_seconds: speakingSeconds,
          overall_score: overallScore,
          fluency_score: fluencyScore,
          delivery_score: pacingScore,
          ai_feedback: { transcript: fullSessionTranscript },
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Supabase Session Error Code:", sessionError.code);
        console.error("Supabase Session Error Message:", sessionError.message);
        console.error("Supabase Session Error Details:", sessionError.details);
        return;
      }

      if (sessionData) {
        const { error: metricsError } = await supabase.from("metrics").insert({
          session_id: sessionData.id,
          words_per_minute: estimatedWpm,
          pause_count: detectedPauses,
        });

        if (metricsError) {
          console.error("Supabase Metrics Error:", metricsError.message);
        }
      }
    } catch (dbErr) {
      console.error("Failed to write practice metrics to Supabase:", dbErr);
    }
  };

  const triggerNextQuestion = () => {
    if (questions.length === 0) return;
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

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

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md hidden sm:inline-block">
              Step 2 of 3 — Practice Studio
            </span>
            <Link 
              href="/analytics" 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              View Analytics 📊
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 space-y-6">
        
        {/* Page Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Practice Studio</h1>
            <p className="text-xs text-slate-400">Live vocal stream tracking &amp; AI audience pressure simulation</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-slate-600"}`} />
            <span className="text-xs font-medium text-slate-300">
              {isRecording ? "Session Active" : "Studio Idle"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Panel: Camera Stream & Mic Level */}
          <div className="border border-slate-800/80 rounded-2xl p-5 bg-slate-900/40 backdrop-blur-sm shadow-xl flex flex-col justify-between h-[540px]">
            <div className="relative w-full flex-1 bg-slate-950 rounded-xl overflow-hidden border border-slate-800/60 flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />
              {!isRecording && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    🎙️
                  </div>
                  <p className="text-sm text-slate-300 font-medium">Ready for Rehearsal</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Click &quot;Start Practice Session&quot; to initialize live mic &amp; video stream.
                  </p>
                </div>
              )}
            </div>

            {/* Live Microphone Level Visualizer */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Live Audio Stream Level</span>
                <span className={audioLevel > 12 ? "text-emerald-400 font-bold" : "text-slate-500"}>{audioLevel}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                <div 
                  className={`h-full transition-all duration-75 ${audioLevel > 12 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-slate-700"}`}
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>

            {/* Practice Controls */}
            <div className="mt-5">
              {!isRecording ? (
                <button 
                  onClick={startPracticeSession} 
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  Start Practice Session 🎙️
                </button>
              ) : (
                <button 
                  onClick={stopPracticeSession} 
                  className="w-full py-3.5 bg-red-600/90 hover:bg-red-600 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  End Session 🛑
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: AI Pressure Questions & Metrics */}
          <div className="border border-slate-800/80 rounded-2xl p-5 bg-slate-900/40 backdrop-blur-sm shadow-xl flex flex-col justify-between h-[540px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-200">Simulated Investor Deck Prompts</h2>
                  <p className="text-xs text-slate-400">Interruption Q&amp;A generated from your presentation</p>
                </div>
                <button 
                  onClick={triggerNextQuestion}
                  disabled={questions.length === 0}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-medium rounded-lg disabled:opacity-40 transition-all duration-200"
                >
                  Next Prompt ⚡
                </button>
              </div>

              {/* AI Deck Pressure Card */}
              <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                  Pressure Prompt:
                </span>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {questions.length > 0 
                    ? questions[currentQuestionIndex] 
                    : "Upload a PDF deck in the Analyzer tab to load custom AI questions here!"}
                </p>
              </div>

              {/* Live Transcript Stream Visualizer */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Full Session Transcript</span>
                  <div className={`px-2.5 py-0.5 rounded-full font-medium text-[10px] border transition-all duration-300 ${
                    audioLevel > 12 
                      ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30 animate-pulse" 
                      : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}>
                    {audioLevel > 12 ? "🎙️ Recording Speech" : "🤫 Listening..."}
                  </div>
                </div>
                <p className="text-xs text-slate-300 overflow-y-auto leading-relaxed flex-1 pt-1">
                  {transcript || (isRecording ? "Start speaking into your mic to record full transcript..." : "Full speech transcript will appear here during session...")}
                </p>
              </div>
            </div>

            {/* Real-time Telemetry Cards */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-center">
              <div className="p-2">
                <span className="text-[11px] text-slate-400 block font-medium">Active Speaking</span>
                <span className="text-lg font-bold text-blue-400">{speakingSeconds}s</span>
              </div>
              <div className="p-2 border-x border-slate-800/60">
                <span className="text-[11px] text-slate-400 block font-medium">Est. Pacing</span>
                <span className="text-lg font-bold text-indigo-400">{estimatedWpm} WPM</span>
              </div>
              <div className="p-2">
                <span className="text-[11px] text-slate-400 block font-medium">Pauses / Breaks</span>
                <span className="text-lg font-bold text-sky-400">{detectedPauses}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        StageCoach AI — Practice Studio &amp; Real-Time Telemetry
      </footer>
    </div>
  );
}