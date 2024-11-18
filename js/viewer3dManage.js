// /js/viewer3dManage.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import {Viewer, Ion, Math as CesiumMath} from '/node_modules/cesium/Build/Cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
Ion.defaultAccessToken = import.meta.env.VITE_ION_TOKEN;

export function init3DScene(imageryProvider, baseLayerPicker, homeButton, helpButton, timeline, terrain,
                            clockViewModel, sceneModePicker, navigationHelpButton
) {
    // Set up the basic Cesium viewer
    let viewer = new Viewer('cesiumContainer3D', {
        imageryProvider: imageryProvider,
        baseLayerPicker: baseLayerPicker,
        helpButton: helpButton,
        homeButton: homeButton,
        timeline: timeline,
        terrain: terrain,
        // Default 10x animation
        clockViewModel: clockViewModel,
        sceneModePicker: sceneModePicker,
        navigationHelpButton: navigationHelpButton,
    });
    // Home button -> initCamera function
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        initCamera();
    });

    initCamera(viewer);
    return viewer;
}

function initCamera(viewer) {
    // Default camera to Paris
    viewer.camera.flyTo({
        // Paris: 2.3488° E, 48.8534° N, 15e6 meters above
        destination: Cesium.Cartesian3.fromDegrees(2.3488, 48.8534, 15e6),
        orientation: {
            // North
            heading: CesiumMath.toRadians(0),
            // Square to earth center
            pitch: CesiumMath.toRadians(-90),
            roll: CesiumMath.toRadians(0),
        },
    });
}
