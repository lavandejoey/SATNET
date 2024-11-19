// js/viewer2dManage.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import {Viewer, Ion, Math as CesiumMath} from '/node_modules/cesium/Build/Cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {CESIUM_ACCESS_TOKEN, CESIUM_2D_CONFIG, ctx, CESIUM_SHARE_CLOCK} from "../utils/config";

Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export function MapViewer() {
    // set up the basic Cesium viewer
    let view2D = new Viewer('cesiumContainer2D', {
        ...CESIUM_2D_CONFIG, clockViewModel: new Cesium.ClockViewModel(CESIUM_SHARE_CLOCK)
    });
    // let view2D = new Viewer('cesiumContainer2D',CESIUM_2D_CONFIG);
    view2D.scene.globe.enableLighting = true;
    // apply sync function
    ctx.view3D.camera.changed.addEventListener(sync2DView);
    // sync sensitivity
    ctx.view3D.camera.percentageChanged = 0.01;

    // 2D view is all follows 3D -> disable all 2D camera active move
    view2D.scene.screenSpaceCameraController.enableRotate = false;
    view2D.scene.screenSpaceCameraController.enableTranslate = false;
    view2D.scene.screenSpaceCameraController.enableZoom = false;
    view2D.scene.screenSpaceCameraController.enableTilt = false;
    view2D.scene.screenSpaceCameraController.enableLook = false;
    // no-need seperate camera
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
    ctx.distance = Cesium.Cartesian3.distance(ctx.worldPosition, ctx.view3D.scene.camera.positionWC,);
    ctx.distance = 5e7;
    // Tell the 2D camera to look at the point of focus. The distance controls how zoomed in the 2D view is
    // (try replacing `distance` in the line below with `1e7`. The view will still sync, but will have a constant zoom)
    ctx.view2D.scene.camera.lookAt(ctx.worldPosition, new Cesium.Cartesian3(0.0, 0.0, ctx.distance),);
}


