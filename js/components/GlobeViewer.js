// js/viewer3dManage.js
import * as Cesium from 'cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {CESIUM_ACCESS_TOKEN, CESIUM_3D_CONFIG, ctx} from "../utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "../utils/camera";
import {initializeSatellites} from "./GlobeSatellitePoints";

Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export async function GlobeViewer() {
    // Set up the basic Cesium viewer
    const view3D = new Cesium.Viewer('cesiumContainer3D', CESIUM_3D_CONFIG);

    view3D.scene.globe.enableLighting = true;

    // sync sensitivity
    view3D.camera.percentageChanged = 0.01;

    initCamera(view3D, INITIAL_CAMERA_3D);

    // Add a button toggle initializeSatellites
    const button = document.createElement('button');
    button.innerHTML = 'Toggle Satellites';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.left = '10px';
    button.onclick = initializeSatellites;
    document.body.appendChild(button);
    initializeSatellites();

    // Add to global context
    ctx.view3D = view3D;
}