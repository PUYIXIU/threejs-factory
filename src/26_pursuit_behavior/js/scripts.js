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


const pursuitGeo = new THREE.ConeBufferGeometry(0.1, 0.8, 8)
pursuitGeo.rotateX(Math.PI / 2)
const pursuitMat = new THREE.MeshNormalMaterial()
const pursuitMesh = new THREE.Mesh(pursuitGeo, pursuitMat)
pursuitMesh.matrixAutoUpdate = false
scene.add(pursuitMesh)

const pursuit = new YUKA.Vehicle()
pursuit.setRenderComponent(pursuitMesh, sync)
entityManager.add(pursuit)
pursuit.maxSpeed = 3

const evaderMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.2),
  new THREE.MeshBasicMaterial({ color: 0xffaa00 })
)
evaderMesh.matrixAutoUpdate = false
scene.add(evaderMesh)

const evader = new YUKA.Vehicle()
evader.maxSpeed = 3
evader.setRenderComponent(evaderMesh, sync)
evader.position.set(1, 0, 0)
entityManager.add(evader)

const pursuitBehavior = new YUKA.PursuitBehavior(evader, 5)
pursuit.steering.add(pursuitBehavior)

const target = new YUKA.Vector3()
const seekBehavoir = new YUKA.SeekBehavior(target)
evader.steering.add(seekBehavoir)

// const plane = new THREE.Mesh(
//   new THREE.PlaneGeometry(30, 30),
//   new THREE.MeshBasicMaterial({ visible:false })
// )
// plane.rotateX(-Math.PI / 2)
// scene.add(plane)
// const mousePosition = new THREE.Vector2()
// const raycaster = new THREE.Raycaster()
// window.onmousemove = e => {
//   mousePosition.x = e.offsetX / window.innerWidth * 2 - 1
//   mousePosition.y = 1 - e.offsetY / window.innerHeight * 2
//   raycaster.setFromCamera(mousePosition, camera)
// }
// window.onmousedown = e => {
//   const interSections = raycaster.intersectObject(plane)
//   if (interSections[0]) {
//     target.set(
//       interSections[0].point.x,
//       0,
//       interSections[0].point.z,
//     )
//   }
// }

const time = new YUKA.Time()
function animate() {
  let delta = time.update().getDelta()
  entityManager.update(delta)

  // 控制evader追踪物体运动
  const elapsed = time.getElapsed()
  target.x = Math.cos(elapsed) * Math.sin(elapsed * 0.2) * 6
  target.z = Math.sin(elapsed * 0.8) * 6
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});