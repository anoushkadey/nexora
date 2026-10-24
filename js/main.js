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
    lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToTarget(target, offset = 0) {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.8 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id === "#") return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    scrollToTarget(el, id.startsWith("#dept-") ? -90 : 0);
  });

  /* ----------------------------------------------------------------------
     socials
     ---------------------------------------------------------------------- */
  $$("[data-social]").forEach((a) => {
    const url = D.socials[a.dataset.social];
    if (url) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.addEventListener("click", (e) => e.preventDefault());
      a.title = "Link coming soon";
    }
  });

  /* ----------------------------------------------------------------------
     HERO — the torn page
     ---------------------------------------------------------------------- */
  const hero = $(".hero");
  const pTop = $(".piece-top"), pStrip = $(".piece-strip"), pBottom = $(".piece-bottom");
  let torn = reduced || !hasGsap;

  function tearLine(w, yL, yR, seed, opts = {}) {
    const r = rng(seed);
    const step = opts.step || 9;
    const rough = opts.rough || 5;
    const phase = r() * 6;
    const n = Math.ceil(w / step);
    const pts = [];
    let wander = 0;
    for (let i = 0; i <= n; i++) {
      const x = i === 0 ? -20 : i === n ? w + 20 : i * step + (r() - 0.5) * step * 0.6;
      const t = Math.max(0, Math.min(1, x / w));
      wander = (wander + (r() - 0.5) * rough * 1.6) * 0.82;
      const y = yL + (yR - yL) * t
        + Math.sin(t * Math.PI * 2.2 + phase) * rough * 2.4
        + wander
        + (r() - 0.5) * rough * 1.1;
      pts.push([x, y]);
    }
    return pts;
  }

  // the white fibrous edge you get on real torn paper
  function fringeOf(line, dir, seed) {
    const r = rng(seed);
    let f = 4;
    return line.map(([x, y]) => {
      f = Math.max(1.5, Math.min(9, f + (r() - 0.5) * 3.2));
      return [x, y + dir * f];
    });
  }

  const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;

  function layoutTear() {
    const w = hero.clientWidth, h = hero.clientHeight;
    const narrow = w < 720;
    const t1L = h * (narrow ? 0.43 : 0.40), t1R = h * (narrow ? 0.50 : 0.52);
    const t2L = h * (narrow ? 0.73 : 0.77), t2R = h * (narrow ? 0.69 : 0.70);
    const rough = narrow ? 3.5 : 5;

    const l1 = tearLine(w, t1L, t1R, 11, { rough });
    const l2 = tearLine(w, t2L, t2R, 29, { rough });
    const far = h * 2;

    const topPts = [[-20, -far], [w + 20, -far], ...[...l1].reverse()];
    const topFringe = [[-20, -far], [w + 20, -far], ...fringeOf(l1, 1, 5).reverse()];
    const botPts = [...l2, [w + 20, h + far], [-20, h + far]];
    const botFringe = [...fringeOf(l2, -1, 7), [w + 20, h + far], [-20, h + far]];
    const stripPts = [...l1.map(([x, y]) => [x, y - 1.5]), ...[...l2].reverse().map(([x, y]) => [x, y + 1.5])];

    $(".piece-paper", pTop).style.clipPath = poly(topPts);
    $(".fringe", pTop).style.clipPath = poly(topFringe);
    $(".piece-paper", pBottom).style.clipPath = poly(botPts);
    $(".fringe", pBottom).style.clipPath = poly(botFringe);
    $(".piece-paper", pStrip).style.clipPath = poly(stripPts);
    $(".fringe", pStrip).style.clipPath = poly([...fringeOf(l1, -1, 13), ...fringeOf(l2, 1, 17).reverse()]);

    hero.style.setProperty("--t1", `${t1L}px`);
    hero.style.setProperty("--t2", `${t2L}px`);
    hero.style.setProperty("--tmid", `${(t1L + t2L) / 2}px`);
    if (hasGsap) gsap.set(pStrip, { transformOrigin: `0px ${t1L}px` });
  }

  layoutTear();
  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { layoutTear(); hasGsap && ScrollTrigger.refresh(); }, 120);
  });

  function heroIntro() {
    const letters = $$(".title .ltr");
    const words = $$(".tagline .tw");
    const scribble = $(".tag-scribble path");
    const sparkles = $$(".hero .deco");
    const join = $(".join-wrap .join-btn");
    const cue = $(".glide-cue");

    if (!hasGsap || reduced) {
      pStrip.style.display = "none";
      return;
    }

    const len = scribble.getTotalLength();
    gsap.set(scribble, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(words, { autoAlpha: 0, y: 50, rotation: () => gsap.utils.random(-12, 12), scale: 0.6 });
    gsap.set(sparkles, { scale: 0, rotation: -90 });
    gsap.set([join, cue], { autoAlpha: 0, y: 30 });
    gsap.set(letters, { autoAlpha: 0, y: -120, rotation: () => gsap.utils.random(-25, 25), scale: 1.5 });

    const w = hero.clientWidth, h = hero.clientHeight;
    const tl = gsap.timeline({ delay: 0.15 });

    // 1. letters stamp onto the page
    tl.to(letters, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 0.42, ease: "power4.in", stagger: 0.07 })
      .to(letters, { scaleY: 0.82, scaleX: 1.12, duration: 0.07, yoyo: true, repeat: 1, stagger: 0.07, ease: "power1.out" }, 0.42)
      .to(sparkles, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(3)", stagger: 0.1 }, 0.8)

    // 2. someone grabs the strip and gives it two tugs...
      .set($(".fringe", pStrip), { opacity: 1 }, 1.15)
      .to(pStrip, { rotation: -0.8, y: -6, duration: 0.12, ease: "power2.out" }, 1.15)
      .to(pStrip, { rotation: 0, y: 0, duration: 0.14, ease: "power2.in" })
      .to(pStrip, { rotation: -1.6, y: -10, duration: 0.12, ease: "power2.out" }, "+=0.08")
      .to([pTop, pBottom], { y: (i) => (i ? 3 : -3), duration: 0.06, yoyo: true, repeat: 3, ease: "none" }, "<")

    // 3. ...and rips it clean off
      .to(pStrip, {
        rotation: 16, x: Math.max(w * 1.2, 900), y: -h * 0.75, scale: 1.08,
        filter: "drop-shadow(0 30px 28px rgba(10,20,28,.45))",
        duration: 0.85, ease: "power3.in",
      }, "+=0.02")
      .set(pStrip, { display: "none" })
      .add(() => { torn = true; }, "-=0.4")

    // 4. what was underneath pops up
      .to(words, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: "back.out(2.2)", stagger: 0.11 }, "-=0.45")
      .to(scribble, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, "-=0.15")
      .to([join, cue], { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.12 }, "-=0.4");

    // sparkles keep twinkling
    sparkles.forEach((s, i) => {
      gsap.to(s, { rotation: i % 2 ? 18 : -18, scale: 0.86, duration: 1.4 + i * 0.3, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2 + i * 0.2 });
    });

    // pieces drift apart as you glide down
    gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } })
      .to(pTop, { y: -h * 0.16, rotation: -1.2, transformOrigin: "50% 0%", ease: "none" }, 0)
      .to(pBottom, { y: h * 0.1, rotation: 0.8, transformOrigin: "50% 100%", ease: "none" }, 0)
      .to(".sheet-blue", { y: h * 0.04, scale: 1.08, ease: "none" }, 0);
  }

  /* ----------------------------------------------------------------------
     SEA LIFE
     ---------------------------------------------------------------------- */
  // every sea tween lives in one timeline per area, so it can be paused off-screen
  function populateSea(box, { fish = 3, plankton = 16, bubbles = 12 } = {}) {
    const sea = gsap.timeline({ autoRemoveChildren: true });
    const W = () => box.clientWidth, H = () => box.clientHeight;
    const R = gsap.utils.random;
    const now = (tw) => sea.add(tw, sea.time());
    const make = (vb, id, style) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `<svg class="drifter" viewBox="${vb}" style="${style}"><use href="#${id}"/></svg>`;
      return box.appendChild(wrap.firstChild);
    };

    // plankton & diatoms — tiny, slow, everywhere
    for (let i = 0; i < plankton; i++) {
      const diatom = i % 3 === 0;
      const s = make(diatom ? "0 0 40 20" : "0 0 40 40", diatom ? "diatom" : "plankton",
        `width:${R(10, 24)}px;color:${i % 4 === 0 ? "#f1c21b" : "#f3d796"};opacity:${R(0.25, 0.6)}`);
      gsap.set(s, { x: R(0, W()), y: R(0, H()), rotation: R(0, 360) });
      now(gsap.to(s, { x: `+=${R(-80, 80)}`, y: `+=${R(-60, 60)}`, rotation: `+=${R(-120, 120)}`, duration: R(6, 12), yoyo: true, repeat: -1, ease: "sine.inOut" }));
    }

    // bubbles rising
    for (let i = 0; i < bubbles; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      b.style.width = b.style.height = `${R(6, 20)}px`;
      box.appendChild(b);
      gsap.set(b, { x: R(0, W()), y: H() + 30, opacity: R(0.4, 0.9) });
      now(gsap.fromTo(b, { y: () => H() + 30 }, {
        y: -40, duration: R(7, 14), delay: R(0, 8), ease: "none", repeat: -1,
        onRepeat: () => gsap.set(b, { x: R(0, W()) }),
      }));
      now(gsap.to(b, { xPercent: R(-160, 160), duration: R(1.5, 2.5), yoyo: true, repeat: -1, ease: "sine.inOut" }));
    }

    // fish
    const kinds = [
      { id: "fish", vb: "0 0 90 54", w: [70, 110], color: "#f1c21b" },
      { id: "fish", vb: "0 0 90 54", w: [46, 70], color: "#f3d796" },
      { id: "puffer", vb: "0 0 80 70", w: [60, 84], color: "#f3d796" },
      { id: "jelly", vb: "0 0 70 110", w: [50, 70], color: "#c9a24a", drift: true },
      { id: "fish", vb: "0 0 90 54", w: [40, 56], color: "#f1c21b" },
    ];
    for (let i = 0; i < fish; i++) {
      const k = kinds[i % kinds.length];
      const fw = R(k.w[0], k.w[1]);
      const f = make(k.vb, k.id, `width:${fw}px;color:${k.color}`);

      if (k.drift) {   // jellyfish pulse upward instead of swimming across
        gsap.set(f, { x: R(W() * 0.1, W() * 0.9) });
        now(gsap.fromTo(f, { y: () => H() + 120 }, {
          y: -140, duration: R(22, 30), delay: R(0, 10), ease: "none", repeat: -1,
          onRepeat: () => gsap.set(f, { x: R(W() * 0.1, W() * 0.9) }),
        }));
        now(gsap.to(f, { scaleY: 0.86, scaleX: 1.08, duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut" }));
        continue;
      }

      now(gsap.to(f, { yPercent: R(-60, 60), duration: R(2, 3.5), yoyo: true, repeat: -1, ease: "sine.inOut" }));
      const swim = (first) => {
        const ltr = Math.random() > 0.5;
        // the drawings face left; flip them when they swim right
        gsap.set(f, { x: ltr ? -fw - 40 : W() + 40, y: R(H() * 0.12, H() * 0.88), scaleX: ltr ? -1 : 1 });
        now(gsap.to(f, {
          x: ltr ? W() + 40 : -fw - 40,
          duration: R(16, 28), delay: first ? R(0, 6) : R(1, 5), ease: "none",
          onComplete: () => swim(false),
        }));
      };
      swim(true);
    }
    return sea;
  }

  function pauseWhenHidden(el, timelines) {
    ScrollTrigger.create({
      trigger: el, start: "top bottom", end: "bottom top",
      onToggle: (self) => timelines.forEach((t) => (self.isActive ? t.resume() : t.pause())),
    });
  }

  function seaweed(svg) {
    const R = gsap.utils.random;
    const colors = ["#2f5670", "#3e6c88", "#24465c", "#c9a24a", "#2f5670", "#1f3a4e"];
    const blades = [];
    let html = "";
    for (let i = 0; i < 34; i++) {
      const x = (i / 33) * 1440 + R(-20, 20);
      const hgt = R(70, 210) * (i % 7 === 3 ? 1.2 : 1);
      let d = `M${x.toFixed(0)} 230`;
      for (let s = 1; s <= 4; s++) {
        const y = 230 - (hgt / 4) * s;
        const cx = x + (s % 2 ? 1 : -1) * R(14, 26);
        d += ` Q${cx.toFixed(0)} ${(y + hgt / 8).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)}`;
      }
      const c = colors[i % colors.length];
      const sw = c === "#c9a24a" ? 10 : 15;
      html += `<g><path d="${d}" stroke="#0f1e2a" stroke-width="${sw + 5}"/><path d="${d}" stroke="${c}" stroke-width="${sw}"/></g>`;
      blades.push(x);
    }
    for (let i = 0; i < 9; i++) {   // rocks
      const x = R(0, 1440), rw = R(40, 110);
      html += `<ellipse cx="${x.toFixed(0)}" cy="226" rx="${rw.toFixed(0)}" ry="${(rw * 0.42).toFixed(0)}" fill="#0f1e2a" stroke="#15130f" stroke-width="3"/>`;
    }
    svg.innerHTML = html;
    const sway = gsap.timeline();
    $$("g", svg).forEach((g, i) => {
      gsap.set(g, { svgOrigin: `${blades[i]} 230` });
      sway.add(gsap.to(g, { rotation: R(-7, 7), skewX: R(-6, 6), duration: R(2.4, 4), yoyo: true, repeat: -1, ease: "sine.inOut", delay: R(0, 2) }), 0);
    });
    return sway;
  }

  // the tentacle from the "stand out" reference, curling up from the seabed
  function tentacle(canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, running = false, raf = 0;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, Math.max(r, 0.5), 0, Math.PI * 2); ctx.fill(); };

    const draw = (ms) => {
      const t = ms / 1000;
      ctx.clearRect(0, 0, w, h);
      const N = 64, L = h * 0.98, seg = L / N, R0 = Math.min(w * 0.1, 30);
      let x = w * 0.66, y = h + 12, a = -Math.PI / 2 + 0.18 + Math.sin(t * 0.55) * 0.14;
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const s = i / N;
        pts.push({ x, y, a, r: R0 * Math.pow(1 - s, 0.8) + 1.6, s });
        const curl = (0.006 + 0.2 * s * s * s) * (1 + 0.45 * Math.sin(t * 1.2 - s * 3.2));
        a -= curl;
        a += Math.sin(t * 1.4 + s * 6) * 0.012;
        x += Math.cos(a) * seg;
        y += Math.sin(a) * seg;
      }
      ctx.fillStyle = "#15130f";
      pts.forEach((p) => circle(p.x, p.y, p.r + 3));
      ctx.fillStyle = "#d9a52a";
      pts.forEach((p) => circle(p.x, p.y, p.r));
      ctx.fillStyle = "#e9bd46";   // soft highlight down one side
      pts.forEach((p) => circle(p.x + Math.sin(p.a) * -p.r * 0.38, p.y - Math.cos(p.a) * -p.r * 0.38, p.r * 0.42));
      // suckers on the inside of the curl
      pts.forEach((p, i) => {
        if (i < 2 || i > N - 4 || i % 3) return;
        const sx = p.x + Math.sin(p.a) * p.r * 0.62, sy = p.y - Math.cos(p.a) * p.r * 0.62;
        const sr = p.r * 0.36;
        ctx.fillStyle = "#15130f"; circle(sx, sy, sr + 1.6);
        ctx.fillStyle = "#f3d796"; circle(sx, sy, sr);
        ctx.fillStyle = "#c48f1d"; circle(sx, sy, sr * 0.45);
      });
    };
    const loop = (ms) => { draw(ms); if (running) raf = requestAnimationFrame(loop); };
    size();
    addEventListener("resize", size);
    if (reduced) { draw(0); return; }
    new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }

  /* ----------------------------------------------------------------------
     UNION — the anime-intro roll call
     ---------------------------------------------------------------------- */
  const stage = $(".stage");
  const scenesWrap = $(".scenes");

  function idcard(m, i) {
    const pic = m.photo
      ? `<img src="${esc(m.photo)}" alt="${esc(m.name || m.role)}" loading="lazy">`
      : `<svg viewBox="0 0 120 140" aria-hidden="true"><use href="#bust"/></svg>`;
    return `
      <div class="idcard">
        <span class="strap"></span><span class="clip"></span>
        <div class="holder">
          <div class="inner">${pic}</div>
          <span class="role-tag">${esc(m.role)}</span>
        </div>
      </div>`;
  }

  const splitName = (name) =>
    name.split(/\s+/).map((w) => `<span class="w">${[...w].map((c) => `<span class="ch">${esc(c)}</span>`).join("")}</span>`).join(" ");

  scenesWrap.innerHTML = D.union.map((m, i) => `
    <article class="scene" data-i="${i}">
      ${idcard(m, i)}
      <div class="scene-text">
        <div class="scene-top">
          <span class="scene-hash" aria-hidden="true">#</span>
          <span class="scene-file">File 0${i + 1} / The Union<b>${esc(m.role)}</b></span>
        </div>
        <h3 class="scene-name" aria-label="${esc(m.name || "Name to be announced")}">${splitName(m.name || "Name TBA")}</h3>
        <div class="scene-meta">${courseYear(m) ? esc(courseYear(m)) : "Course · Year"}</div>
        <p class="scene-line"><span class="hl"></span><span class="txt">${ph(m.line, "One-line description goes here.")}</span></p>
      </div>
    </article>`).join("");

  $(".stage-index").innerHTML = D.union.map((m, i) => `<li><span>0${i + 1} ${esc(m.role)}</span></li>`).join("");

  const scenes = $$(".scene", stage);
  const flash = $(".flash", stage);
  const speed = $(".speedlines", stage);
  const burst = $(".burst", stage);
  const wipeBands = $$(".wipe i", stage);
  burst.innerHTML = "<i></i>".repeat(14);
  const shards = $$("i", burst);

  function drawSpeedlines(cx, cy) {
    const w = stage.clientWidth, h = stage.clientHeight;
    const far = Math.hypot(w, h);
    const R = gsap.utils.random;
    let out = "";
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2 + R(-0.02, 0.02);
      const da = R(0.004, 0.014);
      const r0 = R(Math.min(w, h) * 0.28, Math.min(w, h) * 0.5);
      const p = (ang, r) => `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
      out += `<polygon points="${p(a, r0)} ${p(a - da, far)} ${p(a + da, far)}"/>`;
    }
    speed.setAttribute("viewBox", `0 0 ${w} ${h}`);
    speed.innerHTML = out;
  }

  function centerOf(el) {
    const a = el.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return [a.left - b.left + a.width / 2, a.top - b.top + a.height / 2];
  }

  // flash + shake + speed lines (+ shards on the big hits)
  function impact(el, power) {
    const [cx, cy] = centerOf(el);
    const R = gsap.utils.random;
    const tl = gsap.timeline();
    drawSpeedlines(cx, cy);
    const s = 18 * power;
    tl.fromTo(flash, { opacity: 0.85 * power }, { opacity: 0, duration: 0.18 + 0.25 * power, ease: "power2.out" }, 0)
      .fromTo(speed, { opacity: Math.min(1, 0.4 + power) }, { opacity: 0, duration: 0.7, ease: "power2.out" }, 0)
      .fromTo(scenesWrap, { x: 0, y: 0 }, { keyframes: { x: [0, -s, s * 0.8, -s * 0.5, s * 0.3, 0], y: [0, s * 0.6, -s * 0.5, s * 0.3, -s * 0.1, 0] }, duration: 0.42, ease: "none" }, 0);
    if (power >= 1) {
      shards.forEach((sh, j) => {
        const ang = (j / shards.length) * 360 + R(-10, 10);
        const rad = (ang * Math.PI) / 180;
        const r0 = R(50, 110), r1 = r0 + R(120, 230);
        tl.fromTo(sh,
          { x: cx + Math.sin(rad) * r0, y: cy - Math.cos(rad) * r0, rotation: ang, scale: 0, opacity: 1 },
          { x: cx + Math.sin(rad) * r1, y: cy - Math.cos(rad) * r1, scale: R(0.6, 1.3), duration: 0.5, ease: "power3.out" }, 0)
          .to(sh, { opacity: 0, duration: 0.2 }, 0.38);
      });
    }
    return tl;
  }

  function sceneIntro(s) {
    const q = (x) => $(x, s);
    const card = q(".idcard"), tag = q(".role-tag"), hash = q(".scene-hash"), file = q(".scene-file");
    const name = q(".scene-name"), chars = $$(".ch", s), meta = q(".scene-meta"), hl = q(".hl"), txt = q(".txt");
    const R = gsap.utils.random;
    const each = 0.035, dur = 0.3;
    const nameEnd = 0.62 + dur + each * (chars.length - 1);

    return gsap.timeline()
      // badge swings down on its lanyard
      .fromTo(card, { y: -innerHeight * 1.1, rotation: -16 }, { y: 0, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.45)" }, 0)
      .fromTo(tag, { scaleX: 0, rotation: -24 }, { scaleX: 1, rotation: -4, duration: 0.3, ease: "back.out(3)" }, 0.5)
      .fromTo(hash, { scale: 3.4, autoAlpha: 0, rotation: -40 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.3, ease: "back.out(2.4)" }, 0.15)
      .fromTo(file, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out" }, 0.3)
      // BAM — the name slams in
      .fromTo(chars,
        { autoAlpha: 0, scale: 3.2, y: -50, rotation: () => R(-35, 35) },
        { autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: dur, ease: "power4.in", stagger: each }, 0.62)
      .add(() => impact(name, 1), nameEnd - 0.02)
      .to(chars, { scaleY: 0.8, scaleX: 1.15, duration: 0.06, yoyo: true, repeat: 1, ease: "power1.out" }, nameEnd)
      // BAM — course & year stamped
      .fromTo(meta, { autoAlpha: 0, scale: 2.6, rotation: -20 }, { autoAlpha: 1, scale: 1, rotation: -4, duration: 0.22, ease: "power4.in" }, nameEnd + 0.35)
      .add(() => impact(meta, 0.45), nameEnd + 0.56)
      // BAM — the one-liner slaps on
      .fromTo(hl, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power4.inOut" }, nameEnd + 0.85)
      .fromTo(txt, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.28, ease: "power3.out" }, nameEnd + 1.02)
      .add(() => impact(hl, 0.25), nameEnd + 1.05)
      // and then it breathes
      .to(card, { rotation: 2.5, duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: `50% ${-innerHeight * 0.3}px` }, nameEnd + 1.3);
  }

  let current = -1, sceneTl = null;
  function playScene(i) {
    if (i === current) return;
    const prev = current;
    current = i;
    $$(".stage-index li").forEach((li, j) => li.classList.toggle("is-on", j === i));
    if (sceneTl) sceneTl.kill();
    gsap.killTweensOf([scenesWrap, flash, speed, ...shards]);
    gsap.set(scenesWrap, { x: 0, y: 0 });
    gsap.set([flash, speed], { opacity: 0 });
    gsap.set(shards, { opacity: 0 });

    const s = scenes[i];
    const tl = gsap.timeline();
    sceneTl = tl;
    if (prev >= 0) {
      // smash cut: diagonal bands sweep across
      tl.set(wipeBands, { x: 0, xPercent: -130, skewX: -18 })
        .to(wipeBands, { xPercent: 0, duration: 0.24, ease: "power3.in", stagger: 0.05 });
    }
    tl.add(() => scenes.forEach((x) => x.classList.toggle("is-active", x === s)));
    if (prev >= 0) tl.to(wipeBands, { xPercent: 130, duration: 0.32, ease: "power3.out", stagger: 0.05 });
    tl.add(sceneIntro(s), prev >= 0 ? "-=0.32" : 0);
  }

  function setupUnion() {
    const n = D.union.length;
    if (!hasGsap || reduced) {
      stage.classList.add("stage--static");
      scenes.forEach((s) => s.classList.add("is-active"));
      return;
    }
    gsap.set(wipeBands, { x: 0, xPercent: -130, skewX: -18 });   // x:0 drops the CSS translate

    ScrollTrigger.create({
      trigger: stage, start: "top 40%",
      onEnter: () => current < 0 && playScene(0),
    });
    ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: () => `+=${n * innerHeight * 0.9}`,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => playScene(Math.min(n - 1, Math.floor(self.progress * n))),
    });
  }

  /* ----------------------------------------------------------------------
     CREW grid
     ---------------------------------------------------------------------- */
  const crewGrid = $(".crew-grid");
  crewGrid.innerHTML = D.union.map((m, i) => `
    <article class="crew-card">
      ${idcard(m, i)}
      <h4>${m.name ? esc(m.name) : "Name TBA"}</h4>
      <p class="meta">${courseYear(m) ? esc(courseYear(m)) : "Course · Year"}</p>
      <p class="line">${ph(m.line, "One-line description")}</p>
    </article>`).join("");

  function setupCrew() {
    if (!hasGsap || reduced) return;
    const cards = $$(".crew-card", crewGrid);
    gsap.set(cards, { autoAlpha: 0, y: -160, rotation: () => gsap.utils.random(-14, 14) });
    ScrollTrigger.create({
      trigger: crewGrid, start: "top 78%", once: true,
      onEnter: () => {
        gsap.to(cards, {
          autoAlpha: 1, y: 0, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.4)", stagger: 0.14,
          onComplete: () => cards.forEach((c, i) =>
            gsap.to(c, { rotation: i % 2 ? 1.6 : -1.6, duration: 2.2 + i * 0.25, yoyo: true, repeat: -1, ease: "sine.inOut" })),
        });
      },
    });
  }

  /* ----------------------------------------------------------------------
     TEAM + HEADS
     ---------------------------------------------------------------------- */
  const arrowDown = `<svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4V19M6 13L12 19L18 13" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  $$(".dept-list").forEach((ul) => {
    ul.innerHTML = D.departments.filter((d) => d.side === ul.dataset.side).map((d) => `
      <li><a href="#dept-${d.id}"><svg class="ic" viewBox="0 0 48 48" aria-hidden="true"><use href="#d-${d.icon}"/></svg><span>${esc(d.name)}</span>${arrowDown}</a></li>`).join("");
  });

  // torn bottom edge on the two side headers
  $$(".side h3").forEach((h, i) => {
    const r = rng(40 + i);
    const pts = ["0 0", "100% 0"];
    for (let x = 100; x >= 0; x -= 2.5) pts.push(`${x}% calc(100% - ${(r() * 9).toFixed(1)}px)`);
    h.style.clipPath = `polygon(${pts.join(",")})`;
  });

  const headCard = (p) => {
    const pic = p.photo
      ? `<img src="${esc(p.photo)}" alt="${esc(p.name || "Department head")}" loading="lazy">`
      : `<svg viewBox="0 0 120 140" aria-hidden="true"><use href="#bust"/></svg>`;
    const link = p.portfolio
      ? `<a class="head-link" href="${esc(p.portfolio)}" target="_blank" rel="noopener">Portfolio / Resume <span aria-hidden="true">↗</span></a>`
      : `<span class="head-link is-empty">Link coming soon</span>`;
    return `
      <div class="head-slot" data-glide>
        <article class="head-card">
          <span class="tape" aria-hidden="true"></span>
          <div class="head-photo">${pic}</div>
          <h4>${p.name ? esc(p.name) : "Name TBA"}</h4>
          <p class="meta">${courseYear(p) ? esc(courseYear(p)) : "Course · Year"}</p>
          ${link}
        </article>
      </div>`;
  };

  let blocks = "";
  ["Technical", "Non-Technical"].forEach((side) => {
    blocks += `<h3 class="side-heading" data-glide>${side}</h3>`;
    D.departments.filter((d) => d.side === side).forEach((d) => {
      blocks += `
        <div class="dept-block" id="dept-${d.id}">
          <div class="dept-head" data-glide>
            <svg viewBox="0 0 48 48" aria-hidden="true"><use href="#d-${d.icon}"/></svg>
            <h3>${esc(d.name)}</h3>
            <small>${d.heads.length > 1 ? "Heads" : "Head"}</small>
          </div>
          <div class="head-row">${d.heads.map(headCard).join("")}</div>
        </div>`;
    });
  });
  $(".dept-blocks").innerHTML = blocks;

  function setupGlides() {
    if (!hasGsap || reduced) return;
    const items = $$("[data-glide], .sec-head, .sea-intro > *, .crew-title");
    const base = new Map(items.map((el) => [el, gsap.getProperty(el, "rotation")]));   // keep any CSS tilt
    gsap.set(items, { autoAlpha: 0, y: 90 });
    ScrollTrigger.batch(items, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.fromTo(batch,
        { autoAlpha: 0, y: 90, rotation: (i, el) => base.get(el) + gsap.utils.random(-5, 5) },
        { autoAlpha: 1, y: 0, rotation: (i, el) => base.get(el), duration: 1.1, ease: "power3.out", stagger: 0.12, overwrite: true }),
    });
  }

  /* ----------------------------------------------------------------------
     MINI BAR
     ---------------------------------------------------------------------- */
  function setupMinibar() {
    const bar = $(".minibar");
    const set = (on) => {
      bar.classList.toggle("is-on", on);
      bar.setAttribute("aria-hidden", on ? "false" : "true");
      $$("a, button", bar).forEach((el) => (el.tabIndex = on ? 0 : -1));
    };
    if (hasGsap) {
      ScrollTrigger.create({ trigger: hero, start: "bottom 12%", onEnter: () => set(true), onLeaveBack: () => set(false) });
    } else {
      addEventListener("scroll", () => set(scrollY > innerHeight * 0.88), { passive: true });
    }
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
  $(".chips", form).innerHTML = D.departments.map((d) =>
    `<label class="chip"><input type="checkbox" name="departments" value="${esc(d.name)}"><span>${esc(d.name)}</span></label>`).join("");

  function openJoin(e) {
    lastFocus = e && e.currentTarget;
    modal.hidden = false;
    lenis && lenis.stop();
    document.documentElement.style.overflow = "hidden";
    if (hasGsap && !reduced) {
      gsap.fromTo($(".join-backdrop", modal), { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(sheet, { y: 140, rotation: -7, scale: 0.9, autoAlpha: 0 }, { y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(1.5)" });
    }
    setTimeout(() => $("input, select, textarea", form.hidden ? done : form)?.focus(), 80);
  }

  function closeJoin() {
    const finish = () => {
      modal.hidden = true;
      document.documentElement.style.overflow = "";
      lenis && lenis.start();
      lastFocus && lastFocus.focus();
      if (!done.hidden) {   // reset for next time
        form.reset();
        form.hidden = false;
        done.hidden = true;
      }
    };
    if (hasGsap && !reduced) {
      gsap.to($(".join-backdrop", modal), { opacity: 0, duration: 0.25 });
      gsap.to(sheet, { y: 120, rotation: 6, autoAlpha: 0, duration: 0.3, ease: "power2.in", onComplete: finish });
    } else finish();
  }

  $$("[data-open-join]").forEach((b) => b.addEventListener("click", openJoin));
  $$("[data-close-join]", modal).forEach((b) => b.addEventListener("click", closeJoin));
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeJoin();
    if (e.key === "Tab") {   // keep focus inside the sheet
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

    const payload = Object.fromEntries(new FormData(form));
    payload.departments = new FormData(form).getAll("departments");
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
        console.info("[Nexora] No formEndpoint set in js/data.js — application not sent:", payload);
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
      errBox.textContent = "Couldn't send that — check your connection and try again.";
    } finally {
      btn.disabled = false;
      $("span", btn).textContent = "Send application";
    }
  });

  /* ----------------------------------------------------------------------
     go
     ---------------------------------------------------------------------- */
  const stageSea = $(".stage .drifters");
  const crew = $(".crew");
  const crewSea = document.createElement("div");
  crewSea.className = "drifters crew-drifters";
  crew.prepend(crewSea);

  function start() {
    heroIntro();
    setupUnion();
    setupCrew();
    setupGlides();
    setupMinibar();
    if (hasGsap) {
      const t1 = populateSea(stageSea, { fish: 4, plankton: 22, bubbles: 14 });
      const t2 = populateSea(crewSea, { fish: 3, plankton: 14, bubbles: 10 });
      const t3 = seaweed($(".weeds"));
      pauseWhenHidden(stage, [t1]);
      pauseWhenHidden(crew, [t2, t3]);
    }
    tentacle($(".tentacle"));
    hasGsap && ScrollTrigger.refresh();
  }

  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  fontsReady.then(start);
  addEventListener("load", () => hasGsap && ScrollTrigger.refresh());
})();
