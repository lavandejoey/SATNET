// js/components/widgets.js
import * as Cesium from "cesium";
import {ctx} from "../utils/config";
import {initializeSatellites} from "./GlobeSatellitePoints";

export async function addWidgets() {
    // remove all cesium-viewer-bottom
    let watermark = document.getElementsByClassName('cesium-viewer-bottom');
    while (watermark.length > 0) {
        watermark[0].parentNode.removeChild(watermark[0]);
    }

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
    timelineWidget.addEventListener('settime', function (e) {
        ctx.view3D.clock.currentTime = e.timeJulian;
        ctx.view3D.clock.shouldAnimate = false;
    });
}