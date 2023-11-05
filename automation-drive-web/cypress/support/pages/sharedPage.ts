import fs from 'fs'
class Shared{
    pendingInvitationButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    pendingInvitationModal:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    sharedFolderName:() => Cypress.Chainable<JQuery<HTMLElement>>;
    acceptSharedFolderButton:() => Cypress.Chainable<JQuery<HTMLElement>>;
    closePendingInvitationModalButton:() => Cypress.Chainable<JQuery<HTMLElement>>;
    eachFolderWrapper:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    foldersText:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    folderNames:() => Cypress.Chainable<JQuery<HTMLElement>>;
    folders: () => Cypress.Chainable<JQuery<HTMLElement>>;
    sharedFolders:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    optionsDisplayer: () => Cypress.Chainable<JQuery<HTMLElement>>;
    options: () => Cypress.Chainable<JQuery<HTMLElement>>;
    cancelButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    renameOptionButton: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    downloadOptionButtonEditor:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    downloadFolderOptionButtonEditor:()=> Cypress.Chainable<JQuery<HTMLElement>>;

    //RENAME MODAL
    renameModal:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    anytext:()=> Cypress.Chainable<JQuery<HTMLElement>>
    inputTitle:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    renameButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    inputField:()=> Cypress.Chainable<JQuery<HTMLElement>>;

    

    constructor(){
        //SHARING INVITATIONS
        this.pendingInvitationButton=()=> cy.get('[class$="text-gray-80 shadow-sm "]'),
        this.pendingInvitationModal=()=> cy.get('[class$="duration-100 ease-out"]'),
        this.sharedFolderName=()=> cy.get('[class="truncate font-medium text-gray-100"]'),
        this.acceptSharedFolderButton=()=> cy.get('[class$="text-white shadow-sm "]'),
        this.closePendingInvitationModalButton=()=> cy.get('[class="flex h-full flex-col items-center justify-center"]'),
        this.eachFolderWrapper=()=> cy.get('[class=" flex w-full flex-col space-y-3.5"]'),
        this.foldersText=()=> cy.get('[class="truncate font-medium text-gray-100"]'),
        this.optionsDisplayer=()=> cy.get('[aria-labelledby="list-item-menu-button"]'),
        this.options= ()=> cy.get('span:not(.ml-5)'),

        //RENAME MODAL
        this.renameOptionButton=()=> cy.get('[role=none]').eq(3)
        this.renameModal=()=> cy.get('[class="flex flex-col space-y-5"]')
        this.anytext=()=> cy.get('p')
        this.inputTitle=()=> cy.get('[class="text-sm text-gray-80"]')
        this.renameButton=()=> cy.get('[type="submit"]')
        this.cancelButton=()=> cy.get('[type="button"]')
        this.inputField=()=> cy.get('[class="relative"]')

        //DOWNLOAD
        this.downloadOptionButtonEditor=()=> cy.get('[role=none]').eq(5)
        this.downloadFolderOptionButtonEditor=()=> cy.get('div[role="menuitem"]').eq(1)

        //SHARED FOLDER LIST
        this.sharedFolders=()=> cy.get('[class$="focus-within:bg-gray-1 hover:bg-gray-1"]')
        this.folderNames =()=> cy.get('[class^="w-full max-w-full flex-1"]'),
        this.folders=()=> cy.get('[class$="flex-1 min-w-activity truncate whitespace-nowrap"]')
    
    }

    clickPendingInvitationsButton(){
        this.pendingInvitationButton().click()
    }
     acceptSharingInvitation(foldername:string){
        return this.pendingInvitationModal().within(()=>{
            this.eachFolderWrapper().then(()=>{
                this.foldersText().each(($fold, index) =>{
                    if($fold.text()===foldername){
                        this.eachFolderWrapper().eq(index).within(()=>{
                            this.acceptSharedFolderButton().click()
                            this.foldersText().then(name=>{
                                return Cypress.env('folderAssertion', name.text())
                            })
                        })
                    }
                })
            })
        })
    }
    closeInvitationModal(){
        this.closePendingInvitationModalButton().click()
    }
    selectFolderandDoubleClick(folder:string){
        return this.folderNames().each(($fols, index)=>{
            if($fols.text()===folder){
                this.folderNames().eq(index).dblclick()
                this.folderNames().eq(index).then((name)=>{
                        return Cypress.env('folderName',name.text())
                    })
                }
            })
    }
    selectFolderandRightClick(folder:string){
        cy.wait(500)
        return this.folderNames().each(($fols, index)=>{
            if($fols.text()===folder){
                this.folders().eq(index).rightclick()
                this.folderNames().eq(index).then((name)=>{
                        return Cypress.env('folderName',name.text())
                    })
                }
            }).then(()=>{
                this.optionsDisplayer().within(()=>{
                    this.options().each(opts=>{
                        expect(opts.text()).to.exist
                    })
                })
            })
    } 
    //inside Shared folder
    clickRandomFolder(){
        cy.wait(500)
        return this.sharedFolders().then(el=>{
            const folders = el.length
            const number = Cypress._.random(0, folders -1)
            this.folders().eq(number).within(()=>{
                this.folderNames().then((name)=>{
                    const shared= name.text()
                    return Cypress.env('sharedFolder', shared)
                })
            })
            this.sharedFolders().eq(number).dblclick()
            
        })
    }
    selectRandomItemandRightClick(){
        
        return this.sharedFolders().then(el=>{
            const folders = el.length
            const number = Cypress._.random(0, folders -1)
            this.sharedFolders().eq(number).rightclick()
            this.folders().eq(number).within(()=>{
                this.folderNames().then((name)=>{
                    const shared= name.text()
                    const result = shared.match(/(.*?)\.[^.]+$/)[1]
                    return Cypress.env('sharedItem', result)
                })
            }).then(()=>{
                
                this.optionsDisplayer().within(()=>{
                this.options().each(opts=>{
                    expect(opts.text()).to.exist
                    })
                })
            })  
            
        })
    }
    selectRandomItemForDownloadRightClick(){
        
        return this.sharedFolders().then(el=>{
            const folders = el.length
            const number = Cypress._.random(0, folders -1)
            this.sharedFolders().eq(number).within(()=>{
                this.folderNames().then((name)=>{
                    const shared= name.text()
                    return Cypress.env('sharedItem', shared)
                })
            }).then(()=>{
                this.sharedFolders().eq(number).rightclick()
                this.optionsDisplayer().within(()=>{
                    this.options().each(opts=>{
                        expect(opts.text()).to.exist
                    })
                })
            })
            
        })
    }
    selectRandomFolderandRightClick(){
        cy.wait(500)
        return this.sharedFolders().then(el=>{
            const folders = el.length
            const number = Cypress._.random(0, folders -1)
            this.folders().eq(number).within(()=>{
                this.folderNames().then((name)=>{
                    const shared= name.text()
                    return Cypress.env('sharedFolder', shared)
                })
            }).then(()=>{
                this.sharedFolders().eq(number).rightclick()
                this.optionsDisplayer().within(()=>{
                this.options().each(opts=>{
                    expect(opts.text()).to.exist
                })
            })
            
                })
        })
    }

    clickRenameOption(){
        this.renameOptionButton().click()
    }
    clearInputField(){
        this.renameModal().within(()=>{
            this.inputField().clear()
        })
    }
    writeNewItemName(newName:string){
        this.renameModal().within(()=>{
            this.anytext().should('exist')
            this.inputTitle().should('exist')
            this.cancelButton().should('have.text', 'Cancel').and('exist')
            this.renameButton().should('exist')
            this.inputField().type(newName)
        }) 
    }
    clickRenameButton(){
        this.renameModal().within(()=>{
        this.renameButton().click()
        })
    }
    clickDownload(){
        this.downloadOptionButtonEditor().click()
    }
    clickDownloadOptionFolder(){
        cy.wait(1000)
        this.downloadFolderOptionButtonEditor().click()
    }
   
}
export const shared = new Shared()