// js/components/widgets.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";

export async function addWidgets() {
    setWatermark();
    setTimelineAndAnimation();

    // Add Checkbox Widget for Selecting Satellite Groups filter
    const widgetContainer3D = document.getElementById('cesiumContainer3DWidgets');

    if (widgetContainer3D) {
        addSatelliteGroupCheckboxes(widgetContainer3D);
    }
}

function setWatermark() {
    // remove all cesium-viewer-bottom
    let watermark = document.getElementsByClassName('cesium-viewer-bottom');
    while (watermark.length > 0) {
        watermark[0].parentNode.removeChild(watermark[0]);
    }
}

function setTimelineAndAnimation() {
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

function addSatelliteGroupCheckboxes(widgetContainer3D) {
    // Create a container for checkboxes
    const checkboxContainer = document.createElement('div');
    checkboxContainer.setAttribute('id', 'satelliteGroupCheckboxes');
    // relative fix position to cesiumContainer3DWidgets
    checkboxContainer.style.position = 'relative';
    checkboxContainer.style.top = '0';
    checkboxContainer.style.left = '0';
    checkboxContainer.style.padding = '10px';
    checkboxContainer.style.color = 'white';
    checkboxContainer.style.zIndex = '1000';
    checkboxContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    checkboxContainer.style.flexDirection = 'row';
    checkboxContainer.style.alignItems = 'center';


    // Create and add a "Select All" checkbox
    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.checked = true;
    selectAllCheckbox.id = 'selectAllCheckbox';

    const selectAllLabel = document.createElement('label');
    selectAllLabel.setAttribute('for', 'selectAllCheckbox');
    selectAllLabel.textContent = 'Select All';
    selectAllLabel.style.color = 'white';

    checkboxContainer.appendChild(selectAllCheckbox);
    checkboxContainer.appendChild(selectAllLabel);

    // Add hrule line break for better layout
    checkboxContainer.appendChild(document.createElement('hr'));

    // Create checkboxes for each satellite group
    Object.values(ctx.SAT_GROUP).forEach(group => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true; // Default to all selected
        checkbox.id = `checkbox-${group.NAME}`;
        checkbox.dataset.groupName = group.NAME;

        const label = document.createElement('label');
        label.setAttribute('for', `checkbox-${group.NAME}`);
        label.textContent = group.NAME;
        label.style.color = group.COLOR.toCssColorString();

        // Append checkbox and label to the container
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        checkboxContainer.appendChild(document.createElement('br')); // Add line break for better layout
    });

    widgetContainer3D.appendChild(checkboxContainer);

    // Event Listener for "Select All" Checkbox
    selectAllCheckbox.addEventListener('change', (event) => {
        const isChecked = event.target.checked;

        // Update all checkboxes and satellite group visibility
        Object.values(ctx.SAT_GROUP).forEach(group => {
            const groupCheckbox = document.querySelector(`#checkbox-${group.NAME}`);
            groupCheckbox.checked = isChecked;
            group.SELECTED = isChecked;
        });
    });

    // Event Listener for Individual Group Checkboxes
    Object.values(ctx.SAT_GROUP).forEach(group => {
        const checkbox = document.querySelector(`#checkbox-${group.NAME}`);
        checkbox.addEventListener('change', (event) => {
            // Update satellite group visibility
            group.SELECTED = event.target.checked;

            // Update "Select All" checkbox state
            selectAllCheckbox.checked = Object.values(ctx.SAT_GROUP).every(group => {
                const groupCheckbox = document.querySelector(`#checkbox-${group.NAME}`);
                return groupCheckbox.checked;
            });
        });
    });
}
