/**
 * Каркас страницы: <head>, шапка, выезжающее меню, подвал.
 * Каждая страница получает `ctx` с полем `base` — префиксом до корня
 * ("" для корневых страниц, "../" для страниц внутри /uslugi/).
 */

import { site, icons, services, categories, mainNav, legalDocs } from "./site.data.mjs";

// Версия ссылок на css/js. Поднимается при изменении стилей или скриптов,
// чтобы у вернувшихся посетителей не осталась старая версия в кэше.
export const ASSET_VERSION = "7";

/** Иконка в единой обёртке: тонкая линия, наследует цвет текста. */
export const icon = (name, cls = "") =>
  `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ""}</svg>`;

/**
 * Ссылка от корня сайта → ссылка относительно текущей страницы.
 * Глубина всего две: корень (base "") и папка услуг (base "../"),
 * поэтому достаточно срезать общий префикс вместо разбора пути.
 */
function href(target, base) {
  const currentDir = base === "" ? "" : "uslugi/";
  if (currentDir && target.startsWith(currentDir)) return target.slice(currentDir.length);
  return base + target;
}

const logoMark = `<svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--gold)"/><path d="M9 22V13l7-5 7 5v9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const logo = (base, modifier = "") =>
  `<a href="${base}index.html" class="logo${modifier}" aria-label="${site.name} — на главную">
      ${logoMark}
      <span class="logo__text">ROSTOV<br><b>REMONT</b></span>
    </a>`;

/* ===== <head> ===== */
function head({ title, description, base, canonical }) {
  const favicon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%23c6952e'/><path d='M9 22V13l7-5 7 5v9' fill='none' stroke='%23fff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="robots" content="noindex">
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#fdfbf6">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ru_RU">${canonical ? `\n  <link rel="canonical" href="${canonical}">` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,500;1,600&display=swap" rel="stylesheet">
  <script>document.documentElement.classList.add("js");</script>
  <link rel="stylesheet" href="${base}css/style.css?v=${ASSET_VERSION}">
  <link rel="icon" href="${favicon}">`;
}

/* ===== Шапка =====
   Слева логотип, по центру короткое меню, справа телефон и кнопка «Меню»,
   открывающая выезжающую панель со всеми услугами. */
function header(ctx) {
  const { base, active } = ctx;
  const links = mainNav
    .filter((l) => l.label !== "Главная")
    .map((l) => {
      const id = l.href.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "") || "index";
      const is = active === id || (active === "uslugi-item" && id === "uslugi/");
      return `<a href="${href(l.href, base)}" class="nav__link${is ? " is-active" : ""}"${is ? ' aria-current="page"' : ""}>${l.label}</a>`;
    })
    .join("\n        ");

  return `<header class="header" id="header">
  <div class="container header__inner">
    ${logo(base)}
    <nav class="nav" aria-label="Основная навигация">
        ${links}
    </nav>
    <div class="header__actions">
      <a href="${site.phoneHref}" class="header__phone">${site.phone}</a>
      <button type="button" class="menu-btn" id="menu-open" aria-haspopup="dialog" aria-expanded="false" aria-controls="drawer">
        <span class="menu-btn__bars" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="menu-btn__label">Меню</span>
      </button>
    </div>
  </div>
</header>`;
}

/* ===== Выезжающая панель справа =====
   Полная навигация: разделы сайта, все услуги по категориям и контакты.
   Ссылки лежат в HTML (а не строятся скриптом), чтобы работать без JS. */
function drawer(ctx) {
  const { base, active } = ctx;

  const sections = mainNav
    .map((l) => {
      const id = l.href.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "") || "index";
      const is = active === id || (active === "uslugi-item" && id === "uslugi/");
      return `<a href="${href(l.href, base)}" class="drawer__section-link${is ? " is-active" : ""}">${l.label}${icon("arrow")}</a>`;
    })
    .join("\n          ");

  const groups = categories
    .map((cat) => {
      const items = services
        .filter((s) => s.category === cat.id)
        .map((s) => {
          const is = active === "uslugi-item" && ctx.slug === s.slug;
          return `<li><a href="${href(`uslugi/${s.slug}.html`, base)}" class="drawer__service${is ? " is-active" : ""}">
                <span class="drawer__service-icon">${icon(s.icon)}</span>
                <span class="drawer__service-text">
                  <b>${s.menu}</b>
                  <small>${s.price}</small>
                </span>
              </a></li>`;
        })
        .join("\n            ");
      return `<div class="drawer__group">
            <h3 class="drawer__group-title">${cat.title}</h3>
            <ul class="drawer__services">
            ${items}
            </ul>
          </div>`;
    })
    .join("\n          ");

  return `<div class="drawer-overlay" id="drawer-overlay" hidden></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Меню сайта" hidden>
  <div class="drawer__head">
    ${logo(base, " logo--light")}
    <button type="button" class="drawer__close" id="menu-close" aria-label="Закрыть меню">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>

  <div class="drawer__body">
    <nav class="drawer__sections" aria-label="Разделы сайта">
          ${sections}
    </nav>

    <div class="drawer__catalog">
      <span class="drawer__eyebrow">Что мы делаем</span>
          ${groups}
    </div>
  </div>

  <div class="drawer__foot">
    <a href="${site.phoneHref}" class="drawer__phone">${site.phone}</a>
    <span class="drawer__hours">${site.hours}</span>
    <a href="${base}kontakty.html" class="btn btn--gold btn--full">Заказать звонок</a>
  </div>
</aside>`;
}

/* ===== Подвал =====
   Здесь же полный список услуг обычными ссылками — это и карта сайта
   для поисковика, и запасная навигация, если панель не откроется. */
function footer(ctx) {
  const { base } = ctx;

  const columns = categories
    .map((cat) => {
      const items = services
        .filter((s) => s.category === cat.id)
        .map((s) => `<a href="${href(`uslugi/${s.slug}.html`, base)}">${s.menu}</a>`)
        .join("\n        ");
      return `<div class="footer__col">
        <h3>${cat.title}</h3>
        ${items}
      </div>`;
    })
    .join("\n      ");

  const pages = mainNav
    .map((l) => `<a href="${href(l.href, base)}">${l.label}</a>`)
    .join("\n        ");

  return `<footer class="footer">
  <div class="container footer__top">
    <div class="footer__brand">
      ${logo(base, " logo--light")}
      <p>Ремонт квартир, новостроек и коммерческих помещений в Ростове-на-Дону под ключ с ${site.since} года.</p>
      <div class="footer__contacts">
        <a href="${site.phoneHref}" class="footer__phone">${site.phone}</a>
        <a href="mailto:${site.email}">${site.email}</a>
        <span>${site.address}</span>
        <span>${site.hours}</span>
      </div>
    </div>
    <nav class="footer__map" aria-label="Карта сайта">
      ${columns}
      <div class="footer__col">
        <h3>Разделы</h3>
        ${pages}
      </div>
    </nav>
  </div>
  <div class="container footer__legal">
    ${legalDocs.map((d) => `<a href="${base}${d.href}">${d.label}</a>`).join("\n    ")}
  </div>
  <div class="container footer__bottom">
    <span>© 2026 ${site.name}. Все права защищены.</span>
    <span class="footer__demo">Демонстрационный сайт. Заявки не отправляются.</span>
  </div>
</footer>`;
}

/* ===== Хлебные крошки ===== */
export function breadcrumbs(items) {
  const parts = items
    .map((it, i) => {
      const last = i === items.length - 1;
      return last
        ? `<li aria-current="page">${it.label}</li>`
        : `<li><a href="${it.href}">${it.label}</a></li>`;
    })
    .join("");
  return `<nav class="crumbs" aria-label="Хлебные крошки"><div class="container"><ol>${parts}</ol></div></nav>`;
}

/* ===== Сборка документа ===== */
export function page({ title, description, base = "", active = "", slug = "", canonical = "", body }) {
  const ctx = { base, active, slug };
  return `<!DOCTYPE html>
<html lang="ru">
<head>
${head({ title, description, base, canonical })}
</head>
<body>

<a href="#main" class="skip-link">К основному содержимому</a>

${header(ctx)}

${drawer(ctx)}

<main id="main">
${body}
</main>

${footer(ctx)}

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<div class="cookie" id="cookie-banner" role="dialog" aria-live="polite" aria-label="Использование файлов cookie" hidden>
  <p class="cookie__text">
    Мы используем файлы cookie, чтобы сайт работал корректно и чтобы понимать, как им пользуются.
    Подробнее в <a href="${base}legal/cookie.html">политике cookie</a>.
  </p>
  <div class="cookie__actions">
    <button type="button" class="btn btn--ghost btn--sm" id="cookie-decline">Отклонить</button>
    <button type="button" class="btn btn--gold btn--sm" id="cookie-accept">Принять</button>
  </div>
</div>

<script src="${base}js/main.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>
`;
}
