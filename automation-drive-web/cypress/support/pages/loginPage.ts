class Login {
    titleCreateAccount: () => Cypress.Chainable<JQuery<HTMLElement>>;
    emailTitle:() => Cypress.Chainable<JQuery<HTMLElement>>;
    emailInputForm:() => Cypress.Chainable<JQuery<HTMLElement>>;
    passwordTitle:() => Cypress.Chainable<JQuery<HTMLElement>>;
    passwordInputForm:() => Cypress.Chainable<JQuery<HTMLElement>>;
    logInButton:() => Cypress.Chainable<JQuery<HTMLElement>>;
    
    constructor(){
        this.titleCreateAccount=()=> cy.contains('Create account'),
        this.emailTitle=()=> cy.get('div label span').first(),
        this.emailInputForm=()=> cy.get('[name="email"]'),
        this.passwordTitle=()=> cy.get('div label span').last(),
        this.passwordInputForm=()=> cy.get('[name="password"]'),
        this.logInButton=()=> cy.get('[type="submit"]')
    }
        
    async writeEmail(email: string){
        
        this.emailTitle().should('have.text', 'Email')
        this.emailInputForm().type(email)
    }
    async writePassword(password: string){
        this.passwordTitle().should('have.text', 'Password')
        this.passwordInputForm().type(password)
    }
    async clickSignIn(){
        this.logInButton().click()
    }
}
export const loginHelper = new Login()