import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x000000);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const controls1 = new OrbitControls(camera, renderer.domElement);
const controls2 = new TrackballControls(camera, renderer.domElement);
controls1.enableZoom = false
controls1.enableDamping = true
controls1.dampingFactor = 0.3
controls2.noRotate = true
controls2.noPan = true
controls2.noZoom = false
controls2.zoomSpeed = 1.5

// Camera positioning
camera.position.set(0, 0, 5);
controls1.update();
controls2.update()

const uniforms = {
    u_resolution: {
        type:'v2',
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
    },
    u_time:{
        type:'f',
        value:0.0
    }
}

const mat = new THREE.ShaderMaterial({
    uniforms,
    wireframe:true,
    vertexShader: document.getElementById('v-shader').textContent,
    fragmentShader: document.getElementById('f-shader').textContent
})

const geo = new THREE.IcosahedronGeometry(4,20)

const mesh = new THREE.Mesh(geo, mat)
scene.add(mesh)

function animate(time) {
    uniforms.u_time.value = time/1000
    controls1.update()
    controls2.update()
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    uniforms.u_resolution.value.x = window.innerWidth
    uniforms.u_resolution.value.y = window.innerHeight
    renderer.setSize(window.innerWidth, window.innerHeight);
});