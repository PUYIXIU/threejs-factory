import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 5, 14);
orbit.update();

const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// const plane1Geo = new THREE.PlaneGeometry(7,7,)
// const plane1Mat = new THREE.MeshBasicMaterial({
//     color:0x99eeff,
//     side:THREE.DoubleSide
// })
// const plane1Mesh = new THREE.Mesh(plane1Geo, plane1Mat)
// scene.add(plane1Mesh)
// plane1Mesh.position.z = -4
//
// const plane2Geo = new THREE.BoxGeometry(5,5,1)
// const plane2Mat = new THREE.MeshBasicMaterial({
//     color:0xffee33,
//     side:THREE.DoubleSide
// })
// const plane2Mesh = new THREE.Mesh(plane2Geo, plane2Mat)
// scene.add(plane2Mesh)
//
// const ringGeo = new THREE.RingGeometry(1,2)
// const ringMat = new THREE.MeshBasicMaterial({
//     color:0xffaaee,
//     side:THREE.DoubleSide
// })
// const ringMesh = new THREE.Mesh(ringGeo, ringMat)
// scene.add(ringMesh)
// ringMesh.position.z = 4
// ringMesh.material.colorWrite = false
//
// // order越低越先渲染
// plane1Mesh.renderOrder = 0
// plane2Mesh.renderOrder = 2
// ringMesh.renderOrder = 1

const ambientLight = new THREE.AmbientLight(0xffffff,3)
// scene.add(ambientLight)
const spotLight = new THREE.SpotLight(0xffffff,100)
scene.add(spotLight)
spotLight.castShadow = true
spotLight.position.set(0,5,-5)
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHelper)
const groundGeo  = new THREE.BoxGeometry(12,12,4)
const groundMat = new THREE.MeshStandardMaterial({
    color:0xefefef,
    roughness:0,
})
const groundMesh = new THREE.Mesh(groundGeo, groundMat)
groundMesh.receiveShadow = true
scene.add(groundMesh)
groundMesh.rotation.x = Math.PI/2
groundMesh.position.y = -2

const loader = new GLTFLoader()
let doorLeft, doorRight
loader.load('assets/bathroom_door_frame.glb',gltf=>{
    doorRight = gltf.scene
    doorRight.scale.set(0.006,0.006,0.006)
    doorRight.traverse(m=>{
        if(m.isObject3D){
            m.castShadow = true
        }
    })
    doorRight.position.x = 4
    scene.add(doorRight)
    doorLeft = SkeletonUtils.clone(doorRight)
    doorLeft.position.x = -4
    scene.add(doorLeft)

    doorLeft.randerOrder = 0
    doorRight.randerOrder = 0
})

function addModel(gltf, animateName, initX=0, startAt=0, timeScale=1){
    const model = gltf.scene
    model.scale.set(0.6,0.6,0.6)
    scene.add(model)
    model.traverse(m=>{
        if(m.isObject3D){m.castShadow = true}
        if(m.isMesh){m.renderOrder = 2}}
    )
    model.position.x = initX
    model.rotation.y = -Math.PI/2
    const mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, animateName)
    )
    action.play()
    action.startAt(startAt)
    action.timeScale = timeScale

    return [model, mixer]
}

let wizard_mixer , wizard_model
let cleric_mixer , cleric_model
let monk_mixer , monk_model
loader.load('assets/Wizard.gltf',gltf=>{
    [wizard_model, wizard_mixer] = addModel(gltf, 'Run_Weapon')
})
loader.load('assets/Cleric.gltf',gltf=>{
    [cleric_model, cleric_mixer] = addModel(gltf, 'Run',3,0.3,1.1)
})
loader.load('assets/Monk.gltf',gltf=>{
    [monk_model, monk_mixer] = addModel(gltf, 'Run',-3,0.5,0.9)
})

// 添加两侧门的遮罩盒
function addNoWriteBox(position){
    const boxGeo = new THREE.BoxGeometry(8,4,2)
    const boxMat = new THREE.MeshBasicMaterial({color:0xffffff})
    const boxMesh = new THREE.Mesh(boxGeo,boxMat)
    scene.add(boxMesh)
    boxMesh.position.set(...position)
    boxMesh.material.colorWrite = false
    return boxMesh
}
const boxLeft = addNoWriteBox([-8, 2,0])
const boxRight = addNoWriteBox([8, 2,0])
boxLeft.renderOrder = 1
boxRight.renderOrder = 1


const clock = new THREE.Clock()
function animate() {
    const delta = clock.getDelta()
    function runMixer(model, mixer){
        if(mixer){
            mixer.update(delta)
            if(model.position.x > -5){
                model.position.x -= 0.05
            }else{
                model.position.x = 5
            }
        }
    }
    runMixer(wizard_model, wizard_mixer)
    runMixer(cleric_model, cleric_mixer)
    runMixer(monk_model, monk_mixer)
    renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});