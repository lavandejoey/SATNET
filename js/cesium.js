// /js/cesium.js
import * as Cesium from '/node_modules/cesium/Build/Cesium';
import {Cartesian3, Ion, Math as CesiumMath, Viewer} from '/node_modules/cesium/Build/Cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {loadSatelliteData, SatelliteCesium} from '/js/SatelliteCesium.js';

Ion.defaultAccessToken = import.meta.env.VITE_ION_TOKEN;

// Global variables dictionary
const g = {
    viewer: null,
};

function initScene() {
    // Setup the basic Cesium viewer
    return new Viewer('cesiumContainer', {
        imageryProvider: undefined,
        baseLayerPicker: false,
        helpButton: false,
        homeButton: true,
        timeline: true,
        terrain: Cesium.Terrain.fromWorldTerrain(),
        // Default 10x animation
        clockViewModel: new Cesium.ClockViewModel(new Cesium.Clock({
            shouldAnimate: true,
            multiplier: 10,
            clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
            clockRange: Cesium.ClockRange.LOOP_STOP,
        })),
    });
}

function initCamera() {
    // Default camera to Paris
    g.viewer.camera.flyTo({
        // Paris: 2.3488° E, 48.8534° N, 15e6 meters above
        destination: Cartesian3.fromDegrees(2.3488, 48.8534, 15e6),
        orientation: {
            // North
            heading: CesiumMath.toRadians(0),
            // Square to earth center
            pitch: CesiumMath.toRadians(-90),
            roll: CesiumMath.toRadians(0),
        },
    });
}

function addSatelliteOrbit(tleString) {
    try {
        const satellite = new SatelliteCesium(tleString, 100); // Increased steps for smoother orbit
        const orbitPoints = satellite.orbitPoints;

        if (orbitPoints) {
            const positions = orbitPoints
                .filter(point => isFinite(point.latitude) && isFinite(point.longitude) && isFinite(point.altitude))
                .map(point => {
                    try {
                        return Cartesian3.fromDegrees(point.longitude, point.latitude, point.altitude);
                    } catch (error) {
                        console.error('Error converting to Cartesian3:', error, point);
                        return null;
                    }
                })
                .filter(pos => pos !== null); // Remove any null entries due to conversion errors

            if (positions.length < 2) {
                console.warn('Not enough valid positions to create a polyline.');
                return;
            }

            try {
                g.viewer.entities.add({
                    polyline: {
                        positions: positions,
                        width: 2,
                        material: Cesium.Color.RED,
                    },
                });
            } catch (error) {
                console.error('Error adding polyline to Cesium:', error);
            }
        } else {
            console.warn('Orbit points are null or undefined.');
        }
    } catch (error) {
        console.error('Error creating SatelliteCesium instance:', error);
    }
}

async function loadViewer() {
    g.viewer = initScene();
    initCamera();

    // Home button -> initCamera function
    g.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        initCamera();
    });

    // Add satellite orbits from "/data/all_orbits.json"
    let dataTLEs = await loadSatelliteData();
    if (Array.isArray(dataTLEs) && dataTLEs.length > 0) {
        dataTLEs.forEach(tleData => {
            // addSatelliteOrbit(tleData.tleString);
        });
    } else {
        console.warn('No valid TLE data to display.');
    }
}


window.onload = loadViewer;
