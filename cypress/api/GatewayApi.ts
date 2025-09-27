class GatewayApi {
    BASE_URL: string;
    defaultEmail: string;
    defaultPassword: string;

    constructor() {
        this.BASE_URL = 'https://gateway-api.prod.iprima.cz/json-rpc/';
        this.defaultEmail = '';
        this.defaultPassword = '';
    }

    intercepts = {
        POST_Request: () => cy.intercept('POST', this.BASE_URL).as('POST_Request'),
        GET_Request: () => cy.intercept('GET', this.BASE_URL).as('GET_Request'),
    }

    /**
     * Gets access token using OAuth2 password grant
     * @param email - user email
     * @param password - user password
     * @alias POST_GetAccessToken
     */
    getAccessToken(email: string = this.defaultEmail, password: string = this.defaultPassword) {
        return cy.request({
            method: 'POST',
            url: `${this.BASE_URL}`,
            body: {
                jsonrpc: "2.0",
                method: "user.oauth2.token.password",
                params: {
                    clientId: "prima_sso",
                    grant_type: "password",
                    username: email,
                    password: password,
                    scope: ["email", "profile"],
                    insecure: false
                },
                id: "QA_e2e"
            }
        }).as('POST_GetAccessToken').then((response) => {
            if (response && response.body && response.body.result && response.body.result.data) {
                return response.body.result.data.accessToken;
            } else {
                console.log('No access token found in response');
                return null;
            }
        });
    }

    /**
     * Returns array of UlIds for all user profiles
     * @param email - user email (optional)
     * @param password - user password (optional)
     * @alias POST_GetUserInfoLite
     */
    getProfileUlIds(email?: string, password?: string) {
        return this.getAccessToken(email, password).then((accessToken: string) => {
            if (!accessToken) {
                console.log('No access token available, skipping profile retrieval');
                return cy.wrap([]);
            }

            return cy.request({
                method: 'POST',
                url: `${this.BASE_URL}`,
                body: {
                    jsonrpc: '2.0',
                    method: 'user.user.info.lite.byAccessToken',
                    params: { _accessToken: accessToken },
                    id: 'QA_e2e',
                },
            }).as('POST_GetUserInfoLite').then((response: any) => {
                // Безопасная проверка всех уровней
                const profiles = response?.body?.result?.data?.profiles;
                if (profiles && Array.isArray(profiles)) {
                    const ulIds: string[] = profiles.map((item: any) => item.ulid || item.id);
                    return cy.wrap(ulIds);
                } else {
                    console.log('No profiles found or invalid response structure');
                    return cy.wrap([]);
                }
            });
        });
    }

    /**
     * Deletes user profile by ULID
     * @param profileUlid - ULID of profile to remove
     * @param email - user email (optional, defaults to default email)
     * @param password - user password (optional, defaults to default password)
     * @alias POST_RemoveProfile
     */
    removeProfile(profileUlid: string, email?: string, password?: string) {
        return this.getAccessToken(email, password).then((accessToken: string) => {
            if (!accessToken) {
                console.log('No access token available, cannot remove profile');
                return cy.wrap(null);
            }

            if (!profileUlid) {
                console.log('No profile ULID provided, cannot remove profile');
                return cy.wrap(null);
            }

            return cy.request({
                method: 'POST',
                url: `${this.BASE_URL}`,
                body: {
                    jsonrpc: "2.0",
                    method: "user.user.profile.remove",
                    params: {
                        ulid: profileUlid,
                        _accessToken: accessToken
                    },
                    id: "QA_e2e"
                }
            }).as('POST_RemoveProfile').then((response: any) => {
                if (response && response.status === 200) {
                    console.log(`Profile ${profileUlid} removed successfully`);
                    return cy.wrap(true);
                } else {
                    console.log('Failed to remove profile');
                    return cy.wrap(false);
                }
            });
        });
    }

    /**
     * Deletes all user profiles
     * @param email - user email (optional)
     * @param password - user password (optional)
     */
    removeAllProfiles(email?: string, password?: string) {
        return this.getProfileUlIds(email, password).then((ulIds: string[]) => {
            if (ulIds && ulIds.length > 0) {
                const removalPromises = ulIds.map(ulid => this.removeProfile(ulid, email, password));
                return Promise.all(removalPromises);
            } else {
                console.log('No profiles found to remove');
                return cy.wrap([]);
            }
        });
    }

}

export default new GatewayApi();