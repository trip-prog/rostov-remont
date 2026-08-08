/**
 * Блоки контента, которые встречаются на нескольких страницах.
 * Каждая функция возвращает готовый HTML-фрагмент.
 */

import { site, services, steps, reviews, advantages, projectFilters, videoProjects, legalRevision } from "./site.data.mjs";
import { icon } from "./layout.mjs";

/* ===== Шапка внутренней страницы ===== */
export function pageHero({ eyebrow, title, lead, facts = [], photo = "", alt = "", cta = true, base = "" }) {
  const factsHtml = facts.length
    ? `<ul class="page-hero__facts">
          ${facts.map((f) => `<li><b>${f.b}</b><span>${f.s}</span></li>`).join("\n          ")}
        </ul>`
    : "";

  const ctaHtml = cta
    ? `<div class="page-hero__cta">
          <a href="#zayavka" class="btn btn--gold">Рассчитать стоимость</a>
          <a href="${site.phoneHref}" class="btn btn--white">${site.phone}</a>
        </div>`
    : "";

  const media = photo
    ? `<div class="page-hero__media" data-reveal data-reveal-delay="120">
        <img src="${photo}" alt="${alt}" width="1100" height="825" loading="eager">
      </div>`
    : "";

  return `<section class="page-hero${photo ? "" : " page-hero--plain"}">
  <div class="container page-hero__inner">
    <div class="page-hero__text" data-reveal>
      <span class="eyebrow">${eyebrow}</span>
      <h1 class="page-hero__title">${title}</h1>
      <p class="page-hero__lead">${lead}</p>
      ${ctaHtml}
      ${factsHtml}
    </div>
    ${media}
  </div>
</section>`;
}

/* ===== Сетка карточек услуг =====
   `dir` — путь до папки услуг относительно текущей страницы:
   "uslugi/" для корневых страниц и "" для страниц внутри самой папки. */
export function serviceGrid(list, dir = "uslugi/") {
  const cards = list
    .map(
      (s, i) => `<article class="service-card" data-reveal${i % 3 ? ` data-reveal-delay="${(i % 3) * 80}"` : ""}>
        <div class="service-card__icon">${icon(s.icon)}</div>
        <h3><a href="${dir}${s.slug}.html" class="stretch">${s.menu}</a></h3>
        <p>${s.lead}</p>
        <span class="service-card__price">${s.price}</span>
      </article>`
    )
    .join("\n      ");
  return `<div class="services__grid">
      ${cards}
    </div>`;
}

/* ===== Сетка проектов ===== */
export function projectGrid(list, { filterable = false } = {}) {
  const cards = list
    .map(
      (p, i) => `<article class="project" data-reveal${i % 3 ? ` data-reveal-delay="${(i % 3) * 80}"` : ""}${filterable ? ` data-filter="${p.filter}"` : ""}>
        <div class="project__media"><img src="${p.photo}" alt="${p.alt}" loading="lazy" width="800" height="600"></div>
        <div class="project__body">
          <span class="project__tag">${p.tag}</span>
          <h3>${p.title}</h3>
          <p class="project__meta">${p.meta}</p>
        </div>
      </article>`
    )
    .join("\n      ");
  return `<div class="portfolio__grid"${filterable ? ' id="portfolio-grid"' : ""}>
      ${cards}
    </div>`;
}

/* ===== Сетка видеопроектов ===== */
export function videoGrid(base = "") {
  const cards = videoProjects
    .map(
      (p, i) => `<article class="project project--video" data-reveal${i ? ` data-reveal-delay="${i * 80}"` : ""}>
        <div class="project__media">
          <video class="project__video" muted loop playsinline preload="none" poster="${base}${p.poster}" aria-label="${p.alt}">
            <source src="${base}${p.video}" type="video/mp4">
          </video>
          <span class="project__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>
          </span>
        </div>
        <div class="project__body">
          <span class="project__tag">${p.tag}</span>
          <h3>${p.title}</h3>
          <p class="project__meta">${p.meta}</p>
        </div>
      </article>`
    )
    .join("\n      ");
  return `<div class="portfolio__grid portfolio__grid--video">
      ${cards}
    </div>`;
}

export function projectFilterBar() {
  const chips = projectFilters
    .map(
      (f, i) =>
        `<button type="button" class="chip${i === 0 ? " is-active" : ""}" data-filter-btn="${f.id}"${i === 0 ? ' aria-pressed="true"' : ' aria-pressed="false"'}>${f.label}</button>`
    )
    .join("\n      ");
  return `<div class="chips" role="group" aria-label="Фильтр проектов" data-reveal>
      ${chips}
    </div>`;
}

/* ===== Этапы работы ===== */
export function stepsBlock() {
  const items = steps
    .map(
      (s, i) => `<li class="step" data-reveal${i ? ` data-reveal-delay="${i * 80}"` : ""}>
        <span class="step__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${s.t}</h3>
        <p>${s.d}</p>
      </li>`
    )
    .join("\n      ");
  return `<ol class="steps__grid">
      ${items}
    </ol>`;
}

/* ===== Отзывы ===== */
export function reviewsBlock(list = reviews.slice(0, 3)) {
  const items = list
    .map(
      (r, i) => `<figure class="review" data-reveal${i % 3 ? ` data-reveal-delay="${(i % 3) * 80}"` : ""}>
        <div class="review__stars" aria-label="Оценка 5 из 5">★★★★★</div>
        <blockquote>${r.text}</blockquote>
        <figcaption><b>${r.name}</b><span>${r.meta}</span></figcaption>
      </figure>`
    )
    .join("\n      ");
  return `<div class="reviews__grid">
      ${items}
    </div>`;
}

/* ===== Преимущества ===== */
export function advantagesBlock() {
  const items = advantages
    .map(
      (a) => `<li>
        ${icon(a.icon)}
        <div><b>${a.t}</b><span>${a.d}</span></div>
      </li>`
    )
    .join("\n      ");
  return `<ul class="features" data-reveal>
      ${items}
    </ul>`;
}

/* ===== Таблица цен ===== */
export function priceTable(rows, caption = "") {
  const body = rows
    .map(
      (r) => `<tr>
          <th scope="row">${r.n}</th>
          <td>${r.u}</td>
          <td class="price-table__value">${r.p}</td>
        </tr>`
    )
    .join("\n        ");
  return `<div class="price-table__wrap" data-reveal>
      <table class="price-table">
        ${caption ? `<caption>${caption}</caption>` : ""}
        <thead>
          <tr><th scope="col">Вид работ</th><th scope="col">Ед.</th><th scope="col">Цена</th></tr>
        </thead>
        <tbody>
        ${body}
        </tbody>
      </table>
    </div>`;
}

/* ===== FAQ на <details> — работает и без JS ===== */
export function faqBlock(items) {
  const list = items
    .map(
      (f, i) => `<details class="faq__item" data-reveal${i ? ` data-reveal-delay="${Math.min(i, 3) * 60}"` : ""}>
        <summary>
          <span>${f.q}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </summary>
        <div class="faq__answer"><p>${f.a}</p></div>
      </details>`
    )
    .join("\n      ");
  return `<div class="faq">
      ${list}
    </div>`;
}

/* ===== Форма заявки ===== */
export function ctaBlock({ base = "", title = "Расскажите о вашем объекте", note = "Оставьте заявку — перезвоним в течение 15 минут, ответим на вопросы и предложим бесплатный выезд замерщика. Без навязчивых звонков.", subject = "" } = {}) {
  return `<section class="section section--cta" id="zayavka">
  <div class="container">
    <div class="cta-card" data-reveal>
      <div class="cta-card__text">
        <h2 class="section__title">${title}</h2>
        <p class="section__note">${note}</p>
        <ul class="cta-card__contacts">
          <li>${icon("phone")}<a href="${site.phoneHref}">${site.phone}</a></li>
          <li>${icon("mail")}<a href="mailto:${site.email}">${site.email}</a></li>
          <li>${icon("pin")}<span>${site.address}</span></li>
        </ul>
      </div>
      <form class="cta-form" id="contact-form" novalidate>
        ${subject ? `<input type="hidden" name="subject" value="${subject}">` : ""}
        <label class="field">
          <span>Ваше имя</span>
          <input type="text" name="name" id="cf-name" placeholder="Иван" autocomplete="name" required>
        </label>
        <label class="field">
          <span>Телефон</span>
          <input type="tel" name="phone" id="cf-phone" placeholder="+7 (___) ___-__-__" inputmode="tel" autocomplete="tel" required>
          <small class="field__error" id="cf-phone-error" role="alert"></small>
        </label>
        <label class="field">
          <span>Комментарий <i>(необязательно)</i></span>
          <textarea name="comment" id="cf-comment" rows="2" placeholder="${subject ? subject + ", " : ""}например: двушка в новостройке"></textarea>
        </label>
        <label class="consent">
          <input type="checkbox" name="consent_pd" id="cf-consent" required>
          <span>Я даю <a href="${base}legal/consent.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a> и принимаю условия <a href="${base}legal/privacy.html" target="_blank" rel="noopener">Политики конфиденциальности</a></span>
        </label>
        <label class="consent consent--optional">
          <input type="checkbox" name="consent_ads" id="cf-ads">
          <span>Согласен получать новости и специальные предложения</span>
        </label>
        <input type="hidden" name="consent_ts" id="cf-consent-ts">
        <input type="hidden" name="consent_docs_rev" value="${legalRevision}">
        <button type="submit" class="btn btn--gold btn--full" id="cf-submit" aria-disabled="true">Заказать звонок</button>
        <p class="cta-form__note">Перезвоним в течение 15 минут в рабочее время.</p>
      </form>
    </div>
  </div>
</section>`;
}

/* ===== Заголовок секции ===== */
export function sectionHead({ eyebrow, title, note = "", link = null, row = false }) {
  const heading = `<span class="eyebrow">${eyebrow}</span>
        <h2 class="section__title">${title}</h2>${note ? `\n        <p class="section__note">${note}</p>` : ""}`;

  // В «строчном» варианте заголовок и ссылка разъезжаются по краям,
  // поэтому текст заворачивается в дополнительный <div>.
  const inner = row
    ? `<div>
        ${heading}
      </div>
      ${link ? `<a href="${link.href}" class="link-arrow">${link.label}${icon("arrow")}</a>` : ""}`
    : heading;

  return `<div class="section__head${row ? " section__head--row" : ""}" data-reveal>
      ${inner}
    </div>`;
}

/* ===== Смежные услуги ===== */
export function relatedBlock(slugs, dir = "uslugi/", { alt = false } = {}) {
  const list = slugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter(Boolean);
  if (!list.length) return "";
  const cards = list
    .map(
      (s, i) => `<a href="${dir}${s.slug}.html" class="related-card" data-reveal${i ? ` data-reveal-delay="${i * 80}"` : ""}>
        <span class="related-card__icon">${icon(s.icon)}</span>
        <b>${s.menu}</b>
        <small>${s.price}</small>
        ${icon("arrow", "related-card__arrow")}
      </a>`
    )
    .join("\n      ");
  return `<section class="section${alt ? " section--alt" : ""}">
  <div class="container">
    <div class="section__head" data-reveal>
      <span class="eyebrow">Смотрите также</span>
      <h2 class="section__title">Смежные услуги</h2>
    </div>
    <div class="related-grid">
      ${cards}
    </div>
  </div>
</section>`;
}
