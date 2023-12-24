import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import earth from '../img/earth.jpg'
import jupiter from '../img/jupiter.jpg'
import mars from '../img/mars.jpg'
import mercury from '../img/mercury.jpg'
import neptune from '../img/neptune.jpg'
import pluto from '../img/pluto.jpg'
import saturn_ring from '../img/saturn ring.png'
import saturn from '../img/saturn.jpg'
import stars from '../img/stars.jpg'
import sun from '../img/sun.jpg'
import uranus_ring from '../img/uranus ring.png'
import uranus from '../img/uranus.jpg'
import venus from '../img/venus.jpg'

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.append(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
)
scene.add(camera)
camera.position.set(-90, 140, 140)
camera.lookAt(0, 0, 0)

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

scene.background = cubeTextureLoader.load([
  stars,
  stars,
  stars,
  stars,
  stars,
  stars,
])

const sunGeo = new THREE.SphereGeometry(16, 30, 30)
const sunMetarial = new THREE.MeshBasicMaterial({
  map:textureLoader.load(sun)
})
const sunSphere = new THREE.Mesh(sunGeo, sunMetarial)
scene.add(sunSphere)

const pointLight = new THREE.PointLight(0xffffff, 2, 300)
scene.add(pointLight)

const mercuryGeo = new THREE.SphereGeometry(3.2, 30, 30)
const mercuryMetarial = new THREE.MeshStandardMaterial({
  map:textureLoader.load(mercury)
})
const mercurySphere = new THREE.Mesh(mercuryGeo, mercuryMetarial)
sunSphere.add(mercurySphere)
mercurySphere.position.set(28, 0, 0)

renderer.setAnimationLoop(animate)
function animate() { 
  sunSphere.rotateY(0.004)
  mercurySphere.rotateY(0.004)

  renderer.render(scene,camera)
}

window.onresize = function () { 
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}