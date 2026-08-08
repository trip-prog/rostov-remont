/**
 * Проверка целостности сайта:
 *   node tools/check-links.mjs
 * Обходит все .html и убеждается, что каждая внутренняя ссылка,
 * стиль, скрипт и картинка указывают на существующий файл,
 * а все якоря вида #id есть на целевой странице.
 */

import { readFile, readdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, posix } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".git", "node_modules", "tools", ".claude"]);

async function htmlFiles(dir = ROOT) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".nojekyll") continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const exists = async (p) => access(p).then(() => true, () => false);

const files = await htmlFiles();
const problems = [];
const idsByFile = new Map();
const stats = { pages: files.length, links: 0, assets: 0, external: 0 };

// Сначала собираем все id, чтобы потом проверять якоря между страницами.
for (const file of files) {
  const html = await readFile(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  idsByFile.set(file, ids);
}

for (const file of files) {
  const html = await readFile(file, "utf8");
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const refs = [
    ...[...html.matchAll(/\shref="([^"]+)"/g)].map((m) => ({ url: m[1], kind: "href" })),
    ...[...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => ({ url: m[1], kind: "src" })),
  ];

  for (const { url, kind } of refs) {
    if (/^(https?:|tel:|mailto:|data:|#)/.test(url)) {
      if (url.startsWith("#")) {
        stats.links++;
        if (!idsByFile.get(file).has(url.slice(1))) {
          problems.push(`${rel}: якорь ${url} не найден на странице`);
        }
      } else if (/^https?:/.test(url)) stats.external++;
      continue;
    }

    const [path, hash] = url.split("#");
    const target = resolve(dirname(file), path.split("?")[0]);

    if (!(await exists(target))) {
      problems.push(`${rel}: ${kind}="${url}" — файла нет (${relative(ROOT, target).replace(/\\/g, "/")})`);
      continue;
    }
    kind === "href" ? stats.links++ : stats.assets++;

    if (hash) {
      const ids = idsByFile.get(target);
      if (ids && !ids.has(hash)) problems.push(`${rel}: ${url} — якорь #${hash} отсутствует на целевой странице`);
    }
  }
}

console.log(`Страниц: ${stats.pages} · внутренних ссылок: ${stats.links} · ресурсов: ${stats.assets} · внешних: ${stats.external}`);

if (problems.length) {
  console.error(`\nПроблемы (${problems.length}):`);
  problems.forEach((p) => console.error("  " + p));
  process.exit(1);
}
console.log("Битых ссылок нет.");
