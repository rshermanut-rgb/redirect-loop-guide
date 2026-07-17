import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const files = ["index.html", "styles.css", "script.js"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  await cp(resolve(root, file), resolve(output, file));
}

await cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true });
await writeFile(resolve(output, ".nojekyll"), "", "utf8");

console.log(`Built Redirect Loop guide into ${output}`);
