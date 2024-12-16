// js/components/GlobeSatellitePoints.js
import * as satellite from "satellite.js";
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {loadOrbitsTLEDate} from "/js/utils/data";

export function handleSatelliteClick() {
    function clearSelection() {
        if (ctx.currentSatelliteEntity) {
            ctx.currentSatelliteEntity.label.show = false;
            ctx.currentSatelliteEntity = null;
        }
        if (ctx.currentOrbitEntity) {
            ctx.view3D.entities.remove(ctx.currentOrbitEntity);
            ctx.currentOrbitEntity = null;
        }
    }

    function modifySelectionIndicator() {
        // Access the selection indicator's SVG path element
        const selectionIndicatorPath = document.querySelector('.cesium-selection-wrapper svg path');

        // Check if the element exists before modifying
        if (selectionIndicatorPath) {
            // Modify the SVG path's attributes
            selectionIndicatorPath.setAttribute('d', 'M -10 -10 L 10 -10 L 10 10 L -10 10 Z'); // Example path data
            selectionIndicatorPath.setAttribute('stroke-dasharray', '10, 5');
        } else {
            console.warn('Selection indicator SVG path not found.');
        }
    }

    const handler = new Cesium.ScreenSpaceEventHandler(ctx.view3D.scene.canvas);

    handler.setInputAction(async click => {
        const pickedObject = ctx.view3D.scene.pick(click.position);
        clearSelection();
        modifySelectionIndicator();
        if (Cesium.defined(pickedObject) && pickedObject.id) {
            const satelliteEntity = pickedObject.id;
            ctx.currentSatelliteEntity = satelliteEntity;

            // Show its label
            if (satelliteEntity.label) {
                satelliteEntity.label.show = true;

            }
            // Retrieve the satellite's TLE/propagation data from its properties

            const satData = satelliteEntity.properties?.satData?.getValue();
            if (satData && satData.SatRec) {
                // Generate orbit positions for a certain time span, for example 1 day
                const orbitPositions = [];
                const startTime = Cesium.JulianDate.now();
                const interval = 10;
                // Sample orbit every 10 minutes for 24 hours: 24h * 60min / 10min = 144 points
                for (let minutes = 0; minutes < 1440 + interval; minutes += interval) {
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

                // Create a polyline entity to visualize the orbit
                ctx.currentOrbitEntity = ctx.view3D.entities.add({
                    name: `${satelliteEntity.name}-orbit`,
                    polyline: {
                        positions: orbitPositions,
                        width: 2,
                        material: Cesium.Color.YELLOW,
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
                return cameraHeight < 1e7; // Show labels only at closer zoom levels
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
