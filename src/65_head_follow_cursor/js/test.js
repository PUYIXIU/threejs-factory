import {gsap} from "gsap";
const dialogBox = document.getElementById('dialog-box')
const tipBox = document.getElementById('tip-box')
const tl = gsap.timeline()
gsap.set(dialogBox,{
    opacity:0,
    y:-10
})
tl.to(dialogBox,{
    opacity:1,
    y:0,
    duration:1,
    ease:'ease'
})