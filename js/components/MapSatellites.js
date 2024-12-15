// js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";

export function display2DSatellites() {
    try {
        // Remove existing entities to ensure a clean slate
        ctx.view2D.entities.removeAll();

        // Add event listener only once to avoid duplication
        if (!ctx.view3D.clock.onTick._listeners.includes(handleTick)) {
            ctx.view3D.clock.onTick.addEventListener(handleTick);
        }

        function handleTick() {
            const currentTime = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime); // Current time

            ctx.LAUNCHLOG.DATA.forEach((launchData) => {
                const { Launch_Date: launchDate, loc } = launchData;

                if (currentTime.toDateString() === new Date(launchDate).toDateString()) {
                    const launchEntity = createSatelliteEntity(loc);

                    if (launchEntity) {
                        const entityId = ctx.view2D.entities.add(launchEntity);

                        // Automatically remove the entity after 1 second
                        setTimeout(() => ctx.view2D.entities.remove(entityId), 1000);
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing satellites:", error);
    }
}

function createSatelliteEntity(loc) {
    if (!loc || typeof loc.Longitude !== "number" || typeof loc.Latitude !== "number") {
        console.warn("Invalid location data:", loc);
        return null;
    }

    return {
        position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
        point: {
            pixelSize: 5,
            color: new Cesium.CallbackProperty(() => Cesium.Color.RED.withAlpha(1), false),
        },
    };
}