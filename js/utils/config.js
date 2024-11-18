// js/utils/config.js
import * as Cesium from 'cesium';
export const CESIUM_ACCESS_TOKEN = import.meta.env.VITE_ION_TOKEN || '';

export const CESIUM_3D_CONFIG = {
    imageryProvider: undefined,
    baseLayerPicker: false,
    homeButton: true,
    helpButton: false,
    timeline: false,
    terrain: undefined,
    clockViewModel: undefined,
    sceneModePicker: false,
    navigationHelpButton: false,
};

export const CESIUM_2D_CONFIG = {
    imageryProvider: undefined,
    baseLayerPicker: false,
    homeButton: false,
    helpButton: false,
    timeline: false,
    terrain: undefined,
    clockViewModel: undefined,
    sceneModePicker: false,
    navigationHelpButton: false,
    // 2D flat mode and disable changing
    sceneMode: Cesium.SceneMode.SCENE2D,
};