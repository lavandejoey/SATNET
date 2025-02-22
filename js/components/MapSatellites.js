// /js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import { color } from "d3";

export function display2DSatellites() {
    try {
        const launchDatas = ctx.LAUNCHLOG.DATA;
        const lifespan = 2000;
        ctx.view3D.clock.onTick.addEventListener(() => {
            // Load the satellite
            const currentTime = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime);
            launchDatas.forEach((launchData) => {
                const launchDate = launchData.Launch_Date; // lanch time
                const loc = launchData.loc; // longtitude and lattitude

                // Check if the location is valid
                if (!loc || !launchDate) {
                    console.error("Invalid location or launch dateon for", launchData, loc, launchDate);
                    return;
                }

                if (currentTime.toDateString() === launchDate.toDateString()) {
                    const launchRadiusEntity = createSatelliteRadiusEntity(loc, launchDate, lifespan);
                    const launchEntity = createSatelliteEntity(loc);
                    let entity_id, entity2_id;
                    // 5seconds remove the point
                    if (launchRadiusEntity) {
                        entity_id = ctx.view2D.entities.add(launchRadiusEntity);
                    }
                    if (launchEntity){
                        entity2_id = ctx.view2D.entities.add(launchEntity);
                    }
                    setTimeout(() => {
                        if (entity2_id){
                            ctx.view2D.entities.remove(entity2_id);
                        }
                        if (entity_id) {
                            ctx.view2D.entities.remove(entity_id);
                        }
                    }, lifespan);
                }
            });
        });
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
            color: Cesium.Color.RED.withAlpha(0.5),
            outlineColor: Cesium.Color.RED.withAlpha(0.5),
            outlineWidth: 0,
        },
    }
}

function createSatelliteRadiusEntity(loc, launchDate, lifespan) {
    const startRadius = 5.0;
    const maxRadius = 60.0;
    const startAlpha = 0.1;
    const startTime = new Date();
    return {
        position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
        point: {
            pixelSize: new Cesium.CallbackProperty((time) => {
                const elapsed = (new Date() - startTime);
                const progress = elapsed / lifespan;

                if (progress >= 1) return 0;
                if (progress <= 0.0) return startRadius;
                return startRadius + progress * (maxRadius - startRadius);
            }, false),
            color: Cesium.Color.TRANSPARENT,
            outlineColor: Cesium.Color.RED.withAlpha(0.8),
            // outlineColor: Cesium.Color.TRANSPARENT,
            // color: new Cesium.CallbackProperty((time) => {
            //     const elapsed = (new Date() - startTime);
            //     const progress = elapsed / lifespan;
            //     if (progress >= 1.0) return Cesium.Color.RED.withAlpha(0);
            //     if (progress <= 0.0) return Cesium.Color.RED.withAlpha(1);
            //     // return Cesium.Color.RED.withAlpha(0.1);
            //     return Cesium.Color.RED.withAlpha(startAlpha * (progress));
            // }, false),
        },
    };
}