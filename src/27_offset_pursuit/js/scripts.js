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
camera.position.set(0, 15, 0);
orbit.update();

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)
}
const entityManager = new YUKA.EntityManager()

const leaderGeo = new THREE.ConeBufferGeometry(0.1, 0.8, 8)
leaderGeo.rotateX(Math.PI / 2)
const leaderMat = new THREE.MeshNormalMaterial()
const leaderMesh = new THREE.Mesh(leaderGeo, leaderMat)
leaderMesh.matrixAutoUpdate = false
scene.add(leaderMesh)

const leader = new YUKA.Vehicle()
const smoother = new YUKA.Smoother(10)
leader.smoother = smoother
leader.maxSpeed = 5
leader.setRenderComponent(leaderMesh, sync)
entityManager.add(leader)
const target = new YUKA.Vector3()
const seekBehavior = new YUKA.SeekBehavior(target)
leader.steering.add(seekBehavior)


const followOffsets = [
  new YUKA.Vector3(0, 0, 0),
  new YUKA.Vector3(-0.3, 0, -0.3),
  new YUKA.Vector3(-0.5, 0, -0.5),
  new YUKA.Vector3(0.3, 0, -0.3),
  new YUKA.Vector3(0.5, 0, -0.5),
]
function createFollower(offset) {
  const followerMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  )
  followerMesh.matrixAutoUpdate = false
  scene.add(followerMesh)
  const follower = new YUKA.Vehicle()
  follower.maxSpeed = 3
  follower.setRenderComponent(followerMesh, sync)
  entityManager.add(follower)
  const offsetPursuitBehavior = new YUKA.OffsetPursuitBehavior(leader, offset)
  follower.steering.add(offsetPursuitBehavior)
}
followOffsets.forEach(offset => {
  createFollower(offset)
})



const time = new YUKA.Time()
function animate() {
  let delta = time.update().getDelta()
  entityManager.update(delta)

  const elasped = time.getElapsed()
  target.x = 3 * Math.cos(0.5*elasped)
  target.z = 3 * Math.sin(0.5*elasped)
  // 控制evader追踪物体运动
  // const elapsed = time.getElapsed()
  // target.x = Math.cos(elapsed) * Math.sin(elapsed * 0.2) * 6
  // target.z = Math.sin(elapsed * 0.8) * 6
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});