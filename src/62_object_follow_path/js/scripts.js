import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xFEFEFE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(6, 8, 14);
orbit.update();

const aLight = new THREE.AmbientLight(0xffffff,1)
scene.add(aLight)

const sphereGeo = new THREE.SphereGeometry(1,20)
const sphereMat = new THREE.MeshPhysicalMaterial({
    color:0xffaa00,
    roughness:0
})
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
scene.add(sphereMesh)

const points = [
    new THREE.Vector3(-10, 0, 10),
    new THREE.Vector3(-5, 5, 5),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(5, -5, 5),
    new THREE.Vector3(10, 0, 10),
]

const path = new THREE.CatmullRomCurve3(points)

const pathGeometry = new THREE.BufferGeometry().setFromPoints(path.getPoints(50))
const pathMaterial = new THREE.LineBasicMaterial({color:0xff0000})
const pathObject = new THREE.Line(pathGeometry,pathMaterial)
scene.add(pathObject)

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});