
let mailosaur: any;

Cypress.Commands.add('generateTestEmail', (serverId: string) => {
    if (!mailosaur) {
        const MailosaurClient = require('mailosaur');
        mailosaur = new MailosaurClient(Cypress.env('MAILOSAUR_API_KEY'));
    }
    return mailosaur.servers.generateEmail(serverId);
});

Cypress.Commands.add('getConfirmationEmail', (serverId: string, sentTo: string) => {
    if (!mailosaur) {
        const MailosaurClient = require('mailosaur');
        mailosaur = new MailosaurClient(Cypress.env('MAILOSAUR_API_KEY'));
    }
    return mailosaur.messages.get(serverId, {
        sentTo: sentTo
    }, {
        timeout: 30000,
        receivedAfter: new Date(Date.now() - 5 * 60 * 1000)
    });
});

Cypress.Commands.add('extractConfirmationLink', (email: any) => {
    if (email.html.links && email.html.links.length > 0) {
        return email.html.links[0].href;
    }

    const linkRegex = /https?:\/\/[^\s<>"']+potvrzeni[^\s<>"']*/gi;
    const links = email.html.body.match(linkRegex);
    return links ? links[0] : null;
});

Cypress.Commands.add('deleteAllTestEmails', (serverId: string) => {
    if (!mailosaur) {
        const MailosaurClient = require('mailosaur');
        mailosaur = new MailosaurClient(Cypress.env('MAILOSAUR_API_KEY'));
    }
    return mailosaur.messages.deleteAll(serverId);
});