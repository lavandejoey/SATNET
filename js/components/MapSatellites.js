// /js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";

export function display2DSatellites() {
    try {
        ctx.view2D.entities.removeAll();
        const launchDatas = ctx.LAUNCHLOG.DATA;
        const lifespan = 2000;
        ctx.view3D.clock.onTick.addEventListener(() => {
            // Load the satellite
            const currentTime = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime);
            launchDatas.forEach((launchData) => {
                const launchDate = launchData.Launch_Date; // lanch time
                const loc = launchData.loc; // longtitude and lattitude

                if (currentTime.toDateString() === launchDate.toDateString()) {
                    const launchRadiusEntity = createSatelliteRadiusEntity(loc, launchDate, lifespan);
                    // 5seconds remove the point
                    if (launchRadiusEntity) {
                        var entity_id = ctx.view2D.entities.add(launchRadiusEntity);
                    }
                    setTimeout(() => {
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
            outlineColor: new Cesium.CallbackProperty((time) => {
                const elapsed = (new Date() - startTime);
                const progress = elapsed / lifespan;
                if (progress >= 1.0) return Cesium.Color.RED.withAlpha(0);
                if (progress <= 0.0) return Cesium.Color.RED.withAlpha(1);

                return Cesium.Color.RED.withAlpha(startAlpha * (1.0 - progress));
            }, false),
        },
    };
}