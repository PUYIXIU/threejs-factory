import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {OutputPass} from "three/examples/jsm/postprocessing/outputpass";
import * as CANNON from 'cannon-es'


import {GUI} from "dat.gui";
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
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

const world = new CANNON.World({
    gravity:new CANNON.Vec3(0,-9.89,0)
})

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

const planeBody = new CANNON.Body({
    type:CANNON.BODY_SLEEP_STATES,
    shape:new CANNON.Plane()
})
planeBody.quaternion.setFromEuler(-Math.PI/2, 0,0)
world.addBody(planeBody)

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
const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth,window.innerHeight),
    scene,camera
)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth,window.innerHeight),
    0.4,0.0,0.0
)
const outputPass = new OutputPass()
effectComposer.addPass(renderScene)
effectComposer.addPass(outlinePass)
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

let riddleDom = document.getElementById('riddle')
let tipDom = document.getElementById('tip')

let key,keyBody
let first = true
function check(){
    if(
        !key &&
        Math.abs(params.Neptune_01 - Math.PI) < 0.1 &&
        Math.abs(params.Saturn_03 - Math.PI/2) < 0.1 &&
        Math.abs(params.Uranus_02 - Math.PI*3/2) < 0.1
    ){
        addKey()
        first = false
    }
}
// addKey()

// 创建钥匙
function addKey(){
    if(!first) return
    riddleDom.style.opacity = 0
    loader.load('assets/key.glb',gltf=>{
        key = gltf.scene.getObjectByName('Object_2')
        key.scale.set(0.005,0.005,0.005)
        scene.add(key)
        const keyShape = new CANNON.Trimesh(
            key.geometry.attributes.position.array.map(i=>i*0.005),
            key.geometry.index.array
        )
        keyBody = new CANNON.Body({
            mass:1,
            position:new CANNON.Vec3(0,2,3),
            shape:keyShape
        })
        world.addBody(keyBody)
    })
}

const raycaster = new THREE.Raycaster()
const mousePosition = new THREE.Vector2()
let intersections = []
window.onmousemove = e=>{
    mousePosition.x = (e.offsetX / window.innerWidth *2) -1
    mousePosition.y = 1 -(e.offsetY / window.innerHeight *2)
    raycaster.setFromCamera(mousePosition, camera)
    intersections = raycaster.intersectObject(scene)
    outlinePass.selectedObjects = []
    if(key && intersections[0]){
       intersections.forEach(model=>{
           if(model.object.uuid == key.uuid){
               outlinePass.selectedObjects = [model.object]
           }
       })
    }
}

window.onmousedown = e =>{
    let obj = outlinePass.selectedObjects[0]
    // key.uuid
    if(obj && obj.uuid == key.uuid){
        tipDom.style.opacity = 1
        setTimeout(()=>{
            tipDom.style.opacity = 0
        },3000)
    }
}

const step = 1/60
function animate() {
    if(key){
        world.step(step)
        planeMesh.position.copy(planeBody.position)
        planeMesh.quaternion.copy(planeBody.quaternion)
        key.position.copy(keyBody.position)
        key.quaternion.copy(keyBody.quaternion)
    }
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