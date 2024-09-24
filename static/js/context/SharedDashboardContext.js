import React, { useEffect, useReducer } from 'react';
import { DASHBOARD_CONFIG_STORAGE_KEY } from '../util/localStorageUtils';
import { objectMap } from '../util/utils';
import { localStore } from '../util/storageFactory';

export const LINK_CHANNELS = {
    UNLINKED: { value: -1, color: '#FFFFFF' },
    R: { value: 1, color: '#e63262' },
    G: { value: 2, color: '#4acf81' },
    B: { value: 3, color: '#56eef4' },
    Y: { value: 4, color: '#ffc933' },
};

const reducer = (state, action) => {
    const dashboardConfig = JSON.parse(localStore.getItem(DASHBOARD_CONFIG_STORAGE_KEY)) || {};

    const itemId = action.id;
    switch (action.type) {
        case 'setLinked': {
            let newTicker = dashboardConfig[itemId]?.ticker;
            let updatedViaLink = false;
            if (action.linkChannel) {
                // This item is becoming linked. If there are other existing links, change this ticker to match
                const existingLinkKey = Object.keys(dashboardConfig).find(
                    (key) =>
                        key !== itemId && dashboardConfig[key].linkChannel === action.linkChannel,
                );
                if (existingLinkKey) {
                    newTicker = dashboardConfig[existingLinkKey].ticker;
                    updatedViaLink = true;
                }
            }

            dashboardConfig[itemId] = {
                ...dashboardConfig[itemId],
                linkChannel: action.linkChannel,
                ticker: newTicker,
            };
            localStore.setItem(DASHBOARD_CONFIG_STORAGE_KEY, JSON.stringify(dashboardConfig));

            return {
                ...state,
                [itemId]: {
                    ...state[itemId],
                    linkChannel: action.linkChannel,
                    ticker: newTicker,
                },
                updatedViaLink,
            };
        }
        case 'setTicker': {
            dashboardConfig[itemId] = { ...dashboardConfig[itemId], ticker: action.ticker };

            const newState = { ...state };
            if (state[itemId]?.linkChannel) {
                // Update the tickers of all other linked items
                Object.keys(dashboardConfig)
                    .filter(
                        (key) =>
                            key !== itemId &&
                            dashboardConfig[key].linkChannel === state[itemId].linkChannel,
                    )
                    .forEach((key) => {
                        dashboardConfig[key] = {
                            ...dashboardConfig[key],
                            ticker: action.ticker,
                        };
                        newState[key] = {
                            ...state[key],
                            ticker: action.ticker,
                        };
                    });
                newState.updatedViaLink = true;
            }
            newState[itemId] = {
                ...state[itemId],
                ticker: action.ticker,
            };

            localStore.setItem(DASHBOARD_CONFIG_STORAGE_KEY, JSON.stringify(dashboardConfig));

            return newState;
        }
        case 'setSelectedDateRange':
        case 'setSelectedDate': {
            const configKey =
                action.type === 'setSelectedDate' ? 'selectedDate' : 'selectedDateRange';
            // Note that the selected date should not be saved to localStorage
            const newState = { ...state };

            if (state[itemId]?.linkChannel) {
                // Update the dates of all other linked items
                Object.keys(dashboardConfig)
                    .filter(
                        (key) =>
                            key !== itemId &&
                            dashboardConfig[key].linkChannel === state[itemId].linkChannel,
                    )
                    .forEach((key) => {
                        newState[key] = {
                            ...state[key],
                            [configKey]: action[configKey],
                        };
                    });
                newState.updatedViaLink = true;
            }
            newState[itemId] = {
                ...state[itemId],
                [configKey]: action[configKey],
            };
            return newState;
        }
        case 'postLinkUpdate':
            // This intermediate state is used to give children one render cycle to respond if the state was updated externally
            return { ...state, updatedViaLink: false };
        default:
            return state;
    }
};

const initialState = {
    updatedViaLink: false,
};

export const SharedDashboardContext = React.createContext({
    state: initialState,
    dispatch: () => null,
});

export const SharedDashboardProvider = ({ children }) => {
    const dashboardConfig = JSON.parse(localStore.getItem(DASHBOARD_CONFIG_STORAGE_KEY)) || {};

    const [state, dispatch] = useReducer(reducer, {
        ...objectMap(dashboardConfig, ({ ticker, linkChannel }) => ({ ticker, linkChannel })),
        updatedViaLink: false,
    });

    useEffect(() => {
        if (state.updatedViaLink) {
            dispatch({ type: 'postLinkUpdate' });
        }
    }, [state.updatedViaLink]);

    return (
        <SharedDashboardContext.Provider value={[state, dispatch]}>
            {children}
        </SharedDashboardContext.Provider>
    );
};
