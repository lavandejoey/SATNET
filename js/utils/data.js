// js/utils/data.js
import "/node_modules/d3/dist/d3.min.js";
import {ctx} from "/js/utils/config";
import {getCachedData, isCacheValid, saveToCache} from "/js/utils/cacheUtils";
import * as satellite from "satellite.js";

// Keep col: #Launch_Tag, Launch_Date, Piece, Name, PLName, SatOwner, SatState, Launch_Site
const REQUIRED_COLUMNS = ["#Launch_Tag", "Launch_Date", "Piece", "Name", "PLName", "SatOwner", "SatState", "Launch_Site"];
const SITE_REQUIRED_COLUMNS = ["#Site", "Longitude", "Latitude"];

function parseStringDate(rawDatetime) {
    rawDatetime = rawDatetime.replaceAll('?', '').slice(0, 16);

    if (rawDatetime.length < 12) {
        rawDatetime += " 0000";
    }

    const parse = d3.timeParse("%Y %b %d %H%M");
    const parsedDatetime = parse(rawDatetime);

    if (!parsedDatetime) {
        throw new Error(`Invalid datetime format: ${rawDatetime}`);
    }

    return parsedDatetime;
}

function cleanDataColumns(data, columns) {
    return data
        .filter(row => Object.values(row).every(value => value !== null && value !== undefined && value !== ''))
        .map(row => {
            const cleanedRow = {};
            columns.forEach(col => cleanedRow[col] = row[col]);
            return cleanedRow;
        });
}

export async function loadSites() {
    if (await isCacheValid(ctx.SITES.CACHE_KEY)) {
        ctx.SITES.DATA = await getCachedData(ctx.SITES.CACHE_KEY);
        console.log("Fetched sites data from cache");
        return ctx.SITES.DATA;
    }

    try {
        const data = await d3.dsv('\t', ctx.SITES.URL);
        const parsedData = data.map(row => ({
            ...row
        }));
        const cleanedData = cleanDataColumns(parsedData, SITE_REQUIRED_COLUMNS);

        ctx.SITES.DATA = cleanedData.reduce((acc, site) => {
            const siteKey = site["#Site"].trim();
            const longitude = parseFloat(site["Longitude"]);
            const latitude = parseFloat(site["Latitude"]);

            acc[siteKey] = {Longitude: longitude, Latitude: latitude};
            return acc;
        }, {});

        console.log("Fetched sites data from server");

        saveToCache(ctx.SITES.CACHE_KEY, ctx.SITES.DATA, ctx.CACHE_DURATION).then(() => console.log("Saved launch log data to cache"));

        return ctx.SITES.DATA;
    } catch (error) {
        console.error("Failed to fetch sites data", error);
        ctx.SITES.DATA = [];
    }
}

export async function loadLaunchLog() {
    if (await isCacheValid(ctx.LAUNCHLOG.CACHE_KEY)) {
        const cachedData = await getCachedData(ctx.LAUNCHLOG.CACHE_KEY);
        if (cachedData) {
            ctx.LAUNCHLOG.DATA = cachedData.map(row => ({
                ...row,
                Launch_Date: new Date(row.Launch_Date),
            }));
            console.log("Fetched launch log data from cache");
            return;
        }
    }

    try {
        const data = await d3.dsv('\t', ctx.LAUNCHLOG.URL);

        const parsedData = data.map(row => ({
            ...row,
            Launch_Date: parseStringDate(row.Launch_Date),
        }));

        const cleanedData = cleanDataColumns(parsedData, REQUIRED_COLUMNS);
        ctx.LAUNCHLOG.DATA = cleanedData;
        console.log("Fetched launch log data from server");

        // Load sites data and match with location
        const siteData = await loadSites();
        cleanedData.forEach(launch => {
            const launchSite = launch.Launch_Site;
            const map_loc = siteData[launchSite];
            if (map_loc) launch['loc'] = map_loc;
            else console.log(launchSite);
        });

        console.log("Fetched launch log data from server");

        saveToCache(ctx.LAUNCHLOG.CACHE_KEY, cleanedData, ctx.CACHE_DURATION).then(() => console.log("Saved launch log data to cache"));
    } catch (error) {
        console.error("Failed to fetch launch log data", error);
        ctx.LAUNCHLOG.DATA = [];
    }
}

export async function loadOrbitsTLEDate(satGroup) {
    // Check if the satellite name exists ctx.SAT_GROUP
    const satName = satGroup.NAME;
    const satGroupCacheKey = satGroup.CACHE_KEY;
    const satGroupUrl = satGroup.URL;

    // Check if cache is still valid
    if (await isCacheValid(satGroupCacheKey)) {
        const cachedData = await getCachedData(satGroupCacheKey);
        if (cachedData) {
            satGroup.DATA = cachedData;
            console.log(`Fetched TLE data for ${satName} from cache`);
            return;
        }
    }

    try {
        const satellites = []; // [{SatName/ID, launch date, satrec}]

        const response = await fetch(satGroupUrl);
        const text = (await response.text()).replaceAll('\r', '');
        const lines = text.split('\n');
        // 3 lines by 3 lines process
        for (let idx = 0; idx + 2 < lines.length; idx += 3) {
            const line1 = lines[idx + 1]?.trim();
            const line2 = lines[idx + 2]?.trim();
            if (!line1 || !line2) {
                console.error(`${lines.length}, ${idx}`);
                console.error(`${lines[idx]}, ${lines[idx + 1]}, ${lines[idx + 2]}`);
                console.error(`Invalid TLE data for ${lines[idx].trim()}`);
                continue;
            }
            const satRec = satellite.twoline2satrec(line1, line2);

            // Name Date with some special processing
            const [name, launchDate] = satellitesAlignments(satGroup, lines[idx].trim());

            // sat rec
            if (satRec && launchDate) {
                satellites.push({
                    Name: name,
                    Launch_Date: launchDate,
                    SatRec: satRec,
                });
            } else {
                console.warn(`Failed to process TLE data for ${name}, ld:${launchDate}, rec:${satRec}`);
            }
        }

        satGroup.DATA = satellites;
        console.log(`Fetched TLE data for ${satName} from server`);

        saveToCache(satGroupCacheKey, satellites).then(() => console.log(`Saved TLE data for ${satName} to cache`));
    } catch (error) {
        console.error(`Failed to fetch TLE data for ${satName}`, error);
        satGroup.DATA = [];
    }
}

function satellitesAlignments(satGroup, rawName) {
    let name, launchDate;
    switch (satGroup) {
        /****************************************** Communication Satellites ******************************************/
        case ctx.SAT_GROUP.STARLINK:
            name = rawName.replaceAll('-', ' ').split(' ').slice(0, 2).join(' ');
            launchDate = ctx.LAUNCHLOG.DATA.find(row => row.Name.toLowerCase() === name.toLowerCase())?.Launch_Date;
            break;
        /******************************************* Navigation Satellites *******************************************/
        case ctx.SAT_GROUP.BEIDOU:
            // "BEIDOU-2 M4 (C12)       "->"BEIDOU-2 M4"
            name = rawName.split("(")[0].trim()
                .replace("BEIDOU-", "Beidou-")
                .replace(" IGSO-", " I")
                .replace(" M", " M")
                .replaceAll("S", "-S")
                .replace("Q", "Q")
                //Beidou-3-S I1-S -> Beidou-3 I1-S, Beidou-2-S W1-S -> Beidou-2 W1-S
                .replace(/Beidou-(\d+)-S\s*(\w+)/, "Beidou-$1 $2");
            launchDate = ctx.LAUNCHLOG.DATA.find(row => {
                const plName = row.PLName.split("(")[0].trim().toLowerCase();
                return plName === name.toLowerCase() || plName === (name + "Q").toLowerCase();
            })?.Launch_Date;
            // console.log(`Beidou: ${rawName}->${name}, ${launchDate}`);
            break;
        case ctx.SAT_GROUP.GALILEO:
            // take number from the end of string "GSAT0206 (GALILEO 10)   " -> "10" / "GSAT0103 (GALILEO-FM3)  " -> "3"
            const namePrefix = "GalileoSat-";
            const trimmedName = rawName.trim();
            const match = trimmedName.match(/\(GALILEO(?:-([A-Z]+)(\d*))?\s*(\d+)?\)/);
            if (!match) return null; // No match found, return null or handle error
            let number;
            const prefixGroup = match[1]; // e.g. "FM" or "PFM" (might be undefined if not present)
            const fmNumber = match[2];    // e.g. "3" if "GALILEO-FM3"
            const standaloneNumber = match[3]; // e.g. "10" if "GALILEO 10"

            if (standaloneNumber) { // "GALILEO X" format
                number = standaloneNumber;
            } else if (prefixGroup) { // "GALILEO-FM#" or "GALILEO-PFM"
                if (prefixGroup === "PFM") { // PFM corresponds to satellite number 1
                    number = "1";
                } else { // FM group, number should be in fmNumber
                    number = fmNumber;
                }
            }
            name = `${namePrefix}${number}`;

            launchDate = ctx.LAUNCHLOG.DATA.find(row => row.Name.toLowerCase() === name.toLowerCase())?.Launch_Date;
            // console.log(`Galileo: ${name}, ${launchDate}`);
            break;
        /********************************************* Weather Satellites *********************************************/
        case ctx.SAT_GROUP.NOAA:
            name = rawName.split("(")[0].trim().replaceAll(' ', '-');
            launchDate = ctx.LAUNCHLOG.DATA.find(row => row.Name.toLowerCase().replaceAll(' ', '-') === name.toLowerCase())?.Launch_Date;
            // console.log(`NOAA: ${name}, ${launchDate}`);
            break;
        case ctx.SAT_GROUP.GEODETIC:
            name = rawName.split("(")[0].replaceAll(/ 1$/g, "").replaceAll("COSMOS", "Kosmos").trim().replaceAll(" ", "-");
            launchDate = ctx.LAUNCHLOG.DATA.find(row => row.Name.toLowerCase().replaceAll(" ", "-") === name.toLowerCase())?.Launch_Date;
            break;
        default:
            console.error(`Invalid satellite group: ${satGroup}`);
            break;
    }
    if (!launchDate) console.warn(`Geodetic: ${rawName} --> ${name}, ${launchDate}`);
    return [name, launchDate];
}