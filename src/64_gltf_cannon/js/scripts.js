import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from 'cannon-es'

import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {OutputPass} from "three/examples/jsm/postprocessing/outputpass";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true

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

const composer = new EffectComposer(renderer)
const renderScene = new RenderPass(scene, camera)
const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene, camera
)
const outputPass = new OutputPass()

composer.addPass(renderScene)
composer.addPass(outlinePass)
composer.addPass(outputPass)

const world = new CANNON.World({
    gravity:new CANNON.Vec3(0,-9.81,0)
})

const planeGeo = new THREE.PlaneGeometry(12,12)
const planeMat = new THREE.MeshPhysicalMaterial({
    color:0xffffff,
    roughness:0,
})
const planeMesh = new THREE.Mesh(planeGeo, planeMat)
planeMesh.rotation.x = Math.PI/2
planeMesh.receiveShadow = true
scene.add(planeMesh)

const planeBody = new CANNON.Body({
    shape:new CANNON.Plane(),
    type:CANNON.BODY_SLEEP_STATES
})
planeBody.quaternion.setFromEuler(-Math.PI/2, 0,0)
world.addBody(planeBody)

// const aLight = new THREE.AmbientLight(0xffffff,3)
// scene.add(aLight)

const dLight = new THREE.DirectionalLight(0xffffff,2)
scene.add(dLight)
dLight.castShadow = true
dLight.position.set(4,10,1)


// raycaster
const raycaster = new THREE.Raycaster()
const mousePosition = new THREE.Vector2()
window.onmousemove = e=>{
    mousePosition.x = (e.offsetX/window.innerWidth*2) - 1
    mousePosition.y = 1 - (e.offsetY / window.innerHeight*2)
    raycaster.setFromCamera(mousePosition, camera)
    let intersections =  raycaster.intersectObject(scene,true)
    outlinePass.selectedObjects = []
    if(intersections[0] && key){
        intersections.forEach(model=>{
            if(model.object.uuid === key.uuid){
                const selectedObj = model.object
                outlinePass.selectedObjects = [selectedObj]
            }
        })
    }
}

const loader = new GLTFLoader()
let key,keyBody
loader.load('assets/key.glb',gltf=>{
    gltf.scene.traverse(obj=>{
        if(obj.isMesh){
            obj.castShadow = true
        }
    })
    key = gltf.scene.getObjectByName('Object_2')
    key.scale.set(0.005,0.005,0.005)
    scene.add(key)
    const geo = key.geometry
    const scaledVertices = []
    let vertices = geo.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) {
        scaledVertices.push(
            vertices[i] * 0.005,
            vertices[i+1] * 0.005,
            vertices[i+2] * 0.005,
        )
    }
    const keyShape = new CANNON.Trimesh(scaledVertices, geo.index.array)

    keyBody = new CANNON.Body({
        mass:1,
        position:new CANNON.Vec3(0,3,0),
        shape:keyShape
    })
    keyBody.quaternion.setFromEuler(Math.PI/2,0,0)
    world.addBody(keyBody)
})

const stepTIme = 1/60
function animate() {
    world.step(stepTIme)
    if(keyBody){
        planeMesh.position.copy(planeBody.position)
        planeMesh.quaternion.copy(planeBody.quaternion)
        key.position.copy(keyBody.position)
        key.quaternion.copy(keyBody.quaternion)
    }
    // renderer.render(scene, camera);
    composer.render();
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});