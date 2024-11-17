// /js/cesium.js
import * as Cesium from '/node_modules/cesium/Build/Cesium';
import {Cartesian3, Ion, Math as CesiumMath, Viewer} from '/node_modules/cesium/Build/Cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css'; // gotta have the styles
import {SatelliteCesium} from '/js/Satellite.js';

Ion.defaultAccessToken = import.meta.env.VITE_ION_TOKEN;
// global variables dict
const g = {
    viewer: null,
}


function initScene() {
    // setup the basic Cesium viewer
    return new Viewer('cesiumContainer', {
        imageryProvider: undefined,
        baseLayerPicker: false,
        helpButton: false,
        homeButton: true,
        timeline: true,
        terrain: Cesium.Terrain.fromWorldTerrain(),
        // default 10x animation
        clockViewModel: new Cesium.ClockViewModel(new Cesium.Clock({
            shouldAnimate: true,
            multiplier: 10,
            clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
            clockRange: Cesium.ClockRange.LOOP_STOP,
        })),
    });
}

function initCamera() {
    // default camera to Paris
    g.viewer.camera.flyTo({
        // Paris: 2.3488° E, 48.8534° N, 15e6 meters above
        destination: Cartesian3.fromDegrees(2.3488, 48.8534, 15e6),
        orientation: {
            // north
            heading: CesiumMath.toRadians(0),
            // square to earth center
            pitch: CesiumMath.toRadians(-90),
            roll: CesiumMath.toRadians(0),
        },
    });
}

function addSatelliteOrbit(tleData) {
    console.log('Adding satellite orbit:', tleData);
    const satellite = new SatelliteCesium(tleData, 10);
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
}

function loadViewer() {
    g.viewer = initScene();
    initCamera();

    // home button -> initCamera function
    g.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        initCamera();
    });

    // add satellite orbit "/data/all_orbits.json"
    // fetch('/data/all_orbits.json')
    //     .then(response => response.json())
        // only process first satellite for testing
        // .then(data => {
        //     data = data.slice(0, 1);
        //     console.log('data:', data);
        //     data.forEach(tleData => addSatelliteOrbit(tleData.norad_str));
        // })
        // .catch(error => console.error('Error fetching all_orbits.json:', error));
}

window.onload = loadViewer;