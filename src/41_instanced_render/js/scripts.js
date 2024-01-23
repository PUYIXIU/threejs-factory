import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xFEFEFE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(50, 0, 50);
orbit.update();

const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight(0xffffff,1)
scene.add(ambientLight)
// const spotLight = new THREE.SpotLight(0xffffff,5)
// spotLight.position.set(0,15,0)
// scene.add(spotLight)

const pointLight = new THREE.PointLight(0xffffff,50,50)
scene.add(pointLight)
pointLight.position.set(0,0,0)

const loader = new RGBELoader()
const geo = new THREE.IcosahedronGeometry(1)
let mesh
let count = 100
const dummy = new THREE.Object3D()
loader.load('assets/kitchen.hdr',texture=>{
   texture.mapping = THREE.EquirectangularReflectionMapping
   scene.environment = texture
   const mat = new THREE.MeshPhysicalMaterial({
        color:0x00ffff,
        transmission:0.5,
        metalness:0.5,
        roughness:0,
        ior:2.33,
        transparent:true,
        opacity:0.9

    })
    mesh = new THREE.InstancedMesh(geo, mat, count)
    scene.add(mesh)

    for(let i = 0;i<count;i++){
        dummy.position.x = Math.random()*40-20
        dummy.position.y = Math.random()*40-20
        dummy.position.z = Math.random()*40-20

        dummy.rotation.x = Math.random()*Math.PI
        dummy.rotation.y = Math.random()*Math.PI
        dummy.rotation.z = Math.random()*Math.PI

        dummy.scale.x = dummy.scale.y = dummy.scale.z = Math.random()

        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        mesh.setColorAt(i,new THREE.Color(Math.random()*0xffffff))
    }
})

const matrix = new THREE.Matrix4()
function animate(time) {
    if(mesh){
        for(let i = 0;i<count;i++){
            mesh.getMatrixAt(i, matrix)
            matrix.decompose(dummy.position, dummy.rotation, dummy.scale)
            dummy.rotation.x = i/10000 * time/1000
            dummy.rotation.y = i/10000 * time/1000
            dummy.rotation.z = i/10000 * time/1000
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
        }
        // mesh.rotation.y = time/10000
    }
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});