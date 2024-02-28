import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {GUI} from "dat.gui";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(6, 8, 14);
orbit.update();

const gui = new GUI()

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
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const planeNormal = new THREE.Vector3()
const interSectionPoint = new THREE.Vector3()
const plane = new THREE.Plane()
window.onmousemove = e =>{
    mouse.x = e.offsetX / window.innerWidth * 2 -1
    mouse.y = 1- e.offsetY/window.innerHeight*2
    planeNormal.copy(camera.position)
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
    raycaster.setFromCamera(mouse, camera.position)
    raycaster.ray.intersectPlane(plane,interSectionPoint)
    target.copy(interSectionPoint)
}

const loader = new GLTFLoader()
let knightModel
// 加载骑士
loader.load('assets/medieval_knight.glb',gltf=>{
    knightModel = gltf.scene
    knightModel.traverse(obj=>{
        if(obj.isObject3D){
            obj.castShadow = true
        }
    })
    const head = knightModel.getObjectByName("mixamorigHead_06")
    scene.add(knightModel)
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
    candelModel.traverse(obj=>{
        if(obj.isObject3D){
            obj.castShadow = true
        }
    })
    candelModel.scale.set(2,2,2)
    for(let i = 0;i<4;i++){
        let group = new THREE.Group()
        let candel = SkeletonUtils.clone(candelModel)
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
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});