import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { workGroups } from "./site.data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [html, js, css] = await Promise.all([
  readFile(join(root, "portfolio.html"), "utf8"),
  readFile(join(root, "js", "main.js"), "utf8"),
  readFile(join(root, "css", "style.css"), "utf8"),
]);

for (const [name, source, markers] of [
  ["portfolio.html", html, ['id="work-lightbox"', 'aria-controls="work-lightbox"']],
  ["js/main.js", js, ['showModal()', 'workLightbox.close()']],
  ["css/style.css", css, [".lightbox::backdrop", ".lightbox__image"]],
]) {
  for (const marker of markers) {
    if (!source.includes(marker)) throw new Error(`${name}: отсутствует ${marker}`);
  }
}

// Execute the actual gallery controller with a minimal DOM, without a browser dependency.
const node = (dataset = {}) => {
  const handlers = {}, attributes = {}, classes = new Set();
  return {
    dataset, handlers, attributes, hidden: false,
    classList: { add: (v) => classes.add(v), remove: (v) => classes.delete(v), toggle: (v, on) => on ? classes.add(v) : classes.delete(v) },
    addEventListener: (event, fn) => { handlers[event] = fn; },
    setAttribute: (key, value) => { attributes[key] = value; },
    getAttribute: (key) => attributes[key],
    removeAttribute: (key) => { delete attributes[key]; },
    focus() { this.focused = true; },
  };
};
const groups = workGroups.map((g) => Object.assign(node({ workGroup: g.id }), { photos: g.photos }));
const filters = ["all", ...workGroups.map((g) => g.id)].map((id) => Object.assign(node({ workFilter: id }), {
  textContent: id,
}));
filters.forEach((link) => link.setAttribute("href", link.dataset.workFilter === "all" ? "#works" : "#work-" + link.dataset.workFilter));
const photos = workGroups.flatMap((g) => g.photos.map((p) => Object.assign(node({ group: g.id, caption: p.caption }), { href: p.src, alt: p.alt })));
const ids = Object.fromEntries(["work-count", "work-lightbox", "work-lightbox-image", "work-lightbox-caption", "work-lightbox-counter", "work-lightbox-prev", "work-lightbox-next", "work-lightbox-close"].map((id) => ["#" + id, node()]));
const dialog = ids["#work-lightbox"];
dialog.showModal = () => { dialog.open = true; };
dialog.close = () => { dialog.open = false; dialog.handlers.close(); };
const document = Object.assign(node(), { body: node() });
const window = node();
const location = { hash: "" };
const context = {
  document, window, location,
  history: { replaceState: (_, __, hash) => { location.hash = hash; } },
  $: (selector, root) => selector === "img" || selector === "span" ? root : ids[selector],
  $$: (selector, root) => ({ "[data-work-filter]": filters, "[data-work-group]": groups, ".work-shot [data-work-photo]": photos, ".work-shot": root?.photos })[selector],
};
runInNewContext(js.slice(js.indexOf('const workFilters =')), context);
const click = (target, extra = {}) => ({ target: { closest: () => target }, preventDefault() { this.prevented = true; }, ...extra });
assert.equal((html.match(/class="work-shot"/g) || []).length, 27);
assert.equal(groups.filter((g) => !g.hidden).length, 5);
filters.find((f) => f.dataset.workFilter === "electrical").handlers.click(click());
assert.deepEqual(groups.filter((g) => !g.hidden).map((g) => g.dataset.workGroup), ["electrical"]);
assert.match(ids["#work-count"].textContent, /5 фото/);
assert.equal(location.hash, "#work-electrical");
location.hash = "#work-missing";
window.handlers.hashchange();
assert.equal(groups.filter((g) => !g.hidden).length, 1, "Unknown hashes must not hide the collection");
location.hash = "#works";
window.handlers.hashchange();
assert.equal(groups.filter((g) => !g.hidden).length, 5);
const photo = photos.find((p) => p.dataset.group === "tile");
const modified = click(photo, { ctrlKey: true });
document.handlers.click(modified);
assert.equal(modified.prevented, undefined);
document.handlers.click(click(photo));
assert.equal(dialog.open, true);
assert.equal(ids["#work-lightbox-image"].src, photo.href);
assert.equal(ids["#work-lightbox-counter"].textContent, "1 / 4");
ids["#work-lightbox-prev"].handlers.click();
assert.equal(ids["#work-lightbox-counter"].textContent, "4 / 4");
dialog.handlers.keydown({ key: "ArrowRight", preventDefault() {} });
assert.equal(ids["#work-lightbox-counter"].textContent, "1 / 4");
ids["#work-lightbox-close"].handlers.click();
assert.equal(dialog.open, false);
assert.equal(photo.focused, true);
console.log("27 photographs; filters, hashes, album navigation and focus return passed.");

// Phone validation accepts familiar local formats without locking the caret.
const phoneCheck = runInNewContext(js.slice(js.indexOf("const phoneDigits ="), js.indexOf("const phoneInput =")) + "phoneValid");
for (const value of ["+7 (999) 123-45-67", "8 999 123 45 67", "9991234567"]) assert.equal(phoneCheck(value), true, value);
for (const value of ["", "123", "+7 999 123-45-678", "abc9991234567", "69991234567"]) assert.equal(phoneCheck(value), false, value);
console.log("Phone input: local formats and invalid values passed.");

// Execute the same compact room-assembly controller used on the homepage.
const stageFrames = Array.from({ length: 6 }, (_, i) => Object.assign(node({ note: `Detail ${i}` }), { alt: `Stage ${i}` }));
const stageIds = Object.fromEntries(["assembly", "assembly-range", "assembly-next", "assembly-counter", "assembly-caption", "assembly-note"].map((id) => ["#" + id, node()]));
stageIds["#assembly-range"].value = "0";
runInNewContext(js.slice(js.indexOf("const assembly ="), js.indexOf("/* ===== Выбор направления работ.")), { $: (selector) => stageIds[selector], $$: () => stageFrames });
assert.equal(stageIds["#assembly-counter"].textContent, "1 из 6");
for (let i = 0; i < 5; i++) stageIds["#assembly-next"].handlers.click();
assert.equal(stageIds["#assembly-caption"].textContent, "Stage 5");
assert.equal(stageIds["#assembly-range"].attributes["aria-valuetext"], "Stage 5");
assert.equal(stageFrames.filter((frame) => frame.attributes["aria-hidden"] === "false").length, 1);
stageIds["#assembly-next"].handlers.click();
assert.equal(stageIds["#assembly-range"].value, "0");
stageIds["#assembly-range"].value = "3";
stageIds["#assembly-range"].handlers.input();
assert.equal(stageIds["#assembly-note"].textContent, "Detail 3");
console.log("Room assembly: six stages, slider, restart and accessible state passed.");
