import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = path.join(root, 'docs', 'owk-003-qingfeng312');
const requiredFiles = [
  'README.pt-BR.md',
  'SUBMISSION_GUIDELINES.pt-BR.md',
  'TRANSLATION_NOTES.md',
];

for (const file of requiredFiles) {
  const fullPath = path.join(docsDir, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const readme = fs.readFileSync(path.join(docsDir, 'README.pt-BR.md'), 'utf8');
const guidelines = fs.readFileSync(path.join(docsDir, 'SUBMISSION_GUIDELINES.pt-BR.md'), 'utf8');

function assertBalancedFences(name, content) {
  const fences = content.match(/^```/gm) || [];
  if (fences.length % 2 !== 0) {
    throw new Error(`${name} has unbalanced Markdown code fences`);
  }
}

assertBalancedFences('README.pt-BR.md', readme);
assertBalancedFences('SUBMISSION_GUIDELINES.pt-BR.md', guidelines);

const requiredReadmeSnippets = [
  '/bounties',
  '/bounties/:id/claim',
  '/bounties/:id/submit',
  '/bounties/:id/approve',
  '/.well-known/x402',
  'X-Payment',
  'PRIVATE_KEY',
  'TREASURY_ADDRESS',
  'USDC',
  'Base',
  'x402',
];

const requiredGuidelineSnippets = [
  '/bounties',
  '/bounties/:id/claim',
  '/bounties/:id/submit',
  '/guidelines',
  'GitHub',
  '@owockibot',
  '2026-02-07',
];

for (const snippet of requiredReadmeSnippets) {
  if (!readme.includes(snippet)) {
    throw new Error(`README.pt-BR.md is missing required snippet: ${snippet}`);
  }
}

for (const snippet of requiredGuidelineSnippets) {
  if (!guidelines.includes(snippet)) {
    throw new Error(`SUBMISSION_GUIDELINES.pt-BR.md is missing required snippet: ${snippet}`);
  }
}

for (const [name, content] of [
  ['README.pt-BR.md', readme],
  ['SUBMISSION_GUIDELINES.pt-BR.md', guidelines],
]) {
  if (!/[ãáéíóúç]/i.test(content)) {
    throw new Error(`${name} does not appear to contain Brazilian Portuguese prose`);
  }
}

console.log('Validated OWK-003 Brazilian Portuguese translation package.');
