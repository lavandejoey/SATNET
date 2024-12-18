// /js/cesium.js
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import 'bootstrap';
import {MapViewer} from "/js/components/MapViewer";
import {GlobeViewer} from "/js/components/GlobeViewer";
import {addSatelliteGroupOptions, addWidgets} from "/js/components/widgets";
import {displaySatellites} from "/js/components/GlobeSatellites";
import {display2DSatellites} from "/js/components/MapSatellites";
import { display2DCountry } from './components/MapCountry';
import {createStatViz} from "/js/components/StatMap";
import {loadLaunchLog, loadSites, loadCountry} from "/js/utils/data";
import {loadPage} from "/js/utils/loadPage.js";
import {ctx} from "/js/utils/config";

async function loadViz() {
    // Loading page
    loadPage().then(() => console.log("Page loaded"));

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
    await loadCountry();
    setInterval(() => {
        var currentDate = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime);
        dataUpdate(ctx.LAUNCHLOG.DATA, currentDate);
    }, 1000);

    // create the statistical graphs
    createStatViz();

    // Display the satellites in 3D
    displaySatellites();

    //Display the satellites in 2D
    display2DSatellites();
    display2DCountry();
}

// load page or resize page -> reload the viewer
window.addEventListener('load', loadViz);