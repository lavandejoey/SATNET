// /js/cesium.js
import "cesium/Build/Cesium/Widgets/widgets.css";
import {MapViewer} from "/js/components/MapViewer";
import {GlobeViewer} from "/js/components/GlobeViewer";
import {addWidgets} from "/js/components/widgets";
import {displaySatellites} from "/js/components/GlobeSatellites";
import {createStatViz} from "/js/components/StatMap";
import {loadLaunchLog} from "/js/utils/data";
import {ctx} from "/js/utils/config";

async function loadingPage() {
    // Once both are loaded and we have ctx.view3D and ctx.view2D not null, hide the loading overlay
    while (ctx.view2D === null || ctx.view3D === null) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Delay to hide the loading overlay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

async function loadViz() {
    // Loading page
    loadingPage().then(() => console.log('Loading page'));

    /********************************************* Viewer Initialization *********************************************/
    GlobeViewer().then(() => console.log('GlobeViewer loaded, '));
    MapViewer().then(() => console.log('MapViewer loaded'));

    // Add widgets
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