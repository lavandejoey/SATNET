// js/utils/load_orbits.js
import * as satellite from 'satellite.js';

// const STARTLINKS_TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle";
const STARTLINKS_TLE_URL = "data/starlinkTLE.txt";

export async function loadOrbitsTLE() {
    const response = await fetch(STARTLINKS_TLE_URL);
    const text = (await response.text()).replaceAll('\r', '');
    const lines = text.split('\n');
    // sample:
    // 0:"STARLINK-1008"
    // 1:"1 44714U 19074B   24331.95925387  .00009614  00000+0  66297-3 0  9994"
    // 2:"2 44714  53.0511 126.3413 0001270 109.2614 250.8513 15.06427524278423"
    const satellites = {}; // key: NORAD ID, value: [Line1, Line2]
    for (let i = 0; i < lines.length; i += 3) {
        const name = lines[i].trim();
        const line1 = lines[i + 1]?.trim();
        const line2 = lines[i + 2]?.trim();
        if (line1 && line2) {
            satellites[name] = [line1, line2];
        }
    }
    return satellites;
}


// Load data/starlink.csv
// CREATION_DATE: filter out the satellites not created
// OBJECT_NAME: satellite name
const STARLINKS_JSON_URL = "data/starlink.json";

export async function loadStarlinkData() {
    const response = await fetch(STARLINKS_JSON_URL);
    const json = await response.json();
    return json;
}
