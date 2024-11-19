// /js/cesium.js
import * as Cesium from 'cesium';
import {ctx} from "./utils/config";
import '/node_modules/cesium/Build/Cesium/Widgets/widgets.css';
import {MapViewer} from "./components/MapViewer";
import {GlobeViewer} from "./components/GlobeViewer";


async function loadViewer() {
    // Load the 3D and 2D viewers
    GlobeViewer().then(r => {
        // Add animation
        const animationContainer = document.getElementById('cesiumContainerAnimation');
        const animationViewModel = new Cesium.AnimationViewModel(ctx.view3D.clockViewModel);
        const animationWidget = new Cesium.Animation(animationContainer, animationViewModel);
        animationWidget.resize();

        // Add timeline
        const timelineContainer = document.getElementById('cesiumContainerTimeline');
        const timelineWidget = new Cesium.Timeline(timelineContainer, ctx.view3D.clock);
        timelineWidget.zoomTo(ctx.view3D.clock.startTime, ctx.view3D.clock.stopTime);
        timelineWidget.resize();
        // connect timeline with clock change time
        timelineWidget.addEventListener('settime', function(e) {
            ctx.view3D.clock.currentTime = e.timeJulian;
            ctx.view3D.clock.shouldAnimate = false;
        });

        console.log('GlobeViewer loaded')
    });
    MapViewer().then(r => console.log('MapViewer loaded'));

    // Remove the watermark
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
