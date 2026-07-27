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
  const consent = $("#cf-consent");
  const submit = $("#cf-submit");
  const consentRow = consent.closest(".consent");

  // Кнопка недоступна, пока не отмечено согласие на обработку ПДн
  const syncConsent = () => {
    submit.disabled = !consent.checked;
    if (consent.checked) consentRow.classList.remove("is-hint");
  };
  consent.addEventListener("change", syncConsent);
  syncConsent();

  // Клик по заблокированной кнопке ничего не даёт, поэтому объясняем причину
  submit.addEventListener("click", (e) => {
    if (submit.disabled) {
      e.preventDefault();
      consentRow.classList.add("is-hint");
      consentRow.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = $("#cf-phone");
    const error = $("#cf-phone-error");
    if (!phoneValid(phone.value)) {
      error.textContent = "Введите телефон в формате +7 (XXX) XXX-XX-XX";
      phone.focus();
      return;
    }
    if (!consent.checked) return;

    // Момент согласия фиксируется и ушёл бы вместе с заявкой: на боевом сайте
    // это доказательство того, что галочка была проставлена
    $("#cf-consent-ts").value = new Date().toISOString();

    error.textContent = "";
    form.reset();
    syncConsent();
    showToast("Спасибо! Заявка принята — перезвоним в течение 15 минут (демо-режим: данные никуда не отправляются).");
  });
}

/* ===== Cookie consent =====
   Аналитика на боевом сайте подключается только из loadAnalytics(),
   то есть после явного «Принять». До этого не грузится ничего. */
const cookieBanner = $("#cookie-banner");
if (cookieBanner) {
  const KEY = "rr_cookie_consent";
  const TTL = 365 * 24 * 60 * 60 * 1000; // 12 месяцев

  const readChoice = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (Date.now() - saved.ts > TTL) {
        localStorage.removeItem(KEY);
        return null;
      }
      return saved.value;
    } catch {
      return null;
    }
  };

  const saveChoice = (value) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ value, ts: Date.now() }));
    } catch {
      /* приватный режим — просто не запоминаем выбор */
    }
  };

  const loadAnalytics = () => {
    // Здесь подключается счётчик клиента (Яндекс Метрика).
    // Демо-сайт аналитику не грузит, поэтому тело пустое.
  };

  const choice = readChoice();
  if (choice === "accepted") loadAnalytics();
  else if (choice !== "declined") cookieBanner.hidden = false;

  $("#cookie-accept").addEventListener("click", () => {
    saveChoice("accepted");
    loadAnalytics();
    cookieBanner.hidden = true;
  });

  $("#cookie-decline").addEventListener("click", () => {
    saveChoice("declined");
    cookieBanner.hidden = true;
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

/* ===== Portfolio videos =====
   Десктоп (мышь): ролик играет только пока на карточке курсор.
   Тач-устройства: автозапуск, пока карточка на экране. */
const portfolioVideos = $$(".project__video");
if (portfolioVideos.length) {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const playSafe = (v) => {
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    v.closest(".project")?.classList.add("is-playing");
  };
  const stop = (v) => {
    v.pause();
    v.closest(".project")?.classList.remove("is-playing");
  };

  if (canHover) {
    portfolioVideos.forEach((v) => {
      const card = v.closest(".project");
      if (!card) return;
      card.addEventListener("mouseenter", () => playSafe(v));
      card.addEventListener("mouseleave", () => stop(v));
      // клавиатурная навигация: фокус на карточке ведёт себя как наведение
      card.addEventListener("focusin", () => playSafe(v));
      card.addEventListener("focusout", () => stop(v));
    });
  }

  if (!("IntersectionObserver" in window)) {
    // без observer тач-устройствам остаётся постер, это не ломает секцию
  } else {
    const vObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target;
          if (canHover) {
            // мышь: тянем только заголовок файла, чтобы старт по наведению был быстрым,
            // но трафик не расходовался на три ролика целиком без единого наведения
            if (entry.isIntersecting && v.preload === "none") {
              v.preload = "metadata";
              v.load();
            }
            return;
          }
          if (reduceMotion) return; // уважаем системную настройку «меньше движения»
          if (entry.isIntersecting) playSafe(v);
          else stop(v);
        });
      },
      { threshold: 0.35 }
    );
    portfolioVideos.forEach((v) => vObserver.observe(v));
  }
}
