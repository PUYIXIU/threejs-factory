import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import {gsap} from "gsap";
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xefefef)
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 7);
orbit.update();

window.onmousemove = e=>{
    console.log(camera.position,camera.rotation,camera.focus)
}
let isAnimationStart = false
const tl = gsap.timeline()
const duration = 6
const ease = 'ease'
function cameraMove(){
    if(isAnimationStart) return
    isAnimationStart = false
    tl.to(camera.position,{
        x:0,
        y:0,
        z:19.5,
        duration,
        ease,
        onUpdate:function(){
            camera.lookAt(0,0,0)
        }
    }).to(camera.position,{
        x:-15,
        y:24,
        z:0,
        duration,
        ease,
        onUpdate:function(){
            camera.lookAt(0,0,0)
        }
    }).to(camera.position,{
        x:-26,
        y:30,
        z:-25,
        duration,
        ease,
        onUpdate:function(){
            camera.lookAt(0,0,0)
        }
    }).to(camera.position,{
        x:-11,
        y:10,
        z:-14,
        duration,
        ease,
        onUpdate:function(){
            camera.lookAt(0,0,0)
        }
    }).to(camera.position,{
        x:-8,
        y:0,
        z:-6,
        duration,
        ease,
        onUpdate:function(){
            camera.lookAt(0,0,0)
        }
    }).to(camera.position,{
        x:6,
        y:-10,
        z:0,
        duration,
        ease,
        onUpdate:function(){
            camera.lookAt(0,0,0)
        }
    },'>-2').to(camera.position,{
        x:0,
        y:2,
        z:12,
        duration,
        ease,
        onUpdate:function(){
            camera.lookAt(0,0,0)
        }
    }).to(camera.position,{
        x:-30,
        duration,
        ease,
    })
}

renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2
const gltfLoader= new GLTFLoader()
const rgbeLoader = new RGBELoader()
let phoenixModel
const objects = []
const mixers =[]
rgbeLoader.load('/assets/kitchen.hdr',texture=>{
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
    gltfLoader.load('/assets/phoenix_bird/scene.gltf',gltf=>{
        gltf.scene.scale.set(0.01,0.01,0.01)
        phoenixModel = gltf
        createObject({x:4,y:-4,z:3},0)
        createObject({x:3,y:0,z:0},0.2)
        createObject({x:-4,y:4,z:-4},0.6)
        window.onmousedown = cameraMove
    })
})
function createObject(position, startAt){
    let obj = SkeletonUtils.clone(phoenixModel.scene)
    scene.add(obj)
    obj.position.set(position.x,position.y,position.z)
    objects.push(obj)

    const mixer = new THREE.AnimationMixer(obj)
    const action = mixer.clipAction(THREE.AnimationClip.findByName(phoenixModel.animations,'Take 001'))
    action.timeScale = 0.5
    action.startAt(startAt)
    action.play()
    mixers.push(mixer)
}

renderer.setAnimationLoop(animate)
let clock = new THREE.Clock()
function animate() {
    let delta = clock.getDelta()
    mixers.forEach(mixer=>{
        mixer.update(delta)
    })
    renderer.render(scene, camera);
}


window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});