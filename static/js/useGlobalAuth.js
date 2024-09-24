import { useEffect, useState } from 'react';

let globalState = {
    isDuplicateSession: false,
};

const listeners = new Set();

export const useGlobalAuth = () => {
    const [state, setState] = useState(globalState);
    useEffect(() => {
        const listener = () => {
            setState(globalState);
        };
        listeners.add(listener);
        listener();
        return () => listeners.delete(listener);
    }, []);
    return [state, setGlobalAuth];
};

export const setGlobalAuth = (nextGlobalState) => {
    globalState = nextGlobalState;
    listeners.forEach((listener) => listener());
};
