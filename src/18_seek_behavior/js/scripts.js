import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as YUKA from 'yuka'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xFEFEFE);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 10, 0);
orbit.update();


function animate() {
    renderer.render(scene, camera);
}

const vehicleGeo = new THREE.ConeBufferGeometry(0.1, 0.8, 8)
vehicleGeo.rotateZ(Math.PI/2)
const vehicleMat = new THREE.MeshNormalMaterial()
const vehicleMesh = new THREE.Mesh(vehicleGeo, vehicleMat)
vehicleMesh.matrixAutoUpdate = false
scene.add(vehicleMesh)
vehicleMesh.position.set(-2,0,2)
const vehicle = new YUKA.Vehicle()
vehicle.setRenderComponent(vehicleMesh, sync)
function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)  
}

const targetGeo = new THREE.SphereGeometry(0.3)
const targetMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 })
const targetMesh = new THREE.Mesh(targetGeo, targetMat)
scene.add(targetMesh)

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});