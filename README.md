# owockibot-bounty-sync

> Automatically syncs open bounties from [owockibot.xyz](https://owockibot.xyz/bounty) into GitHub Issues — with reward-tier labels, status tracking, and category tagging.

---

## What it does

Every 6 hours, a GitHub Action:

1. **Polls** the owockibot bounty board API for open bounties
2. **Creates** a GitHub Issue for each new bounty (title, full description, reward, deadline, category)
3. **Labels** each issue by reward tier, category, and status
4. **Updates** issues automatically when a bounty is claimed or completed
5. **Closes** issues when a bounty is completed
6. Falls back to **mock data** gracefully if the API is unreachable

---

## Labels applied automatically

### Reward tiers
| Label | Range |
|---|---|
| `reward: 💎 $1000+` | $1000 and above |
| `reward: 🥇 $500+` | $500 – $999 |
| `reward: 🥈 $200+` | $200 – $499 |
| `reward: 🥉 <$200` | Under $200 |

### Status
- `status: open` — available to claim
- `status: claimed` — someone is working on it
- `status: completed` — done, issue closed

### Category
`category: Engineering` · `category: Content` · `category: Design` · `category: Research` · `category: Security` · `category: Translation`

All synced issues also get the `owockibot` label (green) for easy filtering.

---

## Setup (5 minutes)

### 1. Fork or clone this repo

Create a new public GitHub repo and upload all these files, keeping the folder structure:

```
.github/
  workflows/
    sync-bounties.yml
scripts/
  sync.js
  package.json
README.md
```

### 2. Make sure GitHub Actions has Issues write permission

Go to your repo → **Settings → Actions → General → Workflow permissions**

Select **"Read and write permissions"** → Save.

### 3. Run the demo

Go to **Actions** tab → click **"Sync Owockibot Bounties"** → click **"Run workflow"** → set `demo_mode` to **`true`** → click the green **"Run workflow"** button.

Wait about 30 seconds, then check your **Issues** tab. You should see 6 bounty issues created with labels.

### 4. Go live (optional)

Once the owockibot API is publicly accessible, run the workflow with `demo_mode` set to `false` (the default). The sync runs automatically every 6 hours via the schedule.

To override the API URL, add a repository variable:
- Go to **Settings → Secrets and variables → Actions → Variables**
- Add `OWOCKIBOT_API_URL` = `https://owockibot.xyz/api`

---

## Configuration

| Variable | Where | Default | Description |
|---|---|---|---|
| `OWOCKIBOT_API_URL` | Repo variable | `https://owockibot.xyz/api` | Base URL for the bounty API |
| `GITHUB_TOKEN` | Auto-provided | — | Automatically available in all Actions |

No secrets need to be manually added — `GITHUB_TOKEN` is provided automatically by GitHub Actions.

---

## How the sync works

Each issue stores the bounty ID (`owk-xxx`) in its body. On every run the script:

1. Fetches all existing issues tagged `owockibot`
2. Extracts the bounty ID from each issue body
3. Compares against the latest API data
4. Creates issues for new bounties, updates changed ones, skips unchanged ones
5. Closes issues for completed bounties

This means the sync is **idempotent** — running it twice produces the same result.

---

## File structure

```
.github/workflows/sync-bounties.yml   GitHub Action definition
scripts/sync.js                        Main sync logic (Node.js, no dependencies)
scripts/package.json                   Package manifest
README.md                              This file
```

---

## Bounty board

This tool was built for the [owockibot bounty board](https://owockibot.xyz/bounty) — a platform for onchain contributor coordination.

Built by [@cyrilawoyemi99-max](https://github.com/cyrilawoyemi99-max)
