"use client";

interface AudiencePanelProps {
  currentQuestion?: string | null;
  difficulty?: number;
}

export default function AudiencePanel({ currentQuestion, difficulty }: AudiencePanelProps) {
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-inner">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
        Virtual Audience
      </h3>
      
      <div className="mb-4 flex gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold transition-all ${currentQuestion ? 'bg-blue-600 ring-2 ring-blue-400 scale-110' : 'bg-gray-700 text-gray-500'}`}>AI 1</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-gray-500 text-xs font-bold">AI 2</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-gray-500 text-xs font-bold">AI 3</div>
      </div>

      <div className="flex-1 rounded-lg border border-indigo-500/30 bg-indigo-900/30 p-4 transition-opacity duration-500">
        {currentQuestion ? (
          <>
            <span className="mb-2 block text-xs font-bold text-indigo-400">
              Live Question (Difficulty: {difficulty}/10):
            </span>
            <p className="text-sm leading-relaxed text-indigo-100">
              "{currentQuestion}"
            </p>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-500 italic text-center">
            Audience is listening quietly. <br/> Questions will appear here in Pressure Mode.
          </div>
        )}
      </div>
    </div>
  );
}