import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
const script = await readFile(resolve(root, "script.js"), "utf8");
const workflow = await readFile(resolve(root, ".github/workflows/pages.yml"), "utf8");

test("publishes canonical links to the live game and both repositories", () => {
  assert.match(html, /https:\/\/rshermanut-rgb\.github\.io\/redirect-loop\//);
  assert.match(html, /https:\/\/github\.com\/rshermanut-rgb\/redirect-loop/);
  assert.match(html, /https:\/\/github\.com\/rshermanut-rgb\/redirect-loop-guide/);
});

test("all local page URLs are project-subpath safe", () => {
  const localReferences = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => !reference.startsWith("http") && !reference.startsWith("#"));

  assert.ok(localReferences.length >= 10);
  for (const reference of localReferences) {
    assert.equal(reference.startsWith("/"), false, `${reference} must not be root-relative`);
  }
});

test("every referenced screenshot exists", async () => {
  const screenshots = [...new Set([...html.matchAll(/src="(assets\/screenshots\/[^"]+\.png)"/g)].map((match) => match[1]))];
  assert.equal(screenshots.length, 12);
  await Promise.all(screenshots.map((path) => access(resolve(root, path))));
});

test("uses the authored game icon as a subpath-safe favicon", async () => {
  assert.match(html, /<link rel="icon" href="assets\/favicon\.png" type="image\/png">/);
  await access(resolve(root, "assets/favicon.png"));
});

test("every screenshot has dimensions and useful alternative text", () => {
  const imageTags = [...html.matchAll(/<img\s+[^>]*>/g)].map((match) => match[0]);
  assert.ok(imageTags.length >= 13);
  for (const tag of imageTags) {
    assert.match(tag, /width="480"/);
    assert.match(tag, /height="270"/);
    assert.match(tag, /alt="[^"]+"/);
  }
});

test("major spoilers begin hidden behind a two-stage reveal", () => {
  assert.match(html, /id="spoiler-confirmation"[^>]*hidden/);
  assert.match(html, /id="spoiler-content"[^>]*hidden/);
  assert.match(script, /confirm-spoilers/);
  assert.match(script, /visibleScreenshotButtons/);
});

test("interactive navigation, filters, progress, accordions, and lightbox are wired", () => {
  for (const hook of [
    "menu-toggle",
    "control-filter",
    "guide-progress",
    "continue-guide",
    "expand-problems",
    "screenshot-dialog",
  ]) {
    assert.match(html, new RegExp(`id="${hook}"|class="[^"]*${hook}`));
  }
  assert.match(script, /localStorage/);
  assert.match(script, /showModal/);
  assert.match(script, /IntersectionObserver/);
});

test("the page respects reduced motion and preserves pixel screenshots", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /image-rendering:\s*pixelated/);
  assert.match(css, /:focus-visible/);
});

test("browser script passes Node syntax validation", () => {
  const result = spawnSync(process.execPath, ["--check", resolve(root, "script.js")], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("GitHub Pages workflow tests, builds, and deploys only dist", () => {
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path:\s*dist/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
