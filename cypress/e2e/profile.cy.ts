import profilePage from 'cypress/page/profilePage';
import IprimaPage from '../page/IprimaPage';

describe('Profil', () => {
  it('Přihlásit uživatele a vyplnit profil', () => {
    IprimaPage.login();
    profilePage.clickRegularProfileButton();
    profilePage.fillProfileForm('Muž');
  });
});
