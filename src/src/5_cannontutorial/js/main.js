import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from 'cannon-es'

let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.append(renderer.domElement)

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
    wireframe:true,
})
const planeMesh = new THREE.Mesh(planeGeo, planeMat)
scene.add(planeMesh)

const boxGeo = new THREE.BoxGeometry(3, 3, 3)
const boxMat = new THREE.MeshBasicMaterial({
    color:0x00ff00,
    wireframe:true
})
const boxMesh = new THREE.Mesh(boxGeo, boxMat)
scene.add(boxMesh)

const sphereGeo = new THREE.SphereGeometry(3)
const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe:true,
})
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
scene.add(sphereMesh)

///////////////////
const world = new CANNON.World({
    gravity:new CANNON.Vec3(0,-9.89,0)
})

const planePhysMat = new CANNON.Material()
const boxPhysMat = new CANNON.Material()
const spherePhysMat = new CANNON.Material()

const planeBoxContactMat = new CANNON.ContactMaterial(
    planePhysMat,
    boxPhysMat,
    {
        friction:0
    }
)
const planeSphereContactMat = new CANNON.ContactMaterial(
    planePhysMat,
    spherePhysMat,
    {
        restitution:0.9 // 回弹系数
    }
)
world.addContactMaterial(planeBoxContactMat)
world.addContactMaterial(planeSphereContactMat)

const planeBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(15,15,0.5)),
    type: CANNON.BODY_TYPES.STATIC,
    material:planePhysMat
})
planeBody.quaternion.setFromEuler(-Math.PI/2, 0, 0)
world.addBody(planeBody)

const boxBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1, 5)),
    mass: 1,
    position: new CANNON.Vec3(1, 20, 0),
    material:boxPhysMat
})
world.addBody(boxBody)
boxBody.angularVelocity.set(10,0,0,0)
boxBody.angularDamping = 0.3
const sphereBody = new CANNON.Body({
    shape: new CANNON.Sphere(3),
    mass: 1,
    position: new CANNON.Vec3(0, 15, 0),
    material:spherePhysMat
})
sphereBody.linearDamping = 0.3



world.addBody(sphereBody)
const stepTime = 1/60
function animate(){
    world.step(stepTime)
    planeMesh.position.copy(planeBody.position)
    planeMesh.quaternion.copy(planeBody.quaternion)
    
    boxMesh.position.copy(boxBody.position)
    boxMesh.quaternion.copy(boxBody.quaternion)

    sphereMesh.position.copy(sphereBody.position)
    sphereMesh.quaternion.copy(sphereBody.quaternion)

    renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)
window.onresize = function () {
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}