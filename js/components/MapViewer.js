// js/viewer2dManage.js
import * as Cesium from 'cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {CESIUM_2D_CONFIG, CESIUM_ACCESS_TOKEN, ctx} from "../utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "../utils/camera";

Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export function MapViewer() {
    // set up the basic Cesium viewer
    const view2D = new Cesium.Viewer('cesiumContainer2D', CESIUM_2D_CONFIG);
    // let view2D = new Viewer('cesiumContainer2D',CESIUM_2D_CONFIG);
    view2D.scene.globe.enableLighting = true;
    // apply sync function
    ctx.view3D.camera.changed.addEventListener(sync2DView);
    // sync sensitivity
    ctx.view3D.camera.percentageChanged = 0.01;

    // Home button -> initCamera function
    view2D.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        initCamera(ctx.view3D, INITIAL_CAMERA_3D);
    });

    // 2D view is all follows 3D -> disable all 2D camera active move
    view2D.scene.screenSpaceCameraController.enableRotate = false;
    view2D.scene.screenSpaceCameraController.enableTranslate = false;
    view2D.scene.screenSpaceCameraController.enableZoom = false;
    view2D.scene.screenSpaceCameraController.enableTilt = false;
    view2D.scene.screenSpaceCameraController.enableLook = false;
    // no-need separate camera
    // initCamera(view2D, INITIAL_CAMERA_2D);
    ctx.view2D = view2D;
}

function sync2DView() {
    // The center of the view is the point that the 3D camera is focusing on
    const viewCenter = new Cesium.Cartesian2(Math.floor(ctx.view3D.canvas.clientWidth / 2), Math.floor(ctx.view3D.canvas.clientHeight / 2),);
    // Given the pixel in the center, get the world position
    const newWorldPosition = ctx.view3D.scene.camera.pickEllipsoid(viewCenter);
    if (Cesium.defined(newWorldPosition)) {
        // Guard against the case where the center of the screen
        // does not fall on a position on the globe
        ctx.worldPosition = newWorldPosition;
    }
    // Get the distance between the world position of the point the camera is focusing on, and the camera's world position
    ctx.distance = Math.min(Cesium.Cartesian3.distance(ctx.worldPosition, ctx.view3D.scene.camera.positionWC) * 2,
        45000000);
    console.log(ctx.worldPosition,
        ctx.distance,
        ctx.view2D.canvas.clientHeight,
        ctx.view2D.canvas.clientWidth);
    // Tell the 2D camera to look at the point of focus. The distance controls how zoomed in the 2D view is
    ctx.view2D.scene.camera.lookAt(ctx.worldPosition, new Cesium.Cartesian3(0.0, 0.0, ctx.distance),);
}


