export function calculateWPM(totalwords: number, durationSeconds: number) {
  if (durationSeconds === 0) return 0;
  const minutes = durationSeconds / 60;
  return Math.round(totalwords / minutes);
}

export function calculateFillerRate(fillerCount: number, totalwords: number) {
  if (totalwords === 0) return 0;
  return Number(((fillerCount / totalwords) * 100).toFixed(2));
}

// Implement a silence threshold (e.g., 2.0 seconds) for pause_count
// Use Web Speech API or Gemini transcription timestamps to track this.
export function calculatePauses(timestampsInSeconds: number[], silenceThreshold = 2.0) {
  let pauseCount = 0;
  let longestPause = 0;

  for (let i = 1; i < timestampsInSeconds.length; i++) {
    const gap = timestampsInSeconds[i] - timestampsInSeconds[i - 1];
    if (gap >= silenceThreshold) {
      pauseCount++;
      if (gap > longestPause) {
        longestPause = gap;
      }
    }
  }

  return { pauseCount, longestPauseSeconds: Number(longestPause.toFixed(2)) };
}