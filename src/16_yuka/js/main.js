import * as THREE from 'three';
import * as YUKA from 'yuka'

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
camera.position.set(0,20,0);
camera.lookAt(0,0,0)


const vehicleGeo = new THREE.ConeBufferGeometry(0.1, 0.8, 8)
vehicleGeo.rotateX(Math.PI/2)
const vehicleMat = new THREE.MeshNormalMaterial()
const vehicleMesh = new THREE.Mesh(vehicleGeo, vehicleMat)
vehicleMesh.matrixAutoUpdate = false
scene.add(vehicleMesh)

const vehicle = new YUKA.Vehicle()
vehicle.maxSpeed = 2
vehicle.setRenderComponent(vehicleMesh, sync)
function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix)
}

const path = new YUKA.Path()
path.loop = true
path.add(new YUKA.Vector3(0,0,6))
path.add(new YUKA.Vector3(-4,0,4))
path.add(new YUKA.Vector3(-6,0,0))
path.add(new YUKA.Vector3(-4,0,-4))
path.add(new YUKA.Vector3(0,0,1))
path.add(new YUKA.Vector3(4,0,-4))
path.add(new YUKA.Vector3(6,0,0))
path.add(new YUKA.Vector3(4, 0, 4))

vehicleMesh.position.copy(path.current)

const points = path._waypoints.map(position => [position.x, position.y, position.z]).flat()
const lineGeo = new THREE.BufferGeometry()
lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
const lineMat = new THREE.LineBasicMaterial()
const lineMesh = new THREE.LineLoop(lineGeo, lineMat)
scene.add(lineMesh)

const followPathBehovior = new YUKA.FollowPathBehavior(path, 0.5)
vehicle.steering.add(followPathBehovior)

const onePathBehavior = new YUKA.OnPathBehavior(path)
onePathBehavior.radius = 0
vehicle.steering.add(onePathBehavior)

const entityManager = new YUKA.EntityManager()
entityManager.add(vehicle)

const clock = new YUKA.Time()
function animate() {
    let delta = clock.update().getDelta()
    entityManager.update(delta)
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});