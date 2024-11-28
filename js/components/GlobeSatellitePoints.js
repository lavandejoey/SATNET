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
                    return s.spaceTrack.LAUNCH_DATE;
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
                    if (date < new Date(metadata.spaceTrack.LAUNCH_DATE)) {
                        return null; // Skip rendering before creation
                    }

                    console.log("Propagating satellite:", satName, date, "(metadata)", metadata.spaceTrack.LAUNCH_DATE);

                    try {
                        const positionAndVelocity = satellite.propagate(satrec, date);
                        const positionEci = positionAndVelocity.position;
                        // Convert ECI coordinates to Cesium Cartesian3
                        result = eciToCartesian3(positionEci, date);
                    } catch (error) {
                        console.error("Error propagating satellite:", error);
                        return null; // Skip rendering if error
                    }

                    const scene = ctx.view3D.scene;
                    const camera = scene.camera;

                    // Step 1: Check if the satellite is in front of the camera.
                    const cameraPosition = camera.positionWC; // Camera position in world coordinates
                    const cameraDirection = camera.directionWC; // Normalized camera direction vector
                    const toSatellite = Cesium.Cartesian3.subtract(result, cameraPosition, new Cesium.Cartesian3());
                    Cesium.Cartesian3.normalize(toSatellite, toSatellite);

                    const dotProduct = Cesium.Cartesian3.dot(toSatellite, cameraDirection);
                    if (dotProduct < 0) {
                        // Satellite is behind the camera
                        return null;
                    }

                    // Step 2: Check if the satellite is within the camera's frustum.
                    const cullingVolume = camera.frustum.computeCullingVolume(cameraPosition, camera.directionWC, camera.upWC);
                    const boundingSphere = new Cesium.BoundingSphere(result, 0); // Satellite is a point
                    const visibility = cullingVolume.computeVisibility(boundingSphere);
                    if (visibility === Cesium.Intersect.OUTSIDE) {
                        // Satellite is outside the camera's frustum
                        return null;
                    }

                    // Step 3: Check if the satellite is occluded by the globe.
                    const globe = scene.globe;
                    const ellipsoid = globe.ellipsoid;
                    const ray = new Cesium.Ray(cameraPosition, toSatellite);
                    const intersection = Cesium.IntersectionTests.rayEllipsoid(ray, ellipsoid);
                    if (Cesium.defined(intersection)) {
                        const intersectionPoint = Cesium.Ray.getPoint(ray, intersection.start);
                        const distanceToIntersection = Cesium.Cartesian3.distance(cameraPosition, intersectionPoint);
                        const distanceToSatellite = Cesium.Cartesian3.distance(cameraPosition, result);
                        if (distanceToIntersection < distanceToSatellite) {
                            // The globe occludes the satellite
                            return null;
                        }
                    }

                    return result;

                    // // return result;
                    // const cameraView = ctx.view3D.camera.computeViewRectangle();
                    // const cartographic = Cesium.Cartographic.fromCartesian(result);
                    // const isLookingAt = Cesium.Rectangle.contains(cameraView, cartographic);
                    // Return the position if in camera view
                    // return isLookingAt ? result : null;
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
                        const threshold = 1e7; // 10,000,000 meters (adjust as needed)
                        return cameraHeight < threshold;
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
