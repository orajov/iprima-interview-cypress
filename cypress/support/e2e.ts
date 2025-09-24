import GatewayApi from '../api/GatewayApi';

Cypress.on('uncaught:exception', (err) => { // Ignore uncaught exceptions
    const ignoredPatterns = [
        'The following error originated from your',
        "Cannot read properties of undefined (reading 'length')",
    ];

    if(ignoredPatterns.some((pattern) => err.message.includes(pattern))) {
        return false;
    }
});

afterEach(() => {
    // Skip cleanup if credentials were never initialised
    if(!GatewayApi.defaultEmail || !GatewayApi.defaultPassword) {
        return;
    }

    // Clear profiles created during the test
    GatewayApi.getProfileUlIds().then((response) => {
        response.forEach((profileUlId) => {
            GatewayApi.removeProfile(profileUlId);
        });
    });
});
