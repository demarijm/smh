import { redirectToLogin } from './apexApi';

const FORM_URL = 'https://traderlink.io/opra-electronic-subscriber-agreement/';

function redirectToFormAgreement() {
    window.location.replace(FORM_URL);
}

export const userHasAgreement = () => {
    if (process.env.NODE_ENV === 'development') {
        return new Promise((resolve, reject) => resolve(true));
    }

    return fetch('https://traderlink.io/wp-json/wl/v1/validate_agreement', { method: 'POST' }).then(
        (response) => {
            if (response.status === 403) {
                redirectToLogin();
                return false;
            }
            if (response.status === 401) {
                redirectToFormAgreement();
                return false;
            }
            return true;
        },
    );
};
