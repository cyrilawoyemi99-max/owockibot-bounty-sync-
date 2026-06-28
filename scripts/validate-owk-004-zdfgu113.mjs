import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'badges', 'owk-004-zdfgu113');
const files = readdirSync(dir).filter((file) => file.endsWith('.svg')).sort();

if (files.length !== 8) {
  throw new Error(`Expected 8 SVG files, found ${files.length}`);
}

for (const file of files) {
  const text = readFileSync(join(dir, file), 'utf8');
  for (const required of ['<svg ', '<title ', '<desc ', 'viewBox="0 0 256 256"']) {
    if (!text.includes(required)) {
      throw new Error(`${file} is missing ${required}`);
    }
  }
  if (/(<script|href="https?:|data:image)/i.test(text)) {
    throw new Error(`${file} contains a disallowed external or executable reference`);
  }
}

const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
if (manifest.bounty !== 'owk-004' || manifest.author !== 'zdfgu113') {
  throw new Error('Manifest has incorrect bounty or author metadata');
}
if (manifest.badges.length !== files.length) {
  throw new Error('Manifest badge count does not match SVG files');
}

console.log(`Validated ${files.length} OWK-004 SVG badges`);
