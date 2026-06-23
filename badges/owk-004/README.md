# OWK Contributor Badge System

Bounty: owk-004
Reward: 400 USDC
Deliverable: 8 optimized standalone SVG contributor badges plus usage guidance.

Preview page: `index.html`

## Badge Set

| File | Badge | Award criterion |
| --- | --- | --- |
| `svg/01-first-claim.svg` | First Claim | Awarded when a contributor successfully claims their first bounty. |
| `svg/02-merge-maker.svg` | Merge Maker | Awarded when a contributor ships their first accepted merge. |
| `svg/03-five-shipments.svg` | Five Shipments | Awarded when a contributor completes five accepted shipments. |
| `svg/04-streak-seven.svg` | Seven Day Streak | Awarded for a seven day shipping or review streak. |
| `svg/05-security-sentinel.svg` | Security Sentinel | Awarded for accepted security review, vulnerability fix, or safety hardening work. |
| `svg/06-docs-steward.svg` | Docs Steward | Awarded for documentation that makes a mechanism easier to use or maintain. |
| `svg/07-design-partner.svg` | Design Partner | Awarded for reusable design systems, visual assets, and polished contributor-facing UX. |
| `svg/08-onchain-verifier.svg` | Onchain Verifier | Awarded for work that verifies payment, attestations, proofs, or chain-facing records. |

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
| Canopy | `#16423C` | governance, trust, durable work |
| Moss | `#4F8A5B` | ecological coordination and first actions |
| Spring | `#B7F0AD` | highlights and growth accents |
| Sun | `#F6C453` | streaks, rewards, momentum |
| Coral | `#E86F51` | design, shipping, visible contribution |
| Sky | `#82C7E8` | documentation, interfaces, knowledge |
| Ink | `#10231F` | outlines and legibility |
| Ivory | `#F7F2E8` | accessible contrast surfaces |

## Usage

Use the SVGs directly wherever possible:

```html
<img src="badges/owk-004/svg/01-first-claim.svg" alt="OWK First Claim contributor badge" width="64" height="64">
```

For dark UI, keep the original colors. For very small sizes below 32px, use the embedded OWK code or the full badge title as adjacent text.

## Accessibility And Safety

- Every SVG includes `role="img"`, `aria-label`, `<title>`, and `<desc>`.
- No SVG contains `<script>`, `href=`, remote image references, or external CSS.
- Shapes and text remain legible at 64px display size.
- Color is not the only signal: each badge uses a distinct icon and OWK code.

## Validation

Run:

```bash
node scripts/validate-owk-004-badges.mjs
git diff --check -- badges/owk-004 scripts/validate-owk-004-badges.mjs scripts/generate-owk-004-badges.mjs
```

Expected:

- 8 SVGs found
- all accessibility and safety checks pass
- no whitespace errors
