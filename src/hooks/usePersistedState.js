import { useEffect, useState } from 'react';
function readStoredValue(key, fallbackValue) {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : fallbackValue;
    }
    catch {
        return fallbackValue;
    }
}
export default function usePersistedState(key, initialValue) {
    const [value, setValue] = useState(() => readStoredValue(key, initialValue));
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}

