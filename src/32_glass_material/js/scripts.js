import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import { GUI } from 'dat.gui'

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
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(16, 2, 2);
orbit.update();

const loadingManager = new THREE.LoadingManager()
const progressBar = document.getElementById('loading-progress')
loadingManager.onProgress = (url, loaded, total) => {
  progressBar.setAttribute('value', loaded / total * 100)
}
loadingManager.onLoad = () => {
  setTimeout(() => {
    document.querySelector('.progress-layer').style.display = 'none'
  }, 300)
}

window.onmousedown = e => {
  console.log(camera.position)
}
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.8
const loader = new RGBELoader(loadingManager)
loader.load('/assets/kitchen.hdr', texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.background = texture
  scene.environment = texture

})



const sphereGeo = new THREE.SphereGeometry(3, 32, 32)


// const sphereMat = new THREE.MeshStandardMaterial({
//   transparent: true,
//   roughness: 0,
//   metalness: 1,
//   color: 0xffffff,
//   opacity: 0.5,
// })
const sphereMat = new THREE.MeshPhysicalMaterial({
  roughness: 0,
  metalness: 0,
  color: 0xffffff,
  transmission: 1,
  ior:2.33,
})
const options = {
  color: 0xffffff
}
const gui = new GUI()
gui.add(sphereMat, 'roughness', 0, 1)
gui.add(sphereMat, 'metalness', 0, 1)
gui.add(sphereMat, 'transmission', 0, 1)
gui.add(sphereMat, 'ior', 1, 2.33)
gui.addColor(options, 'color').onChange(e => {
  sphereMat.color.set(e)
})

const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
scene.add(sphereMesh)

function animate() {
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});