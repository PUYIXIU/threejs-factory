import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xefefef);
renderer.shadowMap.enabled = true

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbitControls = new OrbitControls(camera,renderer.domElement)
orbitControls.enableZoom = false
orbitControls.enableDamping = true
orbitControls.dampingFactor = 0.3

const trackBallControls = new TrackballControls(camera,renderer.domElement)
trackBallControls.noRotate = true
trackBallControls.noPan = true
trackBallControls.zoomSpeed = 3

camera.position.set(5, 5, 5);
orbitControls.update()

const grid = new THREE.GridHelper(12,12)
scene.add(grid)

const ambientLight = new THREE.AmbientLight(0xffffff,1)
scene.add(ambientLight)

const spotLight = new THREE.SpotLight(0xffffff,20)
spotLight.position.set(-3,3,0)
spotLight.castShadow = true
scene.add(spotLight)
const spotlightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotlightHelper)

const planeGeo = new THREE.PlaneGeometry(12,12)
const planeMat = new THREE.MeshStandardMaterial({
    roughness:0,
    color:0xffffff
})
const planeMesh = new THREE.Mesh(planeGeo, planeMat)
scene.add(planeMesh)
planeMesh.rotateX(-Math.PI/2)
planeMesh.receiveShadow = true

const loader = new GLTFLoader()
let lod = new THREE.LOD()
scene.add(lod)
function addGLTFModel(gltf){
    const model = gltf.scene
    model.traverse(m=>{
        if(m.isObject3D){
            m.castShadow = true
        }
    })
    return model
}
loader.load('assets/cactus/Cactus_01.glb',gltf=>{
    lod.addLevel(addGLTFModel(gltf), 0)
})
loader.load('assets/cactus/Cactus_02.glb',gltf=>{
    lod.addLevel(addGLTFModel(gltf), 3)
})
loader.load('assets/cactus/Cactus_1.glb',gltf=>{
    lod.addLevel(addGLTFModel(gltf), 6)
})

function animate() {
    const target = orbitControls.target
    orbitControls.update()
    trackBallControls.target.set(target.x, target.y, target.z)
    trackBallControls.update()
    renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});