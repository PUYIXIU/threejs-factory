import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

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

renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()

rgbeLoader.load('/assets/kitchen.hdr',texture=>{
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
    gltfLoader.load('/assets/the_king_s_hall/scene.gltf',gltf=>{
        gltf.scene.position.set(0,0,0)
        scene.add(gltf.scene)
    })
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