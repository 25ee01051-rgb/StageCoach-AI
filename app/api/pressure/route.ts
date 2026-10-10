import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pressureModePrompt } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { slideTopic } = await request.json();

    if (!slideTopic) {
      return NextResponse.json(
        { error: "Slide topic is required to generate a question" }, 
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(`${pressureModePrompt}\n\nCurrent Slide Topic:\n${slideTopic}`);
    const parsedResponse = JSON.parse(result.response.text());

    return NextResponse.json(parsedResponse, { status: 200 });
    
  } catch (error) {
    console.error("Gemini API Error (Pressure):", error);
    return NextResponse.json(
      { error: "Failed to generate audience question" }, 
      { status: 500 }
    );
  }
}