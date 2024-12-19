// /js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";

export function display2DSites() {
    try {
        const sites = ctx.SITES.DATA;
        let entity2_id;
        for (let key in sites) {
            const loc = sites[key];
            if(loc.Longitude && loc.Latitude){
                const launchEntity = createSatelliteEntity(loc);
                if (launchEntity){
                    entity2_id = ctx.view2D.entities.add(launchEntity);
                }
            }
        }
    } catch (error) {
        console.error("Error initializing satellites:", error);
    }
}

function createSatelliteEntity(loc){
    const startRadius = 2.0;
    return {
        position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
        point: {
            pixelSize: startRadius,
            color: Cesium.Color.PALETURQUOISE.withAlpha(0.5),
            outlineColor: Cesium.Color.PALETURQUOISE.withAlpha(0.5),
            outlineWidth: 0,
        },
    }
}

