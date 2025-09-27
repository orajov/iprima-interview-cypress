import GatewayApi from '../api/GatewayApi';
import './mailosaur-commands';


Cypress.on('uncaught:exception', (err) => { // Ignore uncaught exceptions
    if(err.message.includes('The following error originated from your')) {
        return false;
    }
});

afterEach(() => {
    // Clear profiles
    GatewayApi.getProfileUlIds().then((response) => {
        response.forEach((profileUlId) => {
            GatewayApi.removeProfile(profileUlId);
        });
    });
});