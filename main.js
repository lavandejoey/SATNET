import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import * as satellite from 'satellite.js';

let scene, camera, renderer, controls, earth, orbit;
let isOrbitVisible = false;
const yAxis = new THREE.Vector3(0, 1, 0);
// earthRadius in our screen
const earthRadius = 5;
// real earth radius and gravitational Constant
const gravitationalConstant = 398600; //  km^3/s^2
const earthRadiusKm = 6371; //  km

// set the earth
function CreateEarth() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // set a relativelt farer position
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enableRotate = true
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const geometry = new THREE.SphereGeometry(earthRadius, 32, 32);
    const texture = new THREE.TextureLoader().load('earth_texture.jpg')
    const material = new THREE.MeshBasicMaterial({ map: texture });
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // environment light
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // direction light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // For animation and interaction
    renderer.domElement.addEventListener('pointerdown', onInteractionStart);

    animate();
}

function CreateOrbit(inclination, meanMotion) {
    // calculate the orbit radius
    let orbitalRadiusKM = Math.cbrt(gravitationalConstant / Math.pow((meanMotion * 2 * Math.PI / 86400), 2));
    let orbitalRadius = orbitalRadiusKM * earthRadius / earthRadiusKm;
    // create orbit object
    const orbitGeometry = new THREE.TorusGeometry(orbitalRadius, 0.02, 16, 100)
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    const orbit_new = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit_new.rotation.x = THREE.MathUtils.degToRad(inclination);
    return orbit_new;
}


function toggleOrbit() {
    if (isOrbitVisible) {
        scene.remove(orbit);
    } else {
        orbit = CreateOrbit(43, 15.5);
        scene.add(orbit);
    }
    isOrbitVisible = !isOrbitVisible;

}

function onInteractionStart() {
    controls.autoRotate = false;
}

function animate() {
    // animate will be called automatically
    requestAnimationFrame(animate);
    // earth.rotation.y += 0.001;  
    if (controls.autoRotate) {
        earth.rotateOnAxis(yAxis, 0.001);
    }
    controls.update();
    renderer.render(scene, camera);
}



// window.CreateEarth = CreateEarth;
CreateEarth();

// click the orbitButton will show the orbit
document.getElementById('orbitButton').addEventListener('click', toggleOrbit);