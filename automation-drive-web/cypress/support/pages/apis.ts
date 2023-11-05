class APIs{
        APIfolderToTrash: 'https://api.internxt.com/drive/storage/trash/add'
        APIAccess: 'https://drive.internxt.com/api/access'
        APIfoldersInfo: 'https://api.internxt.com/drive/folders/72337979/folders/?offset=0&limit=50&sort=plainName&order=ASC'

        sendFolderToTrashAPI(newToken: string, folderID: string){
            return cy.request({
                method: 'POST',
                url: 'https://api.internxt.com/drive/storage/trash/add',
                headers: {
                    'Authorization': `Bearer ${newToken}`},
                body:{
                    items:[ 
                        {
                            id: folderID,
                            type: 'folder'
                        }]
                }
            }).then((response:any)=>{
                return response
            })
        }
        apiFolderInterception(){
            return cy.intercept('POST', 'https://drive.internxt.com/api/storage/folder')   
        }
        loginInterception(){
            return cy.intercept('POST', 'https://drive.internxt.com/api/access')
        }
        obtainFolderInfo(token:string){
            return cy.request({
                method: 'GET',
                url:'https://api.internxt.com/drive/folders/72915703/folders/?offset=0&limit=50&sort=plainName&order=ASC',
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            }).then((response: any)=>{
                return response
            })
        }
        rejectInvitation(invitationID:string, newtoken:string){
            return cy.request({
                method: 'DELETE',
                url: `https://api.internxt.com/drive/sharings/invites/${invitationID}`,
                headers:{
                  'Authorization': `Bearer ${newtoken}`
                }
              }).then((deletion:any)=>{
                return deletion
              })
        }
        //this method gets a folder ID in ROOT folder
        obtainFolderId(newtoken:string, folder:string){
            return apis.obtainFolderInfo(newtoken).then((response)=>{
                const folderArray =response.body.result
                for(let i=0; i<=folderArray.length-1; i++){
                  if(response.body.result[i].plainName===folder){
                    return Cypress.env('folderID', response.body.result[i].id)                  
                  }
                }
              })
        }
        //this method returns a folder id inside any other folder, you just need
        //the ID of the folder you're in.
        obtainFolderID(newtoken:string, folderid:any, foldername:string){
            return cy.request({
                method: 'GET',
                url:`https://api.internxt.com/drive/folders/${folderid}/folders/?offset=0&limit=50&sort=plainName&order=ASC`,
                headers:{
                    'Authorization': `Bearer ${newtoken}`
                }
            }).then((response: any)=>{
                const folderArray =response.body.result
                for(let i=0; i<=folderArray.length-1; i++){
                    if(response.body.result[i].plainName===foldername){
                      return Cypress.env('folderID', response.body.result[i].id)                  
                    }
                  }
            })
        }
        obtainFoldersInfo(token:string, folderid:string){
            return cy.request({
                method: 'GET',
                url:`https://api.internxt.com/drive/folders/${folderid}/folders/?offset=0&limit=50&sort=plainName&order=ASC`,
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            }).then((response: any)=>{
                return response
            })
        }
        invitationInterception(){
            return cy.intercept('POST', 'https://api.internxt.com/drive/sharings/invites/send')
        }
        getSelectedFolderUuid(foldername:string, newToken:string){
            return cy.request({
                url:'https://api.internxt.com/drive/sharings/folders?page=0&perPage=15',
                method: 'GET',
                headers:{
                  Authorization: `Bearer ${newToken}` 
                }
              }).then((response:any)=>{
                const folders= response.body.folders
                for(let i=0; i<=folders.length-1; i++){
                    if(response.body.folders[i].plainName===foldername){
                        return Cypress.env('folderUUID',response.body.folders[i].uuid)
                    }
                }
              })
        }
        getContainedFolderUuid(newtoken:string, folderuuid:string, foldername:string){
            return cy.request({
                url:`https://api.internxt.com/drive/sharings/items/${folderuuid}/folders?token=&page=0&perPage=15`,
                method: 'GET',
                headers:{
                    Authorization: `Bearer ${newtoken}`
                }
            }).then((response:any)=>{
                const folders= response.body.items
                for(let i=0; i<=folders.length-1; i++){
                    if(response.body.items[i].plainName===foldername){
                        return Cypress.env('folderUUID',response.body.items[i].uuid)
                    }
                }
            })
        }
        getFilesToken(folderuuid2:string, newtoken:string){
            return cy.request({
                url: `https://api.internxt.com/drive/sharings/items/${folderuuid2}/files?token=&page=0&perPage=15`,
                method: 'GET',
                headers:{
                    Authorization: `Bearer ${newtoken}`
                }
            }).then((response:any)=>{
                return response
            })
        }
        getFileID(newtoken:string, folderuuid2:string, token:string){
            return cy.request({
                url:`https://api.internxt.com/drive/sharings/items/${folderuuid2}/files?token=${newtoken}&page=0&perPage=15`,
                method: 'GET',
                headers:{
                    Authorization: `Bearer ${newtoken}`,
                }
        }).then((response:any)=>{
            cy.log(response)
        })
    }   
}
    export const apis = new APIs()