import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const badgeDir = join(root, 'badges', 'owk-004-qingfeng312');
const manifest = JSON.parse(readFileSync(join(badgeDir, 'manifest.json'), 'utf8'));
const svgs = readdirSync(badgeDir).filter((file) => file.endsWith('.svg')).sort();

if (manifest.bountyId !== 'owk-004') throw new Error('manifest bountyId must be owk-004');
if (svgs.length !== 8) throw new Error(`expected 8 SVG badges, found ${svgs.length}`);
if (manifest.badges.length !== 8) throw new Error('manifest must list exactly 8 badges');

for (const badge of manifest.badges) {
  if (!svgs.includes(badge.file)) throw new Error(`manifest references missing badge ${badge.file}`);
  const svg = readFileSync(join(badgeDir, badge.file), 'utf8');
  if (!svg.startsWith('<svg ')) throw new Error(`${badge.file} is not a standalone SVG`);
  if (!svg.includes('role="img"')) throw new Error(`${badge.file} missing role="img"`);
  if (!svg.includes('aria-label=')) throw new Error(`${badge.file} missing aria-label`);
  if (!svg.includes('<title>') || !svg.includes('<desc>')) throw new Error(`${badge.file} missing title or desc`);
  if (/<script\\b/i.test(svg)) throw new Error(`${badge.file} must not include scripts`);
  if (/\\b(?:href|src)=/i.test(svg)) throw new Error(`${badge.file} must not reference external assets`);
  if (!svg.trim().endsWith('</svg>')) throw new Error(`${badge.file} has an invalid SVG ending`);
}

console.log(`Validated ${svgs.length} OWK-004 contributor badges.`);
