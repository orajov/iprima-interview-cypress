import { defineConfig } from 'cypress';

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
  }
});
