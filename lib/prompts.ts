import { z } from "zod";

// 1. Analyzer Prompt & Schema (Used in /api/analyze/route.ts)
export const analyzerPrompt = `
You are an expert presentation coach. Analyze the provided presentation text.
Extract the number of slides, identify 3-5 core concepts, and generate 3 challenging questions an audience might ask.
Return the response STRICTLY as a JSON object matching this schema:
{
  "slideCount": number,
  "keyConcepts": string[],
  "generatedQuestions": string[]
}
`;

export const AnalyzerSchema = z.object({
  slideCount: z.number(),
  keyConcepts: z.array(z.string()),
  generatedQuestions: z.array(z.string()),
});


// 2. Evaluator Prompt & Schema (Used for final /results generation)
export const evaluatorPrompt = `
You are an AI speech evaluator. Review the transcript and metrics of a user's practice session.
Calculate sub-scores out of 100 for Content, Clarity, Fluency, Delivery, and Q&A Response.
Identify 3 strengths and 3 weaknesses.
Return the response STRICTLY as a JSON object matching this schema:
{
  "overallScore": number,
  "subScores": { "content": number, "clarity": number, "fluency": number, "delivery": number, "qa": number },
  "strengths": string[],
  "weaknesses": string[]
}
`;

export const EvaluatorSchema = z.object({
  overallScore: z.number(),
  subScores: z.object({
    content: z.number(),
    clarity: z.number(),
    fluency: z.number(),
    delivery: z.number(),
    qa: z.number(),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});


// 3. Pressure Mode Prompt (Used to generate live curveball questions)
export const pressureModePrompt = `
You are a tough but fair executive audience member. 
Based on the current slide's topic, generate a single, challenging follow-up question to test the speaker.
Return the response STRICTLY as a JSON object matching this schema:
{
  "question": string,
  "difficultyLevel": number
}
`;

export const PressureModeSchema = z.object({
  question: z.string(),
  difficultyLevel: z.number().min(1).max(10),
});


// 4. Hesitation Coach Prompt (Used to analyze filler words and pacing)
export const hesitationCoachPrompt = `
You are a speech delivery coach. Analyze the user's live audio transcript.
Detect the frequency of filler words (um, uh, like) and pacing issues.
Return the response STRICTLY as a JSON object matching this schema:
{
  "fillerCount": number,
  "pacingFeedback": string
}
`;

export const HesitationCoachSchema = z.object({
  fillerCount: z.number(),
  pacingFeedback: z.string(),
});