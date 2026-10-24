/* NEXORA — interactions & animation */
(() => {
  "use strict";

  const D = window.NEXORA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!window.gsap;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const courseYear = (m) => [m.course, m.year].filter(Boolean).join(" · ");
  const ph = (val, fallback) => (val ? esc(val) : `<span class="placeholder">${fallback}</span>`);
  const icon = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

  // seeded random so the tear keeps its shape across resizes
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ----------------------------------------------------------------------
     smooth scroll
     ---------------------------------------------------------------------- */
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const navH = () => $(".nav").offsetHeight;

  function scrollToTarget(el) {
    if (lenis) lenis.scrollTo(el, { offset: -navH() + 1, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id === "#") return;
    const el = id === "#top" ? document.body : $(id);
    if (!el) return;
    e.preventDefault();
    if (id === "#top") lenis ? lenis.scrollTo(0, { duration: 1.4 }) : scrollTo({ top: 0, behavior: "smooth" });
    else scrollToTarget(el);
  });

  /* ----------------------------------------------------------------------
     socials
     ---------------------------------------------------------------------- */
  $$("[data-social]").forEach((a) => {
    const url = D.socials[a.dataset.social];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    else { a.addEventListener("click", (e) => e.preventDefault()); a.title = "Link coming soon"; }
  });

  /* ----------------------------------------------------------------------
     HERO — the torn page
     ---------------------------------------------------------------------- */
  const hero = $(".hero");
  const pTop = $(".piece-top"), pStrip = $(".piece-strip"), pBottom = $(".piece-bottom");
  const title = $(".title");
  title.innerHTML = [...title.textContent.trim()].map((c) => `<span class="ch">${c}</span>`).join("");

  function tearLine(w, yL, yR, seed, rough) {
    const r = rng(seed);
    const step = 8;
    const phase = r() * 6;
    const n = Math.ceil(w / step);
    const pts = [];
    let wander = 0;
    for (let i = 0; i <= n; i++) {
      const x = i === 0 ? -20 : i === n ? w + 20 : i * step + (r() - 0.5) * step * 0.6;
      const t = Math.max(0, Math.min(1, x / w));
      wander = (wander + (r() - 0.5) * rough * 1.4) * 0.8;
      pts.push([x, yL + (yR - yL) * t + Math.sin(t * Math.PI * 2 + phase) * rough * 2 + wander + (r() - 0.5) * rough]);
    }
    return pts;
  }
  function fringeOf(line, dir, seed) {
    const r = rng(seed);
    let f = 3;
    return line.map(([x, y]) => {
      f = Math.max(1.2, Math.min(6, f + (r() - 0.5) * 2.4));
      return [x, y + dir * f];
    });
  }
  const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;

  function layoutTear() {
    const w = hero.clientWidth, h = hero.clientHeight;
    const narrow = w < 640;
    const t1L = h * (narrow ? 0.44 : 0.5), t1R = h * (narrow ? 0.49 : 0.56);
    const t2L = h * (narrow ? 0.76 : 0.8), t2R = h * (narrow ? 0.72 : 0.76);
    const rough = narrow ? 2.6 : 3.4;
    const l1 = tearLine(w, t1L, t1R, 11, rough);
    const l2 = tearLine(w, t2L, t2R, 29, rough);
    const far = h * 2;
    $(".piece-paper", pTop).style.clipPath = poly([[-20, -far], [w + 20, -far], ...[...l1].reverse()]);
    $(".fringe", pTop).style.clipPath = poly([[-20, -far], [w + 20, -far], ...fringeOf(l1, 1, 5).reverse()]);
    $(".piece-paper", pBottom).style.clipPath = poly([...l2, [w + 20, h + far], [-20, h + far]]);
    $(".fringe", pBottom).style.clipPath = poly([...fringeOf(l2, -1, 7), [w + 20, h + far], [-20, h + far]]);
    $(".piece-paper", pStrip).style.clipPath = poly([...l1.map(([x, y]) => [x, y - 1.5]), ...[...l2].reverse().map(([x, y]) => [x, y + 1.5])]);
    $(".fringe", pStrip).style.clipPath = poly([...fringeOf(l1, -1, 13), ...fringeOf(l2, 1, 17).reverse()]);
    hero.style.setProperty("--t1", `${t1L}px`);
    hero.style.setProperty("--t2", `${t2L}px`);
    hero.style.setProperty("--tmid", `${(t1L + t2L) / 2}px`);
    if (hasGsap) gsap.set(pStrip, { transformOrigin: `0px ${t1L}px` });
    placeNote();
  }

  // the handwritten note sits just above-right of "coding"
  function placeNote() {
    const note = $(".note"), word = $(".scrib-u"), box = $(".band-content");
    if (!note || getComputedStyle(note).display === "none") return;
    const a = word.getBoundingClientRect(), b = box.getBoundingClientRect();
    note.style.left = `${a.right - b.left - 30}px`;
    note.style.top = `${a.top - b.top - note.offsetHeight - 2}px`;
  }

  function prepScribbles() {
    return $$(".scrib path, .note path").map((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      return p;
    });
  }

  function heroIntro() {
    const chars = $$(".title .ch");
    const words = $$(".sentence > *");
    const scribbles = prepScribbles();
    const stickers = $$(".piece-top .sticker");
    const note = $(".note span");
    const cta = $$(".hero-cta > *, .glide-cue");
    const eyebrow = $(".eyebrow");

    if (!hasGsap || reduced) {
      pStrip.style.display = "none";
      scribbles.forEach((p) => (p.style.strokeDashoffset = 0));
      return;
    }

    gsap.set(chars, { yPercent: 110, autoAlpha: 0 });
    gsap.set(eyebrow, { autoAlpha: 0, y: 10 });
    gsap.set(words, { autoAlpha: 0, y: 30 });
    gsap.set(stickers, { scale: 0, rotation: -40 });
    gsap.set(note, { autoAlpha: 0 });
    gsap.set(cta, { autoAlpha: 0, y: 16 });

    const w = hero.clientWidth, h = hero.clientHeight;
    gsap.timeline({ delay: 0.1 })
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0)
      .to(chars, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.05 }, 0.1)
      .to(stickers, { scale: 1, rotation: (i) => (i ? 8 : 0), duration: 0.7, ease: "back.out(2.2)", stagger: 0.12 }, 0.6)
      // a small tug, then the strip peels away
      .set($(".fringe", pStrip), { opacity: 1 }, 0.95)
      .to(pStrip, { rotation: -0.6, y: -5, duration: 0.18, ease: "power2.out" }, 0.95)
      .to(pStrip, { rotation: 0, y: 0, duration: 0.16, ease: "power2.in" })
      .to(pStrip, {
        rotation: 14, x: Math.max(w * 1.2, 900), y: -h * 0.7,
        filter: "drop-shadow(0 26px 24px rgba(10,20,28,.35))",
        duration: 0.9, ease: "power3.in",
      }, "+=0.05")
      .set(pStrip, { display: "none" })
      .to(words, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 }, "-=0.4")
      .to(scribbles, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut", stagger: 0.18 }, "-=0.2")
      .to(note, { autoAlpha: 1, duration: 0.4 }, "-=0.3")
      .to(cta, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, "-=0.9");

    gsap.to(stickers[0], { rotation: 360, duration: 24, ease: "none", repeat: -1, delay: 1.5 });

    gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } })
      .to(pTop, { y: -h * 0.12, ease: "none" }, 0)
      .to(pBottom, { y: h * 0.06, ease: "none" }, 0);
  }

  /* ----------------------------------------------------------------------
     UNION — 3D card carousel
     ---------------------------------------------------------------------- */
  const flow = $(".flow");
  const stage = $(".flow-stage");
  const ticks = $(".ticks");
  const monogram = (role) => role.split(/\s+/).map((w) => w[0]).join("").toUpperCase();

  stage.innerHTML = D.union.map((m, i) => `
    <article class="mcard" data-i="${i}" aria-label="${esc(m.role)}">
      <div class="mcard-photo">
        ${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name || m.role)}" loading="lazy" draggable="false">` : `<span class="mcard-mono" aria-hidden="true">${monogram(m.role)}</span>${icon("star", "ph-star")}`}
        <span class="mcard-role">${esc(m.role)}</span>
      </div>
      <div class="mcard-body">
        <h3 class="mcard-name"><span>${m.name ? esc(m.name) : "Name TBA"}</span></h3>
        <p class="mcard-meta">${courseYear(m) ? esc(courseYear(m)) : "Course · Year"}</p>
        <p class="mcard-line">${ph(m.line, "One-line description goes here.")}</p>
      </div>
      <span class="mcard-shade"></span>
    </article>`).join("");
  ticks.innerHTML = D.union.map((m, i) => `<button type="button" class="tick" role="tab" aria-label="${esc(m.role)}" aria-selected="false" data-i="${i}"></button>`).join("");

  const cards = $$(".mcard", stage);
  let active = 0;

  function layoutFlow(animate = true) {
    const cw = cards[0].offsetWidth;
    const narrow = innerWidth < 640;
    const n = cards.length, lo = -Math.floor((n - 1) / 2);
    cards.forEach((c, i) => {
      // circular: cards sit on both sides of the active one
      const d = ((((i - active - lo) % n) + n) % n) + lo, ad = Math.abs(d), s = Math.sign(d);
      const spread = narrow ? 0.5 : 0.72;
      const props = {
        x: d === 0 ? 0 : s * (cw * spread + (ad - 1) * cw * (narrow ? 0.16 : 0.3)),
        z: -ad * (narrow ? 120 : 160),
        rotationY: d === 0 ? 0 : -s * (narrow ? 34 : 40),
        scale: d === 0 ? 1 : 0.94,
        zIndex: 20 - ad,
        autoAlpha: ad > 3 ? 0 : 1,
      };
      const shade = { opacity: d === 0 ? 0 : Math.min(0.06 + ad * 0.08, 0.3) };
      c.classList.toggle("is-active", d === 0);
      c.setAttribute("aria-hidden", d === 0 ? "false" : "true");
      if (!hasGsap) {
        c.style.transform = `translateX(${props.x}px) translateZ(${props.z}px) rotateY(${props.rotationY}deg) scale(${props.scale})`;
        c.style.zIndex = props.zIndex;
        $(".mcard-shade", c).style.opacity = shade.opacity;
        return;
      }
      gsap.to(c, { ...props, duration: animate && !reduced ? 0.9 : 0, ease: "power3.out", overwrite: "auto" });
      gsap.to($(".mcard-shade", c), { ...shade, duration: animate ? 0.6 : 0, overwrite: "auto" });
    });
    $$(".tick", ticks).forEach((t, i) => t.setAttribute("aria-selected", i === active ? "true" : "false"));
  }

  function revealActive() {
    if (!hasGsap || reduced) return;
    const c = cards[active];
    gsap.fromTo($(".mcard-name > span", c), { yPercent: 105 }, { yPercent: 0, duration: 0.7, ease: "expo.out", delay: 0.15 });
    gsap.fromTo([$(".mcard-meta", c), $(".mcard-line", c)], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.3, ease: "power2.out" });
    gsap.fromTo($(".mcard-role", c), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2.5)", delay: 0.2 });
  }

  function go(i, user = true) {
    const n = cards.length;
    const next = ((i % n) + n) % n;
    if (user) stopAuto();
    if (next === active) return;
    active = next;
    layoutFlow();
    revealActive();
  }

  $$(".flow-btn").forEach((b) => b.addEventListener("click", () => go(active + +b.dataset.dir)));
  ticks.addEventListener("click", (e) => { const t = e.target.closest(".tick"); if (t) go(+t.dataset.i); });
  flow.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  });

  // drag / swipe
  let dragX = null, moved = false;
  flow.addEventListener("pointerdown", (e) => { dragX = e.clientX; moved = false; });
  addEventListener("pointermove", (e) => { if (dragX !== null && Math.abs(e.clientX - dragX) > 8) moved = true; });
  addEventListener("pointerup", (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    dragX = null;
    if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
  });
  flow.addEventListener("click", (e) => {
    if (moved) return;
    const c = e.target.closest(".mcard");
    if (c && +c.dataset.i !== active) go(+c.dataset.i);
  });

  // gentle autoplay while visible, until someone touches it
  let autoTimer = null, autoStopped = false;
  function startAuto() {
    if (autoStopped || reduced || autoTimer) return;
    autoTimer = setInterval(() => go(active + 1, false), 4200);
  }
  function pauseAuto() { clearInterval(autoTimer); autoTimer = null; }
  function stopAuto() { autoStopped = true; pauseAuto(); }
  flow.addEventListener("mouseenter", pauseAuto);
  flow.addEventListener("mouseleave", startAuto);

  function setupFlow() {
    layoutFlow(false);
    if (!hasGsap) return;
    // cards fan out from a stack the first time the section comes into view
    gsap.set(cards, { x: 0, z: -200, rotationY: 0, autoAlpha: 0, y: 80 });
    ScrollTrigger.create({
      trigger: flow, start: "top 75%", once: true,
      onEnter: () => {
        gsap.to(cards, { y: 0, duration: 0.9, ease: "power3.out", stagger: 0.06 });
        layoutFlow(true);
        revealActive();
      },
    });
    ScrollTrigger.create({ trigger: flow, start: "top 80%", end: "bottom 20%", onToggle: (s) => (s.isActive ? startAuto() : pauseAuto()) });
  }

  // a few line-drawn fish and bubbles drifting behind the cards
  function seaLife() {
    const box = $(".union-sea");
    if (!hasGsap || reduced) return;
    const R = gsap.utils.random;
    const tl = gsap.timeline();
    for (let i = 0; i < 14; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      b.style.width = b.style.height = `${R(5, 14)}px`;
      box.appendChild(b);
      gsap.set(b, { x: R(0, box.clientWidth), y: box.clientHeight + 20 });
      tl.add(gsap.to(b, { y: -30, duration: R(10, 18), delay: R(0, 10), ease: "none", repeat: -1, onRepeat: () => gsap.set(b, { x: R(0, box.clientWidth) }) }), 0);
      tl.add(gsap.to(b, { xPercent: R(-150, 150), duration: R(2, 3), yoyo: true, repeat: -1, ease: "sine.inOut" }), 0);
    }
    for (let i = 0; i < 3; i++) {
      const wrap = document.createElement("div");
      wrap.innerHTML = `<svg viewBox="0 0 60 30" style="width:${R(46, 70)}px"><use href="#fish"/></svg>`;
      const f = wrap.firstChild;
      box.appendChild(f);
      const swim = () => {
        const ltr = Math.random() > 0.5, W = box.clientWidth;
        gsap.set(f, { x: ltr ? -90 : W + 20, y: R(box.clientHeight * 0.1, box.clientHeight * 0.85), scaleX: ltr ? -1 : 1 });
        tl.add(gsap.to(f, { x: ltr ? W + 20 : -90, duration: R(26, 40), delay: R(0, 6), ease: "none", onComplete: swim }), tl.time());
      };
      swim();
    }
    ScrollTrigger.create({ trigger: ".union", start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? tl.resume() : tl.pause()) });
  }

  /* ----------------------------------------------------------------------
     TEAM + MARQUEE
     ---------------------------------------------------------------------- */
  const headsLabel = (d) => (d.heads.length > 1 ? `${d.heads.length} heads` : "1 head");
  $$(".dept-list").forEach((ul) => {
    ul.innerHTML = D.departments.filter((d) => d.side === ul.dataset.side).map((d) => `
      <li><a href="#heads" data-dept="${d.id}" data-side="${d.side}">
        <span class="dept-ic">${icon(`d-${d.icon}`)}</span>
        <span class="dept-name">${esc(d.name)}</span>
        <span class="dept-count">${headsLabel(d)}</span>
        ${icon("i-arrow", "dept-go")}
      </a></li>`).join("");
  });

  const mItems = D.departments.map((d) => `<span>${esc(d.name)}</span>${icon("star")}`).join("");
  $$(".marquee-track").forEach((t) => (t.innerHTML = mItems + mItems + mItems + mItems));

  /* ----------------------------------------------------------------------
     HEADS — segmented control
     ---------------------------------------------------------------------- */
  const panels = $(".dept-panels");
  const seg = $(".seg");
  const thumb = $(".seg-thumb");

  const headCard = (p) => `
    <article class="head-card">
      <div class="head-photo">${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name || "Department head")}" loading="lazy">` : icon("star", "ph-star")}</div>
      <h4>${p.name ? esc(p.name) : "Name TBA"}</h4>
      <p class="meta">${courseYear(p) ? esc(courseYear(p)) : "Course · Year"}</p>
      ${p.portfolio
        ? `<a class="head-link" href="${esc(p.portfolio)}" target="_blank" rel="noopener">Portfolio / Resume ${icon("i-arrow-up-right")}</a>`
        : `<span class="head-link is-empty">Link coming soon</span>`}
    </article>`;

  function showSide(side, animate = true) {
    $$(".seg-btn", seg).forEach((b) => b.setAttribute("aria-selected", b.dataset.side === side ? "true" : "false"));
    const btn = $(`.seg-btn[data-side="${side}"]`, seg);
    thumb.style.width = `${btn.offsetWidth}px`;
    thumb.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
    panels.innerHTML = D.departments.filter((d) => d.side === side).map((d) => `
      <section class="dept-panel" id="dept-${d.id}">
        <div class="dept-panel-head">
          <span class="dept-ic">${icon(`d-${d.icon}`)}</span>
          <h3>${esc(d.name)}</h3>
          <span class="dept-count">${headsLabel(d)}</span>
        </div>
        <div class="head-row${d.heads.length === 1 ? " is-single" : ""}">${d.heads.map(headCard).join("")}</div>
      </section>`).join("");
    if (hasGsap && !reduced && animate) {
      gsap.fromTo($$(".dept-panel", panels), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 });
    }
    hasGsap && ScrollTrigger.refresh();
  }
  seg.addEventListener("click", (e) => { const b = e.target.closest(".seg-btn"); if (b) showSide(b.dataset.side); });

  // department rows in the team section jump to that department's heads
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-dept]");
    if (!a) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    showSide(a.dataset.side, false);
    requestAnimationFrame(() => scrollToTarget($(`#dept-${a.dataset.dept}`)));
  }, true);

  /* ----------------------------------------------------------------------
     glide-in reveals
     ---------------------------------------------------------------------- */
  function setupReveals() {
    if (!hasGsap || reduced) return;
    const items = $$(".sec-head > *, [data-reveal], .join-card, .seg");
    gsap.set(items, { autoAlpha: 0, y: 50 });
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1 }),
    });
  }

  /* ----------------------------------------------------------------------
     JOIN FORM
     ---------------------------------------------------------------------- */
  const modal = $("#join");
  const sheet = $(".join-sheet", modal);
  const form = $(".join-form", modal);
  const done = $(".join-done", modal);
  const errBox = $(".form-error", form);
  let lastFocus = null;

  sheet.setAttribute("data-lenis-prevent", "");
  $(".chips", form).innerHTML = D.departments.map((d, i) =>
    `<label class="chip"><input type="checkbox" id="f-dept-${i}" name="departments" value="${esc(d.name)}"><span>${esc(d.name)}</span></label>`).join("");

  function openJoin(e) {
    lastFocus = e && e.currentTarget;
    modal.hidden = false;
    lenis && lenis.stop();
    document.documentElement.style.overflow = "hidden";
    if (hasGsap && !reduced) {
      gsap.fromTo($(".join-backdrop", modal), { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(sheet, { y: 120, rotation: -5, scale: 0.94, autoAlpha: 0 }, { y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.65, ease: "back.out(1.4)" });
    }
    setTimeout(() => $("input, select, textarea", form)?.focus(), 80);
  }
  function closeJoin() {
    const finish = () => {
      modal.hidden = true;
      document.documentElement.style.overflow = "";
      lenis && lenis.start();
      lastFocus && lastFocus.focus();
      if (!done.hidden) { form.reset(); form.hidden = false; done.hidden = true; }
    };
    if (hasGsap && !reduced) {
      gsap.to($(".join-backdrop", modal), { opacity: 0, duration: 0.25 });
      gsap.to(sheet, { y: 100, rotation: 4, autoAlpha: 0, duration: 0.3, ease: "power2.in", onComplete: finish });
    } else finish();
  }
  $$("[data-open-join]").forEach((b) => b.addEventListener("click", openJoin));
  $$("[data-close-join]", modal).forEach((b) => b.addEventListener("click", closeJoin));
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeJoin();
    if (e.key === "Tab") {
      const f = $$("a[href], button, input, select, textarea", sheet).filter((el) => el.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  form.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("is-bad"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.textContent = "";
    let bad = null;
    ["name", "email", "course", "year", "why"].forEach((n) => {
      const el = form.elements[n];
      const ok = el.value.trim() && (n !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.closest(".field").classList.toggle("is-bad", !ok);
      if (!ok && !bad) bad = el;
    });
    const link = form.elements.link;
    if (link.value && !link.checkValidity()) { link.closest(".field").classList.add("is-bad"); bad = bad || link; }
    if (bad) {
      errBox.textContent = "A few fields still need filling in.";
      bad.focus();
      hasGsap && gsap.fromTo(sheet, { x: 0 }, { keyframes: { x: [0, -10, 9, -6, 4, 0] }, duration: 0.4, ease: "none" });
      return;
    }
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd);
    payload.departments = fd.getAll("departments");
    const btn = $(".submit-btn", form);
    btn.disabled = true;
    $("span", btn).textContent = "Sending…";
    try {
      if (D.formEndpoint) {
        const res = await fetch(D.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(res.status);
      } else {
        console.info("[Nexora] No formEndpoint set in js/data.js, so this application was not sent:", payload);
        await new Promise((r) => setTimeout(r, 600));
      }
      form.hidden = true;
      done.hidden = false;
      if (hasGsap && !reduced) {
        gsap.fromTo($(".stamp-received", done), { scale: 3, rotation: -30, autoAlpha: 0 }, { scale: 1, rotation: -8, autoAlpha: 1, duration: 0.3, ease: "power4.in" });
        gsap.fromTo(sheet, { x: 0, y: 0 }, { keyframes: { x: [0, -8, 7, -4, 0], y: [0, 5, -4, 2, 0] }, duration: 0.35, delay: 0.3, ease: "none" });
        gsap.fromTo($$("h2, p, .pill", done), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.08, delay: 0.4, duration: 0.4 });
      }
      $(".pill", done).focus();
    } catch (err) {
      errBox.textContent = "Couldn't send that. Check your connection and try again.";
    } finally {
      btn.disabled = false;
      $("span", btn).textContent = "Send application";
    }
  });

  /* ----------------------------------------------------------------------
     go
     ---------------------------------------------------------------------- */
  function start() {
    layoutTear();
    heroIntro();
    showSide("Technical", false);
    setupFlow();
    seaLife();
    setupReveals();
    hasGsap && ScrollTrigger.refresh();
  }

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      layoutTear();
      layoutFlow(false);
      const sel = $('.seg-btn[aria-selected="true"]', seg);
      thumb.style.width = `${sel.offsetWidth}px`;
      thumb.style.transform = `translateX(${sel.offsetLeft - 4}px)`;
      hasGsap && ScrollTrigger.refresh();
    }, 120);
  });

  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  fontsReady.then(start);
  addEventListener("load", () => hasGsap && ScrollTrigger.refresh());
})();
