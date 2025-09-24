import GatewayApi from "../api/GatewayApi";

class IprimaPage {
  BASE_URL: string;

  constructor() {
    this.BASE_URL = Cypress.config('baseUrl') || '';
  }

  elements = {
    home: {
      buttonAcceptCookies: () => cy.get('#didomi-notice-agree-button'),
      linkSignIn: () => cy.get('.sign-in'),
    },
    login: {
      inputEmail: () => cy.get('input[type="email"]'),
      inputPassword: () => cy.get('input[type="password"]'),
      buttonSubmit: () => cy.get('button[type="submit"]'),
    },
    profile: {
      buttonProfile: (profile: string) => cy.contains('button', profile),
    }
  };

  /**
   * Visit the page
   * @param path - The path to visit
   * @param cookies - Whether to accept cookies
   */
  visit(path: string = '', cookies: boolean = true) {
    cy.visit(this.BASE_URL + path);
    if (cookies) this.acceptCookies();
  }

  /**
   * Accept cookies
   */
  acceptCookies() {
    this.elements.home
      .buttonAcceptCookies()
      .trigger('mouseover')
      .click({ force: true });
  }

  /**
   * Login
   * @param email - The email to login
   * @param password - The password to login
   * @param profile - The profile to login
   */
  login(email?: string, password?: string, profile: string = 'Běžný') {
    const resolvedEmail = (email ?? Cypress.env('QA_EMAIL')) as string | undefined;
    const resolvedPassword = (password ?? Cypress.env('QA_PASSWORD')) as string | undefined;

    if (!resolvedEmail || !resolvedPassword) {
      throw new Error('Missing QA credentials. Set CYPRESS_QA_EMAIL and CYPRESS_QA_PASSWORD.');
    }

    GatewayApi.intercepts.POST_Request();
    GatewayApi.defaultEmail = resolvedEmail;
    GatewayApi.defaultPassword = resolvedPassword;

    this.visit();

    cy.contains('button, a', 'Přihlášení', { matchCase: false })
      .should('be.visible')
      .click({ force: true });
    cy.location('host', { timeout: 10000 }).should('include', 'ucet.iprima.cz');
    this.elements.login.inputEmail().type(resolvedEmail);
    this.elements.login.inputPassword().type(resolvedPassword);
    this.elements.login.buttonSubmit().click();

    cy.wait('@POST_Request');

    this.elements.profile.buttonProfile(profile).should('be.visible').and('be.enabled').click();

    cy.wait('@POST_Request');
    cy.url().should('include', `${this.BASE_URL}profily`);
    cy.contains('Kdo se dívá?').should('be.visible');
  }

}

export default new IprimaPage();
