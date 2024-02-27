import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from "dat.gui";
import {CSS2DRenderer, CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {OutputPass} from "three/examples/jsm/postprocessing/outputpass";
import {DecoratedTorusKnot4a} from 'three/examples/jsm/curves/CurveExtras'


const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cssRenderer = new CSS2DRenderer()
cssRenderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(cssRenderer.domElement)
cssRenderer.domElement.style.position = 'absolute'
cssRenderer.domElement.style.top = '0px'
cssRenderer.domElement.style.pointerEvents = 'none'


// Sets the color of the background
renderer.setClearColor(0xFEFEFE);
// [0-1]
const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0xffffff, 0.05)
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

let targetCamera = camera

const config = {
    orbitCamera:false
}

let gui = new GUI()
gui.add(config,'orbitCamera').onChange(v=>{
    if(v){
        targetCamera = orbitCamera
    }else{
        targetCamera = camera
    }
})


renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.8

const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.7, 0.25, 0.05
)
const outputPass = new OutputPass()
effectComposer.addPass(renderScene)
effectComposer.addPass(unrealBloomPass)
effectComposer.addPass(outputPass)

gui.add(renderer,'toneMappingExposure',0,3)
gui.add(unrealBloomPass,'strength',0,3)
gui.add(unrealBloomPass,'radius',0,3)
gui.add(unrealBloomPass,'threshold',0,1)

const orbitCamera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.001,
    1000
)

const aLight = new THREE.AmbientLight(0xffffff,1)
scene.add(aLight)

const dLight = new THREE.DirectionalLight(0xffffff,5)
dLight.position.set(1,15,1)
scene.add(dLight)


const gltfLoader = new GLTFLoader()
let backModel
let shipModel
let mixer
// 加载宇宙背景
gltfLoader.load('assets/nebula_space.glb',backGltf=>{
    backModel = backGltf.scene
    scene.add(backModel)
    gltfLoader.load('assets/space_ship.glb',modelGltf=>{
        shipModel = modelGltf.scene
        shipModel.scale.set(0.3,0.3,0.3)
        scene.add(shipModel)

        mixer = new THREE.AnimationMixer(shipModel)
        const action = mixer.clipAction(
            THREE.AnimationClip.findByName(modelGltf.animations,'Animation')
        )
        action.play()
    })
})

const points = [
    new THREE.Vector3(-10, 0, 10),
    new THREE.Vector3(-5, 5, 5),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(5, -5, 5),
    new THREE.Vector3(10, 0, 10),
]

points.forEach((point,index)=>{
    const label = document.createElement('div')
    label.innerText = `point ${index+1}`
    label.className = 'label'
    const labelObj = new CSS2DObject(label)
    labelObj.position.copy(point)
    labelObj.position.add(new THREE.Vector3(0,0.1,0))
    scene.add(labelObj)
})

const path = new THREE.CatmullRomCurve3(points,true)
// const path = new DecoratedTorusKnot4a(10)

const pathGeometry = new THREE.BufferGeometry().setFromPoints(path.getPoints(50))
const pathMaterial = new THREE.LineBasicMaterial({
    color:0xff0000,
})
const pathObject = new THREE.Line(pathGeometry,pathMaterial)
scene.add(pathObject)

const clock = new THREE.Clock()
function animate(time) {
    // const t = (time / 2000 % 6)/6
    const t = (time / 2000 % 10)/10

    if(mixer){
        mixer.update(clock.getDelta())


        const point = path.getPointAt(t)
        shipModel.position.copy(point)

        const tangent = path.getTangentAt(t).normalize()

        shipModel.lookAt(
            point.clone().add(tangent)
        )

        orbitCamera.position.copy(point.add(new THREE.Vector3(0,1,0)))
        orbitCamera.lookAt(
            point.clone().add(tangent)
        )

        // renderer.render(scene, targetCamera);
        renderScene.camera = targetCamera
        effectComposer.render()
        // cssRenderer.render(scene,targetCamera)
    }

}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    orbitCamera.aspect = window.innerWidth / window.innerHeight;
    orbitCamera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
});