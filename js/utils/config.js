// js/utils/config.js
import * as Cesium from 'cesium';

// Global variables dictionary
export const ctx = {
    view3D: null,
    view2D: null,
    worldPosition:null,
    cameraAltitude:null,
    canvasHeight:null
};

export const CESIUM_ACCESS_TOKEN = import.meta.env.VITE_ION_TOKEN || '';
export const CESIUM_SHARE_CLOCK = new Cesium.Clock({
    startTime: Cesium.JulianDate.fromIso8601("2000-01-01"),
    // current system time
    stopTime: Cesium.JulianDate.now(),
    clockRange: Cesium.ClockRange.LOOP_STOP, // loop when we hit the end time
    clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
    multiplier: 4000, // how much time to advance each tick
    shouldAnimate: true // Animation on by default
});

const CESIUM_SHARE_CONFIG = {
    imageryProvider: undefined,
    baseLayerPicker: false,
    terrain: undefined,
    // buttons
    infoBox: false,
    navigationHelpButton: false,
    helpButton: false,
    timeline: false,
    clockViewModel: new Cesium.ClockViewModel(CESIUM_SHARE_CLOCK),
    //
    sceneModePicker: false,
    geocoder: false,
}

export const CESIUM_3D_CONFIG = {
    ...CESIUM_SHARE_CONFIG,
    homeButton: false,
    fullscreenButton: false,
    // 3D globe and disable changing
    sceneMode: Cesium.SceneMode.SCENE3D,
    animation: true
};

export const CESIUM_2D_CONFIG = {
    ...CESIUM_SHARE_CONFIG,
    homeButton: true,
    fullscreenButton: true,
    // 2D flat mode and disable changing
    sceneMode: Cesium.SceneMode.SCENE2D,
    mapMode2D: Cesium.MapMode2D.ROTATE,
    animation: false
};