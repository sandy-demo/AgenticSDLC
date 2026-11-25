import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: process.env.QA_BOUNDARY === '1'
      ? ['tests/unit/validation.test.js', 'tests/labs/approval-boundary.test.js'] : ['tests/unit/**/*.test.js'],
    coverage: { include: ['src/services/**/*.js'], reporter: ['text', 'json-summary'], reportOnFailure: true },
  },
});
