// js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";

function update2DCountry(currentEntities, num_sc){
    currentEntities.removeAll();
    const country_loc = ctx.COUNTRY.DATA;
    for (let key in num_sc) {
        let loc = country_loc[key];
        const launchRadiusEntity = createSatelliteRadiusEntity(loc, num_sc[key]);
        if (launchRadiusEntity){
            let entity_id = currentEntities.add(launchRadiusEntity);
        }
    }
}


export function display2DCountry() {
    try {
        const currentEntities = ctx.view2D.entities;
        // ctx.currentSiteEntity.removeAll();
        currentEntities.removeAll();
        
        setInterval(() => {
            update2DCountry(currentEntities, ctx.NUM_SC);
        }, 1000);

    } catch (error) {
        console.error("Error initializing satellites:", error);
    }
}


function createSatelliteRadiusEntity(loc, size){
    return {
        position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
        point: {
            pixelSize: size,
            color: Cesium.Color.GREY.withAlpha(0.3),
            outlineColor: Cesium.Color.GREY.withAlpha(0.3),
        },
    };
}


