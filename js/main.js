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

/* ===== Выезжающее меню ===== */
const drawer = $("#drawer");
const overlay = $("#drawer-overlay");
const openBtn = $("#menu-open");
const closeBtn = $("#menu-close");

if (drawer && overlay && openBtn) {
  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;
  const background = $$(".header, main, .footer, #cookie-banner");

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
    background.forEach((el) => { el.inert = true; });

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
    background.forEach((el) => { el.inert = false; });

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

/* Ввод без маски: можно вставить номер и свободно исправить любую цифру. */
const phoneDigits = (value) => value.trim().replace(/[\s()+.\-]/g, "").replace(/^8(?=\d{10}$)/, "7");
const phoneValid = (value) => /^(?:7\d{10}|\d{10})$/.test(phoneDigits(value));
const phoneInput = $("#cf-phone");
phoneInput?.addEventListener("input", () => {
  phoneInput.removeAttribute("aria-invalid");
  $("#cf-phone-error").textContent = "";
});

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
      consentRow.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
      consent.focus();
      return;
    }

    const name = $("#cf-name");
    if (!name.value.trim()) {
      showToast("Укажите ваше имя.");
      name.focus();
      return;
    }
    const phone = $("#cf-phone");
    const error = $("#cf-phone-error");
    if (!phoneValid(phone.value)) {
      error.textContent = "Проверьте номер: например, +7 999 123-45-67.";
      phone.setAttribute("aria-invalid", "true");
      phone.focus();
      return;
    }

    // Момент согласия фиксируется и ушёл бы вместе с заявкой: на боевом сайте
    // это доказательство того, что галочка была проставлена
    $("#cf-consent-ts").value = new Date().toISOString();

    error.textContent = "";
    phone.removeAttribute("aria-invalid");
    form.reset();
    syncConsent();
    showToast("Демонстрация формы завершена. Данные никуда не отправлены.");
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

/* ===== Видео: обычное управление, один ролик за раз ===== */
const portfolioVideos = $$(".project__video");
portfolioVideos.forEach((video) => {
  video.addEventListener("play", () => {
    portfolioVideos.forEach((other) => { if (other !== video) other.pause(); });
  });
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) portfolioVideos.forEach((video) => video.pause());
});

/* ===== Выбор направления работ. Без JavaScript остаются обычные якоря. ===== */
const workFilters = $$("[data-work-filter]");
const workGroups = $$("[data-work-group]");
if (workFilters.length) {
  const selectWorkGroup = (id) => {
    if (id !== "all" && !workGroups.some((group) => group.dataset.workGroup === id)) return;
    workGroups.forEach((group) => { group.hidden = id !== "all" && group.dataset.workGroup !== id; });
    workFilters.forEach((link) => {
      const active = link.dataset.workFilter === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    const count = workGroups.filter((group) => !group.hidden).reduce((total, group) => total + $$(".work-shot", group).length, 0);
    $("#work-count").textContent = `${id === "all" ? "Все направления" : $("span", workFilters.find((link) => link.dataset.workFilter === id)).textContent} · ${count} фото`;
  };
  workFilters.forEach((link) => link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selectWorkGroup(link.dataset.workFilter);
    history.replaceState(null, "", link.getAttribute("href"));
  }));
  const syncWorkHash = () => {
    if (location.hash.startsWith("#work-")) selectWorkGroup(location.hash.slice(6));
    else if (location.hash === "#works" || !location.hash) selectWorkGroup("all");
  };
  window.addEventListener("hashchange", syncWorkHash);
  syncWorkHash();
}

/* ===== Общий просмотр для обложки и галереи ===== */
const workLightbox = $("#work-lightbox");
if (workLightbox && typeof workLightbox.showModal === "function") {
  const photos = $$(".work-shot [data-work-photo]");
  const image = $("#work-lightbox-image");
  const caption = $("#work-lightbox-caption");
  const counter = $("#work-lightbox-counter");
  let opener = null;
  let album = [];
  let index = 0;
  const showPhoto = (next) => {
    index = (next + album.length) % album.length;
    const link = album[index];
    image.src = link.href;
    image.alt = $("img", link).alt;
    caption.textContent = link.dataset.caption;
    counter.textContent = `${index + 1} / ${album.length}`;
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("[data-work-photo]");
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    album = photos.filter((photo) => photo.dataset.group === link.dataset.group);
    if (!album.length) return;
    event.preventDefault();
    opener = link;
    showPhoto(Math.max(0, album.findIndex((photo) => photo.href === link.href)));
    document.body.classList.add("is-locked");
    workLightbox.showModal();
  });
  $("#work-lightbox-prev").addEventListener("click", () => showPhoto(index - 1));
  $("#work-lightbox-next").addEventListener("click", () => showPhoto(index + 1));
  $("#work-lightbox-close").addEventListener("click", () => workLightbox.close());
  workLightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(index + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  workLightbox.addEventListener("click", (event) => {
    if (event.target === workLightbox) workLightbox.close();
  });
  workLightbox.addEventListener("close", () => {
    document.body.classList.remove("is-locked");
    image.removeAttribute("src");
    opener?.focus({ preventScroll: true });
  });
}
