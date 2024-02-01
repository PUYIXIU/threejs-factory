import * as THREE from 'three';
import {GUI} from "dat.gui";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import {clone} from "three/examples/jsm/utils/SkeletonUtils";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xFEFEFE);
renderer.shadowMap.enabled = true

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 2, 3);
orbit.update();

// const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const spotLight = new THREE.SpotLight(0xffffff, 200)
spotLight.position.set(5,5,0)
scene.add(spotLight)
spotLight.castShadow = true

const planeGeo = new THREE.PlaneGeometry(12,12)
const planeMat = new THREE.MeshStandardMaterial({
    color:0x0000ff,
    roughness:0,
    side:THREE.DoubleSide
})
const planeMesh = new THREE.Mesh(planeGeo, planeMat)
scene.add(planeMesh)
planeMesh.rotateX(-Math.PI/2)
planeMesh.position.y = -1
planeMesh.receiveShadow = true

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshPhongMaterial({
        color:0xffffff,
    })
)
cube.position.set(-1,0,0)
scene.add(cube)

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshPhongMaterial({
        color:0xffffff,
        roughness:0
    })
)
cube2.position.set(1,0,0)
scene.add(cube2)

// const loader = new GLTFLoader()
// let monkey, cloneMonkey
// loader.load('assets/monkey.glb',gltf=>{
//     monkey = gltf.scene
//     monkey.position.set(-3,0,0)
//     scene.add(monkey)
//     monkey.traverse(m=>{
//         if(m.isObject3D){
//             m.castShadow = true
//         }
//     })
//     cloneMonkey = SkeletonUtils.clone(monkey)
//     scene.add(cloneMonkey)
//     cloneMonkey.traverse(m=>{
//         if(m.isObject3D){
//             m.castShadow = true
//         }
//     })
//     cloneMonkey.position.set(3,0,0)
//
//     const quaternionY = new THREE.Quaternion()
//     quaternionY.setFromAxisAngle(new THREE.Vector3(0,1,0).normalize(),Math.PI/2)
//     cloneMonkey.applyQuaternion(quaternionY)
//     const quaternionZ = new THREE.Quaternion()
//     quaternionZ.setFromAxisAngle(new THREE.Vector3(0,0,1).normalize(),Math.PI/2)
//     cloneMonkey.applyQuaternion(quaternionZ)
// })

const guiConfig = {
    x:0,
    y:Math.PI/2,
    z:0
}

const gui = new GUI()
// gui.add(boxMesh.rotation, "x").min(0).max(Math.PI)
// gui.add(boxMesh.rotation, "y").min(0).max(Math.PI)
// gui.add(boxMesh.rotation, "z").min(0).max(Math.PI)

gui.add(guiConfig, "x").min(-Math.PI).max(Math.PI)
gui.add(guiConfig, "y").min(-Math.PI).max(Math.PI)
gui.add(guiConfig, "z").min(-Math.PI).max(Math.PI)

function rotateByEuler(model){
    model.rotation.x += 0.01
    model.rotation.y += 0.01
}

function rotateByQuaternion(model){
    const quaternionX = new THREE.Quaternion()
    quaternionX.setFromAxisAngle(new THREE.Vector3(1,0,0).normalize(), 0.01)
    model.applyQuaternion(quaternionX)

    const quaternionY = new THREE.Quaternion()
    quaternionY.setFromAxisAngle(new THREE.Vector3(0,1,0).normalize(), 0.01)
    model.applyQuaternion(quaternionY)

    // const quaternionO = new THREE.Quaternion()
    //     .setFromAxisAngle(new THREE.Vector3(0,1,0).normalize(), 0.01)
    // model.position.applyQuaternion(quaternionO)
}

function rotateCamera(){
    const quaternionO = new THREE.Quaternion()
    quaternionO.setFromAxisAngle(new THREE.Vector3(0,1,0).normalize(), -0.01)
    camera.position.applyQuaternion(quaternionO)
    camera.lookAt(0,0,0)
}

function animate() {
    // rotateByEuler(cube2)
    cube2.rotation.set(guiConfig.x, guiConfig.y, guiConfig.z)
    // cube.quaternion.rotateTowards(cube2.quaternion, 0.01)
    cube.quaternion.slerp(cube2.quaternion, 0.1)
    // rotateByQuaternion(cube)


    // rotateCamera()
    // if(monkey && cloneMonkey){
    //     // monkey.setRotationFromEuler(
    //     //     new THREE.Euler(guiConfig.x,guiConfig.y,guiConfig.z,'XZY')
    //     // )
    //     // cloneMonkey.setRotationFromEuler(
    //     //     new THREE.Euler(guiConfig.x,guiConfig.y,guiConfig.z,'XZY')
    //     // )
    //     monkey.rotation.set(guiConfig.x,guiConfig.y,guiConfig.z)
    // }
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});