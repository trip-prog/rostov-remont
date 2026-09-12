/**
 * Генератор статики.
 *   node tools/build.mjs
 * Собирает все .html из данных и шаблонов. Результат — обычные файлы
 * в корне репозитория, GitHub Pages отдаёт их без какой-либо сборки.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { site, services, categories, workGroups, serviceBySlug } from "./site.data.mjs";
import { page, breadcrumbs, icon } from "./layout.mjs";
import {
  pageHero, serviceGrid, stepsBlock,
  advantagesBlock, priceTable, faqBlock, ctaBlock,
  sectionHead, relatedBlock, videoGrid, workGallery,
} from "./blocks.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://trip-prog.github.io/rostov-remont/";

const written = [];
async function emit(relPath, html) {
  const full = join(ROOT, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, html.replace(/[ \t]+$/gm, ""), "utf8");
  written.push(relPath);
}

/* ================= ГЛАВНАЯ ================= */
function buildHome() {
  const featured = ["kapitalnyy-remont", "kosmeticheskiy-remont", "dizayn-proekt", "novostroyka", "vannaya", "plitka"].map((slug) => serviceBySlug[slug]);
  const tile = workGroups.find((group) => group.id === "tile");
  const electrical = workGroups.find((group) => group.id === "electrical");
  const body = `
<section class="home-hero">
  <div class="container home-hero__inner">
    <div class="home-hero__text">
      <h1>Ваш дом.<br>Наше&nbsp;дело.</h1>
      <p>Ремонт квартир под ключ в Ростове-на-Дону. От первой сметы до последней розетки.</p>
      <div class="home-hero__actions">
        <a class="btn btn--gold" href="#zayavka">Обсудить ремонт</a>
        <a class="text-link" href="portfolio.html">Посмотреть работы</a>
      </div>
      <div class="home-hero__foot"><span>Квартиры и новостройки</span><span>Отдельные виды работ</span></div>
    </div>
    <figure class="home-hero__visual">
      <img src="${tile.photos[3].src}" alt="${tile.photos[3].alt}" width="1024" height="768" fetchpriority="high">
      <figcaption><span>Плитка, камень и дерево</span><a href="portfolio.html#work-tile">Посмотреть отделку ${icon("arrow")}</a></figcaption>
    </figure>
  </div>
</section>
<div class="container">${advantagesBlock()}</div>

<section class="section">
  <div class="container">
    ${sectionHead({ title: "Результат. И всё, что за ним.", note: "Готовая отделка и скрытая инженерия на наших объектах.", row: true, link: { href: "portfolio.html", label: "Все работы" } })}
    <div class="work-preview">
      <a href="portfolio.html#work-tile" class="work-preview__item">
        <img src="${tile.photos[2].src}" alt="${tile.photos[2].alt}" loading="lazy" width="720" height="1280">
        <span><b>Чистовая отделка</b><small>Плитка и санузлы</small>${icon("arrow")}</span>
      </a>
      <a href="portfolio.html#work-electrical" class="work-preview__item">
        <img src="${electrical.photos[1].src}" alt="${electrical.photos[1].alt}" loading="lazy" width="960" height="1280">
        <span><b>То, что внутри</b><small>Электрика и инженерия</small>${icon("arrow")}</span>
      </a>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container service-overview">
    <div class="service-overview__intro">
      <h2 class="section__title">Целая квартира.<br>Или одна задача.</h2>
      <p class="section__note">Выберите подходящий формат. Состав работ, сроки и цены собрали на отдельных страницах.</p>
      <a class="text-link" href="uslugi/index.html">Все ${services.length} услуг</a>
    </div>
    ${serviceGrid(featured)}
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ title: "Сначала договоримся.<br>Потом начнём.", note: "Пять этапов от знакомства с объектом до приёмки готового ремонта." })}
    ${stepsBlock()}
  </div>
</section>

<section class="section section--about">
  <div class="container about__inner">
    <h2 class="section__title">Хороший ремонт —<br>это ещё и спокойствие.</h2>
    <div class="about__text">
      <p class="section__note">Состав работ, стоимость и сроки закрепляем в договоре. Показываем чеки на материалы и присылаем фотоотчёты с объекта.</p>
      <a href="o-kompanii.html" class="text-link">Как мы работаем</a>
    </div>
  </div>
</section>
${ctaBlock({ title: "Начнём с вашей квартиры?", note: "Расскажите, что хотите изменить. Обсудим объём работ, сроки и следующий шаг." })}`;
  return page({ title: site.baseTitle, description: "Ремонт квартир в Ростове-на-Дону: фотографии работ, услуги и цены. ROSTOV REMONT — от черновых работ до чистовой отделки.", active: "index", canonical: SITE_URL, body });
}

/* ================= КАТАЛОГ УСЛУГ ================= */
function buildServicesIndex() {
  const groups = categories
    .map((cat) => {
      const list = services.filter((s) => s.category === cat.id);
      return `<section class="section${cat.id === "rooms" ? " section--alt" : ""}">
  <div class="container">
    ${sectionHead({ title: cat.title, note: cat.note })}
    ${serviceGrid(list, "")}
  </div>
</section>`;
    })
    .join("\n\n");

  const body = `
${breadcrumbs([
  { href: "../index.html", label: "Главная" },
  { label: "Услуги" },
])}

${pageHero({
  title: "Что мы делаем",
  lead: `${services.length} направлений работ: от полного ремонта под ключ до отдельной задачи вроде штукатурки или укладки плитки. Возьмёмся и за квартиру целиком, и за одну комнату.`,
  facts: [
    { b: `${services.length}`, s: "видов работ" },
    { b: "Под ключ", s: "или отдельная задача" },
  ],
  base: "../",
})}

${groups}

${ctaBlock({ base: "../" })}`;

  return page({
    title: "Услуги — ремонт квартир и отдельные виды работ | ROSTOV REMONT",
    description: "Все услуги ROSTOV REMONT в Ростове-на-Дону: капитальный и косметический ремонт, ремонт по дизайн-проекту, санузлы, штукатурка, плитка, электрика, сантехника, потолки и полы.",
    base: "../",
    active: "uslugi/",
    canonical: SITE_URL + "uslugi/",
    body,
  });
}

/* ================= СТРАНИЦА УСЛУГИ ================= */
function buildService(s) {
  const includes = s.includes
    .map(
      (it) => `<li>
        <span class="includes__mark">${icon("check")}</span>
        <div><b>${it.t}</b><p>${it.d}</p></div>
      </li>`
    )
    .join("\n      ");

  const body = `
${breadcrumbs([
  { href: "../index.html", label: "Главная" },
  { href: "index.html", label: "Услуги" },
  { label: s.menu },
])}

${pageHero({
  title: s.title,
  lead: s.lead,
  facts: [{ b: s.price, s: "стоимость работ" }, { b: s.term, s: "ориентировочный срок" }],
  photo: s.photo?.src,
  alt: s.photo?.alt,
  base: "../",
})}

<!-- ===== ЧТО ВХОДИТ ===== -->
<section class="section">
  <div class="container">
    ${sectionHead({
      title: "Что входит в услугу",
      note: "Ниже — основные задачи. Точный состав согласуем после осмотра квартиры и запишем в смете.",
    })}
    <ul class="includes">
      ${includes}
    </ul>
  </div>
</section>

<!-- ===== ЦЕНЫ ===== -->
<section class="section section--alt">
  <div class="container">
    ${sectionHead({
      title: "Цены на работы",
      note: "Цены указаны за работу без стоимости материалов. Точная сумма — после бесплатного замера на объекте.",
      link: { href: "../tseny.html", label: "Полный прайс-лист" },
      row: true,
    })}
    ${priceTable(s.priceRows, `Прайс: ${s.menu.toLowerCase()}`)}
    <p class="price-note">${icon("doc")} Смета фиксируется договором. Если объём работ вырастет, изменения оформляются допсоглашением — до того, как мастера приступят.</p>
  </div>
</section>

<!-- ===== ЭТАПЫ ===== -->
<section class="section">
  <div class="container">
    ${sectionHead({
      title: "Как будет проходить работа",
      note: "Согласуем последовательность и сроки до начала ремонта. Объём каждого этапа зависит от вашей задачи.",
    })}
    ${stepsBlock()}
  </div>
</section>

<!-- ===== FAQ ===== -->
<section class="section section--alt">
  <div class="container container--narrow">
    ${sectionHead({ title: "Частые вопросы" })}
    ${faqBlock(s.faq)}
  </div>
</section>

${relatedBlock(s.related, "")}

${ctaBlock({ base: "../", title: "Обсудим вашу задачу?", subject: s.menu })}`;

  return page({
    title: `${s.title} в Ростове-на-Дону — цена ${s.price} | ROSTOV REMONT`,
    description: s.description,
    base: "../",
    active: "uslugi-item",
    slug: s.slug,
    canonical: `${SITE_URL}uslugi/${s.slug}.html`,
    body,
  });
}

/* ================= ПОРТФОЛИО ================= */
function buildPortfolio() {
  const groups = ["tile", "electrical", "plumbing", "walls", "plaster"].map((id) => workGroups.find((group) => group.id === id));
  const featured = groups[0].photos[3];
  const detail = groups[0].photos[2];
  const body = `
${breadcrumbs([{ href: "index.html", label: "Главная" }, { label: "Портфолио" }])}
<section class="portfolio-intro">
  <div class="container">
    <div class="portfolio-intro__heading">
      <h1>Хороший ремонт<br>виден в деталях.</h1>
      <div><p>От готовой ванной до разводки за стенами. Показываем наши работы вблизи — такими, какие они есть.</p><a class="text-link" href="#works">Смотреть все фотографии</a></div>
    </div>
    <div class="portfolio-feature">
      <figure class="portfolio-feature__main">
        <a href="${featured.src}" data-work-photo data-group="tile" data-caption="${featured.caption}" aria-haspopup="dialog" aria-controls="work-lightbox" aria-label="Открыть фотографию: ${featured.caption}">
          <img src="${featured.src}" alt="${featured.alt}" width="1024" height="768" fetchpriority="high">
          <span class="portfolio-feature__zoom" aria-hidden="true">${icon("expand")}</span>
        </a>
        <figcaption><span>Плиточная отделка</span><span>Крупный формат, точные примыкания</span></figcaption>
      </figure>
      <figure class="portfolio-feature__detail">
        <a href="${detail.src}" data-work-photo data-group="tile" data-caption="${detail.caption}" aria-haspopup="dialog" aria-controls="work-lightbox" aria-label="Открыть фотографию: ${detail.caption}">
          <img src="${detail.src}" alt="${detail.alt}" width="720" height="1280">
          <span class="portfolio-feature__zoom" aria-hidden="true">${icon("expand")}</span>
        </a>
        <figcaption>Камень, дерево и тёплый свет</figcaption>
      </figure>
    </div>
    <div class="portfolio-intro__foot"><p>27 фотографий с объектов</p><p>Чистовая отделка и черновые работы</p><a class="text-link" href="#zayavka">Обсудить похожий ремонт</a></div>
  </div>
</section>
<section class="section section--works" id="works">
  <div class="container">
    <h2 class="collection-title">Работы в подробностях</h2>
    ${workGallery(groups)}
  </div>
</section>
<section class="section section--alt">
  <div class="container video-section">
    ${sectionHead({ title: "Загляните внутрь.", note: "Три коротких видео с объектов. Запустите ролик, чтобы рассмотреть пространство." })}
    ${videoGrid()}
  </div>
</section>
${ctaBlock({ title: "Каким будет ваш ремонт?", note: "Расскажите о квартире и своих планах. Поможем разобраться с объёмом работ и стоимостью." })}`;
  return page({ title: "Портфолио — выполненные ремонты квартир в Ростове-на-Дону | ROSTOV REMONT", description: "27 фотографий работ ROSTOV REMONT: плитка, электрика, сантехника, перегородки и штукатурка. Реальные детали ремонта и видео с объектов.", active: "portfolio", canonical: SITE_URL + "portfolio.html", body });
}

/* ================= ЦЕНЫ ================= */
function buildPrices() {
  const tables = categories
    .map((cat, ci) => {
      const list = services.filter((s) => s.category === cat.id);
      const rows = list.map((s) => ({ n: `<a href="uslugi/${s.slug}.html">${s.menu}</a>`, u: s.term, p: s.price }));
      return `<section class="section${ci % 2 ? " section--alt" : ""}">
  <div class="container">
    ${sectionHead({ title: cat.title, note: cat.note })}
    <div class="price-table__wrap">
      <table class="price-table">
        <thead><tr><th scope="col">Услуга</th><th scope="col">Срок</th><th scope="col">Цена</th></tr></thead>
        <tbody>
        ${rows.map((r) => `<tr><th scope="row">${r.n}</th><td>${r.u}</td><td class="price-table__value">${r.p}</td></tr>`).join("\n        ")}
        </tbody>
      </table>
    </div>
  </div>
</section>`;
    })
    .join("\n\n");

  const body = `
${breadcrumbs([{ href: "index.html", label: "Главная" }, { label: "Цены" }])}

${pageHero({
  title: "Прайс-лист на ремонт",
  lead: "Здесь — начальная стоимость работ без материалов. Площадь, состояние квартиры и выбранная отделка влияют на итог. Точный расчёт составим после осмотра.",
  facts: [
    { b: "Работы", s: "цены без материалов" },
    { b: "Смета", s: "под вашу квартиру" },
  ],
})}

${tables}

<section class="section section--alt">
  <div class="container container--narrow">
    ${sectionHead({ title: "Что влияет на стоимость" })}
    ${faqBlock([
      { q: "Смета может вырасти в процессе?", a: "Только если меняется объём работ — например, вы решили перенести стену, которой не было в проекте. Такие изменения оформляются допсоглашением с новой ценой до начала работ. Сама по себе, «из-за подорожания», смета не растёт." },
      { q: "Материалы вы закупаете или я?", a: "Как удобнее. Обычно закупаем мы: есть оптовые цены у поставщиков, условия закупки согласуем заранее. Все чеки передаём вам. Если хотите покупать сами — дадим точную спецификацию с количеством." },
      { q: "Когда и сколько платить?", a: "Предоплаты за работы нет. Платите по факту закрытия каждого этапа: приняли черновые — оплатили черновые. Деньги на материалы вносятся отдельно перед закупкой партии." },
      { q: "Что входит в гарантию 5 лет?", a: "Все работы, которые мы выполнили: отделка, стяжка, плитка, разводка электрики и воды. Не покрываются повреждения от эксплуатации, аварий у соседей и работы, которые после нас переделывал кто-то другой." },
    ])}
  </div>
</section>

${ctaBlock({ title: "Посчитаем точно по вашему объекту" })}`;

  return page({
    title: "Цены на ремонт квартир в Ростове-на-Дону — прайс-лист 2026 | ROSTOV REMONT",
    description: "Начальная стоимость и ориентировочные сроки ремонта квартир в Ростове-на-Дону. Подробные расценки на услуги, условия расчёта и ответы на вопросы.",
    active: "tseny",
    canonical: SITE_URL + "tseny.html",
    body,
  });
}

/* ================= О КОМПАНИИ ================= */
function buildAbout() {
  const tile = workGroups.find((group) => group.id === "tile");
  const plumbing = workGroups.find((group) => group.id === "plumbing");
  const principles = [
    { t: "Сначала разбираемся в задаче", d: "Обсуждаем планировку, привычки и бюджет. Например, где будет рабочий стол, сколько розеток нужно на кухне и что делать со старой отделкой." },
    { t: "Записываем договорённости", d: "Состав работ, материалы, стоимость и сроки — в смете и договоре. Если планы меняются, сначала согласуем новую задачу и её цену." },
    { t: "Показываем то, что будет скрыто", d: "Фотографируем проводку и трубы до отделки. Так понятно, что сделано внутри стен и где проходят коммуникации." },
    { t: "Принимаем работу вместе", d: "Проходим по помещениям, проверяем отделку, свет и сантехнику. Замечания записываем, чтобы ничего не потерялось в разговоре." },
  ];
  const body = `
${breadcrumbs([{ href: "index.html", label: "Главная" }, { label: "О компании" }])}
${pageHero({
  title: "Ремонт — это<br>совместная работа.",
  lead: "Кому-то нужно обновить одну комнату, кому-то — обустроить квартиру с нуля. Разбираем задачу вместе: что оставить, что переделать и с чего начать.",
  photo: tile.photos[0].src,
  alt: tile.photos[0].alt,
})}
<section class="section section--alt">
  <div class="container approach">
    <div><h2 class="section__title">Чтобы понимать<br>друг друга.</h2><p class="section__note">На ремонте достаточно решений. Договорённости должны помогать их принимать.</p></div>
    <ul class="principles">${principles.map((p) => `<li class="principle"><h3>${p.t}</h3><p>${p.d}</p></li>`).join("")}</ul>
  </div>
</section>
<section class="section">
  <div class="container about-detail">
    <figure><img src="${plumbing.photos[1].src}" alt="${plumbing.photos[1].alt}" width="960" height="1280" loading="lazy"><figcaption>Коллекторный узел до закрытия коммуникаций</figcaption></figure>
    <div><h2 class="section__title">Красивой должна быть<br>и работа внутри.</h2><p class="section__note">После ремонта трубы и провода почти не видны. В портфолио показываем их отдельно от готовых интерьеров — чтобы можно было рассмотреть монтаж вблизи.</p><a href="portfolio.html#work-plumbing" class="text-link">Рассмотреть инженерные работы</a></div>
  </div>
</section>
${ctaBlock({ title: "Начнём со знакомства", note: "План квартиры, несколько фотографий или сохранённые примеры интерьеров помогут объяснить идею. Если их пока нет — достаточно описать задачу." })}`;
  return page({
    title: "О компании — как работает ROSTOV REMONT",
    description: "Как мы обсуждаем ремонт, согласуем смету, показываем скрытые работы и принимаем результат. Фотографии работ ROSTOV REMONT в Ростове-на-Дону.",
    active: "o-kompanii", canonical: SITE_URL + "o-kompanii.html", body,
  });
}

/* ================= КОНТАКТЫ ================= */
function buildContacts() {
  const body = `
${breadcrumbs([{ href: "index.html", label: "Главная" }, { label: "Контакты" }])}
${pageHero({ title: "Давайте обсудим<br>вашу квартиру.", lead: "Можно начать с короткого звонка или письма. Расскажите, что хотите сделать и когда планируете ремонт.", cta: false })}
<section class="section section--contact-details">
  <div class="container">
    <ul class="contact-grid">
      <li class="contact-card"><h2>Позвонить</h2><p class="contact-card__value"><a href="${site.phoneHref}">${site.phone}</a></p><p class="contact-card__note">${site.hours}</p></li>
      <li class="contact-card"><h2>Написать</h2><p class="contact-card__value"><a href="mailto:${site.email}">${site.email}</a></p><p class="contact-card__note">Можно приложить план и фотографии квартиры</p></li>
      <li class="contact-card"><h2>Встретиться</h2><p class="contact-card__value">${site.address}</p><p class="contact-card__note">Дату и время встречи согласуйте заранее</p></li>
    </ul>
    <p class="contact-demo">Это демонстрационный сайт: контактные данные приведены для примера.</p>
  </div>
</section>
${ctaBlock({ title: "С чего начнём?", note: "Для первого разговора хватит трёх вещей: площадь квартиры, её состояние и ваши пожелания. Точную стоимость можно определить после осмотра и согласования работ." })}`;
  return page({ title: "Контакты — ROSTOV REMONT, Ростов-на-Дону", description: "Телефон, почта и форма обращения ROSTOV REMONT. Обсудите ремонт квартиры в Ростове-на-Дону.", active: "kontakty", canonical: SITE_URL + "kontakty.html", body });
}

/* ================= ПРОВЕРКИ ================= */
function validate() {
  const problems = [];
  const slugs = new Set(services.map((s) => s.slug));

  services.forEach((s) => {
    if (!categories.some((c) => c.id === s.category)) problems.push(`${s.slug}: неизвестная категория "${s.category}"`);
    s.related.forEach((r) => {
      if (!slugs.has(r)) problems.push(`${s.slug}: смежная услуга "${r}" не существует`);
      if (r === s.slug) problems.push(`${s.slug}: ссылается сама на себя`);
    });
    if (!s.faq.length) problems.push(`${s.slug}: нет вопросов в FAQ`);
    if (!s.priceRows.length) problems.push(`${s.slug}: пустой прайс`);
  });

  const dup = services.map((s) => s.slug).filter((v, i, a) => a.indexOf(v) !== i);
  if (dup.length) problems.push(`Повторяющиеся slug: ${dup.join(", ")}`);

  return problems;
}

/* ================= ЗАПУСК ================= */
const problems = validate();
if (problems.length) {
  console.error("Ошибки в данных:\n  " + problems.join("\n  "));
  process.exit(1);
}

await emit("index.html", buildHome());
await emit("uslugi/index.html", buildServicesIndex());
for (const s of services) await emit(`uslugi/${s.slug}.html`, buildService(s));
await emit("portfolio.html", buildPortfolio());
await emit("tseny.html", buildPrices());
await emit("o-kompanii.html", buildAbout());
await emit("kontakty.html", buildContacts());

console.log(`Собрано страниц: ${written.length}`);
written.forEach((p) => console.log("  " + p.replace(/\\/g, "/")));
