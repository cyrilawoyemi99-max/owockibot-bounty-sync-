# owk-001 Onchain Reputation Dashboard

Static dashboard deliverable for bounty `owk-001`.

## Contents

- `index.html` - dashboard shell
- `styles.css` - responsive layout and visual system
- `app.js` - data loading, reputation scoring, filtering, rendering
- `data/sample-reputation.json` - representative completed bounty and proof data
- `assets/reputation-ledger.svg` - local visual asset

## Run Locally

Serve the folder with any static file server:

```bash
python3 -m http.server 4173 --directory dashboard/owk-001
```

Then open:

```text
http://127.0.0.1:4173/
```

The app first tries to read `data/sample-reputation.json`, then optionally attempts the owockibot public API. If the network API is unavailable or has a different shape, the dashboard remains fully usable with the checked-in sample data.

## GitHub Pages

This folder can be published directly from GitHub Pages by pointing Pages to the repository branch and `/dashboard/owk-001` as the site root, or by copying the folder into a Pages branch.

No build step, external CDN, or secret is required.
