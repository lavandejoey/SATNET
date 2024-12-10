// js/utils/constants.js

// Constants
const EARTH_RADIUS = 6378137; // in meters
// from the equator to pole 20037508.342789244
export const POLES_DISTANCE = EARTH_RADIUS * Math.PI;
// max altitude 40075016.68557849 which is the circumference of the earth
const EARTH_CIRCUMFERENCE = POLES_DISTANCE * 2;
export const CAMERA_MAX_ALTITUDE = EARTH_CIRCUMFERENCE;
export const CAMERA_MIN_ALTITUDE = EARTH_CIRCUMFERENCE / 2;
// meters per degree 111319.49079327358
export const DEGREE_TO_METER = POLES_DISTANCE / 180;
