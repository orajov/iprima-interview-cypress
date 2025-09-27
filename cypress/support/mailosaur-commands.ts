import MailosaurClient from 'mailosaur';

const mailosaur = new MailosaurClient(Cypress.env('MAILOSAUR_API_KEY'));

Cypress.Commands.add('getConfirmationEmail', (serverId: string, sentTo: string) => {
    return mailosaur.messages.get(serverId, {
        sentTo: sentTo
    }, {
        timeout: 30000,
        receivedAfter: new Date(Date.now() - 10 * 60 * 1000)
    });
});

Cypress.Commands.add('extractConfirmationLink', (email: any) => {
    if (!email || !email.html) {
        console.log('Email or email.html is null');
        return null;
    }

    // Сначала ищем в тексте письма (не в HTML тегах)
    const emailText = email.text.body || '';

    // Ищем ссылку активации в тексте
    const activationLinkRegex = /https?:\/\/ucet\.iprima\.cz\/ucet\/aktivace\/[a-zA-Z0-9?=&_-]+/gi;
    const activationLinks = emailText.match(activationLinkRegex);

    if (activationLinks && activationLinks.length > 0) {
        return activationLinks[0];
    }

    // Ищем ссылку из кнопки "Potvrdit e-mailovou adresu"
    const buttonLinkRegex = /Potvrdit e-mailovou adresu\s*\(([^)]+)\)/gi;
    const buttonMatch = buttonLinkRegex.exec(emailText);
    if (buttonMatch && buttonMatch[1]) {
        return buttonMatch[1];
    }

    // Ищем любую ссылку на iprima.cz в тексте
    const iprimaLinkRegex = /https?:\/\/[^\s]*iprima\.cz[^\s]*/gi;
    const iprimaLinks = emailText.match(iprimaLinkRegex);

    if (iprimaLinks && iprimaLinks.length > 0) {
        return iprimaLinks[0];
    }

    // Если ничего не нашли, выводим текст для отладки
    console.log('Email text for debugging:', emailText.substring(0, 1000));
    return null;
});

Cypress.Commands.add('getDeletionConfirmationEmail', (serverId: string, sentTo: string) => {
    return mailosaur.messages.get(serverId, {
        sentTo: sentTo,
        subject: 'Zrušení účtu prima+'
    }, {
        timeout: 30000,
        receivedAfter: new Date(Date.now() - 10 * 60 * 1000)
    });
});

Cypress.Commands.add('extractDeletionConfirmationLink', (email: any) => {
    if (!email) {
        console.log('Deletion confirmation email is null');
        return null;
    }

    const emailText = email.text?.body || '';
    const emailHtml = email.html?.body || '';

    // 1. Ищем ссылку "Trvale zrušit účet prima+" в тексте письма
    const textLinkRegex = /Trvale zrušit účet prima\+\s*\((https?:\/\/[^\s\)]+)\)/gi;
    const textMatch = textLinkRegex.exec(emailText);
    if (textMatch && textMatch[1]) {
        return textMatch[1];
    }

    // 2. Ищем ссылку в тексте по паттерну URL
    const urlRegex = /https?:\/\/[^\s]*zruseni-uctu[^\s]*/gi;
    const urlMatches = emailText.match(urlRegex);
    if (urlMatches && urlMatches.length > 0) {
        return urlMatches[0];
    }

    // 3. Ищем в HTML по тексту ссылки
    if (emailHtml) {
        const htmlLinkRegex = /<a[^>]*href="(https?:\/\/[^"]*zruseni-uctu[^"]*)"[^>]*>[\s]*Trvale zrušit účet prima\+[\s]*<\/a>/gi;
        const htmlMatch = htmlLinkRegex.exec(emailHtml);
        if (htmlMatch && htmlMatch[1]) {
            return htmlMatch[1];
        }
    }

    // 4. Ищем любую ссылку с доменом iprima.cz в тексте
    const iprimaLinkRegex = /https?:\/\/[^\s]*iprima\.cz[^\s]*/gi;
    const iprimaLinks = emailText.match(iprimaLinkRegex);
    if (iprimaLinks && iprimaLinks.length > 0) {
        // Предпочитаем ссылки с "zruseni" в пути
        const zruseniLink = iprimaLinks.find(link => link.includes('zruseni'));
        if (zruseniLink) {
            return zruseniLink;
        }
        return iprimaLinks[0];
    }

    // 5. Ищем в HTML любую ссылку на iprima.cz
    if (emailHtml) {
        const htmlIprimaRegex = /<a[^>]*href="(https?:\/\/[^"]*iprima\.cz[^"]*)"[^>]*>/gi;
        const htmlIprimaMatch = htmlIprimaRegex.exec(emailHtml);
        if (htmlIprimaMatch && htmlIprimaMatch[1]) {
            return htmlIprimaMatch[1];
        }
    }

    // Если ничего не нашли, выводим для отладки
    console.log('Deletion email text for debugging:', emailText.substring(0, 1500));
    if (emailHtml) {
        console.log('Deletion email HTML snippet:', emailHtml.substring(0, 2000));
    }

    return null;
});

Cypress.Commands.add('deleteAllTestEmails', (serverId: string) => {
    return mailosaur.messages.deleteAll(serverId);
});

// Типизация для TypeScript
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Получить email с подтверждением регистрации
             */
            getConfirmationEmail(serverId: string, sentTo: string): Chainable<any>;

            /**
             * Извлечь ссылку подтверждения из email регистрации
             */
            extractConfirmationLink(email: any): Chainable<string | null>;

            /**
             * Получить email с подтверждением удаления аккаунта
             */
            getDeletionConfirmationEmail(serverId: string, sentTo: string): Chainable<any>;

            /**
             * Извлечь ссылку подтверждения удаления из email
             */
            extractDeletionConfirmationLink(email: any): Chainable<string | null>;

            /**
             * Удалить все тестовые emails
             */
            deleteAllTestEmails(serverId: string): Chainable<void>;
        }
    }
}

export {};