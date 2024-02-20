import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x1C2134);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 20, 0);
orbit.update();

const uniforms = {
    u_resolution:{
        type:'v2',
        value:new THREE.Vector2(window.innerWidth, window.innerHeight)
    },
    image:{
        type:'t',
        value:new THREE.TextureLoader().load('./assets/Golconda.jpg')
    }
}

const mat = new THREE.ShaderMaterial({
    uniforms,
    side:THREE.DoubleSide,
    vertexShader:document.getElementById('v-shader').textContent,
    fragmentShader:document.getElementById('f-shader').textContent
})

const geo = new THREE.CylinderGeometry(3,3,0,128)
const mesh = new THREE.Mesh(geo, mat)
scene.add(mesh)

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    uniform.u_resolution.value.x = window.innerWidth;
    uniform.u_resolution.value.y = window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
});