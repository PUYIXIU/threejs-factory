import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {GUI} from "dat.gui";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {OutputPass} from "three/examples/jsm/postprocessing/outputpass";
import {gsap} from "gsap";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.00001,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
const cameraOriginPosition = new THREE.Vector3(6,8,14)
camera.position.copy(cameraOriginPosition);
orbit.update();

const gui = new GUI()

// 效果通道
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5
const composer = new EffectComposer(renderer)
const rendererScene = new RenderPass(scene, camera)
const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5, 0.5, 0.5
)
const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,camera
)
const outputPass = new OutputPass()

composer.addPass(rendererScene)
composer.addPass(unrealBloomPass)
composer.addPass(outlinePass)
composer.addPass(outputPass)

const unrealEffectFolder = gui.addFolder('unreal effect')
unrealEffectFolder.add(renderer,'toneMappingExposure',0,3)
unrealEffectFolder.add(unrealBloomPass,'strength',0,3)
unrealEffectFolder.add(unrealBloomPass,'radius',0,3)
unrealEffectFolder.add(unrealBloomPass,'threshold',0,1)


const aLight = new THREE.AmbientLight(0xffffff,3)
scene.add(aLight)

const spotLight = new THREE.SpotLight(0x75b3ff,75)
spotLight.distance = 12
spotLight.angle = 30
spotLight.decay = 1
scene.add(spotLight)
spotLight.position.set(0,0.7,7.8)
spotLight.castShadow = true

const textureLoader = new THREE.TextureLoader()
const mapTex = textureLoader.load('assets/Japanse_Stone_Wall/_Diffuse_.jpg')
const normalTex = textureLoader.load('assets/Japanse_Stone_Wall/_Normal_.jpg')
const roughtTex = textureLoader.load('assets/Japanse_Stone_Wall/_Roughness_.jpg')
const aoTex = textureLoader.load('assets/Japanse_Stone_Wall/_Height_.jpg')

const planeGeo = new THREE.PlaneGeometry(12,12)
const planeMat = new THREE.MeshStandardMaterial({
    color:0x888888,
    roughness:0.44,
    metalness:0.88,
    map:mapTex,
    normalMap:normalTex,
    roughnessMap:roughtTex,
    aoMap:aoTex
})
const planeMesh = new THREE.Mesh(planeGeo,planeMat)
planeMesh.rotation.set(-Math.PI/2, 0, 0)
scene.add(planeMesh)
planeMesh.receiveShadow = true

// raycaster视线交点
let target = new THREE.Vector3()
target.z = 4
const raycaster = new THREE.Raycaster()
const raycaster_select = new THREE.Raycaster() // 选择物体用的raycaster
const mouse = new THREE.Vector2()
const planeNormal = new THREE.Vector3()
const interSectionPoint = new THREE.Vector3()
const plane = new THREE.Plane()
let intersections = []
window.onmousemove = e =>{
    mouse.x = e.offsetX / window.innerWidth * 2 -1
    mouse.y = 1- e.offsetY/window.innerHeight*2
    planeNormal.copy(camera.position)
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
    raycaster.setFromCamera(mouse, camera)
    raycaster_select.setFromCamera(mouse, camera)
    // 扫描视线点
    raycaster.ray.intersectPlane(plane,interSectionPoint)
    target.copy(interSectionPoint)
    target.z = 4
    target.y = Math.max(interSectionPoint.y, 1)
    intersections = raycaster_select.intersectObject(scene)
    outlinePass.selectedObjects = []
    intersections = intersections.map(({object,point})=>{
        let ancestor = object
        object.traverseAncestors(obj=>{
            if(['knight','candel','npc'].includes(obj.name))
                ancestor = obj
        })
        if(['knight','candel','npc'].includes(ancestor.name)){
            outlinePass.selectedObjects = [ancestor]
        }
        ancestor.interPoint = point
        return ancestor
    })
}

const dialogBox = document.getElementById('dialog-box')
const tipBox = document.getElementById('tip-box')
const returnBtn = document.getElementById('return-btn')

window.onmousedown = e =>{
    if(e.target === returnBtn) return
    // 扫描物体选中点
    for(let i = 0;i<intersections.length;i++){
        const object = intersections[i]
        switch(object.name){
            case 'npc':
                return talkToNpc();
            case 'candel':
                return showTip('烛台');
            default:
                break;
        }
    }
}

returnBtn.onmousedown = e=>{
    let tl = gsap.timeline()
    tl.to(dialogBox,{
        opacity:0,
        y:-10,
        duration:1,
        ease:'ease'
    }).to(camera.position,{
        x:cameraOriginPosition.x,
        y:cameraOriginPosition.y,
        z:cameraOriginPosition.z,
        duration:3,
        ease:'ease',
        onUpdate:()=>{
        },
    }).to(orbit.target,{
        x:0,
        y:0,
        z:0,
        duration:3,
        ease:'ease',
        onUpdate:()=>{
            camera.lookAt(
                orbit.target.x,
                orbit.target.y,
                orbit.target.z,
            )
        },
        onComplete:()=>{
            orbit.enableZoom = true
            orbit.enableRotate = true
            orbit.enablePan = true
        }
    },'>-3')
}
// 显示物体提示信息
function showTip(message){
    gsap.set(tipBox,{
        opacity:0,
        y:-10,
        display:'block'
    })
    tipBox.innerText = message
    gsap.to(tipBox,{
        opacity:1,
        y:0,
        duration:1,
        ease:'ease'
    })
    setTimeout(()=>{
        gsap.to(tipBox,{
            opacity:0,
            y:-10,
            duration:1,
            ease:'ease',
            onComplete:()=>{
                tipBox.style.display = 'none'
            }
        })
    },3000)
}

// 和npc说话
function talkToNpc(){
    if(!npcModel) return
    gsap.set(dialogBox,{
        opacity:0,
        y:-10
    })
    let tl = gsap.timeline()
    const npcPosition = scene.getObjectByName('npc').position
    tl.to(camera.position,{
        x:-2.3,
        y:2.3,
        z:1.0,
        duration:3,
        ease:'ease',
        onUpdate:()=>{
            orbit.enableZoom = false
            orbit.enableRotate = false
            orbit.enablePan = false
            orbit.target.set(
                npcPosition.x,
                2.3,
                npcPosition.z)
            camera.lookAt(
                npcPosition.x,
                2.3,
                npcPosition.z,
            )
        }
    }).to(dialogBox,{
        opacity:1,
        y:0,
        duration:1,
        ease:'ease'
    })
}

const selectableEntity = []
const loader = new GLTFLoader()
let knightModel
let knightHead
let mixer
// 加载骑士
loader.load('assets/medieval_knight.glb',gltf=>{
    knightModel = gltf.scene
    knightModel.name = 'knight'
    knightModel.traverse(obj=>{
        if(obj.isObject3D){
            obj.castShadow = true
        }
    })
    knightHead = knightModel.getObjectByName("mixamorigHead_06")
    selectableEntity.push(knightModel)
    // 手里加剑
    scene.add(knightModel)
    mixer = new THREE.AnimationMixer(knightModel)
    const action = mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, "mixamo.com")
    )
    action.play()
})

let npcModel
// 加载NPC
loader.load('assets/metahuman.glb',gltf=>{
    npcModel = gltf.scene
    npcModel.name = 'npc'
    npcModel.scale.set(1.5, 1.5, 1.5)
    npcModel.rotation.y = Math.PI * 100 / 180
    npcModel.position.set(-4, 0, 2)
    npcModel.traverse(obj=>{
        if(obj.isObject3D){
            obj.castShadow = true
        }
    })
    selectableEntity.push(npcModel)
    scene.add(npcModel)
})

let p_position = [
    [4,4],
    [4,-4],
    [-4,4],
    [-4,-4],
]
let candelModel
// 0xff8b4d
let pLight = new THREE.PointLight(0xffd780,10,7,1)
let pLight2 = new THREE.PointLight(0xff8b4d,5,12,1)
pLight.castShadow = true
pLight2.castShadow = true
const lightGroup = []
// 加载蜡烛
loader.load('assets/medieval_candelabra.glb',gltf=>{
    candelModel = gltf.scene
    candelModel.name = 'candel'
    candelModel.traverse(obj=>{
        if(obj.isObject3D){
            obj.castShadow = true
        }
    })
    candelModel.scale.set(2,2,2)
    for(let i = 0;i<4;i++){
        let group = new THREE.Group()
        group.name = 'candel'
        let candel = SkeletonUtils.clone(candelModel)
        selectableEntity.push(candel)
        group.add(candel)
        candel.position.set(0, 1.8, 0)
        let light = pLight.clone()
        group.add(light)
        light.position.set(0,3,0)

        let light2 = pLight2.clone()
        group.add(light2)
        light2.position.set(0,2.5,0)

        group.position.set(p_position[i][0],0,p_position[i][1])
        scene.add(group)
        lightGroup.push(group)
    }
})

let clock = new THREE.Clock()
function animate(time) {
    lightGroup.forEach((group,index)=>{
        group.traverse(obj=>{
            if(obj.type === "PointLight"){
                obj.position.y += 0.001*Math.sin(time/100 + index + Math.random())
                obj.position.x += 0.001*Math.sin(time/100 + index + Math.random())
                obj.position.z += 0.001*Math.sin(time/100 + index + Math.random())
            }
        })
    })
    if(mixer){
        mixer.update(clock.getDelta())
    }
    if(knightModel){
        knightHead.lookAt(target)
    }
    // renderer.render(scene, camera);
    composer.render();
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});