// js/components/widgets.js
import * as Cesium from "cesium";
import {ctx} from "../utils/config";

export async function addWidgets() {
    // remove all cesium-viewer-bottom
    let watermark = document.getElementsByClassName('cesium-viewer-bottom');
    while (watermark.length > 0) {
        watermark[0].parentNode.removeChild(watermark[0]);
    }

    // Add timeline
    const timelineContainer = document.getElementById('cesiumContainerTimeline');
    const timelineWidget = new Cesium.Timeline(timelineContainer, ctx.view3D.clock);
    timelineWidget.zoomTo(ctx.view3D.clock.startTime, ctx.view3D.clock.stopTime);
    timelineWidget.resize();
    // connect timeline with clock change time
    timelineWidget.addEventListener('settime', function (e) {
        ctx.view3D.clock.currentTime = e.timeJulian;
        ctx.view3D.clock.shouldAnimate = false;
    });


    // // Add satellite counter
    // const counter = document.createElement('div');
    // counter.id = 'satellite-count';
    // counter.style.position = 'absolute';
    // counter.style.top = '10px';
    // counter.style.right = '10px';
    // counter.style.color = 'white';
    // counter.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    // counter.style.padding = '5px';
    // counter.style.borderRadius = '5px';
    // counter.style.zIndex = '1000';
    // counter.innerHTML = 'Total Satellites: 0';
    // document.body.appendChild(counter);

}