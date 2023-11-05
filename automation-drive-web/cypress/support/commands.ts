import { login } from '../../cypress/support/pages/loginPage';
require('cypress-downloadfile/lib/downloadFileCommand');
import { apis } from '../../cypress/support/pages/apis'; 
require('cy-verify-downloads').addCustomCommand();
require('cypress-delete-downloads-folder').addCustomCommand();
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
Cypress.Commands.add('SessionLogin', (email, password) => {
  
  cy.session('SessionLogin',()=>{
    apis.loginInterception().as('login')
    cy.visit('/');
    email && login.writeEmail(email);
    password && login.writePassword(password);
    login.clickSignIn();
    cy.wait('@login').then((access: any)=>{
      expect(access.response.statusCode).to.equal(200)
      window.localStorage.setItem('authToken', access.response.body.newToken)
      return access
    })
  })
});

Cypress.Commands.add('Login', (email, password) => {

    apis.loginInterception().as('login')
    cy.visit('/');
    email && login.writeEmail(email);
    password && login.writePassword(password);
    login.clickSignIn();
    cy.wait('@login').then((access: any)=>{
      expect(access.response.statusCode).to.equal(200)
      return access
    })
});






//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
