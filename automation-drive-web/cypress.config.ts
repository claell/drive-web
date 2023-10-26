import { defineConfig } from 'cypress';
const dotenvPlugin = require('cypress-dotenv')


const BASE_URL = 'https://drive.internxt.com/';
const config = defineConfig({
  defaultCommandTimeout: 13000,
  viewportHeight: 768,
  viewportWidth: 1366,
  watchForFileChanges: false,
  chromeWebSecurity: false,
  retries: 1,
  e2e: {
    reporter: 'cypress-mochawesome-reporter',
    specPattern: ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx,}'],
    baseUrl: BASE_URL,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      config = dotenvPlugin(config)
      return config
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    },
  },
});

export default config;
