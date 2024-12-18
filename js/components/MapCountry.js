// js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import { dataUpdate } from "../utils/data";
import { update } from "three/examples/jsm/libs/tween.module.js";

// Utility function to debounce events
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function changeTime(data) {
    const inputDate = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime);
    update2DCountry(data, inputDate);
}

function update2DCountry(num_sc){
    currentEntities.removeAll();
    const country_loc = ctx.COUNTRY.DATA;
    for (var key in num_sc) {
        var loc = country_loc[key];
        const launchRadiusEntity = createSatelliteRadiusEntity(loc, newData[key]);
        if (launchRadiusEntity){
            var entity_id = currentEntities.add(launchRadiusEntity);
        }
    }
    // console
}

function init2DCountry(currentEntities){
    ctx.view3D.clock.onTick.addEventListener(() => {
        // Load the satellite
        const currentTime = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime); 
        launchDatas.forEach((launchData) => {
            const launchDate = launchData.Launch_Date; // lanch time
            const loc = launchData.loc; // longtitude and lattitude

            if (currentTime.toDateString() === launchDate.toDateString()) {
                const launchRadiusEntity = createSatelliteRadiusEntity(loc, launchDate, lifespan);
                // 5seconds remove the point
                if (launchRadiusEntity){
                    var entity_id = currentEntities.add(launchRadiusEntity);
                }
            }
        });
    });
}

export function display2DCountry() {
    try {
        const currentEntities = ctx.view2D.entities;
        currentEntities.removeAll();
        
        // init2DCountry(currentEntities);
        setInterval(() => {
            var currentDate = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime);
            update2DCountry(ctx.NUM_SC);
        }, 1000);

    } catch (error) {
        console.error('Error initializing satellites:', error);
    }
}


function createSatelliteRadiusEntity(loc, size){
    return {
        position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
        point: {
            pixelSize: size,
            color: Cesium.Color.GREY.withAlpha(0.3),
        },
    };
}


