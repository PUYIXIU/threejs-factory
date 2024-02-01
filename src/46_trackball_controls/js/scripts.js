import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xd8fff8);
renderer.outputEncoding = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(6, 8, 14);

const orbitControls = new OrbitControls(camera,renderer.domElement)
orbitControls.enableDamping = true
orbitControls.dampingFactor = 0.12
orbitControls.enableZoom = false

const trackBallControls = new TrackballControls(camera, renderer.domElement)
trackBallControls.noRotate = true
trackBallControls.noPan = true
trackBallControls.noZoom = false
trackBallControls.zoomSpeed = 1.5

const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3,
    0.1,
    0.5
)
effectComposer.addPass(renderScene)
effectComposer.addPass(unrealBloomPass)

const ambientLight = new THREE.AmbientLight(0xffffff,1.5)
scene.add(ambientLight)

const hemisphereLight = new THREE.HemisphereLight(0x84bee7, 0x7aa873,1.3)
scene.add(hemisphereLight)

const directionLight = new THREE.DirectionalLight(0xfffad8,3)
directionLight.position.set(1,20,-10)
scene.add(directionLight)


const loader = new GLTFLoader()
let mixer
loader.load('/assets/medieval_fantasy_book.glb',gltf=>{
    scene.add(gltf.scene)
    mixer = new THREE.AnimationMixer(gltf.scene)
    const action = mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, "The Life")
    )
    action.play()
})

const clock = new THREE.Clock()
function animate() {
    const target = orbitControls.target
    orbitControls.update()
    trackBallControls.target.set(target.x, target.y, target.z)
    trackBallControls.update()

    const delta = clock.getDelta()
    if(mixer)
        mixer.update(delta)
    effectComposer.render()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});