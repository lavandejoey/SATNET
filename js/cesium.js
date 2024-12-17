// /js/cesium.js
import 'bootstrap';
import "cesium/Build/Cesium/Widgets/widgets.css";
import {MapViewer} from "/js/components/MapViewer";
import {GlobeViewer} from "/js/components/GlobeViewer";
import {addSatelliteGroupOptions, addWidgets} from "/js/components/widgets";
import {displaySatellites} from "/js/components/GlobeSatellites";
import {display2DSatellites} from "/js/components/MapSatellites";
import {createStatViz} from "/js/components/StatMap";
import {loadLaunchLog, loadSites} from "/js/utils/data";
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
    loadingPage().then(() => console.log("Page loaded"));

    /********************************************* Viewer Initialization *********************************************/
    // Load the 3D and 2D viewers
    GlobeViewer().then(() => console.log('GlobeViewer loaded'));
    MapViewer().then(() => console.log('MapViewer loaded'));

    // wait for the viewers to load
    while (ctx.view2D === null || ctx.view3D === null) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Add widgets
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