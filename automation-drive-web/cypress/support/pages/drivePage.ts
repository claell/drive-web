export let folders: string[]

class Drive{

    deleteButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    uploadFilesButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    items:() => Cypress.Chainable<JQuery<HTMLElement>>;
    shareButtonOption: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    accessWrapper:() => Cypress.Chainable<JQuery<HTMLElement>>;
    accessTitle: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    dropdown: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    publicButton: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    restrictedButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingButton: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    buttonTextBefore: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    buttonTextAfter: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    inviteButtonWrapper:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    inviteButtonEmail:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    manageAccessOption: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    downloadOption: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    optionsDisplayer: () => Cypress.Chainable<JQuery<HTMLElement>>;
    options: () => Cypress.Chainable<JQuery<HTMLElement>>;
    button: () => Cypress.Chainable<JQuery<HTMLElement>>;
    span: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingModal: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingTitle: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingWarning: () => Cypress.Chainable<JQuery<HTMLElement>>;
    cancelStopSharingConfirm: () => Cypress.Chainable<JQuery<HTMLElement>>;
    cancelStopSharingText: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingButtonConfirm: () => Cypress.Chainable<JQuery<HTMLElement>>;
    stopSharingButtonConfirmText: () => Cypress.Chainable<JQuery<HTMLElement>>;
    confirmationSign: () => Cypress.Chainable<JQuery<HTMLElement>>;
    createNewFolder: () => Cypress.Chainable<JQuery<HTMLElement>>;
    newFolderModal: () => Cypress.Chainable<JQuery<HTMLElement>>;
    closeModalButton:() => Cypress.Chainable<JQuery<HTMLElement>>;
    closeShareOptions: () => Cypress.Chainable<JQuery<HTMLElement>>;
    body:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    rightClickOptions: () => Cypress.Chainable<JQuery<HTMLElement>>;
    menuItems: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    renameOptionButton: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    nameNewFolderModal: () => Cypress.Chainable<JQuery<HTMLElement>>;
    newFolderModalTitle: () => Cypress.Chainable<JQuery<HTMLElement>>;
    newFolderNameInput: () => Cypress.Chainable<JQuery<HTMLElement>>;
    submitNewFolderName:() => Cypress.Chainable<JQuery<HTMLElement>>;
    folderNames:() => Cypress.Chainable<JQuery<HTMLElement>>;
    folders: () => Cypress.Chainable<JQuery<HTMLElement>>;
    createNewFolderHeaderButton:() => Cypress.Chainable<JQuery<HTMLElement>>;
    inviteOthersModal: () => Cypress.Chainable<JQuery<HTMLElement>>;
    inviteOthersTitle: () => Cypress.Chainable<JQuery<HTMLElement>>;
    inviteOthersInput: () => Cypress.Chainable<JQuery<HTMLElement>>;
    readerEditorDropdown: () => Cypress.Chainable<JQuery<HTMLElement>>;
    notifyUsersWrapper:() => Cypress.Chainable<JQuery<HTMLElement>>;
    notifyUsersTitle:() => Cypress.Chainable<JQuery<HTMLElement>>;
    notifyUsersCheckbox:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    inviteUserButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    inviteButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    invitationSentSuccessSign:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    sharedPageButton:()=> Cypress.Chainable<JQuery<HTMLElement>>;
    editor_readerDropdown: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    readerOptionButton: ()=> Cypress.Chainable<JQuery<HTMLElement>>;
    assertNewFolder:() => Cypress.Chainable<JQuery<HTMLElement>>;

    constructor(){

        this.deleteButton=()=> cy.get('[data-tooltip-id="trash-tooltip"]')
        this.uploadFilesButton= () => cy.get('button[class$="border-opacity-75"]'),
        this.items = ()=> cy.get('[data-test="file-list-folder"]'),
        this.shareButtonOption= ()=> cy.get('[class$="text-base text-gray-80"]').first(),
        this.accessWrapper = ()=> cy.get('[class="flex flex-col space-y-2.5"]'),
        this.accessTitle = ()=> cy.get('p[class="font-medium"]'),
        this.dropdown = ()=> cy.get('button[class$="text-gray-80 shadow-sm "]').last(),
        this.publicButton = ()=> cy.get('[class^="flex h-16 w-full cursor-pointer"]').first(),
        this.restrictedButton = ()=> cy.contains('Restricted',{timeout:2000})
        this.stopSharingButton = ()=> cy.get('button[class^="flex h-11 w-full"]'),
        this.buttonTextBefore = ()=> cy.get('button[class$="text-gray-80 shadow-sm "] span'),
        this.buttonTextAfter = ()=> cy.get('button[class$="text-gray-80 shadow-sm "] span').last(),
        this.inviteButtonWrapper=()=> cy.get('[class="flex items-center space-x-4"]'),
        this.inviteButtonEmail=()=> cy.get('[class="flex items-center space-x-1.5"] button', {timeout:2000}),
        this.manageAccessOption=()=> cy.get('[class$="text-base text-gray-80"]').first(),
        this.downloadOption= ()=> cy.get('[class="flex cursor-pointer flex-row whitespace-nowrap px-4 py-1.5 text-base text-gray-80"]').eq(5),
        this.optionsDisplayer=()=> cy.get('[aria-labelledby="list-item-menu-button"]'),
        this.options= ()=> cy.get('span:not(.ml-5)'),
        this.span= ()=> cy.get('span'),
        this.button=()=> cy.get('button',{timeout:2000})
        this.inviteOthersModal=()=> cy.get('[class^="w-full text-gray-100"]'),
        this.inviteOthersTitle=()=> cy.get('[class="flex items-center space-x-4"]')
        this.inviteOthersInput=()=> cy.get('[class="m flex w-full"] input', {timeout: 2000})
        this.inviteButton=()=> cy.get('[class$="text-white shadow-sm "]').last()
        this.invitationSentSuccessSign=()=> cy.get('[class="flex-1 whitespace-pre break-words text-gray-80 line-clamp-2"]', {timeout: 2000})
        this.readerEditorDropdown=()=> cy.get('[name=userRole]')
        this.notifyUsersWrapper=()=> cy.get('[class^="mt-2.5"]')
        this.notifyUsersTitle=()=> cy.get('[class="ml-2 text-base font-medium"]')
        this.notifyUsersCheckbox=()=> cy.get('div')
        this.editor_readerDropdown=()=> cy.get('[class$="ctive:bg-gray-1 text-gray-80 shadow-sm "]')
        this.readerOptionButton=()=> cy.get('[role="option"]').last()

        //stop sharing modal
        this.stopSharingModal=()=> cy.get('[class^="w-full text-gray-100 max-w-sm"]'),
        this.stopSharingTitle=()=> cy.get('[class="text-2xl font-medium"]'),
        this.stopSharingWarning=()=> cy.get('[class="text-lg text-gray-80"]'),
        this.cancelStopSharingConfirm= ()=> cy.get('[class$="text-gray-80 shadow-sm "]'),
        this.cancelStopSharingText= ()=> cy.get('div.flex.items-center.justify-center.space-x-2').first(),
        this.stopSharingButtonConfirm= ()=> cy.get('[class$="active:bg-red-dark text-white shadow-sm "]'),
        this.stopSharingButtonConfirmText= ()=> cy.get('div.flex.items-center.justify-center.space-x-2').last(),
        this.closeShareOptions = () => cy.get('[class$="active:bg-opacity-8"]')

        this.confirmationSign= ()=> cy.get('[class="flex max-w-xl items-center rounded-lg border border-gray-10 bg-white p-3 shadow-subtle-hard"]'),
        //create New Folder
        this.body=()=> cy.get('[class="h-full w-full py-6"]')
        this.createNewFolder=()=> cy.get('[data-tooltip-id="createfolder-tooltip"]'),
        this.createNewFolderHeaderButton=()=> cy.get('[data-tooltip-id="createfolder-tooltip"]')
        this.newFolderModal= ()=> cy.get('[class^="w-full text-gray-100"]'),
        

        this.closeModalButton=()=> cy.get('[class="absolute right-0 m-7 flex w-auto text-white"]', {timeout:1000})
        this.rightClickOptions=()=> cy.get('[role="menu"]'),
        this.menuItems= () => cy.get('[role="menuitem"]')
        this.nameNewFolderModal=()=> cy.get('[class="flex flex-col space-y-5"]'),
        this.newFolderModalTitle=()=> cy.get('[class$="text-gray-100"]'),
        this.newFolderNameInput=()=> cy.get('[class="relative"] input'),
        this.submitNewFolderName=()=> cy.get('[type="submit"]'),
        this.folders=()=> cy.get('[data-test="file-list-folder"]'),
        this.folderNames =()=> cy.get('span[data-test="folder-name"]'),

        //SHARED SECTION
        this.sharedPageButton=()=> cy.get('[href="/app/shared"]')
        
    }

    async clickUploadButton(){
        this.uploadFilesButton().click()
    }
    async selectRandomItem(){
        this.items().then(el =>{
            const items = el.length
            const number= Cypress._.random(0, items -1)
            this.items().eq(number).click()
        })
    }
    clickRandomFolder(){
        return this.folders().then(el=>{
            const folders = el.length
            const number = Cypress._.random(0, folders -1)
            this.folders().eq(number).within(()=>{
                this.folderNames().then((name)=>{
                    const shared= name.text()
                    return Cypress.env('sharedFolder', shared)
                })
            })
            this.folders().eq(number).dblclick()
            
        })
    }
    selectRandomFolderandRightClick(){
        cy.wait(500)
        return this.folders().then(el=>{
            const folders = el.length
            const number = Cypress._.random(0, folders -1)
            this.folders().eq(number).rightclick()
            this.folders().eq(number).within(()=>{
                this.folderNames().then((name)=>{
                    const shared= name.text()
                    return Cypress.env('sharedFolder', shared)
                })
            })
            
            this.optionsDisplayer().within(()=>{
                this.options().each(opts=>{
                    expect(opts.text()).to.exist
                    })
                })
            })  
    }
    selectFolderandRightClick(folder:string){
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
    selectFolderandDoubleClick(folder:string){
        return this.folderNames().each(($fols, index)=>{
            if($fols.text()===folder){
                this.folders().eq(index).dblclick()
                this.folderNames().eq(index).then((name)=>{
                        return Cypress.env('folderName',name.text())
                    })
                }
            })
    } 

    //HERE THE FUNCTIONS RELATED TO THE RIGHT CLICK
    async clickonShareButtonOption(){
        this.shareButtonOption().click()
        cy.wait(500)
    }
    async clickPermissionsDropdown(){
        this.accessWrapper().within(()=>{
            this.accessTitle().should('have.text', 'General access')
            this.dropdown().click()
        })
    }
    async clickRestrictedButtonOption(){
        this.restrictedButton().should('be.enabled').click()
        this.buttonTextAfter()
    }
    async clickPublicButtonOption(){
        this.publicButton().click()
    }
    async clickStopSharingButtonOption(){
        this.stopSharingButton().click({force:true})

    }
    async confirmStopSharing(){
        this.stopSharingModal().should('exist')
        this.stopSharingModal().within(()=>{
            this.stopSharingTitle().then(text=>{
                expect(text.text()).to.exist
            })
            this.stopSharingWarning().then(warning=>{
                expect(warning.text()).to.exist
            })
            this.stopSharingButtonConfirm().should('exist')
            this.stopSharingButtonConfirmText().then(button=>{
                expect(button.text()).to.exist
            })
            this.cancelStopSharingConfirm().should('exist')
            this.cancelStopSharingText().then(cancel=>{
                expect(cancel.text()).to.exist
            })
        })
        this.stopSharingButtonConfirm().click()
        this.confirmationSign().then(sign=>{
            expect(sign.text()).to.exist
        })
    }
    clickInviteButton(){
        this.inviteButtonWrapper().within(()=>{
            this.span().first().then(text=> expect(text.text()).to.exist)
            this.inviteButtonEmail().should('be.enabled').and('have.text', 'Invite').click()
        })
    }
    async selectRandomItemAndRightClick(){
        this.items().then(el =>{
            const items = el.length
            const number= Cypress._.random(0, items -1)
            this.items().eq(number).rightclick()
            
        })
        this.optionsDisplayer().within(()=>{
            this.options().each(opts=>{
               expect(opts.text()).to.exist
            })
          })
          
    }

    async clickShareOption(){
        this.manageAccessOption().click()
    }
    async clickCreateNewFolder(){
        this.createNewFolder().click()
    }

    async closeSharingOptions(){
        this.closeShareOptions().click()
    }
    async closeModal(){
        this.closeModalButton().click()
    }
    async bodyRightClick(){
        this.body().rightclick()
        this.rightClickOptions()
        this.menuItems().each($el=>{
            expect($el.text()).to.exist
        })
    }
    async clickNewFolderOption(){
        this.menuItems().first().click()
        this.nameNewFolderModal().should('exist')
        this.nameNewFolderModal().within(()=>{
            this.newFolderModalTitle().then($title=> expect($title.text()).to.exist)
        })
    }
    async clearInputField(){
        this.newFolderNameInput().clear()
    }
    async writeNewFolderName(name: string){
        this.newFolderNameInput().type(name)
        return name
    }
    clickCreate(foldername:string){
        this.submitNewFolderName().should('exist').click()
        cy.get(`[title="${foldername}"]`, {timeout:3000}).should('exist')
        cy.wait(1000)
    }
    
    async clickCreateNewFolderHeader(){
        this.createNewFolderHeaderButton().click()
        this.nameNewFolderModal().should('exist')
        this.nameNewFolderModal().within(()=>{
            this.newFolderModalTitle().then($title=> expect($title.text()).to.exist)
        })
        
    }
    writeInvitationEmail(email:string){  
        cy.wait(1500)
        this.inviteOthersInput().should('not.be.disabled').type(email).focus().blur()
        
         this.inviteOthersInput().should('have.value', email) 
    }

    clickInviteUser(){
        
        this.inviteButton().click()
    }
    invitationSentSuccess(){
        return this.invitationSentSuccessSign().then(text=>{
            return Cypress.env('success', text.text())
        })
    }

    clickSharedPageButton(){
        this.sharedPageButton().click()
    }
    deleteCreatedFolder(createdFolder:string){
        cy.log(createdFolder)
        this.folderNames().each((folds, index)=> {
            cy.wrap(folds).invoke('text').then((text)=>{
                if(text===createdFolder){
                    this.folders().eq(index).click()
                }
            })
        })
        this.deleteButton().click()
    }
    
    async createFolder(name:string){
        this.bodyRightClick()
        this.clickNewFolderOption()
        this.clearInputField()
        this.writeNewFolderName(name)
    }
    shareCreatedFolder(readermail:string, foldername:string, invitationSent: string ){
        return this.selectFolderandRightClick(foldername).then(()=>{
            return Cypress.env('folderName')
        }).then(()=>{
            this.clickonShareButtonOption()
        this.clickPermissionsDropdown()
        this.clickRestrictedButtonOption()
        this.clickInviteButton()
        this.writeInvitationEmail(readermail)
        this.editor_readerDropdown().click()
        this.readerOptionButton().click()
        this.clickInviteUser()
        this.invitationSentSuccess().then(()=>{
            expect(Cypress.env('success')).to.equal(invitationSent)
            })
        })
    }
    clickOnEditorReaderDropdown(){
        drive.editor_readerDropdown().click()
    }
    clickOnReaderOptionButton(){
        drive.readerOptionButton().click()
    }
    clearSession(){
        cy.clearAllCookies()
        cy.clearAllSessionStorage()
        cy.clearAllLocalStorage()
    }
}
    
  
export const drive = new Drive()