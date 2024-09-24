import socketIOClient from 'socket.io-client';
import { redirectToLogin, setDuplicateSession } from '../api/apexApi';
import { logToServer } from '../api/apexApi';
// const BASE_URL_DEV = 'https://api.traderlink.io';
// const BASE_URL_DEV = 'http://dev.kube.traderlink.io';
const BASE_URL_PROD = 'https://app.traderlink.io';

export const SOCKET_TYPE = {
    TAPE: 'Tape',
    FOOTPRINT: 'Footprint',
    EXPOSURE: 'Exposure',
};

const ERROR_MESSAGES = {
    'io server disconnect': 'Server error, please try again later.',
    'ping timeout': 'Lost connection to server.',
    'transport close': 'Lost connection to server.',
    'transport error': 'Server error, please try again later.',
    'websocket error': 'Server error, please try again later.',
};

class SocketService {
    constructor(socketUrl, socketPath) {
        this.socketUrl = socketUrl;
        this.socketPath = socketPath;
        this.socket = undefined;
        this.socketPromise = undefined;
        this.subscriptions = {};
        this.reconnectDelay = 1000;
        this.reconnectTimeout = undefined;
    }

    subscribe(type, ticker, callbackRef, onConnect = () => {}, onError = () => {}, additionalData) {
        const callbackKey = Symbol();
        const subKey = this.getSubscriptionKey(
            type,
            ticker,
            additionalData?.timeframe,
            additionalData?.startDate,
            additionalData?.endDate,
        );

        let newSub = false;
        if (!this.subscriptions[subKey]) {
            newSub = true;
            this.subscriptions[subKey] = {};
        }

        this.subscriptions[subKey][callbackKey] = {
            callbackRef: callbackRef,
            onConnect: onConnect,
            onError: onError,
            additionalData,
        };

        if (!this.socket) {
            // First subscriber, open the socket
            this.openSocket()
                .then(this.joinSubscriptions.bind(this))
                .catch(() => {});
        } else if (this.socket.connected) {
            // Socket was already open, immediately run onConnect
            onConnect();

            if (newSub) {
                const payload = additionalData ? { ticker, ...additionalData } : ticker;
                this.socket.emit(`join${type}`, payload);
            }
        }

        return callbackKey;
    }

    unsubscribe(type, ticker, callbackKey, additionalData) {
        const subKey = this.getSubscriptionKey(
            type,
            ticker,
            additionalData?.timeframe,
            additionalData?.startDate,
            additionalData?.endDate,
        );
        const subCallbacks = this.subscriptions[subKey] || {};
        delete subCallbacks[callbackKey];

        if (!subCallbacks || Object.getOwnPropertySymbols(subCallbacks).length === 0) {
            // Last callback under this key, remove from the map
            delete this.subscriptions[subKey];

            // Announce leave
            if (this.socket) {
                const payload = additionalData ? { ticker, ...additionalData } : ticker;
                this.socket.emit(`leave${type}`, payload);
            }

            if (Object.keys(this.subscriptions).length === 0) {
                // Last subscriber, close the socket
                this.closeSocket();
            }
        }
    }

    openSocket() {
        if (this.socketPromise) {
            // An outgoing request to open the socket already exists, return the existing promise
            this.onError(undefined);
            return this.socketPromise;
        }

        this.socketPromise = new Promise((resolve, reject) => {
            this.socket = socketIOClient(this.socketUrl, {
                path: this.socketPath,
                reconnection: true,
                withCredentials: true,
                transports: ['polling', 'websocket'],
                upgrade: true,
                reconnectionDelayMax: 5000,
                extraHeaders: process.env.REACT_APP_API_KEY
                    ? { API_KEY: process.env.REACT_APP_API_KEY }
                    : {},
            });

            this.socket.on('connect_error', (reason) => {
                this.onError(reason);
                reject(reason);
            });
            this.socket.on('disconnect', (reason) => {
                logToServer('info', {message: 'socket disconnect', reason: reason});
                this.onError({ message: reason });
                reject({ message: reason });
            });

            this.socket.on('connect', () => {
                console.log('Socket connected');
                this.onError(undefined);
                this.onConnect();
                resolve();
            });

            this.socket.on("heartbeat", (arg, callback) => {
                callback("got it");
              });

            this.socket.on('initializeTape', (msg) =>
                this.receiveForType(SOCKET_TYPE.TAPE, msg, 'init'),
            );
            this.socket.on('tape', (msg) => this.receiveForType(SOCKET_TYPE.TAPE, msg, 'update'));
            this.socket.on('footprint', (msg) =>
                this.receiveForType(SOCKET_TYPE.FOOTPRINT, msg, 'update'),
            );
            this.socket.on('initializeFootprint', (msg) =>
                this.receiveForType(SOCKET_TYPE.FOOTPRINT, msg, 'init'),
            );
            this.socket.on('exposureData', (msg) => this.receiveForType(SOCKET_TYPE.EXPOSURE, msg));
        }).finally(() => {
            this.socketPromise = undefined;
        });

        return this.socketPromise;
    }

    joinSubscriptions() {
        Object.entries(this.subscriptions).forEach(([subKey, subCallbacks]) => {
            const [type, ticker] = subKey.split('_');
            // Note this assumes everything under the same sub key can share data from the same join message
            // If that changes in the future, the join should be sent for each subCallback
            const randomCallbackSym = Object.getOwnPropertySymbols(subCallbacks)[0];
            const randomCallback = subCallbacks[randomCallbackSym];

            const payload = randomCallback.additionalData
                ? { ticker, ...randomCallback.additionalData }
                : ticker;
            this.socket.emit(`join${type}`, payload);
        });
    }

    closeSocket() {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.socket = undefined;
    }

    receiveForType(type, msg, msgType) {
        const { ticker, data, startDate, endDate } = msg;
        let { timeframe } = msg;
        if (!timeframe) {
            timeframe = (data || {}).timeframe;
        }
        const subKey = this.getSubscriptionKey(type, ticker, timeframe, startDate, endDate);

        const subCallbacks = this.subscriptions[subKey] || {};
        Object.getOwnPropertySymbols(subCallbacks).forEach((symbol) =>
            subCallbacks[symbol].callbackRef.current(data, msgType),
        );
    }

    onError(error) {
        // Handle auth-related errors
        logToServer('info', {message: 'socket error', reason: error || 'unknown error'});

        if (error?.context?.response) {
            const responseCode = JSON.parse(error.context.response);
            if (responseCode?.message === 'METHOD_NOT_ALLOWED') {
                redirectToLogin();
                return;
            }
            if (responseCode?.message === 'DUPLICATE_SESSION') {
                setDuplicateSession(true);
                return;
            }
        }

        // Try reconnecting after 1 second with exponential backoff, as long as the disconnect wasn't initiated by the client
        //  and another retry isn't already queued up
        if (error && error.message !== 'io client disconnect' && !this.reconnectTimeout) {
            this.reconnectTimeout = window.setTimeout(() => {
                this.reconnectTimeout = undefined;
                this.reconnectDelay *= 2;
                this.socketReconnect();
            }, this.reconnectDelay);
        }
        if (!error) {
            this.reconnectDelay = 1000;
        }

        const formattedError = error;
        if (ERROR_MESSAGES[error?.message]) {
            formattedError.message = ERROR_MESSAGES[error.message];
        }
        Object.values(this.subscriptions).forEach((subCallbacks) => {
            Object.getOwnPropertySymbols(subCallbacks).forEach((symbol) =>
                subCallbacks[symbol].onError(formattedError),
            );
        });
    }

    socketReconnect() {
        // Restart the socket
        this.closeSocket();

        // Don't bother reconnecting if the subscriptions have been cleared
        if (Object.keys(this.subscriptions).length > 0) {
            // Ignore promise rejection, since the socket will retry on its own
            this.openSocket()
                .then(this.joinSubscriptions.bind(this))
                .catch(() => {});
        }
    }

    onConnect() {
        Object.values(this.subscriptions).forEach((subCallbacks) => {
            Object.getOwnPropertySymbols(subCallbacks).forEach((symbol) =>
                subCallbacks[symbol].onConnect(),
            );
        });
    }

    getSubscriptionKey(type, ticker, ...additionalData) {
        return `${type}_${ticker}_${JSON.stringify(additionalData)}`;
    }
}


export const flowSocketService = new SocketService(
        `${BASE_URL_PROD}`, `${process.env.REACT_APP_TL_ENV !== 'PROD' ? '/dev' : ''}/ws/stocks/socket.io`
    );

export const exposureSocketService = new SocketService(
    `${BASE_URL_PROD}`, `${process.env.REACT_APP_TL_ENV !== 'PROD' ? '/dev' : ''}/ws/exposures/socket.io`
);