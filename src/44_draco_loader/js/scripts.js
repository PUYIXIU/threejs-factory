import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xFEFEFE);
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2
renderer.shadowMap.enabled = true

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(5, 5, 5);
orbit.update();
orbit.autoRotate = true

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

const ambientLight = new THREE.AmbientLight(1)
scene.add(ambientLight)
const directionLight = new THREE.DirectionalLight(0xffffff, 1)
directionLight.position.set(5,5,5)
scene.add(directionLight)
directionLight.castShadow = true

const groundGeo = new THREE.PlaneGeometry(12,12)
const groundMat = new THREE.MeshPhysicalMaterial({
    color:0xffffff,
    roughness:0,
    metalness:0.3
})
const groundMesh = new THREE.Mesh(groundGeo, groundMat)
groundMesh.receiveShadow = true
scene.add(groundMesh)
groundMesh.rotateX(-Math.PI/2)

const loader = new GLTFLoader()
// const dLoader = new DRACOLoader()
// dLoader.setDecoderPath('assets/draco/')
// dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
// dLoader.setDecoderPath('/examples/jsm/libs/draco/')
// dLoader.setDecoderConfig({type:'js'})
// loader.setDRACOLoader(dLoader)

const rgbeLoader = new RGBELoader()
rgbeLoader.load('assets/kitchen.hdr',texture=>{
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
    let start = Date.now()
    loader.load('assets/lamborghini_centenario_roadster_sdc.glb',gltf=>{
        scene.add(gltf.scene)
        gltf.scene.traverse(model=>model.castShadow = true)
        let end = Date.now()
        alert(`加载耗时：${(end-start)/1000}s`)
    })
})


function animate() {
    orbit.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});