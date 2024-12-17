// js/viewer2dManage.js
import * as Cesium from "cesium";
import "/node_modules/cesium/Build/Cesium/Widgets/widgets.css";
import {CESIUM_2D_CONFIG, CESIUM_ACCESS_TOKEN, ctx, ionImageryProvider} from "/js/utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "/js/utils/camera";
import {CAMERA_MAX_ALTITUDE, CAMERA_MIN_ALTITUDE, DEGREE_TO_METER, POLE_DISTANCE_METERS} from "/js/utils/constants";

Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN;

export async function MapViewer() {
    // set up the basic Cesium viewer
    const view2D = new Cesium.Viewer("cesium2DViewContainer", CESIUM_2D_CONFIG);

    // await view2D.imageryLayers.addImageryProvider(ionImageryProvider);

    view2D.scene.globe.enableLighting = true;

    // Home button -> initCamera function
    // ctx.view2D.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
    //     e.cancel = true;
    //     initCamera(ctx.view3D, INITIAL_CAMERA_3D);
    // });

    // 2D view is all follows 3D -> disable all 2D camera active move
    disable2DCameraControls(view2D);

    // no-need separate camera
    // initCamera(view2D, INITIAL_CAMERA_2D);
    ctx.canvasHeight = view2D.canvas.clientHeight;

    // apply sync function
    ctx.view3D.camera.changed.addEventListener(sync2DView);

    ctx.view2D = view2D; // signal that the viewer is ready
}

function disable2DCameraControls(viewer) {
    const controller = viewer.scene.screenSpaceCameraController;
    controller.maximumZoomDistance = CAMERA_MAX_ALTITUDE;
    controller.enableRotate = false;
    controller.enableTranslate = false;
    controller.enableZoom = false;
    controller.enableTilt = false;
    controller.enableLook = false;
}


async function sync2DView() {
    // The center of the view is the point that the 3D camera is focusing on
    // this result -> Cartesian2 is
    const viewCenter = new Cesium.Cartesian2(
        Math.floor(ctx.view3D.canvas.clientWidth / 2),
        Math.floor(ctx.view3D.canvas.clientHeight / 2)
    );
    // Given the pixel in the center, get the world position
    const ellipsoid = ctx.view3D.scene.globe.ellipsoid;
    const cartesian = ctx.view3D.camera.pickEllipsoid(viewCenter);
    ctx.worldPosition = ctx.view3D.scene.camera.pickEllipsoid(viewCenter);
    const view3DCartographic = ellipsoid.cartesianToCartographic(cartesian);

    // Get the distance between the world position of the point the camera is focusing on, and the camera's world position
    // Cesium.Cartesian3.distance(ctx.worldPosition, ctx.view3D.scene.camera.positionWC)
    // lower the CAMERA_MIN_ALTITUDE -> CAMERA_MIN_ALTITUDE
    // higher the CAMERA_MAX_ALTITUDE -> CAMERA_MAX_ALTITUDE
    ctx.cameraAltitude = CAMERA_MAX_ALTITUDE;
    // ctx.cameraAltitude = Math.min(
        // Math.max(
        //     Cesium.Cartesian3.distance(ctx.worldPosition, ctx.view3D.scene.camera.positionWC) * 2,
        //     CAMERA_MIN_ALTITUDE
        // ),
        // CAMERA_MAX_ALTITUDE
    // );

    // camera position x, y in 2d meters
    const cameraLatitudeDeg = Cesium.Math.toDegrees(view3DCartographic.latitude);
    const mapRatio = CAMERA_MAX_ALTITUDE / ctx.cameraAltitude;

    // latitude bound
    const latitudeBound = POLE_DISTANCE_METERS / 2 - (ctx.canvasHeight / 2) / (mapRatio * ctx.canvasHeight) * POLE_DISTANCE_METERS;
    const latitudeBoundDeg = latitudeBound / DEGREE_TO_METER;

    // out of bound
    const newCameraLatitude = Math.abs(cameraLatitudeDeg) > latitudeBoundDeg ?
        (cameraLatitudeDeg > 0 ? latitudeBoundDeg : -latitudeBoundDeg) : cameraLatitudeDeg;
    const newPosition = Cesium.Cartesian3.fromRadians(
        view3DCartographic.longitude,
        Cesium.Math.toRadians(newCameraLatitude),
        ctx.cameraAltitude
    );

    ctx.view2D.camera.setView({
        destination: newPosition,
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: Cesium.Math.toRadians(0),
        }
    });
}


