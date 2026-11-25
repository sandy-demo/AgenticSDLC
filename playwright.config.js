import { defineConfig, devices } from '@playwright/test';

const port = process.env.E2E_PORT ?? '41711';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL },
  webServer: {
    command: 'node src/server.js',
    env: { PORT: port },
    url: `${baseURL}/health`,
    reuseExistingServer: false,
  },
});
