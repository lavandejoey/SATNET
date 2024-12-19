// js/components/MapSatellitePoints.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {getFlagSvg} from "/js/utils/data.js";

function removeCountry(currentEntities, entityMap) {
    entityMap.forEach((entity, key) => {
        currentEntities.removeById(`country-${key}`); // Use the unique ID to remove
        entityMap.delete(key); // Remove from tracking map
    });
}

function update2DCountry(currentEntities, num_sc, entityMap) {
    removeCountry(currentEntities, entityMap);

    const country_loc = ctx.COUNTRY.DATA;
    for (let key in num_sc) {
        let loc = country_loc[key];
        if (loc) {
            const entity_id = createSatelliteRadiusEntity(currentEntities, loc, num_sc[key], key);
            entityMap.set(key, entity_id);
        }
    }
}

export function display2DCountry() {
    try {
        const currentEntities = ctx.view2D.entities;
        const entityMap = new Map(); // Track existing entities by country key

        setInterval(() => {
            update2DCountry(currentEntities, ctx.NUM_SC, entityMap);
        }, 1000);

    } catch (error) {
        console.error("Error initializing satellites:", error);
    }
}


export async function createSatelliteRadiusEntity(currentEntities, loc, size, key) {
    const stateIsoCode = ctx.COUNTRY_MAP[key]?.iso2Code || "xx";
    const imagePath = await getFlagSvg(stateIsoCode);
    const entityId = `country-${key}`; // Generate unique ID for the entity

    // Check if the entity already exists
    let existingEntity = currentEntities.getById(entityId);

    if (existingEntity) {
        // Update the existing entity's properties
        if (imagePath) {
            existingEntity.billboard = {
                image: imagePath,
                width: size,
                height: size,
                color: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
            };
        } else {
            existingEntity.point = {
                pixelSize: size,
                color: Cesium.Color.GREY.withAlpha(0.3),
                outlineColor: Cesium.Color.GREY.withAlpha(0.3),
            };
        }
        return existingEntity;
    }

    // Create a new entity if it does not exist
    if (imagePath) {
        return currentEntities.add({
            id: entityId,
            position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
            billboard: {
                image: imagePath,
                width: size,
                height: size,
                color: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
            },
        });
    } else {
        return currentEntities.add({
            id: entityId,
            position: Cesium.Cartesian3.fromDegrees(loc.Longitude, loc.Latitude),
            point: {
                pixelSize: size,
                color: Cesium.Color.GREY.withAlpha(0.3),
                outlineColor: Cesium.Color.GREY.withAlpha(0.3),
            },
        });
    }
}
