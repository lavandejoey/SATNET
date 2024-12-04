// /js/cesium.js
import * as Cesium from 'cesium';
import {ctx} from "./utils/config";
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {MapViewer} from "./components/MapViewer";
import {GlobeViewer} from "./components/GlobeViewer";
import {addWidgets} from "./components/widgets";
import {initializeSatellites} from "./components/GlobeSatellitePoints";


async function loadViewer() {
    // Load the 3D and 2D viewers
    GlobeViewer().then(r =>         console.log('GlobeViewer loaded'));
    MapViewer().then(r => console.log('MapViewer loaded'));

    // Load the satellites
    initializeSatellites().then(r => console.log('Satellites loaded'));

    // Remove the watermark
    addWidgets().then(r => console.log('Widgets loaded'));

}

window.onload = loadViewer;
