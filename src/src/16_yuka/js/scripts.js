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

const vehicleGeo = new THREE.ConeBufferGeometry(0.1, 0.5, 8)
vehicleGeo.rotateX(Math.PI/2)
const vehicleMat = new THREE.MeshNormalMaterial()
const vehicleMesh = new THREE.Mesh(vehicleGeo, vehicleMat)
vehicleMesh.matrixAutoUpdate = false
scene.add(vehicleMesh)

const vehicle = new YUKA.Vehicle()
vehicle.maxSpeed = 3
vehicle.setRenderComponent(vehicleMesh,sync)
function sync(entity, renderComponent){
    renderComponent.matrix.copy(entity.worldMatrix)
}

const path  = new YUKA.Path()
path.loop = true

path.add(new YUKA.Vector3(0, 0, -6))
path.add(new YUKA.Vector3(-4, 0, -4))
path.add(new YUKA.Vector3(-6, 0, 0))
path.add(new YUKA.Vector3(-4, 0, 4))
path.add(new YUKA.Vector3(-1, 0, 4))
path.add(new YUKA.Vector3(0, 0, 0))
path.add(new YUKA.Vector3(1, 0, 4))
path.add(new YUKA.Vector3(4, 0, 4))
path.add(new YUKA.Vector3(6, 0, 0))
path.add(new YUKA.Vector3(4, 0, -4))

vehicle.position.copy(path.current())

const positions = path._waypoints.map(point=>[point.x,point.y,point.z]).flat()
const lineGeo = new THREE.BufferGeometry()
lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
const lineMat = new THREE.LineBasicMaterial({color:0xffffff})
const lineMesh = new THREE.LineLoop(lineGeo,lineMat)
scene.add(lineMesh)

const followPathBehavior = new YUKA.FollowPathBehavior(path,0.5)
vehicle.steering.add(followPathBehavior)

const entityManager = new YUKA.EntityManager()
entityManager.add(vehicle)

const onPathBehavior = new YUKA.OnPathBehavior(path)
onPathBehavior.radius = 100
vehicle.steering.add(onPathBehavior)

const time = new YUKA.Time()
function animate(){
    const delta = time.update().getDelta()
    entityManager.update(delta)
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});