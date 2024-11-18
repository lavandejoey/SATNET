// /js/SatelliteThree.js
import * as THREE from 'three';
import * as satellitejs from 'satellite.js';

export class SatelliteThree {
    constructor(tleData, steps = 500, color = 0xff0000) {
        this.tleData = tleData;
        this.steps = steps;
        this.color = color;
        this.orbit = this.createOrbit();
    }

    createOrbit() {
        const tleLines = this.tleData.split('\n');
        if (tleLines.length < 3) { // Ensure there are at least 3 lines: name, line1, line2
            console.warn('Invalid TLE data (less than 3 lines):', this.tleData);
            return null;
        }
        const tleLine1 = tleLines[1].trim(); // Second line
        const tleLine2 = tleLines[2].trim(); // Third line

        // Validate satellite.twoline2satrec exists
        if (!satellitejs.twoline2satrec) {
            console.error('satellitejs.twoline2satrec is not a function. Check satellite.js import.');
            return null;
        }

        const satrec = satellitejs.twoline2satrec(tleLine1, tleLine2);

        // Check if satrec was created successfully
        if (satrec.error !== 0) {
            console.warn(`Error parsing TLE: error code ${satrec.error}`);
            return null;
        }

        // Define points for the orbit
        const points = [];
        const now = new Date();

        for (let i = 0; i < this.steps; i++) {
            const time = new Date(now.getTime() + (i - this.steps / 2) * 60 * 1000); // +- steps/2 minutes
            const positionAndVelocity = satellitejs.propagate(satrec, time);

            if (positionAndVelocity.position) {
                const gmst = satellitejs.gstime(time);
                const positionGd = satellitejs.eciToGeodetic(positionAndVelocity.position, gmst);
                const latitude = positionGd.latitude; // Radians
                const longitude = positionGd.longitude; // Radians
                const altitude = positionGd.height; // Kilometers

                // Convert geodetic coordinates to ECEF
                const positionEcef = satellitejs.geodeticToEcf(positionGd); // Correct function name

                // Convert ECEF to Three.js coordinates
                const x = positionEcef.x;
                const y = positionEcef.z; // Swap Y and Z for Three.js
                const z = positionEcef.y;

                // Scale down to match Earth's size in Three.js (Earth radius = 5 units)
                const scale = 5 / 6371; // Earth's average radius in km
                const scaledX = x * scale;
                const scaledY = y * scale;
                const scaledZ = z * scale;

                // Check for NaN values
                if (
                    isNaN(scaledX) ||
                    isNaN(scaledY) ||
                    isNaN(scaledZ)
                ) {
                    console.warn('NaN detected in scaled coordinates:', scaledX, scaledY, scaledZ);
                    continue; // Skip adding this point
                }

                points.push(new THREE.Vector3(scaledX, scaledY, scaledZ));
            } else {
                console.warn('Position data is undefined for time:', time);
            }
        }

        // Ensure there are valid points to draw
        if (points.length === 0) {
            console.warn('No valid points to draw for this orbit.');
            return null;
        }

        // Create a line geometry from the points
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Compute bounding sphere manually to avoid NaN
        geometry.computeBoundingSphere();

        const material = new THREE.LineBasicMaterial({color: this.color});
        return new THREE.Line(geometry, material);
    }

    addToScene(scene) {
        if (this.orbit) {
            scene.add(this.orbit);
        }
    }
}

export class SatelliteCesium {
    constructor(tleData, steps = 500, color = 0xff0000) {
        this.tleData = tleData;
        this.steps = steps;
        this.color = color;
        this.orbitPoints = this.createOrbit();
    }

    createOrbit() {
        console.log('Creating orbit points for:', this.tleData);
        const tleLines = this.tleData.split('\n');
        if (tleLines.length < 3) {
            console.warn('Invalid TLE data (less than 3 lines):', this.tleData);
            return null;
        }
        const tleLine1 = tleLines[1].trim();
        const tleLine2 = tleLines[2].trim();

        const satrec = satellitejs.twoline2satrec(tleLine1, tleLine2);

        if (satrec.error !== 0) {
            console.warn(`Error parsing TLE: error code ${satrec.error}`);
            return null;
        }

        const points = [];
        const now = new Date(); // Ensure this is recent or adjust as needed

        for (let i = 0; i < this.steps; i++) {
            const time = new Date(now.getTime() + (i - this.steps / 2) * 60 * 1000);
            const positionAndVelocity = satellitejs.propagate(satrec, time);

            if (positionAndVelocity.position) {
                const gmst = satellitejs.gstime(time);
                const positionGd = satellitejs.eciToGeodetic(positionAndVelocity.position, gmst);
                const latitude = satellitejs.degreesLat(positionGd.latitude);
                const longitude = satellitejs.degreesLong(positionGd.longitude);
                const altitude = positionGd.height * 1000; // Convert km to meters

                // Validate the data before pushing
                if (isFinite(latitude) && isFinite(longitude) && isFinite(altitude) && altitude > 0) {
                    points.push({latitude, longitude, altitude});
                } else {
                    console.warn(`Invalid orbit point at time ${time.toISOString()}:`, {latitude, longitude, altitude});
                }
            } else {
                console.warn('Position data is undefined for time:', time.toISOString());
            }
        }

        if (points.length < 2) {
            console.warn('Insufficient points to draw an orbit.');
            return null;
        }

        console.log(`Generated ${points.length} valid orbit points.`);
        return points;
    }
}