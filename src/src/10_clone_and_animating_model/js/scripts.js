import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(6, 8, 14);
orbit.update();

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 2)
scene.add(ambientLight)

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshBasicMaterial({
    visible:false
  })
)
scene.add(plane)
plane.rotateX(-Math.PI/2)

const highlight = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent:true
  })
)
scene.add(highlight)
highlight.rotateX(-Math.PI / 2)
highlight.position.set(0.5, 0, 0.5)

const gltfLoader = new GLTFLoader()
const shibaInuURL = new URL('../asserts/ShibaInu.gltf', import.meta.url)
let shibaInuModel
gltfLoader.load(shibaInuURL.href, gltf => {
  gltf.scene.scale.set(0.3, 0.3, 0.3)
  shibaInuModel = gltf
},undefined,err=>console.error(err))

const mousePosition = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const objects = []
const mixers = []
const isExist = () => objects.find(obj => obj.position.x === highlight.position.x && obj.position.z === highlight.position.z)

function getInterSections(e) {
  mousePosition.x = e.offsetX / window.innerWidth * 2 - 1
  mousePosition.y = 1 - e.offsetY / window.innerHeight * 2
  raycaster.setFromCamera(mousePosition, camera)
  return raycaster.intersectObject(plane)
}

window.onmousemove = e => {
  let interSections = getInterSections(e)
  if (interSections[0]) {
    let position = interSections[0].point.floor().addScalar(0.5)
    highlight.position.set(position.x, 0, position.z)
    highlight.material.color.set(isExist() ? 0xff0000 : 0xffffff)
  }
}

window.onmousedown = e => {
  if (isExist() || !getInterSections(e)[0]) return
  let obj = SkeletonUtils.clone(shibaInuModel.scene)
  scene.add(obj)
  obj.position.set(highlight.position.x, 0, highlight.position.z)
  objects.push(obj)

  const mixer = new THREE.AnimationMixer(obj)
  const action = mixer.clipAction(
    THREE.AnimationClip.findByName(shibaInuModel.animations, 'Idle_2')
  )
  action.play()
  mixers.push(mixer)

  highlight.material.color.set(0xff0000)
}

let clock = new THREE.Clock()
function animate(time) {
  const delta = clock.getDelta()
  mixers.forEach(mixer => {
    mixer.update(delta)
  })
  highlight.material.opacity = Math.abs(Math.sin(time/120))
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});