import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import earthTexture from '../img/earth.jpg'
import jupiterTexture from '../img/jupiter.jpg'
import marsTexture from '../img/mars.jpg'
import mercuryTexture from '../img/mercury.jpg'
import neptuneTexture from '../img/neptune.jpg'
import plutoTexture from '../img/pluto.jpg'
import saturnringTexture from '../img/saturn ring.png'
import saturnTexture from '../img/saturn.jpg'
import stars from '../img/stars.jpg'
import sunTexture from '../img/sun.jpg'
import uranusringTexture from '../img/uranus ring.png'
import uranusTexture from '../img/uranus.jpg'
import venusTexture from '../img/venus.jpg'

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
  map:textureLoader.load(sunTexture)
})
const sunSphere = new THREE.Mesh(sunGeo, sunMetarial)
scene.add(sunSphere)

const pointLight = new THREE.PointLight(0xffffff, 2, 300)
scene.add(pointLight)

function createPlanet(radius, distance, texture, ring) { 
  const obj = new THREE.Object3D()
  const planetGeo = new THREE.SphereGeometry(radius, 30, 30)
  const planeMetarial = new THREE.MeshBasicMaterial({
    map:textureLoader.load(texture)
  })
  const planet = new THREE.Mesh(planetGeo, planeMetarial)
  obj.add(planet)
  planet.position.set(distance[0],distance[1],distance[2])
  if (ring) { 
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius,30)
    const ringMetarial = new THREE.MeshBasicMaterial({
      map: textureLoader.load(ring.texture),
      side:THREE.DoubleSide
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMetarial)
    planet.add(ringMesh)
    ringMesh.rotation.x = Math.PI/2
  }
  scene.add(obj)
  return {mesh:obj, planet:planet}
}

// 水金地火木土天海冥
const mercury = createPlanet(3.2, [28,0,0] , mercuryTexture)
const venus = createPlanet(4.2, [44, 0, 0], venusTexture)
const earth = createPlanet(3, [62, 0, 0], earthTexture)
const mars = createPlanet(2.8,[78,0,0],marsTexture)
const jupiter = createPlanet(15, [100, 0, 0], jupiterTexture)
const saturn = createPlanet(10, [138, 0, 0], saturnTexture, {
  innerRadius: 10,
  outerRadius: 20,
  texture:saturnringTexture
})
const uranus = createPlanet(7, [176, 0, 0], uranusTexture, {
  innerRadius: 7,
  outerRadius: 12,
  texture:uranusringTexture
})
const neptune = createPlanet(8, [200, 0, 0], neptuneTexture)
const pluto = createPlanet(2.8,[216,0,0],plutoTexture)
renderer.setAnimationLoop(animate)
function animate() { 
  sunSphere.rotateY(0.004)
  mercury.mesh.rotateY(0.004)
  venus.mesh.rotateY(0.002)
  earth.mesh.rotateY(0.02)
  mars.mesh.rotateY(0.018)
  saturn.mesh.rotateY(0.038)
  jupiter.mesh.rotateY(0.04)
  uranus.mesh.rotateY(0.03)
  neptune.mesh.rotateY(0.032)
  pluto.mesh.rotateY(0.008)

  mercury.planet.rotateY(0.04)
  venus.planet.rotateY(0.015)
  earth.planet.rotateY(0.01)
  mars.planet.rotateY(0.008)
  saturn.planet.rotateY(0.0009)
  jupiter.planet.rotateY(0.002)
  uranus.planet.rotateY(0.0004)
  neptune.planet.rotateY(0.0001)
  pluto.planet.rotateY(0.00007)

  mercury.planet.rotateY(0.004)

  renderer.render(scene,camera)
}

window.onresize = function () { 
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}