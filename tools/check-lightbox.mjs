import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

console.log("Встроенный просмотр фотографий подключён.");
