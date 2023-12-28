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


///////////////////

const world = new CANNON.World({
    gravity:new CANNON.Vec3(0,-9.81,0)
})
const planeBody = new CANNON.Body({
    mass:1,
    shape:new CANNON.Plane(),
})
planeBody.quaternion.setFromEuler(-Math.PI/2,0,0)
world.addBody(planeBody)

let timeStep = 1/60
function animate(){
    world.step(timeStep)
    planeMesh.position.copy(planeBody.position)
    planeMesh.quaternion.copy(planeBody.quaternion)
    renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)
window.onresize = function(){
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}