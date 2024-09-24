export const OPEN_STATE = {
    CLOSED: 0,
    OPENING: 1,
    OPEN: 2,
};

export const MAX_ITEMS = 15;

export function removeItemOnce(arr, index) {
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
