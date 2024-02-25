import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';
import { RenderPass } from 'three/examples/jsm/postprocessing/renderpass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/effectcomposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/unrealbloompass';
import { OutputPass } from 'three/examples/jsm/postprocessing/outputpass';

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
// camera.position.set(-8, -8, -8);
camera.position.set(0, 0, 14);
orbit.update();

const uniforms = {
  u_time: {
    type: 'f',
    value: 0.0
  },
  u_frequency: {
    type: 'f',
    value: 0.0
  },
  u_red: {type:'f', value:1.0},
  u_green: {type:'f', value:1.0},
  u_blue: {type:'f', value:1.0},
}

const gui = new GUI()
const colorFolder = gui.addFolder('color')
colorFolder.add(uniforms.u_red, 'value').min(0).max(1).name('red')
colorFolder.add(uniforms.u_green, 'value').min(0).max(1).name('green')
colorFolder.add(uniforms.u_blue, 'value').min(0).max(1).name('blue')

renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
const unrealBloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5, 0.2, 0.5
)
effectComposer.addPass(renderScene)
effectComposer.addPass(unrealBloomPass)

const outputPass = new OutputPass()
effectComposer.addPass(outputPass)

const unrealBloomFolder = gui.addFolder('unreal bloom')
unrealBloomFolder.add(unrealBloomPass,'strength',0,3)
unrealBloomFolder.add(unrealBloomPass,'radius',0,3)
unrealBloomFolder.add(unrealBloomPass,'threshold',0,1)
unrealBloomFolder.add(renderer,'toneMappingExposure',0,3)

const mat = new THREE.ShaderMaterial({
  uniforms,
  wireframe:true,
  vertexShader: document.getElementById('v-shader').textContent,
  fragmentShader:document.getElementById('f-shader').textContent
})

const geo = new THREE.IcosahedronGeometry(4, 20)

const mesh = new THREE.Mesh(geo, mat)
scene.add(mesh)

const listener = new THREE.AudioListener();
camera.add(listener)

const sound = new THREE.Audio(listener)

const audioLoader = new THREE.AudioLoader();
audioLoader.load('./assets/audio/Beats.mp3', function (buffer) {
  sound.setBuffer(buffer);
  sound.loop = true
  sound.play()
})

const analyser = new THREE.AudioAnalyser(sound, 32)

let mouseX = 0, mouseY = 0;
window.onmousemove = e => {
  let halfWidth = window.innerWidth / 2
  let halfHeight = window.innerHeight / 2
  mouseX = (e.clientX - halfWidth)/100.0
  mouseY = (e.clientY - halfHeight)/100.0
}

const clock = new THREE.Clock()
function animate() {
  uniforms.u_time.value = clock.getElapsedTime()
  uniforms.u_frequency.value = analyser.getAverageFrequency()
  
  camera.position.x +=  (-camera.position.x + mouseX)*0.05
  camera.position.y +=  (-camera.position.y - mouseY) * 0.05
  camera.lookAt(scene.position)

  effectComposer.render()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effectComposer.setSize(window.innerWidth, window.innerHeight)
  renderer.setSize(window.innerWidth, window.innerHeight);
});