import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/gltfloader';
import { RenderPass } from 'three/examples/jsm/postprocessing/renderpass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/effectcomposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/unrealbloompass';
import { OutputPass } from 'three/examples/jsm/postprocessing/outputpass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/shaderpass';

import { GUI } from 'dat.gui';
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
camera.position.set(0, 2.7, 5);
orbit.update();

const configs = {
  strength: 1.5,
  radius: 1,
  threshold: 0.1,
  exposure:2.5,
}
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = configs.exposure
const gui = new GUI()
const unrealBloomFolder = gui.addFolder('Unreal Bloom')
unrealBloomFolder.add(configs, 'strength', 0, 2, 0.1).onChange(val=>unrealBloomPass.strength = val)
unrealBloomFolder.add(configs, 'radius', 0, 2, 0.1).onChange(val=>unrealBloomPass.radius = val)
unrealBloomFolder.add(configs, 'threshold', 0, 1, 0.1).onChange(val=>unrealBloomPass.threshold = val)
unrealBloomFolder.add(configs, 'exposure', 0, 4, 0.1).onChange(val=>renderer.toneMappingExposure = val)

const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
const unrealBloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  configs.strength,
  configs.radius,
  configs.threshold,
)
effectComposer.addPass(renderScene)
effectComposer.addPass(unrealBloomPass)

effectComposer.renderToScreen = false

const finalComposer = new EffectComposer(renderer)
finalComposer.addPass(renderScene)

const shaderPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      //  将effectComposer的效果作为参数纹理传递
      bloomTexture: {value:effectComposer.renderTarget2.texture}
    },
    vertexShader:document.getElementById('vertex-shader').textContent,
    fragmentShader:document.getElementById('fragment-shader').textContent,
  }),
  'baseTexture'
)
finalComposer.addPass(shaderPass)

const outputPass = new OutputPass()
finalComposer.addPass(outputPass)

const BLOOM_LAYER = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_LAYER)
const darkMateial = new THREE.MeshStandardMaterial({ color: 0x000000 })
const materials = {}

// 存储不在bloom层的原始纹理
function nonBloomed(obj) {
  if (obj.isMesh && !bloomLayer.test(obj.layers)) {
    materials[obj.uuid] = obj.material
    obj.material = darkMateial
  }
}

// 取出原始纹理
function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid]
    delete materials[obj.uuid]
  }
}

const mousePosition = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
function mousedown(e) {
  mousePosition.x = (e.offsetX * 2 / window.innerWidth) - 1 
  mousePosition.y = 1 - (e.offsetY * 2 / window.innerHeight)
  raycaster.setFromCamera(mousePosition, camera)
  const intersections = raycaster.intersectObject(model)
  if (intersections[0] && intersections[0].object.isObject3D) {
    intersections[0].object.layers.toggle(BLOOM_LAYER)
  }
}
// window.onmousedown = mousedown

let model, mixer;
const loader = new GLTFLoader()
loader.load('assets/fantasy_sword.glb', gltf => {
  model = gltf.scene
  scene.add(model)
  model.position.set(0, 126, -127)
  mixer = new THREE.AnimationMixer(model)
  const action = mixer.clipAction(
    THREE.AnimationClip.findByName(gltf.animations,"Idle")
  )
  action.play()
  createGUI()
})

function createGUI() {
  const modelNames = ['Object_11', 'Object_12', 'Object_13', 'Object_14']
  const params = {}
  const modelFolder = gui.addFolder('Model')
  modelNames.forEach(name => {
    params[name] = false
    modelFolder.add(params, name).onChange(val => {
      model.getObjectByName(name).layers.toggle(BLOOM_LAYER)
    })
  })
}

const clock = new THREE.Clock()
function animate() {
  if (mixer) { 
    mixer.update(clock.getDelta())
  }
  // renderer.render(scene, camera);
  scene.traverse(nonBloomed)
  effectComposer.render()
  scene.traverse(restoreMaterial)
  finalComposer.render()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  effectComposer.setSize(window.innerWidth, window.innerHeight)
  finalComposer.setSize(window.innerWidth, window.innerHeight)
});