import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'

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
camera.position.set(6, 8, 14);
orbit.update();

const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
})

const row = 15
const col = 15
const size = 0.2
const space = 0.05
const ballMeshes = []
const ballBodies = []
const ballGeo = new THREE.SphereGeometry(size)
const ballMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 })
const particles = {}
for (let i = 0; i < row; i++) {
  for (let j = 0; j < col; j++) {
    const ballMesh = new THREE.Mesh(ballGeo, ballMat)
    ballMeshes.push(ballMesh)
    const x = (i - row / 2) * (size * 2 + space) + size
    const z = (j - col / 2) * (size * 2 + space) + size
    scene.add(ballMesh)
    const body = new CANNON.Body({
      shape: new CANNON.Sphere(size),
      position: new CANNON.Vec3(x, 5, z),
      mass: 1
    })
    world.addBody(body)
    ballBodies.push(body)
    particles[`${i} ${j}`] = body
  }
}

function connect(i1, j1, i2, j2) {
  const distanceConstrain = new CANNON.DistanceConstraint(
    particles[`${i1} ${j1}`],
    particles[`${i2} ${j2}`],
    space*10
  )
  world.addConstraint(distanceConstrain)
}

for (let i = 0; i < row; i++) {
  for (let j = 0; j < col; j++) {
    if (i < row - 1)
      connect(i, j, i + 1, j)
    if (j < col - 1)
      connect(i, j, i, j + 1)
  }
}

const sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(3),
  new THREE.MeshBasicMaterial({ color: 0x00aaff })
)
scene.add(sphereMesh)
ballBodies.push(sphereMesh)
const sphereBody = new CANNON.Body({
  shape: new CANNON.Sphere(3),
  position: new CANNON.Vec3(0, 0, 0),
  type: CANNON.BODY_TYPES.STATIC
})
world.addBody(sphereBody)

const clock = new THREE.Clock()
function animate() {
  const delta = clock.getDelta()
  world.step(delta)
  ballMeshes.forEach((mesh, index) => {
    const body = ballBodies[index]
    mesh.position.copy(body.position)
    mesh.quaternion.copy(body.quaternion)
  })
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});