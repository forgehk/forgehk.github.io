/* hkforge.dev v4 interactions. Lenis for smooth scroll, GSAP + ScrollTrigger for motion. Everything degrades: no JS, no problem. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined";
  root.classList.remove("no-js"); root.classList.add("js");
  if (hasGsap && typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== "undefined" && !reduce && window.matchMedia("(hover:hover)").matches) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (hasGsap) lenis.on("scroll", ScrollTrigger.update);
    d.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").replace("/", ""); var el = d.querySelector(id);
        if (el) {
          e.preventDefault();
          root.classList.remove("menu-open"); lenis.start();
          lenis.scrollTo(el, { offset: 0, duration: 1.4, force: true });
          history.replaceState(null, "", id);
        }
      });
    });
  }

  /* ---------- hero: name marquee, parallax, arrival ---------- */
  var heroStarted = false;
  function startHero() {
    if (heroStarted) return; heroStarted = true;
    var name = d.querySelector(".hero .name .track");
    if (name && hasGsap && !reduce) {
      var w1 = name.children[0].getBoundingClientRect().width;
      gsap.to(name, { x: -w1, duration: 22, ease: "none", repeat: -1 });
      if (typeof ScrollTrigger !== "undefined") {
        gsap.to(".hero .bg img", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero .name", { xPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      }
    }
    /* arrival is a CSS transition, so it does not depend on animation frames */
    var hero = d.querySelector(".hero");
    if (hero) setTimeout(function () { void hero.offsetWidth; hero.classList.add("in"); }, 60);
  }

  /* ---------- preloader: a few words, then lift ---------- */
  var pre = d.querySelector(".preloader");
  var seen = false; try { seen = sessionStorage.getItem("hk-seen") === "1"; } catch (e) {}
  function finishPre() { if (!pre) return; pre.classList.add("done"); try { sessionStorage.setItem("hk-seen", "1"); } catch (e) {} startHero(); }
  if (pre && !seen && !reduce) {
    var words = ["Hello", "Salaam", "Hola", "Bonjour", "Ciao", "Hasan Karakra"];
    var w = pre.querySelector(".word"), i = 0;
    lenis && lenis.stop();
    var tick = function () {
      w.textContent = words[i]; i++;
      if (i < words.length) setTimeout(tick, i === 1 ? 700 : 190);
      else setTimeout(function () { pre.classList.add("lift"); setTimeout(function () { finishPre(); lenis && lenis.start(); }, 950); }, 350);
    };
    tick();
    /* hard stop: nothing keeps the curtain down past 4.5 s, whatever the tab is doing */
    setTimeout(function () { if (!pre.classList.contains("done")) { finishPre(); lenis && lenis.start(); } }, 4500);
  } else { finishPre(); }

  /* frame watchdog: if animation frames never arrive (background tab, some embedded browsers),
     drop every scroll-driven reveal so nothing stays hidden */
  var frames = 0;
  (function pump() { frames++; requestAnimationFrame(pump); })();
  setTimeout(function () { if (frames < 5) root.classList.add("still"); }, 2500);
  d.addEventListener("visibilitychange", function () { if (!d.hidden && hasGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh(); });

  if (!pre) startHero();

  /* ---------- line reveals ---------- */
  if (hasGsap && !reduce && typeof ScrollTrigger !== "undefined") {
    d.querySelectorAll(".lines").forEach(function (el) {
      /* split by words into lines measured at runtime */
      var text = el.textContent.trim().split(/\s+/); el.textContent = "";
      var frag = d.createDocumentFragment();
      text.forEach(function (word, idx) { var s = d.createElement("span"); s.className = "w"; s.textContent = word + (idx < text.length - 1 ? " " : ""); s.style.display = "inline"; frag.appendChild(s); });
      el.appendChild(frag);
      var lines = [], lastTop = null, cur = null;
      el.querySelectorAll(".w").forEach(function (s) {
        var top = s.getBoundingClientRect().top;
        if (lastTop === null || Math.abs(top - lastTop) > 4) { cur = []; lines.push(cur); lastTop = top; }
        cur.push(s);
      });
      el.textContent = "";
      lines.forEach(function (ws) {
        var outer = d.createElement("span"); outer.className = "line-in";
        var inner = d.createElement("span"); inner.textContent = ws.map(function (s) { return s.textContent; }).join("");
        outer.appendChild(inner); el.appendChild(outer);
      });
      gsap.to(el.querySelectorAll(".line-in > span"), { y: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    d.querySelectorAll(".fade").forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: "top 88%", onEnter: function () { el.classList.add("in"); } });
    });
    d.querySelectorAll(".strip img").forEach(function (im) {
      gsap.fromTo(im, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
    setTimeout(function () { d.querySelectorAll(".fade").forEach(function (el) { el.classList.add("in"); }); }, 4000);
  } else {
    d.querySelectorAll(".fade").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- work list: cursor-following preview (transforms only, so it stays sharp) ---------- */
  var preview = d.querySelector(".preview"), tag = d.querySelector(".cursor-tag"), list = d.querySelector(".list");
  var hoverOK = window.matchMedia("(hover:hover)").matches;
  if (preview && list && hasGsap && hoverOK) {
    gsap.set([preview, tag], { xPercent: -50, yPercent: -50 });
    var px = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3" }), py = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3" });
    var tx = gsap.quickTo(tag, "x", { duration: 0.35, ease: "power3" }), ty = gsap.quickTo(tag, "y", { duration: 0.35, ease: "power3" });
    var imgs = preview.querySelectorAll("img");
    var showCard = function (on) { preview.classList.toggle("on", on); tag.classList.toggle("on", on); };
    list.addEventListener("mousemove", function (e) { px(e.clientX); py(e.clientY); tx(e.clientX); ty(e.clientY); });
    list.querySelectorAll(".item").forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        var k = item.getAttribute("data-shot");
        imgs.forEach(function (im) { im.classList.toggle("on", im.getAttribute("data-key") === k); });
        var isOpen = item.classList.contains("open");
        tag.textContent = isOpen ? "Close" : "Open";
        preview.classList.toggle("on", !isOpen); tag.classList.add("on");
      });
    });
    list.querySelectorAll(".case").forEach(function (c) { c.addEventListener("mouseenter", function () { showCard(false); }); });
    list.addEventListener("mouseleave", function () { showCard(false); });
  }

  /* ---------- case panels: one open at a time, grid-row transition (no height measuring) ---------- */
  if (list) {
    var items = list.querySelectorAll(".item");
    var setOpen = function (item, open) {
      var panel = d.getElementById(item.getAttribute("aria-controls"));
      item.classList.toggle("open", open); item.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.classList.toggle("open", open);
    };
    var toggle = function (item) {
      var willOpen = !item.classList.contains("open");
      items.forEach(function (o) { if (o !== item && o.classList.contains("open")) setOpen(o, false); });
      setOpen(item, willOpen);
      if (preview && hoverOK) { preview.classList.remove("on"); tag.textContent = willOpen ? "Close" : "Open"; }
      if (willOpen) setTimeout(function () {
        var top = item.getBoundingClientRect().top;
        if (top < 0 || top > window.innerHeight * 0.4) { lenis ? lenis.scrollTo(item, { offset: -90, duration: 1.1 }) : window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" }); }
      }, 60);
      if (hasGsap && typeof ScrollTrigger !== "undefined") setTimeout(function () { ScrollTrigger.refresh(); }, 900);
    };
    items.forEach(function (item) {
      item.addEventListener("click", function () { toggle(item); });
      item.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(item); } });
    });
    /* deep link: /#case-keykarams opens that case */
    if (location.hash && location.hash.indexOf("#case-") === 0) {
      var target = d.querySelector('.item[aria-controls="' + location.hash.slice(1) + '"]');
      if (target) setTimeout(function () { toggle(target); }, seen ? 300 : 3600);
    }
  }

  /* ---------- magnetic buttons ---------- */
  if (hasGsap && window.matchMedia("(hover:hover)").matches && !reduce) {
    d.querySelectorAll(".roundbtn, .pill, .menu-btn").forEach(function (b) {
      var xTo = gsap.quickTo(b, "x", { duration: 0.6, ease: "elastic.out(1,0.4)" }), yTo = gsap.quickTo(b, "y", { duration: 0.6, ease: "elastic.out(1,0.4)" });
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect(); xTo((e.clientX - (r.left + r.width / 2)) * 0.35); yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      b.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- menu ---------- */
  var menuBtn = d.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = root.classList.toggle("menu-open"); menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    d.querySelectorAll(".drawer a").forEach(function (a) { a.addEventListener("click", function () { root.classList.remove("menu-open"); lenis && lenis.start(); }); });
    /* past the top of the hero the header slides away and the round button takes over (plain scroll listener, works without animation frames) */
    var onScroll = function () { var y = window.scrollY || root.scrollTop; menuBtn.classList.toggle("show", y > 200); root.classList.toggle("scrolled", y > 200); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* ---------- local time ---------- */
  var clock = d.querySelector("[data-clock]");
  if (clock) {
    var setClock = function () {
      try { clock.textContent = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "America/Los_Angeles", timeZoneName: "short" }).format(new Date()); } catch (e) {}
    };
    setClock(); setInterval(setClock, 30000);
  }
  d.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
