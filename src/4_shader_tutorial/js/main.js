import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import nebula from '../img/nebula.jpg'
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.append(renderer.domElement)
renderer.setAnimationLoop(animate)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.01,
    1000
)
scene.add(camera)
camera.position.set(0,0,12)
camera.lookAt(0,0,0)

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

const textLoader = new THREE.TextureLoader()

const uniforms = {
    u_time:{type:'f',value:0},
    u_resolution :{
        type:'v2',
        value: new THREE.Vector2(window.innerWidth,window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
    },
    u_mouse:{
        type:'v2',
        value:new THREE.Vector2(0,0)
    },
    image :{
        type:'t',
        value:textLoader.load(nebula)
    }
}

const geometry = new THREE.PlaneGeometry(10,10,30,30)
const material = new THREE.ShaderMaterial({
    vertexShader:document.getElementById("vertex-shader").textContent,
    fragmentShader:document.getElementById('fragment-shader').textContent,
    wireframe:false,
    side:THREE.DoubleSide,
    uniforms
});
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const clock = new THREE.Clock()
function animate(){
    uniforms.u_time.value = clock.getElapsedTime()
    renderer.render(scene, camera)
}

window.onmousemove= e=>{
    uniforms.u_mouse.value.set(
        e.offsetX/window.innerWidth,
        1-e.offsetY/window.innerHeight
    )
}

window.onresize = function(){
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}