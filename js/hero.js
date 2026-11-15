/* ==========================================================
   LAVASH DÖNER — full-screen hero animation
   - The döner bowl & wrap are illustrated in code (no photos),
     modelled on Lavash Döner's Döner Box: rice, shaved döner,
     lettuce, red cabbage, carrot, tomato, cucumber, pickled onion.
   - Sauce is drawn as liquid: overlapping blobs merged with an
     SVG "goo" filter, so it pools, splashes and drips naturally.
   - Everything is driven by scroll position (and a little time
     for the wobble of the stream).
   ========================================================== */
(function () {
  "use strict";
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const TAU = Math.PI * 2;
  const rad = (d) => (d * Math.PI) / 180;
  const f1 = (n) => Math.round(n * 10) / 10;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeBack = (t) => { const c1 = 1.7, c3 = c1 + 1; return t <= 0 ? 0 : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Catmull-Rom spline → cubic Bézier path
  function smooth(pts, closed) {
    const n = pts.length;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
    let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
    }
    return d + (closed ? "Z" : "");
  }

  function circle(parent, cx, cy) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", f1(cx)); c.setAttribute("cy", f1(cy)); c.setAttribute("r", "0");
    parent.appendChild(c);
    return c;
  }

  /* ---------------- liquid ("goo") filters ---------------- */
  function gooFilter(id, sd, mul, off, dx, dy, sh) {
    return `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${sd}" result="b"/>
      <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${mul} ${off}" result="g"/>
      <feOffset in="g" dx="${dx}" dy="${dy}" result="o"/>
      <feOffset in="g" dx="${-dx * 0.8}" dy="${-dy * 0.8}" result="o2"/>
      <feComposite in="g" in2="o" operator="out" result="rim"/>
      <feGaussianBlur in="rim" stdDeviation="${f1(sd * 0.22)}" result="rimb"/>
      <feFlood flood-color="#ffffff" flood-opacity=".85"/>
      <feComposite in2="rimb" operator="in"/>
      <feComposite in2="g" operator="in" result="hl"/>
      <feComposite in="g" in2="o2" operator="out" result="rim2"/>
      <feGaussianBlur in="rim2" stdDeviation="${f1(sd * 0.35)}" result="rim2b"/>
      <feFlood flood-color="#3b1d05" flood-opacity=".28"/>
      <feComposite in2="rim2b" operator="in"/>
      <feComposite in2="g" operator="in" result="shade"/>
      <feFlood flood-color="#000" flood-opacity=".42"/>
      <feComposite in2="o" operator="in"/>
      <feGaussianBlur stdDeviation="${sh}" result="drop"/>
      <feMerge><feMergeNode in="drop"/><feMergeNode in="g"/><feMergeNode in="shade"/><feMergeNode in="hl"/></feMerge>
    </filter>`;
  }
  const filterHost = document.createElementNS(NS, "svg");
  filterHost.setAttribute("width", "0"); filterHost.setAttribute("height", "0");
  filterHost.setAttribute("aria-hidden", "true");
  filterHost.style.position = "absolute";
  filterHost.innerHTML = `<defs>
    ${gooFilter("goo", 6, 24, -10, 2.6, 3.6, 3)}
    ${gooFilter("goo-sm", 3.2, 22, -9, 1.4, 2, 1.8)}
    ${gooFilter("goo-lg", 9, 26, -11, 4, 6, 5)}
    <radialGradient id="ck0" cx="50%" cy="48%" r="60%"><stop offset="0" stop-color="#f8d896"/><stop offset=".42" stop-color="#eeaf5a"/><stop offset=".78" stop-color="#cf7a2a"/><stop offset="1" stop-color="#8d4213"/></radialGradient>
    <radialGradient id="ck1" cx="45%" cy="50%" r="62%"><stop offset="0" stop-color="#f5cb80"/><stop offset=".48" stop-color="#e59a40"/><stop offset=".84" stop-color="#bb6420"/><stop offset="1" stop-color="#7a3610"/></radialGradient>
    <radialGradient id="ck2" cx="52%" cy="46%" r="58%"><stop offset="0" stop-color="#fbe5b2"/><stop offset=".4" stop-color="#f0bd6c"/><stop offset=".75" stop-color="#d88c38"/><stop offset="1" stop-color="#9a4b16"/></radialGradient>
    <radialGradient id="ck3" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#efb664"/><stop offset=".45" stop-color="#d9832e"/><stop offset=".8" stop-color="#aa5418"/><stop offset="1" stop-color="#65290b"/></radialGradient>
    <linearGradient id="ck4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a24a14"/><stop offset=".35" stop-color="#dc8b38"/><stop offset=".7" stop-color="#f6d08e"/><stop offset="1" stop-color="#e8a658"/></linearGradient>
    <linearGradient id="ck5" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#933f12"/><stop offset=".4" stop-color="#d47f30"/><stop offset=".75" stop-color="#f3c47c"/><stop offset="1" stop-color="#cf7c34"/></linearGradient>
    <radialGradient id="bf0" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#a6623a"/><stop offset=".5" stop-color="#7a3d1d"/><stop offset="1" stop-color="#3f1d0b"/></radialGradient>
    <radialGradient id="bf1" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#93532e"/><stop offset=".6" stop-color="#64301a"/><stop offset="1" stop-color="#351809"/></radialGradient>
    <radialGradient id="tom" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ff7458"/><stop offset=".55" stop-color="#d9301d"/><stop offset="1" stop-color="#9a190c"/></radialGradient>
    <filter id="meat-tex" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.5 0.12" numOctaves="2" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.2  0 0 0 0 0.05  0 0 0 -0.9 0.44" result="nt"/>
      <feComposite in="nt" in2="SourceAlpha" operator="in" result="tex"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="tex"/></feMerge>
    </filter>
  </defs>`;
  document.body.appendChild(filterHost);

  const SAUCE = { garlic: "#fff4e2", hot: "#c62a17", orange: "#fd6d14" };

  /* ==========================================================
     ILLUSTRATION — food pieces
     ========================================================== */
  // Shaved chicken döner: thin torn slices — pale juicy middle, golden-brown
  // seared edges, visible grain, a little marinade tint and crispy char.
  function meatStrip(r, x, y, len, w, beefChance = 0.06) {
    const beef = r() < beefChance;
    const grad = beef ? `bf${Math.floor(r() * 2)}` : `ck${Math.floor(r() * 6)}`;
    let a = r() * TAU;
    const N = 7, spine = [];
    let px = x - (Math.cos(a) * len) / 2, py = y - (Math.sin(a) * len) / 2;
    for (let i = 0; i < N; i++) { spine.push([px, py]); a += (r() - 0.5) * 0.38; px += (Math.cos(a) * len) / (N - 1); py += (Math.sin(a) * len) / (N - 1); }
    const L = [], R = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const p = spine[i], q = spine[Math.min(N - 1, i + 1)], o = spine[Math.max(0, i - 1)];
      let tx = q[0] - o[0], ty = q[1] - o[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const base = w * (0.42 + 0.58 * Math.sin(Math.PI * (0.03 + 0.94 * t)));
      const lw = base * (0.32 + r() * 0.26), rw = base * (0.32 + r() * 0.26);
      const jx = (r() - 0.5) * w * 0.08, jy = (r() - 0.5) * w * 0.08;
      L.push([p[0] - ty * lw + jx, p[1] + tx * lw + jy]);
      R.push([p[0] + ty * rw - jx, p[1] - tx * rw - jy]);
    }
    const d = smooth(L.concat(R.reverse()), true);
    let s = `<path d="${d}" fill="#1a0b03" opacity=".32" transform="translate(${f1(w * 0.1)} ${f1(w * 0.14)})"/>`;
    s += `<path d="${d}" fill="url(#${grad})"/>`;
    s += `<path d="${d}" fill="none" stroke="${beef ? "#241005" : "#74360e"}" stroke-width="${f1(w * 0.11)}" stroke-linejoin="round" opacity=".5"/>`;
    if (!beef) {
      // muscle grain running along the slice
      for (let k = -1; k <= 1; k++) {
        const off = k * w * 0.16 + (r() - 0.5) * w * 0.05;
        const fib = spine.slice(1, N - 1).map((p, i) => {
          const q = spine[i + 2], o = spine[i];
          let tx = q[0] - o[0], ty = q[1] - o[1]; const tl = Math.hypot(tx, ty) || 1;
          return [p[0] - (ty / tl) * off, p[1] + (tx / tl) * off];
        });
        s += `<path d="${smooth(fib, false)}" fill="none" stroke="${k === 0 ? "#f8e2b4" : "#a8642a"}" stroke-width="${f1(k === 0 ? 1.6 : 1.1)}" stroke-linecap="round" opacity="${k === 0 ? ".55" : ".32"}"/>`;
      }
      if (r() < 0.42) {
        const m = spine[2 + Math.floor(r() * 3)];
        s += `<ellipse cx="${f1(m[0])}" cy="${f1(m[1])}" rx="${f1(len * 0.26)}" ry="${f1(w * 0.22)}" fill="#d4561c" opacity=".2" transform="rotate(${Math.round((a * 180) / Math.PI)} ${f1(m[0])} ${f1(m[1])})"/>`;
      }
    }
    if (r() < 0.6) {
      const e = (r() < 0.5 ? L : R)[1 + Math.floor(r() * (N - 2))];
      const cr = w * (0.07 + r() * 0.07);
      s += `<circle cx="${f1(e[0])}" cy="${f1(e[1])}" r="${f1(cr)}" fill="#3a1a06" opacity=".7"/><circle cx="${f1(e[0] + cr)}" cy="${f1(e[1] - cr * 0.6)}" r="${f1(cr * 0.7)}" fill="#4a2209" opacity=".6"/>`;
    }
    if (r() < 0.55) {
      const g = spine[1 + Math.floor(r() * (N - 2))];
      s += `<ellipse cx="${f1(g[0])}" cy="${f1(g[1])}" rx="${f1(w * 0.16)}" ry="${f1(w * 0.06)}" fill="#fff6dc" opacity=".55" transform="rotate(${Math.round((a * 180) / Math.PI)} ${f1(g[0])} ${f1(g[1])})"/>`;
    }
    return s;
  }
  function shred(r, x, y, len, w, color, vein, veinW = 0.22, veinO = 0.7) {
    const a = r() * TAU;
    const x1 = x + Math.cos(a) * len, y1 = y + Math.sin(a) * len;
    const mx = (x + x1) / 2 - Math.sin(a) * (r() - 0.5) * len * 0.9;
    const my = (y + y1) / 2 + Math.cos(a) * (r() - 0.5) * len * 0.9;
    const d = `M${f1(x)},${f1(y)}Q${f1(mx)},${f1(my)} ${f1(x1)},${f1(y1)}`;
    let s = `<path d="${d}" stroke="${color}" stroke-width="${f1(w)}" stroke-linecap="round" fill="none"/>`;
    if (vein) s += `<path d="${d}" stroke="${vein}" stroke-width="${f1(w * veinW)}" stroke-linecap="round" fill="none" opacity="${veinO}"/>`;
    return s;
  }
  function tomato(r, x, y, sz) {
    const a = Math.round(r() * 90);
    return `<g transform="rotate(${a} ${f1(x)} ${f1(y)})">
      <rect x="${f1(x - sz / 2)}" y="${f1(y - sz / 2)}" width="${f1(sz)}" height="${f1(sz)}" rx="${f1(sz * 0.28)}" fill="url(#tom)" stroke="#8c1508" stroke-width="1.5"/>
      <rect x="${f1(x - sz / 2 + sz * 0.14)}" y="${f1(y - sz / 2 + sz * 0.12)}" width="${f1(sz * 0.48)}" height="${f1(sz * 0.26)}" rx="${f1(sz * 0.12)}" fill="#ff8264" opacity=".6"/>
      <ellipse cx="${f1(x + sz * 0.12)}" cy="${f1(y + sz * 0.14)}" rx="${f1(sz * 0.2)}" ry="${f1(sz * 0.12)}" fill="#f6b46a" opacity=".75"/>
    </g>`;
  }
  function cucumber(r, x, y, rr) {
    let s = `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}" fill="#d3e9a8" stroke="#2c6a20" stroke-width="${f1(rr * 0.2)}"/>`;
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr * 0.55)}" fill="#bad987"/>`;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + r();
      s += `<ellipse cx="${f1(x + Math.cos(a) * rr * 0.32)}" cy="${f1(y + Math.sin(a) * rr * 0.32)}" rx="${f1(rr * 0.12)}" ry="${f1(rr * 0.06)}" fill="#f1f8de" transform="rotate(${Math.round((a * 180) / Math.PI)} ${f1(x + Math.cos(a) * rr * 0.32)} ${f1(y + Math.sin(a) * rr * 0.32)})"/>`;
    }
    return s;
  }
  function onion(r, x, y, rx) {
    const ry = rx * (0.6 + r() * 0.3), a = Math.round(r() * 180);
    return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="none" stroke="#d9588a" stroke-width="${f1(rx * 0.22)}" transform="rotate(${a} ${f1(x)} ${f1(y)})"/>` +
      `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="none" stroke="#f6b3cc" stroke-width="${f1(rx * 0.07)}" transform="rotate(${a} ${f1(x)} ${f1(y)})"/>`;
  }
  function sector(r, a0, a1, r0, r1, cx = 500, cy = 500) {
    const pts = [], n = 30;
    for (let i = 0; i <= n; i++) { const a = rad(a0 + ((a1 - a0) * i) / n), rr = r1 * (0.97 + r() * 0.05); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    for (let i = n; i >= 0; i--) { const a = rad(a0 + ((a1 - a0) * i) / n), rr = r0 * (0.8 + r() * 0.4); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    return smooth(pts, true);
  }
  const polar = (r, a0, a1, r0, r1, cx = 500, cy = 500) => {
    const a = rad(a0 + r() * (a1 - a0));
    const rr = Math.sqrt(r0 * r0 + r() * (r1 * r1 - r0 * r0));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  };

  /* ---------------- the döner bowl (top-down) ---------------- */
  function buildBowl(svg) {
    const r = rng(1907);
    let s = `<defs>
      <radialGradient id="bw-out" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#2c2c2c"/><stop offset=".65" stop-color="#121212"/><stop offset="1" stop-color="#040404"/></radialGradient>
      <radialGradient id="bw-in" cx="50%" cy="50%" r="50%"><stop offset=".8" stop-color="#141414"/><stop offset="1" stop-color="#030303"/></radialGradient>
      <radialGradient id="bw-depth" cx="50%" cy="50%" r="50%"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
      <radialGradient id="bw-pile" cx="50%" cy="50%" r="50%"><stop offset=".72" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <radialGradient id="bw-light" cx="40%" cy="36%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <clipPath id="bw-food"><circle cx="500" cy="500" r="420"/></clipPath>
      <path id="bw-ring" d="M500,500 m-467,0 a467,467 0 1,1 934,0 a467,467 0 1,1 -934,0"/>
    </defs>`;
    s += `<circle cx="500" cy="500" r="494" fill="url(#bw-out)"/>`;
    s += `<path d="${describeArc(500, 500, 489, 195, 300)}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="5" stroke-linecap="round"/>`;
    s += `<text class="bw-ring"><textPath href="#bw-ring">${"LAVASH DÖNER  •  TURKISH CUISINE  •  100% HALAL  •  ".repeat(3)}</textPath></text>`;
    s += `<circle cx="500" cy="500" r="442" fill="url(#bw-in)"/>`;

    s += `<g clip-path="url(#bw-food)">`;
    s += `<circle cx="500" cy="500" r="420" fill="#2f4d1b"/>`;

    // salad bed: lettuce, red cabbage, carrot
    let salad = `<g class="ing ing--salad"><path d="${sector(r, -6, 238, 70, 428)}" fill="#5f8f2c"/>`;
    for (let i = 0; i < 230; i++) { const [x, y] = polar(r, -6, 238, 110, 418); salad += shred(r, x, y, 34 + r() * 40, 13 + r() * 9, pick(r, ["#86bd4c", "#79b23f", "#9ccd5e", "#6ea838"]), pick(r, ["#e6f4c8", "#d9eeb0", "#f0f8de", "#cfe8a2"]), 0.58, 0.95); }
    for (let i = 0; i < 95; i++) { const [x, y] = polar(r, 100, 236, 150, 415); salad += shred(r, x, y, 30 + r() * 36, 7 + r() * 4, pick(r, ["#5e1a4c", "#7a2563", "#923878"]), "#ecc9e4", 0.3, 0.55); }
    for (let i = 0; i < 55; i++) { const [x, y] = polar(r, 40, 236, 160, 410); salad += shred(r, x, y, 28 + r() * 30, 4 + r() * 1.6, pick(r, ["#ff9a2e", "#f57f17", "#ffb04d"])); }
    salad += `</g>`;

    // seasoned rice
    let rice = `<g class="ing ing--rice"><path d="${sector(r, -130, -2, 90, 428)}" fill="#ead3a0"/>`;
    for (let i = 0; i < 700; i++) {
      const [x, y] = polar(r, -128, -4, 100, 420);
      const c = r() < 0.16 ? pick(r, ["#f0c06e", "#e8a95a", "#f3cd86"]) : pick(r, ["#fff7e2", "#f8ecd0", "#f1dfb5", "#fbf3df", "#e9d09a"]);
      rice += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(9 + r() * 3)}" ry="${f1(4.2 + r() * 1.2)}" fill="${c}" stroke="rgba(130,90,35,.3)" stroke-width="1" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})"/>`;
    }
    rice += `</g>`;

    // veggies on top of the salad
    let veg = `<g class="ing ing--veg">`;
    for (let i = 0; i < 16; i++) { const [x, y] = polar(r, 14, 96, 250, 395); veg += tomato(r, x, y, 46 + r() * 14); }
    for (let i = 0; i < 8; i++) { const [x, y] = polar(r, 160, 236, 255, 385); veg += cucumber(r, x, y, 27 + r() * 7); }
    for (let i = 0; i < 13; i++) { const [x, y] = polar(r, -2, 232, 230, 400); veg += onion(r, x, y, 20 + r() * 12); }
    veg += `</g>`;

    // shaved döner piled in the middle
    const strips = [];
    for (let i = 0; i < 330; i++) {
      const a = r() * TAU, rr = 248 * Math.sqrt(r());
      strips.push({ x: 478 + Math.cos(a) * rr * 1.06, y: 474 + Math.sin(a) * rr * 0.94, d: rr });
    }
    for (let i = 0; i < 26; i++) { const a = rad(-40 + r() * 120), rr = 250 + r() * 60; strips.push({ x: 478 + Math.cos(a) * rr, y: 474 + Math.sin(a) * rr, d: rr }); }
    strips.sort((p, q) => q.d - p.d);
    let meat = `<circle cx="492" cy="492" r="300" fill="url(#bw-pile)"/><g class="ing ing--meat"><g filter="url(#meat-tex)"><path d="${sector(r, 0, 360, 0, 258, 478, 474)}" fill="#c27a32"/>`;
    strips.forEach((m) => { meat += meatStrip(r, m.x, m.y, 58 + r() * 36, 30 + r() * 16); });
    meat += `</g>`;
    meat += `<circle cx="470" cy="455" r="290" fill="url(#bw-light)"/>`;
    for (let i = 0; i < 34; i++) { const [x, y] = polar(r, 0, 360, 0, 240, 478, 474); meat += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(4 + r() * 6)}" ry="${f1(2 + r() * 2)}" fill="#fff" opacity="${f1(0.18 + r() * 0.25)}" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})"/>`; }
    meat += `</g>`;

    // garnish: parsley + sumac
    let gar = `<g class="ing ing--garnish">`;
    for (let i = 0; i < 95; i++) {
      const [x, y] = polar(r, 0, 360, 0, 380);
      const s1 = 3 + r() * 4;
      gar += `<path d="M${f1(x)},${f1(y - s1)}L${f1(x + s1)},${f1(y)}L${f1(x)},${f1(y + s1 * 0.8)}L${f1(x - s1 * 0.9)},${f1(y)}Z" fill="${pick(r, ["#2f7d1e", "#3f9a2a", "#256a16"])}"/>`;
    }
    for (let i = 0; i < 150; i++) { const [x, y] = polar(r, 0, 360, 0, 400); gar += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.6 + r() * 1.8)}" fill="#8f1d14" opacity=".85"/>`; }
    gar += `</g>`;

    s += salad + rice + veg + meat + gar;
    s += `<circle cx="500" cy="500" r="420" fill="url(#bw-depth)"/>`;
    s += `</g>`;
    s += `<circle cx="500" cy="500" r="432" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="22"/>`;
    svg.innerHTML = s;
  }
  function describeArc(cx, cy, rr, a0, a1) {
    const p0 = [cx + Math.cos(rad(a0)) * rr, cy + Math.sin(rad(a0)) * rr];
    const p1 = [cx + Math.cos(rad(a1)) * rr, cy + Math.sin(rad(a1)) * rr];
    return `M${f1(p0[0])},${f1(p0[1])}A${rr},${rr} 0 0 1 ${f1(p1[0])},${f1(p1[1])}`;
  }

  /* ---------------- the döner wrap (front view) ---------------- */
  function buildWrap(svg) {
    const r = rng(4242);
    let s = `<defs>
      <linearGradient id="wr-bread" x1="0" x2="1"><stop offset="0" stop-color="#c88c4c"/><stop offset=".42" stop-color="#f3d7a2"/><stop offset=".7" stop-color="#e7bf82"/><stop offset="1" stop-color="#b97a3c"/></linearGradient>
      <linearGradient id="wr-paper" x1="0" x2="1"><stop offset="0" stop-color="#040404"/><stop offset=".45" stop-color="#232323"/><stop offset="1" stop-color="#050505"/></linearGradient>
    </defs>`;
    s += `<path d="M24,150 C18,270 42,430 100,550 L220,550 C278,430 302,270 296,150 Z" fill="url(#wr-bread)"/>`;
    for (let i = 0; i < 26; i++) {
      const x = 40 + r() * 240, y = 168 + r() * 95;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(5 + r() * 10)}" ry="${f1(3 + r() * 5)}" fill="#a9652a" opacity="${f1(0.3 + r() * 0.35)}"/>`;
    }
    s += `<ellipse cx="160" cy="150" rx="136" ry="42" fill="#2a1406"/>`;
    // filling piled out of the top
    let back = "", mid = "", front = "";
    const inPile = () => { const a = r() * TAU, k = Math.sqrt(r()); return [160 + Math.cos(a) * 118 * k, 146 + Math.sin(a) * 30 * k - r() * 48]; };
    for (let i = 0; i < 30; i++) { const [x, y] = inPile(); back += shred(r, x, y - 10, 22 + r() * 22, 7 + r() * 3, pick(r, ["#d9ecb2", "#b9dd84", "#9ccb5c", "#e9f5d1"]), "#f6fbe9"); }
    for (let i = 0; i < 16; i++) { const [x, y] = inPile(); back += shred(r, x, y, 18 + r() * 18, 4.5 + r() * 2, pick(r, ["#6a1d55", "#842a6c", "#a3447f"])); }
    const ms = [];
    for (let i = 0; i < 46; i++) { const [x, y] = inPile(); ms.push([x, y]); }
    ms.sort((p, q) => p[1] - q[1]).forEach(([x, y]) => { mid += meatStrip(r, x, y, 34 + r() * 22, 15 + r() * 7); });
    for (let i = 0; i < 7; i++) { const [x, y] = inPile(); front += tomato(r, x, y + 8, 16 + r() * 6); }
    for (let i = 0; i < 4; i++) { const [x, y] = inPile(); front += onion(r, x, y + 6, 10 + r() * 5); }
    s += back + `<g filter="url(#meat-tex)">` + mid + `</g>` + front;
    // front lip of the bread
    s += `<path d="M24,150 A136,42 0 0 0 296,150 L296,166 A136,48 0 0 1 24,166 Z" fill="#eecb90" stroke="#b9793a" stroke-width="2"/>`;
    // branded paper sleeve
    s += `<path d="M10,262 Q160,232 310,262 L274,552 Q160,568 46,552 Z" fill="url(#wr-paper)"/>`;
    s += `<path d="M14,264 Q160,236 306,264" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/>`;
    s += `<path d="M58,300 L82,540 M262,300 L240,540" stroke="rgba(255,255,255,.05)" stroke-width="5"/>`;
    s += `<text x="148" y="372" text-anchor="middle" class="wr-logo">LAVASH</text>`;
    s += `<text x="148" y="414" text-anchor="middle" class="wr-logo">DÖNER</text>`;
    s += `<use href="#i-doner" x="226" y="336" width="26" height="80" style="color:#fd6d14"/>`;
    s += `<text x="160" y="446" text-anchor="middle" class="wr-tag">TURKISH CUISINE</text>`;
    s += `<g filter="url(#goo-sm)" fill="${SAUCE.garlic}" data-wrap-garlic></g>`;
    s += `<g filter="url(#goo-sm)" fill="${SAUCE.hot}" data-wrap-hot></g>`;
    svg.innerHTML = s;
  }

  /* ==========================================================
     LIQUID SAUCE
     A "pour" is a messy random-walk path. Sauce blobs are laid
     along it as the bottle moves; pools form where it lingers
     and droplets splash outward where the stream lands.
     ========================================================== */
  function Pour(group, o) {
    const r = rng(o.seed);
    const pts = [];
    let x = o.x, y = o.y, a = o.a;
    for (let i = 0; i < o.n; i++) {
      a += (r() - 0.5) * o.turn + Math.sin(i * o.loop + o.ph) * o.curl;
      const dx = x - o.cx, dy = y - o.cy, d = Math.hypot(dx, dy);
      if (d > o.maxR) { const to = Math.atan2(-dy, -dx); a += Math.atan2(Math.sin(to - a), Math.cos(to - a)) * 0.5; }
      const st = o.step * (0.6 + r() * 0.8);
      x += Math.cos(a) * st; y += Math.sin(a) * st;
      pts.push([x, y]);
    }
    this.pts = pts; this.n = pts.length;
    const ph1 = r() * 6, ph2 = r() * 6;
    const blobs = (this.blobs = []);
    const add = (kind, bx, by, br, i, spread, ox = 0, oy = 0) => blobs.push({ el: circle(group, bx, by), kind, x: bx, y: by, r: br, i, spread, ox, oy, lr: -1, lx: bx, ly: by });
    pts.forEach((p, i) => {
      let br = o.base * (0.72 + 0.32 * Math.sin(i * 0.23 + ph1) + 0.22 * Math.sin(i * 0.071 + ph2)) * (0.8 + r() * 0.45);
      br = Math.max(o.base * 0.32, br);
      add("line", p[0], p[1], br, i, 1.2);
      if (r() < o.pool) {
        for (let k = 0; k < 2; k++) add("pool", p[0] + (r() - 0.5) * br * 1.8, p[1] + (r() - 0.5) * br * 1.8, br * (1.25 + r() * 0.8), i, 4);
      }
      if (i % 2 === 0 && r() < o.splash) {
        const cnt = 1 + Math.floor(r() * 2.6);
        for (let k = 0; k < cnt; k++) {
          const ang = r() * TAU, dist = o.base * (1.8 + r() * 5.2);
          add("drop", p[0], p[1], o.base * (0.14 + r() * 0.34), i, 5 + r() * 4, Math.cos(ang) * dist, Math.sin(ang) * dist);
        }
      }
    });
    this.stream = [];
    for (let j = 0; j < (o.streamN || 0); j++) this.stream.push({ el: circle(group, 0, 0), lr: -1 });
    this.sr = o.streamR || 0;
  }
  Pour.prototype.update = function (u) {
    const head = u * (this.n + 2);
    for (const b of this.blobs) {
      const k = clamp((head - b.i) / b.spread);
      let rr, x = b.x, y = b.y;
      if (b.kind === "drop") {
        const e = easeOut(k);
        rr = k > 0 ? b.r * (0.55 + 0.45 * e) : 0;
        x = b.x + b.ox * e; y = b.y + b.oy * e;
      } else {
        rr = b.r * easeOut(k);
      }
      if (Math.abs(rr - b.lr) > 0.05) { b.el.setAttribute("r", f1(rr)); b.lr = rr; }
      if (b.kind === "drop" && (Math.abs(x - b.lx) > 0.1 || Math.abs(y - b.ly) > 0.1)) {
        b.el.setAttribute("cx", f1(x)); b.el.setAttribute("cy", f1(y)); b.lx = x; b.ly = y;
      }
    }
  };
  Pour.prototype.tip = function (u) {
    const f = clamp(u * (this.n - 1), 0, this.n - 1), i = Math.floor(f), t = f - i;
    const p = this.pts[i], q = this.pts[Math.min(this.n - 1, i + 1)];
    return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  };
  // stream = blobs along a falling (quadratic) arc from the nozzle to the tip
  Pour.prototype.updateStream = function (s1, s0, N, C, T, time) {
    const m = this.stream.length;
    this.stream.forEach((s, j) => {
      const t = j / (m - 1);
      const on = t <= s1 && t >= s0 && s1 > 0;
      let rr = 0, x = 0, y = 0;
      if (on) {
        const it = 1 - t;
        x = it * it * N[0] + 2 * it * t * C[0] + t * t * T[0];
        y = it * it * N[1] + 2 * it * t * C[1] + t * t * T[1];
        x += Math.sin(time * 0.011 + j * 0.9) * 3 * t;
        rr = this.sr * (0.85 + 0.2 * Math.sin(time * 0.018 + j * 1.7)) * (t > 0.92 ? 1.35 : 1) * (t < 0.06 ? 0.8 : 1);
      }
      if (!on && s.lr === 0) return;
      s.el.setAttribute("r", f1(rr)); s.lr = on ? rr : 0;
      if (on) { s.el.setAttribute("cx", f1(x)); s.el.setAttribute("cy", f1(y)); }
    });
  };

  /* ---------------- splats with running drips ---------------- */
  function Splat(parent, cx, cy, R, color, seed, filter, nDrips) {
    const r = rng(seed);
    const outer = document.createElementNS(NS, "g");
    outer.setAttribute("filter", `url(#${filter})`); outer.setAttribute("fill", color);
    const g = document.createElementNS(NS, "g");
    outer.appendChild(g); parent.appendChild(outer);
    const C = (x, y, rr) => { const c = circle(g, x, y); c.setAttribute("r", f1(rr)); return c; };
    C(cx, cy, R * 0.62);
    const lobes = 7 + Math.floor(r() * 5);
    for (let i = 0; i < lobes; i++) { const a = r() * TAU, d = R * (0.3 + r() * 0.45); C(cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * (0.24 + r() * 0.26)); }
    const arms = 4 + Math.floor(r() * 4);
    for (let i = 0; i < arms; i++) {
      const a = r() * TAU, len = R * (1.1 + r() * 1.1), segs = 6;
      for (let k = 0; k <= segs; k++) {
        const t = k / segs, d = R * 0.55 + len * t;
        C(cx + Math.cos(a + (r() - 0.5) * 0.08) * d, cy + Math.sin(a) * d, R * (0.2 - 0.15 * t) * (0.8 + r() * 0.4));
      }
      C(cx + Math.cos(a) * (R * 0.6 + len * 1.12), cy + Math.sin(a) * (R * 0.6 + len * 1.12), R * 0.09);
    }
    for (let i = 0; i < 16; i++) { const a = r() * TAU, d = R * (1.3 + r() * 1.5); C(cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * (0.025 + r() * 0.075)); }
    const drips = [];
    for (let i = 0; i < nDrips; i++) {
      const x = cx + (r() - 0.5) * R * 1.1, y0 = cy + R * (0.2 + r() * 0.3);
      const len = R * (1.2 + r() * 2.4), w = R * (0.07 + r() * 0.05);
      const n = Math.ceil(len / (w * 0.9));
      const dots = []; for (let k = 0; k < n; k++) dots.push(circle(g, x, y0));
      drips.push({ x, y0, len, w, dots, end: circle(g, x, y0), last: -1, wob: r() * 6 });
    }
    this.outer = outer; this.g = g; this.cx = cx; this.cy = cy; this.drips = drips; this.ls = -1; this.lg = -1;
    outer.style.opacity = "0";
  }
  Splat.prototype.update = function (k, grow) {
    const sc = easeBack(k);
    if (Math.abs(sc - this.ls) > 0.002) {
      this.g.setAttribute("transform", `translate(${f1(this.cx)} ${f1(this.cy)}) scale(${sc.toFixed(3)}) translate(${f1(-this.cx)} ${f1(-this.cy)})`);
      this.outer.style.opacity = k > 0 ? "1" : "0";
      this.ls = sc;
    }
    if (Math.abs(grow - this.lg) < 0.002) return;
    this.lg = grow;
    for (const d of this.drips) {
      const L = d.len * grow;
      d.dots.forEach((c, i) => {
        const yy = d.y0 + i * d.w * 0.9;
        const on = yy - d.y0 <= L;
        c.setAttribute("cy", f1(yy));
        c.setAttribute("cx", f1(d.x + Math.sin(i * 0.35 + d.wob) * d.w * 0.25));
        c.setAttribute("r", on ? f1(d.w * (1 - 0.25 * (i / d.dots.length))) : "0");
      });
      d.end.setAttribute("cy", f1(d.y0 + L));
      d.end.setAttribute("cx", f1(d.x + Math.sin(L / (d.w * 0.9) * 0.35 + d.wob) * d.w * 0.25));
      d.end.setAttribute("r", grow > 0 ? f1(d.w * 1.55) : "0");
    }
  };

  /* ==========================================================
     BUILD THE SCENE
     ========================================================== */
  const bowl = hero.querySelector("[data-bowl]");
  buildBowl(hero.querySelector("[data-bowl-art]"));
  buildWrap(hero.querySelector("[data-wrap-art]"));

  const sauceSvg = hero.querySelector("[data-bowl-sauce]");
  const gGarlic = document.createElementNS(NS, "g"); gGarlic.setAttribute("filter", "url(#goo)"); gGarlic.setAttribute("fill", SAUCE.garlic);
  const gHot = document.createElementNS(NS, "g"); gHot.setAttribute("filter", "url(#goo)"); gHot.setAttribute("fill", SAUCE.hot);
  sauceSvg.append(gGarlic, gHot);

  const garlic = new Pour(gGarlic, { seed: 11, x: 300, y: 330, a: 0.2, n: 170, step: 15, turn: 0.75, loop: 0.42, curl: 0.42, ph: 0, cx: 490, cy: 485, maxR: 330, base: 13.5, pool: 0.08, splash: 0.75, streamN: 30, streamR: 7.5 });
  const hot = new Pour(gHot, { seed: 29, x: 700, y: 360, a: 2.6, n: 150, step: 15, turn: 0.95, loop: 0.5, curl: 0.38, ph: 2, cx: 490, cy: 490, maxR: 320, base: 9.5, pool: 0.06, splash: 0.7, streamN: 30, streamR: 5.6 });

  const wrapGarlic = new Pour(hero.querySelector("[data-wrap-garlic]"), { seed: 5, x: 55, y: 120, a: -0.2, n: 60, step: 7, turn: 0.9, loop: 0.55, curl: 0.5, ph: 1, cx: 160, cy: 118, maxR: 95, base: 6.5, pool: 0.08, splash: 0.6 });
  const wrapHot = new Pour(hero.querySelector("[data-wrap-hot]"), { seed: 8, x: 250, y: 110, a: 3.0, n: 50, step: 7, turn: 1.0, loop: 0.6, curl: 0.45, ph: 3, cx: 160, cy: 115, maxR: 90, base: 4.8, pool: 0.06, splash: 0.6 });

  // splashes landing around the bowl (behind it)
  const bowlSplatSvg = hero.querySelector("[data-bowl-splats]");
  const bowlSplats = [
    { s: new Splat(bowlSplatSvg, 1030, 110, 70, SAUCE.garlic, 101, "goo", 2), t: 0.2 },
    { s: new Splat(bowlSplatSvg, -70, 600, 62, SAUCE.garlic, 102, "goo", 2), t: 0.26 },
    { s: new Splat(bowlSplatSvg, 800, 1010, 56, SAUCE.garlic, 103, "goo", 1), t: 0.32 },
    { s: new Splat(bowlSplatSvg, -40, 170, 64, SAUCE.hot, 104, "goo", 2), t: 0.5 },
    { s: new Splat(bowlSplatSvg, 1070, 690, 70, SAUCE.hot, 105, "goo", 2), t: 0.55 },
    { s: new Splat(bowlSplatSvg, 260, 1060, 52, SAUCE.orange, 106, "goo", 1), t: 0.6 }
  ];
  // big splats across the whole screen, dripping down
  const bgSvg = hero.querySelector("[data-splats]");
  const bgSplats = [
    { s: new Splat(bgSvg, 1420, 170, 105, SAUCE.garlic, 201, "goo-lg", 3), t: 0.29 },
    { s: new Splat(bgSvg, 560, 120, 58, SAUCE.garlic, 202, "goo-lg", 2), t: 0.33 },
    { s: new Splat(bgSvg, 170, 760, 120, SAUCE.hot, 203, "goo-lg", 3), t: 0.55 },
    { s: new Splat(bgSvg, 1530, 560, 70, SAUCE.hot, 204, "goo-lg", 2), t: 0.59 },
    { s: new Splat(bgSvg, 930, 60, 80, SAUCE.orange, 205, "goo-lg", 3), t: 0.7 },
    { s: new Splat(bgSvg, 1290, 900, 110, SAUCE.garlic, 206, "goo-lg", 2), t: 0.83 },
    { s: new Splat(bgSvg, 420, 950, 64, SAUCE.orange, 207, "goo-lg", 2), t: 0.88 }
  ];

  const bottles = { garlic: hero.querySelector("[data-bottle=garlic]"), hot: hero.querySelector("[data-bottle=hot]") };
  const wrap = hero.querySelector("[data-wrap]");
  const tagline = hero.querySelector("[data-tagline]");
  const TAGS = ["Fresh off the spit.", "Sauced up. Loaded up.", "Wrapped in warm lavash.", "Mississauga's döner spot."];
  const sauceLayers = [sauceSvg, bowlSplatSvg, bgSvg];
  const mq1 = hero.querySelector("[data-marquee]"), mq2 = hero.querySelector("[data-marquee2]");

  // timelines (fractions of one animation cycle)
  const TL = {
    garlic: { in: [0.04, 0.1], flowIn: [0.095, 0.125], pour: [0.11, 0.36], flowOut: [0.36, 0.385], out: [0.38, 0.44] },
    hot: { in: [0.37, 0.43], flowIn: [0.425, 0.455], pour: [0.44, 0.63], flowOut: [0.63, 0.655], out: [0.65, 0.71] }
  };

  function pourScene(p, time, pour, bottle, side, tl) {
    const u = seg(p, tl.pour[0], tl.pour[1]);
    pour.update(u);
    const T = pour.tip(u);
    const inT = easeOut(seg(p, tl.in[0], tl.in[1]));
    const outT = easeInOut(seg(p, tl.out[0], tl.out[1]));
    const pouring = u > 0 && u < 1;
    // nozzle sits up and to the side of where the sauce lands
    const off = [side * 175, -215];
    const away = [side * 700, -620];
    const wob = pouring ? Math.sin(time * 0.007) * 7 : 0;
    const Nx = T[0] + off[0] + away[0] * (1 - inT) + away[0] * outT + wob;
    const Ny = T[1] + off[1] + away[1] * (1 - inT) + away[1] * outT;
    const op = inT * (1 - outT);
    bottle.style.opacity = op.toFixed(3);
    if (op > 0) {
      bottle.style.left = ((Nx - 75) / 10).toFixed(2) + "%";
      bottle.style.top = ((Ny - 297) / 10).toFixed(2) + "%";
      const squeeze = pouring ? 0.05 + Math.sin(time * 0.012) * 0.03 : 0;
      bottle.style.transform = `rotate(${(side * 60 + Math.sin(time * 0.004) * 3).toFixed(2)}deg) scale(${(1 - squeeze).toFixed(3)}, ${(1 + squeeze * 0.4).toFixed(3)})`;
    }
    const dir = [-side * 0.866, 0.5];
    const C = [Nx + dir[0] * 125, Ny + dir[1] * 125];
    pour.updateStream(seg(p, tl.flowIn[0], tl.flowIn[1]), seg(p, tl.flowOut[0], tl.flowOut[1]), [Nx, Ny], C, T, time);
  }

  let tagIdx = 0, running = false, inView = true, lastFade = -1;

  function setTag(i) {
    if (i === tagIdx || !tagline) return;
    tagIdx = i;
    tagline.classList.add("is-out");
    setTimeout(() => { tagline.textContent = TAGS[i]; tagline.classList.remove("is-out"); }, 420);
  }

  function render(p, time, clock, fade) {
    pourScene(p, time, garlic, bottles.garlic, -1, TL.garlic);
    pourScene(p, time, hot, bottles.hot, 1, TL.hot);

    bowlSplats.forEach((b) => b.s.update(seg(p, b.t, b.t + 0.05), easeInOut(seg(p, b.t + 0.03, b.t + 0.3))));
    bgSplats.forEach((b) => b.s.update(seg(p, b.t, b.t + 0.06), easeInOut(seg(p, b.t + 0.04, b.t + 0.38))));

    // the wrap flies in and gets sauced too
    const w = easeOut(seg(p, 0.64, 0.77));
    wrap.style.opacity = (w * fade).toFixed(3);
    wrap.style.transform = `translate(calc(-50% + ${lerp(60, 0, w).toFixed(2)}vw), calc(-50% + ${lerp(20, 0, w).toFixed(2)}vh)) rotate(${(lerp(40, -14, w) + Math.sin(time * 0.0012) * 1.5).toFixed(2)}deg)`;
    wrapGarlic.update(seg(p, 0.74, 0.86));
    wrapHot.update(seg(p, 0.82, 0.93));

    // end of each loop: the sauce fades away, then it all pours again
    if (Math.abs(fade - lastFade) > 0.003) {
      sauceLayers.forEach((l) => (l.style.opacity = fade.toFixed(3)));
      lastFade = fade;
    }

    const shift = (clock * 0.0011) % 50;
    mq1.style.transform = `translateX(${(-shift).toFixed(2)}%)`;
    mq2.style.transform = `translateX(${(-50 + shift).toFixed(2)}%)`;

    setTag(p < 0.1 ? 0 : p < 0.66 ? 1 : p < 0.92 ? 2 : 3);
  }

  // One cycle: ~14s of pouring, hold the finished bowl, fade the sauce, repeat.
  const DUR = 14000, HOLD = 4500, FADE = 900, CYCLE = DUR + HOLD + FADE;
  let clock = -1900; // let the bowl assemble itself first
  let last = null;
  function frame(now) {
    if (last === null) last = now;
    clock += Math.min(250, now - last);
    last = now;
    const tc = clock < 0 ? clock : clock % CYCLE;
    const p = clamp(tc / DUR);
    const fade = tc > DUR + HOLD ? clamp(1 - (tc - DUR - HOLD) / FADE) : 1;
    render(p, now, clock, fade);
    if (inView && !reduce && !document.hidden) requestAnimationFrame(frame);
    else running = false;
  }
  function start() { if (!running) { running = true; last = null; requestAnimationFrame(frame); } }

  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) start(); }).observe(hero);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && inView) start(); });
  hero.seekAnimation = (ms) => { clock = ms; }; // handy for testing the timeline
  if (reduce) { render(1, 0, 0, 1); if (tagline) tagline.textContent = TAGS[3]; return; }
  start();
})();
