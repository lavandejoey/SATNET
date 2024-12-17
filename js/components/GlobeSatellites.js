// js/components/GlobeSatellitePoints.js
import * as satellite from "satellite.js";
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {loadOrbitsTLEDate} from "/js/utils/data";

export function handleSatelliteClick() {
    function clearSelection() {
        if (ctx.currentSatelliteEntity) {
            ctx.currentSatelliteEntity.label.show = new Cesium.CallbackProperty(() => {
                const cameraHeight = ctx.view3D.camera.positionCartographic.height;
                return cameraHeight <= 1e7; // Show labels only at closer zoom levels
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
        const infoCard = document.getElementById("satInfo");
        if (infoCard) {
            infoCard.style.display = "none";
            infoCard.innerHTML = "";
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
            if (satData && satData.SatRec) {
                // Display the satellite info in the fixed info card
                const infoCard = document.getElementById("satInfo");
                if (infoCard) {
                    infoCard.style.display = "block";
                    infoCard.innerHTML = `
                        <div class="lead">${satData.Name}</div>
                        <p>Launch Date: ${new Date(satData.Launch_Date).toUTCString()}</p>
                    `;
                }

                // Generate and display orbit
                const startTime = ctx.view3D.clock.currentTime;
                const orbitPositions = [];
                const interval = 5; // minutes
                // Generate orbit positions for 24 hours at 5-minute intervals
                for (let minutes = 0; minutes < 1440; minutes += interval) {
                    const time = Cesium.JulianDate.addMinutes(startTime, minutes, new Cesium.JulianDate());
                    const date = Cesium.JulianDate.toDate(time);

                    try {
                        const { position } = satellite.propagate(satData.SatRec, date);
                        const cartesian = eciToCartesian3(position, date);
                        if (cartesian) {
                            orbitPositions.push(cartesian);
                        }
                    } catch (error) {
                        console.warn(`Error propagating orbit for ${satelliteEntity.name}:`, error);
                    }
                }

                // Create a polyline entity to visualize the orbit
                ctx.currentOrbitEntity = ctx.view3D.entities.add({
                    name: `${satelliteEntity.name}-orbit`,
                    polyline: {
                        positions: orbitPositions,
                        width: 2,
                        material: Cesium.Color.WHITESMOKE.withAlpha(0.8),
                        clampToGround: false
                    }
                });
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

export function displaySatellites() {
    try {
        ctx.view3D.entities.removeAll();

        // Iterate over all satellite groups
        Object.entries(ctx.SAT_GROUP).forEach(([groupName, satGroup]) => {
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
    return {
        name: satData.Name,
        position: new Cesium.CallbackProperty(time => {
            const date = Cesium.JulianDate.toDate(time);

            if (date < new Date(satData.Launch_Date) || satGroup.SELECTED === false) {
                return null; // Skip rendering before launch or if not selected
            }

            try {
                const {position} = satellite.propagate(satData.SatRec, date);
                return eciToCartesian3(position, date);
            } catch (error) {
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
                return cameraHeight <= 1e7; // Show labels only at closer zoom levels
            }, false),
        },
        // Store satData in the entity's properties for later retrieval
        properties: {
            satData: new Cesium.ConstantProperty(satData)
        }
    };
}

function eciToCartesian3(positionEci, date) {
    if (!positionEci) {
        return null;
    }

    const gmst = satellite.gstime(date);
    const geodetic = satellite.eciToGeodetic(positionEci, gmst);

    return Cesium.Cartesian3.fromRadians(
        geodetic.longitude,
        geodetic.latitude,
        geodetic.height * 1000
    );
}
