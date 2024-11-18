// /js/SatelliteCesium.js
import * as satellitejs from 'satellite.js';
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
let ctx ={
    DATA_URL: "/data/all_orbits.json",
    PLOT_SIZE: 2,
    TLEs: [],
}

export async function loadSatelliteData() {
    const data = await fetch(ctx.DATA_URL).then(response => response.json());
    ctx.TLEs = data.slice(0, ctx.PLOT_SIZE).map(tleData => {
        const tleLines = tleData.norad_str.trim().split('\n');
        const name = tleLines[0].trim().replace(/\s/g, ''); // Fixed regex for whitespace
        const [line1, line2] = tleLines.slice(1, 3);
        if (validateTLE(line1, line2)) {
            return { id: tleData.id, name: name, tleString: `${name}\n${line1}\n${line2}`, satellite: tleData.satellite };
        } else {
            console.warn('Invalid TLE data:', tleData);
            return null;
        }
    }).filter(tle => tle !== null);
    return ctx.TLEs;
}

// line2 input is optional
function validateTLE(line1OrTLE, line2) {
    if (line2 === undefined) {
        [line1OrTLE, line2] = line1OrTLE.split('\n');
    }
    // (1) (\d{5})([US ]) (\d{2})(\d{3})([A-Z ]{1,3}) (\d{2})(\d.{11}) ([-].\d{8}) ([-+ ]\d{5}[-+ ]\d) ([-+ ]\d{5}[-+]\d) ([0-4]) ([ \d]{4})(\d)
    // e.g. 1 25544U 98067A   21294.51782528  .00000917  00000-0  23998-4 0  9991
    const regexLine1 = /^(1) (\d{5})([US ]) (\d{2})(\d{3})([A-Z ]{1,3}) (\d{2})(\d.{11}) ([-].\d{8}) ([-+ ]\d{5}[-+ ]\d) ([-+ ]\d{5}[-+]\d) ([0-4]) ([ \d]{4})(\d)$/;
    // (2) (\d{5}) ([ \d]{3}.[\d ]{4}) ([ \d]{3}.[ \d]{4}) (\d{7}) ([ \d]{3}.[\d ]{4}) ([ \d]{3}.[\d ]{4}) ([ \d]{2}.[\d ]{8})([ \d]{5})(\d)
    // e.g. 2 25544  51.6464  18.6444 0003400  74.0000 285.0000 15.48968019191477  238.0063  74
    const regexLine2 = /^(2) (\d{5}) ([ \d]{3}.[\d ]{4}) ([ \d]{3}.[ \d]{4}) (\d{7}) ([ \d]{3}.[\d ]{4}) ([ \d]{3}.[\d ]{4}) ([ \d]{2}.[\d ]{8})([ \d]{5})(\d)$/;
    const isValidLine1 = regexLine1.test(line1OrTLE);
    const isValidLine2 = regexLine2.test(line2);
    return isValidLine1 && isValidLine2;
}

export class SatelliteCesium {
    constructor(tleString, steps = 100, color = 0xff0000) {
        // split the TLE string into lines
        const tleLines = tleString.trim().split('\n');
        if (tleLines.length < 3) {
            throw new Error(`Invalid TLE data: Expected 3 lines but received ${tleLines.length}`);
        }
        // TLE Line 1 and Line 2
        this.line1 = tleLines[1].trim();
        this.line2 = tleLines[2].trim();

        // Parse the TLE into a satellite record
        this.satrec = satellitejs.twoline2satrec(this.line1, this.line2);

        this.steps = steps;
        this.color = color;
        this.orbitPoints = this.createOrbit();
    }

    createOrbit() {
        const points = [];
        const time = new Date();

        for (let i = 0; i < this.steps; i++) {
            // Propagate satellite position at the current time
            const positionEci = satellitejs.propagate(this.satrec, time);

            if (positionEci && positionEci.position) {
                // Convert ECI to Geodetic coordinates
                const gmst = satellitejs.gstime(time);
                const positionGd = satellitejs.eciToGeodetic(positionEci.position, gmst);

                const longitude = satellitejs.degreesLong(positionGd.longitude);
                const latitude = satellitejs.degreesLat(positionGd.latitude);
                const altitude = positionGd.height * 1000; // Convert km to meters

                if (isFinite(latitude) && isFinite(longitude) && isFinite(altitude)) {
                    points.push({
                        longitude,
                        latitude,
                        altitude
                    });
                } else {
                    console.warn('Invalid geodetic coordinates:', latitude, longitude, altitude);
                }
            } else {
                console.warn('Propagation failed for time:', time);
            }

            // Increment time by 1 minute for the next step
            time.setUTCSeconds(time.getUTCSeconds() + 60);
        }

        if (points.length === 0) {
            console.warn('No valid points to draw for this orbit.');
            return null;
        }

        return points;
    }
}
