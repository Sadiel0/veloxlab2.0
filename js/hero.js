// Hero: floating glass shards refracting a spectral light field. Cursor-reactive, bloom, ACES.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('hero-gl');
const hero = document.querySelector('.hero');
const fpsEl = document.getElementById('fps');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 860px)').matches;

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  } catch (err) {
    console.warn('WebGL unavailable, using CSS fallback', err);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080b);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---- spectral light field behind the glass (what the shards refract) ----
  const bgMat = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uAspect: { value: 1 }, uSmall: { value: small ? 1 : 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv; uniform float uTime; uniform vec2 uMouse; uniform float uAspect; uniform float uSmall;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
      vec3 blob(vec2 p, vec2 c, float r, vec3 col){ float d = length(p - c); return col * exp(-d*d/(r*r)); }
      void main(){
        vec2 p = vUv - 0.5; p.x *= uAspect;
        float t = uTime * 0.12;
        vec2 w = p + 0.22 * vec2(noise(p*2.2 + t), noise(p*2.2 - t + 3.1)) - 0.11;
        vec2 o = mix(vec2(0.32, 0.0), vec2(0.0, 0.18), uSmall);
        vec3 col = vec3(0.006, 0.007, 0.011);
        col += blob(w, o + vec2(0.06 + 0.14*sin(t*1.3), 0.1*cos(t)) + uMouse*0.08, 0.28, vec3(0.0, 0.8, 1.0) * 0.6);
        col += blob(w, o + vec2(0.3 + 0.1*cos(t*0.9), -0.24 + 0.1*sin(t*1.1)), 0.24, vec3(1.0, 0.05, 0.38) * 0.7);
        col += blob(w, o + vec2(-0.12 + 0.12*sin(t*0.7 + 1.0), 0.3 + 0.08*cos(t*1.4)), 0.2, vec3(1.0, 0.45, 0.02) * 0.45);
        col += blob(w, o + vec2(0.45, 0.28 + 0.1*sin(t)), 0.18, vec3(0.55, 1.0, 0.1) * 0.28);
        float streak = smoothstep(0.992, 1.0, sin((w.x*1.4 + w.y*0.7) * 38.0 + t*5.0));
        col += streak * 0.025 * vec3(0.7, 0.95, 1.0);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
  bg.position.z = -8;
  scene.add(bg);

  // ---- glass shards ----
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.04,
    transmission: 1, thickness: 1.6, ior: 1.55, dispersion: 6,
    iridescence: 0.7, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 480],
    clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2, specularIntensity: 1,
  });

  const rand = (a, b) => a + Math.random() * (b - a);
  function shardGeometry() {
    const g = new THREE.OctahedronGeometry(1, 0);
    const pos = g.attributes.position;
    const jitter = new Map();
    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(2)},${pos.getY(i).toFixed(2)},${pos.getZ(i).toFixed(2)}`;
      if (!jitter.has(key)) jitter.set(key, [rand(-0.35, 0.35), rand(-0.35, 0.35), rand(-0.2, 0.2)]);
      const j = jitter.get(key);
      pos.setXYZ(i, pos.getX(i) + j[0], pos.getY(i) + j[1], pos.getZ(i) + j[2]);
    }
    g.computeVertexNormals();
    return g;
  }

  const group = new THREE.Group();
  scene.add(group);
  const COUNT = small ? 7 : 13;
  const shards = [];
  for (let i = 0; i < COUNT; i++) {
    const big = i === 0;
    const m = new THREE.Mesh(shardGeometry(), glass);
    const s = big ? 1.55 : rand(0.35, 0.9);
    m.scale.set(s * rand(0.55, 0.9), s * rand(1.2, 2.0), s * rand(0.14, 0.3));
    const r = big ? 0 : rand(1.3, 2.9);
    const a = rand(0, Math.PI * 2);
    m.position.set(Math.cos(a) * r * 0.9 + 0.4, Math.sin(a) * r * 0.85, big ? 0 : rand(-2.2, 1.6));
    m.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    m.userData = { spin: new THREE.Vector3(rand(-0.25, 0.25), rand(-0.3, 0.3), rand(-0.15, 0.15)), phase: rand(0, 10), base: m.position.clone() };
    group.add(m);
    shards.push(m);
  }

  // ---- light streaks (bloom catches these) ----
  const streakColors = [0x2ef2ff, 0xff2d87, 0xb8ff3c];
  const streaks = streakColors.map((c, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(3.2), transparent: true, opacity: 0.85, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(14, 0.012, 0.012), mat);
    mesh.rotation.z = -0.38 + i * 0.12;
    mesh.position.set(0, -1.6 + i * 1.5, -3 - i);
    mesh.userData.phase = i * 2.1;
    group.add(mesh);
    return mesh;
  });

  // ---- post ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), small ? 0.35 : 0.5, 0.6, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const dist = camera.position.z - bg.position.z;
    const hh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    bg.scale.set(hh * camera.aspect * 1.15, hh * 1.15, 1);
    bgMat.uniforms.uAspect.value = camera.aspect;
    const narrow = w < 860;
    group.position.set(narrow ? 0.2 : 3.0, narrow ? 1.6 : 0.1, 0);
    group.scale.setScalar(narrow ? 0.72 : 1);
    if (reduce) composer.render();
  }
  new ResizeObserver(resize).observe(hero);
  resize();

  // ---- input ----
  const mouse = new THREE.Vector2(), smooth = new THREE.Vector2();
  addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(hero);

  // ---- loop ----
  const clock = new THREE.Clock();
  let frames = 0, acc = 0;
  function frame(t, dt) {
    smooth.lerp(mouse, 0.05);
    bgMat.uniforms.uTime.value = t;
    bgMat.uniforms.uMouse.value.copy(smooth);
    group.rotation.y = smooth.x * 0.35 + Math.sin(t * 0.1) * 0.1;
    group.rotation.x = -smooth.y * 0.22;
    for (const m of shards) {
      const u = m.userData;
      m.rotation.x += u.spin.x * dt;
      m.rotation.y += u.spin.y * dt;
      m.rotation.z += u.spin.z * dt;
      m.position.y = u.base.y + Math.sin(t * 0.6 + u.phase) * 0.18;
      m.position.x = u.base.x + smooth.x * 0.25 * (u.base.z + 2.5) * 0.3;
    }
    for (const s of streaks) {
      s.position.x = Math.sin(t * 0.25 + s.userData.phase) * 2.5;
      s.material.opacity = 0.45 + 0.4 * Math.sin(t * 0.8 + s.userData.phase);
    }
    composer.render();
  }

  if (reduce) {
    frame(4, 0);
    canvas.classList.add('ready');
    return;
  }

  let first = true;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible || document.hidden) return;
    frame(clock.elapsedTime, dt);
    if (first) { canvas.classList.add('ready'); first = false; }
    frames++; acc += dt;
    if (acc >= 0.5 && fpsEl) { fpsEl.textContent = Math.round(frames / acc); frames = 0; acc = 0; }
  });
}

init();
