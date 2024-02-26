import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {MapControls} from "three/examples/jsm/controls/MapControls";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import {CSS2DRenderer, CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer.js";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xFEFEFE);

const miniMapDom = document.getElementById('mini-map')
const miniMapRenderer = new THREE.WebGLRenderer({antialias:true});
miniMapRenderer.setSize(miniMapDom.clientWidth, miniMapDom.clientHeight)
miniMapDom.appendChild(miniMapRenderer.domElement)
miniMapRenderer.setClearColor(0xffffff)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(labelRenderer.domElement)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
// const orbit = new OrbitControls(camera, renderer.domElement);
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enableZoom =  true

camera.position.set(0, 8, 5);
camera.lookAt(scene.position);

const miniMapCamera = new THREE.PerspectiveCamera(
    45,
    miniMapDom.clientWidth / miniMapDom.clientHeight,
    0.1,
    1000
)
miniMapCamera.position.set(0, 50, 0)
miniMapCamera.lookAt(0,0,0)

const textureLoader = new THREE.TextureLoader()

const loader = new GLTFLoader()
let model
loader.load('assets/sporting_village.glb', gltf => {
    model = gltf.scene
    scene.add(model)
})
const aLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(aLight)

const dLight= new THREE.DirectionalLight(0xffffff,1)
dLight.position.set(0,50,0)
scene.add(dLight)

// 加载塔
let tower
loader.load('assets/telecommunication_tower_low-poly_free.glb',gltf=>{
    tower = gltf.scene
    tower.scale.set(0.1,0.1,0.1)
})

window.onmousemove = e =>{
    mousePosition.x = (e.offsetX / window.innerWidth * 2) - 1
    mousePosition.y = 1 - (e.offsetY / window.innerHeight * 2)
}

// 加载tower icon
const towerTexture= textureLoader.load('assets/painting/tower.png')
towerTexture.colorSpace = THREE.SRGBColorSpace
const towerMat = new THREE.MeshBasicMaterial({
    map:towerTexture,
    transparent:true
})

// 渐变材质
const uniforms = {
    u_transition:{
        type:'t',
        value:textureLoader.load('assets/transition/transition6.png')
    },
    u_time:{type:'f', value: 0.0}
}
const radarMat = new THREE.ShaderMaterial({
    uniforms,
    transparent:true,
    vertexShader:document.getElementById('v-shader').textContent,
    fragmentShader:document.getElementById('f-shader').textContent,
})
const radarGeo = new THREE.CircleGeometry(5,20)

const towerGeo = new THREE.PlaneGeometry(3.5,3.5)
window.onkeydown = e =>{
    if(e.key == 't' && tower){
        raycaster.setFromCamera(mousePosition, camera)
        const intersections = raycaster.intersectObject(model)
        if(intersections[0]){
            const point = intersections[0].point
            let group = new THREE.Group()
            let t = SkeletonUtils.clone(tower)
            scene.add(group)
            group.add(t)
            group.position.set(point.x, 0, point.z)

            // 底部扫描效果
            const radarMesh = new THREE.Mesh(radarGeo, radarMat)
            radarMesh.rotation.set(-Math.PI/2 , 0,0)
            group.add(radarMesh)
            radarMesh.position.y = Math.random() * 0.01

            // 缩放滑动条
            let slider = document.createElement('input')
            slider.type = 'range'
            slider.max = 3
            slider.min = 1
            slider.value = 2
            slider.step = 0.1
            slider.style.pointerEvents = 'all'
            const sliderLabel = new CSS2DObject(slider)
            sliderLabel.position.set(0,2,0)
            group.add(sliderLabel)
            slider.addEventListener('input',e=>{
                radarMesh.scale.set(slider.value, slider.value, slider.value)
            })

            // 小地图图标
            const towerMesh = new THREE.Mesh(towerGeo, towerMat)
            group.add(towerMesh)
            towerMesh.position.y = 0.1
            towerMesh.rotation.set(-Math.PI/2, 0, 0)
            towerMesh.layers.disable(0)
            towerMesh.layers.enable(1)
        }
    }
}

const mapTexture = textureLoader.load('assets/painting/MiniMap.png')
mapTexture.colorSpace = THREE.SRGBColorSpace
const planeGeo = new THREE.PlaneGeometry(40,40)
const planeMat = new THREE.MeshBasicMaterial({
    map:mapTexture
})
const planeMesh = new THREE.Mesh(planeGeo, planeMat)
planeMesh.rotation.set(-Math.PI/2, 0, 0 )
scene.add(planeMesh)

miniMapCamera.layers.disableAll()
miniMapCamera.layers.enable(1)

planeMesh.layers.disable(0)
planeMesh.layers.enable(1)

const clock = new THREE.Clock()
function animate() {
    uniforms.u_time.value = clock.getElapsedTime()
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera)
}

renderer.setAnimationLoop(animate);

const mousePosition = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
miniMapDom.onmousedown = e =>{
    let rect = miniMapDom.getBoundingClientRect()
    let x = e.offsetX
    let y  = e.offsetY
    mousePosition.x = (x/miniMapDom.clientWidth*2) - 1
    mousePosition.y = 1 - (y/miniMapDom.clientHeight * 2)
    raycaster.setFromCamera(mousePosition, miniMapCamera)
    let intersections = raycaster.intersectObject(model)
    if(intersections[0]){
        const point = intersections[0].point
        camera.position.set(point.x, 8, point.z)
        controls.target.set(point.x, 0, point.z)
    }
}

function miniMapAnimation(){
    miniMapRenderer.render(scene, miniMapCamera)
}

miniMapRenderer.setAnimationLoop(miniMapAnimation)
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    miniMapCamera.aspect = miniMapDom.clientWidth / miniMapDom.clientHeight
    miniMapCamera.updateProjectionMatrix()
    miniMapRenderer.setSize(miniMapDom.clientWidth, miniMapDom.clientHeight)
});