// js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {loadOrbitsTLEDate} from "/js/utils/data";

export function display2DSatellites() {
    try {
        const currentEntities = ctx.view2D.entities;
        currentEntities.removeAll();
        const launchDatas = data_preproceess(ctx.LAUNCHLOG.DATA, ctx.SITES.DATA);
        ctx.view3D.clock.onTick.addEventListener(() => {
            // Load the satellite
            const currentTime = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime); // 当前时间
            launchDatas.forEach((launchData) => {
                const launchDate = launchData.Launch_Date; // lanch time
                const loc = launchData.loc; // longtitude and lattitude

                if (currentTime.toDateString() === launchDate.toDateString()) {
                    const launchEntity = createSatelliteEntity(loc, launchDate);
                    // 5seconds remove the point
                    if (launchEntity){
                        var entity_id = currentEntities.add(launchEntity);
                    }
                    setTimeout(() => {
                        if (entity_id){
                            currentEntities.remove(entity_id);
                        }
                    }, 1000);
                }
            });
        });
        

    } catch (error) {
        console.error('Error initializing satellites:', error);
    }
}

function createSatelliteEntity(loc, launchDate){
    return {
        position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
        point: {
            pixelSize: 5,
            color: new Cesium.CallbackProperty((time) => {
                // alpha
                const alpha = 1;
                return Cesium.Color.RED.withAlpha(alpha);
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

