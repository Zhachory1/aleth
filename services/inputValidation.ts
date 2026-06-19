import { InputType } from '../types';

export const INPUT_LIMITS = {
  maxTextLength: 5_000,
  maxUrlLength: 2_048,
  maxImageBytes: 5 * 1024 * 1024,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export const validateTextInput = (value: string): ValidationResult => {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: 'Enter text to analyze.' };
  if (trimmed.length > INPUT_LIMITS.maxTextLength) {
    return { ok: false, error: `Text must be ${INPUT_LIMITS.maxTextLength.toLocaleString()} characters or fewer.` };
  }
  return { ok: true };
};

export const validateUrlInput = (value: string): ValidationResult => {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: 'Enter a URL to analyze.' };
  if (trimmed.length > INPUT_LIMITS.maxUrlLength) {
    return { ok: false, error: `URL must be ${INPUT_LIMITS.maxUrlLength.toLocaleString()} characters or fewer.` };
  }
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { ok: false, error: 'Only http:// and https:// URLs are supported.' };
    }
  } catch {
    return { ok: false, error: 'Enter a valid URL.' };
  }
  return { ok: true };
};

export const validateImageInput = (file: File | null): ValidationResult => {
  if (!file) return { ok: false, error: 'Choose an image to analyze.' };
  if (!INPUT_LIMITS.allowedImageTypes.includes(file.type)) {
    return { ok: false, error: 'Use a JPEG, PNG, WebP, or GIF image.' };
  }
  if (file.size > INPUT_LIMITS.maxImageBytes) {
    return { ok: false, error: 'Image must be 5 MB or smaller.' };
  }
  return { ok: true };
};

export const validateInputForAnalysis = (input: string | File, type: InputType): ValidationResult => {
  if (type === InputType.TEXT) return validateTextInput(String(input));
  if (type === InputType.URL) return validateUrlInput(String(input));
  return validateImageInput(input instanceof File ? input : null);
};
