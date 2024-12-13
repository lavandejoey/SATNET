// js/utils/config.js
import * as Cesium from "cesium";

// Global context object to manage shared state
export const ctx = {
    view3D: null, // Cesium 3D view instance
    view2D: null, // Cesium 2D view instance
    worldPosition: null, // Current world position
    cameraAltitude: null, // Current camera altitude
    canvasHeight: null, // Canvas height
    ZOOM_THRESHOLD: 1_000_000, // Zoom threshold in meters
    curTotalSatellite: 0, // Current total satellite count

    // Satellite data configurations
    CACHE_DURATION: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds

    LAUNCHLOG: {
        NAME: "LaunchLog",
        CACHE_KEY: "launchlog_cache",
        URL: "/data/launchlog.tsv", // Configurable via environment if needed
        DATA: null, // To be populated with launch log data
    },

    SAT_GROUP: {
        STARLINK: {
            NAME: "Starlink",
            COLOR: Cesium.Color.ORANGERED,
            CACHE_KEY: "starlink_tle_cache",
            URL: "/data/starlinkTLE.txt", // Configurable via environment if needed
            DATA: null, // To be populated with Starlink TLE data
            SELECTED: true,
        },
        BEIDOU: {
            NAME: "BEIDOU",
            COLOR: Cesium.Color.YELLOWGREEN,
            CACHE_KEY: "beidou_tle_cache",
            // URL: "https://celestrak.org/NORAD/elements/gp.php?GROUP=beidou&FORMAT=tle",
            URL: "/data/beidouTLE.txt",
            DATA: null, // To be populated with BEIDOU TLE data
            SELECTED: true,
        },
    },

    SITES:{
        NAME: "Site",
        CACHE_KEY: "site_cache",
        URL: "/data/sites.tsv", // Configurable via environment if needed
        DATA: null, // To be populated with launch log data
    },
};

// Cesium Access Token from environment variables
export const CESIUM_ACCESS_TOKEN = import.meta.env.VITE_ION_TOKEN || 'YOUR_DEFAULT_TOKEN_HERE';

// Shared Cesium clock instance
export const CESIUM_SHARE_CLOCK = new Cesium.Clock({
    startTime: Cesium.JulianDate.fromIso8601("2019-11-10"),
    // Current system time as stop time
    stopTime: Cesium.JulianDate.now(),
    clockRange: Cesium.ClockRange.LOOP_STOP, // Loop at the end
    clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
    multiplier: 10, // Time multiplier for clock
    shouldAnimate: true // Animation enabled by default
});

// Common Cesium configuration
const CESIUM_SHARE_CONFIG = {
    imageryProvider: undefined, // Can be set to a default imagery provider
    baseLayerPicker: false,
    terrain: undefined, // Can be set to a default terrain provider
    infoBox: false,
    navigationHelpButton: false,
    helpButton: false,
    clockViewModel: new Cesium.ClockViewModel(CESIUM_SHARE_CLOCK),
    timeline: false,
    animation: false,
    sceneModePicker: false,
    geocoder: false,
};

// 3D Cesium Viewer Configuration
export const CESIUM_3D_CONFIG = {
    ...CESIUM_SHARE_CONFIG,
    homeButton: false,
    fullscreenButton: false,
    sceneMode: Cesium.SceneMode.SCENE3D, // Fixed to 3D mode
};

// 2D Cesium Viewer Configuration
export const CESIUM_2D_CONFIG = {
    ...CESIUM_SHARE_CONFIG,
    homeButton: false,
    fullscreenButton: false,
    sceneMode: Cesium.SceneMode.SCENE2D, // Fixed to 2D mode
    // mapMode2D: Cesium.MapMode2D.ROTATE,
};
