// js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {loadOrbitsTLEDate} from "/js/utils/data";

export function display2DSatellites() {
    try {
        const currentEntities = ctx.view2D.entities;
        currentEntities.removeAll();
        const launchDatas = data_preproceess(ctx.LAUNCHLOG.DATA, ctx.SITES.DATA);
        const lifespan = 2000;
        ctx.view3D.clock.onTick.addEventListener(() => {
            // Load the satellite
            const currentTime = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime); 
            launchDatas.forEach((launchData) => {
                const launchDate = launchData.Launch_Date; // lanch time
                const loc = launchData.loc; // longtitude and lattitude

                if (currentTime.toDateString() === launchDate.toDateString()) {
                    const launchRadiusEntity = createSatelliteRadiusEntity(loc, launchDate, lifespan);
                    // const launchEntity = createSatelliteEntity(loc);
                    // 5seconds remove the point
                    if (launchRadiusEntity){
                        var entity_id = currentEntities.add(launchRadiusEntity);
                    }
                    // if (launchEntity){
                    //     var entity2_id = currentEntities.add(launchEntity);
                    // }
                    setTimeout(() => {
                        // if (entity2_id){
                        //     currentEntities.remove(entity2_id);
                        // }
                        if (entity_id){
                            currentEntities.remove(entity_id);
                        }
                    }, lifespan);
                }
            });
        });
        

    } catch (error) {
        console.error('Error initializing satellites:', error);
    }
}

// function createSatelliteEntity(loc){
//     const startRadius = 5.0;
//     return {
//         position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
//         point: {
//             pixelSize: startRadius,
//             color: Cesium.Color.RED,
//             outlineColor: Cesium.Color.RED,
//             outlineWidth: 0,
//         },
//     }
// }

function createSatelliteRadiusEntity(loc, launchDate, lifespan){
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
            color: new Cesium.CallbackProperty((time) => {
                const elapsed = (new Date() - startTime);
                const progress = elapsed / lifespan;
                if (progress>=1.0) return Cesium.Color.RED.withAlpha(0);
                if (progress<=0.0) return Cesium.Color.RED.withAlpha(1);
                // return Cesium.Color.RED.withAlpha(0.1);
                return Cesium.Color.RED.withAlpha(startAlpha * (1.0 - progress));
            }, false),
        },
    };
}

function data_preproceess(data, siteData){
    try{
        // const oneYearAgo = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        // const launchDatas = data.filter(d => d.Launch_Date >= oneYearAgo && d.Launch_Date <= currentDate);
        const launchDatas = data;
        launchDatas.forEach(satData => {
            // const launchDate = satData.Launch_Date;
            const launchSite = satData.Launch_Site;
            const map_loc = siteData[launchSite];
            if (map_loc){
                satData['loc'] = map_loc;
            }
            else{
                console.log(launchSite);
            }
        });
        return launchDatas;
    } catch(error) {
        console.error('Error preprocessing datas:', error);
    }
}

