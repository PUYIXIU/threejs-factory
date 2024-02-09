import * as THREE from 'three';
import * as YUKA from 'yuka'
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x94d8f8);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(3, 10, 218);
camera.lookAt(scene.position)

const loader = new GLTFLoader()

loader.load('assets/drive/terrain.glb', gltf => {
  const model = gltf.scene
  scene.add(model)
})

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});