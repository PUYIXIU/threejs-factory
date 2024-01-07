import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.append(renderer.domElement)
renderer.setClearColor(0xcccccc)
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.01,
    1000
)
scene.add(camera)
camera.lookAt(0,0,0)
camera.position.set(1,5,5)
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

const gridHelper = new THREE.GridHelper(30,20)
scene.add(gridHelper)

const doggo = new URL('../assets/doggo2.glb',import.meta.url)
const gltfLoader = new GLTFLoader()

let mixer
gltfLoader.load(doggo.href,function(gltf){
    const model = gltf.scene
    scene.add(model)
    mixer = new THREE.AnimationMixer(model)
    const clips =  gltf.animations
    clips.forEach(clip=>{
        const action = mixer.clipAction(clip)
        action.play()
    })
},undefined,function(err){
    console.error(err)
})

const clock = new THREE.Clock()
function animate(){
    if(mixer)
        mixer.update(clock.getDelta())
    renderer.render(scene , camera)
}

renderer.setAnimationLoop(animate)

window.onresize = function(){
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}
