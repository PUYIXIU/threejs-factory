import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true
renderer.setClearColor(0xFEFEFE);

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

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const pointLight = new THREE.PointLight(0xffffff, 2, 30)
pointLight.position.set(0,5,0)
pointLight.castShadow = true
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
scene.add(pointLight)

const world = new CANNON.World({
    gravity:new CANNON.Vec3(0,-9.89,0)
})
const planePhyMat = new CANNON.Material()
const ballPhyMat = new CANNON.Material()
const planeBallContactMat = new CANNON.ContactMaterial(
    planePhyMat,
    ballPhyMat,
    {
        restitution:0.9
    }
)
world.addContactMaterial(planeBallContactMat)
const groundGeo = new THREE.PlaneGeometry(10,10)
const groundMat = new THREE.MeshStandardMaterial({
    color:0xffffff,
    side:THREE.DoubleSide
})
const groundMesh = new THREE.Mesh(groundGeo,groundMat)
groundMesh.receiveShadow = true
scene.add(groundMesh)
const groundBody = new CANNON.Body({
    shape:new CANNON.Box(new CANNON.Vec3(5,5,0.01)),
    type:CANNON.BODY_TYPES.STATIC,
    material:planePhyMat
})
groundBody.quaternion.setFromEuler(-Math.PI/2,0,0)
world.addBody(groundBody)

const mouse = new THREE.Vector2()
const planeNormal = new THREE.Vector3()
const plane = new THREE.Plane()
const raycaster = new THREE.Raycaster()
const interSectionPointer = new THREE.Vector3()

const BallList = []

window.onmousemove = function(e){
    mouse.x = e.offsetX/window.innerWidth*2 - 1
    mouse.y = 1 - e.offsetY/window.innerHeight*2
    planeNormal.copy(camera.position)
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
    raycaster.setFromCamera(mouse,camera)
    raycaster.ray.intersectPlane(plane, interSectionPointer)
}

window.onclick = function(e){
    const sphereGeo = new THREE.SphereGeometry(0.2)
    const sphereMat = new THREE.MeshStandardMaterial({
        color:0xffffff*Math.random(),
        metalness:0,
        roughness:0
    })
    const sphereMesh = new THREE.Mesh(sphereGeo,sphereMat)
    sphereMesh.position.copy(interSectionPointer)
    scene.add(sphereMesh)
    sphereMesh.castShadow = true

    const ballBody = new CANNON.Body({
        shape:new CANNON.Sphere(0.2),
        mass:1,
        position:interSectionPointer,
        material:ballPhyMat
    })
    world.addBody(ballBody)
    BallList.push([sphereMesh,ballBody])
}

const timeStep = 1/60
function animate() {
    world.step(timeStep)
    groundMesh.position.copy(groundBody.position)
    groundMesh.quaternion.copy(groundBody.quaternion)
    BallList.forEach(([mesh,body])=>{
        mesh.position.copy(body.position)
        mesh.quaternion.copy(body.quaternion)
    })
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});