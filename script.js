/* =========================================================
   PORTFOLIO — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Menu burger ---------- */
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("main-nav");

  function closeMenu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    nav.classList.remove("is-open");
  }

  burger.addEventListener("click", function () {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    burger.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    nav.classList.toggle("is-open", !open);
  });
  nav.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { closeMenu(); burger.focus(); }
  });

  /* ---------- Bordure du header au scroll ---------- */
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", function () {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  /* ---------- Apparition au scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Accordéon FAQ ---------- */
  document.querySelectorAll(".acc-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("is-open", !expanded);
    });
  });

  /* ---------- Formulaire de contact ---------- */
  const form = document.getElementById("contact-form");
  const success = form.querySelector(".form-success");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    const error = document.getElementById(input.id + "-error");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message || "";
  }

  function validate(input) {
    const value = input.value.trim();
    if (input.required && !value) {
      setError(input, input.id === "c-name" ? "Please enter your name." :
        input.id === "c-email" ? "Please enter your email address." :
        "Please tell me a little about your project.");
      return false;
    }
    if (input.type === "email" && value && !emailPattern.test(value)) {
      setError(input, "Please enter a valid email address (e.g. name@example.com).");
      return false;
    }
    if (input.id === "c-message" && value.length < 10) {
      setError(input, "A few more words would help me prepare your mockup (10 characters minimum).");
      return false;
    }
    setError(input, "");
    return true;
  }

  const requiredFields = form.querySelectorAll("[required]");
  requiredFields.forEach(function (input) {
    input.addEventListener("blur", function () { if (input.value) validate(input); });
    input.addEventListener("input", function () { if (input.getAttribute("aria-invalid") === "true") validate(input); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let firstInvalid = null;
    requiredFields.forEach(function (input) {
      if (!validate(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    /* Envoi à Formspree (l'URL est dans l'attribut action du <form> dans index.html) */
    const name = form.querySelector("#c-name").value.trim().split(" ")[0];
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnLabel = submitBtn.textContent;
    const data = new FormData(form); // lu avant de désactiver les champs (un champ désactivé n'est pas envoyé)
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    success.hidden = true;
    success.classList.remove("is-error");

    fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Formspree error " + response.status);
        form.querySelectorAll("input, select, textarea, button").forEach(function (el) { el.disabled = true; });
        submitBtn.textContent = btnLabel;
        success.hidden = false;
        success.textContent = "Thanks, " + name + "! Your request has been sent. I'll get back to you within 24 hours.";
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = btnLabel;
        success.hidden = false;
        success.classList.add("is-error");
        success.textContent = "Sorry, something went wrong and your message wasn't sent. Please try again, or contact me directly by email or WhatsApp.";
      });
  });

  /* ---------- Année du footer ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
