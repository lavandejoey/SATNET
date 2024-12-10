// js/utils/cacheUtils.js
import {ctx} from "/js/utils/config";

// IndexedDB Utility
const dbPromise = indexedDB.open("cacheDatabase", 1);

dbPromise.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache", {keyPath: "cacheKey"});
    }
};

function getDB() {
    return new Promise((resolve, reject) => {
        const request = dbPromise.result.transaction("cache", "readwrite").objectStore("cache");
        resolve(request);
    });
}

// Utility to check if cache is still valid
export async function isCacheValid(cacheKey) {
    const db = await getDB();
    return new Promise((resolve) => {
        const request = db.get(cacheKey);
        request.onsuccess = (event) => {
            const entry = event.target.result;
            resolve(entry && entry.expiry > new Date().getTime());
        };
        request.onerror = () => resolve(false);
    });
}

// Save data to cache
export async function saveToCache(cacheKey, data, duration = ctx.CACHE_DURATION) {
    const db = await getDB();
    const expiry = new Date().getTime() + duration;
    return new Promise((resolve, reject) => {
        const request = db.put({cacheKey, data, expiry});
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(false);
    });
}

// Get cached data
export async function getCachedData(cacheKey) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const request = db.get(cacheKey);
        request.onsuccess = (event) => {
            const entry = event.target.result;
            resolve(entry ? entry.data : null);
        };
        request.onerror = () => reject(null);
    });
}