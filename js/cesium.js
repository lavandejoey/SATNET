// /js/cesium.js
import "cesium/Build/Cesium/Widgets/widgets.css";
import {MapViewer} from "/js/components/MapViewer";
import {GlobeViewer} from "/js/components/GlobeViewer";
import {addWidgets} from "/js/components/widgets";
import {displaySatellites} from "/js/components/GlobeSatellites";
import {display2DSatellites} from "./components/MapSatellites";
import {createStatViz} from "/js/components/StatMap";
import {loadLaunchLog} from "/js/utils/data";
import {loadSites} from "/js/utils/data";

async function loadViz() {
    /********************************************* Viewer Initialization *********************************************/
    // Load the 3D and 2D viewers
    GlobeViewer().then(() => console.log('GlobeViewer loaded, '));
    MapViewer().then(() => console.log('MapViewer loaded'));

    // Remove the watermark
    addWidgets().then(() => console.log('Widgets loaded'));

    /********************************************** Data Initialization **********************************************/
    // Init load global data
    await loadLaunchLog();
    // Init load site data
    await loadSites();

    // create the statistical graphs
    createStatViz();

    // Display the satellites in 3D
    displaySatellites();

    //Display the satellites in 2D
    display2DSatellites();
}

// load page or resize page -> reload the viewer
window.addEventListener('load', loadViz);