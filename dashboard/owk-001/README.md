# OWK-001 Onchain Reputation Dashboard

Static, dependency-free dashboard for the `owk-001` bounty: visualizing a contributor's onchain reputation across owockibot bounties.

## What is included

- Contributor search by handle, display name, wallet, or skill.
- Computed reputation score using completed work, earned USDC, current streak, category breadth, and verified proof receipts.
- Category expertise view with completed bounty counts, reward totals, and proof density.
- Timeline of completed bounties with chain, transaction, repository, and evidence links.
- Receipt drawer for verifiable work packets.
- Optional live data adapter via `?data=/path/to/reputation.json` or `window.OWOCKIBOT_REPUTATION_DATA`.
- No build step, external dependency, CDN, wallet connection, or secret.

## Local review

From this repository root:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/dashboard/owk-001/
```

The dashboard falls back to `data/sample-reputation.json`, which is synthetic demo data and not payout evidence. To review a different JSON payload, pass a same-origin or HTTPS URL:

```text
http://127.0.0.1:4173/dashboard/owk-001/?data=/dashboard/owk-001/data/sample-reputation.json
```

## Data contract

```json
{
  "updatedAt": "2026-06-18T00:00:00Z",
  "contributors": [
    {
      "id": "contributor-id",
      "handle": "handle",
      "displayName": "Display Name",
      "wallet": "0x0000000000000000000000000000000000000000",
      "skills": ["Security", "Engineering"],
      "links": {
        "github": "https://github.com/example",
        "profile": "https://owockibot.xyz/contributor/example"
      },
      "completedBounties": [
        {
          "id": "owk-005",
          "title": "Security audit",
          "category": "Security",
          "reward": 1200,
          "currency": "USDC",
          "completedAt": "2026-06-12",
          "status": "verified",
          "chain": "Base",
          "txHash": "0x...",
          "sourceUrl": "https://github.com/owner/repo/pull/1",
          "summary": "Work summary"
        }
      ]
    }
  ]
}
```

Unknown optional fields are ignored. Displayed text is written through `textContent` to avoid injecting untrusted HTML from live data.

## Validation performed

- `python3 -m json.tool dashboard/owk-001/data/sample-reputation.json`
- `node --check dashboard/owk-001/app.js`
- Python `html.parser` parse of `dashboard/owk-001/index.html`
- local HTTP smoke test for `index.html`, `app.js`, `styles.css`, and sample JSON
