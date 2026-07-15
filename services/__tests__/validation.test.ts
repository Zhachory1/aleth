/**
 * Tests for validation utilities
 * Covers Issue #7 (validation) and Issue #9 (safe URL parsing)
 */

import { describe, it, expect } from 'vitest';
import { validateGeminiResponse, safeGetHostname, clamp } from '../validation';
import { FactCategory, MisleadingSubCategory } from '../../types';

describe('validateGeminiResponse', () => {
  it('validates a valid response', () => {
    const validData = {
      truthScore: 75,
      sourceCredibilityScore: 85,
      category: FactCategory.VERIFIED,
      subCategory: null,
      summary: 'This is verified',
      detailedAnalysis: 'Detailed analysis here',
      externalFactChecks: []
    };

    const result = validateGeminiResponse(validData);
    expect(result).toEqual({
      ...validData,
      confidenceState: 'Low',
      evidenceQuotes: []
    });
  });

  it('validates response with provenance fields', () => {
    const dataWithEvidence = {
      truthScore: 50,
      sourceCredibilityScore: 60,
      category: FactCategory.INSUFFICIENT,
      subCategory: null,
      summary: 'Not enough evidence',
      detailedAnalysis: 'Sources do not establish the claim.',
      confidenceState: 'Insufficient Evidence' as const,
      evidenceQuotes: [
        {
          sourceUrl: 'https://example.com/source',
          quote: 'Available records do not confirm the claim.'
        }
      ],
      externalFactChecks: []
    };

    const result = validateGeminiResponse(dataWithEvidence);
    expect(result.confidenceState).toBe('Insufficient Evidence');
    expect(result.evidenceQuotes[0].quote).toContain('Available records');
  });

  it('validates response with external fact checks', () => {
    const dataWithChecks = {
      truthScore: 50,
      sourceCredibilityScore: 60,
      category: FactCategory.MISLEADING,
      subCategory: MisleadingSubCategory.PARTIAL,
      summary: 'Partially true',
      detailedAnalysis: 'Mixed facts',
      externalFactChecks: [
        {
          organization: 'Snopes',
          rating: 'Mixed',
          url: 'https://snopes.com/fact-check/example'
        }
      ]
    };

    const result = validateGeminiResponse(dataWithChecks);
    expect(result.externalFactChecks).toHaveLength(1);
    expect(result.externalFactChecks[0].organization).toBe('Snopes');
  });

  it('preserves valid zero scores', () => {
    const dataWithZeros = {
      truthScore: 0,
      sourceCredibilityScore: 0,
      category: FactCategory.MISLEADING,
      subCategory: MisleadingSubCategory.FABRICATED,
      summary: 'Completely false',
      detailedAnalysis: 'Total fabrication',
      externalFactChecks: []
    };

    const result = validateGeminiResponse(dataWithZeros);
    expect(result.truthScore).toBe(0);
    expect(result.sourceCredibilityScore).toBe(0);
  });

  it('rejects scores outside 0-100 range', () => {
    const invalidScore = {
      truthScore: 150,
      sourceCredibilityScore: 50,
      category: FactCategory.VERIFIED,
      subCategory: null,
      summary: 'Test',
      detailedAnalysis: 'Test',
      externalFactChecks: []
    };

    expect(() => validateGeminiResponse(invalidScore)).toThrow();
  });

  it('rejects negative scores', () => {
    const negativeScore = {
      truthScore: -10,
      sourceCredibilityScore: 50,
      category: FactCategory.VERIFIED,
      subCategory: null,
      summary: 'Test',
      detailedAnalysis: 'Test',
      externalFactChecks: []
    };

    expect(() => validateGeminiResponse(negativeScore)).toThrow();
  });

  it('rejects invalid category', () => {
    const invalidCategory = {
      truthScore: 50,
      sourceCredibilityScore: 50,
      category: 'InvalidCategory',
      subCategory: null,
      summary: 'Test',
      detailedAnalysis: 'Test',
      externalFactChecks: []
    };

    expect(() => validateGeminiResponse(invalidCategory)).toThrow();
  });

  it('rejects invalid subCategory', () => {
    const invalidSubCategory = {
      truthScore: 50,
      sourceCredibilityScore: 50,
      category: FactCategory.MISLEADING,
      subCategory: 'InvalidSubCategory',
      summary: 'Test',
      detailedAnalysis: 'Test',
      externalFactChecks: []
    };

    expect(() => validateGeminiResponse(invalidSubCategory)).toThrow();
  });

  it('rejects missing required fields', () => {
    const missingFields = {
      truthScore: 50,
      category: FactCategory.VERIFIED
    };

    expect(() => validateGeminiResponse(missingFields)).toThrow();
  });

  it('rejects extra fields (strict mode)', () => {
    const extraFields = {
      truthScore: 50,
      sourceCredibilityScore: 50,
      category: FactCategory.VERIFIED,
      subCategory: null,
      summary: 'Test',
      detailedAnalysis: 'Test',
      externalFactChecks: [],
      extraField: 'should not be here'
    };

    expect(() => validateGeminiResponse(extraFields)).toThrow();
  });

  it('defaults externalFactChecks to empty array if not provided', () => {
    const noFactChecks = {
      truthScore: 50,
      sourceCredibilityScore: 50,
      category: FactCategory.VERIFIED,
      subCategory: null,
      summary: 'Test',
      detailedAnalysis: 'Test'
    };

    const result = validateGeminiResponse(noFactChecks);
    expect(result.externalFactChecks).toEqual([]);
  });
});

describe('safeGetHostname', () => {
  it('extracts hostname from valid absolute URL', () => {
    expect(safeGetHostname('https://example.com/path')).toBe('example.com');
    expect(safeGetHostname('http://www.google.com')).toBe('www.google.com');
    expect(safeGetHostname('https://sub.domain.example.org:8080/test')).toBe('sub.domain.example.org');
  });

  it('returns fallback for relative URLs', () => {
    expect(safeGetHostname('/relative/path')).toBe('Unknown Source');
    expect(safeGetHostname('../parent/path')).toBe('Unknown Source');
  });

  it('returns fallback for URLs without protocol', () => {
    expect(safeGetHostname('example.com')).toBe('Unknown Source');
    expect(safeGetHostname('www.example.com/path')).toBe('Unknown Source');
  });

  it('returns fallback for malformed URLs', () => {
    expect(safeGetHostname('not a url at all')).toBe('Unknown Source');
    expect(safeGetHostname('ht!tp://bad-protocol.com')).toBe('Unknown Source');
    expect(safeGetHostname('')).toBe('Unknown Source');
  });

  it('uses custom fallback when provided', () => {
    expect(safeGetHostname('invalid', 'Custom Fallback')).toBe('Custom Fallback');
    expect(safeGetHostname('/relative', 'N/A')).toBe('N/A');
  });

  it('handles file:// protocol', () => {
    expect(safeGetHostname('file:///path/to/file.html')).toBe('');
  });
});

describe('clamp', () => {
  it('clamps values to min', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(-1, 0, 100)).toBe(0);
  });

  it('clamps values to max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(101, 0, 100)).toBe(100);
  });

  it('preserves values within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});
