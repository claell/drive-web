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
    foldersInsideFolders: ()=> Cypress.Chainable<JQuery<HTMLElement>>;

    constructor(){
        //SHARING INVITATIONS
        this.pendingInvitationButton=()=> cy.get('[class$="text-gray-80 shadow-sm "]'),
        this.pendingInvitationModal=()=> cy.get('[class$="duration-100 ease-out"]'),
        this.sharedFolderName=()=> cy.get('[class="truncate font-medium text-gray-100"]'),
        this.acceptSharedFolderButton=()=> cy.get('[class$="text-white shadow-sm "]'),
        this.closePendingInvitationModalButton=()=> cy.get('[class="flex h-full flex-col items-center justify-center"]'),
        this.eachFolderWrapper=()=> cy.get('[class=" flex w-full flex-col space-y-3.5"]'),
        this.foldersText=()=> cy.get('[class="truncate font-medium text-gray-100"]'),
        
        //SHARED FOLDER LIST
        this.folderNames =()=> cy.get('[class^="w-full max-w-full flex-1"]'),
        this.folders=()=> cy.get('[data-test="file-list-folder"]')
        this.foldersInsideFolders=()=> cy.get('[class$="min-w-activity truncate whitespace-nowrap"]', {timeout:500})
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
    //inside Shared folder
    clickRandomFolder(){
        return this.foldersInsideFolders().then(el=>{
            const folders = el.length
            const number = Cypress._.random(0, folders -1)
            //this.foldersInsideFolders().eq(number).within(()=>{
            //    this.foldersInsideFolders().then((name)=>{
            //        const shared= name.text()
            //        return Cypress.env('sharedFolder', shared)
            //    })
            //})
            cy.wait(500)
            this.foldersInsideFolders().eq(number).dblclick()
            
        })
    }

    
}
export const shared = new Shared()