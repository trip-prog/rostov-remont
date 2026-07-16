"use strict";

/* ===== Helpers ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ===== Toast ===== */
function showToast(message, duration = 4500) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("is-visible"), duration);
}

/* ===== Sticky header shadow ===== */
const header = $("#header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ===== Mobile nav ===== */
const burger = $("#burger");
const nav = $("#nav");

burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
});

$$(".nav__link").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
  })
);

/* ===== Phone mask +7 (XXX) XXX-XX-XX ===== */
function maskPhone(input) {
  if (!input) return;
  input.addEventListener("input", () => {
    let digits = input.value.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);

    let out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 4) out += ") " + digits.slice(4, 7);
    if (digits.length >= 7) out += "-" + digits.slice(7, 9);
    if (digits.length >= 9) out += "-" + digits.slice(9, 11);
    input.value = out;
  });
}

const phoneValid = (value) => value.replace(/\D/g, "").length === 11;
maskPhone($("#cf-phone"));

/* ===== Contact form (demo) ===== */
const form = $("#contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = $("#cf-phone");
    const error = $("#cf-phone-error");
    if (!phoneValid(phone.value)) {
      error.textContent = "Введите телефон в формате +7 (XXX) XXX-XX-XX";
      phone.focus();
      return;
    }
    error.textContent = "";
    form.reset();
    showToast("Спасибо! Заявка принята — перезвоним в течение 15 минут (демо-режим: данные никуда не отправляются).");
  });
}

/* ===== Scroll reveal ===== */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals = $$("[data-reveal]");
const revealNow = (el) => el.classList.add("is-revealed");

if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach(revealNow);
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealNow(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => {
    const delay = el.dataset.revealDelay;
    if (delay) el.style.setProperty("--reveal-delay", delay + "ms");
    observer.observe(el);
  });

  // Safety net: if the observer never fires (some embedded webviews),
  // nothing would be revealed — show everything so content is never stuck hidden.
  setTimeout(() => {
    if (!reveals.some((el) => el.classList.contains("is-revealed"))) {
      reveals.forEach(revealNow);
    }
  }, 1500);
}
