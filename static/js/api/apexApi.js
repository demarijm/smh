import { setGlobalAuth } from '../useGlobalAuth';
const { format } = require("date-fns");
const BASE_URL_DEV = 'https://app.traderlink.io';
// const BASE_URL_DEV = 'http://dev.kube.traderlink.io';
const BASE_URL_PROD = 'https://app.traderlink.io';
const LOGIN_URL = 'https://traderlink.io/login/';
var isDuplicateSession = false;


export const INVALID_TICKER_MSG = 'ERROR: Please enter a valid ticker.';

export function redirectToLogin() {
    window.location.replace(LOGIN_URL);
}

export function setDuplicateSession(isDuplicate) {
    setGlobalAuth({ isDuplicateSession: isDuplicate });
}

function resolveDefaultUrl() {
    if (process.env.REACT_APP_TL_ENV === 'PROD') {
        return BASE_URL_PROD;
    }
    return BASE_URL_DEV;
}

async function executeApiRequest(method, urlSuffix, body, headers) {
    try{
        var baseUrl = resolveDefaultUrl();

        if (!headers) {
            headers = new Headers();
        }

        // Populate request API Key if running locally
        if (process.env.REACT_APP_API_KEY) {
            headers.append('API_KEY', process.env.REACT_APP_API_KEY);
        }

        const requestOptions = {
            method: method,
            headers: headers,
            body: body,
            mode: 'cors',
            credentials: 'include',
        };

        // console.log('Request', `${baseUrl}/${urlSuffix}`, requestOptions);

        const response = await fetch(`${baseUrl}/${urlSuffix}`, requestOptions);
        // console.log('Response', response);
        let responseData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            responseData = await response.json();
            // console.log('jsonResponse', responseData);
        } else {
            responseData = await response.text();
        }
        

        if(response.status >= 400 ){
            if (body?.errorCode === 'DUPLICATE_SESSION') {
                if(!isDuplicateSession) {
                    console.log('Duplicate session detected, should trigger popup only once', isDuplicateSession);
                    isDuplicateSession = true;
                    setDuplicateSession(true);
                }
            } else {
                redirectToLogin();
            }
            return {};
        }
        isDuplicateSession = false;
        setDuplicateSession(false);

        if (!response.ok) {
            console.log(`${baseUrl}/${urlSuffix}`)
            throw new Error('Server Error. Please try again later');
        }

        return responseData;
    } catch (error) {
        console.error('Error in execute api request', error);
        return {};
    }
}

export async function invalidateSessions() {
    return await executeApiRequest('POST', 'invalidateSessions');
}

export async function fetchDdoi(dateStr) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const body = {
        date: format(new Date(dateStr), 'yyyy-MM-dd') || undefined,
    };

    return await executeApiRequest('POST', 'data/ddoi',  JSON.stringify(body), headers);
}

export async function logToServer(path, body) {
    return await executeApiRequest('POST', `log/${path}`, JSON.stringify(body), {'Content-Type': 'application/json'});
}

export async function getNews(ticker) {
    const newsRespose = await executeApiRequest('GET', `data/news/${ticker}`, undefined, undefined);
    return newsRespose
}

export async function getUnusualOptions(ticker, dateStr) {
    return await executeApiRequest(
        'GET',
        `data/options/blocks/${ticker}/${dateStr}`,
        undefined,
        undefined,
    );
}

export async function getHistoricalUnusualOptions(ticker, contract) {
    return await executeApiRequest(
        'GET',
        `data/options/getContractData/${ticker}/${contract}`,
        undefined,
        undefined,
    );
}

export async function getTopTen(ticker, dateStr) {
    return await executeApiRequest(
        'GET',
        `data/stocks/tape/topten/${ticker}/${dateStr}`,
        undefined,
        undefined,
    );
}

export async function getTopTenDarkpool(ticker, dateStr) {
    return await executeApiRequest(
        'GET',
        `data/stocks/tape/toptendarkpool/${ticker}/${dateStr}`,
        undefined,
        undefined,
    );
}

export async function getGammaSummary(ticker, startDate, endDate) { 
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const raw = {
        ticker: ticker,
        startDate: startDate ? startDate.format('yyyy-MM-dd') : undefined,
        endDate: endDate ? endDate.format('yyyy-MM-dd') : undefined,
    };
    return await executeApiRequest('POST', 'summary', JSON.stringify(raw), headers);
}

export async function getGammaTide(ticker, day) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const formattedDate = format(new Date(day), 'yyyy-MM-dd');

    return await executeApiRequest('GET', `data/gammaFlow/${ticker}/${formattedDate}`, undefined, headers);
}

export async function getVolumeProfile(ticker) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return await executeApiRequest('GET', `data/aggregateData/volumeProfile/${ticker}`, undefined, headers);
}

export async function submitChatMessage(prompt, threadID) {
    const headers = new Headers();
    headers.append('Authority', 'data.traderlink.io');
    headers.append('Content-Type', 'application/json');

    return await executeApiRequest(
        'POST',
        'data/apexAI/chat',
        { prompt: prompt, threadID: threadID },
        headers,
    );
}

export async function loadPresets() {
    return await executeApiRequest(
        'GET',
        `data/dashboardPresets/loadUserPresets`,
        undefined,
        undefined,
    );
}

export async function loadSharedPreset(presetValues) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return await executeApiRequest(
        'POST',
        `data/dashboardPresets/loadSharedPreset`,
        JSON.stringify(presetValues),
        headers,
    );
}

export async function savePreset(presetValues) { 
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return await executeApiRequest('POST', 'data/dashboardPresets/savePreset', JSON.stringify(presetValues), headers);
}

export async function removePreset(presetID) { 
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return await executeApiRequest('POST', 'data/dashboardPresets/removeUserPreset', JSON.stringify(presetID), headers);
}
