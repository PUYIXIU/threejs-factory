import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {OutputPass} from "three/examples/jsm/postprocessing/outputpass";
import * as CANNON from 'cannon-es'


import {GUI} from "dat.gui";
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
camera.position.set(0.6, 5, 3.94);
orbit.update();

const aLight = new THREE.AmbientLight(0xffffff, 3)
scene.add(aLight)

const dLight = new THREE.DirectionalLight(0xffffff,3)
dLight.position.set(2,5,0)
scene.add(dLight)
dLight.castShadow = true

const config = {
    planeMatColor:0x1e1e11,

}
const textureLoader = new THREE.TextureLoader()
const starTexture = textureLoader.load('assets/star-texture.png')
starTexture.colorSpace = THREE.SRGBColorSpace
const planeGeo = new THREE.PlaneGeometry(10,10)
const planeMat = new THREE.MeshPhysicalMaterial({
    color:0xafa585,
    side:THREE.DoubleSide,
    roughness:0.0,
    metalness:0.0,
    map:starTexture
})
const planeMesh = new THREE.Mesh(planeGeo, planeMat)
planeMesh.rotation.set(-Math.PI/2, 0,0)
planeMesh.receiveShadow = true
scene.add(planeMesh)

const gui = new GUI()

// const planeFolder = gui.addFolder('plane')
// planeFolder.add(planeMat,'metalness',0,1)
// planeFolder.addColor(config,'planeMatColor').onChange(e=>{
//     planeMat.color.set(e)
// })


renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.4
const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth,window.innerHeight),
    0.4,0.0,0.0
)
const outputPass = new OutputPass()
effectComposer.addPass(renderScene)
effectComposer.addPass(unrealBloomPass)
effectComposer.addPass(outputPass)

// const unrealBloomFolder = gui.addFolder('unrealBloomEffect')

// unrealBloomFolder.add(renderer,'toneMappingExposure',0,3)
// unrealBloomFolder.add(unrealBloomPass,'strength',0,3)
// unrealBloomFolder.add(unrealBloomPass,'radius',0,3)
// unrealBloomFolder.add(unrealBloomPass,'threshold',0,1)

// gui控制的参数
const params = {
    Neptune_01: 0, // 海王星
    Uranus_02: 0,  // 天王星
    Saturn_03: 0, // 土星
    Jupiter_04: 0, // 木星
    Mars_05:0 , // 火星
    Earth_06:0 , // 地球
    Venus_07:0 , // 金星
    Mercury_08:0 , // 水星
    Sun_09:0 , // 太阳
}

const loader = new GLTFLoader()
let model
loader.load('assets/solar_system_model_orrery.glb',gltf=>{
    model = gltf.scene
    model.traverse(obj=>{
        if(obj.isMesh){
            obj.castShadow = true
        }
    })
    model.position.set(0, 0.732,0)
    model.scale.set(3,3,3)
    scene.add(model)
    Object.entries(params).forEach(([key,value])=>{
        gui.add(params,key,0,2*Math.PI).onChange(v=>{
            model.getObjectByName(key).rotation.y = v
            check()
        })
    })
})

const world = new CANNON.World({
    gravity:new CANNON.Vec3(0,-9.89,0)
})
let key,keyBody
function check(){
    if(
        !key &&
        Math.abs(params.Neptune_01 - Math.PI) < 0.1 &&
        Math.abs(params.Saturn_03 - Math.PI/2) < 0.1 &&
        Math.abs(params.Uranus_02 - Math.PI*3/2) < 0.1
    ){
        addKey()
    }
}
addKey()
function addKey(){
    loader.load('assets/key.glb',gltf=>{
        key = gltf.scene
        key.scale.set(0.005,0.005,0.005)
        key.position.set(0,0,1)
        debugger
        scene.add(key)

        keyBody = new CANNON.Body({
            mass:1,
            // shape:new CANNON.
        })
    })
}

window.onmousedown = e=>{
    console.log(camera.position)
}

function animate() {
    effectComposer.render()
    // renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    effectComposer.setSize(window.innerWidth, window.innerHeight);
});