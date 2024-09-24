import React, { useCallback, useContext, useReducer } from 'react';
import { DASHBOARD_CONFIG_STORAGE_KEY } from '../util/localStorageUtils';
import { LINK_CHANNELS, SharedDashboardContext } from './SharedDashboardContext';
import { localStore } from '../util/storageFactory';

const reducer = (sharedDispatch, id) => {
    return (state, action) => {
        const dashboardConfig = JSON.parse(localStore.getItem(DASHBOARD_CONFIG_STORAGE_KEY)) || {};

        switch (action.type) {
            case 'setDisplayMode':
                dashboardConfig[id] = { ...dashboardConfig[id], displayMode: action.displayMode };
                localStore.setItem(DASHBOARD_CONFIG_STORAGE_KEY, JSON.stringify(dashboardConfig));

                return {
                    ...state,
                    displayMode: action.displayMode,
                };
            case 'setLotFilter':
                dashboardConfig[id] = { ...dashboardConfig[id], lotFilter: action.lotFilter };
                localStore.setItem(DASHBOARD_CONFIG_STORAGE_KEY, JSON.stringify(dashboardConfig));

                return {
                    ...state,
                    lotFilter: action.lotFilter,
                };
            case 'setVariant':
                dashboardConfig[id] = { ...dashboardConfig[id], variant: action.variant };
                localStore.setItem(DASHBOARD_CONFIG_STORAGE_KEY, JSON.stringify(dashboardConfig));

                return {
                    ...state,
                    variant: action.variant,
                };
            case 'setTimeframe':
                dashboardConfig[id] = { ...dashboardConfig[id], timeframe: action.timeframe };
                localStore.setItem(DASHBOARD_CONFIG_STORAGE_KEY, JSON.stringify(dashboardConfig));

                return {
                    ...state,
                    timeframe: action.timeframe,
                };
            case 'setShowDistributions':
                dashboardConfig[id] = {
                    ...dashboardConfig[id],
                    showDistributions: action.showDistributions,
                };
                localStore.setItem(DASHBOARD_CONFIG_STORAGE_KEY, JSON.stringify(dashboardConfig));

                return {
                    ...state,
                    showDistributions: action.showDistributions,
                };
            case 'setTitleDecorator':
                return {
                    ...state,
                    titleDecorator: action.titleDecorator,
                };
            case 'setCustomActions':
                return {
                    ...state,
                    customActions: action.customActions,
                };
            default:
                return state;
        }
    };
};

export const initialState = {
    displayMode: 'net',
    lotFilter: 100,
    variant: undefined,
    timeframe: 5,
    showDistributions: false,
    titleDecorator: undefined,
    customActions: [],
};

export const DashboardItemContext = React.createContext({
    state: initialState,
    dispatch: () => null,
});

export const DashboardItemProvider = ({ item, children }) => {
    const [sharedState, sharedDispatch] = useContext(SharedDashboardContext);

    const dashboardConfig = JSON.parse(localStore.getItem(DASHBOARD_CONFIG_STORAGE_KEY)) || {};

    const [state, dispatch] = useReducer(reducer(sharedDispatch, item['id']), {
        displayMode: dashboardConfig[item.id]?.displayMode || 'net',
        lotFilter: dashboardConfig[item.id]?.lotFilter || 100,
        variant: dashboardConfig[item.id]?.variant,
        timeframe: dashboardConfig[item.id]?.timeframe || 5,
        showDistributions: dashboardConfig[item.id]?.showDistributions,
        titleDecorator: undefined,
        customActions: [],
    });

    const combinedState = {
        linkChannel: sharedState[item.id]?.linkChannel || LINK_CHANNELS.UNLINKED.value,
        ticker: sharedState[item.id]?.ticker || item.defaultTicker || 'SPX',
        selectedDate: sharedState[item.id]?.selectedDate,
        selectedDateRange: sharedState[item.id]?.selectedDateRange,
        ...state,
    };
    const combinedDispatch = useCallback(
        (action) => {
            switch (action.type) {
                case 'setLinked':
                case 'setTicker':
                case 'setSelectedDate':
                case 'setSelectedDateRange':
                    return sharedDispatch({ ...action, id: item.id });
                default:
                    return dispatch(action);
            }
        },
        [item.id, sharedDispatch],
    );

    return (
        <DashboardItemContext.Provider value={[combinedState, combinedDispatch]}>
            {children}
        </DashboardItemContext.Provider>
    );
};
