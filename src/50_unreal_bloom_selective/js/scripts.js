import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {GUI} from "dat.gui";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xFEFEFE);

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
camera.position.set(0, 2.7, 5);
orbit.update();

const paramsConfig = {
    strength:1,
    radius:0.5,
    threshold:0,
    exposure:1.5
}

const gui = new GUI()
const unrealBloomFolder = gui.addFolder('UnrealBloom')
unrealBloomFolder.add(paramsConfig, 'strength', 0, 2).onChange(val=>unrealBloomPass.strength = val)
unrealBloomFolder.add(paramsConfig, 'radius', 0, 1).onChange(val=>unrealBloomPass.radius = val)
unrealBloomFolder.add(paramsConfig, 'threshold', 0, 1).onChange(val=>unrealBloomPass.threshold = val)
unrealBloomFolder.add(paramsConfig, 'exposure', 0, 2).onChange(val=>renderer.toneMappingExposure = val)

renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = paramsConfig.exposure
const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1,
    0.5,
    0
)
unrealBloomPass.strength = paramsConfig.strength
unrealBloomPass.radius = paramsConfig.radius
unrealBloomPass.threshold = paramsConfig.threshold

effectComposer.addPass(renderScene)
effectComposer.addPass(unrealBloomPass)

effectComposer.renderToScreen = false

const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
        uniforms:{
            baseTexture:{value:null},
            bloomTexture:{value:effectComposer.renderTarget2.texture}
        },
        vertexShader:document.getElementById('vertex-shader').textContent,
        fragmentShader:document.getElementById('fragment-shader').textContent
    }),
    'baseTexture'
)

const finalComposer = new EffectComposer(renderer)
finalComposer.addPass(renderScene)
finalComposer.addPass(mixPass)

const outputPass = new OutputPass()
finalComposer.addPass(outputPass)

const BLOOM_LAYER = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_LAYER)
const darkMaterial = new THREE.MeshStandardMaterial({color:0x000000})
const materials = []

// 存储原始材质
function nonBloomed(obj){
    if(obj.isMesh && bloomLayer.test(obj.layers) === false){
        materials[obj.uuid] = obj.material
        obj.material = darkMaterial
    }
}

// 获取原始材质
function restoreMaterial(obj){
    if(materials[obj.uuid]){
        obj.material = materials[obj.uuid]
        delete materials[obj.uuid]
    }
}

const raycaster = new THREE.Raycaster()
const mousePosition = new THREE.Vector2()
window.onmousedown = e=>{
    mousePosition.x = (e.offsetX / window.innerWidth * 2) - 1
    mousePosition.y = 1 - (e.offsetY / window.innerHeight * 2)
    raycaster.setFromCamera(mousePosition, camera)
    const intersections = raycaster.intersectObject(model)
    if(intersections[0]){
        if(intersections[0].isObject3D){
            intersections[0].layers.toggle(BLOOM_LAYER)
        }
    }
}

const loader = new GLTFLoader()
let mixer, model
loader.load('assets/fantasy_sword.glb',gltf=>{
    model = gltf.scene
    scene.add(model)
    model.position.set(0,126,-127)
    mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations,"Idle")
    )
    action.play()
})

let clock = new THREE.Clock()
function animate() {
    if(mixer){
        mixer.update(clock.getDelta())
    }
    scene.traverse(nonBloomed)
    effectComposer.render()
    scene.traverse(restoreMaterial)
    finalComposer.render()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    effectComposer.setSize(window.innerWidth, window.innerHeight)
    finalComposer.setSize(window.innerWidth, window.innerHeight)
});