import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { GUI } from 'dat.gui';

const renderBox = document.getElementById('render-box')

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(renderBox.clientWidth, renderBox.clientHeight);
renderBox.appendChild(renderer.domElement);
renderer.setClearColor(0x000000);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    renderBox.clientWidth / renderBox.clientHeight,
    0.1,
    1000
);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 14);
orbit.update();

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 200, 0)
scene.add(directionalLight)

const geo = new THREE.SphereGeometry(4)
for (let i = 0; i < 300; i++){
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff * Math.random(),
  })
  const mesh = new THREE.Mesh(geo, mat)
  const scale = Math.random() * 1.5
  mesh.scale.set(scale,scale,scale)
  mesh.position.set(
    (Math.random() - 0.5) * 300,
    (Math.random() - 0.5) * 300,
    (Math.random() - 0.5) * 300
  )
  scene.add(mesh)
}

renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

const renderScene = new RenderPass(scene, camera)
const bloomComposer = new EffectComposer(renderer)
const unrealBloomPass = new UnrealBloomPass(
  new THREE.Vector2(renderBox.clientWidth, renderBox.clientHeight),
  2.4, 1,0
)
bloomComposer.addPass(renderScene)
bloomComposer.addPass(unrealBloomPass)
bloomComposer.renderToScreen = false

const finalComposer = new EffectComposer(renderer)
const mixPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { type: 't', value: null },
      bloomTexture: {
        type: 't',
        value:bloomComposer.renderTarget2.texture
      }
    },
    vertexShader: document.getElementById('v-shader').textContent,
    fragmentShader:document.getElementById('f-shader').textContent
  }),'baseTexture'
)
const outputPass = new OutputPass()
finalComposer.addPass(renderScene)
finalComposer.addPass(mixPass)
finalComposer.addPass(outputPass)

const gui = new GUI()
gui.add(renderer, 'toneMappingExposure', 0, 3).name('exposure')
gui.add(unrealBloomPass, 'strength',0,3)
gui.add(unrealBloomPass, 'radius',0,3)
gui.add(unrealBloomPass, 'threshold',0,1)

const BLOOM_LAYER = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_LAYER)
const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
const material = {}

function storeMaterial(obj) { 
  if (obj.isObject3D && ! bloomLayer.test(obj.layers)) { 
    material[obj.uuid] = obj.material
    obj.material = darkMaterial
  }
}

function loadMaterial(obj) {
  if (material[obj.uuid] !== undefined) {
    obj.material = material[obj.uuid]
    delete material[obj.uuid]
  }
}

// 鼠标射线
const mousePosition = new THREE.Vector2()
const raycast = new THREE.Raycaster()
window.onmousedown = e => {
  mousePosition.x = e.offsetX/renderBox.clientWidth*2 -1 
  mousePosition.y = 1- e.offsetY/renderBox.clientHeight*2
  raycast.setFromCamera(mousePosition, camera)
  const intersections = raycast.intersectObjects(scene.children)
  if (intersections[0] && intersections[0].object.isObject3D) { 
    intersections[0].object.layers.toggle(BLOOM_LAYER)
  }
}

function animate() {
  // renderer.render(scene, camera);
  scene.traverse(storeMaterial)
  bloomComposer.render()
  scene.traverse(loadMaterial)
  finalComposer.render()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
  camera.aspect = renderBox.clientWidth / renderBox.clientHeight;
  camera.updateProjectionMatrix();
  bloomComposer.setSize(renderBox.clientWidth, renderBox.clientHeight);
  finalComposer.setSize(renderBox.clientWidth, renderBox.clientHeight);
  renderer.setSize(renderBox.clientWidth, renderBox.clientHeight);
});