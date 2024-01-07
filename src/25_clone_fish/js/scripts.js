import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as YUKA from 'yuka'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x95B4EA);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 40, 0);
orbit.update();


const ambientLight = new THREE.AmbientLight(0xffffff,1)
scene.add(ambientLight)

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)
}

const entityManager = new YUKA.EntityManager()
const gltfLoader = new GLTFLoader()
let fishAnimateGroup = new THREE.AnimationObjectGroup()
let mixer
gltfLoader.load('/assets/Characters_Shark.gltf', gltf => {
  fishModel = gltf
  fishModel.scene.matrixAutoUpdate = false
  mixer = new THREE.AnimationMixer(fishAnimateGroup)
  const action = mixer.clipAction(
    // THREE.AnimationClip.findByName(fishModel.animations, 'Fish_001_animate_preview')
    THREE.AnimationClip.findByName(fishModel.animations, 'Swim')
  )
  action.play()
  for (let i = 0; i < 50; i++){
    createFish()
  }
})

function createFish() {
  const model = SkeletonUtils.clone(fishModel.scene)
  scene.add(model)
  fishAnimateGroup.add(model)
  const vehicle = new YUKA.Vehicle()
  vehicle.setRenderComponent(model, sync)
  const wanderBehavior = new YUKA.WanderBehavior()
  vehicle.position.set(
    (0.5-Math.random())*20,
    (0.5-Math.random())*5,
    (0.5-Math.random())*20,
  )
  vehicle.rotation.fromEuler(0, 2 * Math.PI * Math.random(), 0)
  // vehicle.scale = new YUKA.Vector3(0.01, 0.01, 0.01)
  // vehicle.scale = new YUKA.Vector3(0.1, 0.1, 0.1)

  vehicle.steering.add(wanderBehavior)
  entityManager.add(vehicle)
}

const time = new YUKA.Time()
const clock = new THREE.Clock()
function animate() {
  let delta = time.update().getDelta()
  entityManager.update(delta)
  let clockDelta = clock.getDelta()
  if (mixer) mixer.update(clockDelta)
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});