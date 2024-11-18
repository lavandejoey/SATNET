// js/viewer3dManage.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import {Viewer, Ion, Math as CesiumMath} from '/node_modules/cesium/Build/Cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;
import {CESIUM_ACCESS_TOKEN,CESIUM_3D_CONFIG} from "../utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "../utils/camera";

export const GlobeViewer = () => {
    // Set up the basic Cesium viewer
    let viewer = new Viewer('cesiumContainer3D', {
        ...CESIUM_3D_CONFIG,
    });
    // Home button -> initCamera function
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        initCamera(viewer, INITIAL_CAMERA_3D);
    });

    initCamera(viewer, INITIAL_CAMERA_3D);
    return viewer;
}