import { defineConfig } from 'cypress';
const dotenvPlugin = require('cypress-dotenv')
require('dotenv').config()
const { verifyDownloadTasks } = require('cy-verify-downloads');
const { rmdir } = require('fs')
const { removeDirectory } = require('cypress-delete-downloads-folder');


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
      on('task', verifyDownloadTasks);
      on('task', { removeDirectory })
      on('task', {
        deleteFolder(folderName) {
          console.log('deleting folder %s', folderName)
    
          return new Promise((resolve, reject) => {
            rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
              if (err) {
                console.error(err)
                return reject(err)
              }
              resolve(null)
            })
          })
        },
      })
      require('cypress-mochawesome-reporter/plugin')(on)
      config = dotenvPlugin(config)
      return config
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    },
  },
  env:{
    mainAccount: process.env.TESTING_MAINACCOUNT,
    readerAccount: process.env.TESTING_READERACCOUNT,
    editorAccount: process.env.TESTING_EDITORACCOUNT,
    password: process.env.TESTING_PASSWORD
  }
});
export default config;
