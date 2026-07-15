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
renderer.toneMappingExposure = 0.94;
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x100904, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x100904);
scene.fog = new THREE.FogExp2(0x100904, 0.026);

const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.1, 0.15, 12.4);

const pmrem = new THREE.PMREMGenerator(renderer);
const environment = new RoomEnvironment();
scene.environment = pmrem.fromScene(environment, 0.03).texture;
environment.dispose();
pmrem.dispose();

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.28, 0.52, 0.84);
composer.addPass(bloom);

scene.add(new THREE.HemisphereLight(0xffedd7, 0x100904, 0.72));
const key = new THREE.DirectionalLight(0xffffff, 3.4);
key.position.set(4, 6, 7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -8;
key.shadow.camera.right = 8;
key.shadow.camera.top = 8;
key.shadow.camera.bottom = -8;
scene.add(key);
const fill = new THREE.PointLight(0xdc5000, 10, 20, 2);
fill.position.set(-5, 2.5, 5);
scene.add(fill);
const edge = new THREE.PointLight(0xffedd7, 10, 18, 2);
edge.position.set(5, -2.5, 3.5);
scene.add(edge);
const pointerLight = new THREE.PointLight(0xa45a2a, 7, 14, 2);
pointerLight.position.set(2, 2, 6);
scene.add(pointerLight);

const world = new THREE.Group();
world.position.set(0.75, 0.08, 0);
world.rotation.set(-0.04, -0.12, 0.01);
scene.add(world);

const product = new THREE.Group();
world.add(product);


// Active-Theory-inspired portal: the product core becomes an untethered
// rendered world, while UI chrome remains nearly invisible.
const portal = new THREE.Group();
world.add(portal);

const portalMetal = new THREE.MeshPhysicalMaterial({
  color: 0x8a8a91,
  metalness: 0.96,
  roughness: 0.15,
  clearcoat: 0.84,
  clearcoatRoughness: 0.11,
  envMapIntensity: 1.15
});
const portalDark = new THREE.MeshPhysicalMaterial({
  color: 0x070708,
  metalness: 0.91,
  roughness: 0.2,
  clearcoat: 0.7,
  clearcoatRoughness: 0.14
});
const portalViolet = new THREE.MeshBasicMaterial({
  color: 0xdc5000,
  transparent: true,
  opacity: 0.72,
  toneMapped: false,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const portalRings = [];
[
  { radius: 3.15, tube: .032, material: portalMetal },
  { radius: 3.43, tube: .018, material: portalViolet },
  { radius: 3.68, tube: .027, material: portalDark }
].forEach((spec, index) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.radius, spec.tube, 18, 280), spec.material);
  ring.rotation.z = index * .42;
  ring.position.z = -.72 - index * .11;
  portal.add(ring);
  portalRings.push(ring);
});

const portalArcs = [];
[
  { radius: 3.28, arc: Math.PI * .72, rotation: -.4 },
  { radius: 3.56, arc: Math.PI * .52, rotation: 1.82 },
  { radius: 3.83, arc: Math.PI * .34, rotation: 3.58 }
].forEach((spec, index) => {
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(spec.radius, .045 - index * .008, 14, 180, spec.arc),
    index === 1 ? portalViolet.clone() : portalMetal.clone()
  );
  arc.rotation.z = spec.rotation;
  arc.position.z = -.48 + index * .08;
  portal.add(arc);
  portalArcs.push(arc);
});

function makeSoftGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 256, 8, 256, 256, 250);
  gradient.addColorStop(0, 'rgba(220,80,0,.42)');
  gradient.addColorStop(.26, 'rgba(96,48,22,.20)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
const portalGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: makeSoftGlowTexture(), transparent: true, opacity: .72,
  blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
}));
portalGlow.scale.set(10.5, 10.5, 1);
portalGlow.position.z = -1.35;
portal.add(portalGlow);

const starCount = 1050;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const radius = 4.1 + Math.pow(Math.random(), .7) * 13;
  const angle = Math.random() * Math.PI * 2;
  const vertical = (Math.random() - .5) * 10;
  starPositions[i * 3] = Math.cos(angle) * radius;
  starPositions[i * 3 + 1] = vertical;
  starPositions[i * 3 + 2] = -2.2 - Math.random() * 9;
}
const starsGeometry = new THREE.BufferGeometry();
starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({
  color: 0xffedd7, size: .022, transparent: true, opacity: .42,
  sizeAttenuation: true, depthWrite: false
}));
scene.add(stars);

const sparkCount = 360;
const sparkPositions = new Float32Array(sparkCount * 3);
for (let i = 0; i < sparkCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 2.7 + Math.random() * 1.6;
  sparkPositions[i * 3] = Math.cos(angle) * radius;
  sparkPositions[i * 3 + 1] = Math.sin(angle) * radius * .95;
  sparkPositions[i * 3 + 2] = -.25 + (Math.random() - .5) * .55;
}
const sparksGeometry = new THREE.BufferGeometry();
sparksGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
const sparks = new THREE.Points(sparksGeometry, new THREE.PointsMaterial({
  color: 0xdc7a3c, size: .035, transparent: true, opacity: .52,
  blending: THREE.AdditiveBlending, sizeAttenuation: true, depthWrite: false
}));
portal.add(sparks);

const aluminium = new THREE.MeshPhysicalMaterial({
  color: 0xa5a5a8,
  metalness: 0.95,
  roughness: 0.19,
  clearcoat: 0.75,
  clearcoatRoughness: 0.14,
  envMapIntensity: 1.25
});
const darkAluminium = new THREE.MeshPhysicalMaterial({
  color: 0x09090b,
  metalness: 0.88,
  roughness: 0.22,
  clearcoat: 0.7,
  clearcoatRoughness: 0.16,
  envMapIntensity: 1.15
});
const ceramic = new THREE.MeshPhysicalMaterial({
  color: 0xf4f4f0,
  metalness: 0.08,
  roughness: 0.21,
  clearcoat: 0.88,
  clearcoatRoughness: 0.11
});
const brandMetal = new THREE.MeshPhysicalMaterial({
  color: 0xdc5000,
  metalness: 0.74,
  roughness: 0.2,
  clearcoat: 0.95,
  clearcoatRoughness: 0.1,
  emissive: 0x351306,
  emissiveIntensity: 0.22
});
const silicon = new THREE.MeshPhysicalMaterial({
  color: 0x050507,
  metalness: 0.62,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.2
});
const glass = new THREE.MeshPhysicalMaterial({
  color: 0x7a3514,
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
const glow = new THREE.MeshBasicMaterial({ color: 0xdc5000, transparent: true, opacity: 0.44, toneMapped: false });
const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffedd7, transparent: true, opacity: 0.28, toneMapped: false });

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
  ctx.fillStyle = '#ffedd7';
  ctx.font = '600 28px Arial';
  ctx.letterSpacing = '5px';
  ctx.fillText(text, 40, 92);
  ctx.fillStyle = '#dc5000';
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
      color: i%2 ? 0x26150b : 0x6b2b0c,
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

// No pedestal or projected shadows: the product floats in an absolute black void.
// Depth comes from transmission, reflective materials, particles, and layered rings.
const pedestalRing = portalRings[1];

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
    world.position.set(.08, 1.62, -1.45);
    world.scale.setScalar(.54);
    camera.fov = 44;
  } else if (w < 820) {
    world.position.set(.18, 1.32, -1.0);
    world.scale.setScalar(.66);
    camera.fov = 40;
  } else if (w < 1150) {
    world.position.set(.72, .2, -.45);
    world.scale.setScalar(.82);
    camera.fov = 35;
  } else {
    world.position.set(.78, .06, 0);
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
  product.rotation.x = mix(.16, -.035, architecture) + (reducedMotion ? 0 : pointer.y*.035);
  product.rotation.y = mix(-.46, .2, engineering) + mix(0, .24, scale) + (reducedMotion ? 0 : pointer.x*.065);
  product.rotation.z = mix(-.08, .008, reveal);
  product.position.y = Math.sin(time*.34)*.026;
  product.scale.setScalar(mix(.78, 1.02, scale));

  const desktop = window.innerWidth >= 820;
  const baseX = desktop ? mix(.82, .28, scale) : world.position.x;
  if (desktop) world.position.x += (baseX - world.position.x) * .035;
  world.rotation.y += ((-.12 + (reducedMotion ? 0 : pointer.x*.075)) - world.rotation.y) * .03;
  world.rotation.x += ((-.04 + (reducedMotion ? 0 : pointer.y*.045)) - world.rotation.x) * .03;

  // The portal has slow gravitational cadence; it never snaps or spins sharply.
  portal.rotation.z = time * .018 + scrollProgress * .28;
  portal.rotation.x = Math.sin(time * .17) * .018 + (reducedMotion ? 0 : pointer.y * .02);
  portal.rotation.y = Math.cos(time * .15) * .025 + (reducedMotion ? 0 : pointer.x * .025);
  portalRings.forEach((ring, i) => {
    ring.rotation.z += dt * (i % 2 ? -.018 : .012) * (1 + scale * .65);
  });
  portalArcs.forEach((arc, i) => {
    arc.rotation.z += dt * (i % 2 ? -.045 : .032);
    arc.material.opacity = mix(.22, i === 1 ? .74 : .48, reveal) * (1 - scale * .08);
  });
  portalGlow.material.opacity = mix(.34, .78, reveal) + Math.sin(time * .42) * .035;
  sparks.rotation.z = -time * .026;
  sparks.material.opacity = mix(.22, .58, reveal) + engineering * .08;
  stars.rotation.y = time * .004;
  stars.rotation.z = -time * .0025;

  const cameraZ = mix(12.8, 10.9, scale);
  camera.position.z += (cameraZ - camera.position.z) * .03;
  camera.position.x += (((reducedMotion ? 0 : pointer.x*.17) + mix(0,.22,scale)) - camera.position.x) * .022;
  camera.position.y += (((reducedMotion ? .1 : .1 + pointer.y*.09) + mix(0,-.05,scale)) - camera.position.y) * .022;
  camera.lookAt(mix(.2, .45, scale), .02, -.25);

  pointerLight.position.x += ((pointer.x*4.3 + .8) - pointerLight.position.x) * .045;
  pointerLight.position.y += ((pointer.y*3.2 + .8) - pointerLight.position.y) * .045;
  pedestalRing.material.opacity = .42 + engineering*.18;

  composer.render();
  if (!document.body.classList.contains('is-ready')) {
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));
  }
}
updateCopy(0);
animate();
