// js/viewer3dManage.js
import * as Cesium from "cesium";
import "/node_modules/cesium/Build/Cesium/Widgets/widgets.css";
import {CESIUM_ACCESS_TOKEN, CESIUM_3D_CONFIG, ctx, ionImageryProvider} from "/js/utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "/js/utils/camera";
import {handleSatelliteClick} from "./GlobeSatellites";

Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export async function GlobeViewer() {
    // Set up the basic Cesium viewer
    const view3D = new Cesium.Viewer("cesium3DViewContainer", CESIUM_3D_CONFIG);

    await view3D.imageryLayers.addImageryProvider(ionImageryProvider);

    view3D.scene.globe.enableLighting = true;

    // sync sensitivity
    view3D.camera.percentageChanged = 0.01;

    initCamera(view3D, INITIAL_CAMERA_3D);

    ctx.view3D = view3D; // signal that the viewer is ready

    handleSatelliteClick();
}