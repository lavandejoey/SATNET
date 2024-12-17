// js/utils/cacheUtils.js
import { ctx } from "/js/utils/config";

// Initialize the IndexedDB connection and wrap it in a Promise
export const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("cacheDatabase", 1);

    // Handle database upgrades (e.g., creating object stores)
    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("cache")) {
            db.createObjectStore("cache", { keyPath: "cacheKey" });
        }
    };

    // Resolve the promise with the database instance once it's successfully opened
    request.onsuccess = function (event) {
        const db = event.target.result;
        resolve(db);
    };

    // Reject the promise if there's an error opening the database
    request.onerror = function (event) {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
    };
});

/**
 * Retrieves the object store with the specified mode.
 * @param {string} mode - The transaction mode ('readonly' or 'readwrite').
 * @returns {Promise<IDBObjectStore>} - A promise that resolves to the object store.
 */
export function getObjectStore(mode = "readonly") {
    return dbPromise.then((db) => {
        const tx = db.transaction("cache", mode);
        return tx.objectStore("cache");
    });
}

/**
 * Checks if the cache entry with the given key is still valid.
 * @param {string} cacheKey - The key of the cache entry.
 * @returns {Promise<boolean>} - A promise that resolves to true if valid, false otherwise.
 */
export async function isCacheValid(cacheKey) {
    if (cacheKey === undefined) return false;
    try {
        const store = await getObjectStore("readonly");
        return new Promise((resolve) => {
            const request = store.get(cacheKey);
            request.onsuccess = (event) => {
                const entry = event.target.result;
                resolve(entry && entry.expiry > Date.now());
            };
            request.onerror = () => resolve(false);
        });
    } catch (error) {
        console.error("Error in isCacheValid:", error);
        return false;
    }
}

/**
 * Saves data to the cache with the specified key and duration.
 * @param {string} cacheKey - The key for the cache entry.
 * @param {*} data - The data to be cached.
 * @param {number} [duration=ctx.CACHE_DURATION] - The duration in milliseconds for which the cache is valid.
 * @returns {Promise<boolean>} - A promise that resolves to true if saved successfully, false otherwise.
 */
export async function saveToCache(cacheKey, data, duration = ctx.CACHE_DURATION) {
    if (cacheKey === undefined) return false;
    try {
        const store = await getObjectStore("readwrite");
        const expiry = Date.now() + duration;
        return new Promise((resolve, reject) => {
            const request = store.put({ cacheKey, data, expiry });
            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error("Error saving to cache:", request.error);
                reject(false);
            };
        });
    } catch (error) {
        console.error("Error in saveToCache:", error);
        return false;
    }
}

/**
 * Retrieves cached data for the given key.
 * @param {string} cacheKey - The key of the cache entry.
 * @returns {Promise<*>} - A promise that resolves to the cached data or null if not found.
 */
export async function getCachedData(cacheKey) {
    if (cacheKey === undefined) return null;
    try {
        const store = await getObjectStore("readonly");
        return new Promise((resolve, reject) => {
            const request = store.get(cacheKey);
            request.onsuccess = (event) => {
                const entry = event.target.result;
                resolve(entry ? entry.data : null);
            };
            request.onerror = () => {
                console.error("Error retrieving cached data:", request.error);
                reject(null);
            };
        });
    } catch (error) {
        console.error("Error in getCachedData:", error);
        return null;
    }
}