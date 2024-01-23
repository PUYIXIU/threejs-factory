import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {CSS2DObject, CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
import {RenderPixelatedPass} from "three/examples/jsm/postprocessing/RenderPixelatedPass";
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 3
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xFEFEFE);
document.body.appendChild(renderer.domElement);

const cssRenderer = new CSS2DRenderer()
cssRenderer.setSize(window.innerWidth, window.innerHeight)
cssRenderer.domElement.style.position = 'absolute'
cssRenderer.domElement.style.top = '0'
cssRenderer.domElement.style.left = '0'
cssRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(cssRenderer.domElement)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 20);

// const orbit = new OrbitControls(camera, renderer.domElement);
// orbit.update();

const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
effectComposer.addPass(renderScene)
const renderPixelatedPass = new RenderPixelatedPass(3,scene,camera)
effectComposer.addPass(renderPixelatedPass)

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const loadingManager = new THREE.LoadingManager()
const progressBar = document.getElementById('loading-progress')
loadingManager.onProgress = (url, loaded, total) => {
    progressBar.setAttribute('value', loaded / total * 100)
}
loadingManager.onLoad = () => {
    setTimeout(() => {
        scene.add(cardObj)
        document.querySelector('.progress-layer').style.display = 'none'
    },300)
}

const loader = new GLTFLoader(loadingManager)
const rgbeLoader = new RGBELoader(loadingManager)
const group = new THREE.Group()
const positionMap = {}
scene.add(group)
let selectIndex = 0
const card = document.createElement('div')
card.className = 'card'
const cardObj = new CSS2DObject(card)
let selectName
loader.load('assets/playing-cards_symbols.glb',gltf=>{
    rgbeLoader.load('assets/kitchen.hdr',texture=>{
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.environment = texture
        gltf.scene.traverse(model=>{
            if(model.isObject3D && model.children.length == 0){
                group.add(model)
            }
        })
        group.children.forEach((model,index)=>{
            const position = [((index+0.5)-group.children.length/2)*7, 1, 0]
            model.position.set(...position)
            model.scale.set(0.5,0.5,0.5)
            positionMap[model.name] = position
            model.rotateX(-Math.PI/2)
            cardObj.position.set(...position)
        })
        selectIndex = group.children.length - 1
        selectName = group.children[group.children.length-1].name

    })
})

const raycaster = new THREE.Raycaster()
const mousePosition = new THREE.Vector2()
let isMoving = false
window.onmousemove = function(e){
    mousePosition.x = (e.offsetX/window.innerWidth*2) - 1
    mousePosition.y = 1 - (e.offsetY/window.innerHeight*2)
    raycaster.setFromCamera(mousePosition, camera)
    const intersections = raycaster.intersectObject(group)
    if(intersections[0]){
        selectName = intersections[0].object.name
    }
}
window.onmousedown = function(e){
    selectIndex = group.children.findIndex(item=>item.name == selectName)
    cardObj.position.copy(group.children[selectIndex].position)
}
function animate(time) {
    if(group.children[selectIndex])
        group.children[selectIndex].rotateZ(0.1)
    // renderer.render(scene, camera);
    effectComposer.render()
    cssRenderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
});