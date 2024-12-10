// js/utils/data.js
import "/node_modules/d3/dist/d3.min.js";
import {ctx} from "/js/utils/config";
import {getCachedData, isCacheValid, saveToCache} from "/js/utils/cacheUtils";
import * as satellite from "satellite.js";

// Keep col: #Launch_Tag, Launch_Date, Piece, Name, PLName, SatOwner, SatState, Launch_Site
const REQUIRED_COLUMNS = ["#Launch_Tag", "Launch_Date", "Piece", "Name", "PLName", "SatOwner", "SatState", "Launch_Site"];

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
        case ctx.SAT_GROUP.STARLINK:
            name = rawName.replaceAll('-', ' ').split(' ').slice(0, 2).join(' ');
            launchDate = ctx.LAUNCHLOG.DATA.find(row => row.Name.toLowerCase() === name.toLowerCase())?.Launch_Date;
            break;
        case ctx.SAT_GROUP.BEIDOU:
            // "BEIDOU-2 M4 (C12)       "->"BEIDOU-2 M4"
            name = rawName.split(' ').slice(0, 2).join(' ');
            launchDate = ctx.LAUNCHLOG.DATA.find(row => row.PLName.toLowerCase() === name.toLowerCase())?.Launch_Date;
            break;
        default:
            console.error(`Invalid satellite group: ${satGroup}`);
            break;
    }
    // console.log(`Satellite: ${name}, Launch Date: ${launchDate}`);

    return [name, launchDate];
}