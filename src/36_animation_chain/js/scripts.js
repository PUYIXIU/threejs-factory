import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xfefefe);
renderer.shadowMap.enabled = true
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-4.5, 6, 6);
orbit.update();

const renderScene = new RenderPass(scene, camera)
const effectCompoer = new EffectComposer(renderer)
effectCompoer.addPass(renderScene)

// const pixelatedPass = new RenderPixelatedPass(1, scene, camera)
// effectCompoer.addPass(pixelatedPass)

window.onmousedown = e => {
  console.log(camera.position)
}

const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 5.5)
scene.add(ambientLight)

let mixer
const gltfLoader = new GLTFLoader()
gltfLoader.load('/assets/Alpaca.gltf', gltf => {
  scene.add(gltf.scene)
  mixer = new THREE.AnimationMixer(gltf.scene)
  const action_eat = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Eating'))
  action_eat.loop = THREE.LoopOnce
  action_eat.play()
  const action_walk = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Idle'))
  action_walk.loop = THREE.LoopOnce
  // action_walk.play()

  mixer.addEventListener('finished', function (e) {
    if (e.action._clip.name === 'Eating') {
      action_walk.reset()
      action_walk.play()
    } else if (e.action._clip.name === 'Walk') {
      action_eat.reset()
      action_eat.play()
    }
  })
})

const clock = new THREE.Clock()
function animate() {
  const delta = clock.getDelta()
  mixer && mixer.update(delta)
  // renderer.render(scene, camera);
  effectCompoer.render();
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});