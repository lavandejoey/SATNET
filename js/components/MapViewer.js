// /js/viewer2dManage.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import {Viewer, Ion, Math as CesiumMath} from '/node_modules/cesium/Build/Cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {CESIUM_ACCESS_TOKEN,CESIUM_2D_CONFIG} from "../utils/config";
import {initCamera, INITIAL_CAMERA_2D} from "../utils/camera";
Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export const MapViewer = () => {
    // Set up the basic Cesium viewer
    let viewer = new Viewer('cesiumContainer2D', {
        ...CESIUM_2D_CONFIG,
    });
    initCamera(viewer, INITIAL_CAMERA_2D);
    return viewer;
}
