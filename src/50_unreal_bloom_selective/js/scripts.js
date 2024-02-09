import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/gltfloader';
import { RenderPass } from 'three/examples/jsm/postprocessing/renderpass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/effectcomposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/unrealbloompass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/shaderpass';
import { OutputPass } from 'three/examples/jsm/postprocessing/outputpass';
import { GUI } from 'dat.gui';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5

document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xFEFEFE);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2.7, 5);
orbit.update();

const renderScene = new RenderPass(scene, camera)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    1,
    0.1
)
const bloomComposer = new EffectComposer(renderer)
bloomComposer.addPass(renderScene)
bloomComposer.addPass(unrealBloomPass)

bloomComposer.renderToScreen = false

const finalComposer = new EffectComposer(renderer)
const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById('v-shader').textContent,
        fragmentShader: document.getElementById('f-shader').textContent,
    }),'baseTexture'
)
const outputPass = new OutputPass()
finalComposer.addPass(renderScene)
finalComposer.addPass(mixPass)
finalComposer.addPass(outputPass)

const BLOOM_LAYER = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_LAYER)
const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
const materials = {}

function storeMaterial(obj) {
    if (obj.isMesh && !bloomLayer.test(obj.layers)) {
        materials[obj.uuid] = obj.material
        obj.material = darkMaterial
    }
}

function restoreMaterial(obj) {
    if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid]
        delete materials[obj.uuid]
    }
}

let model, mixer
const loader = new GLTFLoader()
loader.load('assets/fantasy_sword.glb', gltf => {
    model = gltf.scene
    scene.add(model)
    model.position.set(0, 126, -127)
    mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations,'Idle')
    )
    action.play()
    createGUI()
})

function createGUI() { 
    const gui = new GUI()
    const configs = {}
    const names = ['Object_11', 'Object_12', 'Object_13', 'Object_14']
    names.forEach(name => {
        configs[name] = false
        gui.add(configs, name).onChange(val => {
            model.getObjectByName(name).layers.toggle(BLOOM_LAYER)
        })
    })
}

const clock = new THREE.Clock()
function animate() {
    const delta = clock.getDelta()
    if (mixer) {
        mixer.update(delta)
    }
    scene.traverse(storeMaterial) // 不在bloom层的变暗
    bloomComposer.render() // bloom通道生成效果纹理
    scene.traverse(restoreMaterial) // 恢复变暗部分的纹理
    finalComposer.render() // 混合bloom与原始效果
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight)
    finalComposer.setSize(window.innerWidth, window.innerHeight)
});