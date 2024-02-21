import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0x000000);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 0, 2);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x00ffff, 10)
scene.add(ambientLight)

let mouseX = 0;
let mouseY = 0

window.onmousemove = e=>{
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (e.clientX - windowHalfX) / 100;
    mouseY = (e.clientY - windowHalfY) / 100;
}

const loader = new GLTFLoader()
let mixer
loader.load('assets/drift_season.glb',gltf=>{
    mixer = new THREE.AnimationMixer(gltf.scene)
    const action = mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, "M_MED_SRDrift_tier0506_LOD0.ao|Male_commando_Idle_1")
    )
    action.play()
    gltf.scene.scale.set(0.01,0.01,0.01)
    gltf.scene.position.set(0,-1,0)
    scene.add(gltf.scene)
})

const clock = new THREE.Clock()
function animate() {
    if(mixer){
        mixer.update(clock.getDelta())
    }
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position)
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});