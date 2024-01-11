import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x958BA5);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(1, 1, -2);
orbit.update();

const ambientLight = new THREE.AmbientLight(0xfffffff, 1)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
directionalLight.position.set(1, 2, -2)
scene.add(directionalLight)

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
})
const row = 15
const col = 15
const mass = 1
const size = 1
const dist = size/row
const radius = 0.2
const shape = new CANNON.Particle()
const bodies = []
const clothGeo = new THREE.PlaneGeometry(1, 1, row, col)
const clothMaterial = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  map:new THREE.TextureLoader().load('/assets/jean-philippe-delberghe-75xPHEQBmvA-unsplash.jpg')
})
const clothMesh = new THREE.Mesh(clothGeo, clothMaterial)
scene.add(clothMesh)

for (let i = 0; i < row + 1; i++) {
  const vec = []
  for (let j = 0; j < col + 1; j++) {
    const body = new CANNON.Body({
      shape,
      mass:j==col?0:mass,
      position: new CANNON.Vec3((i - row / 2) * dist, (j - col / 2) * dist, 0),
      velocity:new CANNON.Vec3(0,-0.1*(col-j))
    })
    world.addBody(body)
    vec.push(body)
  }
  bodies.push(vec)
}

function createConstraint(i1, j1, i2, j2) {
  const constraint = new CANNON.DistanceConstraint(
    bodies[i1][j1],
    bodies[i2][j2],
    dist
  )
  world.addConstraint(constraint)
}

for (let i = 0; i <= row; i++) {
  for (let j = 0; j <= col; j++) {
    if (i < row)
      createConstraint(i, j, i + 1, j)
    if (j < col)
      createConstraint(i, j, i, j + 1)
  }
}


function updatePosition() {
  for (let i = 0; i <= row; i++) {
    for (let j = 0; j <= col; j++) {
      const index = i * (row + 1) + j
      const position = clothGeo.attributes.position
      const bodyPosition = bodies[i][j].position
      position.setXYZ(index, bodyPosition.x, bodyPosition.y, bodyPosition.z)
      position.needsUpdate = true
    }
  }
}


const sphereGeo = new THREE.SphereGeometry(radius)
const sphereMat = new THREE.MeshPhysicalMaterial({})
const sphere = new THREE.Mesh(sphereGeo, sphereMat)
scene.add(sphere)
const sphereBody = new CANNON.Body({
  shape: new CANNON.Sphere(radius*1.3),
  type: CANNON.BODY_TYPES.STATIC
})
world.addBody(sphereBody)

const timeStep = 1 / 60
function animate(time) {
  world.step(timeStep)
  updatePosition()
  sphereBody.position.set(
    radius * Math.sin(time / 1000),
    0,
    radius * Math.cos(time / 1000),
  )
  sphere.position.copy(sphereBody.position)
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});