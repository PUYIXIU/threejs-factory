import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

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
    window.innerWidth/window.innerHeight,
    0.01,
    1000
)
scene.add(camera)
camera.position.set(100,100,100)
camera.lookAt(0,0,0)
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
scene.background = cubeTextureLoader.load([
    stars,
    stars,
    stars,
    stars,
    stars,
    stars,
])

let sunGeometry = new THREE.SphereGeometry(16, 30, 30)
let sunMetarial = new THREE.MeshBasicMaterial({
    map:textureLoader.load(sunTexture)
})
let sun = new THREE.Mesh(sunGeometry, sunMetarial)
scene.add(sun)

const pointLight = new THREE.PointLight(0xffffff, 5, 300)
sun.add(pointLight)

function createPlanet(radius,texture,position,ring){
    const obj = new THREE.Object3D()
    const geometry = new THREE.SphereGeometry(radius,30,30)
    const metarial = new THREE.MeshStandardMaterial({
        map:textureLoader.load(texture)
    })
    const mesh = new THREE.Mesh(geometry,metarial)
    mesh.position.set(position,0,0)
    obj.add(mesh)
    scene.add(obj)
    if(ring){
        const ringGeometry = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius,32)
        const ringMetarial = new THREE.MeshStandardMaterial({
            map:textureLoader.load(ring.texture),
            side:THREE.DoubleSide
        })
        const ringMesh = new THREE.Mesh(ringGeometry, ringMetarial)
        ringMesh.rotation.x = Math.PI/2
        mesh.add(ringMesh)
    }
    return {obj:obj,mesh:mesh}
}

const mercury = createPlanet(3.2, mercuryTexture,28)
const venus = createPlanet(4.2, venusTexture,44)
const earth = createPlanet(3, earthTexture,62)
const mars = createPlanet(2.8, marsTexture,78)
const jupiter = createPlanet(15, jupiterTexture,100)
const saturn = createPlanet(10, saturnTexture,138,{
    innerRadius: 10,
    outerRadius: 20,
    texture:saturnringTexture
})
const uranus = createPlanet(7, uranusTexture,176,{
    innerRadius: 7,
    outerRadius: 12,
    texture:uranusringTexture
})
const neptune = createPlanet(8, neptuneTexture,200)
const pluto = createPlanet(2.8, plutoTexture,216)
function animate(){
    sun.rotateY(0.004)
    // 公转
    mercury.obj.rotateY(0.004/2)
    venus.obj.rotateY(0.002/2)
    earth.obj.rotateY(0.02/2)
    mars.obj.rotateY(0.018/2)
    saturn.obj.rotateY(0.038/2)
    jupiter.obj.rotateY(0.04/2)
    uranus.obj.rotateY(0.03/2)
    neptune.obj.rotateY(0.032/2)
    pluto.obj.rotateY(0.008/2)
    // 自转
    mercury.mesh.rotateY(0.04)
    venus.mesh.rotateY(0.015)
    earth.mesh.rotateY(0.01)
    mars.mesh.rotateY(0.008)
    saturn.mesh.rotateY(0.0009)
    jupiter.mesh.rotateY(0.002)
    uranus.mesh.rotateY(0.0004)
    neptune.mesh.rotateY(0.0001)
    pluto.mesh.rotateY(0.00007)

    renderer.render(scene , camera)
}
renderer.setAnimationLoop(animate)

window.onresize = function(){
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}
