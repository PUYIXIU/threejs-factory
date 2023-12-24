import * as THREE from 'three'
import { GUI } from 'dat.gui'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

import starts from '../img/stars.jpg'
import nebula from '../img/nebula.jpg'

const monkeyUrl = new URL('../assets/monkey.glb', import.meta.url)
const gltfLoader = new GLTFLoader()

let mousePosition = new THREE.Vector2()
window.onmousemove = function (e) { 
  mousePosition.x = (e.clientX / window.innerWidth * 2) - 1
  mousePosition.y = 1 - (e.clientY / window.innerHeight * 2)
}
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const options = {
  sphereColor: 0xb16c4b,
  wireframe: false,
  speed: 0.05,
  angle: 0.5,
  penumbra: 0,
  intensity:1,
}
const gui = new GUI()
gui.addColor(options, 'sphereColor').onChange((e) => {
  sphere.material.color.set(e)
})
gui.add(options, 'wireframe').onChange(e => {
  sphere.material.wireframe = e
})
gui.add(options, 'speed', 0, 0.1)
gui.add(options, 'angle', 0, 1)
gui.add(options, 'penumbra', 0, 1)
gui.add(options,'intensity',0,1)
// 渲染器 renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.append(renderer.domElement)
renderer.shadowMap.enabled = true

// 场景
const scene = new THREE.Scene()

gltfLoader.load(monkeyUrl.href, function (gltf) { 
  let model = gltf.scene
  scene.add(model)
  model.position.set(0, 10, 0)
  model.scale.set(2,2,2)
}, undefined, function (err) { 
  console.err(err)
})

// scene.background = textureLoader.load(nebula)
scene.background = cubeTextureLoader.load([
  starts,
  starts,
  starts,
  starts,
  starts,
  starts
])
// 摄像机
const camera = new THREE.PerspectiveCamera(
  75, //fov
  window.innerWidth / window.innerHeight, //aspect
  0.01, //near
  10000 //far
)
scene.add(camera)
camera.position.set(30, 30, 30)
camera.lookAt(0, 0, 0)
// 轨道控制器
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()
// AxesHelper
const axesHelper = new THREE.AxesHelper(15)
scene.add(axesHelper)
// Object
const boxGeometry = new THREE.BoxGeometry(3,3,3)
const boxMetarial = new THREE.MeshBasicMaterial({
  color:0x00ff00
})
const box = new THREE.Mesh(boxGeometry, boxMetarial)
scene.add(box)

// Object
const boxGeometry2 = new THREE.BoxGeometry(3,3,3)
const boxMetarial2 = [
  new THREE.MeshBasicMaterial({map:textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(starts)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map:textureLoader.load(starts)}),
]
const box2 = new THREE.Mesh(boxGeometry2, boxMetarial2)
scene.add(box2)
box2.position.set(10, 10, -10)
box2.name = 'box2'

const planeGeometry = new THREE.PlaneGeometry(30, 30)
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side:THREE.DoubleSide
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true

// const planeGeometry2 = new THREE.PlaneGeometry(30, 30,10,10)
// const planeMaterial2 = new THREE.MeshStandardMaterial({
//   color: 0x00ff00,
//   wireframe:true,
// })
// const plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2)
// scene.add(plane2)
// plane2.rotation.x = -Math.PI/2


const vShader = `
  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`
const fShader = `
  void main(){
    gl_FragColor = vec4( 0.7, 0.5, 1.0, 1.0);
  }
`

const sphereGeometry = new THREE.SphereGeometry(4)
const sphereMaterial = new THREE.ShaderMaterial({
  vertexShader: document.getElementById('vShader').textContent,
  fragmentShader:  document.getElementById('fShader').textContent,
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphere)
sphere.position.set(-10,10,10)
sphere.castShadow = true

// const gridHelper = new THREE.GridHelper(30, 20)
// scene.add(gridHelper)


// const ambientLight = new THREE.AmbientLight(0xffffff)
// scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight(0xffffff)
// scene.add(directionalLight)
// directionalLight.position.set(-30, 30, 30)
// directionalLight.castShadow = true
// directionalLight.shadow.camera.bottom = -10
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight ,5, 0x00ffff)
// scene.add(directionalLightHelper)

const spotLight = new THREE.SpotLight(0xffffff)
scene.add(spotLight)
spotLight.position.set(-30, 30, 30)
spotLight.castShadow = true
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHelper)

scene.fog = new THREE.Fog(0xffffff,20, 200)
// scene.fog = new THREE.FogExp2(0xffffff,0.01)
let rayCaster = new THREE.Raycaster()

renderer.setAnimationLoop(animate)

function animate(time) {
  box.rotation.x = time / 1000
  box.rotation.y = time / 1000
  spotLight.angle = options.angle
  spotLight.penumbra = options.penumbra
  spotLight.intensity = options.intensity
  spotLightHelper.update()
  sphere.position.y = 10*Math.abs(Math.sin(Math.PI*(time/100)*options.speed))
  rayCaster.setFromCamera(mousePosition, camera)
  let intersects = rayCaster.intersectObjects(scene.children)
  for (let obj of intersects) { 
    if (obj.object.id === sphere.id) {
      // obj.object.material.color.set(0xffff00)
    } else if (obj.object.name === box2.name) { 
      obj.object.rotation.x += 0.01
      obj.object.rotation.z += 0.01
    }
  }
  let posArray = plane.geometry.attributes.position.array;
  for (let i = 0; i < posArray.length; i++) { 
    if (i % 3 == 2) { 
      let extent = (Math.abs(i-posArray.length/2)/posArray.length)*5
      posArray[i] = (2+extent)*Math.sin(Math.PI*time/1000/Math.max(extent,i/posArray.length*5))
    }
  }
  plane.geometry.attributes.position.needsUpdate = true
  renderer.render(scene, camera)
}

window.onresize = function () { 
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth,window.innerHeight)
}
