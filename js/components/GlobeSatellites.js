// js/components/GlobeSatellitePoints.js
import * as satellite from "satellite.js";
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {loadOrbitsTLEDate} from "/js/utils/data";

export function displaySatellites() {
    try {
        const currentEntities = ctx.view3D.entities;
        currentEntities.removeAll();

        // Load the satellite
        for (let satGroup of Object.values(ctx.SAT_GROUP)) {
            loadOrbitsTLEDate(satGroup).then(() => {
                console.log(`${satGroup.DATA.length} satellites for ${satGroup.NAME} loaded`);

                satGroup.DATA.forEach(satDate => {
                    const satelliteEntity = createSatelliteEntity(satGroup, satDate);
                    if (satelliteEntity) {
                        currentEntities.add(satelliteEntity);
                    }
                });
            });
        }

    } catch (error) {
        console.error('Error initializing satellites:', error);
    }
}

function createSatelliteEntity(satGroup, satData) {
    return {
        name: satData.Name,
        position: new Cesium.CallbackProperty((time) => {
            const date = Cesium.JulianDate.toDate(time);

            if (date < new Date(satData.Launch_Date)) {
                return null; // Skip rendering before launch
            }

            try {
                const positionAndVelocity = satellite.propagate(satData.SatRec, date);
                const positionEci = positionAndVelocity.position;
                return eciToCartesian3(positionEci, date);
            } catch (error) {
                return null; // Skip rendering if error
            }
        }, false),
        point: {
            pixelSize: 5,
            color: satGroup.COLOR,
            heightReference: Cesium.HeightReference.NONE,
        },
        label: {
            text: satData.Name,
            font: '10px sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            show: new Cesium.CallbackProperty(() => {
                const cameraHeight = ctx.view3D.camera.positionCartographic.height; // Camera height in meters
                // Show label if the camera height is below 10,000,000 meters OR the satellite is above 100,000 meters
                return cameraHeight < 1e7;
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
