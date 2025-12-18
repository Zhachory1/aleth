import { GoogleGenAI, Part } from "@google/genai";
import { FactCheckResult, FactCategory, MisleadingSubCategory, WebSource, ExternalCheck } from "../types";

// Rate Limiting Configuration
const RATE_LIMIT_MAX_REQUESTS = 2;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit store (per session/user)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Get or create a user identifier (using a simple session-based approach)
const getUserIdentifier = (): string => {
  // Try to get existing identifier from sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let userId = sessionStorage.getItem('aleth_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('aleth_user_id', userId);
    }
    return userId;
  }
  // Fallback for server-side or when sessionStorage is unavailable
  return 'default_user';
};

// Check and update rate limit
const checkRateLimit = (userId: string): void => {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now > entry.resetTime) {
    // First request or window expired - reset counter
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const secondsRemaining = Math.ceil((entry.resetTime - now) / 1000);
    throw new Error(
      `Rate limit exceeded. You can only make ${RATE_LIMIT_MAX_REQUESTS} requests per minute. ` +
      `Please try again in ${secondsRemaining} seconds.`
    );
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(userId, entry);
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(userId);
    }
  }
}, 60000); // Clean up every minute

const parseJSONFromMarkdown = (text: string): any => {
  try {
    // Try to find JSON block
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    // Fallback: try parsing the whole text if it looks like JSON
    if (text.trim().startsWith('{')) {
      return JSON.parse(text);
    }
  } catch (e) {
    console.error("Failed to parse JSON from model output", e);
  }
  return null;
};

export const analyzeContent = async (
  input: string | File,
  inputType: 'TEXT' | 'URL' | 'IMAGE'
): Promise<FactCheckResult> => {
  // Enforce rate limiting
  const userId = getUserIdentifier();
  checkRateLimit(userId);

  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set it in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prompt engineering for structured analysis
  const systemPrompt = `
    You are Aleth, an automated world-class fact-checking system.
    Your goal is to analyze the user input (Text, URL, or Image) and determine its truthfulness using Google Search.

    1. **Search & Verify**: Search Google to verify the claims, image context, or URL content.
    2. **Cross-Reference**: Explicitly search for existing fact-checks from reputable organizations like Snopes, PolitiFact, FactCheck.org, Reuters Fact Check, and AP News.
    3. **Source Analysis**: Analyze the credibility of the source domain (if URL provided) or the likely origin of the claim. Consider domain age, known biases, and history of retraction.

    4. **Categorize** into one of these High-Level Categories:
       - 'Satire' (Humor, not meant to be taken seriously)
       - 'Clickbait' (Exaggerated headlines, but maybe thin content)
       - 'Unreliable Sources' (Biased or non-credible source)
       - 'Misleading' (Intent to deceive)
       - 'Verified / High Credibility' (Accurate information)

    5. If 'Misleading', verify specific nature (Sub-Category):
       - 'Technically True' (True facts used to imply falsehood)
       - 'Partially True' (Mix of fact and fiction)
       - 'Facts Twisted' (Real events re-interpreted falsely)
       - 'False Context' (Real image/quote in wrong context)
       - 'Fabricated / Total Fake' (Completely made up)
       If not misleading, use null.

    6. **Scoring**:
       - 'truthScore' (0-100): 0 = Total Lie, 100 = Absolute Truth.
       - 'sourceCredibilityScore' (0-100): 0 = Known Fake News Site, 100 = Gold Standard Journalism.

    IMPORTANT: Output result as raw JSON inside \`\`\`json ... \`\`\`.
    Structure:
    {
      "truthScore": number,
      "sourceCredibilityScore": number,
      "category": string,
      "subCategory": string or null,
      "summary": string,
      "detailedAnalysis": string,
      "externalFactChecks": [
         { "organization": "Snopes", "rating": "False", "url": "..." }
      ]
    }
  `;

  let parts: (string | Part)[] = [];

  if (inputType === 'IMAGE' && input instanceof File) {
    const base64Data = await fileToBase64(input);
    parts.push({
      inlineData: {
        mimeType: input.type,
        data: base64Data
      }
    });
    parts.push({ text: "Analyze this image for manipulation, context, or fake news." });
  } else if (inputType === 'URL') {
    parts.push({ text: `Analyze the credibility and content of this URL: ${input}` });
  } else {
    parts.push({ text: `Verify this claim/text: "${input}"` });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }, ...parts] }
      ],
      config: {
        tools: [{ googleSearch: {} }], // Enable grounding
        temperature: 0.1, // Low temperature for factual accuracy
      }
    });

    const textOutput = response.text || "";
    const parsedData = parseJSONFromMarkdown(textOutput);

    // Extract Grounding Sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: WebSource[] = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title
      }));
    
    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    if (!parsedData) {
      throw new Error("Failed to parse analysis results.");
    }

    return {
      truthScore: parsedData.truthScore || 0,
      sourceCredibilityScore: parsedData.sourceCredibilityScore || 50,
      category: parsedData.category as FactCategory || FactCategory.UNKNOWN,
      subCategory: parsedData.subCategory as MisleadingSubCategory || null,
      summary: parsedData.summary || "No summary provided.",
      detailedAnalysis: parsedData.detailedAnalysis || textOutput,
      groundingSources: uniqueSources,
      externalFactChecks: parsedData.externalFactChecks || []
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove Data URI prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
