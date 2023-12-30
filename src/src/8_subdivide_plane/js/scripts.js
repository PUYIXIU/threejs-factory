import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(6, 8, 14);
orbit.update();

const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

const axisHelper = new THREE.AxisHelper(5)
scene.add(axisHelper)

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.MeshBasicMaterial({
    visible:false,
  })
)
plane.rotateX(-Math.PI/2)
scene.add(plane)

const highLight = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent:true,
  })
)
highLight.rotateX(-Math.PI/2)
highLight.position.set(0.5, 0, 0.5)
scene.add(highLight)

const mousePosition = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const objects = []
const isExist = () => objects.find(obj => obj.position.x === highLight.position.x && obj.position.z === highLight.position.z)
window.onmousemove = e => {
  mousePosition.x = e.offsetX / window.innerWidth * 2 - 1
  mousePosition.y = 1 - e.offsetY / window.innerHeight * 2
  raycaster.setFromCamera(mousePosition, camera)
  const interSections = raycaster.intersectObject(plane)
  if (interSections[0]) {
    const position = interSections[0].point.floor().addScalar(0.5)
    highLight.position.set(position.x, 0, position.z)
    highLight.material.color.set(
      isExist()?0xff0000:0xffffff
    )
  }
}

const sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 4, 2),
  new THREE.MeshBasicMaterial({
    color: 0xFFEF00,
    wireframe:true
  })
)
window.onmousedown = e => {
  if (!isExist()) {
    const sphere = sphereMesh.clone()
    sphere.position.copy(highLight.position)
    scene.add(sphere)
    objects.push(sphere)
    highLight.material.color.set(0xff0000)
  }
}

function animate(time) {
  highLight.material.opacity = 1 + Math.sin(time / 120)
  objects.forEach(obj => {
    obj.rotation.x = time / 1000
    obj.rotation.z = time / 1000
    obj.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time/1000))
  })
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

