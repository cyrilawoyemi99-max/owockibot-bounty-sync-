import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentPath = path.join(root, 'content', 'owk-002-qingfeng312', 'public-goods-thread-series.md');
const content = fs.readFileSync(contentPath, 'utf8');

const threadMatches = [...content.matchAll(/^## Thread \d: .+$/gm)];
if (threadMatches.length !== 5) {
  throw new Error(`Expected 5 threads, found ${threadMatches.length}`);
}

for (let i = 0; i < threadMatches.length; i += 1) {
  const start = threadMatches[i].index;
  const end = i + 1 < threadMatches.length ? threadMatches[i + 1].index : content.indexOf('## Source Ledger');
  const block = content.slice(start, end);
  const posts = block.split('\n').filter((line) => /^\d{2}\. /.test(line));
  if (posts.length !== 12) {
    throw new Error(`${threadMatches[i][0]} expected 12 posts, found ${posts.length}`);
  }
  for (const post of posts) {
    const body = post.replace(/^\d{2}\. /, '');
    if (body.length > 280) {
      throw new Error(`${threadMatches[i][0]} has a post over 280 characters: ${body.length}`);
    }
  }
  if (!posts[11].includes('CTA:')) {
    throw new Error(`${threadMatches[i][0]} final post is missing CTA`);
  }
  const sourceLines = block.split('\n').filter((line) => line.startsWith('- https://'));
  if (sourceLines.length < 3) {
    throw new Error(`${threadMatches[i][0]} needs at least 3 source links`);
  }
}

const ledgerLinks = content.match(/https:\/\/[^\s)]+/g) || [];
if (new Set(ledgerLinks).size < 8) {
  throw new Error('Expected at least 8 unique source URLs');
}

console.log('Validated OWK-002 public goods thread series.');
