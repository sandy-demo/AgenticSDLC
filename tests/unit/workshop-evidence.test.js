import { expect, it } from 'vitest';
import { markdownCell } from '../../scripts/workshop-evidence.mjs';

it('escapes a pipe and normalizes a newline in a Markdown cell', () => {
  expect(markdownCell('CI | e2e\npassed')).toBe('CI \\| e2e passed');
});
