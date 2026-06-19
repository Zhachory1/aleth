/**
 * Runtime validation for Gemini API responses using Zod
 * Ensures type safety and prevents malformed data from reaching the UI
 */

import { z } from 'zod';
import { FactCategory, MisleadingSubCategory } from '../types';

/**
 * Zod schema for external fact check references
 */
const ExternalCheckSchema = z.object({
  organization: z.string(),
  rating: z.string(),
  url: z.string().url()
}).strict();

/**
 * Zod schema for the parsed Gemini response
 * Uses .strict() to reject unexpected fields (security: prevents prototype pollution)
 */
const GeminiResponseSchema = z.object({
  truthScore: z.number().min(0).max(100),
  sourceCredibilityScore: z.number().min(0).max(100),
  category: z.nativeEnum(FactCategory),
  subCategory: z.nativeEnum(MisleadingSubCategory).nullable(),
  summary: z.string(),
  detailedAnalysis: z.string(),
  externalFactChecks: z.array(ExternalCheckSchema).optional().default([])
}).strict();

export type ValidatedGeminiResponse = z.infer<typeof GeminiResponseSchema>;

/**
 * Validate and parse Gemini response data
 * @param data Raw parsed JSON from the model
 * @returns Validated response or throws ZodError with detailed issues
 */
export const validateGeminiResponse = (data: unknown): ValidatedGeminiResponse => {
  return GeminiResponseSchema.parse(data);
};

/**
 * Clamp a number to a specific range
 * Used as fallback if validation allows partial data recovery
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Safely extract hostname from a URI
 * Returns fallback string if URL is malformed or relative
 * @param uri The URI to parse
 * @param fallback Fallback hostname (default: "Unknown Source")
 * @returns Hostname or fallback
 */
export const safeGetHostname = (uri: string, fallback: string = "Unknown Source"): string => {
  try {
    const url = new URL(uri);
    return url.hostname;
  } catch {
    // Invalid URL (relative, no protocol, malformed)
    return fallback;
  }
};
