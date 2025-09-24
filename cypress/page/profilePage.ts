import { faker } from '@faker-js/faker';

class ProfilePage {
    private generatedProfileName: string | null = null;
    elements = {
        regularProfileButton: () => cy.get('.add-profile > :nth-child(1)'),
        nameInput: () => cy.get('.input').first(),
        genderDropdownToggle: () => cy.get(':nth-child(2) > .select > .select-toggle > .select-default'),
        genderOption: (gender: string) => cy.contains('.select-option', gender),
        birthYearDropdownToggle: () => cy.get(':nth-child(3) > .select > .select-toggle > .select-default'),
        birthYearList: () => cy.get('.select-list'),
        birthYear1986Option: () => cy.get('.select-list > :nth-child(28)'),
        createPinLink: () => cy.get('[href="/profily/pridat/pin"]'),
        pinInput: (index: number) => cy.get(`:nth-child(${index}) > .input`),
        confirmPinButton: () => cy.get('.primary'),
    };

    waitForLoad() {
        cy.url().should('include', '/profily');
        cy.contains('Kdo se dívá?').should('be.visible');
    }

    clickRegularProfileButton() {
        this.waitForLoad();
        this.elements.regularProfileButton().should('be.visible').and('be.enabled').click({ force: true });
    }

    fillProfileForm(gender: string) {
        const profileName = `${faker.person.firstName()} QA`;
        this.generatedProfileName = profileName;

        this.elements.nameInput().clear().type(profileName);
        this.elements.genderDropdownToggle().click({ force: true });
        this.elements.genderOption(gender).should('be.visible').click({ force: true });
        this.elements.birthYearDropdownToggle().click({ force: true });
        this.elements.birthYearList().scrollTo('bottom');
        this.elements.birthYear1986Option().scrollIntoView().click({ force: true });
        this.elements.createPinLink().click({ force: true });
        this.createPin('1234');
    }

    assertProfileNameIsVisible(expectedName?: string) {
        const nameToAssert = expectedName ?? this.generatedProfileName;

        if(!nameToAssert) {
            throw new Error('No profile name available to assert. Provide expectedName or call fillProfileForm first.');
        }

        cy.contains('button', nameToAssert).should('be.visible');
    }

    private createPin(pin: string) {
        pin.split('').forEach((digit, idx) => {
            this.elements.pinInput(idx + 1).type(digit);
        });
        this.elements.confirmPinButton().click({ force: true });
    }
}

export default new ProfilePage();
