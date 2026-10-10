import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { evaluatorPrompt } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { transcript, metrics } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Session transcript is required" }, 
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const promptPayload = `${evaluatorPrompt}\n\nTranscript:\n${transcript}\n\nLocal Metrics:\n${JSON.stringify(metrics)}`;
    const result = await model.generateContent(promptPayload);
    const parsedResponse = JSON.parse(result.response.text());

    return NextResponse.json(parsedResponse, { status: 200 });
    
  } catch (error) {
    console.error("Gemini API Error (Coach):", error);
    return NextResponse.json(
      { error: "Failed to generate AI evaluation" }, 
      { status: 500 }
    );
  }
}