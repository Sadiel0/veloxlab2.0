/* VeloxLab stage: one fixed WebGL scene behind the whole page.

   Story, driven entirely by scroll position (so it plays backwards too):
   1. Hero: the chrome robot, waist up, holding its camera, seams glowing.
   2. Scrolling down, it dissolves from the head down. Every piece that breaks
      off becomes a code glyph that drops into a column of falling "rain".
   3. That rain is the background of the rest of the site. It drifts with the
      page as you scroll and runs faster when you scroll faster.
   4. At the contact section the rain flows back up and re-forms the robot.

   Falls back to the hero poster when WebGL or motion is unavailable. */

import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, FogExp2, PMREMGenerator, ACESFilmicToneMapping,
  SRGBColorSpace, Group, Box3, Vector3, Vector2, DirectionalLight, HemisphereLight, Mesh, PlaneGeometry,
  ShaderMaterial, BufferGeometry, Float32BufferAttribute, Points, AdditiveBlending, MathUtils, CanvasTexture,
  GLTFLoader, RoomEnvironment, EffectComposer, RenderPass, UnrealBloomPass, OutputPass
} from "./vendor/three.bundle.js";

const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.createElement("canvas");
canvas.className = "stage";
canvas.setAttribute("aria-hidden", "true");

function supportsWebGL() {
  try { return !!canvas.getContext("webgl2"); } catch (e) { return false; }
}


/* Value noise shared by the mesh shader and the particle setup, so a glyph
   breaks off exactly where the surface disappears. */
const NOISE_GLSL = `
  float vhash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float vnoise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(vhash(i), vhash(i + vec3(1,0,0)), f.x), mix(vhash(i + vec3(0,1,0)), vhash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(vhash(i + vec3(0,0,1)), vhash(i + vec3(1,0,1)), f.x), mix(vhash(i + vec3(0,1,1)), vhash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }`;
const fract = (x) => x - Math.floor(x);
function vhash(x, y, z) {
  x = fract(x * 0.3183099 + 0.1) * 17; y = fract(y * 0.3183099 + 0.1) * 17; z = fract(z * 0.3183099 + 0.1) * 17;
  return fract(x * y * z * (x + y + z));
}
function vnoise(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const L = (a, b, t) => a + (b - a) * t;
  return L(
    L(L(vhash(ix, iy, iz), vhash(ix + 1, iy, iz), fx), L(vhash(ix, iy + 1, iz), vhash(ix + 1, iy + 1, iz), fx), fy),
    L(L(vhash(ix, iy, iz + 1), vhash(ix + 1, iy, iz + 1), fx), L(vhash(ix, iy + 1, iz + 1), vhash(ix + 1, iy + 1, iz + 1), fx), fy),
    fz);
}
const NOISE_SCALE = 7.0;
// dissolve field: 0 at the head, 1 at the feet, broken up by noise
const field = (h, n) => (1 - h) * 0.72 + n * 0.28;

/* Glyph atlas: 4x4 cells of code characters */
function glyphAtlas() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const chars = "01<>/{}=;+*#[]$%";
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = '500 46px "JetBrains Mono", ui-monospace, Menlo, monospace';
  for (let i = 0; i < 16; i++) g.fillText(chars[i], (i % 4) * 64 + 32, Math.floor(i / 4) * 64 + 34);
  const t = new CanvasTexture(c);
  return t;
}

const GLYPH_FRAG = `
  uniform sampler2D uAtlas;
  varying float vA; varying float vGlyph; varying vec3 vCol;
  void main(){
    vec2 pc = gl_PointCoord;
    // narrow the sprite into a tall code cell
    pc.x = (pc.x - 0.5) * 1.7 + 0.5;
    if (pc.x < 0.0 || pc.x > 1.0) discard;
    float g = floor(vGlyph);
    vec2 cell = vec2(mod(g, 4.0), floor(g / 4.0));
    vec2 uv = vec2((cell.x + pc.x) / 4.0, 1.0 - (cell.y + pc.y) / 4.0);
    float m = texture2D(uAtlas, uv).r;
    if (m < 0.05) discard;
    gl_FragColor = vec4(vCol * m * vA, m * vA);
  }`;

function start() {
  document.body.prepend(canvas);
  const small = () => innerWidth < 768;
  let mobile = small();

  /* ---------- Renderer, scene, camera ---------- */

  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.3 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  scene.background = new Color(0x0c0b0a);
  scene.fog = new FogExp2(0x0c0b0a, 0.05);

  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(30, innerWidth / innerHeight, 0.05, 100);

  scene.add(new HemisphereLight(0xc9d2e0, 0x1a0e06, 0.35));
  const key = new DirectionalLight(0xeef2fa, 2.0);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const front = new DirectionalLight(0xffffff, 0.9);
  front.position.set(1.5, 1.2, 4);
  scene.add(front);
  const rim = new DirectionalLight(0xff8a2a, 3.0);
  rim.position.set(3.5, 2.5, -4);
  scene.add(rim);
  const rim2 = new DirectionalLight(0xff6a10, 1.2);
  rim2.position.set(-4, 0.5, -3);
  scene.add(rim2);

  const VH = { value: innerHeight };
  const atlas = glyphAtlas();
  if (document.fonts) document.fonts.load('500 46px "JetBrains Mono"').then(() => {
    const fresh = glyphAtlas();
    atlas.image = fresh.image;
    atlas.needsUpdate = true;
  });

  /* ---------- Backdrop: warm smoke and glow ---------- */

  const backdrop = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uCenter: { value: new Vector2(0.7, 0.55) },
        uHeat: { value: 1 },
        uAspect: { value: innerWidth / innerHeight }
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }",
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime, uHeat, uAspect;
        uniform vec2 uCenter;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*n(p); p *= 2.03; a *= 0.5; } return v; }
        void main(){
          vec2 uv = vUv; vec2 p = vec2((uv.x - uCenter.x) * uAspect, uv.y - uCenter.y);
          float d = length(p);
          float smoke = smoothstep(0.35, 0.95, fbm(vec2(uv.x * uAspect * 1.6 + uTime * 0.035, uv.y * 1.6 - uTime * 0.02)));
          float glow = exp(-d * d * 6.5) * uHeat;
          vec3 amber = vec3(1.0, 0.45, 0.12);
          vec3 col = vec3(0.034, 0.031, 0.028) + amber * glow * 0.11 + amber * smoke * glow * 0.12 + vec3(0.6, 0.62, 0.66) * smoke * 0.012;
          float vig = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(uAspect, 1.0)));
          gl_FragColor = vec4(col * mix(0.55, 1.0, vig), 1.0);
          #include <colorspace_fragment>
        }`
    })
  );
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -10;
  scene.add(backdrop);

  /* ---------- Embers (hero only) ---------- */

  const EMBERS = mobile ? 160 : 360;
  const eg = new BufferGeometry();
  const ep = new Float32Array(EMBERS * 3);
  const es = new Float32Array(EMBERS);
  for (let i = 0; i < EMBERS; i++) {
    ep[i * 3] = (Math.random() - 0.5) * 6;
    ep[i * 3 + 1] = Math.random() * 6 - 2.5;
    ep[i * 3 + 2] = (Math.random() - 0.5) * 5;
    es[i] = Math.random();
  }
  eg.setAttribute("position", new Float32BufferAttribute(ep, 3));
  eg.setAttribute("seed", new Float32BufferAttribute(es, 1));
  const emberMat = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uAmt: { value: 1 } },
    vertexShader: `
      attribute float seed; uniform float uTime, uPx; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y + 2.5 + uTime * (0.15 + seed * 0.3), 6.0) - 2.5;
        p.x += sin(uTime * 0.6 + seed * 40.0) * 0.15;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        vA = smoothstep(-2.5, -1.5, p.y) * smoothstep(3.5, 1.2, p.y) * (0.5 + 0.5 * sin(uTime * 3.0 + seed * 60.0));
        gl_PointSize = (1.5 + seed * 4.0) * uPx * (4.0 / -mv.z);
      }`,
    fragmentShader: `
      varying float vA; uniform float uAmt;
      void main(){
        float core = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
        gl_FragColor = vec4(mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.85, 0.6), core * core) * core * vA * uAmt, core * vA * uAmt);
      }`
  });
  const embers = new Points(eg, emberMat);
  embers.frustumCulled = false;
  scene.add(embers);

  /* ---------- Code rain: the background of the whole site ---------- */

  const COLS = mobile ? 110 : 260;
  const PER = mobile ? 14 : 18;
  const RAIN = COLS * PER;
  const rg = new BufferGeometry();
  const rp = new Float32Array(RAIN * 3);
  const rd = new Float32Array(RAIN * 4); // column speed, index in column, glyph seed, column seed
  for (let c = 0; c < COLS; c++) {
    // a ring around the robot, so the rain surrounds the camera wherever it orbits
    const ang = Math.random() * Math.PI * 2;
    const rad = 2.4 + Math.pow(Math.random(), 0.7) * 11;
    const x = Math.sin(ang) * rad;
    const z = Math.cos(ang) * rad;
    const speed = 0.35 + Math.random() * 0.9;
    const cs = Math.random();
    for (let j = 0; j < PER; j++) {
      const i = c * PER + j;
      rp[i * 3] = x; rp[i * 3 + 1] = 0; rp[i * 3 + 2] = z;
      rd[i * 4] = speed; rd[i * 4 + 1] = j; rd[i * 4 + 2] = Math.random(); rd[i * 4 + 3] = cs;
    }
  }
  rg.setAttribute("position", new Float32BufferAttribute(rp, 3));
  rg.setAttribute("data", new Float32BufferAttribute(rd, 4));
  const rainMat = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uFlow: { value: 0 }, uAmt: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uVH: VH,
      uAtlas: { value: atlas }
    },
    vertexShader: `
      attribute vec4 data; uniform float uTime, uFlow, uPx, uAmt, uVH;
      varying float vA; varying float vGlyph; varying vec3 vCol;
      void main(){
        float span = 11.0;
        float gap = 0.21;
        float head = mod(data.w * span + uTime * data.x + uFlow * (0.6 + data.x * 0.5), span);
        vec3 p = position;
        p.y = 5.0 - head + data.y * gap;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float trail = 1.0 - data.y / ${PER.toFixed(1)};
        float lead = step(data.y, 0.5);
        vA = uAmt * trail * trail * smoothstep(-6.0, -4.0, p.y) * smoothstep(5.5, 3.5, p.y) * (0.55 + 0.45 * fract(sin(data.z * 91.0 + floor(uTime * 6.0 * data.z)) * 43758.0));
        vGlyph = mod(floor(data.z * 16.0 + uTime * (2.0 + data.z * 6.0) * (0.3 + lead)), 16.0);
        vCol = mix(vec3(1.0, 0.5, 0.14), vec3(1.0, 0.92, 0.8), lead) * (0.9 + lead * 1.4);
        gl_PointSize = 0.5 * uPx * uVH * 0.6 / -mv.z;
      }`,
    fragmentShader: GLYPH_FRAG
  });
  const rain = new Points(rg, rainMat);
  rain.frustumCulled = false;
  scene.add(rain);

  /* ---------- Robot + dissolve ---------- */

  const rig = new Group();      // scroll pose
  const look = new Group();     // mouse follow + breathing
  rig.add(look);
  scene.add(rig);

  const U = {
    uGlow: { value: 1 }, uTime: { value: 0 }, uWave: { value: 0 }, uDis: { value: 0 },
    uMinY: { value: -1 }, uMaxY: { value: 1 }
  };
  let shardMat = null;

  new GLTFLoader().load(mobile ? "/assets/3d/robot.glb" : "/assets/3d/robot-hd.glb", (gltf) => {
    const robot = gltf.scene;
    const box = new Box3().setFromObject(robot);
    const size = box.getSize(new Vector3());
    robot.scale.setScalar(2.0 / size.y);
    box.setFromObject(robot);
    const c = box.getCenter(new Vector3());
    robot.position.set(-c.x, -box.min.y - 1.0, -c.z);

    robot.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      const geo = o.geometry;
      geo.computeBoundingBox();
      U.uMinY.value = geo.boundingBox.min.y;
      U.uMaxY.value = geo.boundingBox.max.y;

      const m = o.material;
      m.envMapIntensity = 2.1;
      const aniso = renderer.capabilities.getMaxAnisotropy();
      [m.map, m.normalMap, m.roughnessMap, m.metalnessMap].forEach((t) => { if (t) { t.anisotropy = aniso; t.needsUpdate = true; } });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader
          .replace("#include <common>", "#include <common>\nvarying float vGlowY;\nvarying vec3 vLocal;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;")
          .replace("#include <project_vertex>", "#include <project_vertex>\nvGlowY = (modelMatrix * vec4(transformed, 1.0)).y;");
        sh.fragmentShader = sh.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying float vGlowY;\nvarying vec3 vLocal;\nuniform float uGlow, uTime, uWave, uDis, uMinY, uMaxY;\n" + NOISE_GLSL)
          .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
            float hN = clamp((vLocal.y - uMinY) / (uMaxY - uMinY), 0.0, 1.0);
            float fieldV = (1.0 - hN) * 0.72 + vnoise(vLocal * ${NOISE_SCALE.toFixed(1)}) * 0.28;
            float T = uDis * 1.12 - 0.06;
            if (fieldV < T) discard;
            float edgeV = (1.0 - smoothstep(0.0, 0.018, fieldV - T)) * step(0.001, uDis);`)
          .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
            #ifdef USE_MAP
              vec3 tex = texture2D(map, vMapUv).rgb;
              float hot = smoothstep(0.08, 0.35, tex.r - tex.b) * smoothstep(0.05, 0.25, tex.r);
              float wave = 0.55 + 0.45 * sin(vGlowY * 5.0 - uTime * 1.6 - uWave * 14.0);
              float band = smoothstep(0.92, 1.0, sin(vGlowY * 1.6 - uWave * 9.0));
              totalEmissiveRadiance += vec3(1.0, 0.42, 0.09) * hot * uGlow * (0.5 + wave * 0.9 + band * 2.4);
            #endif
            totalEmissiveRadiance += vec3(1.0, 0.5, 0.15) * edgeV * 2.2;
            float fres = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
            totalEmissiveRadiance += mix(vec3(0.55, 0.6, 0.7), vec3(1.0, 0.5, 0.15), 0.6) * fres * 0.55;`);
      };
      m.needsUpdate = true;

      /* Shards: surface samples that turn into falling glyphs */
      const pos = geo.attributes.position;
      const uvA = geo.attributes.uv;
      const N = Math.min(pos.count, mobile ? 3500 : 7000);
      const stride = pos.count / N;
      const sp = new Float32Array(N * 3);
      const sd = new Float32Array(N * 4); // release threshold, seed, hot, column jitter
      let img = null;
      try {
        const bmp = m.map && m.map.image;
        if (bmp) {
          const cv = document.createElement("canvas");
          cv.width = cv.height = 256;
          const cx = cv.getContext("2d", { willReadFrequently: true });
          cx.drawImage(bmp, 0, 0, 256, 256);
          img = cx.getImageData(0, 0, 256, 256).data;
        }
      } catch (e) { img = null; }
      const span = U.uMaxY.value - U.uMinY.value;
      for (let i = 0; i < N; i++) {
        const k = Math.floor(i * stride);
        const x = pos.getX(k), y = pos.getY(k), z = pos.getZ(k);
        sp[i * 3] = x; sp[i * 3 + 1] = y; sp[i * 3 + 2] = z;
        const h = (y - U.uMinY.value) / span;
        sd[i * 4] = field(h, vnoise(x * NOISE_SCALE, y * NOISE_SCALE, z * NOISE_SCALE));
        sd[i * 4 + 1] = Math.random();
        let hot = 0;
        if (img && uvA) {
          const u = Math.min(255, Math.max(0, Math.floor(uvA.getX(k) * 256)));
          const v = Math.min(255, Math.max(0, Math.floor(uvA.getY(k) * 256)));
          const p = (v * 256 + u) * 4;
          hot = Math.max(0, Math.min(1, (img[p] - img[p + 2] - 40) / 80));
        }
        sd[i * 4 + 2] = hot;
        sd[i * 4 + 3] = Math.random();
      }
      const sg = new BufferGeometry();
      sg.setAttribute("position", new Float32BufferAttribute(sp, 3));
      sg.setAttribute("data", new Float32BufferAttribute(sd, 4));
      shardMat = new ShaderMaterial({
        transparent: true, depthWrite: false, blending: AdditiveBlending,
        uniforms: Object.assign({ uPx: { value: renderer.getPixelRatio() }, uAtlas: { value: atlas }, uVH: VH }, U),
        vertexShader: `
          attribute vec4 data; uniform float uDis, uTime, uPx, uVH;
          varying float vA; varying float vGlyph; varying vec3 vCol;
          void main(){
            float T = uDis * 1.12 - 0.06;
            float a = clamp((T - data.x) / 0.26, 0.0, 1.0);
            vec4 w = modelMatrix * vec4(position, 1.0);
            // snap into columns, then fall, faster the longer it has been free
            float col = 0.085;
            vec3 snapped = vec3(floor(w.x / col + 0.5) * col, w.y, floor(w.z / col + 0.5) * col);
            vec3 p = mix(w.xyz, snapped, smoothstep(0.0, 0.25, a));
            p.y -= a * a * 6.5 + a * 0.3 * data.y;
            p.x += (data.w - 0.5) * 0.06 * a;
            vec4 mv = viewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            vA = step(data.x, T) * smoothstep(0.0, 0.05, a + 0.02) * (1.0 - smoothstep(0.55, 1.0, a));
            vGlyph = mod(floor(data.y * 16.0 + uTime * 8.0 * a), 16.0);
            vCol = mix(vec3(0.95, 0.9, 0.82), vec3(1.0, 0.5, 0.12), max(data.z, 0.4)) * (0.55 + (1.0 - a) * 0.5);
            gl_PointSize = (0.07 + a * 0.06) * uPx * uVH * 0.6 / -mv.z;
          }`,
        fragmentShader: GLYPH_FRAG
      });
      const shards = new Points(sg, shardMat);
      shards.frustumCulled = false;
      o.add(shards);
    });
    look.add(robot);
    root.classList.add("has-3d");
  }, undefined, () => { canvas.remove(); });

  /* ---------- Post ---------- */

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(innerWidth, innerHeight), 0.4, 0.4, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- Stations: one pose per section ---------- */

  // az orbit angle, el height, d distance, y look height, x screen side (-1 left .. 1 right),
  // yaw robot turn, glow seam heat, ex exposure, heat backdrop, dis dissolve (0 whole .. 1 gone),
  // rain code-rain strength, emb embers
  const TAU = Math.PI * 2;
  const STATIONS = [
    { sel: ".hero-frame",  az: 0.38, el: 0.02, d: 2.25, y: 0.6,  x: 0.42, yaw: -0.45, glow: 1.0, ex: 1.0,  heat: 1.0, dis: 0, rain: 0,    emb: 1 },
    { sel: "#reel",        az: 0.15, el: 0.35, d: 4.6, y: 0.1,  x: 0.0,  yaw: -0.2, glow: 1.6, ex: 0.9,  heat: 0.6, dis: 1, rain: 0.9,  emb: 0.2 },
    { sel: "#work",        az: -0.5, el: 0.2,  d: 5.5, y: 0.0,  x: 0.0,  yaw: 0.0,  glow: 1.0, ex: 0.85, heat: 0.35, dis: 1, rain: 0.55, emb: 0 },
    { sel: "#services",    az: 0.0,  el: 0.05, d: 5.0, y: 0.1,  x: 0.0,  yaw: 0.0,  glow: 1.0, ex: 0.9,  heat: 0.5, dis: 1, rain: 0.45, emb: 0 },
    { sel: "#real-estate", az: 0.6,  el: 0.1,  d: 4.6, y: 0.2,  x: 0.0,  yaw: 0.0,  glow: 1.0, ex: 0.9,  heat: 0.45, dis: 1, rain: 0.6,  emb: 0 },
    { sel: "#process",     az: 0.6 + Math.PI, el: 0.3, d: 5.2, y: 0.1, x: 0.0, yaw: 0.0, glow: 1.0, ex: 0.9, heat: 0.4, dis: 1, rain: 0.85, emb: 0 },
    { sel: "#about",       az: 0.6 + TAU, el: 0.08, d: 4.4, y: 0.2, x: 0.0, yaw: 0.0, glow: 1.0, ex: 0.9, heat: 0.5, dis: 1, rain: 0.55, emb: 0 },
    { sel: "#contact",     az: TAU + 0.35, el: 0.0, d: 3.6, y: 0.4, x: 0.6, yaw: -0.5, glow: 1.4, ex: 1.0, heat: 1.0, dis: 0, rain: 0.3, emb: 0.6 },
    { sel: ".footer",      az: TAU + 0.35, el: -0.1, d: 4.4, y: 0.2, x: 0.5, yaw: -0.35, glow: 1.9, ex: 0.85, heat: 1.2, dis: 0, rain: 0.6, emb: 1 }
  ];
  const KEYS = ["az", "el", "d", "y", "x", "yaw", "glow", "ex", "heat", "dis", "rain", "emb"];
  let anchors = [];
  function measure() {
    const sy = scrollY;
    anchors = STATIONS.map((s, i) => {
      const el = document.querySelector(s.sel);
      if (!el) return null;
      const top = el.getBoundingClientRect().top + sy;
      return { s, at: i === 0 ? 0 : Math.max(0, top - innerHeight * 0.35) };
    }).filter(Boolean);
    // the dissolve finishes as the hero leaves the screen
    if (anchors[1]) anchors[1].at = Math.min(anchors[1].at, innerHeight * 0.95);
    // the robot re-forms while the contact section scrolls in
    const max = document.documentElement.scrollHeight - innerHeight;
    anchors.forEach((a) => { a.at = Math.min(a.at, max); });
  }
  measure();
  addEventListener("load", measure);

  const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const pose = {};
  const cur = {};
  function sample(y) {
    let a = anchors[0], b = anchors[0];
    for (let i = 0; i < anchors.length - 1; i++) {
      if (y >= anchors[i].at) { a = anchors[i]; b = anchors[i + 1]; }
    }
    if (y >= anchors[anchors.length - 1].at) a = b = anchors[anchors.length - 1];
    const span = Math.max(1, b.at - a.at);
    const t = a === b ? 0 : ease(MathUtils.clamp((y - a.at) / span, 0, 1));
    KEYS.forEach((k) => { pose[k] = a.s[k] + (b.s[k] - a.s[k]) * t; });
    // the dissolve tracks the scroll directly, without the smootherstep hold
    if (a !== b && (a.s.dis !== b.s.dis)) {
      const lin = MathUtils.clamp((y - a.at) / span, 0, 1);
      pose.dis = a.s.dis + (b.s.dis - a.s.dis) * lin;
    }
    return pose;
  }
  Object.assign(cur, sample(scrollY));

  /* ---------- Input ---------- */

  const mouse = new Vector2(0, 0), mouseS = new Vector2(0, 0);
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  }, { passive: true });

  addEventListener("resize", () => {
    mobile = small();
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.3 : 2));
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    backdrop.material.uniforms.uAspect.value = camera.aspect;
    VH.value = innerHeight;
    measure();
  }, { passive: true });

  /* ---------- Loop ---------- */

  const target = new Vector3(), right = new Vector3(), proj = new Vector3();
  let lastY = scrollY, vel = 0, flow = 0, mTimer = 0;
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) { t0 = performance.now(); requestAnimationFrame(loop); } });

  let t0 = performance.now(), slowFrames = 0, frames = 0;
  function loop(now) {
    if (!running) return;
    const dt = Math.min((now - t0) / 1000, 0.05);
    t0 = now;
    const time = now / 1000;
    frames++;
    if (++mTimer % 90 === 0) measure();

    const y = scrollY;
    const dy = y - lastY;
    vel = MathUtils.lerp(vel, dy, 0.1);
    lastY = y;

    const k = 1 - Math.pow(0.0015, dt);
    sample(y);
    KEYS.forEach((key) => { cur[key] += (pose[key] - cur[key]) * k; });
    // the dissolve follows the finger closely so it feels attached to the scroll
    cur.dis += (pose.dis - cur.dis) * (1 - Math.pow(0.00001, dt));

    const xShift = mobile ? 0 : cur.x;
    const dist = cur.d * (mobile ? 1.3 : 1) + Math.abs(vel) * 0.003;
    const lookY = cur.y + (mobile ? -0.05 : 0);

    // camera orbit with a little mouse parallax
    mouseS.lerp(mouse, 1 - Math.pow(0.02, dt));
    camera.position.set(
      Math.sin(cur.az) * dist + mouseS.x * 0.15,
      lookY + cur.el * dist * 0.5 - mouseS.y * 0.1,
      Math.cos(cur.az) * dist
    );
    target.set(0, lookY, 0);
    camera.lookAt(target);
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    const halfW = Math.tan(MathUtils.degToRad(camera.fov / 2)) * dist * camera.aspect;
    target.addScaledVector(right, -xShift * halfW);
    camera.position.addScaledVector(right, -xShift * halfW);
    camera.lookAt(target);
    camera.rotateZ(MathUtils.clamp(vel * 0.0005, -0.025, 0.025));

    // robot: scroll yaw, mouse follow, breathing
    rig.rotation.y = cur.yaw;
    look.rotation.y = MathUtils.lerp(look.rotation.y, mouseS.x * 0.4, 0.08);
    look.rotation.x = MathUtils.lerp(look.rotation.x, mouseS.y * 0.06, 0.08);
    look.position.y = Math.sin(time * 1.1) * 0.012;
    rig.visible = cur.dis < 0.995;

    // shared uniforms
    U.uGlow.value = cur.glow * (1 + Math.min(Math.abs(vel) * 0.02, 0.6));
    U.uTime.value = time;
    U.uWave.value = y / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    U.uDis.value = cur.dis;

    // the rain drifts up with the page and streams faster on fast scrolls
    flow += -dy * 0.0035 + Math.abs(vel) * 0.004;
    rainMat.uniforms.uTime.value = time;
    rainMat.uniforms.uFlow.value = flow;
    rainMat.uniforms.uAmt.value = cur.rain * (mobile ? 0.7 : 1);
    rain.visible = cur.rain > 0.01;

    emberMat.uniforms.uTime.value = time;
    emberMat.uniforms.uAmt.value = cur.emb;

    renderer.toneMappingExposure = cur.ex;
    bloom.strength = 0.28 + cur.glow * 0.16;
    rim.intensity = 2.2 + cur.glow * 1.0;

    proj.set(0, cur.y + 0.2, 0).project(camera);
    const bu = backdrop.material.uniforms;
    bu.uCenter.value.set(proj.x * 0.5 + 0.5, proj.y * 0.5 + 0.5);
    bu.uHeat.value = cur.heat;
    bu.uTime.value = time;

    root.style.setProperty("--heat", cur.glow.toFixed(3));
    root.style.setProperty("--dissolve", cur.dis.toFixed(3));

    composer.render(dt);

    // if the device struggles, drop bloom and resolution once
    if (frames > 30 && frames < 240) {
      if (dt > 1 / 40) slowFrames++;
      if (slowFrames > 60) {
        bloom.enabled = false;
        renderer.setPixelRatio(1);
        composer.setPixelRatio(1);
        composer.setSize(innerWidth, innerHeight);
        frames = 240;
      }
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__stage = { STATIONS, U, cur, bloom, renderer, scene, camera };
}

if (!reduce && supportsWebGL()) start();
