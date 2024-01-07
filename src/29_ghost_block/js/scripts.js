import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as YUKA from 'yuka'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xB2D3FF);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, -30, 0);
orbit.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionLight = new THREE.DirectionalLight(0xffffff,2)
scene.add(directionLight)
directionLight.position.set(0,-20,0)
function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)
}

const entityManager = new YUKA.EntityManager()
const loader = new GLTFLoader()

const alignmentBehavior = new YUKA.AlignmentBehavior()
alignmentBehavior.weight = 2

const cohesionBehavior = new YUKA.CohesionBehavior()
cohesionBehavior.weight = 0.5

const separationBehavior = new YUKA.SeparationBehavior()
separationBehavior.weight = 0.3
let mixer
loader.load('/assets/Characters_Shark.gltf', gltf => {
  const animationGroup = new THREE.AnimationObjectGroup()
  mixer = new THREE.AnimationMixer(animationGroup)
  const action = mixer.clipAction(
    THREE.AnimationClip.findByName(gltf.animations, 'Swim')
  )
  action.play()
  for (let i = 0; i < 50; i++){
    const model = SkeletonUtils.clone(gltf.scene)
    model.matrixAutoUpdate = false
    scene.add(model)
    animationGroup.add(model)
    const vehicle = new YUKA.Vehicle()
    vehicle.setRenderComponent(model, sync)
    vehicle.scale = new YUKA.Vector3(0.5, 0.5, 0.5)
    vehicle.position.set(
      (0.5 - Math.random()) * 10,
      0,
      (0.5-Math.random())*10,
    )
    vehicle.rotation.fromEuler(0, 2*Math.PI*Math.random(),0)
    entityManager.add(vehicle)
    vehicle.updateNeighborhood = true
    vehicle.neighborhoodRadius = 10
    const wanderBehavior = new YUKA.WanderBehavior()
    wanderBehavior.weight = 0.9
    vehicle.steering.add(wanderBehavior)
    vehicle.steering.add(separationBehavior)
    vehicle.steering.add(cohesionBehavior)
    vehicle.steering.add(alignmentBehavior)
  }  
})



const time = new YUKA.Time()
const clock = new THREE.Clock()
function animate() {
  let delta = time.update().getDelta()
  entityManager.update(delta)
  let clockDelta = clock.getDelta()
  mixer && mixer.update(clockDelta)
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});