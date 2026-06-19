import { describe, expect, it } from 'vitest';
import { InputType } from '../../types';
import {
  INPUT_LIMITS,
  validateImageInput,
  validateInputForAnalysis,
  validateTextInput,
  validateUrlInput,
} from '../inputValidation';

describe('input validation', () => {
  it('rejects empty and oversized text', () => {
    expect(validateTextInput('   ').ok).toBe(false);
    expect(validateTextInput('x'.repeat(INPUT_LIMITS.maxTextLength + 1)).ok).toBe(false);
    expect(validateTextInput('valid claim').ok).toBe(true);
  });

  it('accepts only valid http(s) URLs within length limits', () => {
    expect(validateUrlInput('https://example.com/story').ok).toBe(true);
    expect(validateUrlInput('http://example.com/story').ok).toBe(true);
    expect(validateUrlInput('ftp://example.com/story').ok).toBe(false);
    expect(validateUrlInput('not a url').ok).toBe(false);
    expect(validateUrlInput(`https://example.com/${'x'.repeat(INPUT_LIMITS.maxUrlLength)}`).ok).toBe(false);
  });

  it('validates image type and size', () => {
    expect(validateImageInput(new File(['ok'], 'ok.png', { type: 'image/png' })).ok).toBe(true);
    expect(validateImageInput(new File(['bad'], 'bad.txt', { type: 'text/plain' })).ok).toBe(false);
    expect(validateImageInput(new File([new Uint8Array(INPUT_LIMITS.maxImageBytes + 1)], 'big.png', { type: 'image/png' })).ok).toBe(false);
  });

  it('validates by input type at service boundary', () => {
    expect(validateInputForAnalysis('https://example.com', InputType.URL).ok).toBe(true);
    expect(validateInputForAnalysis('javascript:alert(1)', InputType.URL).ok).toBe(false);
  });
});
