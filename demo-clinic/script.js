/* =========================================================
   DÉMO 2 — Balance Physio : interactions
   ========================================================= */
(function () {
  "use strict";

  /* À PERSONNALISER : créneaux (fictifs) */
  const WEEKDAY_SLOTS = ["08:00", "08:45", "09:30", "10:15", "11:00", "11:45", "14:00", "14:45", "15:30", "16:15", "17:00", "17:45", "18:30"];
  const SATURDAY_SLOTS = ["09:00", "09:45", "10:30", "11:15", "12:00"];
  const BOOKABLE_DAYS = 15;   // nombre de jours proposés
  const DAYS_PER_PAGE = 5;

  /* ---------- Menu burger ---------- */
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("main-nav");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });

  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", function () { header.classList.toggle("is-scrolled", window.scrollY > 10); }, { passive: true });

  /* ---------- Apparition au scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + "ms"; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Sélecteur de créneaux ---------- */
  const daysEl = document.getElementById("days");
  const slotsEl = document.getElementById("slots");
  const prevBtn = document.getElementById("days-prev");
  const nextBtn = document.getElementById("days-next");
  const selectionEl = document.getElementById("selection");
  const slotsDayLabel = document.getElementById("slots-day-label");
  const slotError = document.getElementById("slot-error");

  const fmtDow = { weekday: "short" };
  const fmtLong = { weekday: "long", day: "numeric", month: "long" };

  // Générateur pseudo-aléatoire déterministe : mêmes disponibilités à chaque visite pour une date donnée
  function seeded(seed) {
    let x = seed % 2147483647; if (x <= 0) x += 2147483646;
    return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
  }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  // Liste des jours ouvrés à partir de demain (dimanche fermé)
  const days = [];
  const cursor = new Date(); cursor.setHours(0, 0, 0, 0);
  while (days.length < BOOKABLE_DAYS) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() === 0) continue;
    const date = new Date(cursor);
    const base = date.getDay() === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
    const rand = seeded(date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate());
    const slots = base.map(function (time) { return { time: time, free: rand() > 0.42 }; });
    days.push({ date: date, id: iso(date), slots: slots });
  }

  let page = 0;
  let selectedDay = days[0];
  let selectedTime = null;

  function renderDays() {
    daysEl.innerHTML = "";
    days.slice(page * DAYS_PER_PAGE, page * DAYS_PER_PAGE + DAYS_PER_PAGE).forEach(function (day) {
      const freeCount = day.slots.filter(function (s) { return s.free; }).length;
      const wrap = document.createElement("div");
      wrap.className = "chip day-chip";
      const id = "day-" + day.id;
      wrap.innerHTML =
        '<input type="radio" name="day" id="' + id + '" value="' + day.id + '"' +
        (day === selectedDay ? " checked" : "") + (freeCount === 0 ? " disabled" : "") + ">" +
        '<label for="' + id + '" aria-label="' + day.date.toLocaleDateString("en-GB", fmtLong) + ", " + freeCount + ' times available">' +
        '<span class="dow">' + day.date.toLocaleDateString("en-GB", fmtDow) + "</span>" +
        '<span class="dnum">' + day.date.getDate() + "</span>" +
        '<span class="dmon">' + day.date.toLocaleDateString("en-GB", { month: "short" }) + "</span></label>";
      wrap.querySelector("input").addEventListener("change", function () {
        selectedDay = day; selectedTime = null; renderSlots(); updateSelection();
      });
      daysEl.appendChild(wrap);
    });
    prevBtn.disabled = page === 0;
    nextBtn.disabled = (page + 1) * DAYS_PER_PAGE >= days.length;
  }

  function renderSlots() {
    slotsEl.innerHTML = "";
    slotsDayLabel.textContent = "— " + selectedDay.date.toLocaleDateString("en-GB", fmtLong);
    const free = selectedDay.slots.filter(function (s) { return s.free; });
    if (!free.length) {
      slotsEl.innerHTML = '<p class="slots-empty">Fully booked on this day. Please choose another day.</p>';
      return;
    }
    selectedDay.slots.forEach(function (slot, i) {
      const wrap = document.createElement("div");
      wrap.className = "chip slot-chip";
      wrap.style.animationDelay = i * 25 + "ms";
      const id = "slot-" + selectedDay.id + "-" + slot.time.replace(":", "");
      wrap.innerHTML =
        '<input type="radio" name="slot" id="' + id + '" value="' + slot.time + '"' +
        (slot.free ? "" : " disabled") + (slot.time === selectedTime ? " checked" : "") + ">" +
        '<label for="' + id + '">' + slot.time + (slot.free ? "" : '<span class="sr-only"> (booked)</span>') + "</label>";
      wrap.querySelector("input").addEventListener("change", function () {
        selectedTime = slot.time; slotError.textContent = ""; updateSelection();
      });
      slotsEl.appendChild(wrap);
    });
  }

  function updateSelection() {
    if (selectedTime) {
      selectionEl.textContent = "Selected: " + selectedDay.date.toLocaleDateString("en-GB", fmtLong) + " at " + selectedTime;
      selectionEl.classList.add("has-slot");
    } else {
      selectionEl.textContent = "No time selected yet.";
      selectionEl.classList.remove("has-slot");
    }
  }

  prevBtn.addEventListener("click", function () { if (page > 0) { page--; renderDays(); } });
  nextBtn.addEventListener("click", function () { if ((page + 1) * DAYS_PER_PAGE < days.length) { page++; renderDays(); } });

  // Premier jour disponible sélectionné par défaut
  selectedDay = days.find(function (d) { return d.slots.some(function (s) { return s.free; }); }) || days[0];
  renderDays();
  renderSlots();

  // "Prochain créneau" dans le hero
  const firstFree = selectedDay.slots.find(function (s) { return s.free; });
  if (firstFree) {
    const tomorrow = new Date(); tomorrow.setHours(0, 0, 0, 0); tomorrow.setDate(tomorrow.getDate() + 1);
    const label = selectedDay.date.getTime() === tomorrow.getTime() ? "Tomorrow" : selectedDay.date.toLocaleDateString("en-GB", { weekday: "long" });
    document.getElementById("next-slot").textContent = label + ", " + firstFree.time;
  }

  /* ---------- Validation du formulaire ---------- */
  const form = document.getElementById("booking-form");
  const success = form.querySelector(".form-success");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phonePattern = /^[+\d][\d\s().-]{7,}$/;

  function setError(input, msg) {
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    document.getElementById(input.id + "-error").textContent = msg || "";
    return !msg;
  }
  function validate(input) {
    const v = input.value.trim();
    switch (input.id) {
      case "b-name": return setError(input, v.length < 2 ? "Please enter your full name." : "");
      case "b-email": return setError(input, !v ? "Please enter your email address." : emailPattern.test(v) ? "" : "Please enter a valid email address.");
      case "b-phone": return setError(input, !v ? "Please enter your phone number." : phonePattern.test(v) ? "" : "Please enter a valid phone number.");
      case "b-consent": return setError(input, input.checked ? "" : "Please confirm you agree so we can book your appointment.");
      default: return true;
    }
  }

  const required = form.querySelectorAll("[required]");
  required.forEach(function (input) {
    input.addEventListener("blur", function () { if (input.value && input.type !== "checkbox") validate(input); });
    input.addEventListener("input", function () { if (input.getAttribute("aria-invalid") === "true") validate(input); });
    input.addEventListener("change", function () { if (input.type === "checkbox") validate(input); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let firstInvalid = null;
    if (!selectedTime) {
      slotError.textContent = "Please choose a time slot for your appointment.";
      const firstSlot = slotsEl.querySelector("input:not(:disabled)");
      firstInvalid = firstSlot || prevBtn;
    }
    required.forEach(function (input) { if (!validate(input) && !firstInvalid) firstInvalid = input; });
    if (firstInvalid) { firstInvalid.focus(); return; }

    /*
      À PERSONNALISER — envoi réel :
      const data = new FormData(form); data.append("date", selectedDay.id); data.append("time", selectedTime);
      fetch("https://formspree.io/f/VOTRE_ID", { method: "POST", body: data, headers: { Accept: "application/json" } })
    */
    const name = document.getElementById("b-name").value.trim().split(" ")[0];
    const email = document.getElementById("b-email").value.trim();
    form.querySelectorAll(".booking-step").forEach(function (s) { s.hidden = true; });
    success.hidden = false;
    success.innerHTML =
      '<div class="success-icon" aria-hidden="true">✓</div>' +
      "<h3>You're booked in, " + escapeHtml(name) + "!</h3>" +
      "<p>" + selectedDay.date.toLocaleDateString("en-GB", fmtLong) + " at " + selectedTime +
      ". A confirmation has been sent to " + escapeHtml(email) + ". See you soon!</p>";
    success.setAttribute("tabindex", "-1");
    success.focus();
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  document.querySelectorAll(".year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
