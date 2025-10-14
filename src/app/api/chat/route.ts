import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    let apiKey = process.env.GEMINI_API_KEY;

    // Check if client provided the API key in the headers
    const clientKey = request.headers.get("x-gemini-key") || request.headers.get("Authorization")?.replace("Bearer ", "");
    if (clientKey) {
      apiKey = clientKey;
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server. Please enter your Gemini API Key in the settings panel." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are NOVA, a premium gamified AI fitness and diet coach in a cyberpunk portal. Your tone must be futuristic, encouraging, and authoritative. Use uppercase words for technical terms, diagnostic keywords, or emphasis (e.g. OPTIMIZATION PROTOCOL, CALORIC YIELD, METABOLIC FAILURE). Keep responses concise (under 3-4 sentences), highly actionable, and direct. Do not use generic AI greetings. Always speak in a cybernetic, direct-to-athlete communication style. Focus on providing scientifically accurate advice."
    });

    // Format chat history for Gemini API
    // Gemini history expects role: "user" | "model", and parts: [{ text: string }]
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Clean history: must start with "user" and alternate strictly user -> model -> user -> model...
    const cleanHistory: any[] = [];
    let expectedRole = "user";

    for (const msg of formattedHistory) {
      if (msg.role === expectedRole) {
        cleanHistory.push({
          role: msg.role,
          parts: [{ text: msg.parts[0].text }]
        });
        expectedRole = expectedRole === "user" ? "model" : "user";
      } else if (msg.role === "user" && expectedRole === "model") {
        // Merge consecutive user messages
        if (cleanHistory.length > 0) {
          cleanHistory[cleanHistory.length - 1].parts[0].text += "\n" + msg.parts[0].text;
        } else {
          cleanHistory.push({
            role: "user",
            parts: [{ text: msg.parts[0].text }]
          });
          expectedRole = "model";
        }
      } else if (msg.role === "model" && expectedRole === "model") {
        // Merge consecutive model messages
        if (cleanHistory.length > 0) {
          cleanHistory[cleanHistory.length - 1].parts[0].text += "\n" + msg.parts[0].text;
        }
      }
      // If we got "model" but expected "user" (e.g. leading coach greetings), we skip it.
    }

    const chat = model.startChat({
      history: cleanHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText.toUpperCase() }); // Nova speaks in uppercase
  } catch (error) {
    console.error("Gemini Chat Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
