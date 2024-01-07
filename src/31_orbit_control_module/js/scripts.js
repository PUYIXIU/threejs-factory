import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xefefef);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
import {Fi} from 'three/examples/jsm/controls/FirstPersonControls'
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(1, 7, 5);
orbit.update();

// orbit.panSpeed = 10
// orbit.enablePan = false
// orbit.rotateSpeed = 1
// orbit.enableDamping = true
// orbit.dampingFactor = 0.05
// orbit.autoRotate = true
// orbit.target = new THREE.Vector3(0,5,0)

// orbit.mouseButtons.LEFT = THREE.MOUSE.ROTATE
// orbit.mouseButtons.RIGHT = THREE.MOUSE.PAN

// orbit.keys = {
//   LEFT:"ArrowLeft",
//   UP:"ArrowUp",
//   RIGHT:"KeyD",
//   BOTTOM:"KeyS"
// }
// orbit.listenToKeyEvents(window)
// orbit.keyPanSpeed = 20

// window.onkeydown = e => {
//   if (e.code === 'KeyS')
//     orbit.saveState()
//   else if (e.code === 'KeyL')
//     orbit.reset()
// }

// orbit.maxAzimuthAngle = Math.PI/2
// orbit.minAzimuthAngle = Math.PI/4

orbit.maxPolarAngle = Math.PI/4
orbit.minPolarAngle = Math.PI/4

const loadingManager = new THREE.LoadingManager()
const progressBar = document.getElementById('loading-progress')
loadingManager.onProgress = (url, loaded, total) => {
  progressBar.setAttribute('value', loaded / total * 100)
}
loadingManager.onLoad = () => {
  setTimeout(() => {
  document.querySelector('.progress-layer').style.display = 'none'
  },300)
}
const loader = new GLTFLoader(loadingManager)
loader.load('/assets/still_life_with_orange/scene.gltf', gltf => {
  scene.add(gltf.scene)
})


function animate() {
  orbit.update()
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});