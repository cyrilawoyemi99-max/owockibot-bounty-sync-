import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const badgeDir = join(root, "badges", "owk-004");
const manifest = JSON.parse(readFileSync(join(badgeDir, "manifest.json"), "utf8"));
const guide = readFileSync(join(badgeDir, "STYLE_GUIDE.md"), "utf8");
const svgFiles = readdirSync(badgeDir).filter((name) => name.endsWith(".svg")).sort();
const manifestFiles = manifest.badges.map((badge) => badge.file).sort();

const fail = (message) => {
  console.error(`OWK-004 validation failed: ${message}`);
  process.exit(1);
};

if (manifest.bounty_id !== "owk-004") fail("manifest bounty_id must be owk-004");
if (manifest.badge_count !== 8) fail("manifest badge_count must be 8");
if (svgFiles.length !== 8) fail(`expected exactly 8 SVG files, found ${svgFiles.length}`);
if (JSON.stringify(svgFiles) !== JSON.stringify(manifestFiles)) fail("manifest badge files do not match SVG files");
if (!guide.includes("Recommended display sizes")) fail("style guide is missing usage guidance");

for (const file of svgFiles) {
  const source = readFileSync(join(badgeDir, file), "utf8");
  if (!source.startsWith("<svg ")) fail(`${file} must be a standalone SVG document`);
  if (!source.includes('width="512"') || !source.includes('height="512"')) fail(`${file} must be 512 by 512`);
  if (!source.includes('viewBox="0 0 512 512"')) fail(`${file} must use the standard viewBox`);
  if (!source.includes('role="img"')) fail(`${file} is missing role="img"`);
  if (!source.includes("aria-label=")) fail(`${file} is missing aria-label`);
  if (!source.includes("<title>") || !source.includes("<desc>")) fail(`${file} needs title and desc elements`);
  if (/<script/i.test(source)) fail(`${file} must not include scripts`);
  if (/\shref\s*=|xlink:href/i.test(source)) fail(`${file} must not reference external assets`);
}

console.log(`OWK-004 badge validation passed: ${svgFiles.length} SVGs, ${manifest.badges.length} manifest entries.`);
