import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import * as YUKA from 'yuka'
import {gsap} from "gsap";
import {YELLOWVEHICLEPATHs,REDVEHICLEPATHs,BLUEVEHICLEPATHs} from "./constants";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xFEFEFE);
renderer.outputEncoding = THREE.sRGBEncoding

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(-20, 25, 50);
camera.lookAt(0,0,0)

// const orbit = new OrbitControls(camera, renderer.domElement)
// orbit.update()

const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
effectComposer.addPass(renderScene)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.7,
    0.2,
    0.1
)
effectComposer.addPass(unrealBloomPass)

const startBtn = document.getElementById('start-btn')
const titleContainer = document.querySelector('.title-container')
startBtn.onclick = e=>{
    const tl = gsap.timeline()
    tl.to(startBtn,{
        autoAlpha:0,
        y:'-=20',
        duration:0.2
    })
    .to(titleContainer,{
        autoAlpha:0,
        y:'-20',
        duration:0.5
    },0)
    .to(camera.position,{
        x:1.6,
        y:5,
        z:13,
        duration:3,
        onUpdate:()=>camera.lookAt(
            chara_model_group.position.x,
            chara_model_group.position.y,
            chara_model_group.position.z
        )
    },0)
}

const loadingManager = new THREE.LoadingManager()
const progressBarContainer = document.querySelector('.progress-bar-container')
const progressBar = document.getElementById('progress-bar')

loadingManager.onProgress = (url, loaded, total)=>{
    progressBar.setAttribute('value',loaded/total*100)
}
loadingManager.onLoad = ()=>{
    progressBarContainer.style.display = 'none'
}

const gltfLoader = new GLTFLoader(loadingManager)
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
dracoLoader.setDecoderConfig({type:'js'})
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load('assets/drive/terrain.glb',gltf=>{
    scene.add(gltf.scene)
    const mousePosition = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    let positionCatch = []
    window.ondblclick = e=>{
        mousePosition.x = (e.offsetX/window.innerWidth*2) - 1
        mousePosition.y = 1 - (e.offsetY/window.innerHeight*2)
        raycaster.setFromCamera(mousePosition, camera)
        const intersections = raycaster.intersectObject(gltf.scene)
        if(intersections[0]){
            const point = intersections[0].point
            positionCatch.push([point.x, point.y, point.z])
        }
    }
    window.addEventListener('keydown',e=>{
        if(e.code == 'KeyP'){
            console.log(JSON.stringify(positionCatch))
            positionCatch = []
        }
    })
})

const entityManager = new YUKA.EntityManager()

function sync (entity, rendererComponent){
    rendererComponent.matrix.copy(entity.worldMatrix)
}

// 创建vehicle
function createCarV(model, path, entityManager, rotateY){
    const group = new THREE.Group()
    group.matrixAutoUpdate = false
    const carModel = SkeletonUtils.clone(model)
    group.add(carModel)
    scene.add(group)
    const vehicle = new YUKA.Vehicle()
    vehicle.setRenderComponent(group, sync)
    vehicle.maxSpeed = 10
    const followPathBehavior = new YUKA.FollowPathBehavior(path)
    vehicle.steering.add(followPathBehavior)
    const onPathBehavior = new YUKA.OnPathBehavior(path)
    onPathBehavior.radius = 0.1
    vehicle.steering.add(onPathBehavior)
    vehicle.rotation.fromEuler(0,rotateY,0)
    vehicle.position.copy(path.current())
    entityManager.add(vehicle)
    return{vehicle,group}
}

gltfLoader.load('assets/drive/SUV.glb',gltf=>{
    YELLOWVEHICLEPATHs.forEach(item=>{
        createCarV(gltf.scene, item.path, entityManager, item.rotateY)
    })
})

gltfLoader.load('assets/drive/blue.glb', gltf=>{
    BLUEVEHICLEPATHs.forEach(item=>{
        createCarV(gltf.scene, item.path, entityManager, item.rotateY)
    })
})

gltfLoader.load('assets/drive/red.glb', gltf=>{
    REDVEHICLEPATHs.forEach(item=>{
        createCarV(gltf.scene, item.path, entityManager, item.rotateY)
    })
})


let chara_model_group = new THREE.Group()
gltfLoader.load('assets/Wolf.gltf', gltf=>{
    let model = gltf.scene
    chara_model_group.add(model)
    model.scale.set(0.3,0.3,0.3)
    chara_model_group.position.set(1.6, 0.4,17.6)
    scene.add(chara_model_group)
})

let shibanu_model
let shibanu_mixer
gltfLoader.load('assets/Shibainu.gltf', gltf=>{
    shibanu_model = gltf.scene
    shibanu_model.scale.set(0.3,0.3,0.3)
    shibanu_model.position.set(0.,0,20)
    shibanu_model.lookAt(1.6, 0.4,17.6)
    scene.add(shibanu_model)
    shibanu_mixer = new THREE.AnimationMixer(shibanu_model)
    const action = shibanu_mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations,"Idle_2")
    )
    action.play()
})
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const hemisphereLight = new THREE.HemisphereLight(0x94d8fb, 0x9cff2e, 0.7)
scene.add(hemisphereLight)

const directionLight = new THREE.DirectionalLight(0xffffff,1)
scene.add(directionLight)

const clock = new THREE.Clock()
const time = new YUKA.Time()
function animate() {
    const delta = time.update().getDelta()
    entityManager.update(delta)
    if(shibanu_mixer)
        shibanu_mixer.update(clock.getDelta())
    // renderer.render(scene, camera);
    effectComposer.render()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});