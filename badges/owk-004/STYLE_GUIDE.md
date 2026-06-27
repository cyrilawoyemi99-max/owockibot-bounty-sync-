# OWK-004 Contributor Badge System

This package delivers eight standalone SVG badges for the owockibot contributor milestone program. The system is designed for GitHub READMEs, bounty profile pages, payout receipts, and social share cards.

## Badge Set

| File | Badge | Award Criteria |
|---|---|---|
| `first-claim.svg` | First Claim | First accepted bounty claim or first valid proof submission. |
| `shipped-fix.svg` | Shipped Fix | Merged engineering fix with reproducible validation notes. |
| `security-scout.svg` | Security Scout | Validated security finding, responsible disclosure, or accepted audit report. |
| `public-goods-writer.svg` | Public Goods Writer | Sourced educational content, thread, recap, or research note. |
| `design-steward.svg` | Design Steward | Production-ready design assets, style systems, or accessibility-ready visuals. |
| `translation-bridge.svg` | Translation Bridge | Reviewed translation that preserves technical meaning and formatting. |
| `reputation-builder.svg` | Reputation Builder | Durable proof trail across completed bounties, receipts, or contributor records. |
| `maintainer-signal.svg` | Maintainer Signal | Meaningful triage, review, curation, or maintainer support work. |
The package intentionally includes exactly eight public badges to match the bounty request.

## Visual Direction

- Shape language: shield, medallion, and card silhouettes to communicate trust and verified work.
- Palette: multi-category system with distinct hues per milestone; no single-color theme dominates.
- Typography: system sans stack, uppercase short labels, high contrast against dark foundations.
- Accessibility: every SVG has `role="img"`, `aria-label`, `title`, and `desc`.
- Portability: SVGs are standalone, no external assets, no scripts, no `href` references, and no build step.

## Color Tokens

| Token | Hex | Usage |
|---|---:|---|
| `foundation-dark` | `#08111C` | Shared dark backdrop for profiles and dark UIs. |
| `claim-green` | `#19D39A` | First accepted action. |
| `ship-blue` | `#5B8CFF` | Engineering and shipping moments. |
| `security-red` | `#FF6B6B` | Security review and risk reduction. |
| `content-amber` | `#FACC15` | Public goods writing and education. |
| `design-pink` | `#F472B6` | Visual design and brand craft. |
| `translation-sky` | `#38BDF8` | Language bridge work. |
| `reputation-lime` | `#A3E635` | Proof, receipts, and durable reputation. |
| `maintainer-orange` | `#F97316` | Review and maintainer support. |

## Usage

```html
<img src="badges/owk-004/shipped-fix.svg" alt="Shipped Fix badge" width="96" height="96">
```

Recommended display sizes:

- Profile badge rail: 64px or 80px.
- Bounty receipt page: 96px or 128px.
- Social image composition: 256px or 512px.

## Validation

Run:

```bash
node scripts/validate-owk-004-badges.mjs
```

The validator checks standalone SVG count, dimensions, accessibility attributes, forbidden script/href usage, manifest coverage, and style guide presence.
