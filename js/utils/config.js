// js/utils/config.js
import * as Cesium from "cesium";
import * as d3 from "d3";

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

    currentSatelliteEntity: null, // Current satellite entity
    currentOrbitEntity: null, // Current orbit entity
    currentSiteEntity: null, // Current site entity

    // load json /data/StateMap.json in dictionary
    // key: {fullName iso2Code}
    COUNTRY_MAP: await d3.json("/data/StateMap.json"),

    LAUNCHLOG: {
        NAME: "LaunchLog",
        CACHE_KEY: "launchlog_cache",
        URL: "/data/launchlog.tsv", // Configurable via environment if needed
        DATA: null, // To be populated with launch log data
    },
    COUNTRY: {
        NAME: "Country",
        CACHE_KEY: "country_cache",
        URL: "/data/country.tsv",
        DATA: null,
    },
    SITES: {
        NAME: "Site",
        CACHE_KEY: "site_cache",
        URL: "/data/sites.tsv", // Configurable via environment if needed
        DATA: null, // To be populated with launch log data
    },
    NUM_SC: null,

    SAT_GROUP: {
        /****************************************** Communication Satellites ******************************************/
        STARLINK: {
            NAME: "Starlink",
            CATEGORY: "Communications",
            COLOR: Cesium.Color.ROSYBROWN,
            CACHE_KEY: "starlink_tle_cache",
            // URL: "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle",
            URL: "/data/tle/StarlinkTLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
        /******************************************* Navigation Satellites *******************************************/
        GPS: {
            NAME: "GPS Operational",
            CATEGORY: "Navigation",
            COLOR: Cesium.Color.BROWN,
            CACHE_KEY: "gps_tle_cache",
            URL: "/data/tle/GPSTLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
        GLONASS: {
            NAME: "GLONASS Operational",
            CATEGORY: "Navigation",
            COLOR: Cesium.Color.MISTYROSE,
            CACHE_KEY: "glonass_tle_cache",
            URL: "/data/tle/GLONASSTLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
        BEIDOU: {
            NAME: "Beidou",
            CATEGORY: "Navigation",
            COLOR: Cesium.Color.DARKSALMON,
            CACHE_KEY: "BEIDOU_tle_cache",
            URL: "/data/tle/beidouTLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
        GALILEO: {
            NAME: "Galileo",
            CATEGORY: "Navigation",
            COLOR: Cesium.Color.CORAL,
            CACHE_KEY: "galileo_tle_cache",
            URL: "/data/tle/GalileoTLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
        /********************************************* Weather Satellites *********************************************/
        NOAA: {
            NAME: "NOAA",
            CATEGORY: "Weather",
            COLOR: Cesium.Color.DODGERBLUE,
            CACHE_KEY: "NOAA_tle_cache",
            URL: "/data/tle/NOAATLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
        GOES: {
            NAME: "GOES",
            CATEGORY: "Weather",
            COLOR: Cesium.Color.ROYALBLUE,
            CACHE_KEY: "GOES_tle_cache",
            URL: "/data/tle/GOESTLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
    }
};

// Cesium Access Token from environment variables
export const CESIUM_ACCESS_TOKEN = import.meta.env.VITE_ION_TOKEN || 'YOUR_DEFAULT_TOKEN_HERE';

// Shared Cesium clock instance
export const CESIUM_SHARE_CLOCK = new Cesium.Clock({
    // startTime: Cesium.JulianDate.fromIso8601("1960-01-01T00:00:00Z"), // Start time
    startTime: Cesium.JulianDate.fromIso8601("2010-01-01T00:00:00Z"), // Start time
    currentTime: Cesium.JulianDate.fromIso8601("2011-11-01T00:00:00Z"), // Start time
    // currentTime: Cesium.JulianDate.fromIso8601(new Date().toISOString()),
    stopTime: Cesium.JulianDate.fromIso8601(new Date(new Date().getFullYear() + 5, 0, 1).toISOString()),
    clockRange: Cesium.ClockRange.LOOP_STOP, // Loop at the end
    clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
    multiplier: 100, // Time multiplier for clock
    shouldAnimate: true // Animation enabled by default
});

export const ionImageryProvider = await Cesium.IonImageryProvider.fromAssetId(3954);
// export const ionImageryProvider = undefined;

// Common Cesium configuration
const CESIUM_SHARE_CONFIG = {
    // imageryProvider: ionImageryProvider,
    baseLayerPicker: false,
    terrain: undefined,
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