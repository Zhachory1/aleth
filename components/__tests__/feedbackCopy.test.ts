import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(path.join(process.cwd(), 'components/FeedbackSection.tsx'), 'utf8');

describe('FeedbackSection copy', () => {
  it('does not claim feedback is submitted to review/RLHF systems', () => {
    expect(source).toContain('local-only');
    expect(source).toContain('not submitted to a backend');
    expect(source).toContain('not used for RLHF');
    expect(source).not.toContain('queued for our review team');
    expect(source).not.toContain('used to fine-tune future versions');
  });
});
