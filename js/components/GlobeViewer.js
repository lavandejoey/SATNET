// js/viewer3dManage.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import {Viewer, Ion, Math as CesiumMath} from '/node_modules/cesium/Build/Cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {CESIUM_ACCESS_TOKEN, CESIUM_3D_CONFIG, ctx, CESIUM_2D_CONFIG, CESIUM_SHARE_CLOCK} from "../utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "../utils/camera";

Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export function GlobeViewer() {
    // Set up the basic Cesium viewer
    let view3D = new Viewer('cesiumContainer3D', {
        ...CESIUM_3D_CONFIG, clockViewModel: new Cesium.ClockViewModel(CESIUM_SHARE_CLOCK)
    });
    // let view3D = new Viewer('cesiumContainer3D', CESIUM_3D_CONFIG);
    view3D.scene.globe.enableLighting = true;
    // Home button -> initCamera function
    view3D.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        initCamera(view3D, INITIAL_CAMERA_3D);
    });

    initCamera(view3D, INITIAL_CAMERA_3D);
    ctx.view3D = view3D;
}