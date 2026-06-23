import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "badges", "owk-004");
const svgDir = join(outDir, "svg");

mkdirSync(svgDir, { recursive: true });

const palette = {
  canopy: "#16423C",
  moss: "#4F8A5B",
  spring: "#B7F0AD",
  sun: "#F6C453",
  coral: "#E86F51",
  sky: "#82C7E8",
  ink: "#10231F",
  ivory: "#F7F2E8",
  mint: "#DDF7E3",
  line: "#0A1714",
};

const badges = [
  {
    id: "first-claim",
    label: "First Claim",
    short: "01",
    file: "01-first-claim.svg",
    criterion: "Awarded when a contributor successfully claims their first bounty.",
    primary: palette.moss,
    secondary: palette.sun,
    icon: `
      <path d="M82 130c25-43 65-52 105-43-11 37-39 63-82 64l-23-21Z" fill="var(--accent)"/>
      <path d="M90 137c24-14 49-24 83-36" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="82" cy="145" r="16" fill="var(--paper)" stroke="var(--ink)" stroke-width="8"/>
      <path d="M76 145l7 7 14-18" fill="none" stroke="var(--ink)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "merge-maker",
    label: "Merge Maker",
    short: "02",
    file: "02-merge-maker.svg",
    criterion: "Awarded when a contributor ships their first accepted merge.",
    primary: palette.canopy,
    secondary: palette.sky,
    icon: `
      <path d="M86 78v73c0 22 16 38 38 38h46" fill="none" stroke="var(--accent)" stroke-width="13" stroke-linecap="round"/>
      <path d="M170 189l-20-18m20 18-20 18" fill="none" stroke="var(--accent)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="86" cy="78" r="18" fill="var(--paper)" stroke="var(--ink)" stroke-width="8"/>
      <circle cx="86" cy="151" r="18" fill="var(--paper)" stroke="var(--ink)" stroke-width="8"/>
      <circle cx="170" cy="189" r="18" fill="var(--paper)" stroke="var(--ink)" stroke-width="8"/>`,
  },
  {
    id: "five-shipments",
    label: "Five Shipments",
    short: "05",
    file: "03-five-shipments.svg",
    criterion: "Awarded when a contributor completes five accepted shipments.",
    primary: palette.coral,
    secondary: palette.sun,
    icon: `
      <path d="M67 150l61-64 61 64-61 45-61-45Z" fill="var(--accent)" stroke="var(--ink)" stroke-width="8" stroke-linejoin="round"/>
      <path d="M67 150l61 40 61-40M128 86v104" fill="none" stroke="var(--ink)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="128" y="149" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="50" font-weight="800" fill="var(--paper)">5</text>`,
  },
  {
    id: "streak-seven",
    label: "Seven Day Streak",
    short: "07",
    file: "04-streak-seven.svg",
    criterion: "Awarded for a seven day shipping or review streak.",
    primary: palette.sun,
    secondary: palette.coral,
    icon: `
      <path d="M128 67c25 30 48 55 48 89 0 31-21 53-48 53s-48-22-48-53c0-22 11-42 27-62 2 19 11 29 21 35 3-21 2-43 0-62Z" fill="var(--accent)" stroke="var(--ink)" stroke-width="8" stroke-linejoin="round"/>
      <text x="128" y="166" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="56" font-weight="800" fill="var(--ink)">7</text>`,
  },
  {
    id: "security-sentinel",
    label: "Security Sentinel",
    short: "S",
    file: "05-security-sentinel.svg",
    criterion: "Awarded for accepted security review, vulnerability fix, or safety hardening work.",
    primary: palette.canopy,
    secondary: palette.mint,
    icon: `
      <path d="M128 58l58 22v44c0 44-24 76-58 92-34-16-58-48-58-92V80l58-22Z" fill="var(--accent)" stroke="var(--ink)" stroke-width="8" stroke-linejoin="round"/>
      <path d="M101 135l19 19 39-48" fill="none" stroke="var(--paper)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "docs-steward",
    label: "Docs Steward",
    short: "D",
    file: "06-docs-steward.svg",
    criterion: "Awarded for documentation that makes a mechanism easier to use or maintain.",
    primary: palette.sky,
    secondary: palette.canopy,
    icon: `
      <path d="M82 70h55c18 0 32 14 32 32v84H106c-13 0-24 11-24 24V70Z" fill="var(--paper)" stroke="var(--ink)" stroke-width="8" stroke-linejoin="round"/>
      <path d="M106 100h40M106 126h46M106 152h38" stroke="var(--accent)" stroke-width="8" stroke-linecap="round"/>
      <path d="M82 210c0-13 11-24 24-24h63" fill="none" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>`,
  },
  {
    id: "design-partner",
    label: "Design Partner",
    short: "DP",
    file: "07-design-partner.svg",
    criterion: "Awarded for reusable design systems, visual assets, and polished contributor-facing UX.",
    primary: palette.coral,
    secondary: palette.sky,
    icon: `
      <rect x="77" y="79" width="102" height="102" rx="24" fill="var(--accent)" stroke="var(--ink)" stroke-width="8"/>
      <circle cx="108" cy="113" r="12" fill="var(--paper)" stroke="var(--ink)" stroke-width="6"/>
      <circle cx="149" cy="113" r="12" fill="var(--paper)" stroke="var(--ink)" stroke-width="6"/>
      <path d="M104 150c14 14 34 14 48 0" fill="none" stroke="var(--paper)" stroke-width="9" stroke-linecap="round"/>
      <path d="M82 188l28-28M174 72l-28 28" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>`,
  },
  {
    id: "onchain-verifier",
    label: "Onchain Verifier",
    short: "OV",
    file: "08-onchain-verifier.svg",
    criterion: "Awarded for work that verifies payment, attestations, proofs, or chain-facing records.",
    primary: palette.moss,
    secondary: palette.ivory,
    icon: `
      <path d="M86 98h84M86 128h84M86 158h84" stroke="var(--accent)" stroke-width="12" stroke-linecap="round"/>
      <circle cx="86" cy="98" r="16" fill="var(--paper)" stroke="var(--ink)" stroke-width="8"/>
      <circle cx="170" cy="128" r="16" fill="var(--paper)" stroke="var(--ink)" stroke-width="8"/>
      <circle cx="86" cy="158" r="16" fill="var(--paper)" stroke="var(--ink)" stroke-width="8"/>
      <path d="M114 195l12 12 29-36" fill="none" stroke="var(--ink)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
];

function svgFor(badge) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="OWK ${badge.label} contributor badge" style="--bg:${badge.primary};--accent:${badge.secondary};--ink:${palette.ink};--paper:${palette.ivory}">
<title>OWK ${badge.label} contributor badge</title>
<desc>${badge.criterion}</desc>
<circle cx="128" cy="128" r="118" fill="var(--bg)"/>
<circle cx="128" cy="128" r="102" fill="none" stroke="var(--paper)" stroke-width="7"/>
<circle cx="128" cy="128" r="88" fill="rgba(247,242,232,.12)" stroke="var(--ink)" stroke-width="4"/>
${badge.icon}
<path d="M72 50c30-20 82-20 112 0" fill="none" stroke="var(--paper)" stroke-width="6" stroke-linecap="round" opacity=".75"/>
<text x="128" y="231" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="800" letter-spacing="1.2" fill="var(--paper)">OWK-${badge.short}</text>
</svg>
`;
}

for (const badge of badges) {
  writeFileSync(join(svgDir, badge.file), svgFor(badge), "utf8");
}

const manifest = {
  bounty_id: "owk-004",
  title: "OWK Contributor Badge System",
  reward: "400 USDC",
  format: "standalone optimized SVG",
  generated_at: new Date("2026-06-23T00:00:00.000Z").toISOString(),
  badges: badges.map(({ id, label, file, criterion }) => ({ id, label, file: `svg/${file}`, criterion })),
  validation: [
    "exactly 8 SVG files",
    "standalone SVG with no scripts, external href references, or remote assets",
    "each SVG includes title, desc, role=img, and aria-label",
  ],
};

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

writeFileSync(
  join(outDir, "README.md"),
  `# OWK Contributor Badge System

Bounty: owk-004
Reward: 400 USDC
Deliverable: 8 optimized standalone SVG contributor badges plus usage guidance.

## Badge Set

| File | Badge | Award criterion |
| --- | --- | --- |
${badges.map((badge) => `| \`svg/${badge.file}\` | ${badge.label} | ${badge.criterion} |`).join("\n")}

## Visual System

The badge system uses a compact bioregional/onchain visual language:

- circular badge frame for use in profiles, leaderboards, cards, and claim receipts
- high-contrast inner icon for quick recognition at small sizes
- shared color tokens across all badges for ecosystem consistency
- title and description metadata embedded in every SVG for accessibility
- no external images, scripts, fonts, or remote dependencies

## Color Tokens

| Token | Hex | Use |
| --- | --- | --- |
| Canopy | \`${palette.canopy}\` | governance, trust, durable work |
| Moss | \`${palette.moss}\` | ecological coordination and first actions |
| Spring | \`${palette.spring}\` | highlights and growth accents |
| Sun | \`${palette.sun}\` | streaks, rewards, momentum |
| Coral | \`${palette.coral}\` | design, shipping, visible contribution |
| Sky | \`${palette.sky}\` | documentation, interfaces, knowledge |
| Ink | \`${palette.ink}\` | outlines and legibility |
| Ivory | \`${palette.ivory}\` | accessible contrast surfaces |

## Usage

Use the SVGs directly wherever possible:

\`\`\`html
<img src="badges/owk-004/svg/01-first-claim.svg" alt="OWK First Claim contributor badge" width="64" height="64">
\`\`\`

For dark UI, keep the original colors. For very small sizes below 32px, use the embedded OWK code or the full badge title as adjacent text.

## Accessibility And Safety

- Every SVG includes \`role="img"\`, \`aria-label\`, \`<title>\`, and \`<desc>\`.
- No SVG contains \`<script>\`, \`href=\`, remote image references, or external CSS.
- Shapes and text remain legible at 64px display size.
- Color is not the only signal: each badge uses a distinct icon and OWK code.

## Validation

Run:

\`\`\`bash
node scripts/validate-owk-004-badges.mjs
git diff --check -- badges/owk-004 scripts/validate-owk-004-badges.mjs scripts/generate-owk-004-badges.mjs
\`\`\`

Expected:

- 8 SVGs found
- all accessibility and safety checks pass
- no whitespace errors
`,
  "utf8",
);
