import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'badges', 'owk-004-zdfgu113');

const badges = [
  {
    id: '01-claim-spark',
    name: 'Claim Spark',
    milestone: 'First accepted bounty claim',
    colors: ['#0F172A', '#22D3EE', '#A3E635'],
    icon: '<path d="M86 134l28 28 58-70" fill="none" stroke="#ECFEFF" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  {
    id: '02-review-signal',
    name: 'Review Signal',
    milestone: 'Helpful code review submitted',
    colors: ['#111827', '#F59E0B', '#38BDF8'],
    icon: '<path d="M76 96h104v70H98l-22 22z" fill="none" stroke="#FFF7ED" stroke-width="14" stroke-linejoin="round"/><path d="M102 122h52M102 146h34" stroke="#FFF7ED" stroke-width="12" stroke-linecap="round"/>'
  },
  {
    id: '03-merge-shipper',
    name: 'Merge Shipper',
    milestone: 'Merged contribution shipped',
    colors: ['#1F2937', '#34D399', '#60A5FA'],
    icon: '<path d="M86 176V82m0 0l-22 22m22-22l22 22M170 80v96m0 0l-22-22m22 22l22-22M104 128h48" fill="none" stroke="#F0FDF4" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  {
    id: '04-seven-day-streak',
    name: 'Seven Day Streak',
    milestone: 'Seven day contribution streak',
    colors: ['#18181B', '#EF4444', '#FDE047'],
    icon: '<path d="M128 72c30 32 44 56 44 82 0 29-20 50-44 50s-44-21-44-50c0-24 14-50 44-82z" fill="#FEF3C7"/><text x="128" y="166" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#7F1D1D">7</text>'
  },
  {
    id: '05-bug-fixer',
    name: 'Bug Fixer',
    milestone: 'Production bug fixed',
    colors: ['#172554', '#2DD4BF', '#F97316'],
    icon: '<ellipse cx="128" cy="136" rx="42" ry="48" fill="none" stroke="#ECFEFF" stroke-width="14"/><path d="M88 102l-22-20M168 102l22-20M88 170l-24 18M168 170l24 18M84 136H58M172 136h26M128 92v90" stroke="#ECFEFF" stroke-width="12" stroke-linecap="round"/>'
  },
  {
    id: '06-docs-translator',
    name: 'Docs Translator',
    milestone: 'Documentation or translation improved',
    colors: ['#312E81', '#C084FC', '#2DD4BF'],
    icon: '<path d="M76 74h72a22 22 0 0122 22v86H98a22 22 0 01-22-22z" fill="none" stroke="#F5F3FF" stroke-width="13" stroke-linejoin="round"/><path d="M100 112h44M100 138h58M100 164h34" stroke="#F5F3FF" stroke-width="11" stroke-linecap="round"/><path d="M162 90h18v18" fill="none" stroke="#F5F3FF" stroke-width="11" stroke-linecap="round"/>'
  },
  {
    id: '07-security-review',
    name: 'Security Review',
    milestone: 'Security issue reported responsibly',
    colors: ['#082F49', '#38BDF8', '#FACC15'],
    icon: '<path d="M128 68l58 24v44c0 38-23 66-58 82-35-16-58-44-58-82V92z" fill="none" stroke="#F0F9FF" stroke-width="13" stroke-linejoin="round"/><path d="M108 138l16 16 32-38" fill="none" stroke="#F0F9FF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  {
    id: '08-onchain-proof',
    name: 'Onchain Proof',
    milestone: 'Onchain payout or proof verified',
    colors: ['#0F172A', '#818CF8', '#22C55E'],
    icon: '<path d="M96 102h64l24 42-56 66-56-66z" fill="none" stroke="#EEF2FF" stroke-width="13" stroke-linejoin="round"/><path d="M96 102l32 108m32-108l-32 108M72 144h112" stroke="#EEF2FF" stroke-width="11" stroke-linecap="round"/>'
  }
];

function svg(badge) {
  const [base, accent, shine] = badge.colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${badge.id}-title ${badge.id}-desc" viewBox="0 0 256 256">
<title id="${badge.id}-title">${badge.name}</title>
<desc id="${badge.id}-desc">${badge.milestone}</desc>
<path fill="${base}" d="M128 12l94 36v78c0 58-36 101-94 118-58-17-94-60-94-118V48z"/>
<path fill="${accent}" d="M128 28l76 30v66c0 48-28 82-76 99-48-17-76-51-76-99V58z"/>
<path fill="${shine}" opacity=".22" d="M58 62l140 128c-15 15-38 27-70 37-48-17-76-51-76-99V58z"/>
<circle cx="128" cy="137" r="76" fill="#000" opacity=".16"/>
${badge.icon}
<text x="128" y="236" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC">${badge.name}</text>
</svg>
`;
}

function manifest() {
  return `${JSON.stringify({
    bounty: 'owk-004',
    author: 'zdfgu113',
    format: 'SVG',
    viewBox: '0 0 256 256',
    badges: badges.map(({ id, name, milestone }) => ({
      file: `${id}.svg`,
      name,
      milestone
    }))
  }, null, 2)}
`;
}

function styleGuide() {
  return `# OWK-004 Contributor Badge System

Author: zdfgu113
Bounty: owk-004

## Format

- 8 standalone SVG badges.
- 256 x 256 viewBox.
- No raster images, external fonts, CSS, or network assets.
- Each SVG includes a title and description for accessibility.
- Filenames are numbered so reward milestones sort in a stable order.

## Visual System

The set uses a shield silhouette for contributor recognition, a colored inner shield for category identity, and a simple single-color icon for fast scanning at small sizes. The bottom label is included for contexts where badges are shown without surrounding metadata.

## Badges

${badges.map((badge) => `- \`${badge.id}.svg\` - ${badge.name}: ${badge.milestone}.`).join('\n')}

## Usage

Use the SVG files directly in dashboards, profile pages, issue comments, or generated contributor cards. At 32 px, prefer showing the icon with an adjacent text label from \`manifest.json\`.
`;
}

mkdirSync(outDir, { recursive: true });
for (const badge of badges) {
  writeFileSync(join(outDir, `${badge.id}.svg`), svg(badge));
}
writeFileSync(join(outDir, 'manifest.json'), manifest());
writeFileSync(join(outDir, 'STYLE_GUIDE.md'), styleGuide());

console.log(`Generated ${badges.length} badges in ${outDir}`);
