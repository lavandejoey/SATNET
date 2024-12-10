// js/viewer3dManage.js
import * as Cesium from "cesium";
import "/node_modules/cesium/Build/Cesium/Widgets/widgets.css";
import {CESIUM_ACCESS_TOKEN, CESIUM_3D_CONFIG, ctx} from "/js/utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "/js/utils/camera";

Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export async function GlobeViewer() {
    // Set up the basic Cesium viewer
    ctx.view3D = new Cesium.Viewer('cesiumContainer3D', CESIUM_3D_CONFIG);

    ctx.view3D.scene.globe.enableLighting = true;

    // sync sensitivity
    ctx.view3D.camera.percentageChanged = 0.01;

    initCamera(ctx.view3D, INITIAL_CAMERA_3D);
}