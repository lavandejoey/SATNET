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

export function getObjectStore(mode = "readonly") {
    return dbPromise.then((db) => {
        const tx = db.transaction("cache", mode);
        return tx.objectStore("cache");
    });
}

export async function isCacheValid(cacheKey) {
    // return false; // debug line
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