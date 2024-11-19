// js/utils/camera.js
import {Cartesian3, Math as CesiumMath} from "cesium";

export const initCamera = (viewer, cameraConfig) => {
    viewer.camera.flyTo({
        destination: cameraConfig.destination,
        orientation: cameraConfig.orientation,
    });
};

export const INITIAL_CAMERA_3D = {
    // Paris as home
    destination: Cartesian3.fromDegrees(2.3488, 48.8534, 15e6), // Paris
    orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: CesiumMath.toRadians(0),
    },
};

// export const INITIAL_CAMERA_2D = {
//     destination: Cartesian3.fromDegrees(0, 0, 5e7), // Equatorial line
//     orientation: {
//         heading: CesiumMath.toRadians(0),
//         pitch: CesiumMath.toRadians(-90),
//         roll: CesiumMath.toRadians(0),
//     },
// };
