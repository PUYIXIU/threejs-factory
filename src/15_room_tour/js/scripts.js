import * as THREE from 'three';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {FirstPersonControls} from "three/examples/jsm/controls/FirstPersonControls.js";
import {gsap} from "gsap";
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
camera.position.set(6, 8, 14);

// const controls = new FirstPersonControls(camera, renderer.domElement)
// controls.movementSpeed = 8
// controls.lookSpeed = 0.08

const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const progressBar = document.getElementById('progress-bar')
const progressContent = document.querySelector('.progress-content')

const loadingManager= new THREE.LoadingManager()
loadingManager.onProgress = (url, loaded, total)=>{
    progressBar.setAttribute('value', loaded/total*100)
}
loadingManager.onLoad = ()=>{
    progressContent.style.display = 'none'
}

renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

const gltfLoader = new GLTFLoader(loadingManager)
const rgbeLoader = new RGBELoader(loadingManager)

rgbeLoader.load('/assets/kitchen.hdr',texture=>{
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
    gltfLoader.load('/assets/the_king_s_hall/scene.gltf',gltf=>{
        gltf.scene.position.set(0,0,-10)
        scene.add(gltf.scene)
    })
})

let progress = 0
window.onmousedown = e=>{
    switch (progress%9){
        case 0:
            cameraMovement({x:1.64, y :0.79, z:-0.16})
            cameraRotation({x:0.83, y :-1.17, z:0.79})
            break;
        case 1:
            cameraMovement({x:1.35, y :0.83, z:-5.6})
            cameraRotation({x:0.43, y :0.13, z:-0.06})
            break;
        case 2:
            cameraMovement({x:3.04, y :-0.17, z:-6.33})
            cameraRotation({x:3, y :-0.9, z:3.03})
            break;
        case 4:
            cameraMovement({x:2.13, y :0.89, z:2.04})
            cameraRotation({x:2.85, y :-0.99, z:2.89})
            break;
        case 5:
            cameraMovement({x:-0.42, y :-0.13, z:2.11})
            cameraRotation({x:2.88, y :-0.09, z:3.11})
            break;
        case 6:
            cameraMovement({x:-1.04, y :0.36, z:0.18})
            cameraRotation({x:2.41, y :1.4, z:-2.42})
            break;
        case 7:
            cameraMovement({x:-0.84, y :0.58, z:-4.4})
            cameraRotation({x:0.11, y :0.83, z:-0.08})
            break;
        case 8:
            cameraMovement({x:-0.38, y :0.03, z:-1.57})
            cameraRotation({x:1.57, y :0.08, z:-1.62})
            break;
    }
    progress++
}

function cameraMovement(position){
    gsap.to(camera.position,{
        ...position,
        duration:4,
        ease:"ease"
    })
}

function cameraRotation(rotation){
    gsap.to(camera.rotation,{
        ...rotation,
        duration:4,
        ease:"ease"
    })
}
window.onmouseup = e =>{
    console.log(camera.position, camera.rotation)
}

// const clock = new THREE.Clock()
function animate() {
    // controls.update(clock.getDelta())
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});