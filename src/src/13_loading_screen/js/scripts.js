import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

renderer.setClearColor(0xA3A3A3);

const controls = new FirstPersonControls( camera, renderer.domElement );
controls.movementSpeed = 0;
controls.lookSpeed = 0;

camera.position.set(5, 8, 30);

renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2

const loadingManager = new THREE.LoadingManager()

const progressBar = document.getElementById('progress-bar')
loadingManager.onProgress = (url, loaded, total) => {
  progressBar.setAttribute('value', loaded/total*100)
}
const progressContent = document.querySelector('.progress-content')
loadingManager.onLoad = () => {
  progressContent.style.display = 'none'
}
const gltfLoader = new GLTFLoader(loadingManager)
const rgbeLoader = new RGBELoader(loadingManager)

rgbeLoader.load('./assets/MR_INT-006_LoftIndustrialWindow_Griffintown.hdr', texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  gltfLoader.load('./assets/mars_one_mission/scene.gltf', gltf => {
    scene.add(gltf.scene)
  },undefined,err=>console.error(err))
})



const clock = new THREE.Clock();
function animate() {
    renderer.render(scene, camera);
    controls.update( clock.getDelta() );
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});