const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=document.querySelector('.hero');
const workbench=document.querySelector('.workbench');
const image=document.querySelector('.workbench img');
const depth=document.querySelector('.workbench-depth');
const stages=[...document.querySelectorAll('.build-stages span')];
const phaseLabel=document.querySelector('#phase-label');
const signalValue=document.querySelector('#signal-value');
const labels=['UNDERSTANDING THE IDEA','SHAPING THE EXPERIENCE','ENGINEERING THE PRODUCT'];
let stage=0,px=0,py=0,tx=0,ty=0,raf=0;

function animate(){
  px+=(tx-px)*.055;py+=(ty-py)*.055;
  if(!reduced){
    image.style.transform=`scale(1.045) translate3d(${px*-9}px,${py*-6}px,0)`;
    depth.style.transform=`translate3d(${px*14}px,${py*9}px,0)`;
  }
  raf=requestAnimationFrame(animate);
}
hero.addEventListener('pointermove',event=>{
  const box=hero.getBoundingClientRect();
  tx=((event.clientX-box.left)/box.width-.5)*2;
  ty=((event.clientY-box.top)/box.height-.5)*2;
});
hero.addEventListener('pointerleave',()=>{tx=0;ty=0});
hero.addEventListener('pointerdown',()=>hero.classList.add('is-inspecting'));
hero.addEventListener('pointerup',()=>hero.classList.remove('is-inspecting'));

setInterval(()=>{
  stage=(stage+1)%3;
  stages.forEach((item,index)=>item.classList.toggle('is-active',index===stage));
  phaseLabel.textContent=labels[stage];
  signalValue.textContent=`0${stage+1} / 03`;
  hero.dataset.stage=stage;
},2800);

const menuButton=document.querySelector('.menu-button');
const menu=document.querySelector('.menu');
menuButton.addEventListener('click',()=>{
  const open=menuButton.getAttribute('aria-expanded')==='true';
  menuButton.setAttribute('aria-expanded',String(!open));
  menu.classList.toggle('is-open',!open);
});
menu.addEventListener('click',()=>{menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false')});
animate();
