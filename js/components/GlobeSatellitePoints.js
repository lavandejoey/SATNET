// js/components/GlobeSatellitePoints.js
import * as satellite from 'satellite.js';
import * as Cesium from 'cesium';
import {ctx} from "../utils/config";
import {loadOrbitsTLE, loadStarlinkData} from "../utils/load_orbits";

export async function initializeSatellites() {
    try {
        const [satTle, starlinkData] = await Promise.all([loadOrbitsTLE(), loadStarlinkData()]);
        console.log(`Loaded ${Object.keys(satTle).length} satellites.`);
        console.log(`Loaded metadata for ${starlinkData.length} satellites.`);

        const currentEntities = ctx.view3D.entities;
        currentEntities.removeAll();
        const satrecList = {};
        Object.keys(satTle).forEach(satName => {
            const [line1, line2] = satTle[satName];
            const metadata = starlinkData.find(s => {
                if (s.spaceTrack.OBJECT_NAME === satName) {
                    return s.spaceTrack.CREATION_DATE;
                }
            });
            if (!metadata || !line1 || !line2)
                return;

            const satrec = satellite.twoline2satrec(line1, line2);
            currentEntities.add({
                name: satName,
                position: new Cesium.CallbackProperty((time, result) => {
                    const date = Cesium.JulianDate.toDate(time);

                    // Check creation date
                    if (date < new Date(metadata)) {
                        return null; // Skip rendering before creation
                    }

                    try {
                        const positionAndVelocity = satellite.propagate(satrec, date);
                        const positionEci = positionAndVelocity.position;
                        // Convert ECI coordinates to Cesium Cartesian3
                        result = eciToCartesian3(positionEci, date);
                    } catch (error) {
                        console.error("Error propagating satellite:", error);
                        return null; // Skip rendering if error
                    }

                    // return result;
                    const cameraView = ctx.view3D.camera.computeViewRectangle();
                    const cartographic = Cesium.Cartographic.fromCartesian(result);
                    const isLookingAt = Cesium.Rectangle.contains(cameraView, cartographic);
                    // Return the position if in camera view
                    return isLookingAt ? result : null;
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
                    show: true,
                },
                path: {
                    resolution: 120,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.1,
                        color: Cesium.Color.CYAN,
                    }),
                    width: 2,
                },
            });
        });
    } catch (error) {
        console.error("Error initializing satellites:", error);
    }
}


function eciToCartesian3(positionEci, date) {
    // Calculate Greenwich Mean Sidereal Time (GMST)
    const gmst = satellite.gstime(date);

    // Convert ECI to ECF (Earth-Centered Fixed)
    // const positionEcf = satellite.eciToEcf(positionEci, gmst);

    // Convert ECF to geodetic coordinates
    const geodetic = satellite.eciToGeodetic(positionEci, gmst);

    const longitude = geodetic.longitude;
    const latitude = geodetic.latitude;
    const height = geodetic.height * 1000; // Convert km to meters

    // Return Cesium Cartesian3 position
    return Cesium.Cartesian3.fromRadians(longitude, latitude, height);
}
