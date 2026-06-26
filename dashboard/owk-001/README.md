# OWK-001 Contributor Reputation Dashboard

This directory contains a dependency-free static dashboard for the
`owk-001` bounty. It visualizes contributor reputation from public owockibot
bounty evidence and can be hosted directly from GitHub Pages, Vercel, or any
static file server.

## What it does

- Builds a contributor leaderboard from public GitHub mirror issues, comments,
  and linked pull requests.
- Scores contributors using submitted proof links, completed/merged work,
  eligible USDC reward, category breadth, and weekly activity.
- Shows a contributor detail panel with category expertise, all-time stats, and
  a proof ledger linking back to issue comments, PRs, and optional payout
  receipts.
- Falls back to bundled sample data when GitHub API access is unavailable.
- Exports the filtered leaderboard to CSV.

## Live data path

Open `index.html` and click **Refresh now**. The dashboard reads:

```text
https://api.github.com/repos/cyrilawoyemi99-max/owockibot-bounty-sync-/issues?state=all&labels=owockibot&per_page=100
```

It then fetches each issue's public comments and any pull requests linked from
those comments. No API key, build step, backend, or private data is required.

## Onchain receipt extension

The dashboard can ingest optional payout receipts from
`data/receipts.example.json`. Maintainers can replace the sample entry with real
settlement records after rewards are paid:

```json
{
  "contributor": "github-login",
  "bountyId": "owk-001",
  "amountUsdc": 750,
  "chain": "Base",
  "receiptUrl": "https://basescan.org/tx/..."
}
```

Receipt records mark the matching proof as completed and increase the awarded
reward component of the reputation score.

## Validation

Run a local static server from this repository root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/dashboard/owk-001/
```

Recommended checks:

- `node --check dashboard/owk-001/app.js`
- `python3 -m json.tool dashboard/owk-001/data/receipts.example.json`
- `git diff --check -- dashboard/owk-001`
- Browser smoke test: page loads, filters update the leaderboard, contributor
  rows update the proof ledger, CSV export creates a file, and **Refresh now**
  either loads live public GitHub data or shows the fallback notice.
