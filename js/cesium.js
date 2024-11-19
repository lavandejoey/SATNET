// /js/cesium.js
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {MapViewer} from "./components/MapViewer";
import {GlobeViewer} from "./components/GlobeViewer";

async function loadViewer() {
    GlobeViewer();
    MapViewer();

    removeWatermark().then(r => console.log('Watermark removed'));

}

async function removeWatermark() {
    // remove all cesium-viewer-bottom
    let watermark = document.getElementsByClassName('cesium-viewer-bottom');
    while (watermark.length > 0) {
        watermark[0].parentNode.removeChild(watermark[0]);
    }
}
window.onload = loadViewer;
