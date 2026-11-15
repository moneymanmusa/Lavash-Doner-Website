/* ==========================================================
   LAVASH DÖNER — hero animation (plays on its own, loops)
   - The bowl is a rendered image (assets/img/hero-bowl-art.webp)
     with animated touches: drop-in, gentle sway, steam, glints,
     and a soft 3D tilt that follows the mouse on desktop.
   - Garlic & orange sauce are drawn as liquid: overlapping blobs
     merged with an SVG "goo" filter so they pour, pool, splash
     and drip naturally. Splats land around the bowl and across
     the screen, then fade before the next pour.
   ========================================================== */
(function () {
  "use strict";
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Phones / low-power devices get a lighter version of the effects.
  const LITE = window.matchMedia("(max-width: 960px), (pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4;
  const NS = "http://www.w3.org/2000/svg";
  const TAU = Math.PI * 2;
  const f1 = (n) => Math.round(n * 10) / 10;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeBack = (t) => { const c1 = 1.7, c3 = c1 + 1; return t <= 0 ? 0 : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const lerp = (a, b, t) => a + (b - a) * t;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function circle(parent, cx, cy) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", f1(cx)); c.setAttribute("cy", f1(cy)); c.setAttribute("r", "0");
    parent.appendChild(c);
    return c;
  }

  /* ---------------- liquid ("goo") filters ---------------- */
  function gooFilter(id, sd, mul, off, dx, dy, sh) {
    if (LITE) {
      return `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${sd}" result="b"/>
        <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${mul} ${off}" result="g"/>
        <feOffset in="g" dx="${dx}" dy="${dy}" result="o"/>
        <feColorMatrix in="o" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .4 0" result="drop"/>
        <feMerge><feMergeNode in="drop"/><feMergeNode in="g"/></feMerge>
      </filter>`;
    }
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
      <feFlood flood-color="#3b1d05" flood-opacity=".25"/>
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
    ${gooFilter("goo-lg", 9, 26, -11, 4, 6, 5)}
  </defs>`;
  document.body.appendChild(filterHost);

  // creamy garlic + creamy orange sauce
  const SAUCE = { garlic: "#fff4e2", orange: "#f2801f", orangeLight: "#ffa24a" };

  /* ==========================================================
     LIQUID SAUCE
     A "pour" is a messy random-walk path inside the bowl. Sauce
     blobs are laid along it as the bottle moves; pools form where
     it lingers and droplets splash outward where the stream lands.
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
      let br = o.base * (0.74 + 0.3 * Math.sin(i * 0.115 + ph1) + 0.2 * Math.sin(i * 0.036 + ph2)) * (0.86 + r() * 0.3);
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
      if (!on && s.lr === 0) return;
      let rr = 0;
      if (on) {
        const it = 1 - t;
        const x = it * it * N[0] + 2 * it * t * C[0] + t * t * T[0] + Math.sin(time * 0.011 + j * 0.9) * 3 * t;
        const y = it * it * N[1] + 2 * it * t * C[1] + t * t * T[1];
        rr = this.sr * (0.85 + 0.2 * Math.sin(time * 0.018 + j * 1.7)) * (t > 0.92 ? 1.35 : 1) * (t < 0.06 ? 0.8 : 1);
        s.el.setAttribute("cx", f1(x)); s.el.setAttribute("cy", f1(y));
      }
      s.el.setAttribute("r", f1(rr)); s.lr = rr;
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
      drips.push({ x, y0, len, w, dots, end: circle(g, x, y0), wob: r() * 6 });
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
        c.setAttribute("cy", f1(yy));
        c.setAttribute("cx", f1(d.x + Math.sin(i * 0.35 + d.wob) * d.w * 0.25));
        c.setAttribute("r", yy - d.y0 <= L ? f1(d.w * (1 - 0.25 * (i / d.dots.length))) : "0");
      });
      d.end.setAttribute("cy", f1(d.y0 + L));
      d.end.setAttribute("cx", f1(d.x + Math.sin((L / (d.w * 0.9)) * 0.35 + d.wob) * d.w * 0.25));
      d.end.setAttribute("r", grow > 0 ? f1(d.w * 1.55) : "0");
    }
  };

  /* ==========================================================
     BUILD THE SCENE
     ========================================================== */
  const bowl = hero.querySelector("[data-bowl]");
  const tilt = hero.querySelector("[data-bowl-tilt]");
  const sauceSvg = hero.querySelector("[data-bowl-sauce]");
  const gGarlic = document.createElementNS(NS, "g"); gGarlic.setAttribute("filter", "url(#goo)"); gGarlic.setAttribute("fill", SAUCE.garlic);
  const gOrange = document.createElementNS(NS, "g"); gOrange.setAttribute("filter", "url(#goo)"); gOrange.setAttribute("fill", SAUCE.orange);
  sauceSvg.append(gGarlic, gOrange);

  // the food sits inside a circle of ~400 units around the bowl centre
  const garlic = new Pour(gGarlic, { seed: 11, x: 320, y: 300, a: 0.2, n: 380, step: 7, turn: 0.5, loop: 0.21, curl: 0.21, ph: 0, cx: 500, cy: 500, maxR: 320, base: 9.5, pool: 0.035, splash: LITE ? 0.22 : 0.38, streamN: LITE ? 20 : 30, streamR: 5.6 });
  const orange = new Pour(gOrange, { seed: 29, x: 690, y: 370, a: 2.6, n: 350, step: 7, turn: 0.62, loop: 0.25, curl: 0.19, ph: 2, cx: 500, cy: 500, maxR: 310, base: 8, pool: 0.03, splash: LITE ? 0.2 : 0.35, streamN: LITE ? 20 : 30, streamR: 5 });

  // splashes landing around the bowl (behind it)
  const bowlSplatSvg = hero.querySelector("[data-bowl-splats]");
  const bowlSplats = [
    { s: new Splat(bowlSplatSvg, 1030, 110, 70, SAUCE.garlic, 101, "goo", 2), t: 0.2 },
    { s: new Splat(bowlSplatSvg, -70, 600, 62, SAUCE.garlic, 102, "goo", 2), t: 0.26 },
    { s: new Splat(bowlSplatSvg, 800, 1010, 56, SAUCE.garlic, 103, "goo", 1), t: 0.32 },
    { s: new Splat(bowlSplatSvg, -40, 170, 64, SAUCE.orange, 104, "goo", 2), t: 0.55 },
    { s: new Splat(bowlSplatSvg, 1070, 690, 70, SAUCE.orange, 105, "goo", 2), t: 0.61 },
    { s: new Splat(bowlSplatSvg, 260, 1060, 52, SAUCE.orangeLight, 106, "goo", 1), t: 0.67 }
  ];
  // big splats across the whole screen, dripping down
  const bgSvg = hero.querySelector("[data-splats]");
  const bgDefs = [
    [1420, 170, 105, SAUCE.garlic, 201, 3, 0.29],
    [560, 120, 58, SAUCE.garlic, 202, 2, 0.33],
    [170, 760, 120, SAUCE.orange, 203, 3, 0.6],
    [1530, 560, 70, SAUCE.orange, 204, 2, 0.64],
    [930, 60, 80, SAUCE.orangeLight, 205, 3, 0.7],
    [1290, 900, 110, SAUCE.garlic, 206, 2, 0.8],
    [420, 950, 64, SAUCE.orange, 207, 2, 0.86]
  ].filter((d, i) => !LITE || [0, 2, 4, 5].includes(i));
  const bgSplats = bgDefs.map(([x, y, R, c, seed, drips, t]) => ({ s: new Splat(bgSvg, x, y, R, c, seed, "goo-lg", LITE ? Math.min(2, drips) : drips), t }));

  const bottles = { garlic: hero.querySelector("[data-bottle=garlic]"), orange: hero.querySelector("[data-bottle=orange]") };
  const tagline = hero.querySelector("[data-tagline]");
  const TAGS = ["Fresh off the spit.", "Sauced up. Loaded up.", "Garlic or orange? Both.", "Mississauga's döner spot."];
  const sauceLayers = [sauceSvg, bowlSplatSvg, bgSvg];
  const mq1 = hero.querySelector("[data-marquee]"), mq2 = hero.querySelector("[data-marquee2]");

  // timelines (fractions of one animation cycle)
  const TL = {
    garlic: { in: [0.04, 0.1], flowIn: [0.095, 0.125], pour: [0.11, 0.38], flowOut: [0.38, 0.405], out: [0.4, 0.46] },
    orange: { in: [0.42, 0.48], flowIn: [0.475, 0.505], pour: [0.49, 0.74], flowOut: [0.74, 0.765], out: [0.76, 0.82] }
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

  /* ---------------- animated touches: sway + mouse tilt ---------------- */
  let tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
  if (!LITE && !reduce && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const r = bowl.getBoundingClientRect();
      aimX = clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.9), -1, 1);
      aimY = clamp((e.clientY - (r.top + r.height / 2)) / (r.height * 0.9), -1, 1);
    });
    hero.addEventListener("pointerleave", () => { aimX = 0; aimY = 0; });
  }

  let tagIdx = 0, running = false, inView = true, lastFade = -1;
  function setTag(i) {
    if (i === tagIdx || !tagline) return;
    tagIdx = i;
    tagline.classList.add("is-out");
    setTimeout(() => { tagline.textContent = TAGS[i]; tagline.classList.remove("is-out"); }, 420);
  }

  function render(p, time, clock, fade) {
    // gentle sway (+ 3D tilt toward the mouse on desktop)
    tiltX += (aimX - tiltX) * 0.08; tiltY += (aimY - tiltY) * 0.08;
    const sway = reduce ? 0 : Math.sin(clock * 0.0007) * 1.6;
    const bob = reduce ? 0 : Math.sin(clock * 0.0011) * 0.6;
    tilt.style.transform = `perspective(1400px) rotateX(${(-tiltY * 7).toFixed(2)}deg) rotateY(${(tiltX * 7).toFixed(2)}deg) rotate(${sway.toFixed(2)}deg) translateY(${bob.toFixed(2)}%)`;

    pourScene(p, time, garlic, bottles.garlic, -1, TL.garlic);
    pourScene(p, time, orange, bottles.orange, 1, TL.orange);

    bowlSplats.forEach((b) => b.s.update(seg(p, b.t, b.t + 0.05), easeInOut(seg(p, b.t + 0.03, b.t + 0.3))));
    bgSplats.forEach((b) => b.s.update(seg(p, b.t, b.t + 0.06), easeInOut(seg(p, b.t + 0.04, b.t + 0.38))));

    // end of each loop: the sauce fades away, then it all pours again
    if (Math.abs(fade - lastFade) > 0.003) {
      sauceLayers.forEach((l) => (l.style.opacity = fade.toFixed(3)));
      lastFade = fade;
    }

    const shift = (clock * 0.0011) % 50;
    mq1.style.transform = `translateX(${(-shift).toFixed(2)}%)`;
    mq2.style.transform = `translateX(${(-50 + shift).toFixed(2)}%)`;

    setTag(p < 0.1 ? 0 : p < 0.46 ? 1 : p < 0.86 ? 2 : 3);
  }

  // One cycle: ~13s of pouring, hold the sauced bowl, fade the sauce, repeat.
  const DUR = 13000, HOLD = 4500, FADE = 900, CYCLE = DUR + HOLD + FADE;
  let clock = -1600; // let the bowl drop in first
  let last = null, lastRender = 0;
  function frame(now) {
    if (LITE && now - lastRender < 30) { if (inView && !document.hidden) requestAnimationFrame(frame); else running = false; return; }
    lastRender = now;
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
