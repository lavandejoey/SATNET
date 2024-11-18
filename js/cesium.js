// /js/cesium.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {loadSatelliteData, SatelliteCesium} from '/js/SatelliteCesium.js';
import {init2DScene} from "./viewer2dManage";
import {init3DScene} from "./viewer3dManage";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_ION_TOKEN;

// Global variables dictionary
const g = {
    viewer3d: null,
    viewer2d: null,
};
const CESIUM_3D_CONFIG = {
    imageryProvider: undefined,
    baseLayerPicker: false,
    homeButton: true,
    helpButton: false,
    timeline: false,
    terrain: undefined,
    clockViewModel: undefined,
    sceneModePicker: false,
    navigationHelpButton: false,
};

const CESIUM_2D_CONFIG = {
    imageryProvider: undefined,
    baseLayerPicker: false,
    homeButton: false,
    helpButton: false,
    timeline: false,
    terrain: undefined,
    clockViewModel: undefined,
    sceneModePicker: false,
    navigationHelpButton: false,
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

    g.viewer3d = init3DScene(CESIUM_3D_CONFIG.imageryProvider,
        CESIUM_3D_CONFIG.baseLayerPicker,
        CESIUM_3D_CONFIG.homeButton,
        CESIUM_3D_CONFIG.helpButton,
        CESIUM_3D_CONFIG.timeline,
        CESIUM_3D_CONFIG.terrain,
        CESIUM_3D_CONFIG.clockViewModel,
        CESIUM_3D_CONFIG.sceneModePicker,
        CESIUM_3D_CONFIG.navigationHelpButton,
    );

    g.viewer2d = init2DScene(CESIUM_2D_CONFIG.imageryProvider,
        CESIUM_2D_CONFIG.baseLayerPicker,
        CESIUM_2D_CONFIG.homeButton,
        CESIUM_2D_CONFIG.helpButton,
        CESIUM_2D_CONFIG.timeline,
        CESIUM_2D_CONFIG.terrain,
        CESIUM_2D_CONFIG.clockViewModel,
        CESIUM_2D_CONFIG.sceneModePicker,
        CESIUM_2D_CONFIG.navigationHelpButton,
    );
}


window.onload = loadViewer;
