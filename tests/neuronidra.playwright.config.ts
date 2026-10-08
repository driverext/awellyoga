import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: 'neuronidra.browser.spec.ts', workers: 1,
  outputDir: '/tmp/neuronidra-browser-results',
  use: { baseURL: 'http://127.0.0.1:4200', headless: true,
    launchOptions: { executablePath: process.env['CHROME_BIN'] || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] } }
});
