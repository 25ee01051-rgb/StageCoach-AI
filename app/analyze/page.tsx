"use client";

import { useState } from "react";
import Link from "next/link";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPdfUrl(objectUrl);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to analyze presentation");
      }

      // Save to state
      setAnalysis(data);

      // Save to LocalStorage for /practice route access
      if (data?.generatedQuestions) {
        localStorage.setItem("stagecoach_questions", JSON.stringify(data.generatedQuestions));
      }
      if (data?.keyConcepts) {
        localStorage.setItem("stagecoach_concepts", JSON.stringify(data.keyConcepts));
      }
      if (data?.presentationId) {
        localStorage.setItem("stagecoach_presentation_id", data.presentationId);
      }

    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">StageCoach AI — Presentation Analyzer</h1>
        {analysis && (
          <Link 
            href="/practice" 
            className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors"
          >
            Go to Practice Mode ⚡
          </Link>
        )}
      </div>

      {/* Upload Box */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />

        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Analyzing PDF with Gemini..." : "Analyze Pitch Deck"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main Grid Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PDF Previewer */}
        <div className="border rounded-lg p-4 bg-white shadow-sm h-[650px] flex flex-col">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Uploaded Presentation Preview</h2>
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full flex-1 rounded border"
              title="PDF Preview"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400">
              Upload a PDF file to preview it here
            </div>
          )}
        </div>

        {/* Gemini Feedback */}
        <div className="border rounded-lg p-4 bg-white shadow-sm h-[650px] flex flex-col overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Gemini AI Feedback</h2>
          {analysis ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-md">
                <span className="font-semibold text-blue-900">Estimated Slides:</span> {analysis.slideCount}
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Key Concepts:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  {analysis.keyConcepts?.map((concept: string, idx: number) => (
                    <li key={idx}>{concept}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Generated Q&A / Probing Questions:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  {analysis.generatedQuestions?.map((q: string, idx: number) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              {loading ? "Analyzing document content..." : "Click 'Analyze Pitch Deck' to view AI feedback."}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}