# Owockibot Contributor Badge System

Deliverable for bounty `owk-004`: eight optimized SVG contributor badges with a compact style guide.

## Files

| Badge | Milestone | File |
|---|---|---|
| First Claim | Contributor claims their first bounty | `svg/first-claim.svg` |
| First Merge | First accepted pull request or merged deliverable | `svg/first-merge.svg` |
| Five Bounties | Five completed bounties | `svg/five-bounties.svg` |
| Streak Seven | Seven-day active contribution streak | `svg/streak-seven.svg` |
| Security Sentinel | Valid security review or audit finding | `svg/security-sentinel.svg` |
| Docs Steward | Documentation or translation contribution | `svg/docs-steward.svg` |
| Design Partner | Visual/design asset contribution | `svg/design-partner.svg` |
| Onchain Verifier | Onchain proof, escrow, or payment verification | `svg/onchain-verifier.svg` |

## Style Guide

Canvas: `256x256` viewBox. The artwork is centered on a circular badge with a dark outer ring, a colored inner field, and a minimal white line icon.

Shape language: circles, arcs, shields, document lines, checkmarks, and route nodes. Each badge is readable at 64px and still detailed at 256px.

Color tokens:

| Token | Hex | Use |
|---|---|---|
| `obsidian` | `#111827` | Outer ring and contrast |
| `surface` | `#F8FAFC` | Icon strokes and text |
| `owocki-green` | `#00E887` | First-claim and system identity |
| `signal-blue` | `#2563EB` | Merge and engineering trust |
| `violet` | `#7C3AED` | Multi-bounty achievement |
| `amber` | `#F59E0B` | Streak/continuity |
| `red` | `#DC2626` | Security badge |
| `teal` | `#0F766E` | Documentation badge |
| `pink` | `#BE185D` | Design badge |
| `cyan` | `#0891B2` | Onchain verifier badge |

Typography: SVG text uses `Inter, ui-sans-serif, system-ui, sans-serif` with uppercase labels. Labels are intentionally short so badges remain legible when embedded in profile grids.

Accessibility: every SVG includes `role="img"` and an `aria-label` describing the badge. If embedded as an `<img>`, use matching alt text from the table above.

Usage examples:

```html
<img src="./badges/owk-004/svg/first-claim.svg" alt="Owockibot First Claim badge" width="96" height="96">
```

```markdown
![Owockibot Security Sentinel badge](./badges/owk-004/svg/security-sentinel.svg)
```

Implementation notes:

- No external fonts, scripts, images, filters, or raster assets.
- All SVGs are self-contained and use simple paths/circles/lines for easy optimization.
- Stroke joins and caps are rounded for readability at small sizes.
- Badges can be recolored by changing the central circle fill and label text only.
