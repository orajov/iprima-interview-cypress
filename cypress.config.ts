import { defineConfig } from 'cypress';
require('dotenv').config();

export default defineConfig({
  e2e: {
    baseUrl: "https://www.iprima.cz/",
    viewportWidth: 1920,
    viewportHeight: 1080,
    chromeWebSecurity: false,
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    video: true,
    videoCompression: false,
    videosFolder: "cypress/report/videos",
    defaultCommandTimeout: 30000,
    env: {
      MAILOSAUR_API_KEY: process.env.MAILOSAUR_API_KEY,
      MAILOSAUR_SERVER_ID: process.env.MAILOSAUR_SERVER_ID
    },
    setupNodeEvents(on, config) {
      return config;
    },
  }
});