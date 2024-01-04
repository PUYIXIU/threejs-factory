import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import * as YUKA from 'yuka'
const renderer = new THREE.WebGLRenderer({antialias: true});
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

const ambientLight = new THREE.AmbientLight(0xffffff,2)
scene.add(ambientLight)
const gltfLoader = new GLTFLoader()
gltfLoader.load('/assets/Debris_BrokenCar.gltf', gltf => {
  let model = gltf.scene
  model.matrixAutoUpdate = false
  scene.add(model)
  vehicle.scale = new THREE.Vector3(0.5,0.5,0.5)
  vehicle.setRenderComponent(model, sync)
})
const vehicle = new YUKA.Vehicle()
vehicle.maxSpeed = 3
function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)
}

const path = new YUKA.Path()
path.loop = true
path.add(new YUKA.Vector3(0,0,8))
path.add(new YUKA.Vector3(-4,0,4))
path.add(new YUKA.Vector3(-8,0,0))
path.add(new YUKA.Vector3(-4,0,-4))
path.add(new YUKA.Vector3(0,0,-1))
path.add(new YUKA.Vector3(4,0,-4))
path.add(new YUKA.Vector3(8,0,0))
path.add(new YUKA.Vector3(4, 0, 4))

vehicle.position.copy(path.current())
const points = path._waypoints.map(pos => [pos.x, pos.y, pos.z]).flat()
const lineGeo = new THREE.BufferGeometry()
lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 })
const lineLoop = new THREE.LineLoop(lineGeo, lineMat)
scene.add(lineLoop)

const followPathBehavior = new YUKA.FollowPathBehavior(path,3)
vehicle.steering.add(followPathBehavior)

const onPathBehavior = new YUKA.OnPathBehavior(path)
onPathBehavior.radius = 2
vehicle.steering.add(onPathBehavior)

const entityManager = new YUKA.EntityManager()
entityManager.add(vehicle)

const time = new YUKA.Time()
function animate() {
  const delta = time.update().getDelta()
  entityManager.update(delta)
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});