import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as satellite from 'satellite.js';

let scene, camera, renderer, controls, earth, satelliteObject;
let isSatelliteVisible = false;
const yAxis = new THREE.Vector3(0, 1, 0);
// earthRadius in our screen
const earthRadius = 5;
// position for one satellite
let satellitePosition = new THREE.Vector3();
// real earth radius
const earthRadiusM = 6371000; //  m

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

    // create satellite
    animate();
    // satelliteObject = CreateSatellite()
}

function CreateSatellite(){
    if(!satelliteObject){
        const satelliteGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        satelliteObject = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
        scene.add(satelliteObject);
    }
    
    return satelliteObject;
}

function getSatellitePosition() {
    // "STARLINK-5749           
    //      \n1 55569U 23020A   23068.91667824 -.01222506  00000+0 -26164-1 0  9998
    //      \n2 55569  42.9986 202.4718 0001617 275.0503  69.2380 15.46826334  1305",
    //      42.9986: Inclination
    //      202.4718: Right Ascension of Ascending Node
    //      0001617: Eccentricity
    //      275.0503: Argument of Perigee
    //      69.2380: Mean Anomaly
    //      15.46826334: Mean Motion per day
    
    // parse the TLE data
    var tleLine1 = "1 55569U 23020A   23068.91667824 -.01222506  00000+0 -26164-1 0  9998",
        tleLine2 = "2 55569  42.9986 202.4718 0001617 275.0503  69.2380 15.46826334  1305";
    // var tleLine1 = '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
    //     tleLine2 = '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442';

    var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    const now = new Date().toUTCString();
    var positionAndVelocity = satellite.propagate(satrec, now);

    // position
    var positionEci = positionAndVelocity.position;

    // map to longitude and latitude
    var geodetic = satellite.eciToGeodetic(positionEci, now);
    var longitude = geodetic.longitude,
        latitude = geodetic.latitude,
        altitude = geodetic.height;

    return { longitude, latitude, altitude};
}

function updateSatellite() {
    const { longitude, latitude, altitude} = getSatellitePosition();

    const lon = THREE.MathUtils.degToRad(longitude); 
    const lat = THREE.MathUtils.degToRad(latitude); 
    const orbitRadius = altitude * earthRadius / earthRadiusM;

    satellitePosition.x = (earthRadius + orbitRadius) * Math.cos(lat) * Math.cos(lon);
    satellitePosition.y = (earthRadius + orbitRadius) * Math.cos(lat) * Math.sin(lon);
    satellitePosition.z = (earthRadius + orbitRadius) * Math.sin(lat);

    if (satelliteObject){
        satelliteObject.position.copy(satellitePosition);

    }
}

function toggleSatellite() {
    if (isSatelliteVisible) {
        scene.remove(satelliteObject);
        satelliteObject = null;
    } else {
        satelliteObject = CreateSatellite();
    }
    isSatelliteVisible = !isSatelliteVisible;

}

function onInteractionStart() {
    controls.autoRotate = false;
}

function animate() {
    // animate will be called automatically
    requestAnimationFrame(animate);
    if (controls.autoRotate) {
        earth.rotateOnAxis(yAxis, 0.001);
    }
    controls.update();
    if (isSatelliteVisible){
        updateSatellite();
    }
    renderer.render(scene, camera);
}


// window.CreateEarth = CreateEarth;
CreateEarth();

// click the orbitButton will show the satellite
document.getElementById('satelliteButton').addEventListener('click', toggleSatellite);