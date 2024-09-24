import { localStore } from './storageFactory';
import { useCallback, useEffect, useState } from 'react';

export const LOCAL_STORAGE_INIT_TIMESTAMP = 'tl-init-date';
export const LAYOUT_STORAGE_KEY = 'tl-layout';
export const ITEMS_STORAGE_KEY = 'tl-items';
export const DASHBOARD_CONFIG_STORAGE_KEY = 'tl-dashboard-config';
export const DONE_TUTORIAL_STORAGE_KEY = 'tl-done-tutorial';
export const REPLAY_TUTORIAL_STORAGE_KEY = 'tl-replay-tutorial';
export const NEW_MODULE_KEY = 'tl-new-module';

// Update this number to the value of Date.now() whenever a breaking change to local storage is made
// Note that it will wipe out everyone's dashboard customizations
const MIN_VALID_DATE = 1683340740665;

const resetLocalStorage = () => {
    localStore.removeItem(LAYOUT_STORAGE_KEY);
    localStore.removeItem(ITEMS_STORAGE_KEY);
    localStore.removeItem(DASHBOARD_CONFIG_STORAGE_KEY);

    localStore.setItem(LOCAL_STORAGE_INIT_TIMESTAMP, String(Date.now()));
};

export const checkLocalStorageValidity = () => {
    const initTimestamp = localStore.getItem(LOCAL_STORAGE_INIT_TIMESTAMP);

    if (initTimestamp === null || initTimestamp < MIN_VALID_DATE) {
        resetLocalStorage();
    }
};

export const useLocalStorageListener = ({ key }) => {
    const [value, setValue] = useState(localStore.getItem(key));

    const extSetValue = useCallback(
        (newValue) => {
            setValue(newValue);
            if (newValue === null || newValue === undefined) {
                localStore.removeItem(key);
            } else {
                localStore.setItem(key, newValue);
            }
        },
        [key],
    );

    useEffect(() => {
        const readStorage = () => {
            setValue(localStore.getItem(key));
        };
        window.addEventListener('storage', readStorage);
        return () => window.removeEventListener('storage', readStorage);
    }, [key]);

    return {
        value,
        setValue: extSetValue,
    };
};

export const setReplayTutorial = () => {
    localStore.setItem(REPLAY_TUTORIAL_STORAGE_KEY, 'true');
};

export const isNewModule = () => {
    return !localStore.getItem(NEW_MODULE_KEY);
};

export const setNewModule = () => {
    localStore.setItem(NEW_MODULE_KEY, 'true');
};
