// js/utils/constants.js

// Constants
const EARTH_RADIUS_METERS = 6378137; // in meters
// from the equator to pole 20037508.342789244
export const POLE_DISTANCE_METERS = EARTH_RADIUS_METERS * Math.PI;
// max altitude 40075016.68557849 which is the circumference of the earth
const EARTH_CIRCUMFERENCE_METERS = POLE_DISTANCE_METERS * 2;

export const CAMERA_MAX_ALTITUDE = EARTH_CIRCUMFERENCE_METERS;
export const CAMERA_MIN_ALTITUDE = EARTH_CIRCUMFERENCE_METERS / 2;

// Unit conversion constants
// meters per degree 111319.49079327358
export const DEGREE_TO_METER = POLE_DISTANCE_METERS / 180;