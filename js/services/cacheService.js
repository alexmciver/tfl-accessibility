export class CacheService {
    static setItem(key, value, expiryHours = 24) {
        const item = {
            value,
            timestamp: new Date().getTime(),
            expiry: expiryHours * 60 * 60 * 1000
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    static getItem(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const parsedItem = JSON.parse(item);
        if (new Date().getTime() - parsedItem.timestamp > parsedItem.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return parsedItem.value;
    }
} 