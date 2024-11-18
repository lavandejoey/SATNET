// js/three.js
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {SatelliteThree} from '/js/SatelliteThree.js';

// Declare global variables
let scene, camera, renderer, earth, controls;
let isUserInteracting = false;
const orbits = []; // To store orbit lines
let tleResults = []; // To store TLE data

// Initialize the Three.js scene
function initScene() {
    scene = new THREE.Scene();
}

// Initialize the camera
function initCamera() {
    camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    camera.position.z = 20; // Position the camera
}

// Initialize the renderer
function initRenderer() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add Earth with texture to the scene
function initEarth() {
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/img/earthmap1k.jpg');
    const material = new THREE.MeshStandardMaterial({map: earthTexture});
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
}

// Add lighting to the scene
function initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10); // Position the light source
    scene.add(directionalLight);
}

// Initialize OrbitControls for user interaction
function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth animation effect
    controls.dampingFactor = 0.05;
    controls.minDistance = 10; // Minimum zoom distance
    controls.maxDistance = 50; // Maximum zoom distance

    // Track user interaction
    renderer.domElement.addEventListener('mousedown', () => {
        isUserInteracting = true;
    });

    renderer.domElement.addEventListener('mouseup', () => {
        isUserInteracting = false;
    });
}

// Fetch and load TLE data from orbits.json
async function loadTLEData() {
    try {
        const response = await fetch('/data/all_orbits.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // return pre 1000 satellites
        let orbits_json = await response.json();
        orbits_json = orbits_json.slice(0, 50);
        console.log('orbits_json:', orbits_json);
        return orbits_json
    } catch (error) {
        console.error('Error fetching orbits.json:', error);
        return [];
    }
}

// // Draw a satellite orbit based on TLE data
// function drawSatelliteOrbit(tleData, steps = 500, color = 0xff0000) {
//     // Parse TLE lines
//     const tleLines = tleData.split('\n');
//     if (tleLines.length < 3) { // Ensure there are at least 3 lines: name, line1, line2
//         console.warn('Invalid TLE data (less than 3 lines):', tleData);
//         return;
//     }
//     const tleLine1 = tleLines[1].trim(); // Second line
//     const tleLine2 = tleLines[2].trim(); // Third line
//
//     // Validate TLE lines
//     if (!satellite.twoline2satrec) {
//         console.error('satellite.twoline2satrec is not a function. Check satellite.js import.');
//         return;
//     }
//
//     const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
//
//     // Define points for the orbit
//     const points = [];
//     const now = new Date();
//
//     for (let i = 0; i < steps; i++) {
//         const time = new Date(now.getTime() + (i - steps / 2) * 60 * 1000); // +- steps/2 minutes
//         const positionAndVelocity = satellite.propagate(satrec, time);
//
//         if (positionAndVelocity.position) {
//             const gmst = satellite.gstime(time);
//             const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
//             const latitude = positionGd.latitude; // Radians
//             const longitude = positionGd.longitude; // Radians
//             const altitude = positionGd.height; // Kilometers
//
//             // Convert geodetic coordinates to ECEF
//             const positionEcef = satellite.geodeticToEcf(positionGd); // Correct function name
//
//             // Debugging: Log ECEF position
//             console.log('ECEF Position:', positionEcef);
//
//             // Convert ECEF to Three.js coordinates
//             const x = positionEcef.x;
//             const y = positionEcef.z; // Swap Y and Z for Three.js
//             const z = positionEcef.y;
//
//             // Debugging: Log Three.js coordinates before scaling
//             console.log('Three.js Coordinates:', x, y, z);
//
//             // Scale down to match Earth's size in Three.js (Earth radius = 5 units)
//             const scale = 5 / 6371; // Earth's average radius in km
//             const scaledX = x * scale;
//             const scaledY = y * scale;
//             const scaledZ = z * scale;
//
//             // Debugging: Log scaled coordinates
//             console.log('Scaled Coordinates:', scaledX, scaledY, scaledZ);
//
//             // Check for NaN values
//             if (
//                 isNaN(scaledX) ||
//                 isNaN(scaledY) ||
//                 isNaN(scaledZ)
//             ) {
//                 console.warn('NaN detected in scaled coordinates:', scaledX, scaledY, scaledZ);
//                 continue; // Skip adding this point
//             }
//
//             points.push(new THREE.Vector3(scaledX, scaledY, scaledZ));
//         } else {
//             console.warn('Position data is undefined for time:', time);
//         }
//     }
//
//     // Ensure there are valid points to draw
//     if (points.length === 0) {
//         console.warn('No valid points to draw for this orbit.');
//         return;
//     }
//
//     // Create a line geometry from the points
//     const geometry = new THREE.BufferGeometry().setFromPoints(points);
//
//     // Compute bounding sphere manually to avoid NaN
//     geometry.computeBoundingSphere();
//
//     const material = new THREE.LineBasicMaterial({ color: color });
//     const orbit = new THREE.Line(geometry, material);
//
//     // Add the orbit to the scene
//     scene.add(orbit);
//
//     // Store the orbit for potential future reference
//     orbits.push(orbit);
// }

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the Earth if the user is not interacting
    if (!isUserInteracting) {
        earth.rotation.y += 0.001; // Adjust rotation speed as desired
    }

    // Update controls for damping
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
}

// Main function to initialize everything
async function main() {
    initScene();
    initCamera();
    initRenderer();
    initLighting();
    initEarth();
    initControls();

    // Load TLE data and draw orbits
    tleResults = await loadTLEData();

    // Check if TLE data is an array
    if (!Array.isArray(tleResults)) {
        console.error('Loaded TLE data is not an array:', tleResults);
        return;
    }

    tleResults.forEach((satelliteData, index) => {
        if (!satelliteData.norad_str) {
            console.warn(`Satellite data at index ${index} is missing 'norad_str':`, satelliteData);
            return;
        }
        const satellite = new SatelliteThree(satelliteData.norad_str);
        satellite.addToScene(scene);
        orbits.push(satellite.orbit);
    });

    animate();
}

// Run the main function to start the project
main();
