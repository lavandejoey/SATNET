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

    currentSatelliteEntity: null, // Current satellite entity
    currentOrbitEntity: null, // Current orbit entity

    LAUNCHLOG: {
        NAME: "LaunchLog",
        CACHE_KEY: "launchlog_cache",
        URL: "/data/launchlog.tsv", // Configurable via environment if needed
        DATA: null, // To be populated with launch log data
    },

    SITES: {
        NAME: "Site",
        CACHE_KEY: "site_cache",
        URL: "/data/sites.tsv", // Configurable via environment if needed
        DATA: null, // To be populated with launch log data
    },

    SAT_GROUP: {
        /****************************************** Communication Satellites ******************************************/
        STARLINK: {
            NAME: "Starlink",
            CATEGORY: "Communications",
            COLOR: Cesium.Color.ORANGERED,
            CACHE_KEY: "starlink_tle_cache",
            URL: "/data/tle/StarlinkTLE.txt", // Configurable via environment if needed
            DATA: null, // To be populated with Starlink TLE data
            ENTITY: [],
            SELECTED: true,
        },
        /******************************************* Navigation Satellites *******************************************/
        BEIDOU: {
            NAME: "Beidou",
            CATEGORY: "Navigation",
            COLOR: Cesium.Color.YELLOWGREEN,
            CACHE_KEY: "BEIDOU_tle_cache",
            // URL: "https://celestrak.org/NORAD/elements/gp.php?GROUP=beidou&FORMAT=tle",
            URL: "/data/tle/beidouTLE.txt",
            DATA: null, // To be populated with BEIDOU TLE data
            ENTITY: [],
            SELECTED: true,
        },
        NOAA: {
            NAME: "NOAA",
            CATEGORY: "Weather",
            COLOR: Cesium.Color.CYAN,
            CACHE_KEY: "NOAA_tle_cache",
            // URL: "https://celestrak.org/NORAD/elements/gp.php?GROUP=noaa&FORMAT=tle",
            URL: "/data/tle/NOAATLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
        /********************************************* Weather Satellites *********************************************/
        GALILEO: {
            NAME: "Galileo",
            CATEGORY: "Navigation",
            COLOR: Cesium.Color.BLUE,
            CACHE_KEY: "galileo_tle_cache",
            // URL: "https://celestrak.org/NORAD/elements/gp.php?GROUP=galileo&FORMAT=tle",
            URL: "/data/tle/GalileoTLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        },
        /******************************************** Scientific Satellites ********************************************/
        GEODETIC: {
            NAME: "Geodetic",
            CATEGORY: "Scientific",
            COLOR: Cesium.Color.PURPLE,
            // CACHE_KEY: "geodetic_tle_cache",
            URL: "/data/tle/GeodeticTLE.txt",
            DATA: null,
            ENTITY: [],
            SELECTED: true,
        }
    },
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
    multiplier: 10, // Time multiplier for clock
    shouldAnimate: true // Animation enabled by default
});

const osm = new Cesium.OpenStreetMapImageryProvider({
    url: "https://tile.openstreetmap.org/",
    fileExtension: "png",
    maximumLevel: 18,
    credit: "OpenStreetMap contributors"
});

// Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(3954));
export const ionImageryProvider = await Cesium.IonImageryProvider.fromAssetId(3954);

// Common Cesium configuration
const CESIUM_SHARE_CONFIG = {
    // imageryProvider: ion,
    imageryProvider: ionImageryProvider,
    baseLayerPicker: false,
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
