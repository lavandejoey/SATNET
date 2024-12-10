// /js/cesium.js
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {MapViewer} from "/js/components/MapViewer";
import {GlobeViewer} from "/js/components/GlobeViewer";
import {addWidgets} from "/js/components/widgets";
import {displaySatellites} from "/js/components/GlobeSatellitePoints";
import {createStatViz} from "/js/components/StatMap";
import {loadLaunchLog} from "/js/utils/data";

async function loadViz() {
    /********************************************* Viewer Initialization *********************************************/
    // Load the 3D and 2D viewers
    GlobeViewer().then(() => console.log('GlobeViewer loaded'));
    MapViewer().then(() => console.log('MapViewer loaded'));

    // Remove the watermark
    addWidgets().then(() => console.log('Widgets loaded'));

    /********************************************** Data Initialization **********************************************/
    // Init load global data
    await loadLaunchLog();

    // create the statistical graphs
    createStatViz();

    // Display the satellites
    displaySatellites();
}

// load page or resize page -> reload the viewer
window.addEventListener('load', loadViz);