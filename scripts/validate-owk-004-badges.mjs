import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const baseDir = join(root, "badges", "owk-004");
const svgDir = join(baseDir, "svg");
const files = readdirSync(svgDir).filter((file) => file.endsWith(".svg")).sort();

const failures = [];

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

if (files.length !== 8) {
  failures.push(`expected 8 SVG files, found ${files.length}`);
}

for (const file of files) {
  const path = join(svgDir, file);
  const body = readFileSync(path, "utf8");
  const size = statSync(path).size;

  if (size > 7000) fail(file, `file is larger than 7 KB (${size} bytes)`);
  if (!body.startsWith("<svg ")) fail(file, "does not start with an svg root element");
  if (!body.includes('role="img"')) fail(file, "missing role=\"img\"");
  if (!body.includes("aria-label=")) fail(file, "missing aria-label");
  if (!body.includes("<title>")) fail(file, "missing title");
  if (!body.includes("<desc>")) fail(file, "missing desc");
  if (/<script/i.test(body)) fail(file, "contains a script tag");
  if (/\shref\s*=/i.test(body)) fail(file, "contains an href reference");
  const bodyWithoutSvgNamespace = body.replace("http://www.w3.org/2000/svg", "");
  if (/https?:\/\//i.test(bodyWithoutSvgNamespace)) fail(file, "contains a remote URL");
  if (!/viewBox="0 0 256 256"/.test(body)) fail(file, "missing expected viewBox");
  if (!/OWK-/.test(body)) fail(file, "missing visible OWK badge code");
}

const manifest = JSON.parse(readFileSync(join(baseDir, "manifest.json"), "utf8"));
if (manifest.bounty_id !== "owk-004") failures.push("manifest: bounty_id must be owk-004");
if (!Array.isArray(manifest.badges) || manifest.badges.length !== 8) {
  failures.push("manifest: expected 8 badge entries");
}

const indexHtml = readFileSync(join(baseDir, "index.html"), "utf8");
for (const file of files) {
  if (!indexHtml.includes(`src="svg/${file}"`)) {
    failures.push(`index.html: missing gallery reference for ${file}`);
  }
}
if (/<script/i.test(indexHtml)) failures.push("index.html: contains a script tag");
if (/https?:\/\//i.test(indexHtml)) failures.push("index.html: contains a remote URL");

if (failures.length > 0) {
  console.error("OWK-004 badge validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("OWK-004 badge validation passed");
console.log(`SVG files: ${files.length}`);
console.log(`Manifest entries: ${manifest.badges.length}`);
