import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xFEFEFE);

renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.8
const scene = new THREE.Scene();

const backgroundUrl = new URL('../asserts/kitchen.hdr',import.meta.url)
const rgbeLoader = new RGBELoader()

rgbeLoader.load(backgroundUrl.href, texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.background = texture
  // scene.environment = texture
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(3,50,50),
    new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 1,
      envMap:texture
    })
  )
  scene.add(sphere)
  sphere.position.set(4, 0, 0)
  
  const sphere2 = new THREE.Mesh(
    new THREE.SphereGeometry(3,50,50),
    new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 1,
      color: 0xffef00,
      envMap: texture
    })
  )
  scene.add(sphere2)
  sphere2.position.set(-4, 0, 0)
})

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

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});