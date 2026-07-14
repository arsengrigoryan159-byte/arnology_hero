import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvas = document.querySelector('#scene');
const hero = document.querySelector('.hero');
const activeModuleEl = document.querySelector('#active-module');
const statusIndexEl = document.querySelector('.status-index');
const cursor = document.querySelector('.cursor-orbit');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060b, 0.052);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.15, 11.8);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.88, 0.62, 0.76);
composer.addPass(bloom);

scene.add(new THREE.HemisphereLight(0xbac6ff, 0x08090f, 1.65));
const keyLight = new THREE.DirectionalLight(0xffffff, 4.6);
keyLight.position.set(5, 5, 7);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0x6578ff, 48, 20, 2);
rimLight.position.set(-3, 2, 4);
scene.add(rimLight);
const warmLight = new THREE.PointLight(0xff8d48, 34, 16, 2);
warmLight.position.set(3.5, -2, 4.5);
scene.add(warmLight);
const pointerLight = new THREE.PointLight(0x58e2e8, 24, 12, 2);
pointerLight.position.set(3, 2, 6);
scene.add(pointerLight);

const world = new THREE.Group();
world.position.set(2.35, 0.2, 0);
world.rotation.set(-0.06, -0.18, 0.02);
scene.add(world);

const sculpture = new THREE.Group();
world.add(sculpture);

const chrome = new THREE.MeshPhysicalMaterial({
  color: 0x242936,
  metalness: 0.9,
  roughness: 0.17,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.2
});
const glass = new THREE.MeshPhysicalMaterial({
  color: 0x7383ff,
  metalness: 0.05,
  roughness: 0.08,
  transmission: 0.45,
  thickness: 1.1,
  transparent: true,
  opacity: 0.82,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  emissive: 0x19235a,
  emissiveIntensity: 0.9
});
const darkMetal = new THREE.MeshPhysicalMaterial({
  color: 0x0b1120,
  metalness: 0.7,
  roughness: 0.2,
  clearcoat: 1,
  clearcoatRoughness: 0.15,
  emissive: 0x09112c,
  emissiveIntensity: 0.6
});
const neonMaterial = new THREE.MeshBasicMaterial({ color: 0x7284ff, toneMapped: false });
const cyanMaterial = new THREE.MeshBasicMaterial({ color: 0x51d9df, toneMapped: false });
const warmMaterial = new THREE.MeshBasicMaterial({ color: 0xff9d4f, toneMapped: false });

const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.39, 220, 36, 2, 3), chrome);
knot.rotation.set(0.65, -0.25, 0.35);
sculpture.add(knot);

const innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 3), glass);
innerCore.scale.set(0.92, 1.08, 0.92);
sculpture.add(innerCore);

const coreWire = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.79, 2), 18),
  new THREE.LineBasicMaterial({ color: 0xa2adff, transparent: true, opacity: 0.42, toneMapped: false })
);
sculpture.add(coreWire);

// A physical Arnology monogram anchors the scene so the hero feels like a
// real branded object rather than a collection of interface frames.
const monogram = new THREE.Group();
const monogramMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf5f6ff,
  metalness: 0.82,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  emissive: 0x171d3d,
  emissiveIntensity: 0.35
});
const monogramAccent = new THREE.MeshPhysicalMaterial({
  color: 0x6f7cff,
  metalness: 0.55,
  roughness: 0.14,
  clearcoat: 1,
  emissive: 0x27307d,
  emissiveIntensity: 1.2
});
const beamGeometry = new RoundedBoxGeometry(0.28, 1.9, 0.28, 5, 0.07);
const leftBeam = new THREE.Mesh(beamGeometry, monogramMaterial);
leftBeam.position.set(-0.42, 0, 0.58);
leftBeam.rotation.z = -0.46;
const rightBeam = new THREE.Mesh(beamGeometry, monogramAccent);
rightBeam.position.set(0.42, 0, 0.58);
rightBeam.rotation.z = 0.46;
const crossbar = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.22, 0.28, 5, 0.06), monogramMaterial);
crossbar.position.set(0, -0.24, 0.59);
monogram.add(leftBeam, rightBeam, crossbar);
monogram.scale.setScalar(0.92);
monogram.rotation.x = -0.05;
sculpture.add(monogram);

const orbitalGroup = new THREE.Group();
sculpture.add(orbitalGroup);
const orbitalSettings = [
  [2.25, 0.045, 0.1, 0.25, 0.25, neonMaterial],
  [2.6, 0.024, 1.2, 0.55, -0.4, cyanMaterial],
  [2.9, 0.018, -0.7, 1.1, 0.5, warmMaterial],
  [1.95, 0.02, 0.4, 1.55, -0.2, neonMaterial]
];
orbitalSettings.forEach(([radius, tube, x, y, z, material]) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 180), material);
  ring.rotation.set(x, y, z);
  ring.material = material.clone();
  ring.material.transparent = true;
  ring.material.opacity = tube > .03 ? .58 : .34;
  orbitalGroup.add(ring);
});

const halo = new THREE.Mesh(
  new THREE.TorusGeometry(3.35, 0.008, 6, 220),
  new THREE.MeshBasicMaterial({ color: 0x556dff, transparent: true, opacity: 0.22, toneMapped: false })
);
halo.rotation.x = Math.PI / 2.3;
sculpture.add(halo);

const moduleDefinitions = [
  { label: 'PRODUCT ENGINEERING', short: 'PRODUCT', color: '#7687ff', position: new THREE.Vector3(-2.15, 1.55, 0.65) },
  { label: 'CLOUD & PLATFORMS', short: 'CLOUD', color: '#5ae0df', position: new THREE.Vector3(2.45, 1.2, -0.3) },
  { label: 'DATA & SYSTEMS', short: 'DATA', color: '#ff9f52', position: new THREE.Vector3(2.15, -1.65, 0.3) },
  { label: 'MOBILE EXPERIENCES', short: 'MOBILE', color: '#b180ff', position: new THREE.Vector3(-2.35, -1.3, -0.45) }
];

function makeLabelTexture(title, color) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const gradient = ctx.createLinearGradient(0, 0, c.width, c.height);
  gradient.addColorStop(0, 'rgba(255,255,255,.13)');
  gradient.addColorStop(1, 'rgba(255,255,255,.015)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(46, 48); ctx.lineTo(160, 48); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.42)';
  ctx.font = '500 24px Arial';
  ctx.letterSpacing = '4px';
  ctx.fillText('ARNOLOGY / SYSTEM', 46, 104);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 42px Arial';
  ctx.fillText(title, 46, 172);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

const modules = [];
const cables = [];
const pulses = [];
const moduleGeometry = new RoundedBoxGeometry(1.22, 0.78, 0.28, 5, 0.08);

moduleDefinitions.forEach((definition, index) => {
  const group = new THREE.Group();
  group.position.copy(definition.position);
  group.userData.basePosition = definition.position.clone();
  group.userData.phase = index * 1.47;
  group.userData.label = definition.label;
  group.userData.index = index;

  const boxMaterial = darkMetal.clone();
  boxMaterial.emissive = new THREE.Color(definition.color).multiplyScalar(.12);
  const box = new THREE.Mesh(moduleGeometry, boxMaterial);
  box.userData.moduleGroup = group;
  group.add(box);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(moduleGeometry, 20),
    new THREE.LineBasicMaterial({ color: definition.color, transparent: true, opacity: .65, toneMapped: false })
  );
  group.add(border);

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.04, 0.56),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture(definition.short, definition.color), transparent: true, opacity: .95, toneMapped: false })
  );
  panel.position.z = 0.146;
  group.add(panel);

  const node = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: definition.color, toneMapped: false }));
  node.position.set(-0.48, 0.27, 0.18);
  group.add(node);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    definition.position.clone().multiplyScalar(.36).add(new THREE.Vector3(0, index % 2 ? -.4 : .4, .15)),
    definition.position.clone().multiplyScalar(.72),
    definition.position.clone()
  ]);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 72, 0.012, 7, false),
    new THREE.MeshBasicMaterial({ color: definition.color, transparent: true, opacity: .48, toneMapped: false })
  );
  sculpture.add(tube);
  cables.push({ mesh: tube, curve });

  const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 12), new THREE.MeshBasicMaterial({ color: definition.color, toneMapped: false }));
  sculpture.add(pulse);
  pulses.push({ mesh: pulse, curve, speed: 0.1 + index * 0.012, offset: index * .21 });

  sculpture.add(group);
  modules.push(group);
});

const shardMaterial = new THREE.MeshPhysicalMaterial({ color: 0x6578ff, metalness: .65, roughness: .15, transparent: true, opacity: .34, clearcoat: 1, emissive: 0x151f5b, emissiveIntensity: .5 });
const shards = [];
for (let i = 0; i < 14; i++) {
  const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.11 + Math.random() * .13, 0), shardMaterial.clone());
  const angle = (i / 14) * Math.PI * 2;
  const radius = 3.2 + Math.random() * 1.45;
  shard.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.15) * (1.6 + Math.random()), (Math.random() - .5) * 2.2);
  shard.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  shard.userData.phase = Math.random() * Math.PI * 2;
  shard.userData.base = shard.position.clone();
  sculpture.add(shard);
  shards.push(shard);
}

const platform = new THREE.Group();
platform.position.y = -2.6;
platform.rotation.x = Math.PI / 2;
sculpture.add(platform);
for (let i = 0; i < 5; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.3 + i * .38, 0.009, 5, 160),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0x51dce1 : 0x6578ff, transparent: true, opacity: .18 - i * .018, toneMapped: false })
  );
  platform.add(ring);
}

const particleCount = 1100;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const colorA = new THREE.Color(0x7787ff);
const colorB = new THREE.Color(0x54dce1);
for (let i = 0; i < particleCount; i++) {
  const r = 5 + Math.random() * 13;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * .65;
  positions[i * 3 + 2] = r * Math.cos(phi) - 3;
  const c = colorA.clone().lerp(colorB, Math.random());
  colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const particleField = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ size: .025, vertexColors: true, transparent: true, opacity: .55, depthWrite: false, toneMapped: false }));
scene.add(particleField);

const pointer = new THREE.Vector2(0, 0);
const pointerTarget = new THREE.Vector2(0, 0);
const raycaster = new THREE.Raycaster();
let hoveredModule = null;
let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragRotationY = 0;
let dragRotationX = 0;
let targetDragY = 0;
let targetDragX = 0;
let pageVisible = true;

function setActiveModule(module) {
  if (hoveredModule === module) return;
  if (hoveredModule) {
    const oldBox = hoveredModule.children[0];
    oldBox.material.emissiveIntensity = .6;
    hoveredModule.scale.setScalar(1);
  }
  hoveredModule = module;
  if (module) {
    const box = module.children[0];
    box.material.emissiveIntensity = 2.3;
    module.scale.setScalar(1.08);
    activeModuleEl.textContent = module.userData.label;
    statusIndexEl.textContent = String(module.userData.index + 1).padStart(2, '0');
    document.body.classList.add('pointer-active');
  } else {
    activeModuleEl.textContent = 'PRODUCT ENGINEERING';
    statusIndexEl.textContent = '01';
    document.body.classList.remove('pointer-active');
  }
}

function handlePointerMove(event) {
  pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointerTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if (cursor) cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  document.body.classList.add('pointer-ready');

  if (dragging) {
    targetDragY = dragRotationY + (event.clientX - dragStartX) * 0.0045;
    targetDragX = dragRotationX + (event.clientY - dragStartY) * 0.003;
  }
}

window.addEventListener('pointermove', handlePointerMove, { passive: true });
hero.addEventListener('pointerdown', (event) => {
  if (event.target.closest('a,button')) return;
  dragging = true;
  dragStartX = event.clientX; dragStartY = event.clientY;
  dragRotationY = targetDragY; dragRotationX = targetDragX;
  hero.setPointerCapture?.(event.pointerId);
});
hero.addEventListener('pointerup', () => { dragging = false; });
hero.addEventListener('pointercancel', () => { dragging = false; });

function updateResponsiveLayout() {
  const w = window.innerWidth;
  if (w < 620) {
    world.position.set(0.2, 2.15, -1.2);
    world.scale.setScalar(.68);
    camera.fov = 42;
  } else if (w < 900) {
    world.position.set(1.0, 1.7, -.55);
    world.scale.setScalar(.78);
    camera.fov = 39;
  } else if (w < 1200) {
    world.position.set(2.3, .35, -.2);
    world.scale.setScalar(.86);
    camera.fov = 36;
  } else {
    world.position.set(2.55, .18, 0);
    world.scale.setScalar(1);
    camera.fov = 34;
  }
  camera.updateProjectionMatrix();
}
updateResponsiveLayout();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  updateResponsiveLayout();
});

document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });

const clock = new THREE.Clock();
let intro = 0;

function easeOutExpo(x) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }

function animate() {
  requestAnimationFrame(animate);
  if (!pageVisible) return;
  const delta = Math.min(clock.getDelta(), .05);
  const time = clock.elapsedTime;
  pointer.lerp(pointerTarget, .065);

  intro = Math.min(1, intro + delta * .48);
  const introEase = easeOutExpo(intro);
  sculpture.scale.setScalar(.58 + introEase * .42);
  sculpture.position.y = (1 - introEase) * -.45;
  sculpture.rotation.z = (1 - introEase) * -.25;

  targetDragY *= dragging ? 1 : .985;
  targetDragX *= dragging ? 1 : .985;
  const parallaxX = reducedMotion ? 0 : pointer.y * .12;
  const parallaxY = reducedMotion ? 0 : pointer.x * .24;
  world.rotation.x += ((-.06 + parallaxX + targetDragX) - world.rotation.x) * .045;
  world.rotation.y += ((-.18 + parallaxY + targetDragY) - world.rotation.y) * .045;
  camera.position.x += ((reducedMotion ? 0 : pointer.x * .28) - camera.position.x) * .025;
  camera.position.y += ((.15 + (reducedMotion ? 0 : pointer.y * .16)) - camera.position.y) * .025;
  camera.lookAt(0.45, .05, 0);

  pointerLight.position.x += ((pointer.x * 5.8) - pointerLight.position.x) * .06;
  pointerLight.position.y += ((pointer.y * 3.8) - pointerLight.position.y) * .06;

  if (!reducedMotion) {
    knot.rotation.x += delta * .085;
    knot.rotation.y -= delta * .12;
    innerCore.rotation.x -= delta * .08;
    innerCore.rotation.y += delta * .12;
    coreWire.rotation.copy(innerCore.rotation);
    monogram.rotation.y = Math.sin(time * .42) * .12;
    monogram.position.y = Math.sin(time * .7) * .035;
    orbitalGroup.rotation.y += delta * .052;
    orbitalGroup.rotation.z -= delta * .031;
    halo.rotation.z += delta * .025;
    platform.rotation.z -= delta * .055;
    particleField.rotation.y += delta * .006;

    modules.forEach((module, index) => {
      const base = module.userData.basePosition;
      const phase = module.userData.phase;
      module.position.x = base.x + Math.sin(time * .55 + phase) * .09;
      module.position.y = base.y + Math.cos(time * .72 + phase) * .12;
      module.position.z = base.z + Math.sin(time * .48 + phase) * .08;
      module.rotation.x = Math.sin(time * .38 + phase) * .08;
      module.rotation.y = Math.cos(time * .43 + phase) * .1;
      const delay = Math.min(1, Math.max(0, (intro - .2 - index * .07) / .32));
      module.visible = delay > .01;
      module.scale.setScalar(delay * (hoveredModule === module ? 1.08 : 1));
    });

    pulses.forEach((pulse, index) => {
      const t = (time * pulse.speed + pulse.offset) % 1;
      pulse.mesh.position.copy(pulse.curve.getPointAt(t));
      const pulseScale = .7 + Math.sin(t * Math.PI) * .8;
      pulse.mesh.scale.setScalar(pulseScale);
    });

    shards.forEach((shard) => {
      const phase = shard.userData.phase;
      shard.position.y = shard.userData.base.y + Math.sin(time * .48 + phase) * .16;
      shard.rotation.x += delta * .08;
      shard.rotation.y -= delta * .1;
    });
  }

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(modules.map((m) => m.children[0]), false)[0];
  setActiveModule(hit?.object?.userData?.moduleGroup ?? null);

  composer.render();
}
animate();
