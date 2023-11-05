import { removeLogs } from '../../../support/utils/removeLogs'
import { drive } from '../../../support/pages/drivePage'
import { shared } from '../../../support/pages/sharedPage'
import data from '../../../fixtures/data/staticData.json'
import { apis } from '../../../support/pages/apis'
import { faker } from '@faker-js/faker'

const expectedURL: string = data.urls.app
const folderName: string = faker.music.genre()
const folderName2: string = faker.music.songName()
let foldersAssertion: Cypress.objectStructure ={
    folder1: '',
    folder2: '',
    folder3: '',
    folder4:''
}
let folder:string;
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

describe('Folder Creation and Initial Sharing',()=>{
    
    describe('User creates a new folder and shares it with another user',()=>{
        beforeEach('Login In',()=>{
            cy.SessionLogin( Cypress.env('mainAccount'), Cypress.env('password') );
             cy.visit('/app')
         })
         it('TC: 1 | Validate that the user can create a new folder with right click option',()=>{
            
            cy.url().should('equal', expectedURL)
            drive.bodyRightClick()
            drive.clickNewFolderOption()
            drive.clearInputField()
            drive.writeNewFolderName(folderName)
            apis.apiFolderInterception().as('foldersInfo')
            drive.clickCreate(folderName)
            cy.url().should('equal', expectedURL)
            cy.wait('@foldersInfo').then((access:any)=>{
                API.folderID= access.response.body.id
                API.folderName = access.response.body.plain_name
                expect(access.response.statusCode).to.equal(201)
                expect(access.response.body.plain_name).to.equal(folderName)
            }) 
        })
        it('TC: 2 | Validate that the user can create a folder with the header option',{ keystrokeDelay: 10 },()=>{
            
            cy.url().should('equal', expectedURL)
            drive.clickCreateNewFolderHeader()
            drive.clearInputField()
            drive.writeNewFolderName(folderName2)
            apis.apiFolderInterception().as('foldersInfo')
            drive.clickCreate(folderName2)
            cy.wait('@foldersInfo').then((access:any)=>{
                API.folderID2= access.response.body.id
                API.folderName = access.response.body.plain_name
                expect(access.response.statusCode).to.equal(201)
                expect(access.response.body.plain_name).to.equal(folderName2)
            }) 
        })
            
        it('TC: 3 | Validate that the user can share the folder with another user as a reader',{ keystrokeDelay: 10 },()=>{

            cy.url().should('equal', expectedURL)
            drive.selectFolderandRightClick(folderName2).then(()=>{
                foldersAssertion.folder1=Cypress.env('folderName')
            })
            drive.clickonShareButtonOption()
            drive.clickPermissionsDropdown()
            drive.clickRestrictedButtonOption()
            drive.clickInviteButton()
            drive.writeInvitationEmail('readeraccount@inxt.com')
            drive.editor_readerDropdown().click()
            drive.readerOptionButton().click()
            drive.clickInviteUser()
            drive.invitationSentSuccess().then(()=>{
                expect(Cypress.env('success')).to.equal(data.assertion.invitationSentReader)
            })
        })
    })
    describe('User creates a new folder and shares it with another user.',()=>{
        before('Login In in reader account',()=>{
            
            Cypress.session.clearCurrentSessionData()
            Cypress.session.clearAllSavedSessions()
            cy.Login( Cypress.env('readerAccount'), Cypress.env('password') );
            cy.visit('/app')
        })
        after('Deleting Folder Owner created',()=>{
            
            Cypress.session.clearCurrentSessionData()
            Cypress.session.clearAllSavedSessions()
            cy.Login( Cypress.env('mainAccount'), Cypress.env('password') ).then((access:any)=>{
                API.newToken= access.response.body.newToken
                cy.wrap(API).then(()=>{
                    apis.sendFolderToTrashAPI(API.newToken, API.folderID).then(response=> expect(response.status).to.equal(200))
                    apis.sendFolderToTrashAPI(API.newToken, API.folderID2).then(response=> expect(response.status).to.equal(200))
                })
            })
            cy.reload()
        })
        
        it('TC: 4 | Verify that the shared folder appears in the recipients shared folder list.',()=>{
            
            cy.url().should('equal', expectedURL)
            drive.clickSharedPageButton()
            shared.clickPendingInvitationsButton()
            shared.acceptSharingInvitation(folderName2).then(()=>{
                foldersAssertion.folder2= Cypress.env('folderAssertion')
            })
            cy.wrap(foldersAssertion).then(()=>{
                expect(foldersAssertion.folder1).to.equal(foldersAssertion.folder2)
            })
            shared.closeInvitationModal()
        })
    })

})

removeLogs()