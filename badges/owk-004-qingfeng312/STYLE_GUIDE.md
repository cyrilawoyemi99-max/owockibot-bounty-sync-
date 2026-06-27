# OWK-004 Contributor Badge System

This badge set defines eight contributor milestones for owockibot. Each badge is a standalone, accessible SVG with no scripts, external links, fonts, images, or build step.

## Visual System

- Canvas: `256 x 256`
- Shape: rounded square plate plus inner signal ring
- Palette: deep ink background, high-contrast accent, pale foreground text
- Typography: system fallback via SVG text, with all key meaning also encoded in title/aria labels
- Accessibility: every SVG includes `role="img"`, `aria-label`, `title`, and `desc`

## Badges

| File | Badge | Milestone |
| --- | --- | --- |
| `01-first-claim.svg` | First Claim | First accepted bounty claim or valid proof submission |
| `02-merged-fix.svg` | Merged Fix | First merged code or documentation fix |
| `03-five-shipments.svg` | Five Shipments | Five accepted bounty deliverables |
| `04-seven-day-streak.svg` | Seven Day Streak | Contributions on seven consecutive days |
| `05-security-review.svg` | Security Review | Accepted security or risk review |
| `06-docs-steward.svg` | Docs Steward | Accepted contributor documentation improvement |
| `07-design-partner.svg` | Design Partner | Accepted design, UX, or visual asset contribution |
| `08-onchain-proof.svg` | Onchain Proof | Contribution linked to a verified payout or onchain receipt |

## Usage

Use the SVGs directly in profile pages, contributor dashboards, or bounty completion receipts:

```html
<img src="badges/owk-004-qingfeng312/01-first-claim.svg" alt="First Claim badge">
```

Recommended display sizes are 64, 96, 128, and 256 pixels. Do not recolor the SVGs without updating the milestone manifest.

## Validation

Run:

```bash
node scripts/validate-owk-004-qingfeng312.mjs
```

The validator checks the badge count, manifest entries, accessibility attributes, XML parseability, and absence of external/script references.
