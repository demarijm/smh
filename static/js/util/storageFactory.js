function storageFactory(getStorage) {
    let inMemoryStorage = {};
    let _supported = undefined;

    function isSupported() {
        if (_supported !== undefined) {
            return _supported;
        }

        try {
            const testKey = '__test_local_storage_supported__';
            getStorage().setItem(testKey, testKey);
            getStorage().removeItem(testKey);
            _supported = true;
            return true;
        } catch (e) {
            _supported = false;
            return false;
        }
    }

    /**
     * The storage event is manually triggered on write for two reasons:
     * 1 - The user may have disabled access to the browser storage,
     *  in which case we need to simulate the event when writing to the in-memory store
     * 2 - The browser 'storage' events are only triggered when modified by another window,
     *  but we want to enable listening within the same window
     */
    function triggerStorageEvent(key, oldValue, newValue) {
        const e = new StorageEvent('storage', {
            storageArea: getStorage(),
            key,
            oldValue,
            newValue,
            url: window.location.href,
        });
        window.dispatchEvent(e);
    }

    function clear() {
        if (isSupported()) {
            getStorage().clear();
        } else {
            inMemoryStorage = {};
        }
    }

    function getItem(name) {
        if (isSupported()) {
            return getStorage().getItem(name);
        }
        if (inMemoryStorage.hasOwnProperty(name)) {
            return inMemoryStorage[name];
        }
        return null;
    }

    function key(index) {
        if (isSupported()) {
            return getStorage().key(index);
        } else {
            return Object.keys(inMemoryStorage)[index] || null;
        }
    }

    function removeItem(name) {
        const oldValue = getItem(name);
        if (isSupported()) {
            getStorage().removeItem(name);
        } else {
            delete inMemoryStorage[name];
        }
        triggerStorageEvent(name, oldValue, undefined);
    }

    function setItem(name, value) {
        const oldValue = getItem(name);
        if (isSupported()) {
            getStorage().setItem(name, value);
        } else {
            inMemoryStorage[name] = String(value);
        }
        triggerStorageEvent(name, oldValue, value);
    }

    function length() {
        if (isSupported()) {
            return getStorage().length;
        } else {
            return Object.keys(inMemoryStorage).length;
        }
    }

    return {
        getItem,
        setItem,
        removeItem,
        clear,
        key,
        get length() {
            return length();
        },
    };
}

export const localStore = storageFactory(() => localStorage);
export const sessionStore = storageFactory(() => sessionStorage);
