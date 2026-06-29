import { GoogleGenAI, Part } from "@google/genai";
import { FactCategory, InputType, MisleadingSubCategory, WebSource } from "../types";
import { validateGeminiResponse } from "../services/validation";

const parseJSONFromMarkdown = (text: string) => {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  const raw = match?.[1] ?? (text.trim().startsWith('{') ? text : null);
  return raw ? validateGeminiResponse(JSON.parse(raw)) : null;
};

const systemPrompt = `
You are Aleth, an automated world-class fact-checking system.
Verify user input with Google Search grounding and return raw JSON inside \`\`\`json fences.
Include externalFactChecks when available.
Structure: {
  "truthScore": number,
  "sourceCredibilityScore": number,
  "category": "Satire" | "Clickbait" | "Unreliable Sources" | "Misleading" | "Verified / High Credibility" | "Unknown",
  "subCategory": "Technically True" | "Partially True" | "Facts Twisted" | "False Context" | "Fabricated / Total Fake" | "N/A" | null,
  "summary": string,
  "detailedAnalysis": string,
  "externalFactChecks": [{ "organization": string, "rating": string, "url": string }]
}`;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'GEMINI_API_KEY is not configured server-side.' }, { status: 500 });
  }

  const payload = await request.json();
  const ai = new GoogleGenAI({ apiKey });
  const parts: (string | Part)[] = [];
  if (payload.inputType === InputType.IMAGE && payload.image?.data && payload.image?.mimeType) {
    parts.push({ inlineData: { mimeType: payload.image.mimeType, data: payload.image.data } });
    parts.push({ text: 'Analyze this image for manipulation, context, or fake news.' });
  } else if (payload.inputType === InputType.URL) {
    parts.push({ text: `Analyze the credibility and content of this URL: ${payload.input}` });
  } else {
    parts.push({ text: `Verify this claim/text: "${payload.input}"` });
  }

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: [{ text: systemPrompt }, ...parts],
    config: {
      tools: process.env.GEMINI_ENABLE_GROUNDING === 'false' ? [] : [{ googleSearch: {} }],
      temperature: Number(process.env.GEMINI_TEMPERATURE || '0.1'),
    },
  });

  const textOutput = response.text || '';
  const parsedData = parseJSONFromMarkdown(textOutput);
  if (!parsedData) {
    return Response.json({ error: 'Failed to parse analysis results.' }, { status: 502 });
  }

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: WebSource[] = groundingChunks
    .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
    .map((chunk: any) => ({ uri: chunk.web.uri, title: chunk.web.title }));
  const groundingSources = Array.from(new Map(sources.map((source) => [source.uri, source])).values());

  return Response.json({
    truthScore: parsedData.truthScore ?? 0,
    sourceCredibilityScore: parsedData.sourceCredibilityScore ?? 50,
    category: parsedData.category ?? FactCategory.UNKNOWN,
    subCategory: parsedData.subCategory ?? MisleadingSubCategory.NONE,
    summary: parsedData.summary || 'No summary provided.',
    detailedAnalysis: parsedData.detailedAnalysis || textOutput,
    groundingSources,
    externalFactChecks: parsedData.externalFactChecks || [],
    modelUsed: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  });
}
