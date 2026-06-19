/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
  readonly VITE_GEMINI_TEMPERATURE?: string;
  readonly VITE_GEMINI_ENABLE_GROUNDING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
