// js/components/GlobeSatellitePoints.js
import * as satellite from 'satellite.js';
import * as Cesium from 'cesium';
import {ctx} from '../utils/config';
import {loadOrbitsTLE, loadStarlinkData} from '../utils/load_orbits';

export async function initializeSatellites() {
    try {
        const [satTle, starlinkData] = await Promise.all([loadOrbitsTLE(), loadStarlinkData()]);
        console.log(`Loaded ${Object.keys(satTle).length} satellites.`);
        console.log(`Loaded metadata for ${starlinkData.length} satellites.`);

        let currentEntities = ctx.view3D.entities;
        currentEntities.removeAll();

        let totalSatellites = 0;

        Object.keys(satTle).forEach(satName => {
            const [line1, line2] = satTle[satName];
            const metadata = starlinkData.find(s => s.spaceTrack.OBJECT_NAME === satName);
            if (!metadata || !line1 || !line2) return;

            const satrec = satellite.twoline2satrec(line1, line2);
            currentEntities.add(createSatelliteEntity(satName, satrec, metadata));
            totalSatellites++;
        });

    } catch (error) {
        console.error('Error initializing satellites:', error);
    }
}

function createSatelliteEntity(satName, satrec, metadata) {
    return {
        name: satName,
        position: new Cesium.CallbackProperty((time) => {
            const date = Cesium.JulianDate.toDate(time);

            if (date < new Date(metadata.spaceTrack.LAUNCH_DATE)) {
                return null; // Skip rendering before launch
            }

            try {
                const positionAndVelocity = satellite.propagate(satrec, date);
                const positionEci = positionAndVelocity.position;
                return eciToCartesian3(positionEci, date);
            } catch (error) {
                return null; // Skip rendering if error
            }
        }, false),
        point: {
            pixelSize: 5,
            color: Cesium.Color.LIGHTCORAL,
            heightReference: Cesium.HeightReference.NONE,
        },
        label: {
            text: satName,
            font: '10px sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            show: new Cesium.CallbackProperty(() => {
                const cameraHeight = ctx.view3D.camera.positionCartographic.height;
                return cameraHeight < 1e7; // Show label below 10,000,000 meters
            }, false),
        },
        path: {
            resolution: 120,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: Cesium.Color.CYAN,
            }),
            width: 2,
        },
    };
}

function eciToCartesian3(positionEci, date) {
    const gmst = satellite.gstime(date);
    const geodetic = satellite.eciToGeodetic(positionEci, gmst);

    return Cesium.Cartesian3.fromRadians(geodetic.longitude, geodetic.latitude, geodetic.height * 1000);
}
