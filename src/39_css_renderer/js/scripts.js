import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as YUKA from 'yuka'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xFEFEFE);

const cssRenderer = new CSS2DRenderer()
cssRenderer.setSize(
  window.innerWidth,
  window.innerHeight
)
document.body.append(cssRenderer.domElement)
cssRenderer.domElement.style.position = 'absolute'
cssRenderer.domElement.style.top = '0'
cssRenderer.domElement.style.left = '0'
cssRenderer.domElement.style.pointerEvents = 'none'


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

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
directionalLight.position.set(3, 3, 3)
scene.add(directionalLight)

const entityManager = new YUKA.EntityManager()
const sync = (entity, renderComponent) => {
  renderComponent.matrix.copy(entity.worldMatrix)
}

const loader = new GLTFLoader()
loader.load('/assets/Debris_BrokenCar.gltf', gltf => {
  gltf.scene.matrixAutoUpdate = false
  scene.add(gltf.scene)
  vehicle.scale = new YUKA.Vector3(0.5,0.5,0.5)
  vehicle.setRenderComponent(gltf.scene, sync)
})

const vehicle = new YUKA.Vehicle()
vehicle.maxSpeed = 3
entityManager.add(vehicle)

const path = new YUKA.Path()
path.loop = true
path.add(new YUKA.Vector3(0,0,6))
path.add(new YUKA.Vector3(-4,0,4))
path.add(new YUKA.Vector3(-6,0,0))
path.add(new YUKA.Vector3(-4,0,-4))
path.add(new YUKA.Vector3(0,0,2))
path.add(new YUKA.Vector3(4,0,-4))
path.add(new YUKA.Vector3(6,0,0))
path.add(new YUKA.Vector3(4, 0, 4))

vehicle.position.copy(path.current())

const points = path._waypoints.map(position => [position.x, position.y, position.z]).flat()
const lineGeo = new THREE.BufferGeometry()
lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
const lineMat = new THREE.LineBasicMaterial({color:0x000000})
const lineMesh = new THREE.LineLoop(lineGeo, lineMat)
scene.add(lineMesh)

const followPathBehavior = new YUKA.FollowPathBehavior(path,3)
vehicle.steering.add(followPathBehavior)

const onePathBehavior = new YUKA.OnPathBehavior(path, 1)
vehicle.steering.add(onePathBehavior)

const time = new YUKA.Time()
function animate() {
  const delta = time.update().getDelta()
  entityManager.update(delta)
  cssRenderer.render(scene,camera)
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});