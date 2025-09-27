declare namespace Cypress {
    interface Chainable<Subject = any> {
        generateTestEmail(serverId: string): Chainable<string>;
        getConfirmationEmail(serverId: string, sentTo: string): Chainable<any>;
        extractConfirmationLink(email: any): Chainable<string>;
        deleteAllTestEmails(serverId: string): Chainable<void>;
    }
}