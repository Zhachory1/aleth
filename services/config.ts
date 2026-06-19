/**
 * Application configuration with runtime validation
 * Validates environment variables at startup to fail fast on misconfiguration
 */

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  enableGrounding: boolean;
}

/**
 * Parse and validate Gemini configuration from environment variables
 * Throws clear errors if configuration is invalid
 */
export const getGeminiConfig = (): GeminiConfig => {
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "API Key is missing. Please set GEMINI_API_KEY in your .env.local file."
    );
  }

  // Parse model (default: gemini-2.5-flash)
  const model = import.meta.env.VITE_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
  // Parse temperature (default: 0.1, must be 0.0-2.0)
  const tempStr = import.meta.env.VITE_GEMINI_TEMPERATURE || process.env.GEMINI_TEMPERATURE || '0.1';
  const temperature = parseFloat(tempStr);
  
  if (isNaN(temperature) || temperature < 0 || temperature > 2.0) {
    throw new Error(
      `Invalid GEMINI_TEMPERATURE: "${tempStr}". Must be a number between 0.0 and 2.0.`
    );
  }

  // Parse grounding flag (default: true)
  const groundingStr = import.meta.env.VITE_GEMINI_ENABLE_GROUNDING || process.env.GEMINI_ENABLE_GROUNDING || 'true';
  const enableGrounding = groundingStr.toLowerCase() !== 'false';

  return {
    apiKey,
    model,
    temperature,
    enableGrounding
  };
};

/**
 * Validate configuration at app startup
 * Call this once in main.tsx or App.tsx to fail fast
 */
export const validateConfig = (): void => {
  try {
    const config = getGeminiConfig();
    console.log('[Config] Gemini configuration loaded:', {
      model: config.model,
      temperature: config.temperature,
      enableGrounding: config.enableGrounding,
      apiKeyPresent: !!config.apiKey
    });
  } catch (error) {
    console.error('[Config] Configuration validation failed:', error);
    throw error;
  }
};
