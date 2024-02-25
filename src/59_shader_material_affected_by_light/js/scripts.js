import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import {DotScreenPass} from 'three/examples/jsm/postprocessing/DotScreenPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/unrealbloompass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass'

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
camera.position.set(6, 8, 14);
orbit.update();

const renderScene = new RenderPass(scene, camera);
const effectComposer = new EffectComposer(renderer)
// const dotScreenPass = new DotScreenPass(
//   scene.position,
//   Math.PI / 3,
//   2
// )
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.3
const unrealBloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.3, 0.2, 0.5
)
effectComposer.addPass(renderScene)
effectComposer.addPass(unrealBloomPass)
// effectComposer.addPass(dotScreenPass)

const outputPass = new OutputPass()
effectComposer.addPass(outputPass)

const directionalLight = new THREE.DirectionalLight(0xccffff, 5 )
directionalLight.position.set(60, 60, 60)
scene.add(directionalLight)
const directionalLight2 = new THREE.DirectionalLight(0xffccff, 5 )
directionalLight2.position.set(-60,-60,-60)
scene.add(directionalLight2)


const uniforms = {
  u_resolution: {
    type: 'v2',
    value:new THREE.Vector2(window.innerWidth,window.innerHeight),
  },
  u_time: {
    type: 'f',
    value:0.0
  }
}

const geo = new THREE.IcosahedronGeometry(1,20)
const mat = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: document.getElementById('v-shader').textContent,
  fragmentShader: document.getElementById('f-shader').textContent
})

const custom_mat = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  metalness: 0.6,
  roughness:0.3,
  uniforms,
  vertexShader: document.getElementById('v-shader').textContent,
  fragmentShader: document.getElementById('f-shader').textContent
})

for (let i = 0; i < 500; i++){
  const x = (Math.random() - 0.5) * 100
  const y = (Math.random() - 0.5) * 100
  const z = (Math.random() - 0.5) * 100
  const mesh = new THREE.Mesh(geo, custom_mat)
  mesh.position.set(x,y,z)
  scene.add(mesh)
}

const clock = new THREE.Clock()
function animate() {
  uniforms.u_time.value = clock.getElapsedTime()
  // renderer.render(scene, camera);
  effectComposer.render()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  uniforms.u_resolution.value.x = window.innerWidth
  uniforms.u_resolution.value.y = window.innerHeight
  effectComposer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);
});