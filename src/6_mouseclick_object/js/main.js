import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {_Entity} from "three/examples/jsm/libs/ecsy.module";

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

camera.position.set(6, 8, 14);
orbit.update();

const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const directionalLight = new THREE.DirectionalLight(0xffffff,2)
scene.add(directionalLight)

const mouse = new THREE.Vector2()
const planeNormal = new THREE.Vector3()
const plane = new THREE.Plane()
const raycaster = new THREE.Raycaster()
const interSectionPoint = new THREE.Vector3()
window.onmousemove = function(e){
    mouse.x = e.offsetX/window.innerWidth*2 - 1
    mouse.y = 1- e.offsetY/window.innerHeight*2
    // 创建辅助平面
    planeNormal.copy(camera.position)
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
    // 射线交点
    raycaster.setFromCamera(mouse,camera)
    raycaster.ray.intersectPlane(plane, interSectionPoint)
}
window.onclick = function(e){
    const sphereGeo = new THREE.SphereGeometry(0.2)
    const sphereMat = new THREE.MeshStandardMaterial({
        color:0xffffff*Math.random(),
        metalness:0,
        roughness:0
    })
    const sphereMesh = new THREE.Mesh(sphereGeo,sphereMat)
    sphereMesh.position.copy(interSectionPoint)
    scene.add(sphereMesh)
}

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});