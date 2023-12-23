import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'

import nebula from '../img/nebula.jpg'
import starts from '../img/stars.jpg'

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

let scene, camera, renderer, orbit, gui, textureLoader, cubeTextureLoader, mousePosition, rayCaster, gltfLoader
const options = {
  sphereColor: 0x9b4141,
  wireframe: false,
  step: 0.05,
  angle: 0.2,
  penumbra: 0,
  intensity: 1
}

const monkeyUrl = new URL('../assets/monkey.glb',import.meta.url)
gltfLoader = new GLTFLoader()
rayCaster = new THREE.Raycaster()

mousePosition = new THREE.Vector2()
window.onmousemove = function (e) { 
  mousePosition.x = (e.clientX / window.innerWidth * 2) - 1
  mousePosition.y = -(e.clientY / window.innerHeight * 2) + 1
}

gui = new GUI()
gui.addColor(options, 'sphereColor').name('Sphere Color').onChange((e) => {
  sphere.material.color.set(e)
})
gui.add(options, 'wireframe').name('Sphere Color').onChange(e => {
  sphere.material.wireframe = e
})
gui.add(options, 'step', 0, 0.1)
gui.add(options, 'angle', 0, 1)
gui.add(options, 'penumbra', 0, 1)
gui.add(options, 'intensity', 0, 1)
renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true


document.body.appendChild(renderer.domElement)

scene = new THREE.Scene()

textureLoader = new THREE.TextureLoader()
// scene.background = textureLoader.load(starts)

cubeTextureLoader = new THREE.CubeTextureLoader()
scene.background = cubeTextureLoader.load([
  starts,
  starts,
  starts,
  starts,
  starts,
  starts,
])
gltfLoader.load(monkeyUrl.href, function(gltf) {
  let model = gltf.scene
  scene.add(model)
  model.position.set(0,5,5)
}, function (xhr) {}, function (error) { 
  console.error(error)
})

const box2MultiMaterial = [
  new THREE.MeshBasicMaterial({map:textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(starts)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(starts)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(starts)}),
]

let box2Geometry = new THREE.BoxGeometry(3, 3, 3)
// let box2Material = new THREE.MeshBasicMaterial()
// let box2 = new THREE.Mesh(box2Geometry, box2Material)
// box2.material.map = textureLoader.load(nebula)
let box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial)
box2.position.set(5, 10, -5)
box2.name = 'box2'
scene.add(box2)

let plane2Geometry = new THREE.PlaneGeometry(30, 30, 10, 10)
let plane2Material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe:true
})
let plane2 = new THREE.Mesh(plane2Geometry, plane2Material)
plane2.position.set(0, 15, -15)

scene.add(plane2)

// const VShader = `
//   void main(){
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//   }
// `
// const FShader = `
//   void main(){
//     gl_FragColor = vec4(0.7, 0.3, 0.9, 1.0);
//   }
// `
let sphere2Geometry = new THREE.SphereGeometry(3)
let sphere2Metarial = new THREE.ShaderMaterial({
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent
})
let sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Metarial)
sphere2.position.set(5, 10, 5)
scene.add(sphere2)

camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
)
camera.position.set(20, 30, 30)
scene.add(camera)

orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

let axesHelper = new THREE.AxesHelper(15)
scene.add(axesHelper)
let gridHelper = new THREE.GridHelper(30)
scene.add(gridHelper)
let boxGeometry = new THREE.BoxGeometry()
let boxMaterial = new THREE.MeshBasicMaterial({ color: 0x8cbeb2 })
let box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box)

let planeGeometry = new THREE.PlaneGeometry(30, 30)
let planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xf2ebbf,
  side:THREE.DoubleSide
})
let plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true
scene.add(plane)

let sphereGeometry = new THREE.SphereGeometry(3)
let sphereMaterial = new THREE.MeshStandardMaterial({
  color:0x9b4141
})
let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(-10, 10, 10)
sphere.castShadow = true
scene.add(sphere)

// // 环境光
// let ambientLight = new THREE.AmbientLight(0xffffff)
// scene.add(ambientLight)
// // 平行光
// let directLight = new THREE.DirectionalLight(0xaa55ff)
// directLight.position.set(-20, 20, 20)
// directLight.castShadow = true
// directLight.shadow.camera.bottom = -30
// scene.add(directLight)
// let directLightHelper = new THREE.DirectionalLightHelper(directLight, 5)
// scene.add(directLightHelper)
// let directLightShadowHelper = new THREE.CameraHelper(directLight.shadow.camera)
// scene.add(directLightShadowHelper)

// // 聚光灯
let spotLight = new THREE.SpotLight(0xffffff)
spotLight.position.set(-20, 20, 20)
spotLight.castShadow = true
scene.add(spotLight)
let spotLightHelper = new THREE.SpotLightHelper(spotLight, 0xffffff)
scene.add(spotLightHelper)

// 雾
scene.fog = new THREE.Fog(0xffffff, 1, 300)
// scene.fog = new THREE.FogExp2(0xffffff, 0.02)

let box2_rotate_angle = 0

renderer.setAnimationLoop(animate)
function animate(time) { 
  box.rotation.x = time/1000
  box.rotation.y = time / 1000
  sphere.position.y = 10 * Math.abs(Math.sin(options.step * time / 25))

  spotLight.angle = options.angle
  spotLight.penumbra = options.penumbra
  spotLight.intensity = options.intensity
  spotLightHelper.update()

  rayCaster.setFromCamera(mousePosition, camera)
  const intersects = rayCaster.intersectObjects(scene.children)
  // console.log(intersects)
  intersects.forEach(obj => {
    if (obj.object.id === sphere.id) { 
      obj.object.material.color.set(0xfff000)
    }
    if (obj.object.name == 'box2') { 
      obj.object.rotation.x = box2_rotate_angle
      obj.object.rotation.y = box2_rotate_angle
      obj.object.rotation.z = box2_rotate_angle
      box2_rotate_angle+=0.1
    }
  })
  for (let i = 0; i < plane2.geometry.attributes.position.array.length; i+=(10*3)) { 
    plane2.geometry.attributes.position.array[i]=10*Math.random()
  }
  plane2.geometry.attributes.position.needsUpdate = true;

  orbit.update()
  renderer.render(scene, camera)
}

renderer.render(scene, camera)

window.onresize = function () { 
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}