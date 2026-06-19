/**
 * Tests for configuration module
 * Covers Issue #8 (configurable Gemini settings)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getGeminiConfig } from '../config';

// Save original env
const originalEnv = { ...process.env };

describe('getGeminiConfig', () => {
  beforeEach(() => {
    // Clear env before each test
    delete process.env.API_KEY;
    delete process.env.GEMINI_MODEL;
    delete process.env.GEMINI_TEMPERATURE;
    delete process.env.GEMINI_ENABLE_GROUNDING;
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  it('throws error when API key is missing', () => {
    expect(() => getGeminiConfig()).toThrow('API Key is missing');
  });

  it('uses default values when optional env vars are not set', () => {
    process.env.API_KEY = 'test-key';
    
    const config = getGeminiConfig();
    
    expect(config.apiKey).toBe('test-key');
    expect(config.model).toBe('gemini-2.5-flash');
    expect(config.temperature).toBe(0.1);
    expect(config.enableGrounding).toBe(true);
  });

  it('uses custom model when GEMINI_MODEL is set', () => {
    process.env.API_KEY = 'test-key';
    process.env.GEMINI_MODEL = 'gemini-2.0-pro';
    
    const config = getGeminiConfig();
    
    expect(config.model).toBe('gemini-2.0-pro');
  });

  it('uses custom temperature when GEMINI_TEMPERATURE is set', () => {
    process.env.API_KEY = 'test-key';
    process.env.GEMINI_TEMPERATURE = '0.7';
    
    const config = getGeminiConfig();
    
    expect(config.temperature).toBe(0.7);
  });

  it('rejects invalid temperature (non-numeric)', () => {
    process.env.API_KEY = 'test-key';
    process.env.GEMINI_TEMPERATURE = 'not-a-number';
    
    expect(() => getGeminiConfig()).toThrow('Invalid GEMINI_TEMPERATURE');
  });

  it('rejects temperature below 0', () => {
    process.env.API_KEY = 'test-key';
    process.env.GEMINI_TEMPERATURE = '-0.5';
    
    expect(() => getGeminiConfig()).toThrow('Invalid GEMINI_TEMPERATURE');
  });

  it('rejects temperature above 2.0', () => {
    process.env.API_KEY = 'test-key';
    process.env.GEMINI_TEMPERATURE = '3.0';
    
    expect(() => getGeminiConfig()).toThrow('Invalid GEMINI_TEMPERATURE');
  });

  it('accepts temperature at boundaries (0.0 and 2.0)', () => {
    process.env.API_KEY = 'test-key';
    
    process.env.GEMINI_TEMPERATURE = '0.0';
    let config = getGeminiConfig();
    expect(config.temperature).toBe(0.0);
    
    process.env.GEMINI_TEMPERATURE = '2.0';
    config = getGeminiConfig();
    expect(config.temperature).toBe(2.0);
  });

  it('disables grounding when GEMINI_ENABLE_GROUNDING is "false"', () => {
    process.env.API_KEY = 'test-key';
    process.env.GEMINI_ENABLE_GROUNDING = 'false';
    
    const config = getGeminiConfig();
    
    expect(config.enableGrounding).toBe(false);
  });

  it('disables grounding when GEMINI_ENABLE_GROUNDING is "FALSE"', () => {
    process.env.API_KEY = 'test-key';
    process.env.GEMINI_ENABLE_GROUNDING = 'FALSE';
    
    const config = getGeminiConfig();
    
    expect(config.enableGrounding).toBe(false);
  });

  it('enables grounding for any value other than "false"', () => {
    process.env.API_KEY = 'test-key';
    
    const testValues = ['true', 'TRUE', '1', 'yes', 'anything'];
    
    for (const value of testValues) {
      process.env.GEMINI_ENABLE_GROUNDING = value;
      const config = getGeminiConfig();
      expect(config.enableGrounding).toBe(true);
    }
  });

  it('returns complete configuration object', () => {
    process.env.API_KEY = 'test-key';
    process.env.GEMINI_MODEL = 'gemini-2.0-pro';
    process.env.GEMINI_TEMPERATURE = '0.5';
    process.env.GEMINI_ENABLE_GROUNDING = 'true';
    
    const config = getGeminiConfig();
    
    expect(config).toEqual({
      apiKey: 'test-key',
      model: 'gemini-2.0-pro',
      temperature: 0.5,
      enableGrounding: true
    });
  });
});
