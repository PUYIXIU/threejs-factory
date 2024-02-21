import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from "dat.gui";

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x000000);

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
camera.position.set(6, 8, 14);
orbit.update();

const loader = new THREE.TextureLoader()
const textureOptions = {
    '雾化':loader.load('assets/transition/transition1.png'),
    '斜向雾化':loader.load('assets/transition/transition2.png'),
    '蜂巢':loader.load('assets/transition/transition3.png'),
    '热感应':loader.load('assets/transition/transition4.png'),
    '横向渐变':loader.load('assets/transition/transition5.png'),
    '环向渐变':loader.load('assets/transition/transition6.png'),
}
const params = {
    mixRatio:0.5,
    transitionTexture:'雾化',
}
const gui = new GUI()
gui.add(params, 'mixRatio', 0.0, 1.0).onChange(v=>{
    uniforms.mixRatio.value = v
})
gui.add(params,'transitionTexture',Object.keys(textureOptions)).onChange(v=>{

    uniforms.transition.value = textureOptions[v]
})


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
        value:0.0,
    },
    mixRatio:{
        type:'f',
        value:0.0
    },
    image:{ // 第一张图片
        type:'t',
        value:new THREE.TextureLoader().load('assets/painting/Golconda.jpg')
    },
    image2:{ // 第二张图片
        type:'t',
        value:new THREE.TextureLoader().load('assets/painting/FakeMirror.jpg')
    },
    transition:{
        type:'t',
        value:textureOptions['雾化']
    },
}

window.onmousemove = e=>{
    uniforms.u_mouse.value.x = e.offsetX / window.innerWidth
    uniforms.u_mouse.value.y = 1 - e.offsetY / window.innerHeight
}

const mat = new THREE.ShaderMaterial({
    side:THREE.DoubleSide,
    uniforms,
    vertexShader:document.getElementById('v-shader').textContent,
    fragmentShader:document.getElementById('f-shader').textContent
})

const geo = new THREE.PlaneGeometry(3,3)

const mesh = new THREE.Mesh(geo, mat)
scene.add(mesh)

function animate(time) {
    uniforms.u_time.value = time/1000
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