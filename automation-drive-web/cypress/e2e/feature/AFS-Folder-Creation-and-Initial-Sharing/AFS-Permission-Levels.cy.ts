import { apis } from '../../../support/pages/apis'
import { drive } from '../../../support/pages/drivePage'
import { shared } from '../../../support/pages/sharedPage'
import data from '../../../fixtures/data/staticData.json'
import { removeLogs } from '../../../support/utils/removeLogs'

let timeout:number= 30000
let downloadedItem=''
let API: Cypress.folderInfoStructure ={
  folderID:'',
  folderName:'',
  token:'',
  newToken:'',
  folderID2:'',
  folderName2:'',
  invitationID:'',
  originalFolderName:'',
  newFolderName:'',
}
let invitationID1:string, invitationID2:string
let items: Cypress.itemStructure={
  originalItemName:'',
  newItemName:''
}
const expectedURL: string = data.urls.app

describe("Permission Levels", () => {
  

    describe("User shares a folder with different permissions", () => {

      before('Login In',()=>{
        
        Cypress.session.clearCurrentSessionData()
        Cypress.session.clearAllSavedSessions()
        cy.Login( Cypress.env('mainAccount'), Cypress.env('password') ).then((access:any)=>{
          expect(access.response.statusCode).to.equal(200)
        })
        cy.visit('/app') 
      })
      after('Rejecting Invitation as Reader',()=>{
        
        Cypress.session.clearCurrentSessionData()
        Cypress.session.clearAllSavedSessions()
        cy.Login( Cypress.env('readerAccount'), Cypress.env('password') ).then((access:any)=>{
          API.newToken= access.response.body.newToken
          apis.rejectInvitation(invitationID1, API.newToken).then((deletion)=>{
            expect(deletion.status).equal(200)
            expect(deletion.statusText).equal('OK')
          })
        })
      })
      
      it.only("TC1 | Verify that the user can share the folder with 'View Only' permission", () => {
        let foldersArray=['Cars', 'Family', 'Personal', 'Work']

        cy.visit('/app')
        cy.url().should('equal', expectedURL)
        drive.closeModal2()
        const randomFold= Cypress._.random(0, foldersArray.length-1)
        const chosenFolder= foldersArray[randomFold]
        drive.selectFolderandRightClick(chosenFolder).then(()=>{
          API.folderName= Cypress.env('sharedFolder')
        })
        drive.clickonShareButtonOption()
        drive.clickPermissionsDropdown()
        drive.clickRestrictedButtonOption()
        drive.clickInviteButton()
        drive.writeInvitationEmail(Cypress.env('readerAccount'))
        drive.clickOnEditorReaderDropdown()
        drive.clickOnReaderOptionButton()
        drive.clickInviteUser()
        cy.intercept('POST', 'https://api.internxt.com/drive/sharings/invites/send').as('invitation')
        drive.invitationSentSuccess().then(()=>{
          expect(Cypress.env('success')).to.equal(data.assertion.invitationSentReader)
        })
        cy.wait('@invitation').then((invitation:any)=>{
          invitationID1= invitation.response.body.id
        })
      });
    })

    describe("User shares a folder with different permissions", () => {

      before('Login In',()=>{

        Cypress.session.clearCurrentSessionData()
        Cypress.session.clearAllSavedSessions()
        cy.Login( Cypress.env('mainAccount'), Cypress.env('password') );
        cy.visit('/app')
      })

      after('Rejecting Invitation as Editor',()=>{

        Cypress.session.clearCurrentSessionData()
        Cypress.session.clearAllSavedSessions()
        cy.Login( Cypress.env('editorAccount'), Cypress.env('password') ).then((access:any)=>{
          API.newToken= access.response.body.newToken
          apis.rejectInvitation(invitationID2, API.newToken).then((deletion)=>{
            expect(deletion.status).equal(200)
            expect(deletion.statusText).equal('OK')
          })
        })
    })

      it.only("TC2 | Verify that the user can share the folder with 'Edit' permission", () => {
        let foldersArray=['Cars', 'Family', 'Personal']

        cy.url().should('equal', expectedURL)
        drive.closeModal2()
        const randomFold= Cypress._.random(0, foldersArray.length-1)
        const chosenFolder= foldersArray[randomFold]
        drive.selectFolderandRightClick(chosenFolder).then(()=>{
          API.folderName= Cypress.env('sharedFolder')
        }) 
        drive.clickonShareButtonOption()
        drive.clickPermissionsDropdown()
        drive.clickRestrictedButtonOption()
        drive.clickInviteButton()
        drive.writeInvitationEmail(Cypress.env('editorAccount'))
        drive.clickInviteUser()
        apis.invitationInterception().as('invitation')
        drive.invitationSentSuccess().then(()=>{
          expect(Cypress.env('success')).to.equal(data.assertion.invitationSentEditor)
        })
        cy.wait('@invitation').then((invitation:any)=>{
          invitationID2= invitation.response.body.id
        })
      });
    })
      describe("User shares a folder with different permissions", () => {

        beforeEach('Login In',()=>{  
          cy.SessionLogin( Cypress.env('editorAccount'), Cypress.env('password') );
          cy.visit('/app')
       })
       
       it("TC3 | Validate that the editor can rename the name of a file", () => {  

          cy.url().should('equal', expectedURL)
          drive.closeModal2()
          drive.clickSharedPageButton()
          shared.clickRandomFolder()
          shared.clickRandomFolder()
          shared.selectRandomItemandRightClick().then(()=>{
            items.originalItemName= Cypress.env('sharedItem')
            items.newItemName= `${items.originalItemName}${Math.floor(Math.random()*10)}`
            shared.clickRenameOption()
            shared.clearInputField()
            shared.writeNewItemName(items.newItemName)
            shared.clickRenameButton()
            expect(items.originalItemName).to.not.equal(items.newItemName)
          })
        });

        it("TC4 | Validate that the editor can download a shared file",()=>{
          
          cy.deleteDownloadsFolder()
          cy.url().should('equal', expectedURL)
          drive.closeModal2()
          drive.clickSharedPageButton()
          shared.clickRandomFolder()
          shared.clickRandomFolder()
          shared.selectRandomItemForDownloadRightClick().then(()=>{
            downloadedItem= Cypress.env('sharedItem')
            shared.clickDownload()
            cy.verifyDownload(downloadedItem, {timeout:timeout})
          })
        })

        it("TC5 | Validate that the editor can download a shared folder",() =>{

          cy.deleteDownloadsFolder()
          cy.url().should('equal', expectedURL)
          drive.closeModal2()
          drive.clickSharedPageButton()
          shared.selectFolderandDoubleClick('Shared with Editor 2')
          shared.selectRandomFolderandRightClick().then(()=>{
            downloadedItem= Cypress.env('sharedFolder')
            shared.clickDownloadOptionFolder()
          cy.verifyDownload(`${downloadedItem}${'.zip'}`, {timeout:timeout})
          })
        })
      });
    });


  removeLogs()
  