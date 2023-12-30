import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'

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

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const ambiantLight = new THREE.AmbientLight(0xffffff, 1.5)
scene.add(ambiantLight)

const gui = new dat.GUI()
const options = {
  Main: 0x787A79,
  Main_Light: 0xb9b9b9,
  Main_Dark: 0x383838,
  Hooves: 0x46423c,
  Hair: 0x383838,
  Muzzle: 0x3d3426,
  Eye_Dark: 0x181818,
  Eye_White: 0xe0e0e0
}

const gltfLoader = new GLTFLoader()
const donkeyUrl = new URL('../asserts/Donkey.gltf', import.meta.url)
gltfLoader.load(donkeyUrl.href, gltf => {
  const model = gltf.scene;
  scene.add(model)
  gui.addColor(options, 'Main').onChange(newVal => {
    model.getObjectByName('Cube').material.color.set(newVal)
  })
  gui.addColor(options, 'Main_Light').onChange(newVal => {
    model.getObjectByName('Cube_1').material.color.set(newVal)
  })
  gui.addColor(options, 'Main_Dark').onChange(newVal => {
    model.getObjectByName('Cube_2').material.color.set(newVal)
  })
  gui.addColor(options, 'Hooves').onChange(newVal => {
    model.getObjectByName('Cube_3').material.color.set(newVal)
  })
  gui.addColor(options, 'Hair').onChange(newVal => {
    model.getObjectByName('Cube_4').material.color.set(newVal)
  })
  gui.addColor(options, 'Muzzle').onChange(newVal => {
    model.getObjectByName('Cube_5').material.color.set(newVal)
  })
  gui.addColor(options, 'Eye_Dark').onChange(newVal => {
    model.getObjectByName('Cube_6').material.color.set(newVal)
  })
  gui.addColor(options, 'Eye_White').onChange(newVal => {
    model.getObjectByName('Cube_7').material.color.set(newVal)
  })
}, undefined, err => {
  console.error(err)
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