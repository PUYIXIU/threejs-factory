import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as YUKA from 'yuka'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xefefef);
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

const entityManager = new YUKA.EntityManager()
function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)
}

const vehicleGeo = new THREE.ConeBufferGeometry(0.1, 0.8, 8)
vehicleGeo.rotateX(Math.PI / 2)
const vehicleMat = new THREE.MeshNormalMaterial()
const vehicleMesh = new THREE.Mesh(vehicleGeo, vehicleMat)
vehicleMesh.matrixAutoUpdate = false
scene.add(vehicleMesh)
const vehicle = new YUKA.Vehicle()
vehicle.maxSpeed = 5
vehicle.setRenderComponent(vehicleMesh, sync)
entityManager.add(vehicle)


const evaderMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.2),
  new THREE.MeshBasicMaterial({ color: 0xffaa00 })
)
evaderMesh.matrixAutoUpdate = false

const evaderMesh1 = evaderMesh.clone()
scene.add(evaderMesh1)
const evaderMesh2 = evaderMesh.clone()
scene.add(evaderMesh2)

const evader1 = new YUKA.Vehicle()
const evader2 = new YUKA.Vehicle()

evader1.setRenderComponent(evaderMesh1, sync)
evader2.setRenderComponent(evaderMesh2, sync)

entityManager.add(evader1)
entityManager.add(evader2)

const interposeBehavior = new YUKA.InterposeBehavior(evader1, evader2)
vehicle.steering.add(interposeBehavior)

const lineGeo = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(),
  new THREE.Vector3()
])
const lineMat = new THREE.LineBasicMaterial({ color: 0xffaa00 })
const line = new THREE.Line(lineGeo, lineMat)
scene.add(line)

const time = new YUKA.Time()
function animate() {
  let delta = time.update().getDelta()
  entityManager.update(delta)

  let elapsed = time.getElapsed()
  evader1.position.set(
    6 * Math.cos(elapsed * 0.1) * Math.sin(elapsed * 0.1),
    0,
    6 * Math.sin(0.3 * elapsed)
  )
  evader2.position.set(
    1 + Math.cos(elapsed * 0.5) * Math.sin(elapsed * 0.3) * 4,
    0,
    1 + Math.sin(elapsed * 0.3) * 6
  )

  const linePosition = line.geometry.attributes.position
  linePosition.setXYZ(0, evader1.position.x, 0, evader1.position.z)
  linePosition.setXYZ(1, evader2.position.x, 0, evader2.position.z)
  linePosition.needsUpdate = true
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});