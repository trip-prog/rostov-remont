"use strict";

/* Один скрипт на все страницы. Каждый блок сначала проверяет,
   что нужные элементы есть в разметке, и молча выходит, если их нет. */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Toast ===== */
function showToast(message, duration = 4500) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("is-visible"), duration);
}

/* ===== Тень у шапки при прокрутке ===== */
const header = $("#header");
if (header) {
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ===== Выезжающее меню ===== */
const drawer = $("#drawer");
const overlay = $("#drawer-overlay");
const openBtn = $("#menu-open");
const closeBtn = $("#menu-close");

if (drawer && overlay && openBtn) {
  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  const isOpen = () => drawer.classList.contains("is-open");

  function openDrawer() {
    if (isOpen()) return;
    lastFocused = document.activeElement;

    // Компенсируем ширину исчезающей полосы прокрутки, чтобы страница не дёргалась.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) document.body.style.paddingRight = gap + "px";

    drawer.hidden = false;
    overlay.hidden = false;
    // Перерисовка до добавления класса — иначе перехода не будет.
    void drawer.offsetWidth;
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    document.body.classList.add("is-locked");
    openBtn.setAttribute("aria-expanded", "true");

    const first = drawer.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeDrawer({ restoreFocus = true } = {}) {
    if (!isOpen()) return;
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    document.body.style.paddingRight = "";
    openBtn.setAttribute("aria-expanded", "false");

    const finish = () => {
      if (!isOpen()) {
        drawer.hidden = true;
        overlay.hidden = true;
      }
    };
    if (reduceMotion) finish();
    else setTimeout(finish, 420);

    if (restoreFocus && lastFocused) lastFocused.focus();
  }

  openBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", () => closeDrawer());
  overlay.addEventListener("click", () => closeDrawer());

  // Переход по ссылке внутри панели: закрываем без возврата фокуса на кнопку,
  // иначе на якорных ссылках фокус уезжает обратно в шапку.
  $$("a[href]", drawer).forEach((link) =>
    link.addEventListener("click", () => closeDrawer({ restoreFocus: false }))
  );

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeDrawer();
      return;
    }

    // Фокус не должен уходить за пределы открытой панели.
    if (e.key === "Tab") {
      const items = $$(FOCUSABLE, drawer).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

/* ===== Маска телефона +7 (XXX) XXX-XX-XX ===== */
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

/* ===== Форма заявки (демо) ===== */
const form = $("#contact-form");
if (form) {
  const consent = $("#cf-consent");
  const submit = $("#cf-submit");
  const consentRow = consent.closest(".consent");

  // Кнопка выглядит заблокированной, пока не отмечено согласие на обработку
  // ПДн. Настоящий disabled не подходит: с него не приходят события, и
  // объяснить человеку причину было бы нечем — держим блокировку в submit.
  const syncConsent = () => {
    submit.setAttribute("aria-disabled", String(!consent.checked));
    if (consent.checked) consentRow.classList.remove("is-hint");
  };
  consent.addEventListener("change", syncConsent);
  syncConsent();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!consent.checked) {
      consentRow.classList.add("is-hint");
      consentRow.scrollIntoView({ block: "center", behavior: "smooth" });
      consent.focus();
      return;
    }

    const phone = $("#cf-phone");
    const error = $("#cf-phone-error");
    if (!phoneValid(phone.value)) {
      error.textContent = "Введите телефон в формате +7 (XXX) XXX-XX-XX";
      phone.focus();
      return;
    }

    // Момент согласия фиксируется и ушёл бы вместе с заявкой: на боевом сайте
    // это доказательство того, что галочка была проставлена
    $("#cf-consent-ts").value = new Date().toISOString();

    error.textContent = "";
    form.reset();
    syncConsent();
    showToast("Спасибо! Заявка принята — перезвоним в течение 15 минут (демо-режим: данные никуда не отправляются).");
  });
}

/* ===== Cookie =====
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

/* ===== Появление блоков при прокрутке ===== */
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

  // Страховка: если наблюдатель почему-то не сработал (бывает во встроенных
  // webview), показываем всё, чтобы контент не остался скрытым.
  setTimeout(() => {
    if (!reveals.some((el) => el.classList.contains("is-revealed"))) {
      reveals.forEach(revealNow);
    }
  }, 1500);
}

/* ===== Фильтр портфолио ===== */
const grid = $("#portfolio-grid");
if (grid) {
  const buttons = $$("[data-filter-btn]");
  const cards = $$(".project", grid);
  const empty = $("#portfolio-empty");

  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const value = btn.dataset.filterBtn;

      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      let shown = 0;
      cards.forEach((card) => {
        const match = value === "all" || card.dataset.filter === value;
        card.hidden = !match;
        if (match) shown++;
      });

      if (empty) empty.hidden = shown > 0;
    })
  );
}

/* ===== Видео в портфолио =====
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

  if ("IntersectionObserver" in window) {
    const vObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target;
          if (canHover) {
            // мышь: тянем только заголовок файла, чтобы старт по наведению был
            // быстрым, но трафик не расходовался на три ролика целиком
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
  // без IntersectionObserver тач-устройствам остаётся постер — секция не ломается
}

/* ===== Сборка комнаты при прокрутке (только главная) ===== */
const assembly = $("#assembly");
if (assembly) {
  const frames = $$(".assembly__frame", assembly);
  const caption = $("#assembly-caption");
  const dotsWrap = $("#assembly-dots");

  frames.forEach(() => dotsWrap.appendChild(document.createElement("span")));
  const dots = $$("span", dotsWrap);

  if (reduceMotion) {
    assembly.classList.add("assembly--static");
    caption.textContent = frames[frames.length - 1].alt;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === dots.length - 1));
  } else {
    const update = () => {
      const track = assembly.offsetHeight - window.innerHeight;
      if (track <= 0) return;
      const progress = Math.min(1, Math.max(0, -assembly.getBoundingClientRect().top / track));
      const pos = progress * (frames.length - 1);

      // Кадр i проявляется поверх предыдущего на своём отрезке трека
      frames.forEach((frame, i) => {
        frame.style.opacity = i === 0 ? 1 : Math.min(1, Math.max(0, pos - (i - 1)));
      });

      const idx = Math.min(frames.length - 1, Math.round(pos));
      if (caption.textContent !== frames[idx].alt) caption.textContent = frames[idx].alt;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }
}
