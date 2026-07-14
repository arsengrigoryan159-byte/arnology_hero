import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.querySelector('#scene');
const experience = document.querySelector('.experience');
const stickyHero = document.querySelector('.sticky-hero');
const copyBlocks = [...document.querySelectorAll('[data-copy]')];
const meterItems = [...document.querySelectorAll('[data-meter]')];
const meterFill = document.querySelector('#meter-fill');
const systemState = document.querySelector('#system-state');
const cursor = document.querySelector('.cursor-orbit');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x08090c, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08090c);
scene.fog = new THREE.FogExp2(0x08090c, 0.038);

const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.1, 0.15, 12.4);

const pmrem = new THREE.PMREMGenerator(renderer);
const environment = new RoomEnvironment();
scene.environment = pmrem.fromScene(environment, 0.03).texture;
environment.dispose();
pmrem.dispose();

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.22, 0.45, 0.88);
composer.addPass(bloom);

scene.add(new THREE.HemisphereLight(0xc7cad2, 0x101116, 1.05));
const key = new THREE.DirectionalLight(0xf5f3ed, 4.1);
key.position.set(4, 6, 7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -8;
key.shadow.camera.right = 8;
key.shadow.camera.top = 8;
key.shadow.camera.bottom = -8;
scene.add(key);
const fill = new THREE.PointLight(0x8490b8, 18, 18, 2);
fill.position.set(-5, 2.5, 5);
scene.add(fill);
const edge = new THREE.PointLight(0xcdd1df, 14, 16, 2);
edge.position.set(5, -2.5, 3.5);
scene.add(edge);
const pointerLight = new THREE.PointLight(0x9fa7c4, 8, 12, 2);
pointerLight.position.set(2, 2, 6);
scene.add(pointerLight);

const world = new THREE.Group();
world.position.set(2.25, 0.15, 0);
world.rotation.set(-0.1, -0.28, 0.03);
scene.add(world);

const product = new THREE.Group();
world.add(product);

const aluminium = new THREE.MeshPhysicalMaterial({
  color: 0x8d9097,
  metalness: 0.95,
  roughness: 0.19,
  clearcoat: 0.75,
  clearcoatRoughness: 0.14,
  envMapIntensity: 1.25
});
const darkAluminium = new THREE.MeshPhysicalMaterial({
  color: 0x15171c,
  metalness: 0.88,
  roughness: 0.22,
  clearcoat: 0.7,
  clearcoatRoughness: 0.16,
  envMapIntensity: 1.15
});
const ceramic = new THREE.MeshPhysicalMaterial({
  color: 0xf1f0eb,
  metalness: 0.08,
  roughness: 0.21,
  clearcoat: 0.88,
  clearcoatRoughness: 0.11
});
const brandMetal = new THREE.MeshPhysicalMaterial({
  color: 0x737d9f,
  metalness: 0.74,
  roughness: 0.2,
  clearcoat: 0.95,
  clearcoatRoughness: 0.1,
  emissive: 0x151a29,
  emissiveIntensity: 0.22
});
const silicon = new THREE.MeshPhysicalMaterial({
  color: 0x0e1118,
  metalness: 0.62,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.2
});
const glass = new THREE.MeshPhysicalMaterial({
  color: 0x8b94ac,
  metalness: 0,
  roughness: 0.05,
  transmission: 0.72,
  thickness: 1.4,
  transparent: true,
  opacity: 0.58,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  ior: 1.42,
  envMapIntensity: 1.15
});
const glow = new THREE.MeshBasicMaterial({ color: 0x9fa8c5, transparent: true, opacity: 0.5, toneMapped: false });
const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x8993b2, transparent: true, opacity: 0.34, toneMapped: false });

// The central object is a physical "product core": a glass idea chamber,
// machined frame, silicon layers, and modular expansion cartridges.
const body = new THREE.Group();
product.add(body);

const glassCore = new THREE.Mesh(new RoundedBoxGeometry(3.55, 2.45, 0.62, 10, 0.22), glass);
glassCore.castShadow = true;
glassCore.receiveShadow = true;
body.add(glassCore);

const wafer = new THREE.Mesh(new RoundedBoxGeometry(2.85, 1.78, 0.22, 8, 0.14), silicon);
wafer.position.z = 0.08;
wafer.castShadow = true;
body.add(wafer);

const waferInset = new THREE.Mesh(new RoundedBoxGeometry(2.35, 1.28, 0.035, 6, 0.1), brandMetal);
waferInset.position.z = 0.205;
body.add(waferInset);

const frame = new THREE.Group();
body.add(frame);
const frameParts = [];
function addFramePart(width, height, depth, x, y) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 6, 0.08), aluminium);
  mesh.position.set(x, y, 0.05);
  mesh.castShadow = true;
  frame.add(mesh);
  frameParts.push(mesh);
  return mesh;
}
addFramePart(3.9, .18, .82, 0, 1.31);
addFramePart(3.9, .18, .82, 0, -1.31);
addFramePart(.18, 2.48, .82, -1.96, 0);
addFramePart(.18, 2.48, .82, 1.96, 0);

// Product architecture traces are physical rails, not flat interface cards.
const traces = new THREE.Group();
wafer.add(traces);
const traceCurves = [
  [[-1.08,.42],[0,.42],[0,.08],[1.08,.08]],
  [[-1.08,.1],[-.42,.1],[-.42,-.48],[.7,-.48]],
  [[-.78,.65],[-.78,.2],[.78,.2],[.78,.62]],
  [[-.98,-.64],[-.2,-.64],[-.2,-.2],[1.02,-.2]]
];
traceCurves.forEach((points, index) => {
  const curve = new THREE.CatmullRomCurve3(points.map(([x,y]) => new THREE.Vector3(x,y,.14)), false, 'catmullrom', .1);
  const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 45, .014 + index*.001, 6, false), lineMaterial.clone());
  traces.add(rail);
});
const traceNodes = [];
for (let i = 0; i < 9; i++) {
  const node = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .025, 20), ceramic);
  node.rotation.x = Math.PI / 2;
  node.position.set(-1.05 + (i % 3) * 1.05, -.55 + Math.floor(i / 3) * .55, .16);
  traces.add(node);
  traceNodes.push(node);
}

function makeMonogram() {
  const group = new THREE.Group();
  const beamGeo = new RoundedBoxGeometry(.25, 1.65, .18, 5, .06);
  const left = new THREE.Mesh(beamGeo, ceramic);
  left.position.set(-.36, 0, .34);
  left.rotation.z = -.46;
  const right = new THREE.Mesh(beamGeo, brandMetal);
  right.position.set(.36, 0, .34);
  right.rotation.z = .46;
  const bar = new THREE.Mesh(new RoundedBoxGeometry(.74, .18, .18, 5, .05), ceramic);
  bar.position.set(0, -.22, .34);
  group.add(left, right, bar);
  group.scale.setScalar(.82);
  return group;
}
const monogram = makeMonogram();
body.add(monogram);

const coreHalo = new THREE.Mesh(new THREE.TorusGeometry(.88, .018, 8, 130), glow);
coreHalo.position.z = .39;
body.add(coreHalo);

// Precision rear mechanism adds real depth and a product-shot silhouette.
const rearMechanism = new THREE.Group();
rearMechanism.position.z = -.5;
body.add(rearMechanism);
const rearRings = [];
[2.1, 2.45, 2.78].forEach((radius, index) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .055 - index*.01, 14, 180), index === 1 ? brandMetal : darkAluminium);
  ring.rotation.set(Math.PI/2, 0, index * .35);
  rearMechanism.add(ring);
  rearRings.push(ring);
});
for (let i = 0; i < 12; i++) {
  const fin = new THREE.Mesh(new RoundedBoxGeometry(.12, .65, .28, 4, .035), darkAluminium);
  const a = (i / 12) * Math.PI * 2;
  fin.position.set(Math.cos(a) * 2.42, Math.sin(a) * 2.42, -.05);
  fin.rotation.z = a;
  fin.rotation.y = .12;
  fin.castShadow = true;
  rearMechanism.add(fin);
}

// Four cartridges represent the services that make a product complete.
const cartridgeDefs = [
  { name: 'PRODUCT', angle: .65 },
  { name: 'TEAM', angle: 2.3 },
  { name: 'TRANSFORM', angle: 3.85 },
  { name: 'CONSULT', angle: 5.45 }
];
const cartridges = [];
function labelTexture(text) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 170;
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle = '#ecece7';
  ctx.font = '600 28px Arial';
  ctx.letterSpacing = '5px';
  ctx.fillText(text, 40, 92);
  ctx.fillStyle = '#8992ad';
  ctx.fillRect(40, 116, 120, 3);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
cartridgeDefs.forEach((def, index) => {
  const group = new THREE.Group();
  const shell = new THREE.Mesh(new RoundedBoxGeometry(1.35, .62, .56, 7, .11), darkAluminium);
  shell.castShadow = true;
  group.add(shell);
  const cap = new THREE.Mesh(new RoundedBoxGeometry(.17, .64, .59, 5, .06), aluminium);
  cap.position.x = -.62;
  group.add(cap);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .32), new THREE.MeshBasicMaterial({ map: labelTexture(def.name), transparent: true, toneMapped: false }));
  label.position.z = .286;
  group.add(label);
  const indicator = new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.02,16), glow.clone());
  indicator.rotation.x = Math.PI / 2;
  indicator.position.set(.52,.18,.3);
  group.add(indicator);
  const radius = 3.55;
  group.userData.final = new THREE.Vector3(Math.cos(def.angle)*radius, Math.sin(def.angle)*radius*.72, .25 + (index%2)*-.45);
  group.userData.start = group.userData.final.clone().multiplyScalar(2.2).add(new THREE.Vector3(0,0,-2.2));
  group.userData.phase = index * 1.4;
  product.add(group);
  cartridges.push(group);
});

// Fiber conduits physically connect the product core to expansion cartridges.
const conduits = [];
cartridges.forEach((cartridge, index) => {
  const end = cartridge.userData.final;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -.32),
    end.clone().multiplyScalar(.35).add(new THREE.Vector3(0, index%2 ? -.28 : .28, -.2)),
    end.clone().multiplyScalar(.72),
    end.clone()
  ]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, .018, 8, false), lineMaterial.clone());
  tube.material.opacity = .14;
  product.add(tube);
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 12), glow.clone());
  product.add(pulse);
  conduits.push({ tube, pulse, curve, offset: index*.23 });
});

// Exploded engineering layers assemble on scroll.
const layers = [];
for (let i = 0; i < 7; i++) {
  const layer = new THREE.Mesh(
    new RoundedBoxGeometry(3.02 - i*.14, 1.95 - i*.1, .045, 6, .1),
    new THREE.MeshPhysicalMaterial({
      color: i%2 ? 0x222630 : 0x707993,
      metalness: i%2 ? .72 : .52,
      roughness: .2,
      transparent: true,
      opacity: .28 - i*.018,
      clearcoat: .7
    })
  );
  layer.position.z = -.25 - i*.2;
  layer.userData.assembledZ = layer.position.z;
  layer.userData.explodedZ = -1.8 - i*.55;
  body.add(layer);
  layers.push(layer);
}

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(35, 22),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: .34 })
);
floor.rotation.x = -Math.PI/2;
floor.position.y = -3.38;
floor.receiveShadow = true;
scene.add(floor);

const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.1, .22, 100), darkAluminium);
pedestal.position.set(0, -3.23, -.5);
pedestal.scale.y = .28;
pedestal.receiveShadow = true;
pedestal.castShadow = true;
world.add(pedestal);
const pedestalRing = new THREE.Mesh(new THREE.TorusGeometry(2.55,.012,5,180), glow.clone());
pedestalRing.position.set(0,-3.12,-.5);
pedestalRing.rotation.x = Math.PI/2;
pedestalRing.material.opacity = .16;
world.add(pedestalRing);

const pointer = new THREE.Vector2();
const pointerTarget = new THREE.Vector2();
let scrollTarget = 0;
let scrollProgress = 0;
let currentScene = 0;
let pageVisible = true;

function clamp(v, min=0, max=1) { return Math.min(max, Math.max(min, v)); }
function smoothstep(edge0, edge1, x) {
  const t = clamp((x-edge0)/(edge1-edge0));
  return t*t*(3-2*t);
}
function mix(a,b,t) { return a + (b-a)*t; }
function setVec3(object, a, b, t) {
  object.position.set(mix(a.x,b.x,t), mix(a.y,b.y,t), mix(a.z,b.z,t));
}

const stateLabels = ['IDEA CORE ACTIVE','ARCHITECTURE ALIGNED','ENGINEERING ASSEMBLED','SYSTEM READY TO SCALE'];
function updateCopy(sceneIndex) {
  if (currentScene === sceneIndex) return;
  currentScene = sceneIndex;
  copyBlocks.forEach((block, i) => block.classList.toggle('is-active', i === sceneIndex));
  meterItems.forEach((item, i) => item.classList.toggle('is-active', i === sceneIndex));
  systemState.textContent = stateLabels[sceneIndex];
}

function updateScroll() {
  const rect = experience.getBoundingClientRect();
  const max = experience.offsetHeight - window.innerHeight;
  scrollTarget = clamp(-rect.top / Math.max(max, 1));
}
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

function handlePointerMove(event) {
  pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointerTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if (cursor) cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  document.body.classList.add('pointer-ready');
}
window.addEventListener('pointermove', handlePointerMove, { passive: true });
stickyHero.addEventListener('pointerenter', () => document.body.classList.add('pointer-active'));
stickyHero.addEventListener('pointerleave', () => document.body.classList.remove('pointer-active'));
document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });

function responsiveLayout() {
  const w = window.innerWidth;
  if (w < 560) {
    world.position.set(.05, 2.08, -1.6);
    world.scale.setScalar(.57);
    camera.fov = 42;
  } else if (w < 820) {
    world.position.set(.65, 1.72, -1.1);
    world.scale.setScalar(.68);
    camera.fov = 39;
  } else if (w < 1150) {
    world.position.set(2.15, .32, -.4);
    world.scale.setScalar(.82);
    camera.fov = 35;
  } else {
    world.position.set(2.35, .12, 0);
    world.scale.setScalar(1);
    camera.fov = 32;
  }
  camera.updateProjectionMatrix();
}
responsiveLayout();
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  responsiveLayout();
  updateScroll();
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  if (!pageVisible) return;
  const dt = Math.min(clock.getDelta(), .05);
  const time = clock.elapsedTime;
  scrollProgress += (scrollTarget - scrollProgress) * (reducedMotion ? 1 : .075);
  pointer.lerp(pointerTarget, .06);

  const sceneIndex = Math.min(3, Math.floor(scrollProgress * 4 + .04));
  updateCopy(sceneIndex);
  meterFill.style.height = `${scrollProgress * 100}%`;

  // Four scroll chapters: idea reveal, architecture alignment, engineering
  // assembly, and scalable expansion.
  const reveal = smoothstep(0, .13, scrollProgress);
  const architecture = smoothstep(.17, .42, scrollProgress);
  const engineering = smoothstep(.4, .72, scrollProgress);
  const scale = smoothstep(.7, .98, scrollProgress);

  glassCore.material.opacity = mix(.18, .58, reveal);
  glassCore.scale.setScalar(mix(.72, 1, reveal));
  wafer.scale.setScalar(mix(.55, 1, architecture));
  wafer.rotation.z = mix(-.28, 0, architecture);
  wafer.position.z = mix(-1.15, .08, architecture);
  waferInset.material.opacity = mix(0, 1, architecture);
  traces.visible = architecture > .04;
  traces.scale.setScalar(mix(.4, 1, architecture));
  traces.children.forEach((child, i) => {
    if (child.material) child.material.opacity = mix(0, i < 4 ? .34 : 1, architecture);
  });
  monogram.scale.setScalar(mix(.2, .82, reveal));
  monogram.rotation.z = mix(.42, 0, reveal);
  coreHalo.scale.setScalar(mix(.3, 1, reveal));
  coreHalo.material.opacity = mix(0, .48, reveal);

  frameParts.forEach((part, i) => {
    const local = clamp((engineering - i*.08) / .72);
    const final = i < 2 ? new THREE.Vector3(0, i===0?1.31:-1.31, .05) : new THREE.Vector3(i===2?-1.96:1.96,0,.05);
    const start = final.clone().multiplyScalar(2.25).add(new THREE.Vector3(i%2 ? .8 : -.8, i<2 ? (i===0?1.2:-1.2) : 0, -1.7));
    setVec3(part, start, final, smoothstep(0,1,local));
    part.rotation.z = mix(i%2 ? .25 : -.25, 0, local);
  });

  layers.forEach((layer, i) => {
    const local = smoothstep(.06 + i*.055, .75 + i*.025, engineering);
    layer.position.z = mix(layer.userData.explodedZ, layer.userData.assembledZ, local);
    layer.rotation.z = mix((i%2 ? 1 : -1) * .18, 0, local);
    layer.material.opacity = mix(.04, .24 - i*.015, local);
  });

  rearMechanism.scale.setScalar(mix(.35, 1, engineering));
  rearMechanism.position.z = mix(-3.8, -.5, engineering);
  rearRings.forEach((ring, i) => {
    ring.rotation.z = (i%2 ? -1 : 1) * time * (.025 + i*.008) + mix(.8,0,engineering);
  });

  cartridges.forEach((cartridge, i) => {
    const local = smoothstep(.02 + i*.08, .64 + i*.05, scale);
    setVec3(cartridge, cartridge.userData.start, cartridge.userData.final, local);
    cartridge.rotation.set(
      mix(.5*(i%2?1:-1), .03*Math.sin(time*.45+cartridge.userData.phase), local),
      mix(-.7, Math.atan2(cartridge.userData.final.x, 5)*.3, local),
      mix(.4, 0, local)
    );
    cartridge.scale.setScalar(mix(.4, 1, local));
    cartridge.visible = local > .01;
  });
  conduits.forEach((conduit, i) => {
    conduit.tube.material.opacity = mix(0, .24, scale);
    const t = (time*.07 + conduit.offset) % 1;
    conduit.pulse.position.copy(conduit.curve.getPointAt(t));
    conduit.pulse.material.opacity = mix(0, .7, scale) * Math.sin(t*Math.PI);
    conduit.pulse.scale.setScalar(.6 + Math.sin(t*Math.PI)*.7);
  });

  // Product-shot camera movement and full-width scroll choreography.
  product.rotation.x = mix(.28, -.06, architecture) + (reducedMotion ? 0 : pointer.y*.055);
  product.rotation.y = mix(-.72, .32, engineering) + mix(0, .36, scale) + (reducedMotion ? 0 : pointer.x*.09);
  product.rotation.z = mix(-.14, .015, reveal);
  product.position.y = Math.sin(time*.45)*.035;
  product.scale.setScalar(mix(.82, 1.06, scale));

  const desktop = window.innerWidth >= 820;
  const baseX = desktop ? mix(2.35, 1.2, scale) : world.position.x;
  if (desktop) world.position.x += (baseX - world.position.x) * .04;
  world.rotation.y += ((-.28 + (reducedMotion ? 0 : pointer.x*.1)) - world.rotation.y) * .035;
  world.rotation.x += ((-.1 + (reducedMotion ? 0 : pointer.y*.06)) - world.rotation.x) * .035;

  const cameraZ = mix(12.4, 10.65, scale);
  camera.position.z += (cameraZ - camera.position.z) * .035;
  camera.position.x += (((reducedMotion ? 0 : pointer.x*.22) + mix(0,.65,scale)) - camera.position.x) * .025;
  camera.position.y += (((reducedMotion ? .15 : .15 + pointer.y*.12) + mix(0,-.08,scale)) - camera.position.y) * .025;
  camera.lookAt(mix(.55, 1.1, scale), .05, -.1);

  pointerLight.position.x += ((pointer.x*5.5 + 1.2) - pointerLight.position.x) * .05;
  pointerLight.position.y += ((pointer.y*3.8 + 1) - pointerLight.position.y) * .05;
  pedestalRing.material.opacity = .09 + engineering*.1;
  pedestalRing.rotation.z += dt*.015;

  composer.render();
}
updateCopy(0);
animate();
