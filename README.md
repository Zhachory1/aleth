# Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` only in your backend/serverless environment
3. Run the app:
   `npm run dev`

## Configuration

You can configure Gemini model settings in your `.env.local` file:

```bash
# Required server-side only: your Gemini API key
GEMINI_API_KEY=your_api_key_here

# Optional browser-facing backend path (default: /api/analyze)
VITE_ANALYZE_API_PATH=/api/analyze

# Optional: Gemini model to use (default: gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash

# Optional: Temperature for generation (0.0-2.0, default: 0.1)
# Lower values = more deterministic, higher = more creative
GEMINI_TEMPERATURE=0.1

# Optional: Enable Google Search grounding (default: true)
# Set to 'false' to disable web search during fact-checking
GEMINI_ENABLE_GROUNDING=true
```

### Generation Parameters

- **Model**: The Gemini model used for analysis (e.g., `gemini-2.5-flash`, `gemini-2.0-pro`)
- **Temperature**: Controls randomness (0.0 = deterministic, 2.0 = very creative). For fact-checking, lower is better.
- **Grounding**: When enabled, the model can search Google to verify claims with real-time information.
