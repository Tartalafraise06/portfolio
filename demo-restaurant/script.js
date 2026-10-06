/* =========================================================
   DÉMO 1 — Chez Marcel : interactions
   ========================================================= */
(function () {
  "use strict";

  /* À PERSONNALISER : horaires d'ouverture (0 = dimanche … 6 = samedi), format "HH:MM" */
  const OPENING_HOURS = {
    0: [["12:00", "15:30"]],
    1: [],
    2: [["12:00", "14:30"], ["19:00", "22:30"]],
    3: [["12:00", "14:30"], ["19:00", "22:30"]],
    4: [["12:00", "14:30"], ["19:00", "22:30"]],
    5: [["12:00", "14:30"], ["19:00", "23:00"]],
    6: [["12:00", "15:00"], ["19:00", "23:00"]]
  };
  const CLOSED_DAYS = [1]; // lundi fermé

  /* ---------- Menu burger ---------- */
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("main-nav");
  function toggleMenu(force) {
    const open = typeof force === "boolean" ? force : burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open && window.innerWidth < 900 ? "hidden" : "";
  }
  burger.addEventListener("click", function () { toggleMenu(); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { toggleMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { toggleMenu(false); burger.focus(); }
  });

  /* ---------- Header + bouton d'appel au scroll ---------- */
  const header = document.querySelector(".site-header");
  const fab = document.querySelector(".call-fab");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
    fab.classList.toggle("is-visible", window.scrollY > 400);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Apparition au scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Onglets du menu (accessibles au clavier) ---------- */
  const tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  const indicator = document.querySelector(".tab-indicator");

  function selectTab(tab, setFocus) {
    tabs.forEach(function (t, i) {
      const selected = t === tab;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
      if (selected) indicator.style.transform = "translateX(" + i * 100 + "%)";
    });
    if (setFocus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- Plat du jour : nom du jour ---------- */
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  document.getElementById("special-day").textContent = dayNames[now.getDay()];

  /* ---------- Horaires : jour courant + "ouvert maintenant" ---------- */
  const todayRow = document.querySelector('.hours-table tr[data-day="' + now.getDay() + '"]');
  if (todayRow) todayRow.classList.add("is-today");

  function toMinutes(hhmm) { const p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const isOpen = OPENING_HOURS[now.getDay()].some(function (slot) {
    return minutesNow >= toMinutes(slot[0]) && minutesNow < toMinutes(slot[1]);
  });
  const openNow = document.getElementById("open-now");
  openNow.textContent = isOpen ? "Open now — see you soon!" : "Closed right now — book ahead for your next visit";
  openNow.style.setProperty("--status", isOpen ? "#7BC67E" : "#C9A45C");

  /* ---------- Formulaire de réservation ---------- */
  const form = document.getElementById("booking-form");
  const success = form.querySelector(".form-success");
  const dateInput = document.getElementById("r-date");

  function isoDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  dateInput.min = isoDate(now);
  const maxDate = new Date(now); maxDate.setMonth(maxDate.getMonth() + 3);
  dateInput.max = isoDate(maxDate);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phonePattern = /^[+\d][\d\s().-]{7,}$/;

  function setError(input, msg) {
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    const el = document.getElementById(input.id + "-error");
    if (el) el.textContent = msg || "";
    return !msg;
  }

  function validate(input) {
    const v = input.value.trim();
    switch (input.id) {
      case "r-date": {
        if (!v) return setError(input, "Please choose a date.");
        const chosen = new Date(v + "T00:00:00");
        if (v < dateInput.min) return setError(input, "This date is in the past. Please choose another day.");
        if (v > dateInput.max) return setError(input, "We take bookings up to 3 months ahead.");
        if (CLOSED_DAYS.indexOf(chosen.getDay()) !== -1) return setError(input, "We're closed on Mondays. Please choose another day.");
        return setError(input, "");
      }
      case "r-time": {
        if (!v) return setError(input, "Please choose a time.");
        // Dimanche : déjeuner uniquement
        if (dateInput.value && new Date(dateInput.value + "T00:00:00").getDay() === 0 && toMinutes(v) >= 19 * 60) {
          return setError(input, "On Sundays we're open for lunch only.");
        }
        return setError(input, "");
      }
      case "r-name": return setError(input, v.length < 2 ? "Please enter your name." : "");
      case "r-email":
        if (!v) return setError(input, "Please enter your email so we can confirm your booking.");
        return setError(input, emailPattern.test(v) ? "" : "Please enter a valid email address.");
      case "r-phone":
        if (!v) return setError(input, "Please enter a phone number in case we need to reach you.");
        return setError(input, phonePattern.test(v) ? "" : "Please enter a valid phone number.");
      default: return true;
    }
  }

  const required = form.querySelectorAll("[required]");
  required.forEach(function (input) {
    input.addEventListener("change", function () { validate(input); if (input === dateInput) validate(document.getElementById("r-time")); });
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
    const d = new Date(dateInput.value + "T00:00:00");
    const dateLabel = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    const guests = document.getElementById("r-guests").value;
    const name = document.getElementById("r-name").value.trim().split(" ")[0];

    form.querySelectorAll("input, select, textarea, button").forEach(function (el) { el.disabled = true; });
    success.hidden = false;
    success.textContent = "Merci, " + name + "! Your request for " + guests + (guests === "1" ? " guest" : " guests") +
      " on " + dateLabel + " at " + document.getElementById("r-time").value + " has been received. We'll confirm by email shortly.";
  });

  /* ---------- Année ---------- */
  document.querySelectorAll(".year").forEach(function (el) { el.textContent = now.getFullYear(); });
})();
