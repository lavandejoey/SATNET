// js/viewer3dManage.js
import * as Cesium from 'cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {CESIUM_ACCESS_TOKEN, CESIUM_3D_CONFIG, ctx} from "../utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "../utils/camera";

Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export function GlobeViewer() {
    // Set up the basic Cesium viewer
    const view3D = new Cesium.Viewer('cesiumContainer3D', CESIUM_3D_CONFIG);
    // let view3D = new Viewer('cesiumContainer3D', CESIUM_3D_CONFIG);
    view3D.scene.globe.enableLighting = true;

    initCamera(view3D, INITIAL_CAMERA_3D);
    ctx.view3D = view3D;
}