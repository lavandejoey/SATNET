// /js/cesium.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {loadSatelliteData, SatelliteCesium} from '/js/SatelliteCesium.js';
import {MapViewer} from "./components/MapViewer";
import {GlobeViewer} from "./components/GlobeViewer";
import {CESIUM_2D_CONFIG, CESIUM_3D_CONFIG} from "./utils/config";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_ION_TOKEN;

// Global variables dictionary
const g = {
    viewer3d: null,
    viewer2d: null,
};

async function loadViewer() {
    let clockViewModel = new Cesium.ClockViewModel(new Cesium.Clock({
        shouldAnimate: true,
        // default 10x animation
        multiplier: 10,
        clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER, // tick computation
        clockRange: Cesium.ClockRange.LOOP_STOP, // loop at stop
    }));
    CESIUM_2D_CONFIG.clockViewModel = CESIUM_3D_CONFIG.clockViewModel = clockViewModel;

    g.viewer3d = GlobeViewer();
    g.viewer2d = MapViewer();
}


window.onload = loadViewer;
