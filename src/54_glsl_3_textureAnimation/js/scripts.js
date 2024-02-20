import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0x1C2134);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(0, 10, 0);
orbit.update();

const uniforms = {
    u_resolution:{
        type:'v2',
        value:new THREE.Vector2(window.innerWidth, window.innerHeight)
    },
    u_mouse:{
        type:'v2',
        value:new THREE.Vector2()
    },
    u_time:{
        type:'f',
        value:0.0
    },
    image:{
        type:'t',
        value:new THREE.TextureLoader().load('assets/radarGrey.PNG')
    },
    golconda:{
        type:'t',
        value:new THREE.TextureLoader().load('assets/Golconda.jpg')
    }
}

window.onmousemove = e=>{
    uniforms.u_mouse.value.x = e.offsetX / window.innerWidth
    uniforms.u_mouse.value.y = 1 - e.offsetY / window.innerHeight
}

const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent:true,
    vertexShader:document.getElementById('v-shader').textContent,
    fragmentShader:document.getElementById('f-shader').textContent
})

const geo = new THREE.CylinderGeometry(3,3,0,128)
const mesh = new THREE.Mesh(geo,mat)
scene.add(mesh)

function animate(time) {
    uniforms.u_time.value = time.toFixed(2)/1000
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