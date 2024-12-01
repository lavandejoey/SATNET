// /js/cesium.js
import * as Cesium from 'cesium';
import {ctx} from "./utils/config";
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {MapViewer} from "./components/MapViewer";
import {GlobeViewer} from "./components/GlobeViewer";
import {addWidgets} from "./components/widgets";


async function loadViewer() {
    // Load the 3D and 2D viewers
    GlobeViewer().then(r => {
        // Add animation
        const animationContainer = document.getElementById('cesiumContainerAnimation');
        const animationViewModel = new Cesium.AnimationViewModel(ctx.view3D.clockViewModel);
        const animationWidget = new Cesium.Animation(animationContainer, animationViewModel);
        animationWidget.resize();

        console.log('GlobeViewer loaded')
    });
    MapViewer().then(r => console.log('MapViewer loaded'));

    // Remove the watermark
    addWidgets().then(r => console.log('Widgets loaded'));


}

window.onload = loadViewer;
