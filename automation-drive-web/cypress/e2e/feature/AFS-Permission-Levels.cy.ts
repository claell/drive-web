import { apis } from '../../../support/pages/apis'
import { drive } from '../../../support/pages/drivePage'
import { shared } from '../../../support/pages/sharedPage'
import data from '../../../fixtures/data/staticData.json'
import { removeLogs } from '../../../support/utils/removeLogs'
let timeout:number= 6000 
let API: Cypress.folderInfoStructure ={
  folderID:'',
  folderName:'',
  newToken:'',
  folderID2:'',
  folderName2:'',
  invitationID:''
}
const mainAccount:string= Cypress.env('MAIN_ACCOUNT')
const mainAccount2:string = Cypress.env('MAIN_ACCOUNT2')
const mainAccountPass: string =Cypress.env('MAIN_ACCOUNT_PASS')
const readerAccount: string = Cypress.env('READER_ACCOUNT')
const editorAccount: string = Cypress.env('EDITOR_ACCOUNT')
const password: string = Cypress.env('PASSWORD')
const expectedURL: string = data.urls.app

describe("Permission Levels", () => {
  
    describe("User shares a folder with different permissions", () => {
      before('Login In',()=>{
        apis.loginInterception().as('login')
        cy.Login( mainAccount, mainAccountPass ); 
        cy.wait('@login').then((access: any)=>{
            expect(access.response.statusCode).to.equal(200)
            API.newToken= access.response.body.newToken
        })
     })
     after('Rejecting Invitation as Reader',()=>{
      drive.clearSession()
      apis.loginInterception().as('login')
      cy.Login(readerAccount, password)
      cy.wait('@login', {timeout:timeout}).then((access: any)=>{
        expect(access.response.statusCode).to.equal(200)
        API.newToken= access.response.body.newToken
    })
      apis.rejectInvitation(API.invitationID, API.newToken).then((deletion)=>{
        expect(deletion.status).equal(200)
        expect(deletion.statusText).equal('OK')
      })
      })

      it("TC1 | Verify that the user can share the folder with 'View Only' permission", () => {
        
        cy.url().should('equal', expectedURL)
        drive.closeModal()
        drive.selectRandomFolderandRightClick().then(()=>{
          API.folderName= Cypress.env('sharedFolder')
        }) 
        drive.clickonShareButtonOption()
        drive.clickPermissionsDropdown()
        drive.clickRestrictedButtonOption()
        drive.clickInviteButton()
        drive.writeInvitationEmail(readerAccount)
        drive.clickOnEditorReaderDropdown()
        drive.clickOnReaderOptionButton()
        drive.clickInviteUser()
        cy.intercept('POST', 'https://api.internxt.com/drive/sharings/invites/send').as('invitation')
        drive.invitationSentSuccess().then(()=>{
          expect(Cypress.env('success')).to.equal(data.assertion.invitationSentReader)
        })
        cy.wait('@invitation').then((invitation:any)=>{
          API.invitationID= invitation.response.body.id
        })
      });
    });
    describe("User shares a folder with different permissions", () => {
      before('Login In',()=>{
        apis.loginInterception().as('login')
        cy.Login( mainAccount, mainAccountPass ); 
        cy.wait('@login').then((access: any)=>{
            expect(access.response.statusCode).to.equal(200)
            API.newToken= access.response.body.newToken
        })
     })
     after('Rejecting Invitation as Editor',()=>{
      drive.clearSession()
      apis.loginInterception().as('login')
      cy.Login(editorAccount, password)
      cy.wait('@login').then((access: any)=>{
        expect(access.response.statusCode).to.equal(200)
        API.newToken= access.response.body.newToken
    })
      apis.rejectInvitation(API.invitationID, API.newToken).then((deletion)=>{
        expect(deletion.status).equal(200)
        expect(deletion.statusText).equal('OK')
      })
      })

      it("TC2 | Verify that the user can share the folder with 'Edit' permission", () => {
        
        cy.url().should('equal', expectedURL)
        drive.closeModal()
        drive.selectRandomFolderandRightClick().then(()=>{
          API.folderName= Cypress.env('sharedFolder')
        }) 
        drive.clickonShareButtonOption()
        drive.clickPermissionsDropdown()
        drive.clickRestrictedButtonOption()
        drive.clickInviteButton()
        drive.writeInvitationEmail(editorAccount)
        drive.clickInviteUser()
        apis.invitationInterception().as('invitation')
        drive.invitationSentSuccess().then(()=>{
          expect(Cypress.env('success')).to.equal(data.assertion.invitationSentEditor)
        })
        cy.wait('@invitation').then((invitation:any)=>{
          API.invitationID= invitation.response.body.id
        })
      });
    });

    describe("User shares a folder with different permissions", () => {

      before('Precondition: Send and accept invitation',()=>{
        apis.loginInterception().as('login')
        cy.Login( mainAccount2, password ); 
        cy.wait('@login').then((access: any)=>{
            expect(access.response.statusCode).to.equal(200)
            API.newToken= access.response.body.newToken
        })
     })

      it("TC3 | Validate that the user can share a folder inside shared folder", () => {
        cy.url().should('equal', expectedURL)
        drive.closeModal()
        drive.selectFolderandDoubleClick(data.sharedFolder)

      })
      });

      describe.only("User shares a folder with different permissions", () => {

        before('Login In',()=>{
          apis.loginInterception().as('login')
          cy.Login( editorAccount, password ); 
          cy.wait('@login').then((access: any)=>{
              expect(access.response.statusCode).to.equal(200)
              API.newToken= access.response.body.newToken
          })
       })
       
       it("TC4 | Validate that the editor can't edit or rename the name of a file", () => {
          
          cy.wait(500)
          cy.url().should('equal', expectedURL)
          drive.closeModal()
          drive.clickSharedPageButton()
          shared.selectFolderandDoubleClick(data.sharedFolder)
          cy.wait(500)
          apis.getSelectedFolderUuid(data.sharedFolder, API.newToken).then(()=>{
            cy.log(Cypress.env('folderUUID'))
          })
          shared.clickRandomFolder()
        });
      });

  });

  removeLogs()
  