// js/utils/constants.js

// Constants
export const EARTH_RADIUS_METERS = 6378137; // in meters
// from the equator to pole 20037508.342789244
export const POLE_DISTANCE_METERS = EARTH_RADIUS_METERS * Math.PI;
// max altitude 40075016.68557849 which is the circumference of the earth
const EARTH_CIRCUMFERENCE_METERS = POLE_DISTANCE_METERS * 2;

export const CAMERA_MAX_ALTITUDE = EARTH_CIRCUMFERENCE_METERS;
export const CAMERA_MIN_ALTITUDE = EARTH_CIRCUMFERENCE_METERS / 2;

// Unit conversion constants
// meters per degree 111319.49079327358
export const DEGREE_TO_METER = POLE_DISTANCE_METERS / 180;

export const ORBIT_TYPES = {
    LEO: {
        id: "LEO",
        name: "Low Earth Orbit (LEO)",
        maxAltitude: 2000e3, // <2000 km
        period: 120 // Period in minutes (2 hours)
    },
    MEO: {
        id: "MEO",
        name: "Medium Earth Orbit (MEO)",
        minAltitude: 2000e3, // >=2000 km
        maxAltitude: 3000e4, // <30000 km
        period: 360 // Period in minutes (6 hours)
    },
    GEO: {
        id: "GEO",
        name: "Geostationary Orbit (GEO)",
        minAltitude: 3000e4, // >=30000 km
        maxAltitude: 3600e4, // <36000 km
        period: 1440 // Period in minutes (24 hours)
    },
    HEO: {
        id: "HEO",
        name: "Highly Elliptical Orbit (HEO)",
        minAltitude: 3600e4, // >=36000 km
        period: 2880 // Period in minutes (48 hours)
    },
    SSO: {
        id: "SSO",
        name: "Sun-Synchronous Orbit (SSO)",
        inclMin: 97.0, // Inclination range in degrees
        inclMax: 102.0,
        period: 120 // Period in minutes (often same as LEO)
    },
    UNKNOWN: {
        id: "UNKNOWN",
        name: "Unknown Orbit",
        period: 120
    }
};
