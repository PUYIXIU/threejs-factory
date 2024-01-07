import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass'
import { GlitchPass, GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { GUI } from 'dat.gui'

const renderer = new THREE.WebGLRenderer({ antialias: true });
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
camera.position.set(0, 25, 0);
orbit.update();

const loadingManager = new THREE.LoadingManager()
const progressBar = document.getElementById('loading-progress')
loadingManager.onProgress = (url, loaded, total) => {
  progressBar.setAttribute('value', loaded / total * 100)
}
loadingManager.onLoad = () => {
  setTimeout(() => {
    document.querySelector('.progress-layer').style.display = 'none'
  }, 300)
}

window.onmousedown = e => {
  console.log(camera.position)
}

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
effectComposer.addPass(renderScene)

const unrealBloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.6,
  0.1,
  0.1
)
effectComposer.addPass(unrealBloomPass)

const filmPass = new FilmPass(3, true)

const glitchPass = new GlitchPass(1)

const options = {
  showUnrealBloomPass: true,
  showFilmPass: false,
  showGlitchPass: false,
}

const gui = new GUI()

const toggleEffect = (effect, show) => {
  if (show) effectComposer.addPass(effect)
  else effectComposer.removePass(effect)
}

const unrealBloomPassOptions = gui.addFolder('unrealBloomPassOptions')
gui.add(options, 'showUnrealBloomPass').onChange(e => toggleEffect(unrealBloomPass, e))
unrealBloomPassOptions.add(unrealBloomPass, 'threshold', 0, 1)
unrealBloomPassOptions.add(unrealBloomPass, 'strength', 0, 3)
unrealBloomPassOptions.add(unrealBloomPass, 'radius', 0, 3)

gui.add(options, 'showFilmPass').onChange(e => toggleEffect(filmPass, e))
gui.add(options, 'showGlitchPass').onChange(e => toggleEffect(glitchPass, e))


// render
gui.add(renderer, 'toneMappingExposure', 0, 3)

const loader = new GLTFLoader(loadingManager)
let mixer
loader.load('/assets/ethereal_polynucleotide.glb', gltf => {
  scene.add(gltf.scene)
  mixer = new THREE.AnimationMixer(gltf.scene)
  const action = mixer.clipAction(gltf.animations[0])
  action.play()
})

const clock = new THREE.Clock()
function animate() {
  let delta = clock.getDelta()
  if (mixer) mixer.update(delta)
  effectComposer.render()
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});