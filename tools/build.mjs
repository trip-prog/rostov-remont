/**
 * Генератор статики.
 *   node tools/build.mjs
 * Собирает все .html из данных и шаблонов. Результат — обычные файлы
 * в корне репозитория, GitHub Pages отдаёт их без какой-либо сборки.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { site, services, categories, projects, reviews, serviceBySlug } from "./site.data.mjs";
import { page, breadcrumbs, icon } from "./layout.mjs";
import {
  pageHero, serviceGrid, projectGrid, projectFilterBar, stepsBlock,
  reviewsBlock, advantagesBlock, priceTable, faqBlock, ctaBlock,
  sectionHead, relatedBlock, videoGrid,
} from "./blocks.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://trip-prog.github.io/rostov-remont-lab/";

const written = [];
async function emit(relPath, html) {
  const full = join(ROOT, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, html, "utf8");
  written.push(relPath);
}

/* ================= ГЛАВНАЯ ================= */
function buildHome() {
  const featured = ["kapitalnyy-remont", "kosmeticheskiy-remont", "dizayn-proekt", "novostroyka", "vannaya", "plitka"]
    .map((s) => serviceBySlug[s]);

  const body = `
<!-- ===== HERO ===== -->
<section class="hero">
  <div class="container hero__inner">
    <div class="hero__content" data-reveal>
      <span class="pill">${icon("pin")}${site.city}</span>
      <h1 class="hero__title">Ремонт квартир<br>в Ростове-на-Дону<br><em>под ключ</em></h1>
      <p class="hero__subtitle">Создаём комфортные интерьеры и берём все заботы по ремонту на себя.</p>
      <div class="hero__cta">
        <a href="#zayavka" class="btn btn--gold">Рассчитать стоимость</a>
        <a href="portfolio.html" class="btn btn--white">Смотреть проекты</a>
      </div>
    </div>
    <div class="hero__media" data-reveal data-reveal-delay="100">
      <div class="hero__photo">
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1100&q=80" alt="Светлая гостиная после ремонта под ключ" loading="eager" width="1100" height="1019">
      </div>
      <div class="hero__badge">
        <b>${site.warranty.split(" ")[0]} лет</b>
        <span>гарантии<br>на все работы</span>
      </div>
    </div>
  </div>

  <div class="container">
    ${advantagesBlock()}
  </div>
</section>

<!-- ===== ASSEMBLY: комната собирается при скролле ===== -->
<section class="assembly" id="assembly" aria-label="Как рождается ваш ремонт">
  <div class="assembly__sticky">
    <div class="assembly__frames">
      <img class="assembly__frame" src="img/stage-0.png?v=2" alt="Коробка от застройщика" decoding="async" width="1024" height="572">
      <img class="assembly__frame" src="img/stage-1.jpg" alt="Черновая отделка" decoding="async" width="1024" height="572">
      <img class="assembly__frame" src="img/stage-2.jpg" alt="Стены и полы готовы" decoding="async" width="1024" height="572">
      <img class="assembly__frame" src="img/stage-3.jpg" alt="Появляется мебель" decoding="async" width="1024" height="572">
      <img class="assembly__frame" src="img/stage-4.jpg" alt="Свет и растения" decoding="async" width="1024" height="572">
      <img class="assembly__frame" src="img/stage-5.jpg" alt="Финальные штрихи" decoding="async" width="1024" height="572">
    </div>
    <div class="assembly__scrim" aria-hidden="true"></div>
    <div class="assembly__overlay">
      <div class="container">
        <span class="assembly__eyebrow">Листайте — комната собирается</span>
        <h2 class="assembly__title">Как рождается ваш ремонт</h2>
        <p class="assembly__caption" id="assembly-caption">Коробка от застройщика</p>
        <div class="assembly__dots" id="assembly-dots" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</section>

<!-- ===== О КОМПАНИИ ===== -->
<section class="section about">
  <div class="container about__inner">
    <div class="about__text" data-reveal>
      <span class="eyebrow">О компании</span>
      <h2 class="section__title">Строительная бригада, которую<br>не стыдно рекомендовать соседям</h2>
      <p class="section__note">С ${site.since} года ремонтируем квартиры, новостройки и коммерческие помещения в Ростове-на-Дону и области. Работаем официально по договору, отвечаем за результат и остаёмся на связи даже после сдачи объекта.</p>
      <ul class="about__list">
        <li>${icon("check")}Свои прорабы и мастера в штате, без случайных подрядчиков</li>
        <li>${icon("check")}Закупаем материалы по оптовым ценам и показываем все чеки</li>
        <li>${icon("check")}Фотоотчёт по работам каждую неделю в общем чате</li>
      </ul>
      <a href="o-kompanii.html" class="link-arrow">Подробнее о компании${icon("arrow")}</a>
    </div>
    <ul class="stats" data-reveal data-reveal-delay="120">
      <li><b>10+</b><span>лет на&nbsp;рынке</span></li>
      <li><b>850+</b><span>выполненных проектов</span></li>
      <li><b>95%</b><span>клиентов рекомендуют нас</span></li>
      <li><b>5 лет</b><span>гарантии на&nbsp;работы</span></li>
    </ul>
  </div>
</section>

<!-- ===== УСЛУГИ ===== -->
<section class="section section--alt">
  <div class="container">
    ${sectionHead({
      eyebrow: "Услуги",
      title: "Виды ремонта под любую задачу",
      note: "Подберём формат работ под ваш бюджет и сроки — от косметического обновления до ремонта по авторскому дизайн-проекту.",
      link: { href: "uslugi/index.html", label: "Все услуги" },
      row: true,
    })}
    ${serviceGrid(featured)}
  </div>
</section>

<!-- ===== ПОРТФОЛИО ===== -->
<section class="section">
  <div class="container">
    ${sectionHead({
      eyebrow: "Портфолио",
      title: "Выполненные проекты",
      note: "Реальные объекты, сданные за последние два года. Показываем метраж и итоговую стоимость работ.",
      link: { href: "portfolio.html", label: "Смотреть все проекты" },
      row: true,
    })}
    ${videoGrid()}
  </div>
</section>

<!-- ===== ЭТАПЫ ===== -->
<section class="section section--alt">
  <div class="container">
    ${sectionHead({
      eyebrow: "Как мы работаем",
      title: "Пять понятных этапов",
      note: "Каждый шаг зафиксирован в договоре. Вы всегда знаете, что происходит на объекте и сколько это стоит.",
    })}
    ${stepsBlock()}
  </div>
</section>

<!-- ===== ОТЗЫВЫ ===== -->
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "Отзывы", title: "Что говорят наши клиенты" })}
    ${reviewsBlock(reviews.slice(0, 3))}
  </div>
</section>

${ctaBlock()}`;

  return page({
    title: site.baseTitle,
    description: "Ремонт квартир в Ростове-на-Дону под ключ. Фиксированная смета без скрытых платежей, соблюдение сроков по договору, оплата по этапам и гарантия 5 лет на все работы.",
    base: "",
    active: "index",
    canonical: SITE_URL,
    body,
  });
}

/* ================= КАТАЛОГ УСЛУГ ================= */
function buildServicesIndex() {
  const groups = categories
    .map((cat) => {
      const list = services.filter((s) => s.category === cat.id);
      return `<section class="section${cat.id === "rooms" ? " section--alt" : ""}">
  <div class="container">
    ${sectionHead({ eyebrow: cat.title, title: cat.title, note: cat.note })}
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
  eyebrow: "Услуги",
  title: "Что мы делаем",
  lead: `${services.length} направлений работ: от полного ремонта под ключ до отдельной задачи вроде штукатурки или укладки плитки. Возьмёмся и за квартиру целиком, и за одну комнату.`,
  facts: [
    { b: `${services.length}`, s: "видов работ" },
    { b: "850+", s: "сданных объектов" },
    { b: "5 лет", s: "гарантия" },
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
      (it, i) => `<li data-reveal${i % 3 ? ` data-reveal-delay="${(i % 3) * 70}"` : ""}>
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
  eyebrow: categories.find((c) => c.id === s.category).title,
  title: s.title,
  lead: s.lead,
  facts: s.facts,
  photo: s.photo,
  alt: s.title,
  base: "../",
})}

<!-- ===== ЧТО ВХОДИТ ===== -->
<section class="section">
  <div class="container">
    ${sectionHead({
      eyebrow: "Состав работ",
      title: "Что входит в услугу",
      note: "Полный перечень фиксируется в смете до начала работ — дополнительных строк по ходу ремонта не появляется.",
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
      eyebrow: "Стоимость",
      title: "Цены на работы",
      note: "Цены указаны за работу без стоимости материалов. Точная сумма — после бесплатного замера на объекте.",
      link: { href: "../tseny.html", label: "Полный прайс-лист" },
      row: true,
    })}
    ${priceTable(s.priceRows, `Прайс: ${s.menu.toLowerCase()}`)}
    <p class="price-note" data-reveal>${icon("doc")} Смета фиксируется договором. Если объём работ вырастет, изменения оформляются допсоглашением — до того, как мастера приступят.</p>
  </div>
</section>

<!-- ===== ЭТАПЫ ===== -->
<section class="section">
  <div class="container">
    ${sectionHead({
      eyebrow: "Как мы работаем",
      title: "Пять понятных этапов",
      note: "Каждый шаг зафиксирован в договоре. Вы всегда знаете, что происходит на объекте и сколько это стоит.",
    })}
    ${stepsBlock()}
  </div>
</section>

<!-- ===== FAQ ===== -->
<section class="section section--alt">
  <div class="container container--narrow">
    ${sectionHead({ eyebrow: "Вопросы", title: "Частые вопросы" })}
    ${faqBlock(s.faq)}
  </div>
</section>

${relatedBlock(s.related, "")}

${ctaBlock({ base: "../", title: `Нужен ${s.menu.toLowerCase()}?`, subject: s.menu })}`;

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
  const body = `
${breadcrumbs([{ href: "index.html", label: "Главная" }, { label: "Портфолио" }])}

${pageHero({
  eyebrow: "Портфолио",
  title: "Наши работы",
  lead: "Реальные объекты, сданные за последние два года. Указываем метраж, бюджет работ и фактический срок — без округлений в удобную сторону.",
  facts: [
    { b: "850+", s: "объектов с 2014 года" },
    { b: "95%", s: "клиентов рекомендуют" },
    { b: "0", s: "сорванных сроков за год" },
  ],
})}

<section class="section">
  <div class="container">
    ${sectionHead({
      eyebrow: "Видео",
      title: "Съёмка с объектов",
      note: "Обход готовых квартир без монтажных склеек. На компьютере ролик запускается при наведении, на телефоне — сам.",
    })}
    ${videoGrid()}
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    ${sectionHead({
      eyebrow: "Все работы",
      title: "Проекты по типам ремонта",
      note: "Выберите категорию, чтобы посмотреть похожие на вашу задачу объекты.",
    })}
    ${projectFilterBar()}
    ${projectGrid(projects, { filterable: true })}
    <p class="portfolio__empty" id="portfolio-empty" hidden>В этой категории пока нет проектов.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "Отзывы", title: "Что говорят наши клиенты" })}
    ${reviewsBlock(reviews)}
  </div>
</section>

${ctaBlock()}`;

  return page({
    title: "Портфолио — выполненные ремонты квартир в Ростове-на-Дону | ROSTOV REMONT",
    description: "Портфолио ROSTOV REMONT: выполненные ремонты квартир и коммерческих помещений в Ростове-на-Дону с указанием метража, бюджета и сроков.",
    active: "portfolio",
    canonical: SITE_URL + "portfolio.html",
    body,
  });
}

/* ================= ЦЕНЫ ================= */
function buildPrices() {
  const tables = categories
    .map((cat, ci) => {
      const list = services.filter((s) => s.category === cat.id);
      const rows = list.map((s) => ({ n: `<a href="uslugi/${s.slug}.html">${s.menu}</a>`, u: s.term, p: s.price }));
      return `<section class="section${ci % 2 ? " section--alt" : ""}">
  <div class="container">
    ${sectionHead({ eyebrow: cat.title, title: cat.title, note: cat.note })}
    <div class="price-table__wrap" data-reveal>
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
  eyebrow: "Цены",
  title: "Прайс-лист на ремонт",
  lead: "Цены за работу без стоимости материалов, актуальны на 2026 год. Итоговая сумма фиксируется в смете после бесплатного замера и дальше не меняется.",
  facts: [
    { b: "Бесплатно", s: "выезд замерщика" },
    { b: "Фикс", s: "цена в договоре" },
    { b: "По этапам", s: "оплата без предоплаты" },
  ],
})}

${tables}

<section class="section section--alt">
  <div class="container container--narrow">
    ${sectionHead({ eyebrow: "Вопросы", title: "О деньгах — честно" })}
    ${faqBlock([
      { q: "Смета может вырасти в процессе?", a: "Только если меняется объём работ — например, вы решили перенести стену, которой не было в проекте. Такие изменения оформляются допсоглашением с новой ценой до начала работ. Сама по себе, «из-за подорожания», смета не растёт." },
      { q: "Материалы вы закупаете или я?", a: "Как удобнее. Обычно закупаем мы: есть оптовые цены у поставщиков, разница часто перекрывает нашу наценку. Все чеки передаём вам. Если хотите покупать сами — дадим точную спецификацию с количеством." },
      { q: "Когда и сколько платить?", a: "Предоплаты за работы нет. Платите по факту закрытия каждого этапа: приняли черновые — оплатили черновые. Деньги на материалы вносятся отдельно перед закупкой партии." },
      { q: "Что входит в гарантию 5 лет?", a: "Все работы, которые мы выполнили: отделка, стяжка, плитка, разводка электрики и воды. Не покрываются повреждения от эксплуатации, аварий у соседей и работы, которые после нас переделывал кто-то другой." },
    ])}
  </div>
</section>

${ctaBlock({ title: "Посчитаем точно по вашему объекту" })}`;

  return page({
    title: "Цены на ремонт квартир в Ростове-на-Дону — прайс-лист 2026 | ROSTOV REMONT",
    description: "Прайс-лист на ремонт квартир в Ростове-на-Дону: капитальный, косметический, под дизайн-проект, отдельные виды работ. Калькулятор предварительного расчёта.",
    active: "tseny",
    canonical: SITE_URL + "tseny.html",
    body,
  });
}

/* ================= О КОМПАНИИ ================= */
function buildAbout() {
  const principles = [
    { icon: "doc", t: "Фиксированная смета", d: "Цена в договоре не меняется. Любые дополнения — только через допсоглашение, которое вы подписываете до работ." },
    { icon: "clock", t: "Срок с ответственностью", d: "Дата сдачи прописана в договоре. За просрочку по нашей вине предусмотрена неустойка." },
    { icon: "card", t: "Оплата по этапам", d: "Предоплаты за работы нет. Платите за закрытый этап, который приняли и проверили." },
    { icon: "users", t: "Свои мастера", d: "Прорабы и бригады в штате. Мы не передаём объект случайным субподрядчикам с улицы." },
    { icon: "shield", t: "Гарантия 5 лет", d: "На все выполненные работы, включая скрытые. Приезжаем по гарантийным обращениям бесплатно." },
    { icon: "wallet", t: "Прозрачные материалы", d: "Закупаем по оптовым ценам и отдаём все чеки. Наценку не прячем в стоимости плитки." },
  ]
    .map(
      (p, i) => `<li class="principle" data-reveal${i % 3 ? ` data-reveal-delay="${(i % 3) * 80}"` : ""}>
        <span class="principle__icon">${icon(p.icon)}</span>
        <h3>${p.t}</h3>
        <p>${p.d}</p>
      </li>`
    )
    .join("\n      ");

  const timeline = [
    { y: "2014", t: "Первая бригада", d: "Начали с косметических ремонтов в Западном микрорайоне вчетвером." },
    { y: "2017", t: "Свой прораб на каждом объекте", d: "Перешли от «бригады по вызову» к системе с ответственным за объект." },
    { y: "2020", t: "Работа с дизайнерами", d: "Освоили реализацию авторских проектов и сложные конструкции." },
    { y: "2023", t: "Коммерческие объекты", d: "Добавили офисы, кафе и салоны, научились работать ночными сменами." },
    { y: "2026", t: "850+ объектов", d: "В штате 34 мастера, 6 прорабов и собственный отдел закупок." },
  ]
    .map(
      (t, i) => `<li class="timeline__item" data-reveal${i ? ` data-reveal-delay="${Math.min(i, 3) * 70}"` : ""}>
        <span class="timeline__year">${t.y}</span>
        <div class="timeline__body"><b>${t.t}</b><p>${t.d}</p></div>
      </li>`
    )
    .join("\n      ");

  const body = `
${breadcrumbs([{ href: "index.html", label: "Главная" }, { label: "О компании" }])}

${pageHero({
  eyebrow: "О компании",
  title: "Бригада, которую<br>рекомендуют соседям",
  lead: `С ${site.since} года ремонтируем квартиры, новостройки и коммерческие помещения в Ростове-на-Дону и области. Работаем официально, отвечаем за результат и остаёмся на связи после сдачи объекта.`,
  facts: [
    { b: "10+", s: "лет на рынке" },
    { b: "34", s: "мастера в штате" },
    { b: "850+", s: "сданных объектов" },
  ],
  photo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=80",
  alt: "Интерьер квартиры, сданной после ремонта",
})}

<section class="section">
  <div class="container">
    ${sectionHead({
      eyebrow: "Принципы",
      title: "Шесть правил, по которым мы работаем",
      note: "Это не лозунги для сайта, а условия, которые записаны в договоре и которые вы можете с нас спросить.",
    })}
    <ul class="principles">
      ${principles}
    </ul>
  </div>
</section>

<section class="section section--alt">
  <div class="container container--narrow">
    ${sectionHead({ eyebrow: "История", title: "Как мы к этому пришли" })}
    <ol class="timeline">
      ${timeline}
    </ol>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({
      eyebrow: "Как мы работаем",
      title: "Пять понятных этапов",
      note: "Каждый шаг зафиксирован в договоре. Вы всегда знаете, что происходит на объекте и сколько это стоит.",
    })}
    ${stepsBlock()}
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    ${sectionHead({ eyebrow: "Отзывы", title: "Что говорят наши клиенты" })}
    ${reviewsBlock(reviews)}
  </div>
</section>

${ctaBlock()}`;

  return page({
    title: "О компании ROSTOV REMONT — ремонтная бригада в Ростове-на-Дону",
    description: "ROSTOV REMONT: ремонт квартир в Ростове-на-Дону с 2014 года. 34 мастера в штате, 850+ сданных объектов, фиксированная смета и гарантия 5 лет.",
    active: "o-kompanii",
    canonical: SITE_URL + "o-kompanii.html",
    body,
  });
}

/* ================= КОНТАКТЫ ================= */
function buildContacts() {
  const cards = [
    { icon: "phone", t: "Телефон", v: `<a href="${site.phoneHref}">${site.phone}</a>`, d: "Отвечаем с 9:00 до 20:00 без выходных" },
    { icon: "mail", t: "Почта", v: `<a href="mailto:${site.email}">${site.email}</a>`, d: "Для смет, договоров и документов" },
    { icon: "pin", t: "Офис", v: site.address, d: "Приезжайте на встречу — покажем образцы материалов" },
    { icon: "clock", t: "Режим работы", v: site.hours, d: "Замер возможен и в выходной по договорённости" },
  ]
    .map(
      (c, i) => `<li class="contact-card" data-reveal${i % 2 ? ` data-reveal-delay="80"` : ""}>
        <span class="contact-card__icon">${icon(c.icon)}</span>
        <h3>${c.t}</h3>
        <p class="contact-card__value">${c.v}</p>
        <p class="contact-card__note">${c.d}</p>
      </li>`
    )
    .join("\n      ");

  const body = `
${breadcrumbs([{ href: "index.html", label: "Главная" }, { label: "Контакты" }])}

${pageHero({
  eyebrow: "Контакты",
  title: "Свяжитесь с нами",
  lead: "Позвоните или оставьте заявку — перезвоним в течение 15 минут в рабочее время. Выезд замерщика по Ростову-на-Дону бесплатный и ни к чему не обязывает.",
  cta: false,
})}

<section class="section">
  <div class="container">
    <ul class="contact-grid">
      ${cards}
    </ul>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    ${sectionHead({
      eyebrow: "На карте",
      title: "Где нас найти",
      note: "Офис на пр. Стачки, 20 — вход со стороны двора, второй этаж. Парковка вдоль здания.",
    })}
    <div class="map-placeholder" data-reveal>
      ${icon("pin", "map-placeholder__pin")}
      <b>${site.address}</b>
      <span>В демонстрационной версии карта не подключена</span>
    </div>
  </div>
</section>

<section class="section">
  <div class="container container--narrow">
    ${sectionHead({ eyebrow: "Реквизиты", title: "Работаем официально" })}
    <dl class="requisites" data-reveal>
      <div><dt>Наименование</dt><dd>ООО «Ростов Ремонт»</dd></div>
      <div><dt>ИНН / КПП</dt><dd>6100000000 / 610001001</dd></div>
      <div><dt>ОГРН</dt><dd>1146100000000</dd></div>
      <div><dt>Юридический адрес</dt><dd>${site.address}</dd></div>
      <div><dt>Документы</dt><dd>Договор подряда, смета, акты КС-2 и КС-3</dd></div>
      <div><dt>Оплата</dt><dd>Наличные, карта, безналичный расчёт для юрлиц</dd></div>
    </dl>
    <p class="price-note" data-reveal>${icon("doc")} Реквизиты в демонстрационной версии условные.</p>
  </div>
</section>

${ctaBlock({ title: "Оставьте заявку" })}`;

  return page({
    title: "Контакты — ROSTOV REMONT, ремонт квартир в Ростове-на-Дону",
    description: `Контакты ROSTOV REMONT: ${site.phone}, ${site.email}, ${site.address}. Бесплатный выезд замерщика по Ростову-на-Дону.`,
    active: "kontakty",
    canonical: SITE_URL + "kontakty.html",
    body,
  });
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
