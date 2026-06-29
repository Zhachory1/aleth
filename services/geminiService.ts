import { FactCheckResult, InputType } from "../types";
import { validateInputForAnalysis } from './inputValidation';

const ANALYZE_API_PATH = import.meta.env.VITE_ANALYZE_API_PATH || '/api/analyze';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeContent = async (
  input: string | File,
  inputType: InputType
): Promise<FactCheckResult> => {
  const validation = validateInputForAnalysis(input, inputType);
  if (!validation.ok) {
    throw new Error(validation.error || 'Invalid input.');
  }

  const body: Record<string, unknown> = { inputType };
  if (inputType === InputType.IMAGE && input instanceof File) {
    body.image = {
      mimeType: input.type,
      data: await fileToBase64(input),
    };
  } else {
    body.input = input;
  }

  const response = await fetch(ANALYZE_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to analyze content.');
  }
  return data as FactCheckResult;
};
