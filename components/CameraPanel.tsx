"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera/Mic permission denied:", err);
        setHasPermission(false);
      }
    }

    enableStream();

    // Cleanup stream on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-700 bg-black shadow-inner">
      {hasPermission === false ? (
        <div className="text-center p-4">
          <p className="text-red-400 font-medium">Camera/Microphone access denied.</p>
          <p className="text-sm text-gray-500 mt-2">Please enable permissions in your browser settings to practice.</p>
        </div>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted // Muted so you don't hear your own echo
          className="h-full w-full object-cover"
        />
      )}
      <div className="absolute right-3 top-3 flex items-center gap-2 bg-black/50 px-2 py-1 rounded-md">
        <span className="text-xs text-gray-300 uppercase tracking-widest">Rec</span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
      </div>
    </div>
  );
}