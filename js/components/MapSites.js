// /js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";

export function display2DSites() {
    try {
        console.log("inininini");
        const sites = ctx.SITES.DATA;
        console.log(sites);
        let entity2_id;
        for (let key in sites) {
            const loc = sites[key];
            const launchEntity = createSatelliteEntity(loc);
            if (launchEntity){
                entity2_id = ctx.view2D.entities.add(launchEntity);
            }
        }
    } catch (error) {
        console.error("Error initializing satellites:", error);
    }
}

function createSatelliteEntity(loc){
    const startRadius = 3.0;
    return {
        position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
        point: {
            pixelSize: startRadius,
            color: Cesium.Color.BLUEVIOLET.withAlpha(0.5),
            outlineColor: Cesium.Color.BLUEVIOLET.withAlpha(0.5),
            outlineWidth: 0,
        },
    }
}

