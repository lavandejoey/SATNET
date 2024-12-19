// js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";

function removeCountry(currentEntities, arr){
    // console.log(arr);
    for (let i = 0; i < arr.length; i++) { 
        currentEntities.remove(arr[i]);   
    }
    return null;
}

function update2DCountry(currentEntities, num_sc, exist_country){
    // setTimeout(() => {
    removeCountry(currentEntities, exist_country);
    // }, 1000);
    
    const country_loc = ctx.COUNTRY.DATA;
    let arr = [];
    let entity_id;
    for (let key in num_sc) {
        let loc = country_loc[key];
        entity_id = createSatelliteRadiusEntity(currentEntities, loc, num_sc[key], key);
        arr.push(entity_id);
    }
    return arr;
}


export function display2DCountry() {
    try {
        const currentEntities = ctx.view2D.entities;
        let exist_country = [];
        setInterval(() => {
            exist_country = update2DCountry(currentEntities, ctx.NUM_SC, exist_country);
        }, 1000);

    } catch (error) {
        console.error("Error initializing satellites:", error);
    }
}


function createSatelliteRadiusEntity(currentEntities, loc, size, key){
    const imagePath = `public/img/flags/${key}.png`;
    let entity_id;


    fetch(imagePath,{ method:'HEAD' })
        .then((response) => {
            if (response.ok) {
                entity_id = currentEntities.add({
                    position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
                    billboard: {
                        image: imagePath,
                        width: size ,  // Adjust size for better visibility
                        height: size,
                        color: new Cesium.Color(1.0, 1.0, 1.0, 0.5)
                    },
                });
            } else {
                entity_id = currentEntities.add({
                    position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
                    point: {
                        pixelSize: size,
                        color: Cesium.Color.GREY.withAlpha(0.3),
                        outlineColor: Cesium.Color.GREY.withAlpha(0.3),
                    }
                });
            }
        })  
        .catch(() => {
            entity_id = currentEntities.add({
                position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
                point: {
                    pixelSize: size,
                    color: Cesium.Color.GREY.withAlpha(0.3),
                    outlineColor: Cesium.Color.GREY.withAlpha(0.3),
                }
            }); // Add default point on error
    });
    // console.log(entity_id);
    return entity_id;
}


