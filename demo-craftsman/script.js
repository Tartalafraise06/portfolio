/* =========================================================
   DÉMO 3 — Atelier Lumière : interactions
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu plein écran (mobile) ---------- */
  const burger = document.querySelector(".burger");
  const burgerLabel = burger.querySelector(".burger-label");
  const nav = document.getElementById("main-nav");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burgerLabel.textContent = open ? "Close" : "Menu";
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); }
  });
  window.addEventListener("resize", function () { if (window.innerWidth >= 900 && nav.classList.contains("is-open")) setMenu(false); });

  /* ---------- Apparition au scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 100 + "ms"; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Galerie filtrable (transitions FLIP) ---------- */
  const filters = document.querySelectorAll(".filter");
  const items = Array.prototype.slice.call(document.querySelectorAll(".work"));
  const status = document.getElementById("filter-status");
  const DURATION = 300;
  let busy = false;

  function applyFilter(category) {
    if (busy) return;
    busy = true;
    const match = function (el) { return category === "all" || el.dataset.category === category; };
    const toHide = items.filter(function (el) { return !el.hidden && !match(el); });
    const toShow = items.filter(function (el) { return el.hidden && match(el); });
    const staying = items.filter(function (el) { return !el.hidden && match(el); });

    // 1. Disparition des éléments filtrés
    toHide.forEach(function (el) { el.classList.add("is-out"); });

    setTimeout(function () {
      // 2. Mémorise les positions de départ
      const first = new Map();
      staying.forEach(function (el) { first.set(el, el.getBoundingClientRect()); });

      // 3. Modifie la grille
      toHide.forEach(function (el) { el.hidden = true; el.classList.remove("is-out"); });
      toShow.forEach(function (el) { el.classList.add("is-out"); el.hidden = false; });

      // 4. Anime les éléments restants vers leur nouvelle position
      staying.forEach(function (el) {
        const a = first.get(el), b = el.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (!dx && !dy) return;
        el.style.transition = "none";
        el.style.transform = "translate(" + dx + "px," + dy + "px)";
        el.getBoundingClientRect(); // force le reflow
        el.style.transition = "transform .55s cubic-bezier(.16,1,.3,1)";
        el.style.transform = "";
      });

      // 5. Apparition des nouveaux éléments
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          toShow.forEach(function (el, i) {
            el.style.transitionDelay = i * 40 + "ms";
            el.classList.remove("is-out");
          });
        });
      });

      setTimeout(function () {
        items.forEach(function (el) { el.style.transition = ""; el.style.transitionDelay = ""; });
        busy = false;
      }, 600);
    }, toHide.length && !reduceMotion ? DURATION : 0);

    const count = items.filter(match).length;
    status.textContent = "Showing " + count + " project" + (count > 1 ? "s" : "") + (category === "all" ? "" : " in " + category) + ".";
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active") || busy) return;
      filters.forEach(function (b) { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
      applyFilter(btn.dataset.filter);
    });
  });

  /* ---------- Lightbox ---------- */
  const dialog = document.getElementById("lightbox");
  const lbArt = document.getElementById("lb-art");
  const lbTitle = document.getElementById("lb-title");
  const lbMeta = document.getElementById("lb-meta");
  const lbDesc = document.getElementById("lb-desc");
  const lbCount = document.getElementById("lb-count");
  let current = 0;
  let lastTrigger = null;

  function visibleButtons() {
    return items.filter(function (el) { return !el.hidden; }).map(function (el) { return el.querySelector(".work-btn"); });
  }

  function show(index) {
    const list = visibleButtons();
    current = (index + list.length) % list.length;
    const btn = list[current];
    const art = btn.querySelector(".work-art");
    lbArt.className = "lb-art " + Array.prototype.filter.call(art.classList, function (c) { return c.indexOf("bg-") === 0; }).join(" ");
    lbArt.innerHTML = "";
    lbArt.appendChild(art.querySelector("svg").cloneNode(true));
    lbTitle.textContent = btn.dataset.title;
    lbMeta.textContent = btn.dataset.meta;
    lbDesc.textContent = btn.dataset.desc;
    lbCount.textContent = (current + 1) + " / " + list.length;
  }

  items.forEach(function (el) {
    const btn = el.querySelector(".work-btn");
    btn.addEventListener("click", function () {
      lastTrigger = btn;
      show(visibleButtons().indexOf(btn));
      if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    });
  });

  dialog.querySelector(".lb-close").addEventListener("click", function () { dialog.close(); });
  dialog.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
  dialog.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  // Clic sur le fond = fermeture
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", function () { if (lastTrigger) lastTrigger.focus(); });

  /* ---------- Formulaire de devis ---------- */
  const form = document.getElementById("quote-form");
  const success = form.querySelector(".form-success");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, msg) {
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    document.getElementById(input.id + "-error").textContent = msg || "";
    return !msg;
  }
  function validate(input) {
    const v = input.value.trim();
    switch (input.id) {
      case "q-name": return setError(input, v.length < 2 ? "Please tell us your name." : "");
      case "q-email": return setError(input, !v ? "Please enter your email address." : emailPattern.test(v) ? "" : "Please enter a valid email address.");
      case "q-type": return setError(input, v ? "" : "Please choose the type of project.");
      case "q-message": return setError(input, v.length < 20 ? "Please describe your project in a few sentences (20 characters minimum)." : "");
      default: return true;
    }
  }

  const required = form.querySelectorAll("[required]");
  required.forEach(function (input) {
    input.addEventListener("blur", function () { if (input.value) validate(input); });
    input.addEventListener("input", function () { if (input.getAttribute("aria-invalid") === "true") validate(input); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let firstInvalid = null;
    required.forEach(function (input) { if (!validate(input) && !firstInvalid) firstInvalid = input; });
    if (firstInvalid) { firstInvalid.focus(); return; }

    /*
      À PERSONNALISER — envoi réel :
      fetch("https://formspree.io/f/VOTRE_ID", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      ou Netlify Forms (data-netlify="true" sur <form>).
    */
    const name = document.getElementById("q-name").value.trim().split(" ")[0];
    form.querySelectorAll("input, select, textarea, button").forEach(function (el) { el.disabled = true; });
    success.hidden = false;
    success.textContent = "Thank you, " + name + ". Your request is on our workbench — we'll reply within two working days.";
  });

  document.querySelectorAll(".year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
