import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-4.5, 6, 6);
orbit.update();

window.onmousedown = e => {
  console.log(camera.position)
}

const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

const spotLight = new THREE.SpotLight(0xffffff, 50)
spotLight.angle = Math.PI/4
spotLight.castShadow = true
spotLight.position.set(-5, 5, 0)
scene.add(spotLight)

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side:THREE.DoubleSide
  })
)
plane.rotateX(-Math.PI/2)
plane.receiveShadow = true
scene.add(plane)

let mixer 
const gltfLoader = new GLTFLoader()
gltfLoader.load('/assets/Wolf.gltf', gltf => {
  scene.add(gltf.scene)
  mixer = new THREE.AnimationMixer(gltf.scene)
  const action = mixer.clipAction(
    THREE.AnimationClip.findByName(gltf.animations,'Idle_2')
  )
  action.play()
  gltf.scene.traverse(node => {
    if (node.isObject3D) {
      node.castShadow = true
    }
  })
})

const clock = new THREE.Clock()
function animate() {
  const delta = clock.getDelta()
  mixer && mixer.update(delta)
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});