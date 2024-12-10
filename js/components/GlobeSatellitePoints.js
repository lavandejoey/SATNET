// js/components/GlobeSatellitePoints.js
import * as satellite from "satellite.js";
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {loadOrbitsTLEDate} from "/js/utils/data";

export async function displaySatellites(satGroup = ctx.SAT_GROUP.STARLINK) {
    try {
        await loadOrbitsTLEDate("STARLINK");
        const currentEntities = ctx.view3D.entities;
        currentEntities.removeAll();

        let totalSatellites = 0;

        satGroup.DATA.forEach(satDate => {
            currentEntities.add(createSatelliteEntity(satDate));
            totalSatellites++;
        });

        console.log(`Total satellites: ${totalSatellites}`);

    } catch (error) {
        console.error('Error initializing satellites:', error);
    }
}

function createSatelliteEntity(satDate) {
    return {
        name: satDate.Name,
        position: new Cesium.CallbackProperty((time) => {
            const date = Cesium.JulianDate.toDate(time);

            if (date < new Date(satDate.Launch_Date)) {
                return null; // Skip rendering before launch
            }

            try {
                const positionAndVelocity = satellite.propagate(satDate.SatRec, date);
                const positionEci = positionAndVelocity.position;
                return eciToCartesian3(positionEci, date);
            } catch (error) {
                return null; // Skip rendering if error
            }
        }, false),
        point: {
            pixelSize: 5,
            color: satDate.COLOR,
            heightReference: Cesium.HeightReference.NONE,
        },
        label: {
            text: satDate.Name,
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
