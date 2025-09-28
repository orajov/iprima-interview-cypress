describe('User Registration with Email Confirmation and Account Deletion', () => {
    const MAILOSAUR_SERVER_ID = Cypress.env('MAILOSAUR_SERVER_ID');
    let testEmail: string;
    const testPassword = 'TestPassword123!';
    const testUserName = 'Test User';

    before(() => {
        if (!Cypress.env('MAILOSAUR_API_KEY')) {
            throw new Error('Mailosaur API key not configured');
        }
        testEmail = `iprima.${Cypress._.random(1000, 9999)}.${MAILOSAUR_SERVER_ID}@mailosaur.net`;
    });

    it('should complete full registration flow with email confirmation and account deletion', () => {
        // Step 1: Registration
        cy.visit('https://ucet.iprima.cz/ucet/registrace');
        cy.wait(5000);

        // cookies banner
        cy.get('body').then(($body) => {
            if ($body.find('#didomi-notice-agree-button').length > 0) {
                cy.get('#didomi-notice-agree-button').click({ force: true });
                cy.wait(2000);
            }
        });

        cy.get('input[type="email"]').type(testEmail);
        cy.get('input[type="password"]').type(testPassword);

        // choose sex
        cy.get('.select-toggle').first().click();
        cy.get('.select-option').contains('Muž').click();
        cy.wait(500);

        // choose date
        cy.get('.select-toggle').eq(1).click();
        cy.get('.select-option').contains('1990').click();
        cy.wait(500);

        // Name
        cy.get('input.input')
            .not('[type="email"]')
            .not('[type="password"]')
            .first()
            .type(testUserName);

        // Checkbox
        cy.get('input[type="checkbox"]').first().check({ force: true });

        // Send form
        cy.get('button[type="submit"]').click();

        // Step 2: Verify registration success
        cy.contains('Potvrďte váš e-mail', { timeout: 20000 }).should('be.visible');
        cy.log(`✅ Registration successful. Email sent to: ${testEmail}`);

        // Step 3: Get confirmation email
        cy.getConfirmationEmail(MAILOSAUR_SERVER_ID, testEmail).then((email) => {
            expect(email).to.not.be.null;
            expect(email.subject).to.include('Aktivujte si svůj prima+ účet');
            cy.log(`📧 Email subject: ${email.subject}`);

            // Step 4: Extract and visit confirmation link
            cy.extractConfirmationLink(email).then((confirmationLink) => {
                expect(confirmationLink).to.not.be.null;
                cy.log(`🔗 Confirmation link extracted: ${confirmationLink}`);

                cy.visit(confirmationLink);

                // Step 5: Verify success page
                cy.contains('Registrace proběhla úspěšně', { timeout: 15000 })
                    .should('be.visible');
                cy.log('✅ Email confirmation successful');

                // Step 6: Click "Pokračovat" button
                cy.contains('Pokračovat').click();
                cy.log('✅ Continued to next page');

                // Step 7: Wait for profile selection page and select profile
                cy.contains('Kdo se dívá?', { timeout: 15000 }).should('be.visible');

                // Find by name "Test User"
                cy.contains('button.item .text', testUserName, { timeout: 10000 })
                    .parents('button.item')
                    .click({ force: true });

                cy.log(`✅ Profile selected for user: ${testUserName}`);

                // Step 8: Click on profile avatar to open dropdown menu
                cy.get('button.profile', { timeout: 15000 })
                    .should('be.visible')
                    .first()
                    .click({ force: true });

                cy.log('✅ Profile avatar clicked');

                // Step 9: Wait for dropdown menu and click on account settings
                cy.get('a.link.settings.arrow', { timeout: 10000 })
                    .should('be.visible')
                    .contains('Můj účet a nastavení')
                    .click({ force: true });

                cy.log('✅ "Můj účet a nastavení" clicked');

                // Step 10: Verify we are on account settings page and click "Zrušit účet"
                cy.url().should('include', 'ucet.iprima.cz/moje', { timeout: 10000 });

                // Wait for link for delete
                cy.get('a.link[href*="zruseni-uctu"]', { timeout: 10000 })
                    .should('be.visible')
                    .click({ force: true });

                cy.log('✅ "Zrušit účet" clicked');

                // Step 11: Click "Chci zrušit účet" button
                cy.get('button.button.default', { timeout: 10000 })
                    .contains('Chci zrušit účet')
                    .click({ force: true });

                cy.log('✅ "Chci zrušit účet" clicked');

                // Step 12: Wait for warning text and click "Pokračovat"
                cy.contains('p.text', 'Tuto akci není možné vrátit zpět, váš účet bude trvale odstraněn.', { timeout: 15000 })
                    .should('be.visible');

                cy.get('button.button.default')
                    .contains('Pokračovat')
                    .click({ force: true });

                cy.log('✅ Warning accepted, continuing to confirmation');

                // Step 13: Check the confirmation checkbox
                cy.get('input.toggle[type="checkbox"]', { timeout: 10000 })
                    .should('be.visible')
                    .check({ force: true });

                cy.log('✅ Confirmation checkbox checked');

                // Step 14: Click final "Pokračovat" button to send deletion request
                cy.get('button.button.default.button[type="submit"]')
                    .contains('Pokračovat')
                    .click({ force: true });

                cy.log('✅ Account deletion request sent');

                // Step 15: Verify deletion request was sent and email confirmation is required
                cy.contains('Odeslali jsme žádost o potvrzení zrušení na váš e-mail', { timeout: 20000 })
                    .should('be.visible');
                cy.contains(`E-mail byl odeslán na adresu ${testEmail}`, { timeout: 15000 })
                    .should('be.visible');

                cy.log(`📧 Deletion confirmation email sent to: ${testEmail}`);

                // Step 16: Get deletion confirmation email
                cy.getDeletionConfirmationEmail(MAILOSAUR_SERVER_ID, testEmail).then((deletionEmail) => {
                    expect(deletionEmail).to.not.be.null;
                    expect(deletionEmail.subject).to.include('Zrušení účtu prima+');
                    cy.log(`📧 Deletion email subject: ${deletionEmail.subject}`);

                    // Step 17: Extract and visit deletion confirmation link
                    cy.extractDeletionConfirmationLink(deletionEmail).then((deletionLink) => {
                        expect(deletionLink).to.not.be.null;
                        cy.log(`🔗 Deletion confirmation link extracted: ${deletionLink}`);

                        cy.visit(deletionLink);

                        // Step 18: Verify account deletion was completed successfully
                        cy.contains('Hotovo, váš prima+ účet byl zrušen', { timeout: 20000 })
                            .should('be.visible');

                        cy.log(`🎉 Account deletion completed for user: ${testUserName}`);
                    });
                });
            });
        });
    });

    after(() => {
        if (Cypress.env('MAILOSAUR_API_KEY')) {
            cy.deleteAllTestEmails(MAILOSAUR_SERVER_ID);
            cy.log('🧹 Test emails cleaned up');
        }
    });
});