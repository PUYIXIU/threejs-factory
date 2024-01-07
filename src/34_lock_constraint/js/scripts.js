import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true
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
camera.position.set(0, 7, 15);
camera.lookAt(0, 0, 0)
orbit.update();

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
})

const size = 0.5
const space = size * 0.1
const N = 10
const shape = new CANNON.Box(new CANNON.Vec3(size, size, size))
const mass = 1

const meshes = []
const bodies = []

const geo = new THREE.BoxGeometry(size * 2, size * 2, size * 2)
const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 })

for (let i = 0; i < N; i++) {
  const boxBody = new CANNON.Body({
    shape,
    mass,
    position: new CANNON.Vec3((i - N / 2) * (size+space) * 2, 0, 0)
    // position: new CANNON.Vec3(-(N-i-N/2), 0, 0)
  })
  world.addBody(boxBody)
  bodies.push(boxBody)
  const boxMesh = new THREE.Mesh(geo, mat)
  scene.add(boxMesh)
  meshes.push(boxMesh)

  if (i > 0) {
    const lockConstraint = new CANNON.LockConstraint(boxBody, bodies[i - 1])
    world.addConstraint(lockConstraint)
  }

}

const leftFlatMesh = new THREE.Mesh(geo, mat)
scene.add(leftFlatMesh)
meshes.push(leftFlatMesh)
const leftFlatBody = new CANNON.Body({
  shape,
  type: CANNON.BODY_TYPES.STATIC,
  position:new CANNON.Vec3(-N*(size+space),-3,0)
})
world.addBody(leftFlatBody)
bodies.push(leftFlatBody)

const rightFlatMesh = new THREE.Mesh(geo, mat)
scene.add(rightFlatMesh)
meshes.push(rightFlatMesh)
const rightFlatBody = new CANNON.Body({
  shape,
  type: CANNON.BODY_TYPES.STATIC,
  position:new CANNON.Vec3((N-1 - N / 2) * (size+space) * 2,-3,0)
})
world.addBody(rightFlatBody)
bodies.push(rightFlatBody)

function animate() {
  world.step(1 / 60)
  for (let i = 0; i < meshes.length; i++) {
    meshes[i].position.copy(bodies[i].position)
    meshes[i].quaternion.copy(bodies[i].quaternion)
  }
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});