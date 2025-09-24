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
        POST_Request: () => cy.intercept('POST', '**/json-rpc/**').as('POST_Request'),
        GET_Request: () => cy.intercept('GET', '**/json-rpc/**').as('GET_Request'),
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
            const accessToken = response.body?.result?.data?.accessToken;

            if(!accessToken) {
                throw new Error(`GatewayApi: access token missing. Response: ${JSON.stringify(response.body)}`);
            }

            return accessToken;
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
                const profiles = response.body?.result?.data?.profiles;

                if(!Array.isArray(profiles)) {
                    throw new Error(`GatewayApi: profiles missing. Response: ${JSON.stringify(response.body)}`);
                }

                const ulIds: string[] = profiles.map((item: any) => item.ulid);
                return cy.wrap(ulIds);
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
            }).as('POST_RemoveProfile');
        });
    }

}

export default new GatewayApi();
