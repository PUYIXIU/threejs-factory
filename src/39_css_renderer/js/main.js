import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import * as YUKA from 'yuka'
import {CSS2DRenderer, CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0xefefef)
document.body.append(renderer.domElement)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0'
labelRenderer.domElement.style.left = '0'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.append(labelRenderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.01,
    1000
)
scene.add(camera)
camera.position.set(0,7,10)
camera.lookAt(0,0,0)

const orbit = new OrbitControls(camera,renderer.domElement)
orbit.update()

const ambientLight = new THREE.AmbientLight(0xffffff, 2)
scene.add(ambientLight)

const carLable = document.createElement('p')
carLable.className = 'car-p'
const carLableObj = new CSS2DObject(carLable)
carLableObj.position.set(0,3,0)
const loader = new GLTFLoader()
loader.load('assets/Debris_BrokenCar.gltf',gltf=>{
    scene.add(gltf.scene)
    gltf.scene.add(carLableObj)
    gltf.scene.matrixAutoUpdate = false
    vehicle.scale = new YUKA.Vector3(0.5,0.5,0.5)
    vehicle.setRenderComponent(gltf.scene, sync)
})
const entityManager = new YUKA.EntityManager()

function sync(entity, rendererComponent){
    rendererComponent.matrix.copy(entity.worldMatrix)
}
const vehicle = new YUKA.Vehicle()
vehicle.maxSpeed = 3
entityManager.add(vehicle)

const pointList = [
    ['point1', -6, 0, 0],
    ['point2', -3, 0, -3],
    ['point3', 0, 0, 0],
    ['point4', 3, 0, -3],
    ['point5', 6, 0, 0],
    ['point6', 0, 0, 4],
]

// 创建高亮点
function createPointSphere(name, x, y, z){
    const sphereGeo = new THREE.SphereGeometry(0.1)
    const sphereMat = new THREE.MeshBasicMaterial({color:0xffaa00})
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    sphereMesh.position.set(x,y,z)
    sphereMesh.name = name
    group.add(sphereMesh)
}
const group = new THREE.Group()
scene.add(group)
pointList.forEach(i=>createPointSphere(...i))

const p = document.createElement('p')
p.className = 'label-p hide'
const div = document.createElement('div')
div.className = 'label-box'
div.appendChild(p)
const labelDom = new CSS2DObject(div)
labelDom.position.set(0,0,0)
scene.add(labelDom)
const raycaster = new THREE.Raycaster()
const mousePosition = new THREE.Vector2()
window.onmousemove = function(e){
    mousePosition.x = (e.offsetX/window.innerWidth*2) - 1
    mousePosition.y = 1 - (e.offsetY/window.innerHeight*2)
    raycaster.setFromCamera(mousePosition, camera)
    const intersection = raycaster.intersectObject(group)
    if(intersection[0]){
        const mesh = intersection[0].object
        p.innerHTML = `${mesh.name} (${mesh.position.x}, ${mesh.position.y}, ${mesh.position.z})`
        labelDom.position.copy(mesh.position)
        p.className = 'label-p'
    }else{
        p.className = 'label-p hide'
    }
}

const path = new YUKA.Path()
path.loop = true
pointList.forEach(item=>{
    path.add(new YUKA.Vector3(item[1], item[2], item[3]))
})

const points = path._waypoints.map(i=>[i.x,i.y,i.z]).flat()
const lineGeo = new THREE.BufferGeometry()
lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
const lineMat = new THREE.LineBasicMaterial({color:0x000000})
const lineMesh = new THREE.LineLoop(lineGeo, lineMat)
scene.add(lineMesh)

const followPathBehavior = new YUKA.FollowPathBehavior(path,1)
vehicle.steering.add(followPathBehavior)
vehicle.position.copy(path.current())


renderer.setAnimationLoop(animate)

const time = new YUKA.Time()
function animate(){
    const delta = time.update().getDelta()
    entityManager.update(delta)
    carLable.innerHTML = `Current Speed: ${vehicle.getSpeed().toFixed(2)}`
    labelRenderer.render(scene, camera)
    renderer.render(scene, camera)
}

window.onresize = function(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
}
