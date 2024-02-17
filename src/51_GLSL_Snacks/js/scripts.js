import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x000000);
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

const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const uniforms = {
  u_resolution: {
    type: 'v2',
    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
  },
  u_mouse: {
    type: 'v2',
    value:new THREE.Vector2()
  }
}
window.onmousemove = e => {
  // let vpRatio = window.innerWidth / window.innerHeight;
  let vpRatio = 1;
  uniforms.u_mouse.value.x = (e.offsetX / window.innerWidth) * vpRatio;
  uniforms.u_mouse.value.y = 1 - (e.offsetY / window.innerHeight)
}

const planeMat = new THREE.ShaderMaterial({
  uniforms,
  side:THREE.DoubleSide,
  vertexShader: document.getElementById('v-shader').textContent,
  fragmentShader:document.getElementById('f-shader').textContent
})

const planeGeo = new THREE.PlaneGeometry(4, 4)

const planeMesh = new THREE.Mesh(planeGeo, planeMat)
scene.add(planeMesh)

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