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
loader.load('assets/bathroom_door_frame.glb',gltf=>{
    const model = gltf.scene
    model.scale.set(0.006,0.006,0.006)
    model.traverse(m=>m.castShadow = true)
    model.position.x = 4
    scene.add(model)
    const model_2 = SkeletonUtils.clone(model)
    model_2.position.x = -4
    scene.add(model_2)
})

let mixer
loader.load('assets/Wizard.gltf',gltf=>{
    const model = gltf.scene
    model.scale.set(0.6,0.6,0.6)
    scene.add(model)
    model.traverse(m=>m.castShadow = true)
    model.rotation.y = -Math.PI/2
    mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, "Run_Weapon")
    )
    action.play()

})

const clock = new THREE.Clock()
function animate() {
    const delta = clock.getDelta()
    if(mixer)
        mixer.update(delta)
    renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});