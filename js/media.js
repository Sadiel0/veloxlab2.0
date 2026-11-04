// Mock "video" tiles: tiny live fragment shaders standing in for Higgsfield clips.
// Swap any [data-media] block for <video autoplay muted loop playsinline> once real clips exist.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

  const FRAG = `
precision highp float;
uniform vec2 r; uniform float t; uniform float m; uniform vec3 a; uniform vec3 b;

float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, s = 0.5; for (int i = 0; i < 5; i++){ v += s*n(p); p *= 2.03; s *= 0.5; } return v; }

// 0 — aurora / ad reel
vec3 aurora(vec2 uv){
  vec2 p = uv * vec2(r.x/r.y, 1.0) * 1.8;
  float q = fbm(p + vec2(t*0.06, -t*0.04));
  float w = fbm(p*1.3 + q*2.2 + vec2(t*0.09, -t*0.06));
  vec3 c = vec3(0.01, 0.012, 0.02);
  c = mix(c, a, smoothstep(0.38, 0.9, w));
  c = mix(c, b, smoothstep(0.5, 0.95, q*w*1.7));
  c += pow(smoothstep(0.6, 1.0, w), 4.0) * 0.8;
  return c;
}

// 1 — architectural push-in (featured reel)
vec3 pushin(vec2 uv){
  vec2 p = (uv - 0.5) * vec2(r.x/r.y, 1.0);
  float z = t * 0.9;
  float ay = max(abs(p.y), 0.015);
  float d = 0.35 / ay;
  vec2 g = vec2(p.x * d, d + z);
  float lx = smoothstep(0.93, 1.0, abs(sin(g.x * 3.14159)));
  float ly = smoothstep(0.965, 1.0, abs(sin(g.y * 1.6)));
  float fog = exp(-d * 0.12);
  vec3 col = mix(a, b, step(0.0, p.y));
  vec3 c = vec3(0.008, 0.01, 0.016);
  c += col * (lx * 0.7 + ly * 1.1) * fog;
  // windows on walls
  vec2 wv = floor(g * vec2(2.0, 1.0));
  float win = step(0.82, h(wv)) * step(0.15, fract(g.x*2.0)) * step(0.2, fract(g.y)) * fog;
  c += mix(b, vec3(1.0, 0.8, 0.5), 0.5) * win * 0.35;
  // horizon glow + type slab
  c += a * exp(-ay * 14.0) * 0.55 + b * exp(-ay * 40.0) * 0.4;
  float slab = smoothstep(0.012, 0.0, abs(p.y + 0.0)) * smoothstep(0.42, 0.38, abs(p.x));
  c += slab * 0.6;
  return c;
}

// 2 — UGC warm bokeh
vec3 bokeh(vec2 uv){
  float ar = r.x / r.y;
  vec2 p = uv * vec2(ar, 1.0);
  vec3 c = mix(vec3(0.03, 0.012, 0.02), vec3(0.09, 0.03, 0.02), uv.y);
  for (int i = 0; i < 16; i++){
    float fi = float(i);
    vec2 c0 = vec2(h(vec2(fi, 1.0)) * ar, fract(h(vec2(fi, 2.0)) + t * 0.025 * (0.4 + h(vec2(fi, 3.0)))) * 1.3 - 0.15);
    float rad = 0.05 + 0.13 * h(vec2(fi, 4.0));
    float d = length(p - c0);
    float k = smoothstep(rad, rad * 0.86, d) * (0.18 + 0.32 * h(vec2(fi, 5.0)));
    k += smoothstep(rad, rad*0.95, d) * smoothstep(rad*0.8, rad*0.95, d) * 0.25;
    c += mix(a, b, h(vec2(fi, 6.0))) * k;
  }
  // phone-frame silhouette (UGC vertical)
  vec2 q = abs(p - vec2(ar*0.5, 0.5)) - vec2(0.17, 0.4);
  float frame = smoothstep(0.006, 0.0, abs(max(q.x, q.y)));
  c += frame * 0.5;
  return c;
}

// 3 — kinetic slats / 3D type
vec3 slats(vec2 uv){
  vec2 p = (uv - 0.5) * vec2(r.x/r.y, 1.0);
  float ang = 0.55;
  p = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p;
  float s = p.x * 7.0 + t * 0.6;
  float idx = floor(s);
  float f = fract(s);
  float off = sin(idx * 1.7 + t * 1.2) * 0.6;
  float edge = smoothstep(0.0, 0.05, f) * smoothstep(1.0, 0.9, f);
  float shade = 0.5 + 0.5 * sin((p.y + off) * 4.0);
  float hi = pow(smoothstep(0.7, 1.0, f), 6.0);
  vec3 col = mix(a, b, step(0.5, fract(idx * 0.37 + 0.2)));
  vec3 c = col * edge * (0.08 + 0.8 * pow(shade, 3.0)) + hi * col * 0.8;
  return c;
}

// 4 — liquid chrome
vec3 chrome(vec2 uv){
  vec2 p = (uv - 0.5) * vec2(r.x/r.y, 1.0) * 3.0;
  for (int i = 1; i < 6; i++){
    float fi = float(i);
    p += vec2(0.6/fi * sin(fi*p.y + t*0.35 + 0.3*fi), 0.6/fi * sin(fi*p.x + t*0.3 + 0.7*fi));
  }
  float v = 0.5 + 0.5 * sin(p.x + p.y);
  vec3 c = mix(vec3(0.015), vec3(0.9), pow(v, 3.0));
  c = mix(c, c * a * 1.6, smoothstep(0.3, 1.0, 0.5 + 0.5*sin(p.x*1.3)));
  c += b * pow(1.0 - v, 8.0) * 0.9;
  return c;
}

// 5 — interface / dashboard screen recording
vec3 ui(vec2 uv){
  float ar = r.x / r.y;
  vec2 p = uv * vec2(ar, 1.0);
  vec3 c = vec3(0.012, 0.016, 0.022);
  // sidebar
  c += step(p.x, 0.22) * 0.02;
  // cards grid
  vec2 g = (p - vec2(0.28, 0.08)) * vec2(4.0, 3.2);
  vec2 id = floor(g); vec2 f = fract(g);
  float inside = step(0.0, g.x) * step(g.x, 5.0) * step(0.0, g.y) * step(g.y, 2.0);
  float box = step(0.06, f.x) * step(f.x, 0.94) * step(0.1, f.y) * step(f.y, 0.9);
  float pulse = step(0.6, h(id + floor(t * 0.7 + h(id) * 3.0)));
  c += inside * box * (0.03 + pulse * 0.05);
  // bar inside each card
  float bar = step(0.15, f.x) * step(f.x, 0.15 + 0.7 * h(id + floor(t*0.5))) * step(0.2, f.y) * step(f.y, 0.28);
  c += inside * bar * mix(a, b, h(id)) * 0.8;
  // live line chart on top area
  float x = p.x;
  float y = 0.78 + 0.07 * sin(x * 9.0 + t * 1.4) + 0.03 * sin(x * 23.0 - t * 2.0);
  float line = smoothstep(0.006, 0.0, abs(p.y - y)) * step(0.28, x);
  c += line * a * 1.4 + step(p.y, y) * step(0.7, p.y) * step(0.28, x) * a * 0.06;
  // sidebar rows
  float row = step(0.04, p.x) * step(p.x, 0.17) * step(0.5, fract(p.y * 14.0)) * step(fract(p.y*14.0), 0.62) * step(0.2, p.y) * step(p.y, 0.9);
  c += row * 0.12;
  float act = row * step(abs(p.y - (0.55 + 0.25 * sin(floor(t*0.5)))), 0.04);
  c += act * b * 0.8;
  // cursor
  vec2 cur = vec2(0.6 + 0.3*sin(t*0.6), 0.45 + 0.25*cos(t*0.45));
  c += smoothstep(0.01, 0.0, length(p - vec2(cur.x*ar, cur.y))) * 1.2;
  // scanline
  c += smoothstep(0.02, 0.0, abs(uv.y - fract(t * 0.15))) * 0.05;
  return c;
}

void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec3 c;
  if (m < 0.5) c = aurora(uv);
  else if (m < 1.5) c = pushin(uv);
  else if (m < 2.5) c = bokeh(uv);
  else if (m < 3.5) c = slats(uv);
  else if (m < 4.5) c = chrome(uv);
  else c = ui(uv);
  vec2 v = uv - 0.5;
  c *= 1.0 - dot(v, v) * 1.1;
  c += (h(uv * r + fract(t) * 100.0) - 0.5) * 0.045;
  gl_FragColor = vec4(max(c, 0.0), 1.0);
}`;

  const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
  const pad = (n) => String(n).padStart(2, '0');

  function setup(el) {
    const canvas = el.querySelector('canvas');
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (k) => gl.getUniformLocation(prog, k);
    const u = { r: U('r'), t: U('t'), m: U('m'), a: U('a'), b: U('b') };
    gl.uniform1f(u.m, parseFloat(el.dataset.mode || '0'));
    gl.uniform3fv(u.a, hex(el.dataset.a || '#2EF2FF'));
    gl.uniform3fv(u.b, hex(el.dataset.b || '#FF2D87'));

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
      const hgt = Math.max(2, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== hgt) { canvas.width = w; canvas.height = hgt; gl.viewport(0, 0, w, hgt); }
      gl.uniform2f(u.r, w, hgt);
    };
    new ResizeObserver(size).observe(canvas);
    size();

    const tc = el.querySelector('.tc');
    const len = parseFloat(el.dataset.len || '6');
    const state = { visible: false, time: Math.random() * 20, speed: 1, target: 1 };
    if (el.hasAttribute('data-hover')) {
      state.target = state.speed = 0.55;
      el.addEventListener('pointerenter', () => (state.target = 1.6));
      el.addEventListener('pointerleave', () => (state.target = 0.55));
    }
    const draw = (dt) => {
      state.speed += (state.target - state.speed) * 0.06;
      state.time += dt * state.speed;
      gl.uniform1f(u.t, state.time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (tc) {
        const lt = state.time % len;
        tc.textContent = `00:00:${pad(Math.floor(lt))}:${pad(Math.floor((lt % 1) * 24))}`;
      }
    };
    el.classList.add('is-live');
    return { el, state, draw };
  }

  const tiles = [];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      let tile = tiles.find((x) => x.el === en.target);
      if (en.isIntersecting && !tile) {
        tile = setup(en.target);
        if (!tile) { io.unobserve(en.target); return; }
        tiles.push(tile);
        if (reduce) tile.draw(0);
      }
      if (tile) tile.state.visible = en.isIntersecting;
    });
  }, { rootMargin: '200px 0px' });
  document.querySelectorAll('[data-media]').forEach((el) => io.observe(el));

  if (reduce) return;
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!document.hidden) tiles.forEach((tl) => tl.state.visible && tl.draw(dt));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
