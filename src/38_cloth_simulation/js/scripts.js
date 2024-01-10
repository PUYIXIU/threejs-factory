import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xafafaf);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-1, 1, 1);
orbit.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(3,3,-3)
scene.add(directionalLight)
const world = new CANNON.World({
  gravity:new CANNON.Vec3(0, -9.81, 0)
})

const Nx = 15
const Ny = 15
const mass = 1
const clothSize = 1
const dist = clothSize / Nx
const shape = new CANNON.Particle()
const particles = []

const clothGeo = new THREE.PlaneGeometry(1, 1, Nx, Ny)
const clothMesh = new THREE.Mesh(
  clothGeo,
  new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    map:new THREE.TextureLoader().load('/assets/jean-philippe-delberghe-75xPHEQBmvA-unsplash.jpg')
  })
)
scene.add(clothMesh)


for (let i = 0; i < Nx + 1; i++){
  const row = []
  for (let j = 0; j < Ny + 1; j++){
    const body = new CANNON.Body({
      shape,
      mass:j==Ny?0:mass,
      position: new CANNON.Vec3((i - Nx / 2) * dist, (j - Ny / 2) * dist, 0),
      velocity:new CANNON.Vec3(0,0,-0.1*(Ny-j))
    })
    world.addBody(body)
    row.push(body)
  }
  particles.push(row)
}

for (let i = 0; i < Nx + 1; i++){
  for (let j = 0; j < Ny + 1; j++) {
    if (i < Nx)
      createConstraint(i, j, i + 1, j)
    if (j < Ny)
      createConstraint(i, j, i, j + 1)
  }
}

function createConstraint(i1, j1, i2, j2) {
  const constraint = new CANNON.DistanceConstraint(
    particles[i1][j1],
    particles[i2][j2],
    dist
  )
  world.addConstraint(constraint)
}

function updatePosition() {
  for (let i = 0; i < Nx+1; i++){
    for (let j = 0; j < Ny + 1; j++){
      const index = (Nx + 1) * j + i
      const particlePosition = particles[i][Ny-j]
      const position = clothGeo.attributes.position
      position.setXYZ(index, particlePosition.position.x, particlePosition.position.y, particlePosition.position.z)
      position.needsUpdate = true
    }
  }
}

const sphereSize = 0.1
const movementRadius = 0.2
const sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(sphereSize),
  new THREE.MeshPhongMaterial()
)
scene.add(sphereMesh) 

const sphereBody = new CANNON.Body({
  shape: new CANNON.Sphere(sphereSize*1.7)
})
world.addBody(sphereBody)

const timeStep = 1/60
function animate(time) {
  world.step(timeStep)
  updatePosition()
  sphereBody.position.set(
    movementRadius * Math.sin(time/1000),
    0,
    movementRadius * Math.cos(time/1000)
  )
  sphereMesh.position.copy(sphereBody.position)

  particles.forEach((body, index) => {
    
  })
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});