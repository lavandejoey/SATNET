// js/components/widgets.js
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {initCamera, INITIAL_CAMERA_3D} from "/js/utils/camera";

export async function addWidgets() {
    setWatermark();
    setTimelineAndAnimation();

    addButtons();

    addSatelliteGroupOptions();
}

function setWatermark() {
    // remove all cesium-viewer-bottom
    let watermark = document.getElementsByClassName("cesium-viewer-bottom");
    while (watermark.length > 0) {
        watermark[0].parentNode.removeChild(watermark[0]);
    }
}

function setTimelineAndAnimation() {
    // Add animation
    const animationContainer = document.getElementById("cesiumContainerAnimation");
    const animationViewModel = new Cesium.AnimationViewModel(ctx.view3D.clockViewModel);
    const animationWidget = new Cesium.Animation(animationContainer, animationViewModel);
    animationWidget.resize();

    // Add timeline
    const timelineContainer = document.getElementById("cesiumContainerTimeline");
    const timelineWidget = new Cesium.Timeline(timelineContainer, ctx.view3D.clock);
    timelineWidget.zoomTo(ctx.view3D.clock.startTime, ctx.view3D.clock.stopTime);
    timelineWidget.resize();
    // connect timeline with clock change time
    timelineWidget.addEventListener("settime", function (e) {
        ctx.view3D.clock.currentTime = e.timeJulian;
        ctx.view3D.clock.shouldAnimate = false;
    });
}

function addButtons() {
    // **Bind the "Go Home" Button to the `initCamera` Function**
    const goHomeButton = document.getElementById("goHome");
    if (goHomeButton) {
        goHomeButton.addEventListener("click", () => {
            initCamera(ctx.view3D, INITIAL_CAMERA_3D);
        });
    } else {
        console.warn("Go Home button with ID 'goHome' not found in the DOM.");
    }

}

export function addSatelliteGroupOptions() {
    // Add Checkbox Widget for Selecting Satellite Groups filter
    const controllerContainer = document.getElementById("controllerContainer");
    if (!controllerContainer) return

    // Get the placeholder element inside the dropdown
    const optionContainer = document.getElementById("satelliteGroupOptions");

    // Create a container for the options
    const container = document.createElement("div");
    container.classList.add("d-flex", "flex-column", "align-items-center"); // Center horizontally

    // Create and add a "Select All" option
    const selectAllOption = document.createElement("div");
    selectAllOption.classList.add("option-item", "selected", "w-100", "p-1");
    selectAllOption.textContent = "Select All";
    selectAllOption.style.cursor = "pointer";
    selectAllOption.style.textAlign = "center";
    selectAllOption.style.userSelect = "none";

    container.appendChild(selectAllOption);

    // Add a horizontal rule
    const hr = document.createElement("hr");
    hr.classList.add("dropdown-divider", "w-100");
    container.appendChild(hr);

    // Create options for each satellite group
    Object.values(ctx.SAT_GROUP).forEach(group => {
        const option = document.createElement("div");
        option.classList.add("option-item", "selected", "w-100", "p-1");
        option.textContent = group.NAME;
        // option.textContent = group.NAME + " (" + group.DATA.length + " instances)";
        option.style.cursor = "pointer";
        option.style.textAlign = "center";
        option.style.userSelect = "none";
        option.style.color = group.COLOR.toCssColorString();
        option.dataset.groupName = group.NAME;

        container.appendChild(option);
    });

    optionContainer.appendChild(container);

    // Function to update the "Select All" state based on individual selections
    function updateSelectAllState() {
        const allSelected = Object.values(ctx.SAT_GROUP).every(group => group.SELECTED);
        if (allSelected) {
            selectAllOption.classList.add("selected");
            selectAllOption.classList.remove("unselected");
        } else {
            selectAllOption.classList.add("unselected");
            selectAllOption.classList.remove("selected");
        }
    }

    // Event Listener for "Select All" Option
    selectAllOption.addEventListener("click", () => {
        const shouldSelectAll = !selectAllOption.classList.contains("selected");

        // Toggle "Select All" state
        if (shouldSelectAll) {
            selectAllOption.classList.add("selected");
            selectAllOption.classList.remove("unselected");
        } else {
            selectAllOption.classList.add("unselected");
            selectAllOption.classList.remove("selected");
        }

        // Update all satellite groups
        Object.values(ctx.SAT_GROUP).forEach(group => {
            group.SELECTED = shouldSelectAll;
            const option = container.querySelector(`[data-group-name="${group.NAME}"]`);
            if (shouldSelectAll) {
                option.classList.add("selected");
                option.classList.remove("unselected");
            } else {
                option.classList.add("unselected");
                option.classList.remove("selected");
            }
        });
    });

    // Event Listeners for Individual Group Options
    Object.values(ctx.SAT_GROUP).forEach(group => {
        const option = container.querySelector(`[data-group-name="${group.NAME}"]`);
        option.addEventListener("click", () => {
            // Toggle selection state
            group.SELECTED = !group.SELECTED;
            option.classList.toggle("selected");
            option.classList.toggle("unselected");

            // Update "Select All" state
            updateSelectAllState();
        });
    });

    // Initialize "Select All" state
    updateSelectAllState();
}