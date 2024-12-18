import {ctx} from "/js/utils/config.js";

async function loadPage() {
    const loadingInfo = document.getElementById('loadingInfo');

    if (loadingInfo) loadingInfo.innerHTML = "Loading Globe and Map Viewers 1/4";
    // Once both are loaded, and we have ctx.view3D and ctx.view2D not null, hide the loading overlay
    while (ctx.view2D === null || ctx.view3D === null) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (loadingInfo) loadingInfo.innerHTML = "Loading Launch History 2/4";
    while (ctx.LAUNCHLOG === null || ctx.SITES === null) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (loadingInfo) loadingInfo.innerHTML = "Loading Satellites 3/4";
    while (ctx.view3D.entities.values.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (loadingInfo) loadingInfo.innerHTML = "Almost done 4/4";
    await new Promise(resolve => setTimeout(resolve, 10));

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }

    // Destroy loadingOverlay
    setTimeout(() => {
        loadingOverlay.remove();
    }, 1000);
}

export {loadPage};