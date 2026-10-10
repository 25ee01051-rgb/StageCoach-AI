import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";
import { supabase } from "@/lib/supabase";

// Helper function to extract text from buffer using pdf2json
function parsePdfBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);

    pdfParser.on("pdfParser_dataError", (errData: any) =>
      reject(errData.parserError)
    );

    pdfParser.on("pdfParser_dataReady", () => {
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in process.env" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided." },
        { status: 400 }
      );
    }

    // Convert uploaded File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract raw text from PDF
    const extractedText = await parsePdfBuffer(buffer);

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF (file might be scanned images)." },
        { status: 400 }
      );
    }

    // Pass extracted text to Gemini 3.8 Flash
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Analyze this presentation pitch deck content and return a JSON object:
    {
      "slideCount": number,
      "keyConcepts": string[],
      "generatedQuestions": string[]
    }

    Extracted PDF Content:
    """
    ${extractedText}
    """`;

    const result = await model.generateContent(prompt);
    const parsedData = JSON.parse(result.response.text());

    // Save presentation analysis to Supabase
    const { data: presentationRecord, error: dbError } = await supabase
      .from("presentations")
      .insert({
        title: file.name || "Untitled Presentation",
        file_url: null,
        slide_count: parsedData.slideCount || 0,
        analysis: parsedData,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Insertion Error (Presentations):", dbError);
    }

    return NextResponse.json(
      { ...parsedData, presentationId: presentationRecord?.id || null },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("🔴 SERVER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to process PDF", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}