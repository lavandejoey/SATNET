// /js/cesium.js
import * as Cesium from '/node_modules/cesium/Source/Cesium.js';
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {loadSatelliteData, SatelliteCesium} from '/js/SatelliteCesium.js';
import {MapViewer} from "./components/MapViewer";
import {GlobeViewer} from "./components/GlobeViewer";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_ION_TOKEN;


async function loadViewer() {
    GlobeViewer();
    MapViewer();
}


window.onload = loadViewer;
