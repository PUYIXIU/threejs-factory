import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { GUI } from 'dat.gui'
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000);

const config = {
  strength:0.5,
  exposure: 0.5,
  radius: 0.3,
  threshold: 0.6,
  red: 1,
  green: 1,
  blue:1
}

const gui = new GUI()
const unrealBloomFolder = gui.addFolder('UnrealBloom')
unrealBloomFolder.add(config, 'strength', 0, 3).onChange(v => {
  unrealBloomPass.strength = v
})
unrealBloomFolder.add(config, 'exposure', 0, 3).onChange(v => {
  renderer.toneMappingExposure = v
})
unrealBloomFolder.add(config, 'radius', 0, 3).onChange(v => {
  unrealBloomPass.radius = v
})
unrealBloomFolder.add(config, 'threshold', 0, 1).onChange(v => {
  unrealBloomPass.threshold = v
})
// Sets the color of the background
renderer.setClearColor(0x000000);
renderer.outputColorSpace = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = config.exposure


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const controls1 = new OrbitControls(camera, renderer.domElement);
const controls2 = new TrackballControls(camera, renderer.domElement);
controls1.enableZoom = false;
controls1.enableDamping = true;
controls1.dampingFactor = 0.4

controls2.noZoom = false;
controls2.noRotate = true;
controls2.noPan = true;

camera.position.set(0, 0, 14);
controls1.update();
controls2.update()

renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = config.exposure

const effectComposer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    config.strength, config.radius, config.threshold
)
effectComposer.addPass(renderPass)
effectComposer.addPass(unrealBloomPass)

const outputPass = new OutputPass()
effectComposer.addPass(outputPass)

const uniforms = {
  u_resolution: {
    type: 'v2',
    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
  },
  u_time: {
    type: 'f',
    value: 0.0
  },
  u_frequency: {
    type: 'f',
    value:0.0
  },
  u_red:{type:'f',value:1.0},
  u_green:{type:'f',value:1.0},
  u_blue:{type:'f',value:1.0},
}

const colorFolder = gui.addFolder('color')
colorFolder.add(config, 'red', 0, 1).onChange(v => {
  uniforms.u_red.value = Number(v)
})
colorFolder.add(config, 'green', 0, 1).onChange(v => {
  uniforms.u_green.value = Number(v)
})
colorFolder.add(config, 'blue', 0, 1).onChange(v => {
  uniforms.u_blue.value = Number(v)
})
const mat = new THREE.ShaderMaterial({
  uniforms,
  wireframe:true,
  vertexShader: document.getElementById('v-shader').textContent,
  fragmentShader: document.getElementById('f-shader').textContent
})

const geo = new THREE.IcosahedronGeometry(4, 20)
const mesh = new THREE.Mesh(geo, mat)
scene.add(mesh)

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('./assets/audio/Beats.mp3', function(buffer) {
	sound.setBuffer(buffer);
	window.addEventListener('click', function() {
		sound.play();
	});
});

const analyser = new THREE.AudioAnalyser(sound, 32);

let mouseX = 0, mouseY = 0;
window.onmousemove = e => {
  let windowHalfX = window.innerWidth / 2
  let windowHalfY = window.innerHeight / 2
  mouseX = (e.clientX - windowHalfX)/100
  mouseY = (e.clientY - windowHalfY)/100
}

const clock = new THREE.Clock()
function animate() {
  uniforms.u_time.value = clock.getElapsedTime()
  uniforms.u_frequency.value = analyser.getAverageFrequency()
  controls1.update()
  controls2.update()
  // renderer.render(scene, camera);
  camera.position.x += (mouseX - camera.position.x) * 0.05
  camera.position.y += (-mouseY - camera.position.y) * 0.5
  camera.lookAt(scene.position)
  
  effectComposer.render()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
});