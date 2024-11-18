// /js/viewer2dManage.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import {Viewer, Ion, Math as CesiumMath} from '/node_modules/cesium/Build/Cesium';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
Ion.defaultAccessToken = import.meta.env.VITE_ION_TOKEN;

export function init2DScene(imageryProvider, baseLayerPicker, homeButton, helpButton, timeline, terrain,
                            clockViewModel, sceneModePicker, navigationHelpButton
) {
    // Set up the basic Cesium viewer
    let viewer = new Viewer('cesiumContainer2D', {
        imageryProvider: imageryProvider,
        baseLayerPicker: baseLayerPicker,
        helpButton: helpButton,
        homeButton: homeButton,
        timeline: timeline,
        terrain: terrain,
        // 2D flat mode and disable changing
        sceneMode: Cesium.SceneMode.SCENE2D,
        clockViewModel: clockViewModel,
        sceneModePicker: sceneModePicker,
        navigationHelpButton: navigationHelpButton,
    });

    initCamera(viewer);
    return viewer;
}

function initCamera(viewer) {
    // Default camera to equatorial line, see just complete world map
    viewer.camera.flyTo({
        // Equatorial line: 0° E, 0° N, 15e6 meters above
        destination: Cesium.Cartesian3.fromDegrees(0, 0, 5e7),
        orientation: {
            // North
            heading: CesiumMath.toRadians(0),
            // Square to earth center
            pitch: CesiumMath.toRadians(-90),
            roll: CesiumMath.toRadians(0),
        },
    });
}