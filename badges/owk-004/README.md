# OWK-004 Contributor Badge System

This package delivers eight standalone SVG contributor badges for the `owk-004` bounty. The set is built for owockibot contributor profiles, bounty receipts, Discord embeds, GitHub README cards, and onchain reputation dashboards.

## Design System

Badges use a shared hexagonal coin silhouette with a consistent center glyph, tier ring, and compact label band. The style is intentionally legible at 96 px while still reading as a collectible badge at 220 px.

| Token | Value | Usage |
| --- | --- | --- |
| `--owk-ink` | `#101827` | Primary text and dark line work |
| `--owk-paper` | `#f8fbff` | Main face highlight |
| `--owk-blue` | `#2f6df6` | Proof, merge, and verification accents |
| `--owk-green` | `#1aa873` | Completion and streak accents |
| `--owk-gold` | `#f5b942` | Milestone and top-tier accents |
| `--owk-red` | `#ef476f` | Security and risk accents |
| `--owk-purple` | `#7d5cff` | Design and creative contribution accents |

## Badge Catalog

| File | Award | Milestone Criteria |
| --- | --- | --- |
| `svg/first-claim.svg` | First Claim | Contributor submits their first complete bounty claim with a verifiable deliverable. |
| `svg/merge-maker.svg` | Merge Maker | A submitted engineering or documentation PR is merged by a maintainer. |
| `svg/five-shipments.svg` | Five Shipments | Contributor completes five accepted bounties across any category. |
| `svg/streak-seven.svg` | Seven Day Streak | Contributor ships or updates bounty work for seven consecutive days. |
| `svg/security-sentinel.svg` | Security Sentinel | Contributor submits an accepted security audit, patch, or vulnerability report. |
| `svg/docs-steward.svg` | Docs Steward | Contributor improves contributor-facing docs, guides, or translation quality. |
| `svg/design-partner.svg` | Design Partner | Contributor delivers accepted product, brand, badge, or interface design assets. |
| `svg/onchain-verifier.svg` | Onchain Verifier | Contributor links accepted work to wallet, receipt, or onchain reputation evidence. |

## Accessibility

Each SVG includes:

- `role="img"`
- `aria-label`
- a `<title>` and `<desc>`
- no script tags
- no external links or remote asset references
- high contrast label bands for small-size rendering

## Usage

Inline the SVG directly when the badge must inherit page CSS, or serve the file as a static asset.

```html
<img src="/badges/owk-004/svg/security-sentinel.svg" alt="Security Sentinel badge">
```

Recommended sizes:

- Profile chip: 48 px
- Contributor card: 96 px
- Achievement modal: 220 px

## Validation

The package was validated with:

```bash
python3 - <<'PY'
from pathlib import Path
from xml.etree import ElementTree as ET

for path in sorted(Path("badges/owk-004/svg").glob("*.svg")):
    root = ET.parse(path).getroot()
    text = path.read_text()
    assert root.attrib.get("role") == "img", path
    assert root.attrib.get("aria-label"), path
    assert "<script" not in text.lower(), path
    assert "href=" not in text.lower(), path
print("validated owk-004 badge SVG package")
PY
git diff --check -- badges/owk-004
```
