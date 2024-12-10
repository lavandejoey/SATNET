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

    // Add dropdown widget in 3D view for selecting satellites by group
    const satelliteGroupList = [
        "Starlink",
        "OneWeb",
        "Iridium",
        "Globalstar",
    ];
    // Add Dropdown Widget for Selecting Satellite Groups
    const widgetContainer = document.getElementById('cesiumContainer3DWidgets'); // Ensure this exists in your HTML
    if (widgetContainer) {
        // Create Dropdown Select Element
        const dropdown = document.createElement('select', {
            'id': 'satelliteGroupDropdown',
        });

        // Create Default Option
        const defaultOption = document.createElement('option');
        defaultOption.value = 'All';
        defaultOption.text = 'All';
        dropdown.appendChild(defaultOption);

        // Populate Dropdown with Satellite Groups
        satelliteGroupList.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.text = group;
            dropdown.appendChild(option);
        });
        widgetContainer.appendChild(dropdown);

        // Event Listener for Dropdown Change
        dropdown.addEventListener('change', (event) => {
            const selectedGroup = event.target.value;
            console.log('Selected Satellite Group:', selectedGroup);
            if (selectedGroup === 'All') {
                // Show all satellites
                // filterSatellitesByGroup(null); // Assuming null or undefined resets the filter
            } else {
                // Filter satellites by the selected group
                // filterSatellitesByGroup(selectedGroup);
            }
        });
    } else {
        console.warn("Widget container element not found.");
    }


}