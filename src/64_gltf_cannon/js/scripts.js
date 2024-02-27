import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from 'cannon-es'
import { threeToCannon, ShapeType } from 'three-to-cannon';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x000000);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(6, 8, 14);
orbit.update();

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const world = new CANNON.World({
    gravity:new CANNON.Vec3(0,-9.81,0)
})

const planeGeo = new THREE.PlaneGeometry(12,12)
const planeMat = new THREE.MeshBasicMaterial({
    color:0xffffff,
})
const planeMesh = new THREE.Mesh(planeGeo, planeMat)
planeMesh.rotation.x = Math.PI/2
scene.add(planeMesh)

const planeBody = new CANNON.Body({
    shape:new CANNON.Box(new CANNON.Vec3(6,6,0.5)),
    type:CANNON.BODY_SLEEP_STATES
})
planeBody.quaternion.setFromEuler(-Math.PI/2, 0,0)
world.addBody(planeBody)

const aLight = new THREE.AmbientLight(0xffffff,2)
scene.add(aLight)

const loader = new GLTFLoader()
let key,keyBody
loader.load('assets/key.glb',gltf=>{
    key = gltf.scene.getObjectByName('Object_2')
    // key.scale.set(0.005,0.005,0.005)
    // key.scale.set(0.005,0.005,0.005)
    scene.add(gltf.scene)
    keyBody = new CANNON.Body({
        mass:1,
        position:new CANNON.Vec3(0,3,0)
    })
    const geo = key.geometry
    const scaledVertices = []
    let vertices = geo.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) { 
        scaledVertices.push(
            vertices[i] * 0.005,
            vertices[i+1] * 0.005 + 3,
            vertices[i+2] * 0.005,
        )
    }
    key.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(scaledVertices),3))
    const keyShape = new CANNON.Trimesh(scaledVertices, geo.index.array)

    // debugger
    const newGeo = new THREE.BufferGeometry()
    newGeo.setAttribute('position', new THREE.BufferAttribute(
        keyShape.vertices,3
    ))
    newGeo.setIndex(
        new THREE.BufferAttribute(keyShape.indices,1)
    )
    const newMat = new THREE.MeshBasicMaterial({
        wireframe: true,
        color:0xff0000
    })
    const newMesh = new THREE.Mesh(newGeo, newMat)
    scene.add(newMesh)
    keyBody.addShape(keyShape)

    // keyBody.quaternion.setFromEuler(Math.PI/2,0,0)
    world.addBody(keyBody)
})

const stepTIme = 1/60
function animate() {
    world.step(stepTIme)
    if(keyBody){
        planeMesh.position.copy(planeBody.position)
        planeMesh.quaternion.copy(planeBody.quaternion)
        console.log(keyBody.position)
        key.position.copy(keyBody.position)
        key.quaternion.copy(keyBody.quaternion)
    }
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});