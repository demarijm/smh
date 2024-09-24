import React, { useReducer } from 'react';

const reducer = (state, action) => {
    switch (action.type) {
        case 'setToolbarComponents':
            return {
                ...state,
                toolbarComponents: action.toolbarComponents,
            };

        default:
            return state;
    }
};

export const initialState = {
    toolbarComponents: [],
};

export const GlobalToolbarContext = React.createContext({
    state: initialState,
    dispatch: () => null,
});

export const GlobalToolbarProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <GlobalToolbarContext.Provider value={[state, dispatch]}>
            {children}
        </GlobalToolbarContext.Provider>
    );
};
