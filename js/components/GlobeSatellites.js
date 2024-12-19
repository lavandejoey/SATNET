// js/components/GlobeSatellitePoints.js
import * as satellite from "satellite.js";
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {loadOrbitsTLEDate} from "/js/utils/data";
import {ORBIT_TYPES} from "/js/utils/constants.js";

let updateInterval = null;

export function handleSatelliteClick() {
    // Cache DOM elements outside the handler
    const infoCard = document.getElementById("satInfo");

    function clearSelection() {
        if (ctx.currentSatelliteEntity) {
            const satData = ctx.currentSatelliteEntity.properties?.satData?.getValue();
            ctx.currentSatelliteEntity.label.show = new Cesium.CallbackProperty(() => {
                const cameraHeight = ctx.view3D.camera.positionCartographic.height;
                return cameraHeight - satData.Orbit_Altitude <= 1e4;
            }, false);
            ctx.currentSatelliteEntity.outlineColor = undefined;
            ctx.currentSatelliteEntity = null;
        }

        // Remove previous orbit entity
        if (ctx.currentOrbitEntity) {
            ctx.view3D.entities.remove(ctx.currentOrbitEntity);
            ctx.currentOrbitEntity = null;
        }

        // Hide info card
        if (infoCard) {
            infoCard.style.display = "none";
            infoCard.innerHTML = "";
        }

        // Clear any existing interval
        if (updateInterval) {
            updateInterval = null;
        }
    }

    const handler = new Cesium.ScreenSpaceEventHandler(ctx.view3D.scene.canvas);

    handler.setInputAction(async click => {
        const pickedObject = ctx.view3D.scene.pick(click.position);
        clearSelection();
        if (Cesium.defined(pickedObject) && pickedObject.id) {
            const satelliteEntity = pickedObject.id;
            ctx.currentSatelliteEntity = satelliteEntity;

            // Instead of showing the label on the globe, hide it
            ctx.currentSatelliteEntity.label.show = false;
            ctx.currentSatelliteEntity.outlineColor = Cesium.Color.WHITE;

            // Retrieve the satellite's TLE/propagation data
            const satData = satelliteEntity.properties?.satData?.getValue();

            if (satData && satData.SatRec && satData.Orbit_Type) {
                // Display the satellite info in the fixed info card
                const stateName = ctx.COUNTRY_MAP[satData.Launch_State]?.fullName || "Unknown";
                const stateCode = ctx.COUNTRY_MAP[satData.Launch_State]?.iso2Code || "XX";
                if (infoCard) {
                    infoCard.style.display = "block";
                    infoCard.innerHTML = `
                    <div class="lead">${satData.Name}</div>
                    <p class="mx-0 my-1 y-0">By: ${stateName}&nbsp;&nbsp;<img src="https://hatscripts.github.io/circle-flags/flags/${stateCode.toLowerCase()}.svg" width="18px" alt=""></p>
                    <p class="mx-0 my-1 y-0">From: ${new Date(satData.Launch_Date).toUTCString().slice(5, 16)}</p>
                    <p class="mx-0 my-1 y-0">Type: ${ORBIT_TYPES[satData.Orbit_Type]?.name || "Unknown"}</p>
                    <p class="mx-0 my-1 y-0">
                        <span>Alt: ${(satData.Orbit_Altitude / 1e3).toFixed(0)} km</span>&nbsp;&nbsp;
                        <span id="velo">Velocity: N/A km/s</span>
                    </p>
                    <p id="position" class="mx-0 my-1 y-0">Position: N/A, N/A</p>
                    `;
                }
                // Generate and display orbit
                generateOrbit(satData, satelliteEntity);

                // Use Cesium's clock tick for updates
                updateInterval = () => updateSatelliteInfo(satelliteEntity);
                ctx.view3D.clock.onTick.addEventListener(updateInterval);
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function generateOrbit(satData, satelliteEntity) {
    const startTime = ctx.view3D.clock.currentTime;
    const orbitPositions = [];
    const interval = 5; // Sampling interval in minutes

    try {
        const initialDate = Cesium.JulianDate.toDate(startTime);
        const {position} = satellite.propagate(satData.SatRec, initialDate);
        const cartesian = eciToCartesian3(position, initialDate);

        const orbitLength = ORBIT_TYPES[satData.Orbit_Type]?.period || 90; // Default to 90 minutes if undefined
        if (cartesian) {
            // Generate orbit positions for the calculated orbit length
            for (let minutes = 0; minutes < orbitLength; minutes += interval) {
                const time = Cesium.JulianDate.addMinutes(startTime, minutes, new Cesium.JulianDate());
                const date = Cesium.JulianDate.toDate(time);

                try {
                    const {position} = satellite.propagate(satData.SatRec, date);
                    const cartesian = eciToCartesian3(position, date);
                    if (cartesian) {
                        orbitPositions.push(cartesian);
                    }
                } catch (error) {
                    console.warn(`Error propagating orbit for ${satelliteEntity.name}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error calculating initial altitude:", error);
    }

    // Add the orbit as a glowing polyline
    if (orbitPositions.length > 0) {
        ctx.currentOrbitEntity = ctx.view3D.entities.add({
            id: "orbit",
            name: `${satelliteEntity.name}-orbit`,
            polyline: {
                positions: orbitPositions.reverse(),
                width: 2,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.3,
                    color: Cesium.Color.ALICEBLUE.withAlpha(0.8),
                    taperPower: 0.5
                }),
                clampToGround: false
            }
        });
    } else {
        console.warn("No orbit positions generated.");
    }
}

function updateSatelliteInfo(satelliteEntity) {
    const dynamicValues = satelliteEntity.properties?.dynamic.getValue(ctx.view3D.clock.currentTime);

    if (!dynamicValues || dynamicValues.some(value => value === null)) {
        console.warn(`Dynamic values missing for satellite ${satelliteEntity.name}`);
        return;
    }

    const [speed, longitude, latitude] = dynamicValues;

    // Ensure that speed is a number before calling toFixed
    const speedFormatted = typeof speed === 'number' ? speed.toFixed(2) : 'N/A';

    // Format latitude and longitude in xx°xx'xx'' with N/S and E/W
    function formatCoordinate(coordinate, isLatitude) {
        if (typeof coordinate !== 'number') return 'N/A';

        const degrees = Math.floor(Math.abs(coordinate)).toString().padStart(2, '0');
        const minutesFull = (Math.abs(coordinate) - degrees) * 60;
        const minutes = Math.floor(minutesFull).toString().padStart(2, '0');
        const seconds = Math.round((minutesFull - minutes) * 60).toString().padStart(2, '0');

        const direction = isLatitude
            ? coordinate >= 0 ? 'N' : 'S'
            : coordinate >= 0 ? 'E' : 'W';

        return `${degrees}°${minutes}'${seconds}'' ${direction}`;
    }

    const latitudeFormatted = formatCoordinate(latitude, true);
    const longitudeFormatted = formatCoordinate(longitude, false);

    // Use Document Fragments or update all at once if multiple elements
    const velo = document.getElementById("velo");
    const position = document.getElementById("position"); // Combine long and lat into one element

    if (velo && position) {
        velo.textContent = `Velocity: ${speedFormatted} km/s`;
        position.textContent = `Position: ${latitudeFormatted}, ${longitudeFormatted}`;
    }
}

export function displaySatellites() {
    try {
        ctx.view3D.entities.removeAll();

        // Iterate over all satellite groups
        Object.entries(ctx.SAT_GROUP).forEach(([, satGroup]) => {
            satGroup.ENTITY = []; // Initialize storage for this group's entities

            if (!satGroup.SELECTED) {
                return; // Skip rendering if the group is not selected
            }

            loadOrbitsTLEDate(satGroup)
                .then(() => {
                    console.log(`${satGroup.DATA.length} satellites for ${satGroup.NAME} loaded`);

                    satGroup.DATA.forEach(satData => {
                        const satelliteEntity = createSatelliteEntity(satGroup, satData);
                        if (satelliteEntity) {
                            ctx.view3D.entities.add(satelliteEntity);
                            satGroup.ENTITY.push(satelliteEntity.name);
                        }
                    });
                }).catch(error => {
                console.error(`Failed to load satellite data for group ${satGroup.NAME}:`, error);
            });
        });
    } catch (error) {
        console.error("Error initializing satellites:", error);
    }
}

function createSatelliteEntity(satGroup, satData) {
    // Precompute static values
    const launchDate = new Date(satData.Launch_Date);

    (satData.Orbit_Altitude / 1e3).toFixed(0);

    return {
        name: satData.Name,
        position: new Cesium.CallbackProperty(time => {
            const date = Cesium.JulianDate.toDate(time);

            if (date < launchDate || !satGroup.SELECTED) {
                return null; // Skip rendering before launch or if not selected
            }

            try {
                const {position} = satellite.propagate(satData.SatRec, date);
                return eciToCartesian3(position, date);
            } catch (error) {
                console.error(`Error propagating position for ${satData.Name}:`, error);
                return null;
            }
        }, false),
        point: {
            pixelSize: 5,
            color: satGroup.COLOR,
            heightReference: Cesium.HeightReference.NONE,
        },
        label: {
            text: satData.Name,
            font: "10px sans-serif",
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            show: new Cesium.CallbackProperty(() => {
                const cameraHeight = ctx.view3D.camera.positionCartographic.height;
                return (cameraHeight - satData.Orbit_Altitude) <= 1e4;
            }, false),
        },
        properties: {
            satData: new Cesium.ConstantProperty(satData),
            dynamic: new Cesium.CallbackProperty(() => {
                try {
                    const date = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime);
                    const {position, velocity} = satellite.propagate(satData.SatRec, date);
                    const gmst = satellite.gstime(date);
                    const geodetic = satellite.eciToGeodetic(position, gmst);

                    if (!velocity || !geodetic) {
                        return [null, null, null];
                    }

                    // Calculate speed (magnitude of velocity vector)
                    const speed = calculateSpeed(velocity);

                    // Convert longitude and latitude from radians to degrees
                    const longitudeDeg = Cesium.Math.toDegrees(geodetic.longitude);
                    const latitudeDeg = Cesium.Math.toDegrees(geodetic.latitude);

                    return [speed, longitudeDeg, latitudeDeg];
                } catch (error) {
                    console.error(`Error in dynamic property for ${satData.Name}:`, error);
                    return [null, null, null];
                }
            }, false),
        }
    };
}

function calculateSpeed(velocity) {
    if (Array.isArray(velocity)) {
        return Math.sqrt(
            Math.pow(velocity[0], 2) +
            Math.pow(velocity[1], 2) +
            Math.pow(velocity[2], 2)
        );
    } else if (velocity.x !== undefined && velocity.y !== undefined && velocity.z !== undefined) {
        return Math.sqrt(
            Math.pow(velocity.x, 2) +
            Math.pow(velocity.y, 2) +
            Math.pow(velocity.z, 2)
        );
    } else {
        console.warn(`Unknown velocity format`);
        return null;
    }
}

function eciToCartesian3(positionEci, date) {
    if (!positionEci) {
        return null;
    }

    // Cache gmst if multiple satellites use the same date
    if (!eciToCartesianCache[date.getTime()]) {
        eciToCartesianCache[date.getTime()] = satellite.gstime(date);
    }
    const gmst = eciToCartesianCache[date.getTime()];

    const geodetic = satellite.eciToGeodetic(positionEci, gmst);

    return Cesium.Cartesian3.fromRadians(
        geodetic.longitude,
        geodetic.latitude,
        geodetic.height * 1000
    );
}

// Initialize cache
const eciToCartesianCache = {};
