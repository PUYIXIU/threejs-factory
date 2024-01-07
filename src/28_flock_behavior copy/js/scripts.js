import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as YUKA from 'yuka'
const renderer = new THREE.WebGLRenderer({ antialias: true });
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
camera.position.set(0, 20, 0);
orbit.update();

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)
}
const entityManager = new YUKA.EntityManager()

const alignmentBehavior = new YUKA.AlignmentBehavior()
alignmentBehavior.weight = 2

const cohesionBehavior = new YUKA.CohesionBehavior()
cohesionBehavior.weight = 0.9

const separationBehavior = new YUKA.SeparationBehavior()
separationBehavior.weight = 0.2

for (let i = 0; i < 100; i++) {
  const vehicleGeo = new THREE.ConeBufferGeometry(0.1, 0.8, 8)
  vehicleGeo.rotateX(Math.PI / 2)
  const vehicleMat = new THREE.MeshNormalMaterial()
  const vehicleMesh = new THREE.Mesh(vehicleGeo, vehicleMat)
  vehicleMesh.matrixAutoUpdate = false
  scene.add(vehicleMesh)
  const vehicle = new YUKA.Vehicle()
  vehicle.setRenderComponent(vehicleMesh, sync)
  vehicle.rotation.fromEuler(0, 2*Math.PI * Math.random(), 0)
  vehicle.position.set(
    (0.5 - Math.random()) * 5,
    0,
    (0.5-Math.random())*5,
  )
  const wanderBehavior = new YUKA.WanderBehavior()
  wanderBehavior.weight = 0.8
  vehicle.steering.add(wanderBehavior)
  vehicle.steering.add(alignmentBehavior)
  vehicle.steering.add(cohesionBehavior)
  vehicle.steering.add(separationBehavior)
  vehicle.updateNeighborhood = true
  vehicle.neighborhoodRadius = 10
  entityManager.add(vehicle)
}

const time = new YUKA.Time()
function animate() {
  let delta = time.update().getDelta()
  entityManager.update(delta)

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});