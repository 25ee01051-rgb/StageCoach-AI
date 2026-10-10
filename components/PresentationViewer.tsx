"use client";

import { useState } from "react";

interface PresentationViewerProps {
  fileUrl: string; // The URL of the uploaded PDF from Supabase
}

export default function PresentationViewer({ fileUrl }: PresentationViewerProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gray-900 overflow-hidden shadow-lg">
      {fileUrl ? (
        <iframe 
          src={`${fileUrl}#navpanes=0&scrollbar=0`} 
          className="h-full w-full bg-white rounded-lg"
          title="Presentation Viewer"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <svg className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p>No presentation loaded.</p>
        </div>
      )}
    </div>
  );
}