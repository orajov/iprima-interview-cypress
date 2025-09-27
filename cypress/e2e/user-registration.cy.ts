describe('User Registration Test', () => {
    it('should be complete end-to-end user registration', () => {
        const timestamp = Date.now();
        const testEmail = `test${timestamp}@seznam.cz`;
        const testPassword = 'TestPassword123!';

        // Step 1: Registration
        cy.visit('https://ucet.iprima.cz/ucet/registrace');
        cy.wait(3000);

        cy.get('#didomi-notice-agree-button').click({ force: true });
        cy.wait(2000);

        cy.get('input[type="email"]').type(testEmail);
        cy.get('input[type="password"]').type(testPassword);

        cy.get('.select-toggle').first().click();
        cy.get('.select-option').contains('Muž').click();
        cy.wait(300);

        cy.get('.select-toggle').eq(1).click();
        cy.get('.select-option').contains('1990').click();
        cy.wait(300);

        cy.get('input.input')
            .not('[type="email"]')
            .not('[type="password"]')
            .first()
            .type('Test User');

        cy.get('input[type="checkbox"]').first().check();
        cy.get('button[type="submit"]').click();

        // Step 2: Verify success
        cy.contains('Potvrďte váš e-mail', { timeout: 15000 })
            .should('be.visible');

        cy.log(`✅ User ${testEmail} registered successfully`);
    });
});