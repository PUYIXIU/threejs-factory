import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 4
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x22272E);

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

const ambientLight = new THREE.AmbientLight(0xffffff,1)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff,50,50)
scene.add(pointLight)
pointLight.position.set(0,0,0)

const loader = new RGBELoader()
const gltfLoader = new GLTFLoader()
let mesh
let count = 2000
const dummy = new THREE.Object3D()
loader.load('assets/kitchen.hdr',texture=>{
    // gltfLoader.load('assets/snow_flake/scene.gltf',gltf=>{
    gltfLoader.load('assets/gold_star.glb',gltf=>{
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.environment = texture
        // const geo = new THREE.IcosahedronGeometry(1)
        // const mat = new THREE.MeshPhysicalMaterial({
        //     color:0x00ffff,
        //     transmission:0.5,
        //     metalness:1,
        //     roughness:0,
        //     ior:2.33,
        //     transparent:true,
        //     opacity:0.9
        //
        // })
        // const modal = gltf.scene.getObjectByName("Object_2")
        const modal = gltf.scene.getObjectByName("Star_Star_0")
        console.log(modal)
        const geo = modal.geometry
        const mat = modal.material
        mesh = new THREE.InstancedMesh(geo, mat, count)
        scene.add(mesh)
        for(let i = 0;i<count;i++){
            const r = Math.random()*50
            const angleX = Math.random()*Math.PI*2
            const angleY = Math.random()*Math.PI*2
            const semiPart = Math.random()>0.5?-1:1
            const x = Math.cos(angleX)*r
            const y =Math.cos(angleY)*r
            dummy.position.x = x
            dummy.position.y = y
            dummy.position.z = Math.pow(r*r - x*x - y*y, 0.5)*semiPart
            dummy.rotation.x = Math.random()*Math.PI
            dummy.rotation.y = Math.random()*Math.PI
            dummy.rotation.z = Math.random()*Math.PI

            dummy.scale.x = dummy.scale.y = dummy.scale.z = 0.03*Math.random()

            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
            // mesh.setColorAt(i,new THREE.Color(Math.random()*0xffffff))
        }
    })

})

const matrix = new THREE.Matrix4()
function animate(time) {
    if(mesh){
        for(let i = 0;i<count;i++){
            mesh.getMatrixAt(i, matrix)
            matrix.decompose(dummy.position, dummy.rotation, dummy.scale)
            dummy.rotation.x = time/1000 + i/count*Math.PI
            dummy.rotation.y = time/1000 + i/count*Math.PI
            dummy.rotation.z = time/1000 + i/count*Math.PI

            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
            mesh.instanceMatrix.needsUpdate = true
        }
        mesh.rotation.x = time/5000
    }
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});