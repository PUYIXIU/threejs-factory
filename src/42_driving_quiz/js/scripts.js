import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import * as YUKA from 'yuka'
import {gsap} from "gsap";
import {YELLOWVEHICLEPATHs} from "./constants";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
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

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
dracoLoader.setDecoderConfig({type:'js'})
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load('assets/drive/terrain.glb',gltf=>{
    scene.add(gltf.scene)
    const mousePosition = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    window.onmousedown = e=>{
        mousePosition.x = (e.offsetX/window.innerWidth*2) - 1
        mousePosition.y = 1 - (e.offsetY/window.innerHeight*2)
        raycaster.setFromCamera(mousePosition, camera)
        const intersections = raycaster.intersectObject(gltf.scene)
        if(intersections[0]){
            console.log(intersections[0].point)
        }
    }
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
    const vehicle = new YUKA.Vehicle()
    vehicle.setRenderComponent(group, sync)
    const onFollowPathBehavior = new YUKA.OnPathBehavior(path)
    onFollowPathBehavior.radius = 0.1
    // onFollowPathBehavior.active = false
    vehicle.steering.add(onFollowPathBehavior)
    vehicle.rotation.fromEuler(0,rotateY,0)
    vehicle.position.copy(path.current())
    entityManager.add(vehicle)
    return{vehicle,group}
}

gltfLoader.load('assets/drive/SUV.glb',gltf=>{
    const model = gltf.scene
    const carV = createCarV(model, YELLOWVEHICLEPATHs[0], entityManager, 0)
    scene.add(carV.group)
})


const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const hemisphereLight = new THREE.HemisphereLight(0x94d8fb, 0x9cff2e, 1)
scene.add(hemisphereLight)

const directionLight = new THREE.DirectionalLight(0xffffff,0.7)
scene.add(directionLight)

const time = new YUKA.Time()
function animate() {
    const delta = time.update().getDelta()
    entityManager.update(delta)
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});