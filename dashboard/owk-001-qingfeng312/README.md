# OWK-001 Contributor Reputation Dashboard

This submission implements a dependency-free static dashboard for the OWK-001 bounty:
an onchain reputation view for owockibot contributors.

## What it includes

- Ranked contributor scoreboard with score, completed bounty count, tracked USDC, streak, and primary skill.
- Search, category, status, and sort controls for review workflows.
- Contributor detail panel with category expertise bars and proof ledger.
- Recent verified activity timeline.
- CSV export for maintainer review.
- Configurable data source through `?data=/path/to/reputation.json`.
- Sample data that is explicitly marked as review data, not payout evidence.

## Data model

The dashboard reads `data/reputation-sample.json` by default. A production export can use
the same shape:

- `contributors[].wallet`: Base, Solana, or other payout wallet.
- `contributors[].contributions[]`: bounty id, title, category, status, reward, dates, proof URL, PR URL, tx hash, and receipt flag.
- `status`: one of `submitted`, `accepted`, `merged`, or `paid`.

The scoring model combines:

- completion count
- reward value with a cap
- proof quality
- active-week streak
- category breadth
- recency

## Validation

Run from the repository root:

```bash
node scripts/validate-owk-001-qingfeng312.mjs
node --check dashboard/owk-001-qingfeng312/app.js
python3 -m json.tool dashboard/owk-001-qingfeng312/data/reputation-sample.json >/dev/null
```

The validator checks required files, local asset references, JSON schema basics, scoring
inputs, and that the dashboard does not depend on external scripts or stylesheets.
