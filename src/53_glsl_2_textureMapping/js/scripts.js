import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x00648E);
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

// const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

const uniforms = {
  u_resolution: {
    type: 'v2',
    value:new THREE.Vector2(window.innerWidth, window.innerHeight)
  },
  u_mouse: {
    type: 'v2',
    value:new THREE.Vector2()
  },
  u_time: {
    type: 'f',
    value:0.0
  },
  image: {
    type: 't',
    value:new THREE.TextureLoader().load('./assets/ice.png')
  }
}

window.onmousemove = e => {
  uniforms.u_mouse.value.x = e.offsetX / window.innerWidth;
  uniforms.u_mouse.value.y = 1 - e.offsetY / window.innerHeight;
}

const mat = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: document.getElementById('v-shader').textContent,
  fragmentShader: document.getElementById('f-shader').textContent
})

const geo = new THREE.CylinderGeometry(2,2,0,100);
const mesh = new THREE.Mesh(geo, mat)
scene.add(mesh)

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
});