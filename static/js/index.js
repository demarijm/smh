import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { checkLocalStorageValidity } from './util/localStorageUtils';
import { userHasAgreement } from './api/wpApi';

function waitForElm(selector) {
    return new Promise(async (resolve) => {
        while (true) {
            const elem = document.querySelector(selector);
            if (elem) {
                return resolve(elem);
            }

            await new Promise((r) => setTimeout(r, 100));
        }
    });
}

waitForElm('.app-entrypoint').then((entryPoint) => {
    userHasAgreement().then((isValid) => {
        if (!isValid) {
            return;
        }

        checkLocalStorageValidity();

        const root = ReactDOM.createRoot(entryPoint);
        root.render(<App />);
    });
});
