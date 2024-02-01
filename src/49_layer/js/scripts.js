import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {GUI} from "dat.gui";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xFEFEFE);
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

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

const loader = new RGBELoader()
loader.load('/assets/kitchen.hdr', texture=>{
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture
    scene.environment = texture
})

const sphereGeo = new THREE.SphereGeometry(2)

const redSphere = new THREE.Mesh(
    sphereGeo,
    new THREE.MeshPhysicalMaterial({
        color:0xff0000,
        metalness:1,
        roughness:0
    })
)
scene.add(redSphere)
redSphere.position.set(-4,0,0)


const greenSphere = new THREE.Mesh(
    sphereGeo,
    new THREE.MeshPhysicalMaterial({
        color:0x00ff00,
        metalness:1,
        roughness:0
    })
)
scene.add(greenSphere)
greenSphere.position.set(0,0,0)

const blueSphere = new THREE.Mesh(
    sphereGeo,
    new THREE.MeshPhysicalMaterial({
        color:0x0000ff,
        metalness:1,
        roughness:0
    })
)
scene.add(blueSphere)
blueSphere.position.set(4,0,0)

const gui = new GUI()
gui.add()

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});