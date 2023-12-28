import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from 'cannon-es'

let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.append(renderer.domElement)
renderer.setAnimationLoop(animate)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.01,
    1000
)
scene.add(camera)
camera.position.set(0,30,30)
camera.lookAt(0,0,0)

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

const planeGeo = new THREE.PlaneGeometry(30,30)
const planeMat = new THREE.MeshBasicMaterial({
    wireframe:true
})
let groundMesh = new THREE.Mesh(planeGeo, planeMat)
scene.add(groundMesh)

const boxGeo = new THREE.BoxGeometry(3,3,3)
const boxMat = new THREE.MeshBasicMaterial({
    color:0x00ff00,
    wireframe:true
})
const boxMesh = new THREE.Mesh(boxGeo, boxMat)
scene.add(boxMesh)

const sphereGeo = new THREE.SphereGeometry(2,)
const sphereMat = new THREE.MeshBasicMaterial({
    color:0xffff00,
    wireframe:true
})
const sphereMesh = new THREE.Mesh(sphereGeo,sphereMat)
scene.add(sphereMesh)

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
})

const groundPhysMat = new CANNON.Material()
const boxPhysMat = new CANNON.Material();
const spherePhyMat = new CANNON.Material()
const groundBoxContanctMat = new CANNON.ContactMaterial(
    groundPhysMat,
    boxPhysMat,
    {
        friction:0
    }
)
const groundSphereContanctMat = new CANNON.ContactMaterial(
    groundPhysMat,
    spherePhyMat,
    {
        restitution:0.9 // 回弹系数
    }
)
// 添加材质
world.addContactMaterial(groundBoxContanctMat)
world.addContactMaterial(groundSphereContanctMat)

const groundBody = new CANNON.Body({
    shape:new CANNON.Box(new CANNON.Vec3(15,15,1)),
    type:CANNON.Body.STATIC,
    material: groundPhysMat
})

const boxBody = new CANNON.Body({
    mass: 1,
    // CANNON.Box 接收的尺寸大小需要是原物体mesh尺寸大小的一半
    shape: new CANNON.Box(new CANNON.Vec3(1.5,1.5,1.5)),
    position:new CANNON.Vec3(1, 26, 0),
    material: boxPhysMat
})

// 自旋
boxBody.angularVelocity.set(10,0,0)
// 自旋阻力
boxBody.angularDamping = 0.3
const sphereBody = new CANNON.Body({
    mass:1,
    shape:new CANNON.Sphere(2),
    position: new CANNON.Vec3(0,15,0),
    material:spherePhyMat
})
// 线性阻尼值的范围在0-1之间
sphereBody.linearDamping = 0.3

world.addBody(groundBody)
world.addBody(boxBody)
world.addBody(sphereBody)
groundBody.quaternion.setFromEuler(-Math.PI/2,0,0)
const step = 1/60
function animate(){
    world.step(step)
    groundMesh.position.copy(groundBody.position) // 更新网格位置
    groundMesh.quaternion.copy(groundBody.quaternion) // 更新网格方向

    boxMesh.position.copy(boxBody.position)
    boxMesh.quaternion.copy(boxBody.quaternion)

    sphereMesh.position.copy(sphereBody.position)
    sphereMesh.quaternion.copy(sphereBody.quaternion)

    renderer.render(scene, camera)
}
window.onresize = function(){
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}