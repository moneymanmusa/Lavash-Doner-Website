/* ==========================================================
   LAVASH DÖNER — site script
   ========================================================== */
(function () {
  "use strict";

  const CFG = window.LAVASH_CONFIG || {};
  const MENU = window.LAVASH_MENU || [];
  const REVIEWS = window.LAVASH_REVIEWS || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVGNS = "http://www.w3.org/2000/svg";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* ---------------- Instagram posts (real @lavash_doner posts) ---------------- */
  const INSTA = [
    { code: "DfsE8SUiN1d", type: "p", cap: "Special Döner Box 🔥 11AM–4PM, weekdays only." },
    { code: "DfptVvvgFvG", type: "reel", cap: "Adana kebab hitting the grill. Smell that? 🔥" },
    { code: "Dfh1mklEkbM", type: "p", cap: "Chicken Döner Box + pop — lunch, sorted." },
    { code: "Db0z95eAnmO", type: "reel", cap: "The taste of döner, sliced fresh off the spit." },
    { code: "DQPMIVbgdOS", type: "reel", cap: "Halal meats. Unmatched taste." },
    { code: "DY7WmEFgkHe", type: "reel", cap: "When the craving hits… 🤤" },
    { code: "DZiPKJOpVJa", type: "reel", cap: "Find us at 3055 Argentia Rd, Mississauga 📍" },
    { code: "DYkLDi3AxRb", type: "reel", cap: "Fresh döner, every single day." }
  ];
  const igUrl = (p) => `https://www.instagram.com/${p.type === "reel" ? "reel" : "p"}/${p.code}/`;

  /* ================= MENU ================= */
  function renderMenu() {
    const cats = $("[data-menu-cats]");
    const body = $("[data-menu-body]");
    const drop = $("[data-menu-dropdown]");
    const dropM = $("[data-menu-dropdown-mobile]");
    const foot = $("[data-footer-menu]");
    if (!body) return;

    cats.innerHTML = MENU.map((c) => `<a href="#menu-${c.id}" data-cat="${c.id}">${icon(c.icon)}<span>${esc(c.title)}</span></a>`).join("");
    const dropHtml = MENU.map((c) => `<a href="#menu-${c.id}" role="menuitem">${icon(c.icon)}${esc(c.title)}</a>`).join("");
    if (drop) drop.innerHTML = dropHtml;
    if (dropM) dropM.innerHTML = MENU.map((c) => `<a href="#menu-${c.id}">${icon(c.icon)}${esc(c.title)}</a>`).join("");
    if (foot) foot.innerHTML = MENU.slice(0, 7).map((c) => `<li><a href="#menu-${c.id}">${esc(c.title)}</a></li>`).join("");

    body.innerHTML = MENU.map((c) => `
      <section class="menu-sec menu-sec--${c.id}" id="menu-${c.id}" aria-labelledby="mt-${c.id}">
        <header class="menu-sec__head reveal">
          <h3 class="menu-sec__title" id="mt-${c.id}">${esc(c.title)}</h3>
          <p class="menu-sec__blurb">${esc(c.blurb)}</p>
        </header>
        <div class="menu-grid">
          ${c.items.map((it, i) => `
            <article class="mcard reveal" style="transition-delay:${(i % 4) * 70}ms">
              <div class="mcard__img">
                ${it.img
                  ? `<img src="assets/img/menu/${esc(it.img)}" alt="${esc(it.name)} at Lavash Döner" loading="lazy" decoding="async" width="900" height="675">`
                  : `<div class="mcard__ph" aria-hidden="true">${icon(c.icon)}<span>Photo coming soon</span></div>`}
                ${it.fav ? `<span class="mcard__tag">Fan favourite</span>` : ""}
                ${it.tag ? `<span class="mcard__tag mcard__tag--dark">${esc(it.tag)}</span>` : ""}
              </div>
              <h4 class="mcard__name">${esc(it.name)}</h4>
              <p class="mcard__desc">${esc(it.desc)}</p>
            </article>`).join("")}
        </div>
      </section>`).join("");
  }

  /* ================= INSTAGRAM ================= */
  function renderInsta() {
    const grid = $("[data-insta-grid]");
    if (grid) {
      grid.innerHTML = INSTA.map((p, i) => `
        <a class="igcard reveal" style="transition-delay:${(i % 4) * 80}ms" href="${igUrl(p)}" target="_blank" rel="noopener" aria-label="Open this post on Instagram">
          <div class="igcard__top">
            <span class="igcard__avatar">${icon("doner")}</span>
            <span class="igcard__user">lavash_doner</span>
          </div>
          <div class="igcard__img">
            <img src="assets/img/instagram/${p.code}.webp" alt="${esc(p.cap)}" loading="lazy" decoding="async" width="600" height="750">
            ${p.type === "reel" ? `<span class="igcard__play">${icon("play")}</span>` : ""}
          </div>
          <div class="igcard__bar" aria-hidden="true">${icon("heart")}${icon("comment")}${icon("send")}${icon("bookmark")}</div>
          <p class="igcard__cap"><b>lavash_doner</b> ${esc(p.cap)}</p>
        </a>`).join("");
    }
    const foot = $("[data-footer-ig]");
    if (foot) {
      foot.innerHTML = INSTA.slice(0, 4).map((p) => `
        <a href="${igUrl(p)}" target="_blank" rel="noopener" aria-label="Instagram post: ${esc(p.cap)}">
          <img src="assets/img/instagram/${p.code}.webp" alt="" loading="lazy" decoding="async" width="600" height="750">
        </a>`).join("");
    }
  }

  /* ================= REVIEWS ================= */
  const AVATAR_COLORS = ["#fd6d14", "#d8321b", "#0f9d58", "#4285f4", "#8e44ad", "#c2185b", "#00897b", "#6d4c41"];
  function avatarColor(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }
  function reviewCard(r) {
    const initial = (r.name || "?").trim().charAt(0).toUpperCase();
    const stars = Array.from({ length: 5 }, (_, i) => (i < Math.round(r.rating) ? icon("star") : "")).join("");
    const avatar = r.photo
      ? `<img src="${esc(r.photo)}" alt="" referrerpolicy="no-referrer" loading="lazy">`
      : esc(initial);
    return `
      <article class="rcard">
        <div class="rcard__stars" aria-label="${r.rating} out of 5 stars">${stars}</div>
        <h3 class="rcard__title">“${esc(r.title)}”</h3>
        <p class="rcard__text">${esc(r.text)}</p>
        <div class="rcard__who">
          <span class="rcard__avatar" style="background:${avatarColor(r.name)}">${avatar}${icon("google")}</span>
          <span><span class="rcard__name">${esc(r.name)}</span><br><span class="rcard__src">Google Review${r.when ? " · " + esc(r.when) : ""}</span></span>
        </div>
      </article>`;
  }

  function initSlider(list) {
    const root = $("[data-slider]");
    if (!root) return;
    const track = $("[data-track]", root);
    const dotsWrap = $("[data-dots]");
    track.innerHTML = list.map(reviewCard).join("");

    const perView = () => {
      const card = track.firstElementChild;
      if (!card) return 1;
      return Math.max(1, Math.round(track.clientWidth / card.getBoundingClientRect().width));
    };
    const pages = () => Math.max(1, Math.ceil(list.length / perView()));
    const step = () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? (card.getBoundingClientRect().width + gap) * perView() : track.clientWidth;
    };
    const current = () => Math.round(track.scrollLeft / Math.max(1, step()));

    function buildDots() {
      const n = pages();
      dotsWrap.innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" tabindex="-1" data-i="${i}"></button>`).join("");
      paintDots();
    }
    function paintDots() {
      const c = Math.min(current(), pages() - 1);
      $$("button", dotsWrap).forEach((b, i) => b.classList.toggle("is-active", i === c));
    }
    function go(i) {
      const n = pages();
      const idx = ((i % n) + n) % n;
      track.scrollTo({ left: idx * step(), behavior: reduceMotion ? "auto" : "smooth" });
    }
    $("[data-prev]", root).addEventListener("click", () => go(current() - 1));
    $("[data-next]", root).addEventListener("click", () => go(current() + 1));
    dotsWrap.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(+b.dataset.i); });
    track.addEventListener("scroll", () => requestAnimationFrame(paintDots), { passive: true });
    window.addEventListener("resize", buildDots);
    buildDots();

    // autoplay, paused on hover / focus / offscreen
    let timer = null, hovering = false, visible = false;
    const tick = () => { if (!hovering && visible && !document.hidden) go(current() + 1); };
    const start = () => { if (!reduceMotion && !timer) timer = setInterval(tick, 6000); };
    root.addEventListener("mouseenter", () => (hovering = true));
    root.addEventListener("mouseleave", () => (hovering = false));
    root.addEventListener("focusin", () => (hovering = true));
    root.addEventListener("focusout", () => (hovering = false));
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0.3 }).observe(root);
  }

  async function loadLiveReviews() {
    const key = CFG.googlePlacesApiKey, id = CFG.googlePlaceId;
    if (!key || !id) return null;
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
        headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,reviews" }
      });
      if (!res.ok) throw new Error("Places API " + res.status);
      const data = await res.json();
      if (data.rating) $$("[data-g-rating]").forEach((el) => (el.textContent = data.rating.toFixed(1)));
      if (data.userRatingCount) $$("[data-g-count]").forEach((el) => (el.textContent = data.userRatingCount));
      return (data.reviews || [])
        .filter((r) => r.rating >= 4 && r.text && r.text.text && r.text.text.length > 40)
        .sort((a, b) => b.rating - a.rating)
        .map((r) => {
          const text = r.text.text.trim();
          const first = (text.match(/^[^.!?]{12,90}[.!?]/) || [text.slice(0, 70) + "…"])[0];
          return {
            name: (r.authorAttribution && r.authorAttribution.displayName) || "Google user",
            photo: r.authorAttribution && r.authorAttribution.photoUri,
            rating: r.rating, title: first, text: text.length > 420 ? text.slice(0, 417) + "…" : text,
            when: r.relativePublishTimeDescription
          };
        });
    } catch (err) {
      console.warn("Live Google reviews unavailable, showing saved reviews.", err);
      return null;
    }
  }

  async function renderReviews() {
    initSlider(REVIEWS);
    const live = await loadLiveReviews();
    if (live && live.length) {
      const names = new Set(live.map((r) => r.name.split(" ")[0].toLowerCase()));
      initSlider(live.concat(REVIEWS.filter((r) => !names.has(r.name.split(" ")[0].toLowerCase()))));
    }
  }

  /* ================= HOURS / OPEN STATUS ================= */
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function fmt(t) {
    let [h, m] = t.split(":").map(Number);
    const ap = h >= 12 && h < 24 ? "p.m." : "a.m.";
    h = h % 12 || 12;
    return `${h}${m ? ":" + String(m).padStart(2, "0") : ""} ${ap}`;
  }
  function torontoNow() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Toronto", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day: wd, mins: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
  }
  const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

  function renderHours() {
    const H = CFG.hours || {};
    const now = torontoNow();
    const tbody = $("[data-hours]");
    if (tbody) {
      const order = [1, 2, 3, 4, 5, 6, 0];
      tbody.innerHTML = order.map((d) => {
        const h = H[d];
        return `<tr class="${d === now.day ? "is-today" : ""}"><td>${DAYS[d]}${d === now.day ? " (today)" : ""}</td><td>${h ? fmt(h[0]) + " – " + fmt(h[1]) : "Closed"}</td></tr>`;
      }).join("");
    }
    const today = H[now.day];
    let open = false, msg = "Open daily from 11 a.m.";
    if (today) {
      const o = toMins(today[0]), c = toMins(today[1]);
      if (now.mins >= o && now.mins < c) { open = true; msg = `Open now · until ${fmt(today[1])}`; }
      else if (now.mins < o) msg = `Closed · opens ${fmt(today[0])}`;
      else {
        const nx = H[(now.day + 1) % 7];
        msg = nx ? `Closed · opens ${fmt(nx[0])} tomorrow` : "Closed now";
      }
    }
    $$("[data-open-status]").forEach((el) => (el.textContent = msg));
    const pill = $("[data-open-pill]");
    if (pill) { pill.classList.toggle("is-open", open); pill.classList.toggle("is-closed", !open); }

    if (CFG.email) {
      const row = $("[data-email-row]"), link = $("[data-email-link]");
      if (row && link) { row.hidden = false; link.href = "mailto:" + CFG.email; link.textContent = CFG.email; }
    }
  }

  /* ================= CONTACT FORM ================= */
  function initForm() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const status = $("[data-form-status]", form);
    const setStatus = (html, cls) => { status.innerHTML = html; status.className = "form__status " + (cls || ""); };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form._honey && form._honey.value) return;
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.email || !data.message || !/^\S+@\S+\.\S+$/.test(data.email)) {
        setStatus("Please fill in your name, a valid email and a message.", "is-warn");
        return;
      }
      if (!CFG.contactEmail) {
        setStatus(`Online messages are coming soon — for now, please call us at <a href="tel:${esc(CFG.phone || "")}">${esc(CFG.phoneDisplay || "")}</a>.`, "is-warn");
        return;
      }
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CFG.contactEmail)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: data.name, email: data.email, phone: data.phone, subject: data.subject || "Website message",
            message: data.message, _subject: `Lavash Döner website: ${data.subject || "New message"}`, _template: "table"
          })
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        setStatus("Thanks! Your message is on its way — we'll get back to you soon.", "is-ok");
      } catch (err) {
        setStatus(`Sorry, that didn't go through. Please call us at <a href="tel:${esc(CFG.phone || "")}">${esc(CFG.phoneDisplay || "")}</a>.`, "is-warn");
      } finally {
        btn.disabled = false; btn.textContent = "Send message";
      }
    });
  }

  /* ================= NAV / CHROME ================= */
  function initChrome() {
    const topbar = $(".topbar");
    const toTop = $(".to-top");
    const heroEl = $("[data-hero]");
    const onScroll = () => {
      const y = window.scrollY;
      topbar.classList.toggle("is-scrolled", y > 20);
      toTop.classList.toggle("is-visible", y > (heroEl ? heroEl.offsetHeight : 900));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // logo / to-top → smooth scroll to very top
    $$("[data-scrolltop]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      closeMobile();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", location.pathname + location.search);
    }));

    // mobile drawer
    const burger = $("[data-burger]");
    const drawer = $("[data-mobile-nav]");
    function closeMobile() { if (!drawer) return; drawer.hidden = true; burger.setAttribute("aria-expanded", "false"); }
    burger.addEventListener("click", () => {
      const open = drawer.hidden;
      drawer.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
    });
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) closeMobile(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 960) closeMobile(); });

    // desktop dropdown: click toggles for touch; Esc closes
    const dd = $("[data-dropdown]");
    if (dd) {
      const trigger = $(".nav__link--drop", dd);
      trigger.addEventListener("click", (e) => {
        if (window.matchMedia("(hover: none)").matches && !dd.classList.contains("is-open")) {
          e.preventDefault(); dd.classList.add("is-open"); trigger.setAttribute("aria-expanded", "true");
        }
      });
      dd.addEventListener("mouseenter", () => trigger.setAttribute("aria-expanded", "true"));
      dd.addEventListener("mouseleave", () => { dd.classList.remove("is-open", "force-close"); trigger.setAttribute("aria-expanded", "false"); });
      dd.addEventListener("click", (e) => { if (e.target.closest(".dropdown a")) { dd.classList.remove("is-open"); dd.classList.add("force-close"); document.activeElement.blur(); } });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") { dd.classList.remove("is-open"); trigger.setAttribute("aria-expanded", "false"); } });
      document.addEventListener("click", (e) => { if (!dd.contains(e.target)) dd.classList.remove("is-open"); });
    }

    // active nav link
    const map = { home: "home", menu: "menu", instagram: "menu", about: "about", testimonials: "testimonials" };
    const links = $$("[data-nav]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const key = map[en.target.id];
        links.forEach((l) => l.classList.toggle("is-active", l.dataset.nav === key));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "menu", "instagram", "about", "testimonials", "delivery", "location", "contact"].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });

    // active menu category
    const catLinks = $$("[data-cat]");
    const catBar = $("[data-menu-cats]");
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.id.replace("menu-", "");
        catLinks.forEach((l) => {
          const on = l.dataset.cat === id;
          l.classList.toggle("is-active", on);
          if (on && catBar.scrollWidth > catBar.clientWidth) {
            catBar.scrollTo({ left: l.offsetLeft - catBar.clientWidth / 2 + l.offsetWidth / 2, behavior: "smooth" });
          }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".menu-sec").forEach((s) => io2.observe(s));

    // reveal on scroll
    const io3 = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io3.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$(".reveal").forEach((el) => io3.observe(el));

    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ==========================================================
     HERO — scroll-driven sauce animation
     ========================================================== */
  // seeded RNG so splats look the same on every visit
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeBack = (t) => { const c1 = 1.9, c3 = c1 + 1; return t <= 0 ? 0 : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const lerp = (a, b, t) => a + (b - a) * t;

  // Catmull-Rom → cubic Bézier path
  function smoothPath(pts, closed) {
    const n = pts.length;
    const P = (i) => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + (closed ? "Z" : "");
  }

  function zigzag(x0, y0, x1, y1, amp, n, r) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = (i === 0 || i === n) ? 0 : amp * (i % 2 ? 1 : -1) * (0.75 + r() * 0.5);
      pts.push([x0 + dx * t + nx * a + (r() - 0.5) * 8, y0 + dy * t + ny * a + (r() - 0.5) * 8]);
    }
    return pts;
  }

  function el(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // A glossy sauce drizzle (shadow + body + highlight), drawn with pathLength=1
  function drizzle(svg, pts, color, width, shine) {
    const g = el("g", { class: "drizzle" }, svg);
    const d = smoothPath(pts, false);
    const common = { d, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 };
    el("path", Object.assign({}, common, { stroke: "rgba(0,0,0,.35)", "stroke-width": width + 3, transform: "translate(2.5 4)" }), g);
    el("path", Object.assign({}, common, { stroke: color, "stroke-width": width }), g);
    el("path", Object.assign({}, common, { stroke: shine, "stroke-width": Math.max(1.5, width * 0.28), transform: `translate(${-width * 0.18} ${-width * 0.22})`, opacity: 0.8 }), g);
    return g;
  }

  // An organic splat with droplets + gloss
  function splat(svg, cx, cy, R, color, seed, opts = {}) {
    const r = rng(seed);
    const g = el("g", { class: "splat", style: "transform:scale(0);opacity:0" }, svg);
    const n = 16 + Math.floor(r() * 8);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.25;
      let rad = R * (0.72 + r() * 0.3);
      if (r() < 0.32) rad *= 1.25 + r() * 0.55; // splash arms
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
    el("path", { d: smoothPath(pts, true), fill: "rgba(0,0,0,.28)", transform: "translate(5 8)" }, g);
    el("path", { d: smoothPath(pts, true), fill: color }, g);
    const drops = opts.drops == null ? 10 : opts.drops;
    for (let i = 0; i < drops; i++) {
      const a = r() * Math.PI * 2, dist = R * (1.35 + r() * 1.1), s = R * (0.04 + r() * 0.11);
      const x = cx + Math.cos(a) * dist, y = cy + Math.sin(a) * dist;
      if (r() < 0.45) {
        el("ellipse", { cx: x, cy: y, rx: s * 1.9, ry: s * 0.8, fill: color, transform: `rotate(${(a * 180) / Math.PI} ${x} ${y})` }, g);
      } else {
        el("circle", { cx: x, cy: y, r: s, fill: color }, g);
      }
    }
    el("ellipse", { cx: cx - R * 0.28, cy: cy - R * 0.3, rx: R * 0.32, ry: R * 0.14, fill: "#fff", opacity: opts.gloss || 0.35, transform: `rotate(-28 ${cx - R * 0.28} ${cy - R * 0.3})` }, g);
    return g;
  }

  function initHero() {
    const hero = $("[data-hero]");
    if (!hero) return;
    const GARLIC = "#fff7ea", HOT = "#d8321b", ORANGE = "#fd6d14";

    /* --- build sauces --- */
    const bowlSvg = $("[data-sauce=bowl]", hero);
    const r = rng(7);
    const garlicBowl = drizzle(bowlSvg, zigzag(70, 115, 330, 290, 58, 11, r), GARLIC, 9, "#ffffff");
    const hotBowl = drizzle(bowlSvg, zigzag(95, 300, 315, 95, 46, 10, r), HOT, 7, "#ff9b7a");
    const bowlDots = [];
    for (let i = 0; i < 14; i++) {
      const c = el("circle", { cx: 80 + r() * 240, cy: 80 + r() * 240, r: 3 + r() * 5, fill: i % 2 ? HOT : GARLIC, opacity: 0 }, bowlSvg);
      bowlDots.push({ c, t: i % 2 ? 0.47 + r() * 0.14 : 0.18 + r() * 0.17 });
    }

    const wrapSvg = $("[data-sauce=wrap]", hero);
    const garlicWrap = drizzle(wrapSvg, zigzag(60, 70, 340, 230, 40, 9, r), GARLIC, 7, "#fff");
    const sandSvg = $("[data-sauce=sandwich]", hero);
    const hotSand = drizzle(sandSvg, zigzag(70, 220, 330, 80, 34, 9, r), HOT, 6, "#ff9b7a");

    /* --- splats around the bowl (behind the plate) --- */
    const bowl = $("[data-bowl]", hero);
    const bowlSplatSvg = el("svg", { class: "bowl__splats", viewBox: "-400 -400 1200 1200", "aria-hidden": "true" });
    Object.assign(bowlSplatSvg.style, { position: "absolute", inset: "-100%", width: "300%", height: "300%", zIndex: "-1", overflow: "visible", pointerEvents: "none" });
    bowl.prepend(bowlSplatSvg);
    const bowlSplats = [
      { g: splat(bowlSplatSvg, 380, 50, 74, GARLIC, 11), t: 0.2 },
      { g: splat(bowlSplatSvg, 5, 290, 62, GARLIC, 12), t: 0.26 },
      { g: splat(bowlSplatSvg, 320, 395, 56, GARLIC, 13), t: 0.31 },
      { g: splat(bowlSplatSvg, 25, 45, 70, HOT, 21), t: 0.5 },
      { g: splat(bowlSplatSvg, 405, 290, 74, HOT, 22), t: 0.55 },
      { g: splat(bowlSplatSvg, 130, 405, 50, ORANGE, 23), t: 0.6 }
    ];

    /* --- big background splats --- */
    const bg = $("[data-splats]", hero);
    const bgSplats = [
      { g: splat(bg, 1420, 140, 120, GARLIC, 31, { drops: 14, gloss: 0.25 }), t: 0.34, o: 0.16 },
      { g: splat(bg, 160, 860, 150, HOT, 32, { drops: 16, gloss: 0.2 }), t: 0.58, o: 0.22 },
      { g: splat(bg, 760, 90, 90, ORANGE, 33, { drops: 12, gloss: 0.2 }), t: 0.7, o: 0.2 },
      { g: splat(bg, 1500, 900, 130, ORANGE, 34, { drops: 14, gloss: 0.2 }), t: 0.82, o: 0.18 }
    ];

    /* --- refs --- */
    const plateImg = $("[data-bowl-img]", hero);
    const bottles = { garlic: $("[data-bottle=garlic]", hero), hot: $("[data-bottle=hot]", hero) };
    const streams = { garlic: $(".bottle__stream", bottles.garlic), hot: $(".bottle__stream", bottles.hot) };
    const wrap = $("[data-wrap]", hero), sand = $("[data-sandwich]", hero);
    const steps = $$("[data-step]", hero);
    const dots = $$(".hero__progress li", hero);
    const hint = $(".hero__hint", hero);
    const mq1 = $("[data-marquee]", hero), mq2 = $("[data-marquee2]", hero);

    const setDash = (g, t) => g.querySelectorAll("path").forEach((p) => p.setAttribute("stroke-dashoffset", (1 - t).toFixed(4)));
    const setSplat = (s, t) => {
      const k = easeBack(t);
      s.g.style.transform = `scale(${k.toFixed(3)})`;
      s.g.style.opacity = t > 0 ? String(s.o || 1) : "0";
    };

    let shown = 0, target = 0, step = -1, running = false, inView = true;
    const t0 = performance.now();

    function readProgress() {
      if (reduceMotion) return 1;
      const rect = hero.getBoundingClientRect();
      const total = hero.offsetHeight - window.innerHeight;
      return total > 0 ? clamp(-rect.top / total) : 0;
    }

    function render(p, time) {
      const idle = time / 1000;

      // bowl entrance + spin
      const enter = easeOut(seg(p, 0, 0.12));
      const bowlScale = lerp(reduceMotion ? 1 : 0.7, 1, enter) * (1 + Math.sin(idle * 1.4) * 0.006);
      bowl.style.transform = `scale(${bowlScale.toFixed(4)})`;
      const spin = p * 110 + (reduceMotion ? 0 : idle * 4);
      plateImg.style.transform = `rotate(${spin.toFixed(2)}deg)`;
      bowlSvg.style.transform = `rotate(${spin.toFixed(2)}deg)`;

      // bottles
      function bottle(key, a, b, c, d, xFrom, xTo) {
        const bt = bottles[key];
        const inT = easeOut(seg(p, a, a + 0.06));
        const outT = easeInOut(seg(p, d, d + 0.06));
        const pour = seg(p, b, c);
        const y = lerp(-120, 0, inT) - outT * 140;
        const x = lerp(xFrom, xTo, easeInOut(pour)) + Math.sin(pour * Math.PI * 9) * 9 * (pour > 0 && pour < 1 ? 1 : 0);
        const tilt = Math.sin(idle * 3) * 2 + (pour > 0 && pour < 1 ? Math.sin(pour * Math.PI * 9) * 6 : 0);
        bt.style.opacity = (inT * (1 - outT)).toFixed(3);
        bt.style.transform = `translate(${x.toFixed(1)}%, ${y.toFixed(1)}%) rotate(${tilt.toFixed(2)}deg)`;
        const flowIn = seg(p, b - 0.02, b + 0.01), flowOut = seg(p, c, c + 0.02);
        streams[key].style.transform = `scaleY(${(flowIn * (1 - flowOut)).toFixed(3)})`;
      }
      bottle("garlic", 0.06, 0.16, 0.36, 0.37, -150, 60);
      bottle("hot", 0.37, 0.45, 0.61, 0.62, 140, -60);

      // drizzles
      setDash(garlicBowl, easeInOut(seg(p, 0.17, 0.37)));
      setDash(hotBowl, easeInOut(seg(p, 0.46, 0.62)));
      bowlDots.forEach((d) => d.c.setAttribute("opacity", seg(p, d.t, d.t + 0.02).toFixed(2)));
      bowlSplats.forEach((s) => setSplat(s, seg(p, s.t, s.t + 0.07)));
      bgSplats.forEach((s) => setSplat(s, seg(p, s.t, s.t + 0.09)));

      // wrap & sandwich fly in
      const w = easeOut(seg(p, 0.6, 0.72));
      wrap.style.opacity = w.toFixed(3);
      wrap.style.transform = `translate(calc(-50% + ${lerp(120, 0, w).toFixed(1)}vw), -50%) rotate(${lerp(18, -7, w) + Math.sin(idle * 1.2) * 1.5}deg)`;
      setDash(garlicWrap, easeInOut(seg(p, 0.71, 0.8)));
      const s2 = easeOut(seg(p, 0.7, 0.82));
      sand.style.opacity = s2.toFixed(3);
      sand.style.transform = `translate(calc(-50% + ${lerp(-60, 0, s2).toFixed(1)}vw), calc(-50% + ${lerp(40, 0, s2).toFixed(1)}vh)) rotate(${lerp(-20, 6, s2) + Math.sin(idle * 1.1 + 1) * 1.5}deg)`;
      setDash(hotSand, easeInOut(seg(p, 0.81, 0.9)));

      // marquees
      mq1.style.transform = `translateX(${(-p * 35).toFixed(2)}%)`;
      mq2.style.transform = `translateX(${(-35 + p * 35).toFixed(2)}%)`;
      hint.style.opacity = (1 - seg(p, 0, 0.05)).toFixed(2);

      // copy steps — get more informative as you scroll
      const s = reduceMotion ? 3 : p < 0.16 ? 0 : p < 0.42 ? 1 : p < 0.66 ? 2 : 3;
      if (s !== step) {
        step = s;
        steps.forEach((el, i) => {
          el.classList.toggle("is-active", i === s);
          el.classList.toggle("is-past", i < s);
          el.setAttribute("aria-hidden", i === s ? "false" : "true");
        });
        dots.forEach((d, i) => d.classList.toggle("is-active", i === s));
      }
    }

    function frame(time) {
      target = readProgress();
      shown += (target - shown) * 0.14;
      if (Math.abs(target - shown) < 0.0005) shown = target;
      render(shown, time - t0);
      if (inView && !reduceMotion) requestAnimationFrame(frame);
      else running = false;
    }
    function start() { if (!running) { running = true; requestAnimationFrame(frame); } }

    new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) start(); }).observe(hero);
    if (reduceMotion) { render(1, 0); return; }
    shown = target = readProgress();
    start();
  }

  /* ================= INIT ================= */
  renderMenu();
  renderInsta();
  renderHours();
  initChrome();
  initHero();
  initForm();
  renderReviews();
  setInterval(renderHours, 60 * 1000);
})();
