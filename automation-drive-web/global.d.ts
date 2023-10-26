/// <reference types="cypress" />


declare namespace Cypress {
  interface Chainable {
    /**
     * Goes to the signin page and signs in using the given credentials
     *
     * @param email Email to sign in into the app
     * @param password Password to sign in into the app
     */
    Login(email: string, password: string) 

  }
  interface objectStructure {
    folder1: string,
    folder2: string,
    folder3: string,
    folder4: string
  }
  interface folderInfoStructure {
      folderID: string,
      folderName: string,
      newToken: string,
      folderID2:string,
      folderName2: string,
      invitationID: string
  }
}
