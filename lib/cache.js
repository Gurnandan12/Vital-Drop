import NodeCache from 'node-cache';
// Create a singleton instance of the cache
// stdTTL is the default time-to-live in seconds (e.g. 60 seconds)
const globalCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
export const cache = {
    get: (key) => {
        return globalCache.get(key);
    },
    set: (key, value, ttl) => {
        if (ttl) {
            return globalCache.set(key, value, ttl);
        }
        return globalCache.set(key, value);
    },
    has: (key) => {
        return globalCache.has(key);
    },
    del: (key) => {
        return globalCache.del(key);
    }
};
