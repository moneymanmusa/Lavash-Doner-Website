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
        ${c.compact ? `<ul class="menu-list">${c.items.map((it) => `
          <li class="menu-list__item reveal"><span class="menu-list__icon">${icon(c.icon)}</span><span><b>${esc(it.name)}</b><span>${esc(it.desc)}</span></span></li>`).join("")}</ul>` : `
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
        </div>`}
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
    const start = () => { if (!reduceMotion && !timer) timer = setInterval(tick, 7000); };
    track.addEventListener("touchstart", () => { clearInterval(timer); timer = -1; }, { passive: true });
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
    const quickbar = $("[data-quickbar]");
    const onScroll = () => {
      const y = window.scrollY;
      topbar.classList.toggle("is-scrolled", y > 20);
      const past = y > (heroEl ? heroEl.offsetHeight * 0.6 : 600);
      toTop.classList.toggle("is-visible", past);
      if (quickbar) quickbar.classList.toggle("is-visible", past);
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
    function closeMobile() {
      if (!drawer) return;
      drawer.hidden = true; burger.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("nav-open");
    }
    burger.addEventListener("click", () => {
      const open = drawer.hidden;
      drawer.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("nav-open", open);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) { closeMobile(); burger.focus(); } });
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

  /* ================= INIT ================= */
  renderMenu();
  renderInsta();
  renderHours();
  initChrome();
  initForm();
  renderReviews();
  setInterval(renderHours, 60 * 1000);
})();
